import { defineConfig } from "@playwright/test";

const studentOrigin = "http://localhost:3001";
const adminOrigin = "http://localhost:3002";
const channel = process.env["UEMP_PLAYWRIGHT_CHANNEL"];

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    ...(channel ? { channel } : {}),
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm --filter @uemp/student dev",
      url: studentOrigin + "/sign-in",
      timeout: 120_000,
      reuseExistingServer: !process.env["CI"],
    },
    {
      command: "pnpm --filter @uemp/admin dev",
      url: adminOrigin + "/sign-in",
      timeout: 120_000,
      reuseExistingServer: !process.env["CI"],
    },
  ],
});
