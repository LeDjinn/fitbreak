"use client";

import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

export function SessionControls({
  paused,
  onToggle,
  onPrevious,
  onNext,
  isLastMove,
}: {
  paused: boolean;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isLastMove: boolean;
}) {
  const secondary =
    "inline-flex min-h-14 min-w-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-4 text-sm font-semibold text-on-panel transition-colors hover:bg-white/[0.12] sm:flex-none sm:px-5";
  return (
    <div className="flex w-full items-center justify-center gap-2.5 sm:gap-3" role="group" aria-label="Session controls">
      <button type="button" onClick={onPrevious} className={secondary} aria-keyshortcuts="ArrowLeft">
        <SkipBack className="size-5 shrink-0" aria-hidden="true" />
        <span className="max-sm:sr-only">Previous</span>
      </button>
      <button
        type="button"
        onClick={onToggle}
        data-testid="pause-resume"
        aria-keyshortcuts="Space"
        className="inline-flex min-h-14 flex-[1.4] items-center justify-center gap-2.5 rounded-2xl bg-lime px-6 text-base font-bold text-ink shadow-[0_12px_30px_-12px_rgb(217_242_134/0.7)] transition-[background-color,transform] hover:bg-lime-deep active:scale-[0.98] sm:min-w-44 sm:flex-none"
      >
        {paused ? <Play className="size-5 fill-current" aria-hidden="true" /> : <Pause className="size-5 fill-current" aria-hidden="true" />}
        {paused ? "Resume" : "Pause"}
      </button>
      <button type="button" onClick={onNext} className={secondary} aria-keyshortcuts="ArrowRight">
        <span className="max-sm:sr-only">{isLastMove ? "Finish" : "Next"}</span>
        <SkipForward className="size-5 shrink-0" aria-hidden="true" />
      </button>
    </div>
  );
}
