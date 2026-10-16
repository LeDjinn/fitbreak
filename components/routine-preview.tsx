"use client";

import { Armchair, BrickWall, Shuffle } from "lucide-react";
import { getExercise } from "@/lib/exercises";
import { ROUTINE_TITLE } from "@/lib/routine-params";
import { formatClock } from "@/lib/session-clock";
import type { GeneratedRoutine } from "@/lib/types";
import { MovementIllustration } from "./movement-illustration";

export function RoutinePreview({
  routine,
  onShuffle,
  liveMessage,
}: {
  routine: GeneratedRoutine;
  onShuffle: () => void;
  liveMessage: string;
}) {
  const { config, steps, totalSeconds } = routine;
  const copy = ROUTINE_TITLE[config.focus];
  const moves = steps.length;
  const compact = moves > 5;

  return (
    <aside
      aria-labelledby="preview-heading"
      className="on-dark panel-rings relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-6 text-on-panel shadow-[var(--shadow-panel)] sm:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-on-panel-muted">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full rounded-full bg-lime opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-lime" />
          </span>
          Your next break
        </p>
        <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[0.6875rem] font-semibold text-on-panel-muted">
          Live preview
        </span>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <p className="font-display tabular text-[4.25rem] font-semibold leading-[0.9] tracking-[-0.05em] sm:text-[5rem]" aria-label={`${config.durationMinutes} minutes`}>
          {formatClock(totalSeconds * 1000)}
        </p>
        <p className="pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-on-panel-muted">minutes</p>
      </div>
      <h2 id="preview-heading" className="font-display mt-4 text-2xl font-semibold tracking-[-0.03em]">
        {copy.title}
      </h2>
      <p className="mt-1 text-sm text-on-panel-muted">{copy.blurb}</p>

      {/* Time allocation: one bar segment per movement, transitions as gaps. */}
      <div className="mt-6 flex h-2 gap-[3px]" aria-hidden="true">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-1 gap-[2px]">
            <span className="h-full rounded-full bg-lime" style={{ flex: s.activeSeconds }} />
            <span className="h-full rounded-full bg-white/20" style={{ flex: s.transitionSeconds }} />
          </div>
        ))}
      </div>

      <div className="mt-5 mb-2.5 flex items-center justify-between text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-on-panel-muted">
        <h3>Your movement plan</h3>
        <span className="tabular">{moves} moves</span>
      </div>

      <ol className={`grid gap-1.5 ${compact ? "sm:grid-cols-2" : ""}`} aria-label="Movements in this break">
        {steps.map((step, index) => {
          const exercise = getExercise(step.exerciseId);
          return (
            <li
              key={`${step.id}-${config.variation}`}
              className="motion-safe:animate-rise flex min-h-12 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.045] py-1.5 pr-3 pl-1.5"
              style={{ animationDelay: `${index * 35}ms` }}
            >
              <span className="relative grid size-10 shrink-0 place-items-center rounded-[0.6rem] bg-mint text-ink">
                <MovementIllustration illustrationKey={exercise.illustrationKey} className="size-9" />
                <span className="tabular absolute -top-1 -left-1 grid size-[1.125rem] place-items-center rounded-full bg-lime text-[0.625rem] font-bold text-ink">
                  {index + 1}
                </span>
              </span>
              <span className="min-w-0 flex-1 leading-snug">
                <span className="block text-sm font-medium">
                  {exercise.name}
                  {exercise.posture === "standing" && <span className="sr-only"> (standing)</span>}
                </span>
                {!compact && <span className="mt-0.5 block text-xs text-on-panel-muted max-sm:hidden">{exercise.shortInstruction}</span>}
              </span>
              <span className="tabular shrink-0 text-xs font-semibold text-on-panel-muted">{step.activeSeconds}s</span>
            </li>
          );
        })}
      </ol>

      {(routine.equipment.length > 0 || routine.notes.length > 0) && (
        <div className="mt-4 space-y-2 text-xs leading-relaxed text-on-panel-muted">
          {routine.equipment.length > 0 && (
            <p className="flex flex-wrap items-center gap-1.5">
              <span>You&apos;ll use:</span>
              {routine.equipment.map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2 py-0.5 font-semibold text-on-panel">
                  {item === "chair" ? <Armchair className="size-3.5" aria-hidden="true" /> : <BrickWall className="size-3.5" aria-hidden="true" />}
                  {item === "chair" ? "a sturdy chair or desk" : "a clear wall"}
                </span>
              ))}
            </p>
          )}
          {routine.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-4 pt-6">
        <p className="text-xs leading-relaxed text-on-panel-muted">
          {moves} × {steps[0].activeSeconds}s moves, {steps[0].transitionSeconds}s to reset between.
          <br className="hidden sm:block" /> Exactly {config.durationMinutes} minutes.
        </p>
        <button
          type="button"
          onClick={onShuffle}
          className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm font-semibold text-on-panel transition-colors hover:bg-white/[0.12]"
        >
          <Shuffle className="size-4 transition-transform duration-300 group-active:rotate-180" aria-hidden="true" />
          Shuffle
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {liveMessage}
      </p>
    </aside>
  );
}
