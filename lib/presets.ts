import type { RoutineConfig } from "./types";

export type Preset = {
  slug: string;
  title: string;
  shortTitle: string;
  metaDescription: string;
  summary: string;
  goodFor: string[];
  whatToExpect: string;
  config: RoutineConfig;
};

export const PRESETS: Preset[] = [
  {
    slug: "5-minute-desk-break",
    title: "5-minute desk break",
    shortTitle: "Desk break",
    metaDescription:
      "A free, guided 5-minute movement break you can do beside your desk. Five gentle moves, clear instructions, no equipment or signup.",
    summary:
      "Five gentle movements you can do right where you work: a few in your chair, a few standing beside your desk. A good default between meetings.",
    goodFor: ["Between meetings", "After a long stretch of typing", "When you've been sitting since lunch"],
    whatToExpect:
      "You'll do five movements for 50 seconds each, with a 10-second pause before the next one. You'll need your chair and your desk for support. Nothing goes on the floor.",
    config: { durationMinutes: 5, location: "desk", focus: "full", intensity: "gentle", seatedOnly: false, variation: 0 },
  },
  {
    slug: "2-minute-seated-reset",
    title: "2-minute seated reset",
    shortTitle: "Seated reset",
    metaDescription:
      "A 2-minute guided reset for your neck and shoulders, done entirely in your chair. Four calm moves with a timer. Free, no signup.",
    summary:
      "Four calm movements for your neck, shoulders and hands, without leaving your chair. Short enough to fit before your next call.",
    goodFor: ["Open-plan offices", "Video-call days", "When standing up isn't practical"],
    whatToExpect:
      "Four movements of 25 seconds each, with a 5-second pause after each one. Everything happens seated, and no move asks you to stand.",
    config: { durationMinutes: 2, location: "desk", focus: "neck-shoulders", intensity: "gentle", seatedOnly: true, variation: 0 },
  },
  {
    slug: "10-minute-home-movement",
    title: "10-minute home movement",
    shortTitle: "Home movement",
    metaDescription:
      "A guided 10-minute movement break for working from home. Ten varied, low-impact moves that lift your energy. No equipment needed.",
    summary:
      "Ten varied, low-impact movements that warm you up, get your legs going, and ease you back down. Made for a living room or bedroom.",
    goodFor: ["Working from home", "A mid-afternoon slump", "Swapping a scroll break for a move break"],
    whatToExpect:
      "Ten movements of 50 seconds each, with a 10-second pause after each one. It starts and ends gently. Some moves use a sturdy chair or a wall, and the plan below shows which ones.",
    config: { durationMinutes: 10, location: "home", focus: "energy", intensity: "energizing", seatedOnly: false, variation: 0 },
  },
];

export function getPreset(slug: string): Preset | undefined {
  return PRESETS.find((p) => p.slug === slug);
}
