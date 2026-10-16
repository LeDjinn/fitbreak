"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/error-reporting";

// Renders its own document without globals.css, so styles are inline.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;
    reportError(error, { boundary: "app/global-error", digest });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#f7f7f2", color: "#153532", fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif", textAlign: "center", padding: "2rem 1rem" }}>
        <title>Something went wrong · FitBreak</title>
        <main style={{ maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "2.25rem", letterSpacing: "-0.04em", lineHeight: 1.05, margin: 0 }}>FitBreak tripped up.</h1>
          <p style={{ color: "#5b6f6b", lineHeight: 1.6, marginTop: "1rem" }}>
            It&apos;s not you. We&apos;ve been notified automatically. Please try again.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: "1.5rem", minHeight: "3rem", padding: "0 1.5rem", border: 0, borderRadius: "1rem", background: "#153532", color: "#f3f8f2", font: "inherit", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
