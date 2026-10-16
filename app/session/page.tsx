import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandMark } from "@/components/brand";
import { SessionFromParams } from "@/components/session-from-params";

export const metadata: Metadata = {
  title: "Your break",
  description: "A guided movement break in progress.",
  robots: { index: false, follow: false },
};

function Loading() {
  return (
    <div className="on-dark session-bg grid min-h-dvh place-items-center text-on-panel">
      <div className="flex flex-col items-center gap-4">
        <BrandMark tone="dark" className="size-12 motion-safe:animate-pulse" />
        <p className="text-sm text-on-panel-muted">Getting your break ready…</p>
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SessionFromParams />
    </Suspense>
  );
}
