import { expect, type BrowserContext, type Page } from "@playwright/test";
import { adminOrigin, studentOrigin } from "./origins";
import type { Session } from "../../packages/api-contracts/src/index";

export async function signIn(
  page: Page,
  staff = false,
  account = staff ? "lecturer" : "student-maya",
) {
  const password = process.env["UEMP_E2E_PASSWORD"];
  if (!password) throw new Error("Set UEMP_E2E_PASSWORD for the disposable demo.");
  await page.goto((staff ? adminOrigin : studentOrigin) + "/sign-in");
  await page.getByLabel("Email address").fill(account + "@demo.example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: staff ? "Staff overview" : /^Welcome, / }),
  ).toBeVisible();
}

export async function expireStudentAccess(context: BrowserContext) {
  await context.clearCookies({ name: /^uemp_student_access/ });
}

export async function studentAccess(context: BrowserContext) {
  return (await context.cookies(studentOrigin)).find(
    ({ name }) => name === "uemp_student_access",
  )?.value;
}

export async function staffTokens(page: Page): Promise<Session | null> {
  return page.evaluate(() => {
    const stored = sessionStorage.getItem("uemp:staff:session");
    return stored ? JSON.parse(stored).tokens : null;
  });
}

export async function expireStaffAccess(page: Page) {
  await page.evaluate(() => {
    const stored = sessionStorage.getItem("uemp:staff:session");
    if (!stored) throw new Error("The test needs a signed-in staff tab.");
    const session = JSON.parse(stored);
    session.tokens.access.expiresAt = Date.now() - 1000;
    sessionStorage.setItem("uemp:staff:session", JSON.stringify(session));
  });
}
