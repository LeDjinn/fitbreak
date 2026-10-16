// Usage: pnpm build && pnpm start --port 3200 & BASE=http://localhost:3200 node scripts/screenshots.mjs screenshots
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.env.BASE ?? "http://localhost:3200";
const out = process.argv[2] ?? "screenshots";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const problems = [];
const D = { width: 1440, height: 900 };
const M = { width: 390, height: 844 };
const SESSION = "/session?d=5&l=desk&f=full&i=gentle&s=0&v=0";

async function shot(name, path, viewport, { full = false, clock = false, act } = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    // Vercel Analytics' script only exists on Vercel; a local 404 is expected.
    if (m.location().url.includes("/_vercel/insights/")) return;
    if (m.type() === "error") problems.push(`${name}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`${name}: ${e.message}`));
  if (clock) await page.clock.install();
  await page.goto(base + path, { waitUntil: "networkidle" });
  if (act) await act(page);
  await page.waitForTimeout(400);
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) problems.push(`${name}: horizontal overflow`);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  await ctx.close();
}

const advance = (ms) => async (page) => {
  await page.clock.runFor(ms);
};

// Required review shots
await shot("home-desktop", "/", D);
await shot("home-mobile", "/", M);
await shot("session-desktop", SESSION, D, { clock: true, act: advance(14_000) });
await shot("session-mobile", SESSION, M, { clock: true, act: advance(14_000) });

// Extra states
await shot("home-desktop-full", "/", D, { full: true });
await shot("home-mobile-full", "/", M, { full: true });
await shot("home-desktop-10min-seated", "/", D, {
  act: async (page) => {
    await page.locator("label").filter({ hasText: "10 min" }).click();
    await page.locator("label").filter({ hasText: "Lower-body reset" }).click();
    await page.getByRole("switch", { name: "Stay seated throughout" }).click();
    await page.locator("#builder").scrollIntoViewIfNeeded();
  },
});
await shot("session-desktop-transition", SESSION, D, { clock: true, act: advance(53_000) });
await shot("session-mobile-paused", SESSION, M, {
  clock: true,
  act: async (page) => {
    await page.clock.runFor(20_000);
    await page.getByTestId("pause-resume").click();
  },
});
await shot("session-desktop-leave-dialog", SESSION, D, {
  clock: true,
  act: async (page) => {
    await page.clock.runFor(30_000);
    await page.getByRole("button", { name: "Exit" }).click();
  },
});
await shot("complete-desktop", "/session?d=2&l=desk&f=full&i=gentle&s=0&v=0", D, { clock: true, act: advance(121_000) });
await shot("complete-mobile", "/session?d=2&l=desk&f=full&i=gentle&s=0&v=0", M, { clock: true, act: advance(121_000) });
await shot("routines-desktop", "/routines", D, { full: true });
await shot("preset-mobile", "/routines/10-minute-home-movement", M, { full: true });
await shot("home-320", "/", { width: 320, height: 640 }, { full: true });

console.log(problems.length ? problems.join("\n") : "No console errors or overflow.");
await browser.close();
