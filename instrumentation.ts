import type { Instrumentation } from "next";

/**
 * Server errors → Rollbar. Only the error, route and a privacy-reduced path are
 * sent: no headers, cookies, IPs or bodies.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const token = process.env.ROLLBAR_FITBREAK_SERVER_TOKEN_1792183056;
  if (process.env.NEXT_RUNTIME !== "nodejs" || !token) return;

  const [{ default: Rollbar }, { privateUrl }] = await Promise.all([import("rollbar"), import("./lib/url-privacy")]);
  const rollbar = new Rollbar({
    accessToken: token,
    environment: process.env.VERCEL_ENV ?? "development",
    codeVersion: process.env.VERCEL_GIT_COMMIT_SHA,
    captureIp: false,
    captureEmail: false,
    captureUsername: false,
  });
  const digest = typeof err === "object" && err !== null && "digest" in err ? String(err.digest) : undefined;
  rollbar.error(err instanceof Error ? err : String(err), {
    path: privateUrl(request.path),
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    digest,
  });
  // Serverless functions can freeze right after responding: flush before returning.
  await new Promise<void>((resolve) => rollbar.wait(() => resolve()));
};
