import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { adminOrigin, studentOrigin } from "./support/origins";
import { signIn } from "./support/session-browser";

async function reviewLayout(page: Page, name: string) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
  }
  for (const theme of ["light", "dark"]) {
    await page.getByLabel("Color theme").selectOption(theme);
    await page.setViewportSize({ width: 390, height: 900 });
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      scan.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map(({ target }) => target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: test.info().outputPath(name + "-" + theme + "-mobile.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: test.info().outputPath(name + "-" + theme + "-desktop.png"),
      fullPage: true,
    });
  }
}

test("authentication controls keep clear labels and stable password visibility in both themes", async ({
  page,
  browser,
}) => {
  test.setTimeout(180_000);
  const beforeScripts = await browser.newContext({ javaScriptEnabled: false });
  try {
    const view = await beforeScripts.newPage();
    for (const route of ["/sign-in", "/sign-up"]) {
      await view.goto(studentOrigin + route);
      await expect(
        view.getByText("Enable JavaScript in your browser to use this form.", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(view.getByLabel("Email address", { exact: true })).toBeDisabled();
      await expect(view.getByLabel("Password", { exact: true })).toBeDisabled();
      await expect(view.locator("form")).toHaveAttribute("method", "post");
      await expect(
        view.getByRole("button", { name: "Loading form", exact: true }),
      ).toBeDisabled();
    }
  } finally {
    await beforeScripts.close();
  }
  for (const [name, origin] of [
    ["student-sign-in", studentOrigin],
    ["staff-sign-in", adminOrigin],
  ] as const) {
    await page.goto(origin + "/sign-in");
    const password = page.getByLabel("Password", { exact: true });
    await expect(password).toHaveCount(1);
    await password.fill("A synthetic test password 42");
    await page.getByRole("button", { name: "Show password", exact: true }).click();
    await expect(password).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Hide password", exact: true }).click();
    await expect(password).toHaveAttribute("type", "password");
    await expect(password).toHaveValue("A synthetic test password 42");
    await reviewLayout(page, name);
  }
  await page.goto(studentOrigin + "/sign-up");
  const confirmation = page.getByLabel("Confirm password", { exact: true });
  await confirmation.fill("A synthetic test password 42");
  await page
    .getByRole("button", { name: "Show confirm password", exact: true })
    .click();
  await expect(confirmation).toHaveAttribute("type", "text");
  await page
    .getByRole("button", { name: "Hide confirm password", exact: true })
    .click();
  await expect(confirmation).toHaveAttribute("type", "password");
  await reviewLayout(page, "student-sign-up");
});

test("course search keeps hidden selections in the review and clears them explicitly", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const email = "ui-review-" + randomUUID().slice(0, 8) + "@demo.example.test";
  const password = "A synthetic test password 42";
  await page.goto(studentOrigin + "/sign-up");
  await page.getByLabel("First name").fill("UI");
  await page.getByLabel("Last name").fill("Reviewer");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page
    .getByLabel("Faculty", { exact: true })
    .selectOption({ label: "Demo Faculty of Science" });
  await page
    .getByLabel("Department", { exact: true })
    .selectOption({ label: "Demo Computing" });
  await page
    .getByLabel("Programme", { exact: true })
    .selectOption({ label: "Demo Computer Science" });
  await page.getByLabel("Academic level", { exact: true }).selectOption({ index: 1 });
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in\?created=1$/);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome, UI", exact: true }),
  ).toBeVisible();
  await page.goto(studentOrigin + "/registration");
  const course = page.getByRole("checkbox", { name: /DEMO104/ });
  await course.check();
  await page.getByLabel("Find a course").fill("a course that does not exist");
  await expect(page.getByText("No matching courses", { exact: true })).toBeVisible();
  await expect(course).toHaveCount(0);
  await expect(
    page.getByText("1 selected · 2 credit units", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review selection", exact: true }).click();
  const confirmation = page.getByRole("dialog", {
    name: "Confirm course registration",
  });
  await expect(confirmation.getByText(/DEMO104/)).toBeVisible();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByLabel("Find a course").fill("");
  await expect(course).toBeChecked();
  await page.getByRole("button", { name: "Clear selection", exact: true }).click();
  await expect(course).not.toBeChecked();
  await expect(
    page.getByText("0 selected · 0 credit units", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Review selection", exact: true }),
  ).toBeDisabled();
  await reviewLayout(page, "course-selection");

  await course.check();
  await page.getByRole("button", { name: "Review selection", exact: true }).click();
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(studentOrigin + "/api/student/registrations", async (route) => {
    const response = await route.fetch();
    await held;
    await route.fulfill({ response });
  });
  try {
    await confirmation
      .getByRole("button", { name: "Register courses", exact: true })
      .click();
    await expect(
      confirmation.getByRole("button", { name: "Registering courses", exact: true }),
    ).toBeDisabled();
    await expect(
      confirmation.getByRole("button", { name: "Close dialog", exact: true }),
    ).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(confirmation).toBeVisible();
    await page.mouse.click(1, 1);
    await expect(confirmation).toBeVisible();
  } finally {
    release();
  }
  await expect(
    page.getByRole("heading", { name: "Registration summary", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("row", { name: /DEMO104/ })).toHaveCount(1);
});

test("every academic setup category remains readable and accessible across layouts", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await signIn(page, true, "super-admin");
  await page.goto(adminOrigin + "/workspaces/academics");
  const navigation = page.getByRole("group", { name: "Academic setup sections" });
  await expect(navigation).toBeVisible();
  for (const section of [
    "Faculties",
    "Departments",
    "Programmes",
    "Sessions",
    "Semesters",
    "Academic levels",
    "Course catalog",
    "Curriculum",
    "Offerings",
  ]) {
    const control = navigation.getByRole("button", { name: section, exact: true });
    await control.click();
    await expect(control).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("main").getByText(/^Loading /)).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await reviewLayout(page, "academic-" + section.toLowerCase().replaceAll(" ", "-"));
  }
});
