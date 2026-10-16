"use client";

import Link from "next/link";
import { useEffect } from "react";
import { reportError } from "@/lib/error-reporting";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;
    reportError(error, { boundary: "app/error", digest });
  }, [error]);

  return (
    <main id="main" className="wrap grid min-h-[70dvh] place-items-center py-16 text-center">
      <div className="max-w-md">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint-deep">Something went wrong</p>
        <h1 className="font-display mt-4 text-[clamp(2.2rem,6vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.045em]">
          This page tripped up.
        </h1>
        <p className="mt-4 leading-relaxed text-muted">
          It&apos;s not you. We&apos;ve been notified automatically. Try again, or head back and start a fresh break.
        </p>
        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-ink px-6 font-semibold text-on-panel hover:bg-mint-deep"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-stroke-strong px-6 font-semibold text-ink hover:bg-paper"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
