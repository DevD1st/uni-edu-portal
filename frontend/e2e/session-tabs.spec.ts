import { expect, test } from "@playwright/test";
import { apiOrigin } from "./support/demo-api";
import { adminOrigin, studentOrigin } from "./support/origins";
import {
  expireStaffAccess,
  expireStudentAccess,
  signIn,
  staffTokens,
} from "./support/session-browser";

test.use({ viewport: { width: 390, height: 840 } });

test("staff tabs isolate different accounts, refresh, and logout", async ({
  page,
  context,
  request,
}) => {
  await signIn(page, true);
  const first = await staffTokens(page);
  const other = await context.newPage();
  await other.goto(adminOrigin + "/overview");
  await expect(other).toHaveURL(adminOrigin + "/sign-in");
  expect(await staffTokens(other)).toBeNull();
  await signIn(other, true, "hod");
  await expireStaffAccess(other);
  await other.reload();
  await expect(
    other.getByRole("heading", { name: "Staff overview", exact: true }),
  ).toBeVisible();
  expect((await staffTokens(page))?.access.token === first?.access.token).toBe(true);
  await other.getByRole("button", { name: "Sign out" }).click();
  await expect(other).toHaveURL(adminOrigin + "/sign-in");
  expect(await staffTokens(other)).toBeNull();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Staff overview", exact: true }),
  ).toBeVisible();
  const active = await staffTokens(page);
  const me = await request.get(apiOrigin + "/v1/users/me", {
    headers: { Authorization: "Bearer " + active?.access.token },
  });
  expect(me.status()).toBe(200);
  expect((await me.json()).email).toBe("lecturer@demo.example.test");
});

test("a duplicated staff tab loses stale credentials without clearing the renewed tab", async ({
  page,
}) => {
  await signIn(page, true);
  const copied = await staffTokens(page);
  const popup = page.waitForEvent("popup");
  await page.evaluate(() => {
    window.open("/overview", "_blank");
  });
  const other = await popup;
  await expect(
    other.getByRole("heading", { name: "Staff overview", exact: true }),
  ).toBeVisible();
  expect((await staffTokens(other))?.access.token === copied?.access.token).toBe(true);
  await expireStaffAccess(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Staff overview", exact: true }),
  ).toBeVisible();
  expect((await staffTokens(page))?.access.token !== copied?.access.token).toBe(true);
  await other.reload();
  await expect(other).toHaveURL(adminOrigin + "/sign-in");
  expect(await staffTokens(other)).toBeNull();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Staff overview", exact: true }),
  ).toBeVisible();
});

test("logout from an older staff tab cannot revoke a newer sign-in", async ({
  page,
  context,
}) => {
  await signIn(page, true);
  const other = await context.newPage();
  await signIn(other, true);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(adminOrigin + "/sign-in");
  expect(await staffTokens(page)).toBeNull();
  await other.reload();
  await expect(
    other.getByRole("heading", { name: "Staff overview", exact: true }),
  ).toBeVisible();
  expect(await staffTokens(other)).not.toBeNull();
});

test("student logout clears shared cookies and ends the other tab's access", async ({
  page,
  context,
  request,
}) => {
  await signIn(page);
  const other = await context.newPage();
  await other.goto(studentOrigin + "/account");
  const original = (await context.cookies(studentOrigin)).find(
    ({ name }) => name === "uemp_student_access",
  );
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(studentOrigin + "/sign-in");
  await other.reload();
  await expect(other).toHaveURL(studentOrigin + "/sign-in");
  expect(
    (await context.cookies(studentOrigin)).some(({ name }) =>
      name.startsWith("uemp_student_"),
    ),
  ).toBe(false);
  const old = await request.get(apiOrigin + "/v1/users/me", {
    headers: { Authorization: "Bearer " + original?.value },
  });
  expect(old.status()).toBe(401);
});

test("student logout waits for another tab's renewal and cannot restore its cookies", async ({
  page,
  context,
}) => {
  await signIn(page);
  const other = await context.newPage();
  await other.goto(studentOrigin + "/account");
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let seen = () => {};
  const started = new Promise<void>((resolve) => {
    seen = resolve;
  });
  await page.route(studentOrigin + "/api/auth/refresh", async (route) => {
    seen();
    await held;
    await route.continue();
  });
  await expireStudentAccess(context);
  await page.goto(studentOrigin + "/account");
  await started;
  let signingOut = false;
  other.on("request", (request) => {
    if (request.url() === studentOrigin + "/api/auth/sign-out") signingOut = true;
  });
  await other.getByRole("button", { name: "Sign out" }).click();
  expect(signingOut).toBe(false);
  release();
  // Let renewal leave its temporary page before checking the logged-out tab again.
  await Promise.all([
    other.waitForURL(studentOrigin + "/sign-in", { waitUntil: "domcontentloaded" }),
    page.waitForURL((url) => ["/account", "/sign-in"].includes(url.pathname), {
      waitUntil: "domcontentloaded",
    }),
  ]);
  await page.goto(studentOrigin + "/account");
  await expect(page).toHaveURL(studentOrigin + "/sign-in");
  expect(
    (await context.cookies(studentOrigin)).some(({ name }) =>
      name.startsWith("uemp_student_"),
    ),
  ).toBe(false);
});

test("expired student refresh cookies fail without exposing or renewing credentials", async ({
  page,
  context,
}) => {
  await signIn(page);
  await expireStudentAccess(context);
  await context.clearCookies({ name: /^uemp_student_refresh/ });
  const response = await context.request.post(studentOrigin + "/api/auth/refresh", {
    headers: { Origin: studentOrigin },
  });
  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.text()).not.toContain("eyJ");
  expect(
    (await context.cookies(studentOrigin)).some(({ name }) =>
      name.startsWith("uemp_student_"),
    ),
  ).toBe(false);
  await page.goto(studentOrigin + "/account");
  await expect(page).toHaveURL(studentOrigin + "/sign-in");
});
