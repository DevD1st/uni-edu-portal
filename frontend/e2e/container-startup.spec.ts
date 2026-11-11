import { expect, test } from "@playwright/test";
import { apiOrigin } from "./support/demo-api";
import { studentOrigin, adminOrigin } from "./support/origins";

test("production portals expose readiness, SPA routes, and correctly cached assets", async ({
  request,
}) => {
  test.skip(
    process.env["UEMP_E2E_PRODUCTION"] !== "1",
    "This checks production container delivery.",
  );
  const [api, student, admin] = await Promise.all([
    request.get(apiOrigin + "/health/ready"),
    request.get(studentOrigin + "/health/ready"),
    request.get(adminOrigin + "/health/ready"),
  ]);
  for (const result of [api, student, admin]) expect(result.status()).toBe(200);
  expect(await student.json()).toEqual({ status: "ok" });
  expect(await admin.json()).toEqual({ status: "ok" });
  expect(student.headers()["cache-control"]).toContain("no-store");
  for (const origin of [studentOrigin, adminOrigin]) {
    const license = await request.get(origin + "/licenses/source-sans-3.txt");
    expect(license.status()).toBe(200);
    expect(await license.text()).toContain("SIL OPEN FONT LICENSE");
  }

  const route = await request.get(adminOrigin + "/workspaces/result-review");
  expect(route.status()).toBe(200);
  expect(route.headers()["content-type"]).toContain("text/html");
  expect(route.headers()["cache-control"]).toContain("no-cache");
  const html = await route.text();
  const script = /src="([^"]+\.js)"/.exec(html)?.[1];
  if (!script)
    throw new Error("The staff app shell must reference a JavaScript bundle.");
  const bundle = await request.get(new URL(script, adminOrigin).href);
  expect(bundle.status()).toBe(200);
  expect(bundle.headers()["content-type"]).toContain("javascript");
  expect(bundle.headers()["cache-control"]).toContain("immutable");
  const missing = await request.get(adminOrigin + "/assets/missing.js");
  expect(missing.status()).toBe(404);
});
