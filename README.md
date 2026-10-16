# FitBreak by BestFitTips

A free micro-movement break website. Choose 2, 5 or 10 minutes, where you are, what needs a reset
and the pace, then press **Start my break** for a guided, exactly-timed session. No account, no
equipment, no network services.

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Production build:

```bash
pnpm build && pnpm start
```

## Checks

```bash
pnpm typecheck      # next typegen + tsc --noEmit (strict)
pnpm lint           # ESLint (next/core-web-vitals + typescript)
pnpm test           # Vitest: generator + session clock (460 tests)
pnpm test:e2e       # Playwright: builds, starts on :3200, desktop + mobile projects, incl. axe a11y scan
                    # first run only: npx playwright install chromium
```

Screenshots: start a production server on :3200, then `node scripts/screenshots.mjs screenshots`.

## How it's built

- **Next.js 16 App Router**, TypeScript strict, Tailwind CSS 4, Lucide icons. Cache Components on.
- `lib/exercises.ts`: 30 hand-written, low-intensity movements with typed metadata.
- `lib/routine-generator.ts`: deterministic generation (FNV-1a hash + mulberry32 PRNG seeded by
  config + `variation`), hard constraints (location, seated-only, intensity), focus preference with
  full-body fillers, gentle first and last moves, no back-to-back repeats, and self-validation.
- `lib/session-clock.ts`: UI-independent clock on `performance.now()`. The redraw interval only reads it.
- `lib/routine-params.ts`: compact, validated query strings (`/session?d=5&l=desk&f=full&i=gentle&s=0&v=0`).
- `lib/preferences.ts`: last choices in `localStorage` (try/catch everywhere).
- `lib/analytics.ts`: typed event contract with **no network calls**. Use `registerAnalyticsAdapter()`
  to plug in a consent-compliant provider later.

## Environment

None required. When deploying, set `NEXT_PUBLIC_SITE_URL` to the verified production origin so
`sitemap.xml`, `robots.txt` and canonical URLs are absolute and correct (it defaults to `http://localhost:3000`).

Design rationale: `docs/design/DECISIONS.md`. Original brief: `docs/source/`.

## Deploys

Hosted on Vercel (`ledjinns-projects/fitbreak`), connected to `github.com/LeDjinn/fitbreak`:

- push to `main` → production deploy at https://fitbreak.vercel.app
- push any other branch / open a PR → preview deploy with its own URL

Smoke-test a deployment: `PLAYWRIGHT_BASE_URL=<url> pnpm test:e2e`.
