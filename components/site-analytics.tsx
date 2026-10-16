"use client";

import { track as vercelTrack } from "@vercel/analytics";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { useEffect } from "react";
import { registerAnalyticsAdapter } from "@/lib/analytics";

/** Only routine settings may leave the browser in a URL; anything else a visitor adds is dropped. */
const ALLOWED_PARAMS = new Set(["d", "l", "f", "i", "s", "p"]);

export function cleanUrl(event: BeforeSendEvent): BeforeSendEvent {
  try {
    const url = new URL(event.url);
    const kept = new URLSearchParams();
    if (url.pathname === "/session") {
      url.searchParams.forEach((value, key) => {
        if (ALLOWED_PARAMS.has(key)) kept.set(key, value);
      });
    }
    url.search = kept.toString();
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    return event;
  }
}

/**
 * Vercel Web Analytics: cookieless page views on every plan.
 * Custom events (break completed, paused, …) need Vercel Pro, so they stay off
 * unless NEXT_PUBLIC_ANALYTICS_CUSTOM_EVENTS=on.
 */
export function SiteAnalytics() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ANALYTICS_CUSTOM_EVENTS !== "on") return;
    return registerAnalyticsAdapter(({ name, props }) => {
      const properties: Record<string, string | number | boolean> = {};
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined) properties[key] = value;
      }
      vercelTrack(name, properties);
    });
  }, []);

  return <Analytics beforeSend={cleanUrl} />;
}
