import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { apiOrigin, demoAdminHeaders, demoSemester } from "./support/demo-api";
import { studentOrigin, adminOrigin } from "./support/origins";
import { openPrintView } from "./support/print-view";

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
  const original = page.viewportSize();
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
  if (original) await page.setViewportSize(original);
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

test("student profile is protected, responsive, and uses HTTP-only token cookies", async ({
  page,
  context,
  browser,
}) => {
  await page.goto(studentOrigin + "/account");
  await expect(page).toHaveURL(/\/sign-in$/);
  await verifyLayout(page);
  await verifyA11y(page);
  await signIn(page, "student-maya");
  await expect(
    page.getByRole("heading", { name: /welcome|student overview/i }),
  ).toBeVisible();
  const beforeScripts = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 840 },
  });
  try {
    await beforeScripts.addCookies(await context.cookies(studentOrigin));
    const view = await beforeScripts.newPage();
    await view.goto(studentOrigin + "/account");
    await expect(view.getByLabel("First name", { exact: true })).toBeDisabled();
    await expect(view.getByLabel("Last name", { exact: true })).toBeDisabled();
    await expect(view.locator("form")).toHaveAttribute("method", "post");
    await expect(
      view.getByRole("button", {
        name: "Save profile",
        exact: true,
        includeHidden: true,
      }),
    ).toBeDisabled();
    await view.goto(studentOrigin + "/registration");
    await expect(view.getByLabel("Find a course", { exact: true })).toBeDisabled();
    // Protected routes stream content behind a loading boundary before scripts reveal it.
    const choices = await view.getByRole("checkbox", { includeHidden: true }).all();
    expect(choices.length).toBeGreaterThan(0);
    for (const choice of choices) await expect(choice).toBeDisabled();
    await expect(
      view.getByRole("button", { name: "Open navigation", exact: true }),
    ).toBeDisabled();
    await expect(view.getByLabel("Color theme", { exact: true })).toBeDisabled();
  } finally {
    await beforeScripts.close();
  }
  await verifyLayout(page);
  await verifyMobileDrawer(page);
  await page.getByRole("link", { name: "My profile", exact: true }).click();
  await expect(page.getByText("student-maya@demo.example.test")).toBeVisible();
  const cookie = (await context.cookies(studentOrigin)).find(
    ({ name }) => name === "uemp_student_access",
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");
  expect(cookie?.value.split(".")).toHaveLength(3);
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
  if (process.env["UEMP_E2E_PRODUCTION"] === "1") {
    await page.goto(adminOrigin + "/design-system");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    return;
  }
  await page.goto(adminOrigin + "/design-system");
  await expect(page.getByRole("heading", { name: "Design system" })).toBeVisible();
  await page.getByLabel("Color theme").selectOption("dark");
  await verifyLayout(page);
  await verifyA11y(page);
});

async function mobileNavigate(page: Page, label: string) {
  await page.getByRole("button", { name: "Open navigation" }).tap();
  await page
    .getByRole("dialog", { name: "Navigation" })
    .getByRole("link", { name: label, exact: true })
    .tap();
}

test.describe("student workflows on a phone", () => {
  test.use({
    viewport: { width: 320, height: 780 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });

  test("a new student can sign up, edit their profile, and register from a phone", async ({
    page,
    context,
    request,
  }) => {
    const email = "browser-" + randomUUID() + "@example.test";
    const signupPassword = "Demo signup password 42";
    await page.goto(studentOrigin + "/sign-up");
    await verifyLayout(page);
    await verifyA11y(page);
    await page.getByLabel("First name").fill("Ada");
    await page.getByLabel("Last name").fill("Student");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(signupPassword);
    const confirmation = page.getByLabel("Confirm password", { exact: true });
    await confirmation.fill("Different demo password");
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
    await page.getByRole("button", { name: "Create account" }).tap();
    await expect(confirmation).toBeFocused();
    await expect(confirmation).toHaveAccessibleDescription(
      "Enter the same password in both fields.",
    );
    await confirmation.fill(signupPassword);
    await page.getByRole("button", { name: "Create account" }).tap();
    await expect(page).toHaveURL(/\/sign-in\?created=1$/);
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(signupPassword);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Welcome, Ada" })).toBeVisible();

    await mobileNavigate(page, "My profile");
    await page.getByLabel("First name").fill("Amaka");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText("Your profile was updated.")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("First name")).toHaveValue("Amaka");
    await expect(page.getByText("Demo Computer Science")).toBeVisible();

    const semester = await demoSemester(request);
    await semester.setLimit(2);
    try {
      await mobileNavigate(page, "Course registration");
      const review = page.getByRole("button", { name: "Review selection" });
      await expect(review).toBeDisabled();
      await expect(
        page.getByRole("checkbox", { name: /DEMO101|DEMO102|DEMO105|DEMO106/ }),
      ).toHaveCount(0);
      const discrete = page.getByRole("checkbox", { name: /DEMO103/ });
      const data = page.getByRole("checkbox", { name: /DEMO104.*Data and Society/ });
      await discrete.check();
      await data.check();
      await expect(review).toBeDisabled();
      await expect(
        page.getByText("Remove at least 2 credit units to stay within your limit."),
      ).toBeVisible();
      await discrete.uncheck();
      await expect(page.getByText("1 selected · 2 credit units")).toBeVisible();
      await review.tap();
      const dialog = page.getByRole("dialog", { name: "Confirm course registration" });
      await expect(dialog.getByText("2 of 2 credit units")).toBeVisible();
      await verifyA11y(page);

      await semester.setLimit(1);
      await dialog.getByRole("button", { name: "Register courses" }).tap();
      await expect(
        page.getByRole("region", { name: "Available courses" }).getByRole("alert"),
      ).toContainText("exceeds the semester limit");
      await expect(
        page.getByText("Remove at least 1 credit unit to stay within your limit."),
      ).toBeVisible();
      await expect(review).toBeDisabled();
      await semester.setLimit(2);
      await page.reload();
      await data.check();
      await review.tap();
      const submission = page.waitForRequest(
        (request) =>
          request.method() === "POST" &&
          request.url() === studentOrigin + "/api/student/registrations",
      );
      await dialog.getByRole("button", { name: "Register courses" }).click();
      await expect(
        page.getByRole("heading", { name: "Registration summary" }),
      ).toBeVisible();
      await expect(page.getByText("Your courses were registered.")).toBeVisible();
      await expect(page.getByRole("row", { name: /DEMO104/ })).toHaveCount(1);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(320);

      const summary = await openPrintView(page, "Print registration summary");
      await expect(summary.getByText("Amaka Student", { exact: true })).toBeVisible();
      await expect(summary.getByRole("row", { name: /DEMO104/ })).toHaveCount(1);
      await expect(
        summary.getByRole("definition").filter({ hasText: /^2$/ }),
      ).toHaveCount(1);
      await summary.close();

      const registration = (await submission).postDataJSON();
      const denied = await context.request.post(
        studentOrigin + "/api/student/registrations",
        {
          headers: { Origin: adminOrigin },
          data: registration,
        },
      );
      expect(denied.status()).toBe(403);
      const duplicate = await context.request.post(
        studentOrigin + "/api/student/registrations",
        {
          headers: { Origin: studentOrigin },
          data: registration,
        },
      );
      expect(duplicate.status()).toBe(409);
      await page.getByRole("link", { name: "Back to course registration" }).click();
      await expect(page.getByRole("checkbox", { name: /DEMO104/ })).toHaveCount(0);
      await expect(
        page
          .getByRole("region", { name: "Registration history" })
          .getByText("2 credit units"),
      ).toBeVisible();

      await mobileNavigate(page, "Results");
      await page
        .getByRole("region", { name: "Result statements" })
        .getByRole("link", { name: /First Semester/ })
        .tap();
      await expect(
        page.getByText("No grades have been published for this semester"),
      ).toBeVisible();
      await expect(
        page.getByRole("definition").filter({ hasText: "Unavailable" }),
      ).toHaveCount(2);
    } finally {
      await semester.setLimit(semester.maxUnits);
    }
  });

  test("student results show and print only the signed-in student's published grades", async ({
    page,
    request,
  }) => {
    await page.goto(studentOrigin + "/results");
    await expect(page).toHaveURL(/\/sign-in$/);
    await signIn(page, "student-maya");
    await mobileNavigate(page, "Results");
    await expect(
      page.getByRole("region", { name: "Cumulative GPA" }).getByText("4.00"),
    ).toBeVisible();
    await page
      .getByRole("region", { name: "Result statements" })
      .getByRole("link", { name: /First Semester/ })
      .click();
    await expect(page.getByRole("heading", { name: "Result statement" })).toBeVisible();
    const grades = page.getByRole("region", { name: "Published grades" });
    await expect(grades.getByRole("heading", { name: /DEMO105/ })).toBeVisible();
    await expect(grades.getByText("Grade B", { exact: true })).toBeVisible();
    await expect(grades.getByText("65.00", { exact: true })).toBeVisible();
    await expect(grades.getByText("DEMO106")).toHaveCount(0);
    await verifyLayout(page);
    await page.setViewportSize({ width: 768, height: 840 });
    await expect(
      page
        .getByRole("table", { name: "Published grades" })
        .getByRole("row", { name: /DEMO105.*65\.00.*B/ }),
    ).toBeVisible();
    await page.getByLabel("Color theme").selectOption("dark");
    await page.setViewportSize({ width: 390, height: 840 });
    await verifyA11y(page);
    const statement = await openPrintView(page, "Print result statement");
    await expect(
      statement.getByRole("row", { name: /DEMO105.*65\.00.*B/ }),
    ).toBeVisible();
    await expect(statement.getByText("DEMO106")).toHaveCount(0);
    await expect(
      statement.getByRole("definition").filter({ hasText: /^4\.00$/ }),
    ).toHaveCount(2);
    await statement.close();

    const semester = new URL(page.url()).pathname.split("/").at(-1);
    const denied = await request.get(
      studentOrigin + "/results/" + semester + "/print",
      { maxRedirects: 0 },
    );
    expect(denied.status()).toBe(307);
    expect(denied.headers()["location"]).toBe("/sign-in");

    const headers = await demoAdminHeaders(request, "hod");
    const access = await request.get(apiOrigin + "/v1/admin/admins/me/authorization", {
      headers,
    });
    expect(access.status()).toBe(200);
    const departmentId = (await access.json()).grants.find(
      (grant: { systemKey: string }) => grant.systemKey === "hod",
    )?.departmentId;
    const queue = await request.get(apiOrigin + "/v1/admin/results", {
      headers,
      params: { departmentId },
    });
    expect(queue.status()).toBe(200);
    const groupId = (await queue.json()).items.find(
      (group: { code: string }) => group.code === "DEMO106",
    )?.id;
    if (!groupId)
      throw new Error("DEMO106 must be awaiting review in the disposable demo.");
    const resultPath = apiOrigin + "/v1/admin/results/" + groupId;
    const approval = await request.post(resultPath + "/approve", { headers, data: {} });
    expect(approval.status()).toBe(200);
    try {
      await page.reload();
      await expect(grades.getByRole("heading", { name: /DEMO106/ })).toBeVisible();
      await expect(
        page.getByRole("definition").filter({ hasText: "4.40" }),
      ).toHaveCount(2);
      const published = await openPrintView(page, "Print result statement");
      await expect(published.getByRole("row", { name: /DEMO106/ })).toBeVisible();
      await published.close();
    } finally {
      const reopen = await request.post(resultPath + "/reopen", {
        headers,
        data: { reason: "mark_correction" },
      });
      expect(reopen.status()).toBe(200);
      const lecturer = await demoAdminHeaders(request, "lecturer");
      const submission = await request.post(
        apiOrigin + "/v1/lecturer/results/" + groupId + "/submit",
        { headers: lecturer, data: {} },
      );
      expect(submission.status()).toBe(200);
    }
    await page.reload();
    await expect(grades.getByRole("heading", { name: /DEMO105/ })).toBeVisible();
    await expect(grades.getByRole("heading", { name: /DEMO106/ })).toHaveCount(0);
    await expect(page.getByRole("definition").filter({ hasText: "4.00" })).toHaveCount(
      2,
    );
    const withdrawn = await openPrintView(page, "Print result statement");
    await expect(withdrawn.getByText("DEMO106")).toHaveCount(0);
    await withdrawn.close();
  });
});
