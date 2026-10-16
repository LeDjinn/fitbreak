"use client";

import { track as vercelTrack } from "@vercel/analytics";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { useEffect } from "react";
import { registerAnalyticsAdapter } from "@/lib/analytics";
import { privateUrl } from "@/lib/url-privacy";

export function cleanUrl(event: BeforeSendEvent): BeforeSendEvent {
  return { ...event, url: privateUrl(event.url) };
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
