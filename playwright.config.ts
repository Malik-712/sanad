import { defineConfig } from "@playwright/test";

// End-to-end tests run against the production build (`pnpm build` first), in the Edge installed on the machine.
//   pnpm test:e2e
//   BASE_URL=https://sanad-pi-five.vercel.app pnpm test:e2e     (the live site; no local server)
const port = 3100;
const remote = process.env.BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: remote ?? `http://localhost:${port}`,
    channel: "msedge",
    locale: "ar",
  },
  projects: [
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } },
  ],
  ...(remote
    ? {}
    : {
        webServer: {
          command: `pnpm start --port ${port}`,
          url: `http://localhost:${port}/parse`,
          reuseExistingServer: true,
          timeout: 60_000,
        },
      }),
});
