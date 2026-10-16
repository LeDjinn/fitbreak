/**
 * Session clock engine, independent of React and of any timer.
 *
 * Source of truth is a monotonic time source (performance.now in the browser,
 * a virtual clock in tests). Elapsed time = accumulated + (now − runningSince).
 * UI redraw intervals only *read* the clock; a throttled or background tab can
 * never make it lose or gain time.
 *
 * Background rule: a running session keeps running while the tab is hidden.
 * When the person returns, the clock shows the real elapsed time (and may
 * already be complete). The UI tells them how long they were away.
 */

export type ClockStatus = "idle" | "running" | "paused" | "complete";
export type Phase = "movement" | "transition";

export type Segment = {
  stepIndex: number;
  phase: Phase;
  startMs: number;
  durationMs: number;
};

export type ClockSnapshot = {
  status: ClockStatus;
  elapsedMs: number;
  totalMs: number;
  remainingMs: number;
  progress: number; // 0..1 over the whole session
  stepIndex: number;
  phase: Phase;
  segmentIndex: number;
  segmentElapsedMs: number;
  segmentRemainingMs: number;
  segmentDurationMs: number;
  /** Real time spent with the clock running (excludes pauses and skipped time). */
  activeMs: number;
};

export type ClockStep = { activeSeconds: number; transitionSeconds: number };

export function buildSegments(steps: ClockStep[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  steps.forEach((step, stepIndex) => {
    segments.push({ stepIndex, phase: "movement", startMs: cursor, durationMs: step.activeSeconds * 1000 });
    cursor += step.activeSeconds * 1000;
    if (step.transitionSeconds > 0) {
      segments.push({ stepIndex, phase: "transition", startMs: cursor, durationMs: step.transitionSeconds * 1000 });
      cursor += step.transitionSeconds * 1000;
    }
  });
  return segments;
}

type Listener = () => void;

export class SessionClock {
  readonly segments: Segment[];
  readonly totalMs: number;
  private readonly now: () => number;

  private status: ClockStatus = "idle";
  /** Position on the routine timeline, excluding the currently running stretch. */
  private positionMs = 0;
  /** Real running time, excluding the currently running stretch. */
  private activeAccumMs = 0;
  private runningSince: number | null = null;
  private completeListeners = new Set<Listener>();
  private completedFired = false;

  constructor(steps: ClockStep[], now: () => number) {
    this.segments = buildSegments(steps);
    const last = this.segments[this.segments.length - 1];
    this.totalMs = last ? last.startMs + last.durationMs : 0;
    this.now = now;
  }

  onComplete(listener: Listener): () => void {
    this.completeListeners.add(listener);
    return () => this.completeListeners.delete(listener);
  }

  start(): void {
    if (this.status !== "idle") return;
    this.status = "running";
    this.runningSince = this.now();
  }

  pause(): void {
    if (this.sync() !== "running") return;
    this.commitRunning();
    this.status = "paused";
    this.runningSince = null;
  }

  resume(): void {
    if (this.sync() !== "paused") return;
    this.status = "running";
    this.runningSince = this.now();
  }

  toggle(): void {
    const status = this.sync();
    if (status === "running") this.pause();
    else if (status === "paused") this.resume();
    else if (status === "idle") this.start();
  }

  /** Jump to the start of the next movement. Skipping the last movement completes the session. */
  next(): void {
    if (this.sync() === "complete" || this.status === "idle") return;
    const current = this.segmentAt(this.position());
    const nextMovement = this.segments.find((s) => s.phase === "movement" && s.stepIndex === current.stepIndex + 1);
    this.seek(nextMovement ? nextMovement.startMs : this.totalMs);
  }

  /**
   * Previous: within the first 3 s of a movement, go to the previous movement;
   * otherwise (or during a transition) restart the current movement.
   */
  previous(): void {
    if (this.sync() === "complete" || this.status === "idle") return;
    const position = this.position();
    const current = this.segmentAt(position);
    const currentMovement = this.segments.find((s) => s.phase === "movement" && s.stepIndex === current.stepIndex)!;
    const intoMovement = position - currentMovement.startMs;
    if (current.phase === "movement" && intoMovement < 3000 && current.stepIndex > 0) {
      const prev = this.segments.find((s) => s.phase === "movement" && s.stepIndex === current.stepIndex - 1)!;
      this.seek(prev.startMs);
    } else {
      this.seek(currentMovement.startMs);
    }
  }

  /** Restart the whole routine from zero, running. */
  restart(): void {
    this.positionMs = 0;
    this.activeAccumMs = 0;
    this.completedFired = false;
    this.status = "running";
    this.runningSince = this.now();
  }

  /** Read state; also transitions to `complete` (firing listeners exactly once) when time is up. */
  snapshot(): ClockSnapshot {
    const status = this.sync();
    const elapsedMs = this.position();
    const segmentIndex = this.segmentIndexAt(elapsedMs);
    const segment = this.segments[segmentIndex];
    const segmentElapsedMs = Math.min(segment.durationMs, Math.max(0, elapsedMs - segment.startMs));
    return {
      status,
      elapsedMs,
      totalMs: this.totalMs,
      remainingMs: Math.max(0, this.totalMs - elapsedMs),
      progress: this.totalMs === 0 ? 1 : elapsedMs / this.totalMs,
      stepIndex: segment.stepIndex,
      phase: segment.phase,
      segmentIndex,
      segmentElapsedMs,
      segmentRemainingMs: segment.durationMs - segmentElapsedMs,
      segmentDurationMs: segment.durationMs,
      activeMs: this.activeMs(),
    };
  }

  getStatus(): ClockStatus {
    return this.sync();
  }

  // ── internals ──

  private runningDelta(): number {
    return this.status === "running" && this.runningSince !== null ? Math.max(0, this.now() - this.runningSince) : 0;
  }

  private position(): number {
    return Math.min(this.totalMs, this.positionMs + this.runningDelta());
  }

  private activeMs(): number {
    // Running time that ran past the end of the routine doesn't count.
    const overshoot = Math.max(0, this.positionMs + this.runningDelta() - this.totalMs);
    return this.activeAccumMs + this.runningDelta() - overshoot;
  }

  /** Fold the currently running stretch into the accumulators. */
  private commitRunning(): void {
    if (this.status !== "running" || this.runningSince === null) return;
    const now = this.now();
    const usable = Math.min(Math.max(0, now - this.runningSince), this.totalMs - this.positionMs);
    this.positionMs += usable;
    this.activeAccumMs += usable;
    this.runningSince = now;
  }

  private seek(targetMs: number): void {
    this.commitRunning();
    this.positionMs = Math.max(0, Math.min(this.totalMs, targetMs));
    this.sync();
  }

  private sync(): ClockStatus {
    if ((this.status === "running" || this.status === "paused") && this.position() >= this.totalMs) {
      this.commitRunning();
      this.positionMs = this.totalMs;
      this.status = "complete";
      this.runningSince = null;
      if (!this.completedFired) {
        this.completedFired = true;
        this.completeListeners.forEach((l) => l());
      }
    }
    return this.status;
  }

  private segmentIndexAt(positionMs: number): number {
    for (let i = 0; i < this.segments.length; i++) {
      const s = this.segments[i];
      if (positionMs < s.startMs + s.durationMs) return i;
    }
    return this.segments.length - 1;
  }

  private segmentAt(positionMs: number): Segment {
    return this.segments[this.segmentIndexAt(positionMs)];
  }
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000 - 1e-6));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s} sec`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} sec`;
}
