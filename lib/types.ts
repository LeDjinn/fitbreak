export type Focus = "full" | "neck-shoulders" | "lower-body" | "energy";
export type Location = "desk" | "small-room" | "home";
export type Intensity = "gentle" | "energizing";
export type DurationMinutes = 2 | 5 | 10;

export type Exercise = {
  id: string;
  name: string;
  shortInstruction: string;
  /** 2–4 concise, verifiable steps. */
  steps: string[];
  coachingCue?: string;
  focus: Focus[];
  location: Location[];
  intensity: Intensity | "both";
  posture: "seated" | "standing";
  equipment: "none" | "chair" | "wall";
  /** 1 = very easy, 3 = brisk. Used to keep the first and last moves gentle. */
  effort: 1 | 2 | 3;
  illustrationKey: string;
  contraindicationNote?: string;
};

export type RoutineConfig = {
  durationMinutes: DurationMinutes;
  location: Location;
  focus: Focus;
  intensity: Intensity;
  seatedOnly: boolean;
  /** Changes only when the user clicks shuffle. */
  variation: number;
};

export type RoutineStep = {
  id: string;
  exerciseId: string;
  activeSeconds: number;
  transitionSeconds: number;
};

export type GeneratedRoutine = {
  config: RoutineConfig;
  steps: RoutineStep[];
  totalSeconds: number;
  /** Plain-language notes about substitutions or constraints the user should know. */
  notes: string[];
  /** Equipment the routine relies on, beyond your own body. */
  equipment: Array<"chair" | "wall">;
};
