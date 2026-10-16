import type { Focus, Intensity, Location } from "./types";

/**
 * Analytics contract. No network calls by default.
 *
 * Events carry only coarse, non-identifying metadata. No user IDs, no health
 * data, no free text. To connect a consent-compliant provider later, call
 * `registerAnalyticsAdapter()` once on the client after consent is given.
 *
 * Note: the built-in buffer is local to one browser tab. It is NOT cross-user
 * traffic data and must never be reported as such.
 */

export type AnalyticsEventName =
  | "landing_view"
  | "routine_config_changed"
  | "routine_preview_generated"
  | "routine_started"
  | "routine_paused"
  | "routine_resumed"
  | "routine_completed"
  | "routine_exited"
  | "routine_restarted"
  | "preset_viewed"
  | "share_link_copied";

export type AnalyticsProps = {
  duration?: 2 | 5 | 10;
  location?: Location;
  focus?: Focus;
  intensity?: Intensity;
  seatedOnly?: boolean;
  /** Where the event came from, e.g. "builder", "preset:5-minute-desk-break", "session". */
  origin?: string;
  /** Which input changed (field name only, never a value typed by the user). */
  field?: "duration" | "location" | "focus" | "intensity" | "seated" | "shuffle" | "reset";
  /** Coarse step progress, e.g. 3 of 5. */
  step?: number;
  screen?: "mobile" | "tablet" | "desktop";
};

export type AnalyticsEvent = { name: AnalyticsEventName; props: AnalyticsProps; at: number };
export type AnalyticsAdapter = (event: AnalyticsEvent) => void;

const BUFFER_LIMIT = 100;
const buffer: AnalyticsEvent[] = [];
const adapters = new Set<AnalyticsAdapter>();

export function registerAnalyticsAdapter(adapter: AnalyticsAdapter): () => void {
  adapters.add(adapter);
  return () => adapters.delete(adapter);
}

export function screenCategory(): AnalyticsProps["screen"] {
  if (typeof window === "undefined") return undefined;
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

export function track(name: AnalyticsEventName, props: AnalyticsProps = {}): void {
  if (typeof window === "undefined") return;
  const event: AnalyticsEvent = { name, props: { screen: screenCategory(), ...props }, at: Date.now() };
  buffer.push(event);
  if (buffer.length > BUFFER_LIMIT) buffer.shift();
  (window as unknown as { __fitbreakEvents?: AnalyticsEvent[] }).__fitbreakEvents = buffer;
  adapters.forEach((adapter) => {
    try {
      adapter(event);
    } catch {
      // An analytics failure must never break the product.
    }
  });
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", name, event.props);
  }
}

export function getLocalEvents(): readonly AnalyticsEvent[] {
  return buffer;
}
