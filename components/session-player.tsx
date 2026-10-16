"use client";

import { ChevronDown, Volume2, VolumeX, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track, type AnalyticsProps } from "@/lib/analytics";
import { enableAudio, playCue } from "@/lib/audio";
import { getExercise } from "@/lib/exercises";
import { generateRoutine } from "@/lib/routine-generator";
import { sessionHref } from "@/lib/routine-params";
import { formatClock, formatDuration, SessionClock, type ClockSnapshot } from "@/lib/session-clock";
import type { RoutineConfig } from "@/lib/types";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BrandMark } from "./brand";
import { CompletionScreen } from "./completion-screen";
import { MovementIllustration } from "./movement-illustration";
import { SessionControls } from "./session-controls";

const TICK_MS = 200;
const AWAY_NOTICE_MS = 5000;

function isInteractive(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return !!target.closest("button, a, input, select, textarea, summary, [role='switch'], [contenteditable='true']");
}

function ProgressRing({ fraction, children }: { fraction: number; children: React.ReactNode }) {
  const r = 47;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative aspect-square w-full">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="2.2" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, fraction)))}
          className="transition-[stroke-dashoffset] duration-200 ease-linear"
        />
      </svg>
      <div className="absolute inset-[7%] grid place-items-center overflow-hidden rounded-full bg-mint text-ink shadow-[0_0_0_14px_rgb(255_255_255/0.035),0_0_0_30px_rgb(255_255_255/0.02)]">
        {children}
      </div>
    </div>
  );
}

export function SessionPlayer({
  config,
  origin,
  exitHref,
  adjusted,
}: {
  config: RoutineConfig;
  origin: string;
  exitHref: string;
  adjusted: boolean;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const routine = useMemo(() => generateRoutine(config), [config]);
  const exercises = useMemo(() => routine.steps.map((s) => getExercise(s.exerciseId)), [routine]);
  const [clock] = useState(() => new SessionClock(routine.steps, () => performance.now()));
  const [snap, setSnap] = useState<ClockSnapshot>(() => clock.snapshot());
  const [soundOn, setSoundOn] = useState(false);
  const [awayNotice, setAwayNotice] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const keepGoingRef = useRef<HTMLButtonElement>(null);
  const resumeAfterDialog = useRef(false);
  const hiddenAt = useRef<number | null>(null);
  const started = useRef(false);
  const lastSegment = useRef(-1);
  const lastSecond = useRef(-1);

  const meta: AnalyticsProps = useMemo(
    () => ({
      duration: config.durationMinutes,
      location: config.location,
      focus: config.focus,
      intensity: config.intensity,
      seatedOnly: config.seatedOnly,
      origin,
    }),
    [config, origin],
  );

  const refresh = useCallback(() => setSnap(clock.snapshot()), [clock]);

  // Start once (StrictMode-safe) and wire completion.
  useEffect(() => {
    const off = clock.onComplete(() => {
      track("routine_completed", meta);
      playCue("done");
    });
    if (!started.current) {
      started.current = true;
      clock.start();
      track("routine_started", meta);
    }
    const raf = requestAnimationFrame(refresh);
    return () => {
      off();
      cancelAnimationFrame(raf);
    };
  }, [clock, meta, refresh]);

  // The redraw interval only reads the clock; it is not the source of truth.
  const running = snap.status === "running";
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(refresh, TICK_MS);
    return () => window.clearInterval(id);
  }, [running, refresh]);

  // Background tabs: keep real time, then tell people how long they were away.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = clock.getStatus() === "running" ? performance.now() : null;
      } else {
        if (hiddenAt.current !== null) {
          const away = performance.now() - hiddenAt.current;
          if (away > AWAY_NOTICE_MS) {
            setAwayNotice(`Welcome back. The timer kept running while you were away (${formatDuration(away)}).`);
          }
        }
        hiddenAt.current = null;
        refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [clock, refresh]);

  useEffect(() => {
    if (!awayNotice) return;
    const id = window.setTimeout(() => setAwayNotice(null), 8000);
    return () => window.clearTimeout(id);
  }, [awayNotice]);

  // Audio cues on phase changes. (Screen-reader announcements are derived below.)
  const current = exercises[snap.stepIndex];
  const nextExercise = exercises[snap.stepIndex + 1];
  const isFinalTransition = snap.phase === "transition" && !nextExercise;
  useEffect(() => {
    if (snap.status !== "running") return;
    if (snap.segmentIndex === lastSegment.current) return;
    const first = lastSegment.current === -1;
    lastSegment.current = snap.segmentIndex;
    if (first) return;
    playCue(snap.phase === "movement" ? "move" : "rest");
  }, [snap.segmentIndex, snap.phase, snap.status]);

  const secondsLeft = Math.ceil(snap.segmentRemainingMs / 1000 - 1e-6);
  useEffect(() => {
    if (snap.status !== "running" || snap.phase !== "movement") return;
    if (secondsLeft === lastSecond.current) return;
    lastSecond.current = secondsLeft;
    if (secondsLeft <= 3 && secondsLeft >= 1) playCue("tick");
  }, [secondsLeft, snap.status, snap.phase]);

  // ── actions ──
  const toggle = useCallback(() => {
    const before = clock.getStatus();
    clock.toggle();
    const after = clock.getStatus();
    if (before === "running" && after === "paused") {
      track("routine_paused", { ...meta, step: snap.stepIndex + 1 });
    } else if (before === "paused" && after === "running") {
      track("routine_resumed", { ...meta, step: snap.stepIndex + 1 });
    }
    refresh();
  }, [clock, meta, refresh, snap.stepIndex]);

  const next = useCallback(() => {
    clock.next();
    refresh();
  }, [clock, refresh]);

  const previous = useCallback(() => {
    clock.previous();
    refresh();
  }, [clock, refresh]);

  const toggleSound = useCallback(() => {
    setSoundOn((on) => {
      // Sound always starts muted; it is only enabled by an explicit click (browsers block autoplay anyway).
      const nextOn = !on && enableAudio();
      if (nextOn) playCue("rest");
      return nextOn;
    });
  }, []);

  const openLeave = useCallback(() => {
    if (clock.getStatus() === "complete") {
      router.push(exitHref);
      return;
    }
    resumeAfterDialog.current = clock.getStatus() === "running";
    clock.pause();
    refresh();
    setLeaveOpen(true);
  }, [clock, exitHref, refresh, router]);

  const keepGoing = useCallback(() => {
    setLeaveOpen(false);
    if (resumeAfterDialog.current) clock.resume();
    refresh();
  }, [clock, refresh]);

  const leave = useCallback(() => {
    track("routine_exited", { ...meta, step: snap.stepIndex + 1 });
    setLeaveOpen(false);
    router.push(exitHref);
  }, [exitHref, meta, router, snap.stepIndex]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (leaveOpen && !dialog.open) {
      dialog.showModal();
      keepGoingRef.current?.focus(); // the safe choice gets focus, not "Leave"
    }
    if (!leaveOpen && dialog.open) dialog.close();
  }, [leaveOpen]);

  // Keyboard: Space (when not on a control), ←/→, M, Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (leaveOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      if (clock.getStatus() === "complete") return;
      if (e.key === " " && !isInteractive(e.target)) {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowRight" && !isInteractive(e.target)) {
        next();
      } else if (e.key === "ArrowLeft" && !isInteractive(e.target)) {
        previous();
      } else if (e.key.toLowerCase() === "m" && !isInteractive(e.target)) {
        toggleSound();
      } else if (e.key === "Escape") {
        // Without preventDefault, this same keypress would immediately "cancel" the dialog it opens.
        e.preventDefault();
        openLeave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clock, leaveOpen, next, openLeave, previous, toggle, toggleSound]);

  const repeat = useCallback(() => {
    clock.restart();
    lastSegment.current = -1;
    track("routine_restarted", meta);
    refresh();
  }, [clock, meta, refresh]);

  const shareUrl = typeof window === "undefined" ? sessionHref(config) : `${window.location.origin}${sessionHref(config)}`;

  // ── render ──
  const paused = snap.status === "paused";
  const complete = snap.status === "complete";
  const moveNo = snap.stepIndex + 1;
  const showing = snap.phase === "transition" && nextExercise ? nextExercise : current;
  const ringFraction = snap.segmentDurationMs ? snap.segmentElapsedMs / snap.segmentDurationMs : 0;

  const kicker =
    snap.phase === "movement"
      ? `Movement ${moveNo} of ${exercises.length}`
      : isFinalTransition
        ? "Cool down"
        : `Up next · ${moveNo + 1} of ${exercises.length}`;
  const title = snap.phase === "movement" ? current.name : isFinalTransition ? "Breathe and finish." : nextExercise!.name;
  const lead =
    snap.phase === "movement"
      ? current.shortInstruction
      : isFinalTransition
        ? "Let your shoulders drop. One slow breath in, one slow breath out."
        : `Take a breath and get ready. ${nextExercise!.shortInstruction}`;
  // Changes only when the phase or paused state changes, so it is never read on every tick.
  const announcement = paused
    ? `Paused. ${kicker}: ${title}.`
    : snap.phase === "movement"
      ? `Movement ${moveNo} of ${exercises.length}: ${current.name}. ${Math.round(snap.segmentDurationMs / 1000)} seconds.`
      : nextExercise
        ? `Short pause. Next: ${nextExercise.name}.`
        : "Almost done. Take a slow breath.";
  const stage = paused ? "Paused" : snap.phase === "movement" ? "Move at your own pace" : isFinalTransition ? "Almost done" : "Get ready";

  return (
    <div className="on-dark session-bg flex min-h-dvh flex-col text-on-panel">
      <header className="wrap flex h-16 shrink-0 items-center justify-between gap-3 sm:h-20">
        <div className="flex items-center gap-2.5">
          <BrandMark tone="dark" className="size-8" />
          <span className="font-display text-lg font-semibold tracking-[-0.03em] max-sm:sr-only">fitbreak</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-keyshortcuts="M"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-3.5 text-sm font-semibold text-on-panel-muted transition-colors hover:text-on-panel sm:px-4"
          >
            {soundOn ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
            <span>{soundOn ? "Sound on" : "Sound off"}</span>
          </button>
          <button
            type="button"
            onClick={openLeave}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-3.5 text-sm font-semibold text-on-panel transition-colors hover:bg-white/[0.08] sm:px-4"
          >
            <X className="size-4" aria-hidden="true" />
            {complete ? "Close" : "Exit"}
          </button>
        </div>
      </header>

      {adjusted && !complete && (
        <p className="wrap mb-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm text-on-panel-muted">
          Some settings in this link weren&apos;t recognised, so we used the defaults for those.
        </p>
      )}

      <main id="main" className="wrap flex flex-1 flex-col pb-6">
        {complete ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <CompletionScreen
              minutes={config.durationMinutes}
              activeMs={snap.activeMs}
              totalMs={snap.totalMs}
              shareUrl={shareUrl}
              onRepeat={repeat}
              onShared={() => track("share_link_copied", meta)}
              exploreHref="/routines"
            />
          </div>
        ) : (
          <>
            {/* Overall progress, one segment per movement */}
            <div
              role="progressbar"
              aria-label="Break progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(snap.progress * 100)}
              aria-valuetext={`Movement ${moveNo} of ${exercises.length}, ${formatClock(snap.remainingMs)} left`}
              className="flex h-1.5 gap-1"
            >
              {routine.steps.map((s, i) => {
                const segLen = (s.activeSeconds + s.transitionSeconds) * 1000;
                const start = routine.steps.slice(0, i).reduce((t, x) => t + (x.activeSeconds + x.transitionSeconds) * 1000, 0);
                const fill = Math.min(1, Math.max(0, (snap.elapsedMs - start) / segLen));
                return (
                  <span key={s.id} className="relative flex-1 overflow-hidden rounded-full bg-white/12">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-lime" style={{ width: `${fill * 100}%` }} />
                  </span>
                );
              })}
            </div>
            <div className="mt-2.5 flex justify-between text-xs font-semibold text-on-panel-muted">
              <span className="tabular">{formatClock(snap.elapsedMs)} done</span>
              <span className="tabular">{formatClock(snap.remainingMs)} left</span>
            </div>

            {awayNotice && (
              <p role="status" className="motion-safe:animate-fade mt-4 rounded-xl border border-lime/25 bg-lime/10 px-4 py-3 text-sm text-on-panel">
                {awayNotice}
              </p>
            )}

            <section
              aria-labelledby="move-title"
              className="grid flex-1 items-center gap-6 py-6 sm:py-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14"
            >
              <div className="mx-auto w-full max-w-[13.5rem] sm:max-w-[18rem] lg:max-w-[26rem]">
                <ProgressRing fraction={ringFraction}>
                  <div className={`relative size-[82%] transition-opacity duration-300 ${snap.phase === "transition" ? "opacity-60" : ""}`}>
                    <MovementIllustration
                      key={`${showing.id}-${snap.phase}`}
                      illustrationKey={isFinalTransition ? "breathing" : showing.illustrationKey}
                      animated={!reducedMotion && !paused && (snap.phase === "movement" || isFinalTransition)}
                      className="size-full"
                    />
                  </div>
                  {paused && (
                    <span className="absolute inset-x-0 bottom-[16%] mx-auto w-fit rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-lime">
                      Paused
                    </span>
                  )}
                </ProgressRing>
              </div>

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-panel-muted" data-testid="session-kicker">
                  {kicker}
                </p>
                <h1 id="move-title" className="font-display mt-2.5 text-[clamp(2rem,5.4vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance" data-testid="session-title">
                  {title}
                </h1>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-on-panel-muted sm:text-lg">{lead}</p>

                <div className="mt-5 flex items-baseline gap-3 lg:mt-7">
                  <p
                    className={`font-display tabular text-[clamp(4.5rem,13vw,8.5rem)] leading-[0.9] font-semibold tracking-[-0.06em] ${paused ? "text-on-panel-muted" : ""}`}
                    data-testid="session-timer"
                    aria-label={`${secondsLeft} seconds left in this ${snap.phase === "movement" ? "movement" : "pause"}`}
                  >
                    {formatClock(snap.segmentRemainingMs)}
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-lime" aria-hidden="true">
                  {stage}
                </p>

                {snap.phase === "movement" && (
                  <details className="group mt-6 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] text-left lg:open:bg-white/[0.05]" open>
                    <summary className="flex min-h-12 items-center justify-between px-4 text-sm font-semibold">
                      How to do it
                      <ChevronDown className="size-5 text-on-panel-muted transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <ol className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-on-panel-muted">
                      {current.steps.map((step, i) => (
                        <li key={step} className="flex gap-3">
                          <span className="tabular mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-[0.6875rem] font-bold text-on-panel">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                      {current.coachingCue && <li className="pl-8 text-on-panel/90 italic">{current.coachingCue}</li>}
                      {current.contraindicationNote && <li className="pl-8 text-lime/90">{current.contraindicationNote}</li>}
                    </ol>
                  </details>
                )}
              </div>
            </section>

            <div className="sticky bottom-0 -mx-4 mt-auto border-t border-white/[0.06] bg-panel/90 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none">
              <SessionControls
                paused={paused}
                onToggle={toggle}
                onPrevious={previous}
                onNext={next}
                isLastMove={snap.stepIndex === exercises.length - 1}
              />
              <p className="mt-3 text-center text-xs text-on-panel-muted" data-testid="up-next">
                {snap.phase === "movement" && nextExercise ? (
                  <>Up next: <span className="font-semibold text-on-panel">{nextExercise.name}</span></>
                ) : snap.phase === "movement" ? (
                  "Last movement. You're nearly there."
                ) : (
                  <span className="max-sm:hidden">Keyboard: Space pauses, ← → move between steps, M toggles sound.</span>
                )}
              </p>
            </div>
          </>
        )}

        <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-on-panel-muted">
          Move gently and comfortably. Stop if you feel pain, dizziness, or unwell. This is general movement guidance, not medical advice.
        </p>
      </main>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {complete ? "Break complete. Nice work." : announcement}
      </p>

      <dialog
        ref={dialogRef}
        aria-labelledby="leave-title"
        aria-describedby="leave-desc"
        onCancel={(e) => {
          e.preventDefault();
          keepGoing();
        }}
        className="on-dark m-auto w-[min(26rem,calc(100%-2rem))] rounded-3xl border border-white/10 bg-panel-2 p-6 text-on-panel shadow-[var(--shadow-panel)] backdrop:bg-ink/70 backdrop:backdrop-blur-sm sm:p-7"
      >
        <h2 id="leave-title" className="font-display text-2xl font-semibold tracking-[-0.03em]">
          Leave this break?
        </h2>
        <p id="leave-desc" className="mt-2 text-sm leading-relaxed text-on-panel-muted">
          You&apos;re {formatClock(snap.elapsedMs)} in, and the timer is paused. Leaving won&apos;t save your progress, but your choices are still saved for next time.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={leave}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 px-5 font-semibold text-on-panel hover:bg-white/[0.08]"
          >
            Leave
          </button>
          <button
            ref={keepGoingRef}
            type="button"
            onClick={keepGoing}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-lime px-5 font-bold text-ink hover:bg-lime-deep"
          >
            Keep going
          </button>
        </div>
      </dialog>
    </div>
  );
}
