import { expect, test } from "@playwright/test";
import { apiOrigin } from "./support/demo-api";
import { adminOrigin, studentOrigin } from "./support/origins";
import { signIn, expireStudentAccess, studentAccess } from "./support/session-browser";
import { openPrintView } from "./support/print-view";

test.use({ viewport: { width: 390, height: 840 } });

test("student cookies stay HTTP-only, expire with tokens, and renew an SSR deep link", async ({
  page,
  context,
}) => {
  await signIn(page);
  const cookies = (await context.cookies(studentOrigin)).filter(({ name }) =>
    name.startsWith("uemp_student_"),
  );
  expect(cookies.map(({ name }) => name).sort()).toEqual([
    "uemp_student_access",
    "uemp_student_access_expires",
    "uemp_student_refresh",
    "uemp_student_refresh_expires",
  ]);
  for (const cookie of cookies) {
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("Lax");
    expect(cookie.path).toBe("/");
    expect(cookie.expires).toBeGreaterThan(Date.now() / 1000);
  }
  for (const kind of ["access", "refresh"]) {
    const token = cookies.find(({ name }) => name === "uemp_student_" + kind);
    const expiry = cookies.find(
      ({ name }) => name === "uemp_student_" + kind + "_expires",
    );
    expect(token).toBeDefined();
    expect(expiry).toBeDefined();
    expect(Math.abs((token?.expires ?? 0) * 1000 - Number(expiry?.value))).toBeLessThan(
      1001,
    );
  }
  expect(await page.evaluate(() => document.cookie)).not.toContain("uemp_student_");
  expect(
    await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage })),
  ).not.toContain("eyJ");
  const original = await studentAccess(context);
  const denied = await context.request.post(studentOrigin + "/api/auth/refresh", {
    headers: { Origin: adminOrigin },
  });
  expect(denied.status()).toBe(403);
  expect((await studentAccess(context)) === original).toBe(true);

  await page.goto(studentOrigin + "/results");
  const href = await page
    .getByRole("region", { name: "Result statements" })
    .getByRole("link")
    .first()
    .getAttribute("href");
  expect(href).toBeTruthy();
  await expireStudentAccess(context);
  await page.goto(studentOrigin + href + "?view=statement");
  await expect(
    page.getByRole("heading", { name: "Result statement", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(studentOrigin + href + "?view=statement");
  expect((await studentAccess(context)) !== original).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain("uemp_student_");

  await expireStudentAccess(context);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog", { name: "Navigation" })
    .getByRole("link", { name: "My profile", exact: true })
    .click();
  await expect(page.getByLabel("First name")).toBeVisible();
  await expect(page).toHaveURL(studentOrigin + "/account");

  let interrupted = false;
  await page.route(studentOrigin + "/api/auth/refresh", (route) => {
    if (interrupted) return route.continue();
    interrupted = true;
    return route.fulfill({
      status: 503,
      json: { statusCode: 503, message: "Please try again shortly." },
    });
  });
  await expireStudentAccess(context);
  await page.goto(studentOrigin + "/account");
  await expect(
    page.getByRole("alert").filter({ hasText: "Please try again shortly." }),
  ).toBeVisible();
  expect(
    (await context.cookies(studentOrigin)).some(
      ({ name }) => name === "uemp_student_refresh",
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByLabel("First name")).toBeVisible();
  await expect(page).toHaveURL(studentOrigin + "/account");
});

test("two student tabs renew shared cookies without losing their destinations", async ({
  page,
  context,
}) => {
  await signIn(page);
  const other = await context.newPage();
  await other.goto(studentOrigin + "/account");
  await expireStudentAccess(context);
  await Promise.all([
    page.goto(studentOrigin + "/account?tab=one"),
    other.goto(studentOrigin + "/results?tab=two"),
  ]);
  await expect(page.getByLabel("First name")).toBeVisible();
  await expect(other.getByRole("region", { name: "Cumulative GPA" })).toBeVisible();
  await expect(page).toHaveURL(studentOrigin + "/account?tab=one");
  await expect(other).toHaveURL(studentOrigin + "/results?tab=two");
  await Promise.all([page.reload(), other.reload()]);
  await expect(page.getByLabel("First name")).toBeVisible();
  await expect(other.getByRole("region", { name: "Cumulative GPA" })).toBeVisible();
});

test("profile writes and print views renew cookies after access expiry", async ({
  page,
  context,
}) => {
  await signIn(page);
  await page.goto(studentOrigin + "/account");
  const original = await studentAccess(context);
  await expireStudentAccess(context);
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Your profile was updated.")).toBeVisible();
  expect((await studentAccess(context)) !== original).toBe(true);
  await page.goto(studentOrigin + "/results");
  await page
    .getByRole("region", { name: "Result statements" })
    .getByRole("link")
    .first()
    .click();
  const beforePrint = await studentAccess(context);
  await expireStudentAccess(context);
  const view = await openPrintView(page, "Print result statement");
  await expect(view).toHaveURL(/\/results\/[\da-f-]+\/print$/);
  expect((await studentAccess(context)) !== beforePrint).toBe(true);
  await view.close();
});

test("revoked student credentials clear cookies and cannot redirect outside the portal", async ({
  page,
  context,
  request,
}) => {
  await signIn(page);
  const login = await request.post(apiOrigin + "/v1/auth/sign-in", {
    data: {
      email: "student-maya@demo.example.test",
      password: process.env["UEMP_E2E_PASSWORD"],
      role: "student",
    },
  });
  expect(login.status()).toBe(200);
  await page.goto(studentOrigin + "/account");
  await expect(page).toHaveURL(studentOrigin + "/sign-in");
  expect(
    (await context.cookies(studentOrigin)).some(({ name }) =>
      name.startsWith("uemp_student_"),
    ),
  ).toBe(false);
  await signIn(page);
  await expireStudentAccess(context);
  await page.goto(
    studentOrigin +
      "/session/refresh?returnTo=" +
      encodeURIComponent("//example.test/escape"),
  );
  await expect(page).toHaveURL(studentOrigin + "/overview");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(studentOrigin + "/sign-in");
  expect(
    (await context.cookies(studentOrigin)).some(({ name }) =>
      name.startsWith("uemp_student_"),
    ),
  ).toBe(false);
});

test("staff concurrent reads proactively share one refresh before sending expired credentials", async ({
  page,
}) => {
  await signIn(page, true);
  await page.evaluate(() => {
    const session = JSON.parse(sessionStorage.getItem("uemp:staff:session") ?? "null");
    session.tokens.access.expiresAt = Date.now() + 4 * 60 * 1000;
    sessionStorage.setItem("uemp:staff:session", JSON.stringify(session));
  });
  let refreshes = 0;
  let renewals = 0;
  page.on("request", (request) => {
    if (request.url() === apiOrigin + "/v1/auth/refresh" && request.method() === "POST")
      refreshes += 1;
  });
  page.on("response", (response) => {
    if (response.url().startsWith(apiOrigin + "/v1/") && response.status() === 401)
      renewals += 1;
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Staff overview", exact: true }),
  ).toBeVisible();
  expect(refreshes).toBe(1);
  expect(renewals).toBe(0);
});

test("staff retries a rejected access token once and clears a failed refresh", async ({
  page,
}) => {
  await signIn(page, true);
  let rejected = false;
  let refreshes = 0;
  await page.route(apiOrigin + "/v1/users/me", async (route) => {
    if (rejected) return route.continue();
    rejected = true;
    return route.fulfill({
      status: 401,
      json: { statusCode: 401, message: "Please sign in again." },
      headers: { "access-control-allow-origin": adminOrigin },
    });
  });
  page.on("request", (request) => {
    if (request.url() === apiOrigin + "/v1/auth/refresh" && request.method() === "POST")
      refreshes += 1;
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Staff overview", exact: true }),
  ).toBeVisible();
  expect(refreshes).toBe(1);
  await page.evaluate(() => {
    const session = JSON.parse(sessionStorage.getItem("uemp:staff:session") ?? "null");
    session.tokens.access.expiresAt = Date.now() - 1000;
    sessionStorage.setItem("uemp:staff:session", JSON.stringify(session));
  });
  await page.route(apiOrigin + "/v1/auth/refresh", (route) =>
    route.fulfill({
      status: 401,
      json: { statusCode: 401, message: "Sign in again." },
      headers: { "access-control-allow-origin": adminOrigin },
    }),
  );
  await page.reload();
  await expect(page).toHaveURL(adminOrigin + "/sign-in");
  expect(
    await page.evaluate(() => sessionStorage.getItem("uemp:staff:session")),
  ).toBeNull();
});

for (const failure of ["server error", "network failure"] as const) {
  test("staff sign-out clears its tab session during " + failure, async ({ page }) => {
    await signIn(page, true);
    await page.route(apiOrigin + "/v1/auth/sign-out", (route) =>
      failure === "network failure"
        ? route.abort("failed")
        : route.fulfill({
            status: 503,
            json: { message: "Try again shortly." },
            headers: { "access-control-allow-origin": adminOrigin },
          }),
    );
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(adminOrigin + "/sign-in");
    expect(
      await page.evaluate(() => sessionStorage.getItem("uemp:staff:session")),
    ).toBeNull();
    await page.goto(adminOrigin + "/overview");
    await expect(page).toHaveURL(adminOrigin + "/sign-in");
  });
}
