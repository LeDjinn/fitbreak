"use client";

import { useEffect } from "react";
import { track, type AnalyticsEventName, type AnalyticsProps } from "@/lib/analytics";

/** Fires one analytics event on mount. Renders nothing. */
export function TrackView({ name, props }: { name: AnalyticsEventName; props?: AnalyticsProps }) {
  const serialized = JSON.stringify(props ?? {});
  useEffect(() => {
    track(name, JSON.parse(serialized) as AnalyticsProps);
  }, [name, serialized]);
  return null;
}
