import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const studentOrigin = "http://localhost:3001";
const adminOrigin = "http://localhost:3002";
const password = process.env["UEMP_E2E_PASSWORD"];
const widths = [320, 390, 768, 1024, 1440];

async function signIn(page: Page, account: string) {
  if (!password)
    throw new Error("Set UEMP_E2E_PASSWORD to the password of the running demo seed.");
  await page.getByLabel("Email address").fill(account + "@demo.example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

async function verifyLayout(page: Page) {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
  }
  expect(
    await page.evaluate(async () => {
      const loaded = await document.fonts.load('16px "Source Sans 3"');
      return loaded.some((face) => face.status === "loaded");
    }),
  ).toBe(true);
}

async function verifyA11y(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map(({ target }) => target),
    })),
  ).toEqual([]);
}

async function verifyMobileDrawer(page: Page) {
  await page.setViewportSize({ width: 390, height: 840 });
  const opener = page.getByRole("button", { name: "Open navigation" });
  await opener.click();
  const drawer = page.getByRole("dialog", { name: "Navigation" });
  await expect(drawer).toBeVisible();
  await expect(
    drawer.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(opener).toBeFocused();
  await page.setViewportSize({ width: 1280, height: 900 });
}

test("student profile is protected, responsive, and uses a server session", async ({
  page,
  context,
}) => {
  await page.goto(studentOrigin + "/account");
  await expect(page).toHaveURL(/\/sign-in$/);
  await verifyLayout(page);
  await verifyA11y(page);
  await signIn(page, "student-maya");
  await expect(
    page.getByRole("heading", { name: /welcome|student overview/i }),
  ).toBeVisible();
  await verifyLayout(page);
  await verifyMobileDrawer(page);
  await page.getByRole("link", { name: "My profile", exact: true }).click();
  await expect(page.getByText("student-maya@demo.example.test")).toBeVisible();
  const cookie = (await context.cookies(studentOrigin)).find(
    ({ name }) => name === "uemp_student_session",
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");
  expect(/^[A-Za-z0-9_-]{43}$/.test(cookie?.value ?? "")).toBe(true);
  const crossOrigin = await context.request.post(studentOrigin + "/api/auth/sign-out", {
    headers: { Origin: adminOrigin },
  });
  expect(crossOrigin.status()).toBe(403);
  await page.getByLabel("Color theme").selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await verifyA11y(page);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto(studentOrigin + "/account");
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("lecturer sees assigned offerings and is denied the review URL", async ({
  page,
}) => {
  await page.goto(adminOrigin + "/sign-in");
  await verifyLayout(page);
  await verifyA11y(page);
  await signIn(page, "lecturer");
  await expect(page.getByRole("heading", { name: "Staff overview" })).toBeVisible();
  await verifyMobileDrawer(page);
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(navigation.getByRole("link", { name: "Result review" })).toHaveCount(0);
  await navigation.getByRole("link", { name: "My teaching" }).click();
  await expect(
    page.getByRole("table", { name: "Your course offerings" }),
  ).toBeVisible();
  await verifyLayout(page);
  await page.goto(adminOrigin + "/workspaces/result-review");
  await expect(page.getByRole("heading", { name: "Access restricted" })).toBeVisible();
});

test("HOD review scope and university-wide staff permissions stay separate", async ({
  page,
}) => {
  await page.goto(adminOrigin + "/workspaces/result-review");
  await expect(page).toHaveURL(/\/sign-in$/);
  await signIn(page, "hod");
  await expect(page.getByRole("heading", { name: "Result review" })).toBeVisible();
  await expect(
    page.getByLabel("Department", { exact: true }).getByRole("option"),
  ).toHaveCount(1);
  await expect(
    page
      .getByRole("table", { name: "Departmental results" })
      .or(page.getByText("No submitted results to show")),
  ).toBeVisible();
  await page.goto(adminOrigin + "/workspaces/audit");
  await expect(page.getByRole("heading", { name: "Access restricted" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await signIn(page, "super-admin");
  await expect(page.getByRole("heading", { name: "Audit trail" })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(
    navigation.getByRole("link", { name: "Roles", exact: true }),
  ).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Audit trail" })).toBeVisible();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.goto(adminOrigin + "/design-system");
  await expect(page.getByRole("heading", { name: "Design system" })).toBeVisible();
  await page.getByLabel("Color theme").selectOption("dark");
  await verifyLayout(page);
  await verifyA11y(page);
});
