"use client";

import type Rollbar from "rollbar";
import { privateUrl } from "./url-privacy";

/**
 * Browser error reporting via Rollbar (provisioned through the Vercel Marketplace).
 * The SDK is loaded lazily after the page is idle so it never delays first paint.
 *
 * Privacy: no IP, email or username; no click, input, network or navigation
 * telemetry; URLs reduced with privateUrl(). Reports only the error itself.
 */

// Env var names exactly as created by the Rollbar integration.
const TOKEN = process.env.NEXT_PUBLIC_ROLLBAR_FITBREAK_CLIENT_TOKEN_1792183056;
const ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development";

let instance: Promise<Rollbar | null> | null = null;

function sanitize(data: Record<string, unknown>) {
  const request = data.request as { url?: string; query_string?: string } | undefined;
  if (request?.url) request.url = privateUrl(request.url);
  if (request) delete request.query_string;
  if (typeof data.context === "string") data.context = privateUrl(data.context);
}

export function getRollbar(): Promise<Rollbar | null> {
  if (!TOKEN || ENVIRONMENT === "development" || typeof window === "undefined") return Promise.resolve(null);
  instance ??= import("rollbar")
    .then(
      ({ default: RollbarCtor }) =>
        new RollbarCtor({
          accessToken: TOKEN,
          environment: ENVIRONMENT,
          codeVersion: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
          captureUncaught: true,
          captureUnhandledRejections: true,
          captureIp: false,
          captureEmail: false,
          captureUsername: false,
          scrubTelemetryInputs: true,
          autoInstrument: { log: true, network: false, dom: false, navigation: false, connectivity: false, contentSecurityPolicy: false },
          maxItems: 50,
          itemsPerMinute: 10,
          ignoredMessages: [/ResizeObserver loop/],
          transform: (data) => sanitize(data as Record<string, unknown>),
        }),
    )
    .catch(() => null);
  return instance;
}

export function reportError(error: unknown, extra?: Record<string, string | undefined>): void {
  void getRollbar().then((rollbar) => {
    if (!rollbar) return;
    rollbar.error(error instanceof Error ? error : String(error), extra ?? {});
  });
}
