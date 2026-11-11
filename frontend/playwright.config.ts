import { defineConfig } from "@playwright/test";
import { studentOrigin, adminOrigin } from "./e2e/support/origins";

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
  webServer:
    process.env["UEMP_E2E_EXTERNAL"] === "1"
      ? []
      : [
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
