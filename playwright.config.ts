import { defineConfig, devices } from "@playwright/test";

const testPort = Number(process.env.BURROW_PLAYWRIGHT_PORT ?? 3100);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${testPort}`,
    channel: "chrome",
    trace: "on-first-retry",
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next start -H 127.0.0.1 -p ${testPort}`,
    url: `http://127.0.0.1:${testPort}/play`,
    reuseExistingServer: false,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop",
      grep: /@browser/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      grep: /@mobile/,
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "mobile-full",
      grep: /@browser/,
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
});
