import { defineConfig } from "@playwright/test";

// End-to-end tests run against the production build (`pnpm build` first), in the Edge installed on the machine.
//   pnpm test:e2e
const port = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    channel: "msedge",
    locale: "ar",
  },
  projects: [
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `pnpm start --port ${port}`,
    url: `http://localhost:${port}/parse`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
