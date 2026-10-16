import type { DurationMinutes, Focus, Intensity, Location, RoutineConfig } from "./types";

export const DEFAULT_CONFIG: RoutineConfig = {
  durationMinutes: 5,
  location: "desk",
  focus: "full",
  intensity: "gentle",
  seatedOnly: false,
  variation: 0,
};

export const DURATIONS: DurationMinutes[] = [2, 5, 10];
export const LOCATIONS: Location[] = ["desk", "small-room", "home"];
export const FOCUSES: Focus[] = ["full", "neck-shoulders", "lower-body", "energy"];
export const INTENSITIES: Intensity[] = ["gentle", "energizing"];

const MAX_VARIATION = 9999;

function oneOf<T extends string | number>(value: unknown, allowed: readonly T[]): T | undefined {
  return allowed.find((a) => String(a) === String(value));
}

/** Validate untrusted input (URL params, localStorage) into a full config. */
export function sanitizeConfig(input: Partial<Record<keyof RoutineConfig, unknown>>): RoutineConfig {
  const variation = Number(input.variation);
  const seated = input.seatedOnly;
  return {
    durationMinutes: oneOf(input.durationMinutes, DURATIONS) ?? DEFAULT_CONFIG.durationMinutes,
    location: oneOf(input.location, LOCATIONS) ?? DEFAULT_CONFIG.location,
    focus: oneOf(input.focus, FOCUSES) ?? DEFAULT_CONFIG.focus,
    intensity: oneOf(input.intensity, INTENSITIES) ?? DEFAULT_CONFIG.intensity,
    seatedOnly: seated === true || seated === "1" || seated === "true",
    variation:
      Number.isInteger(variation) && variation >= 0 && variation <= MAX_VARIATION ? variation : 0,
  };
}

/** Compact query string: /session?d=5&l=desk&f=full&i=gentle&s=0&v=0 */
export function configToSearch(config: RoutineConfig): string {
  const params = new URLSearchParams({
    d: String(config.durationMinutes),
    l: config.location,
    f: config.focus,
    i: config.intensity,
    s: config.seatedOnly ? "1" : "0",
    v: String(config.variation),
  });
  return params.toString();
}

/** `presetSlug` only controls where "Exit" returns to; it never changes the routine. */
export function sessionHref(config: RoutineConfig, presetSlug?: string): string {
  return `/session?${configToSearch(config)}${presetSlug ? `&p=${encodeURIComponent(presetSlug)}` : ""}`;
}

export type ParsedParams = { config: RoutineConfig; adjusted: boolean };

export function searchToConfig(params: URLSearchParams): ParsedParams {
  const raw = {
    durationMinutes: params.get("d"),
    location: params.get("l"),
    focus: params.get("f"),
    intensity: params.get("i"),
    seatedOnly: params.get("s"),
    variation: params.get("v") ?? "0",
  };
  const config = sanitizeConfig(raw);
  const adjusted =
    String(config.durationMinutes) !== raw.durationMinutes ||
    config.location !== raw.location ||
    config.focus !== raw.focus ||
    config.intensity !== raw.intensity ||
    !["0", "1", null].includes(raw.seatedOnly) ||
    String(config.variation) !== raw.variation;
  return { config, adjusted };
}

// ── Labels ───────────────────────────────────────────────────────────

export const LOCATION_LABEL: Record<Location, string> = {
  desk: "At my desk",
  "small-room": "Small room",
  home: "At home",
};

export const FOCUS_LABEL: Record<Focus, string> = {
  full: "Full-body reset",
  "neck-shoulders": "Neck & shoulders",
  "lower-body": "Lower-body reset",
  energy: "Energy reset",
};

export const INTENSITY_LABEL: Record<Intensity, string> = {
  gentle: "Gentle",
  energizing: "Energizing",
};

export const ROUTINE_TITLE: Record<Focus, { title: string; blurb: string }> = {
  full: { title: "The everyday reset", blurb: "A little of everything, head to toe." },
  "neck-shoulders": { title: "Unwind your upper body", blurb: "Softer shoulders, a looser neck, happier hands." },
  "lower-body": { title: "Wake up your legs", blurb: "Gentle movement from hips to toes after a long sit." },
  energy: { title: "A little lift, right now", blurb: "A change of pace without a big workout." },
};
