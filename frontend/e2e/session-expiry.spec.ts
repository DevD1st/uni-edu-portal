import { expect, test } from "@playwright/test";
import { apiOrigin } from "./support/demo-api";
import { adminOrigin, studentOrigin } from "./support/origins";
import { signIn, staffTokens } from "./support/session-browser";

test("real access expiry renews both apps and real refresh expiry ends both sessions", async ({
  page,
  context,
  request,
}) => {
  test.skip(
    process.env["UEMP_E2E_LIVE_EXPIRY"] !== "1",
    "Use a disposable API with 61-second access and 75-second refresh lifetimes.",
  );
  test.setTimeout(240_000);
  await signIn(page);
  const staff = await context.newPage();
  await signIn(staff, true);
  await expect(
    staff
      .getByRole("region", { name: "Teaching dashboard" })
      .getByText("Assigned offerings", { exact: true }),
  ).toBeVisible();
  const oldStaff = await staffTokens(staff);
  const oldCookies = await context.cookies(studentOrigin);
  const oldStudent = oldCookies.find(
    ({ name }) => name === "uemp_student_access",
  )?.value;
  const expiresAt = Math.max(
    oldStaff?.access.expiresAt ?? 0,
    Number(
      oldCookies.find(({ name }) => name === "uemp_student_access_expires")?.value,
    ),
  );
  expect(expiresAt - Date.now()).toBeGreaterThan(0);
  expect(expiresAt - Date.now()).toBeLessThan(70_000);
  await expect
    .poll(() => Date.now() > expiresAt + 1100, { timeout: 75_000, intervals: [500] })
    .toBe(true);
  for (const token of [oldStudent, oldStaff?.access.token]) {
    const denied = await request.get(apiOrigin + "/v1/users/me", {
      headers: { Authorization: "Bearer " + token },
    });
    expect(denied.status()).toBe(401);
  }
  await Promise.all([page.reload(), staff.reload()]);
  await expect(page.getByRole("heading", { name: /^Welcome, / })).toBeVisible();
  await expect(
    staff
      .getByRole("region", { name: "Teaching dashboard" })
      .getByText("Assigned offerings", { exact: true }),
  ).toBeVisible();
  const renewedStaff = await staffTokens(staff);
  const renewedCookies = await context.cookies(studentOrigin);
  expect(renewedStaff?.access.token !== oldStaff?.access.token).toBe(true);
  expect(
    renewedCookies.find(({ name }) => name === "uemp_student_access")?.value !==
      oldStudent,
  ).toBe(true);
  const refreshExpiresAt = Math.max(
    renewedStaff?.refresh.expiresAt ?? 0,
    Number(
      renewedCookies.find(({ name }) => name === "uemp_student_refresh_expires")?.value,
    ),
  );
  await expect
    .poll(() => Date.now() > refreshExpiresAt + 1100, {
      timeout: 90_000,
      intervals: [500],
    })
    .toBe(true);
  await Promise.all([page.reload(), staff.reload()]);
  await expect(page).toHaveURL(studentOrigin + "/sign-in");
  await expect(staff).toHaveURL(adminOrigin + "/sign-in");
  expect(await staffTokens(staff)).toBeNull();
  expect(
    (await context.cookies(studentOrigin)).some(({ name }) =>
      name.startsWith("uemp_student_"),
    ),
  ).toBe(false);
});
