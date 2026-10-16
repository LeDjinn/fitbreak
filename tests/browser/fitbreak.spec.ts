import { expect, test, type Page } from "@playwright/test";

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

const option = (page: Page, text: string | RegExp) => page.locator("label").filter({ hasText: text });
const planItems = (page: Page) => page.getByRole("list", { name: "Movements in this break" }).getByRole("listitem");
const mainStart = (page: Page) => page.locator("#builder form").getByRole("link", { name: /Start my break/ });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("fitbreak:test-init")) {
      localStorage.clear();
      sessionStorage.setItem("fitbreak:test-init", "1");
    }
  });
});

test("homepage loads with the builder and a live 5-minute preview", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Feel better in five minutes.");
  await expect(page.getByRole("radio", { name: /5 min/ })).toBeChecked();
  await expect(planItems(page)).toHaveCount(5);
  await expect(page.getByLabel("5 minutes")).toHaveText("05:00");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("US-1: defaults start a 5-minute break in one click", async ({ page }) => {
  await page.goto("/");
  await mainStart(page).click();
  await expect(page).toHaveURL(/\/session\?d=5&l=desk&f=full&i=gentle&s=0&v=0/);
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 1 of 5/i);
  await expect(page.getByTestId("pause-resume")).toHaveText(/Pause/);
});

test("2 min + seated + neck focus gives a valid seated preview", async ({ page }) => {
  await page.goto("/");
  await option(page, "2 min").click();
  await option(page, "Neck & shoulders").click();
  await page.getByRole("switch", { name: "Stay seated throughout" }).click();
  await expect(page.getByRole("switch", { name: "Stay seated throughout" })).toHaveAttribute("aria-checked", "true");
  await expect(planItems(page)).toHaveCount(4);
  await expect(page.getByLabel("2 minutes")).toHaveText("02:00");
  // Standing moves carry a hidden "(standing)" label; none may appear.
  await expect(planItems(page).filter({ hasText: "(standing)" })).toHaveCount(0);
  await expect(mainStart(page)).toHaveAttribute("href", /d=2&l=desk&f=neck-shoulders&i=gentle&s=1/);
});

test("changing an input changes the actual routine, and shuffle varies it", async ({ page }) => {
  await page.goto("/");
  const names = async () => (await planItems(page).allInnerTexts()).join("|");
  const before = await names();
  await option(page, "Lower-body reset").click();
  await expect.poll(names).not.toBe(before);
  const lower = await names();
  await page.getByRole("button", { name: "Shuffle" }).click();
  await expect.poll(names).not.toBe(lower);
});

test("start → pause → resume → next → exit, then preferences persist", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await option(page, "2 min").click();
  await option(page, "Energy reset").click();
  await mainStart(page).click();
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 1 of 4/i);

  const pause = page.getByTestId("pause-resume");
  await pause.click();
  await expect(pause).toHaveText(/Resume/);
  const frozen = await page.getByTestId("session-timer").innerText();
  await page.waitForTimeout(1500);
  await expect(page.getByTestId("session-timer")).toHaveText(frozen);
  await pause.click();
  await expect(pause).toHaveText(/Pause/);

  const firstTitle = await page.getByTestId("session-title").innerText();
  await page.getByRole("button", { name: /Next/ }).click();
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 2 of 4/i);
  await expect(page.getByTestId("session-title")).not.toHaveText(firstTitle);

  await page.getByRole("button", { name: "Exit" }).click();
  const dialog = page.getByRole("dialog", { name: "Leave this break?" });
  await expect(dialog).toBeVisible();
  await expect(pause).toHaveText(/Resume/); // paused while deciding
  await dialog.getByRole("button", { name: "Leave" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.reload();
  await expect(page.getByRole("radio", { name: /2 min/ })).toBeChecked();
  await expect(page.getByRole("radio", { name: /Energy reset/ })).toBeChecked();
  await expect(page.getByText(/Welcome back/)).toBeVisible();

  await page.getByRole("button", { name: "Reset choices" }).click();
  await expect(page.getByRole("radio", { name: /5 min/ })).toBeChecked();
  expect(errors).toEqual([]);
});

test("Keep going resumes the break; Escape opens the leave dialog", async ({ page }) => {
  await page.goto("/session?d=5&l=home&f=full&i=energizing&s=0&v=0");
  await expect(page.getByTestId("pause-resume")).toHaveText(/Pause/);
  await page.keyboard.press("Escape");
  const dialog = page.getByRole("dialog", { name: "Leave this break?" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Keep going" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("pause-resume")).toHaveText(/Pause/);
});

test("keyboard: Space pauses and resumes, arrows move between steps", async ({ page }) => {
  await page.goto("/session?d=5&l=desk&f=full&i=gentle&s=0&v=0");
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 1 of 5/i);
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.press("Space");
  await expect(page.getByTestId("pause-resume")).toHaveText(/Resume/);
  await page.keyboard.press("Space");
  await expect(page.getByTestId("pause-resume")).toHaveText(/Pause/);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 2 of 5/i);
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 1 of 5/i);
});

test("a preset page launches its exact configuration", async ({ page }) => {
  await page.goto("/routines");
  await page.getByRole("link", { name: /seated reset/i }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("2-minute seated reset");
  await page.getByRole("link", { name: /Start this break/ }).click();
  await expect(page).toHaveURL(/d=2&l=desk&f=neck-shoulders&i=gentle&s=1&v=0&p=2-minute-seated-reset/);
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 1 of 4/i);
});

test("completing a break shows the finish screen, and Repeat restarts it", async ({ page }) => {
  await page.clock.install();
  await page.goto("/session?d=2&l=desk&f=full&i=gentle&s=0&v=0");
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 1 of 4/i);
  await page.clock.runFor(60_000);
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 3 of 4/i);
  await page.clock.runFor(61_000);
  await expect(page.getByRole("heading", { name: "Nice work. You're back." })).toBeVisible();
  await expect(page.getByText(/You finished your 2-minute break\./)).toBeVisible();
  await page.getByRole("button", { name: "Repeat" }).click();
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 1 of 4/i);
});

test("a hidden tab keeps real time (no lost minutes)", async ({ page }) => {
  await page.clock.install();
  await page.goto("/session?d=5&l=desk&f=full&i=gentle&s=0&v=0");
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 1 of 5/i);
  // Simulate a throttled background tab: time passes with no timers firing.
  await page.clock.fastForward(125_000);
  await page.clock.runFor(300);
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 3 of 5/i);
});

test("invalid links fall back safely with a notice", async ({ page }) => {
  await page.goto("/session?d=7&l=moon&f=full&i=gentle&s=0&v=0");
  await expect(page.getByText(/weren.t recognised/)).toBeVisible();
  await expect(page.getByTestId("session-kicker")).toHaveText(/Movement 1 of 5/i);
});

test("no horizontal overflow on key pages", async ({ page }) => {
  for (const path of ["/", "/routines", "/routines/10-minute-home-movement", "/about", "/privacy", "/session?d=10&l=home&f=energy&i=energizing&s=0&v=0"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true);
  }
});
