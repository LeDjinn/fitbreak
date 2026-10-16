import { DEFAULT_CONFIG, sanitizeConfig } from "./routine-params";
import type { RoutineConfig } from "./types";

export const PREFERENCES_KEY = "fitbreak:preferences:v1";

/** Preferences live only in this browser. Storage can be unavailable; never throw. */
export function loadPreferences(): RoutineConfig | null {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return null;
    return sanitizeConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePreferences(config: RoutineConfig): void {
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(config));
  } catch {
    // Private mode or blocked storage: preferences just won't persist.
  }
}

export function clearPreferences(): RoutineConfig {
  try {
    window.localStorage.removeItem(PREFERENCES_KEY);
  } catch {
    // ignore
  }
  return { ...DEFAULT_CONFIG };
}
