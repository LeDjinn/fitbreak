"use client";

import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/session-clock";

function Celebration() {
  return (
    <svg viewBox="0 0 200 200" className="size-40 sm:size-48" aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill="var(--color-lime)" opacity="0.12" />
      <circle cx="100" cy="100" r="70" fill="var(--color-mint)" />
      <g stroke="var(--color-lime)" strokeWidth="5" strokeLinecap="round" className="origin-center motion-safe:animate-[spin_24s_linear_infinite]">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return <line key={i} x1={100 + Math.cos(a) * 80} y1={100 + Math.sin(a) * 80} x2={100 + Math.cos(a) * 90} y2={100 + Math.sin(a) * 90} />;
        })}
      </g>
      <g stroke="var(--color-ink)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M100 80 L100 124" strokeWidth="8" />
        <path d="M100 84 L80 70 L70 50 M100 84 L120 70 L130 50" />
        <path d="M100 124 L89 156 M100 124 L111 156" />
      </g>
      <circle cx="100" cy="64" r="10" fill="var(--color-ink)" />
    </svg>
  );
}

export function CompletionScreen({
  minutes,
  activeMs,
  totalMs,
  shareUrl,
  onRepeat,
  onShared,
  exploreHref,
}: {
  minutes: number;
  activeMs: number;
  totalMs: number;
  shareUrl: string;
  onRepeat: () => void;
  onShared: () => void;
  exploreHref: string;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const skippedSome = activeMs < totalMs - 5000;

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(shareUrl);
      ok = true;
    } catch {
      ok = false;
    }
    setCopyState(ok ? "copied" : "manual");
    if (ok) onShared();
  }

  return (
    <div className="motion-safe:animate-rise flex flex-col items-center px-2 text-center">
      <Celebration />
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-on-panel-muted">Break complete</p>
      <h1 ref={headingRef} tabIndex={-1} className="font-display mt-3 text-[clamp(2.25rem,6vw,4rem)] leading-[1.02] font-semibold tracking-[-0.045em] outline-none">
        Nice work. You&apos;re back.
      </h1>
      <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-on-panel-muted">
        You finished your {minutes}-minute break
        {skippedSome ? `, with ${formatDuration(activeMs)} of it on the clock. Skipping ahead is fine` : ""}. Carry that
        feeling into whatever&apos;s next.
      </p>

      <div className="mt-9 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onRepeat}
          className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-lime px-6 font-bold text-ink transition-colors hover:bg-lime-deep"
        >
          <RotateCcw className="size-5" aria-hidden="true" /> Repeat
        </button>
        <Link
          href="/"
          className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-6 font-semibold text-on-panel transition-colors hover:bg-white/[0.12]"
        >
          <Sparkles className="size-5" aria-hidden="true" /> New break
        </Link>
      </div>
      <button
        type="button"
        onClick={copy}
        className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-on-panel-muted transition-colors hover:text-on-panel"
      >
        {copyState === "copied" ? <Check className="size-4 text-lime" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        {copyState === "copied" ? "Link copied" : "Copy share link"}
      </button>
      <p role="status" className="sr-only">
        {copyState === "copied" ? "Share link copied to clipboard." : ""}
      </p>
      {copyState === "manual" && (
        <div className="mt-2 w-full max-w-md">
          <label htmlFor="share-url" className="block text-xs text-on-panel-muted">
            Your browser blocked copying. Select and copy this link:
          </label>
          <input
            id="share-url"
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-sm text-on-panel"
          />
        </div>
      )}
      <Link href={exploreHref} className="mt-6 text-sm font-semibold text-on-panel underline decoration-lime/60 decoration-2 underline-offset-4 hover:decoration-lime">
        Explore more routines
      </Link>
    </div>
  );
}
