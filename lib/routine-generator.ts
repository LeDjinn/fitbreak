import { EXERCISES, getExercise } from "./exercises";
import type { DurationMinutes, Exercise, GeneratedRoutine, RoutineConfig } from "./types";

/** Exact timing templates. moves × (active + transition) === minutes × 60. */
export const TIMING: Record<DurationMinutes, { moves: number; active: number; transition: number }> = {
  2: { moves: 4, active: 25, transition: 5 },
  5: { moves: 5, active: 50, transition: 10 },
  10: { moves: 10, active: 50, transition: 10 },
};

// ── Seeded randomness ────────────────────────────────────────────────

/** FNV-1a 32-bit string hash. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: tiny, fast, deterministic PRNG. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function configSeedKey(config: RoutineConfig): string {
  return [
    config.durationMinutes,
    config.location,
    config.focus,
    config.intensity,
    config.seatedOnly ? "seated" : "any",
    config.variation,
  ].join("|");
}

// ── Eligibility ──────────────────────────────────────────────────────

export function isEligible(exercise: Exercise, config: RoutineConfig): boolean {
  if (!exercise.location.includes(config.location)) return false;
  if (config.seatedOnly && exercise.posture !== "seated") return false;
  if (exercise.intensity !== "both" && exercise.intensity !== config.intensity) return false;
  return true;
}

export function eligibleExercises(config: RoutineConfig): Exercise[] {
  return EXERCISES.filter((e) => isEligible(e, config));
}

// ── Ordering ─────────────────────────────────────────────────────────

/**
 * Arrange picks into a comfortable flow:
 * - first and last moves are the gentlest available (lowest effort),
 * - the last move prefers something calm and seated to land the break,
 * - middle moves are grouped by posture so people aren't bobbing up and down,
 *   with gentler seated work before the standing block for energizing breaks.
 */
function arrange(picks: Exercise[]): Exercise[] {
  if (picks.length <= 2) return picks.slice().sort((a, b) => a.effort - b.effort);
  const pool = picks.slice();

  const takeGentlest = (prefer: (e: Exercise) => boolean) => {
    let bestIndex = 0;
    for (let i = 1; i < pool.length; i++) {
      const a = pool[i];
      const b = pool[bestIndex];
      if (a.effort < b.effort || (a.effort === b.effort && prefer(a) && !prefer(b))) bestIndex = i;
    }
    return pool.splice(bestIndex, 1)[0];
  };

  const first = takeGentlest((e) => e.posture === "seated");
  const last = takeGentlest((e) => e.id === "breathing-reset" || e.posture === "seated");

  const seated = pool.filter((e) => e.posture === "seated");
  const standing = pool.filter((e) => e.posture === "standing");
  // Within a posture block, keep the shuffled order but ease in: effort ascending is too
  // predictable, so only make sure the briskest move isn't adjacent to the first one.
  const middle = [...seated, ...standing];
  if (middle.length > 1 && middle[0].effort === 3) {
    const swapIndex = middle.findIndex((e) => e.effort < 3);
    if (swapIndex > 0) [middle[0], middle[swapIndex]] = [middle[swapIndex], middle[0]];
  }
  return [first, ...middle, last];
}

/** Repair any back-to-back duplicates by swapping with a later non-conflicting item. */
function removeAdjacentDuplicates(sequence: Exercise[]): Exercise[] {
  const out = sequence.slice();
  for (let i = 1; i < out.length; i++) {
    if (out[i].id !== out[i - 1].id) continue;
    for (let j = i + 1; j < out.length; j++) {
      const fitsHere = out[j].id !== out[i - 1].id && (i + 1 >= out.length || out[j].id !== out[i + 1]?.id);
      const fitsThere = out[i].id !== out[j - 1]?.id && out[i].id !== out[j + 1]?.id;
      if (fitsHere && fitsThere) {
        [out[i], out[j]] = [out[j], out[i]];
        break;
      }
    }
  }
  return out;
}

// ── Generation ───────────────────────────────────────────────────────

export class RoutineGenerationError extends Error {}

export function generateRoutine(config: RoutineConfig): GeneratedRoutine {
  const timing = TIMING[config.durationMinutes];
  const rng = createRng(hashString(configSeedKey(config)));
  const pool = eligibleExercises(config);
  const notes: string[] = [];

  if (pool.length === 0) {
    throw new RoutineGenerationError("No movements match this combination.");
  }

  const matching = seededShuffle(
    pool.filter((e) => e.focus.includes(config.focus)),
    rng,
  );
  const fillers = seededShuffle(
    pool.filter((e) => !e.focus.includes(config.focus) && e.focus.includes("full")),
    rng,
  );
  const rest = seededShuffle(
    pool.filter((e) => !e.focus.includes(config.focus) && !e.focus.includes("full")),
    rng,
  );
  const ranked = [...matching, ...fillers, ...rest];

  let picks = ranked.slice(0, timing.moves);

  // Keep two easy moves (effort 1) for the opening and closing, so a break never
  // starts or lands on something brisk. Swap out the lowest-ranked brisk picks.
  const easy = (e: Exercise) => e.effort === 1;
  const unpickedEasy = ranked.filter((e) => easy(e) && !picks.includes(e));
  while (picks.filter(easy).length < Math.min(2, picks.length) && unpickedEasy.length > 0) {
    let replaceAt = -1;
    for (let i = picks.length - 1; i >= 0; i--) {
      if (!easy(picks[i])) {
        replaceAt = i;
        break;
      }
    }
    if (replaceAt < 0) break;
    picks[replaceAt] = unpickedEasy.shift()!;
  }

  if (matching.length < timing.moves && config.focus !== "full") {
    notes.push("We added a few gentle full-body moves to round out this break.");
  }

  // Not enough distinct moves: repeat favourites, never back-to-back.
  if (picks.length < timing.moves) {
    notes.push("A couple of movements repeat so the break stays within your choices.");
    let i = 0;
    while (picks.length < timing.moves) {
      picks.push(ranked[i % ranked.length]);
      i++;
    }
  }

  picks = removeAdjacentDuplicates(arrange(picks));

  const equipment = Array.from(
    new Set(picks.map((e) => e.equipment).filter((x): x is "chair" | "wall" => x !== "none")),
  ).sort();

  const routine: GeneratedRoutine = {
    config,
    steps: picks.map((exercise, index) => ({
      id: `${exercise.id}-${index}`,
      exerciseId: exercise.id,
      activeSeconds: timing.active,
      transitionSeconds: timing.transition,
    })),
    totalSeconds: timing.moves * (timing.active + timing.transition),
    notes,
    equipment,
  };

  const problems = validateRoutine(routine);
  if (problems.length > 0) {
    throw new RoutineGenerationError(`Invalid routine: ${problems.join("; ")}`);
  }
  return routine;
}

/** Returns a list of human-readable problems; empty means valid. */
export function validateRoutine(routine: GeneratedRoutine): string[] {
  const problems: string[] = [];
  const { config, steps } = routine;
  const timing = TIMING[config.durationMinutes];
  const sum = steps.reduce((t, s) => t + s.activeSeconds + s.transitionSeconds, 0);

  if (steps.length !== timing.moves) problems.push(`expected ${timing.moves} moves, got ${steps.length}`);
  if (sum !== config.durationMinutes * 60) problems.push(`total ${sum}s ≠ ${config.durationMinutes * 60}s`);
  if (routine.totalSeconds !== sum) problems.push("totalSeconds does not match steps");

  steps.forEach((step, i) => {
    const exercise = getExercise(step.exerciseId);
    if (!isEligible(exercise, config)) problems.push(`${exercise.id} is not allowed for this configuration`);
    if (i > 0 && steps[i - 1].exerciseId === step.exerciseId) problems.push(`${exercise.id} repeats back-to-back`);
  });
  return problems;
}
