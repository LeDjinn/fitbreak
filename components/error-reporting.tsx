"use client";

import { useEffect } from "react";
import { getRollbar } from "@/lib/error-reporting";

/** Starts browser error reporting once the page is idle. Renders nothing. */
export function ErrorReporting() {
  useEffect(() => {
    const start = () => void getRollbar();
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 2000);
    return () => clearTimeout(id);
  }, []);
  return null;
}
