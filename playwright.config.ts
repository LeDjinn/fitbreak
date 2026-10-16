import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
// Set PLAYWRIGHT_BASE_URL to test a deployed site (e.g. https://fitbreak.vercel.app) instead of a local build.
const remote = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: remote ?? `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
  // Tests run against the production build.
  webServer: remote
    ? undefined
    : {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 300_000,
        reuseExistingServer: !process.env.CI,
      },
});
