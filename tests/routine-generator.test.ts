import { describe, expect, it } from "vitest";
import { EXERCISES, getExercise } from "@/lib/exercises";
import { eligibleExercises, generateRoutine, TIMING, validateRoutine } from "@/lib/routine-generator";
import { DURATIONS, FOCUSES, INTENSITIES, LOCATIONS, searchToConfig, configToSearch, sanitizeConfig } from "@/lib/routine-params";
import type { RoutineConfig } from "@/lib/types";

function allConfigs(variation = 0): RoutineConfig[] {
  const out: RoutineConfig[] = [];
  for (const durationMinutes of DURATIONS)
    for (const location of LOCATIONS)
      for (const focus of FOCUSES)
        for (const intensity of INTENSITIES)
          for (const seatedOnly of [false, true])
            out.push({ durationMinutes, location, focus, intensity, seatedOnly, variation });
  return out;
}

const label = (c: RoutineConfig) => `${c.durationMinutes}m/${c.location}/${c.focus}/${c.intensity}/${c.seatedOnly ? "seated" : "any"}/v${c.variation}`;

describe("exercise data", () => {
  it("has 20–30 movements with unique ids and 2–4 steps each", () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(20);
    expect(EXERCISES.length).toBeLessThanOrEqual(32);
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
    for (const e of EXERCISES) {
      expect(e.steps.length, e.id).toBeGreaterThanOrEqual(2);
      expect(e.steps.length, e.id).toBeLessThanOrEqual(4);
    }
  });

  it("never uses a wall at a desk", () => {
    for (const e of EXERCISES) if (e.location.includes("desk")) expect(e.equipment, e.id).not.toBe("wall");
  });
});

describe("timing templates", () => {
  it("add up to exactly 120, 300 and 600 seconds", () => {
    expect(TIMING[2].moves * (TIMING[2].active + TIMING[2].transition)).toBe(120);
    expect(TIMING[5].moves * (TIMING[5].active + TIMING[5].transition)).toBe(300);
    expect(TIMING[10].moves * (TIMING[10].active + TIMING[10].transition)).toBe(600);
  });
});

describe("generateRoutine — every supported configuration", () => {
  const configs = [...allConfigs(0), ...allConfigs(1), ...allConfigs(7)];

  it.each(configs.map((c) => [label(c), c] as const))("%s is valid", (_name, config) => {
    const routine = generateRoutine(config);
    expect(validateRoutine(routine)).toEqual([]);
    expect(routine.totalSeconds).toBe(config.durationMinutes * 60);
    const sum = routine.steps.reduce((t, s) => t + s.activeSeconds + s.transitionSeconds, 0);
    expect(sum).toBe(config.durationMinutes * 60);
    expect(routine.steps).toHaveLength(TIMING[config.durationMinutes].moves);

    routine.steps.forEach((step, i) => {
      const e = getExercise(step.exerciseId);
      expect(e.location).toContain(config.location);
      if (config.seatedOnly) expect(e.posture).toBe("seated");
      if (config.location === "desk") expect(e.equipment).not.toBe("wall");
      expect([config.intensity, "both"]).toContain(e.intensity);
      if (i > 0) expect(step.exerciseId).not.toBe(routine.steps[i - 1].exerciseId);
    });
  });

  it("has enough distinct movements so no configuration needs repeats", () => {
    for (const config of allConfigs()) {
      const routine = generateRoutine(config);
      const distinct = new Set(routine.steps.map((s) => s.exerciseId)).size;
      expect(distinct, label(config)).toBe(routine.steps.length);
      expect(eligibleExercises(config).length, label(config)).toBeGreaterThanOrEqual(10);
    }
  });

  it("starts and ends with the gentlest available moves", () => {
    for (const config of allConfigs()) {
      const routine = generateRoutine(config);
      const efforts = routine.steps.map((s) => getExercise(s.exerciseId).effort);
      const minEffort = Math.min(...efforts);
      expect(minEffort, label(config)).toBe(1);
      expect(efforts[0], label(config)).toBe(1);
      expect(efforts[efforts.length - 1], label(config)).toBe(1);
    }
  });

  it("prefers movements that match the chosen focus", () => {
    for (const config of allConfigs()) {
      const routine = generateRoutine(config);
      const matching = routine.steps.filter((s) => getExercise(s.exerciseId).focus.includes(config.focus)).length;
      const available = eligibleExercises(config).filter((e) => e.focus.includes(config.focus)).length;
      expect(matching, label(config)).toBe(Math.min(available, routine.steps.length));
    }
  });
});

describe("determinism and shuffle", () => {
  it("returns identical routines for the same config", () => {
    for (const config of allConfigs(3)) {
      expect(generateRoutine(config)).toEqual(generateRoutine({ ...config }));
    }
  });

  it("changing an input changes the actual routine", () => {
    const base: RoutineConfig = { durationMinutes: 5, location: "desk", focus: "full", intensity: "gentle", seatedOnly: false, variation: 0 };
    const ids = (c: RoutineConfig) => generateRoutine(c).steps.map((s) => s.exerciseId).join(",");
    expect(ids({ ...base, focus: "lower-body" })).not.toBe(ids(base));
    expect(ids({ ...base, seatedOnly: true })).not.toBe(ids({ ...base, intensity: "energizing" }));
    expect(ids({ ...base, location: "home", intensity: "energizing" })).not.toBe(ids(base));
  });

  it("shuffle (variation) genuinely varies the routine for most configs", () => {
    let varied = 0;
    const configs = allConfigs(0);
    for (const config of configs) {
      const seen = new Set<string>();
      for (let v = 0; v < 5; v++) seen.add(generateRoutine({ ...config, variation: v }).steps.map((s) => s.exerciseId).join(","));
      if (seen.size >= 3) varied++;
    }
    expect(varied / configs.length).toBeGreaterThan(0.95);
  });
});

describe("routine params", () => {
  it("round-trips through the query string", () => {
    for (const config of allConfigs(42)) {
      const { config: parsed, adjusted } = searchToConfig(new URLSearchParams(configToSearch(config)));
      expect(parsed).toEqual(config);
      expect(adjusted).toBe(false);
    }
  });

  it("falls back safely on garbage input", () => {
    const { config, adjusted } = searchToConfig(new URLSearchParams("d=7&l=moon&f=<script>&i=max&s=yes&v=-3"));
    expect(config).toEqual({ durationMinutes: 5, location: "desk", focus: "full", intensity: "gentle", seatedOnly: false, variation: 0 });
    expect(adjusted).toBe(true);
    expect(sanitizeConfig({ seatedOnly: true, durationMinutes: 10 }).seatedOnly).toBe(true);
  });
});

describe("illustrations", () => {
  it("every exercise has an original illustration", async () => {
    const { ILLUSTRATION_KEYS } = await import("@/components/movement-illustration");
    for (const e of EXERCISES) expect(ILLUSTRATION_KEYS, e.id).toContain(e.illustrationKey);
  });
});
