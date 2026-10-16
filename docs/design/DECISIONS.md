# FitBreak: design decisions

Starting point: a self-contained HTML design preview from the project brief (kept privately, not in this repo).
Goal: keep its core idea, a refined editorial page built around a large configurator and a live
dark preview, and turn it into a real component system that is accessible and works on phones.

## Personality
Calm, warm and grounded. Warm off-white paper, deep evergreen ink, one optimistic lime accent used
sparingly: CTAs, the live dot, timer progress. It shouldn't feel like a gym app, a dashboard or a clinic.

## Typography
- **Display:** Bricolage Grotesque (self-hosted via `next/font`), set tight at -0.045 to -0.055em for
  headlines, timers and numbers. It has an editorial, slightly human character.
- **Body:** Inter, for neutral and highly legible UI text.
- If the fonts can't load, both fall back to the system UI stack (`ui-sans-serif, system-ui, Segoe UI…`)
  and the layout stays intact because nothing depends on font metrics.

## Tokens (`app/globals.css` → `@theme`)
| Token | Value | Use |
|---|---|---|
| canvas | `#F7F7F2` | page background |
| cream / paper | `#FCFAF5` / `#FFFFFF` | cards / controls |
| ink | `#153532` | primary text, dark panel |
| muted | `#5B6F6B` | secondary text (≥ 4.8:1 on canvas) |
| subtle | `#5F706A` | tertiary text (≥ 4.6:1); darkened from the preview after an axe scan |
| leaf | `#367556` | small green labels (≥ 4.9:1); darkened from `#4D9A72` for contrast |
| mint / mint-soft / mint-deep | `#CEF3DF` / `#E8F6EC` / `#2C7658` | selection, illustration discs |
| lime / lime-deep | `#D9F286` / `#C5E566` | action accent; only on dark or as fill behind ink text |
| panel / panel-2 | `#153532` / `#1C4440` | preview card, session, dialog |
| on-panel / on-panel-muted | `#F3F8F2` / `#A9C6B8` | text on dark (7.2:1 for muted) |
| radius-card / radius-control | 28px / 14px | |

## Improvements over the preview
- **Real form semantics.** Every choice is a native radio inside a `fieldset`/`legend`, so arrow
  keys, screen readers and form behaviour come for free. "Stay seated" is a `role="switch"`.
- **Preview shows what you'll actually do.** It shows every movement with a mini illustration, its
  one-line instruction (5-move breaks) and a time-allocation bar (movement versus reset gap), plus
  "You'll use: a sturdy chair / a clear wall" and substitution notes.
- **Start button near the fold.** At 1440×900 the form's Start button lands just below the fold,
  so a floating "Start my break" pill appears whenever the main button is off-screen while you're in
  the builder. On mobile it's a full-width bottom bar.
- **Original illustrations.** There are 30 movement figures (`components/movement-illustration.tsx`),
  tweened A → B → A with SMIL (no JS, and it works in Safari). They're static when you prefer reduced
  motion, when paused, and in lists. See "Illustration style" below.
- **Session as its own focused page** (`/session`) instead of an overlay: a progress ring around the
  illustration, a large tabular timer, a "How to do it" step list, segmented overall progress,
  sticky thumb-reach controls on mobile, and a native `<dialog>` for "Leave this break?" (focus
  lands on the safe "Keep going").
- **Completion:** an original celebratory figure, "Nice work. You're back.", Repeat / New break /
  Copy share link, plus an honest note if you skipped ahead. There are no fake stats.

## Illustration style (v2, Oct 2026)
One original character, drawn from a joint skeleton (`Pose`: head, neck, pelvis, elbows, hands,
knees, ankles, toes). Each body part is a thick round-capped line or a circle, so any pose can tween.
- **Palette:** skin `#E2A57F`, hair `#27303A`, shirt = mint-deep `#2C7658`, trousers `#1D3F3B`,
  shoes `#F7F7F2`. Far-side limbs use deeper shades in side views. Front views (`view: "front"`)
  get shoulder and hip width, with the same colours on both sides.
- **Props:** mint-green filled chair (side, front, support) and wall; a soft floor shadow.
- **Discs:** figures sit on mint `#CEF3DF` circles everywhere (preview, routine pages, player, completion).
- **Adding a movement:** define poses `a` (and optionally `b`) and pick a view and props. No drawing
  tools are needed, so it's easy to extend weekly.

## Component inventory
`site-header`, `site-footer`, `brand` (mark + wordmark), `segmented-field` (+ `ToggleRow`),
`routine-builder`, `routine-preview`, `movement-illustration`, `routine-step-list`,
`session-from-params`, `session-player`, `session-controls`, `completion-screen`, `prose-page`,
`track-view`.

## Key screen states (see `/screenshots`)
Home default (desktop and mobile), home with 10 min + lower body + seated, session movement,
session rest between moves ("Up next"), session paused, leave dialog, completion (desktop and
mobile), routines index, preset page, and home at 320px.

## Timing and clock decisions
- Templates: 2 min = 4 × (25 s + 5 s); 5 min = 5 × (50 s + 10 s); 10 min = 10 × (50 s + 10 s).
  The **final transition is kept** and shown as "Cool down · Breathe and finish" with a breathing
  figure, so the clock always reads exactly 2:00 / 5:00 / 10:00.
- **Background tabs:** a running break keeps running on the monotonic clock while hidden. When you
  return, the screen shows the true position (or the completion screen), and a notice says how long
  you were away. We chose this over auto-pause because people often switch tabs while doing a
  seated move, and a kitchen-timer model is the least surprising.
- **Previous:** in the first 3 s of a movement it goes to the previous movement; otherwise it restarts
  the current one.
- **Active time** excludes pauses and skipped time, so the completion copy never overstates what you did.
- Sound is **off by default** every session, and is only enabled by clicking "Sound off" (a gesture).

## Motion
Only short CSS transitions (≤ 300 ms), the list rise-in and the SMIL figures. `prefers-reduced-motion`
disables CSS animation globally, and the player stops figure animation via `useReducedMotion()`.
Meaning never depends on animation.
