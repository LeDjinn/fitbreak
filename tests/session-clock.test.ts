import { describe, expect, it, vi } from "vitest";
import { buildSegments, formatClock, SessionClock } from "@/lib/session-clock";

function virtualClock() {
  let t = 1_000; // arbitrary non-zero origin, like performance.now()
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

const FIVE_MIN = Array.from({ length: 5 }, () => ({ activeSeconds: 50, transitionSeconds: 10 }));
const TWO_MIN = Array.from({ length: 4 }, () => ({ activeSeconds: 25, transitionSeconds: 5 }));

describe("buildSegments", () => {
  it("lays movement and transition segments end to end", () => {
    const segs = buildSegments(TWO_MIN);
    expect(segs).toHaveLength(8);
    expect(segs[0]).toMatchObject({ phase: "movement", startMs: 0, durationMs: 25_000 });
    expect(segs[1]).toMatchObject({ phase: "transition", startMs: 25_000, durationMs: 5_000 });
    const last = segs[segs.length - 1];
    expect(last.startMs + last.durationMs).toBe(120_000);
  });
});

describe("SessionClock", () => {
  it("starts idle and does not move until started", () => {
    const v = virtualClock();
    const clock = new SessionClock(FIVE_MIN, v.now);
    v.advance(5_000);
    expect(clock.snapshot()).toMatchObject({ status: "idle", elapsedMs: 0, totalMs: 300_000 });
  });

  it("tracks elapsed time exactly with virtual time", () => {
    const v = virtualClock();
    const clock = new SessionClock(FIVE_MIN, v.now);
    clock.start();
    v.advance(12_345);
    const s = clock.snapshot();
    expect(s.elapsedMs).toBe(12_345);
    expect(s.stepIndex).toBe(0);
    expect(s.phase).toBe("movement");
    expect(s.segmentRemainingMs).toBe(50_000 - 12_345);
  });

  it("enters the transition phase after the movement", () => {
    const v = virtualClock();
    const clock = new SessionClock(FIVE_MIN, v.now);
    clock.start();
    v.advance(52_000);
    expect(clock.snapshot()).toMatchObject({ stepIndex: 0, phase: "transition", segmentRemainingMs: 8_000 });
    v.advance(8_000);
    expect(clock.snapshot()).toMatchObject({ stepIndex: 1, phase: "movement", segmentElapsedMs: 0 });
  });

  it("pause freezes elapsed; resume continues exactly where it stopped", () => {
    const v = virtualClock();
    const clock = new SessionClock(FIVE_MIN, v.now);
    clock.start();
    v.advance(20_000);
    clock.pause();
    v.advance(600_000); // ten minutes paused
    expect(clock.snapshot()).toMatchObject({ status: "paused", elapsedMs: 20_000, activeMs: 20_000 });
    clock.resume();
    v.advance(5_000);
    expect(clock.snapshot()).toMatchObject({ status: "running", elapsedMs: 25_000, activeMs: 25_000 });
  });

  it("does not drift: many small reads equal one big read", () => {
    const v = virtualClock();
    const a = new SessionClock(FIVE_MIN, v.now);
    a.start();
    for (let i = 0; i < 1000; i++) {
      v.advance(97); // irregular, throttled-looking ticks
      a.snapshot();
    }
    expect(a.snapshot().elapsedMs).toBe(97_000);
  });

  it("next jumps to the start of the next movement, from movement or transition", () => {
    const v = virtualClock();
    const clock = new SessionClock(FIVE_MIN, v.now);
    clock.start();
    v.advance(10_000);
    clock.next();
    expect(clock.snapshot()).toMatchObject({ stepIndex: 1, phase: "movement", elapsedMs: 60_000 });
    v.advance(55_000); // into step 1's transition
    clock.next();
    expect(clock.snapshot()).toMatchObject({ stepIndex: 2, phase: "movement", elapsedMs: 120_000 });
  });

  it("skipping does not count as active time", () => {
    const v = virtualClock();
    const clock = new SessionClock(FIVE_MIN, v.now);
    clock.start();
    v.advance(10_000);
    clock.next();
    v.advance(1_000);
    expect(clock.snapshot().activeMs).toBe(11_000);
  });

  it("previous restarts the current movement, or goes back when just started", () => {
    const v = virtualClock();
    const clock = new SessionClock(FIVE_MIN, v.now);
    clock.start();
    v.advance(70_000); // 10s into step 1
    clock.previous();
    expect(clock.snapshot()).toMatchObject({ stepIndex: 1, elapsedMs: 60_000 });
    v.advance(1_000); // 1s into step 1
    clock.previous();
    expect(clock.snapshot()).toMatchObject({ stepIndex: 0, elapsedMs: 0 });
    clock.previous(); // already at the very start
    expect(clock.snapshot()).toMatchObject({ stepIndex: 0, elapsedMs: 0 });
  });

  it("completes exactly once and stops counting", () => {
    const v = virtualClock();
    const clock = new SessionClock(TWO_MIN, v.now);
    const onComplete = vi.fn();
    clock.onComplete(onComplete);
    clock.start();
    v.advance(119_999);
    expect(clock.snapshot().status).toBe("running");
    v.advance(1);
    expect(clock.snapshot()).toMatchObject({ status: "complete", elapsedMs: 120_000, remainingMs: 0, progress: 1 });
    v.advance(60_000);
    clock.snapshot();
    clock.snapshot();
    clock.toggle();
    clock.next();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(clock.snapshot()).toMatchObject({ status: "complete", elapsedMs: 120_000, activeMs: 120_000 });
  });

  it("skipping the last movement completes the session", () => {
    const v = virtualClock();
    const clock = new SessionClock(TWO_MIN, v.now);
    const onComplete = vi.fn();
    clock.onComplete(onComplete);
    clock.start();
    for (let i = 0; i < 4; i++) clock.next();
    expect(clock.getStatus()).toBe("complete");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("skipping while paused stays paused", () => {
    const v = virtualClock();
    const clock = new SessionClock(FIVE_MIN, v.now);
    clock.start();
    v.advance(5_000);
    clock.pause();
    clock.next();
    v.advance(30_000);
    expect(clock.snapshot()).toMatchObject({ status: "paused", stepIndex: 1, elapsedMs: 60_000 });
  });

  it("background rule: a hidden running tab keeps accurate real time", () => {
    const v = virtualClock();
    const clock = new SessionClock(FIVE_MIN, v.now);
    clock.start();
    v.advance(30_000);
    clock.snapshot();
    // Tab hidden: no ticks at all for 90 seconds.
    v.advance(90_000);
    expect(clock.snapshot()).toMatchObject({ elapsedMs: 120_000, stepIndex: 2, phase: "movement" });
  });

  it("background rule: returning after the end shows complete, with capped active time", () => {
    const v = virtualClock();
    const clock = new SessionClock(TWO_MIN, v.now);
    clock.start();
    v.advance(10 * 60_000);
    expect(clock.snapshot()).toMatchObject({ status: "complete", elapsedMs: 120_000, activeMs: 120_000 });
  });

  it("restart resets everything and runs again", () => {
    const v = virtualClock();
    const clock = new SessionClock(TWO_MIN, v.now);
    const onComplete = vi.fn();
    clock.onComplete(onComplete);
    clock.start();
    v.advance(120_000);
    clock.snapshot();
    clock.restart();
    v.advance(1_000);
    expect(clock.snapshot()).toMatchObject({ status: "running", elapsedMs: 1_000, activeMs: 1_000 });
    v.advance(119_000);
    clock.snapshot();
    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});

describe("formatClock", () => {
  it("rounds up so 00:00 only shows at the very end", () => {
    expect(formatClock(50_000)).toBe("00:50");
    expect(formatClock(49_001)).toBe("00:50");
    expect(formatClock(49_000)).toBe("00:49");
    expect(formatClock(1)).toBe("00:01");
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(600_000)).toBe("10:00");
  });
});
