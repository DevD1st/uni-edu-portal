import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { expect, test, type Locator, type Page, type Request } from "@playwright/test";
import type { Dto } from "../packages/api-contracts/src/response";
import { apiOrigin, demoAdminHeaders } from "./support/demo-api";
import { studentOrigin as student, adminOrigin as staff } from "./support/origins";

async function signIn(
  page: Page,
  origin: string,
  account: string,
  ready = "Staff overview",
  password = process.env["UEMP_E2E_PASSWORD"],
) {
  if (!password)
    throw new Error("Set UEMP_E2E_PASSWORD for the disposable demo backend.");
  await page.goto(origin);
  await page.getByLabel("Email address").fill(account + "@demo.example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).tap();
  await expect(page.getByRole("heading", { name: ready, exact: true })).toBeVisible();
}

async function layout(page: Page, name: string, modal = false) {
  const original = page.viewportSize();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(844);
  if (modal) {
    await page.setViewportSize({ width: 320, height: 320 });
    const keep = page
      .getByRole("dialog", { name: "Leave unsaved marks?" })
      .getByRole("button", { name: "Keep editing" });
    await keep.scrollIntoViewIfNeeded();
    await expect(keep).toBeInViewport();
    await page.screenshot({
      path: test.info().outputPath(name + "-short-viewport.png"),
      fullPage: true,
    });
  }
  await page.setViewportSize(original ?? { width: 320, height: 780 });
  for (const theme of ["light", "dark"]) {
    // A modal makes the shell's theme selector inert; inspect its theme tokens directly there.
    if (modal)
      await page.evaluate(
        (value) => document.documentElement.setAttribute("data-theme", value),
        theme,
      );
    else await page.getByLabel("Color theme").selectOption(theme);
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
      path: test.info().outputPath(name + "-" + theme + ".png"),
      fullPage: true,
    });
  }
}

async function inspectCountChart(
  chart: Locator,
  title: string,
  unit: string,
  points: readonly { label: string; value: number }[],
) {
  const bar = (point: { label: string }) =>
    chart.getByRole("button").filter({ hasText: point.label });
  for (const point of points) await expect(bar(point)).toBeVisible();
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) throw new Error("A dashboard chart needs real data to inspect.");
  const firstBar = bar(first);
  const lastBar = bar(last);
  await firstBar.focus();
  await firstBar.press("End");
  await expect(lastBar).toBeFocused();
  await expect(lastBar).toHaveAttribute("aria-pressed", "true");
  await lastBar.press("Home");
  await expect(firstBar).toBeFocused();
  await expect(firstBar).toHaveAttribute("aria-pressed", "true");
  const next = points[1];
  if (next) {
    await firstBar.press("ArrowRight");
    const nextBar = bar(next);
    await expect(nextBar).toBeFocused();
    await expect(nextBar).toHaveAttribute("aria-pressed", "true");
  }
  await lastBar.tap();
  await expect(chart.getByRole("status")).toContainText(last.label);
  await expect(chart.getByRole("status")).toContainText(unit);
  await expect(lastBar).toHaveAttribute("aria-pressed", "true");
  await chart.getByText("View data table", { exact: true }).tap();
  const table = chart.getByRole("table", { name: title + " data", exact: true });
  await expect(
    table.getByRole("columnheader", { name: unit, exact: true }),
  ).toBeVisible();
  for (const point of points) {
    const row = table.getByRole("row").filter({ hasText: point.label });
    await expect(
      row.getByRole("cell", { name: String(point.value), exact: true }),
    ).toBeVisible();
  }
  await chart.getByText("View data table", { exact: true }).tap();
}

async function openMarks(page: Page) {
  await signIn(page, staff, "lecturer");
  await page.getByRole("link", { name: "Open my teaching" }).tap();
  await page
    .getByRole("table", { name: "Your course offerings" })
    .getByRole("link", { name: "DEMO103" })
    .tap();
  await page.getByRole("button", { name: "Marks", exact: true }).tap();
  const ca = page.getByRole("spinbutton", { name: /^CA for / });
  const exam = page.getByRole("spinbutton", { name: /^Exam for / });
  await expect(ca).toBeVisible();
  return {
    ca,
    exam,
    warning: page.getByRole("dialog", { name: "Leave unsaved marks?" }),
  };
}

test.describe("frontend finishing workflows", () => {
  test.use({
    viewport: { width: 320, height: 780 },
    isMobile: true,
    hasTouch: true,
    actionTimeout: 15_000,
  });

  test("staff dashboards request only authorized summaries and retain their report scope", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const requests: string[] = [];
    page.on("request", (request) => requests.push(new URL(request.url()).pathname));
    const teachingResponse = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/v1/lecturer/offerings" &&
        response.status() === 200,
    );
    await signIn(page, staff, "lecturer");
    const assigned = (
      (await (await teachingResponse).json()) as Dto<"TeachingOfferingsResponseDto">
    ).offerings;
    const teaching = page.getByRole("region", {
      name: "Teaching dashboard",
      exact: true,
    });
    await expect(
      teaching.getByText("Assigned offerings", { exact: true }),
    ).toBeVisible();
    await expect(teaching.getByRole("definition").first()).toHaveText("6");
    await inspectCountChart(
      teaching.getByRole("figure", { name: "Assigned roster status", exact: true }),
      "Assigned roster status",
      "Offerings",
      [
        {
          label: "Open rosters",
          value: assigned.filter(
            ({ registrationStatus }) => registrationStatus === "opened",
          ).length,
        },
        {
          label: "Closed rosters",
          value: assigned.filter(
            ({ registrationStatus }) => registrationStatus === "closed",
          ).length,
        },
      ],
    );
    await expect(
      page.getByRole("figure", { name: "Result workflow", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Review dashboard" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Academic dashboard" })).toHaveCount(
      0,
    );
    expect(
      requests.some(
        (path) =>
          path.startsWith("/v1/admin/reports") || path.startsWith("/v1/admin/results"),
      ),
    ).toBe(false);
    await layout(page, "lecturer-dashboard");
    await page.getByRole("button", { name: "Sign out" }).tap();
    await expect(page).toHaveURL(/\/sign-in$/);

    const reportResponse = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/v1/admin/reports/overview" &&
        response.status() === 200,
    );
    await signIn(page, staff, "hod");
    const report = (await (await reportResponse).json()) as Dto<"AcademicOverviewDto">;
    const review = page.getByRole("region", { name: "Review dashboard", exact: true });
    await expect(review.getByRole("link", { name: /DEMO106/ })).toBeVisible();
    await expect(page.getByLabel("Review department").getByRole("option")).toHaveText([
      "Demo Computing",
    ]);
    await expect(page.getByLabel("Report department").getByRole("option")).toHaveText([
      "Demo Computing",
    ]);
    await expect(page.getByRole("region", { name: "Teaching dashboard" })).toHaveCount(
      0,
    );
    await expect(
      page
        .getByRole("region", { name: "Academic dashboard" })
        .getByText("Students registered", { exact: true }),
    ).toBeVisible();
    const resultChart = page.getByRole("figure", {
      name: "Result workflow",
      exact: true,
    });
    await inspectCountChart(resultChart, "Result workflow", "Result groups", [
      { label: "Draft", value: report.pendingCount },
      { label: "Awaiting review", value: report.submittedCount },
      { label: "Corrections requested", value: report.correctionRequestedCount },
      { label: "Approved", value: report.approvedCount },
    ]);
    // A zero count is a selectable observed state, not an unavailable value or a fabricated bar.
    expect(report.correctionRequestedCount).toBe(0);
    await resultChart
      .getByRole("button")
      .filter({ hasText: "Corrections requested" })
      .tap();
    await expect(resultChart.getByRole("status")).toContainText(
      "Corrections requested",
    );
    await expect(resultChart.getByRole("status")).toContainText("0");
    const authorizedDepartment = await page
      .getByLabel("Report department")
      .inputValue();
    const foreignDepartment = randomUUID();
    const foreignSemester = randomUUID();
    const scopedReads: { department: string | null; semester: string | null }[] = [];
    function recordScope(request: Request) {
      const url = new URL(request.url());
      if (url.pathname === "/v1/admin/reports/overview") {
        scopedReads.push({
          department: url.searchParams.get("departmentId"),
          semester: url.searchParams.get("semesterId"),
        });
      }
    }
    page.on("request", recordScope);
    await page.goto(
      staff +
        "/overview?departmentId=" +
        foreignDepartment +
        "&semesterId=" +
        foreignSemester,
    );
    await expect(page.getByLabel("Report department")).toHaveValue(
      authorizedDepartment,
    );
    await expect(
      page
        .getByRole("region", { name: "Academic dashboard" })
        .getByText("Students registered", { exact: true }),
    ).toBeVisible();
    expect(scopedReads.length).toBeGreaterThan(0);
    expect(
      scopedReads.every(
        ({ department, semester }) =>
          department === authorizedDepartment && semester !== foreignSemester,
      ),
    ).toBe(true);
    // Stop this check before signing into a legitimately university-wide account.
    page.off("request", recordScope);
    await layout(page, "hod-dashboard");
    await page.getByRole("link", { name: "Open academic reports" }).tap();
    await expect(page.getByLabel("Department", { exact: true })).toHaveValue(
      (await page
        .getByLabel("Department", { exact: true })
        .getByRole("option")
        .first()
        .getAttribute("value")) ?? "",
    );
    await expect(page.getByRole("table", { name: "Course performance" })).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).tap();
    await expect(page).toHaveURL(/\/sign-in$/);

    await signIn(page, staff, "super-admin");
    await expect(
      page.getByRole("figure", { name: "Assigned roster status", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByLabel("Report department").getByRole("option").first(),
    ).toHaveText("Entire university");
    await page
      .getByLabel("Report department")
      .selectOption({ label: "Demo Computing" });
    const selected = await page.getByLabel("Report department").inputValue();
    await page.getByRole("link", { name: "Open academic reports" }).tap();
    await expect(page.getByLabel("Department", { exact: true })).toHaveValue(selected);
    await expect(page).toHaveURL(new RegExp("departmentId=" + selected));
    await page.getByRole("button", { name: "Open navigation" }).tap();
    await page
      .getByRole("dialog", { name: "Navigation" })
      .getByRole("link", { name: "Overview", exact: true })
      .tap();
    await expect(
      page
        .getByRole("region", { name: "Academic dashboard" })
        .getByText("Students registered", { exact: true }),
    ).toBeVisible();
    await layout(page, "university-dashboard");
  });

  test("student dashboard shows registration and approved results with empty states", async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);
    await signIn(page, student, "student-maya", "Welcome, Demo");
    const registration = page.getByRole("region", { name: "Registration dashboard" });
    const results = page.getByRole("region", { name: "Results dashboard" });
    await expect(registration.getByRole("definition")).toHaveText(["1", "5"]);
    await expect(results.getByRole("definition")).toHaveText([
      "4.00 / 5.00",
      "4.00 / 5.00",
    ]);
    await layout(page, "student-dashboard");
    const statementLink = await registration
      .getByRole("link", { name: /First Semester/ })
      .boundingBox();
    const registerLink = await registration
      .getByRole("link", { name: "Open course registration" })
      .boundingBox();
    expect(
      statementLink &&
        registerLink &&
        statementLink.y + statementLink.height <= registerLink.y,
    ).toBe(true);
    await page.getByRole("button", { name: "Sign out" }).tap();
    await expect(page).toHaveURL(/\/sign-in$/);
    // Seeded accounts may use a shorter demo password; new signup follows its own policy.
    const password = "Dashboard test password 42";
    const account = "dashboard-" + randomUUID();
    const created = await request.post(apiOrigin + "/v1/auth/signup/student", {
      data: {
        email: account + "@demo.example.test",
        password,
        firstName: "Demo",
        lastName: "Dashboard",
      },
    });
    expect(created.status()).toBe(201);
    await signIn(page, student, account, "Welcome, Demo", password);
    await expect(registration.getByRole("definition")).toHaveText(["0", "0"]);
    await expect(results.getByRole("definition")).toHaveText([
      "Unavailable",
      "Unavailable",
    ]);
    await expect(results.getByText("No grades have been published yet.")).toBeVisible();
  });

  test("unsaved marks warn on links, back, reload, and sign-out; completed saves leave normally", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await signIn(page, staff, "lecturer");
    await page.getByRole("link", { name: "Open my teaching" }).tap();
    await page
      .getByRole("table", { name: "Your course offerings" })
      .getByRole("link", { name: "DEMO103" })
      .tap();
    await page.getByRole("button", { name: "Marks", exact: true }).tap();
    const ca = page.getByRole("spinbutton", { name: /^CA for / });
    await ca.fill("23");
    const warning = page.getByRole("dialog", { name: "Leave unsaved marks?" });
    await page.getByRole("link", { name: "Back to my teaching" }).tap();
    await expect(warning).toBeVisible();
    await layout(page, "unsaved-marks-warning", true);
    await warning.getByRole("button", { name: "Keep editing" }).tap();
    await expect(ca).toHaveValue("23");
    await page.goBack();
    await expect(warning).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(warning).toBeHidden();
    await expect(ca).toHaveValue("23");

    const nativePrompt = page.waitForEvent("dialog", { timeout: 10_000 });
    const reload = page.reload({ timeout: 5_000 }).catch(() => null);
    const prompt = await nativePrompt;
    expect(prompt.type()).toBe("beforeunload");
    await prompt.dismiss();
    await reload;
    await expect(ca).toHaveValue("23");
    let signOuts = 0;
    page.on("request", (request) => {
      if (new URL(request.url()).pathname === "/v1/auth/sign-out") signOuts++;
    });
    await page.getByRole("button", { name: "Sign out" }).tap();
    await expect(warning).toBeVisible();
    expect(signOuts).toBe(0);
    await warning.getByRole("button", { name: "Keep editing" }).tap();
    await page.getByRole("link", { name: "Back to my teaching" }).tap();
    await warning.getByRole("button", { name: "Leave without saving" }).tap();
    await expect(
      page.getByRole("table", { name: "Your course offerings" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "DEMO103", exact: true }).tap();
    await page.getByRole("button", { name: "Marks", exact: true }).tap();
    await expect(ca).toHaveValue("");
    await ca.fill("23");
    await page.getByRole("spinbutton", { name: /^Exam for / }).fill("47");
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/v1/lecturer/results/*/marks", async (route) => {
      await gate;
      await route.continue();
    });
    await page.getByRole("button", { name: "Save marks" }).tap();
    await expect(ca).toBeDisabled();
    await page.getByRole("link", { name: "Back to my teaching" }).tap();
    await expect(
      warning.getByRole("button", { name: "Leave without saving" }),
    ).toBeDisabled();
    await expect(warning.getByText(/being saved/)).toBeVisible();
    await warning.getByRole("button", { name: "Keep editing" }).tap();
    release();
    await expect(page.getByText("Saved total 70.00 · A")).toBeVisible();
    await page.getByRole("link", { name: "Back to my teaching" }).tap();
    await expect(warning).toBeHidden();
    await expect(
      page.getByRole("table", { name: "Your course offerings" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "DEMO103", exact: true }).tap();
    await page.getByRole("button", { name: "Marks", exact: true }).tap();
    await ca.fill("22");
    await page.getByRole("button", { name: "Sign out" }).tap();
    await warning.getByRole("button", { name: "Leave without saving" }).tap();
    await expect(page).toHaveURL(/\/sign-in$/);
    expect(signOuts).toBe(1);
  });

  test("a rendering failure shows safe staff recovery and supports retry", async ({
    page,
  }) => {
    test.skip(
      process.env["UEMP_E2E_PRODUCTION"] === "1",
      "Component injection uses the development module server.",
    );
    const diagnostics: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") diagnostics.push(message.text());
    });
    // Inject a failing component only in the test browser; no failure switch ships in the app.
    const module = "**/src/features/dashboard/components/teaching-summary.tsx*";
    await page.route(module, (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: 'export function TeachingSummary() { if (!sessionStorage.getItem("uemp:e2e:render-recovered")) throw new Error("synthetic-sensitive-record"); return null; }',
      }),
    );
    await signIn(page, staff, "lecturer", "We couldn’t display this page");
    await expect(page.locator("body")).not.toContainText("synthetic-sensitive-record");
    expect(diagnostics.join(" ")).not.toContain("synthetic-sensitive-record");
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
    await layout(page, "staff-recovery");
    await page.evaluate(() =>
      sessionStorage.setItem("uemp:e2e:render-recovered", "yes"),
    );
    await page.getByRole("button", { name: "Try again", exact: true }).tap();
    await expect(page.getByRole("heading", { name: "Staff overview" })).toBeVisible();
    await page.unroute(module);
    await page.reload();
    await expect(
      page
        .getByRole("region", { name: "Teaching dashboard" })
        .getByText("Assigned offerings", { exact: true }),
    ).toBeVisible();
  });

  test("failed marks stay protected and a successful retry resumes queued navigation", async ({
    page,
  }) => {
    const { ca, exam, warning } = await openMarks(page);
    await ca.fill("26");
    await exam.fill("45");
    let attempts = 0;
    let release = () => {};
    let gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/v1/lecturer/results/*/marks", async (route) => {
      const attempt = ++attempts;
      await gate;
      if (attempt === 1)
        await route.fulfill({
          status: 503,
          json: { statusCode: 503, message: "Marks could not be saved. Try again." },
        });
      else await route.continue();
    });
    await page.getByRole("button", { name: "Save marks" }).tap();
    await expect(ca).toBeDisabled();
    await page.getByRole("link", { name: "Back to my teaching" }).tap();
    await expect(
      warning.getByRole("button", { name: "Leave without saving" }),
    ).toBeDisabled();
    release();
    await expect(
      warning.getByRole("button", { name: "Leave without saving" }),
    ).toBeEnabled();
    await warning.getByRole("button", { name: "Keep editing" }).tap();
    await expect(
      page.getByRole("alert").getByText("Marks could not be saved. Try again."),
    ).toBeVisible();
    await expect(ca).toHaveValue("26");
    await expect(exam).toHaveValue("45");
    gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.getByRole("button", { name: "Save marks" }).tap();
    await expect(ca).toBeDisabled();
    await page.getByRole("link", { name: "Back to my teaching" }).tap();
    await expect(warning).toBeVisible();
    release();
    // No further confirmation is needed after the backend has accepted every edit.
    await expect(page).toHaveURL(staff + "/workspaces/teaching");
    await expect(warning).toBeHidden();
    await page.getByRole("link", { name: "DEMO103", exact: true }).tap();
    await page.getByRole("button", { name: "Marks", exact: true }).tap();
    await expect(ca).toHaveValue("26");
    await expect(exam).toHaveValue("45");
    await ca.fill("28");
    await page.getByRole("button", { name: "Discard edits" }).tap();
    await expect(ca).toHaveValue("26");
    let prompts = 0;
    page.on("dialog", async (dialog) => {
      prompts++;
      await dialog.dismiss();
    });
    await page.reload({ timeout: 5_000 });
    expect(prompts).toBe(0);
    await page.getByRole("link", { name: "Back to my teaching" }).tap();
    await expect(page).toHaveURL(staff + "/workspaces/teaching");
    await expect(warning).toBeHidden();
  });

  test("sign-out waits for a pending save and runs once after it completes", async ({
    page,
  }) => {
    const { ca, exam, warning } = await openMarks(page);
    await ca.fill("25");
    await exam.fill("46");
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const order: string[] = [];
    page.on("response", (response) => {
      if (response.url().endsWith("/marks") && response.status() === 200)
        order.push("marks saved");
    });
    page.on("request", (request) => {
      if (request.url().endsWith("/auth/sign-out")) order.push("signed out");
    });
    await page.route("**/v1/lecturer/results/*/marks", async (route) => {
      await gate;
      await route.continue();
    });
    await page.getByRole("button", { name: "Save marks" }).tap();
    await expect(ca).toBeDisabled();
    await page.getByRole("button", { name: "Sign out" }).tap();
    await expect(
      warning.getByRole("button", { name: "Leave without saving" }),
    ).toBeDisabled();
    expect(order).toEqual([]);
    release();
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(warning).toBeHidden();
    expect(order).toEqual(["marks saved", "signed out"]);
    await signIn(page, staff, "lecturer");
    await page.getByRole("link", { name: "Open my teaching" }).tap();
    await page.getByRole("link", { name: "DEMO103", exact: true }).tap();
    await page.getByRole("button", { name: "Marks", exact: true }).tap();
    await expect(ca).toHaveValue("25");
    await expect(exam).toHaveValue("46");
  });

  test("an invalidated staff session exits a dirty editor without a navigation deadlock", async ({
    page,
    request,
  }) => {
    const headers = await demoAdminHeaders(request, "super-admin");
    const directory = await request.get(apiOrigin + "/v1/admin/users", { headers });
    expect(directory.status()).toBe(200);
    const { items } = await directory.json();
    const account = items.find(
      (item: { email: string }) => item.email === "lecturer@demo.example.test",
    );
    expect(account?.id).toBeTruthy();
    const { ca, warning } = await openMarks(page);
    await ca.fill("25");
    await page.getByRole("spinbutton", { name: /^Exam for / }).fill("46");
    if (await page.getByRole("button", { name: "Save marks" }).isEnabled()) {
      await page.getByRole("button", { name: "Save marks" }).tap();
      await expect(page.getByText("Saved total 71.00 · A")).toBeVisible();
    }
    await ca.fill("29");
    const revoked = await request.post(
      apiOrigin + "/v1/admin/users/" + account.id + "/revoke-sessions",
      { headers },
    );
    expect(revoked.status()).toBe(204);
    await page.getByRole("button", { name: "Save marks" }).tap();
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(warning).toBeHidden();
    await expect(page.getByRole("spinbutton")).toHaveCount(0);
    await signIn(page, staff, "lecturer");
    await page.getByRole("link", { name: "Open my teaching" }).tap();
    await page.getByRole("link", { name: "DEMO103", exact: true }).tap();
    await page.getByRole("button", { name: "Marks", exact: true }).tap();
    await expect(ca).toHaveValue("25");
    await expect(page.getByRole("button", { name: "Save marks" })).toBeDisabled();
  });

  test("a root rendering failure recovers through a safe full reload", async ({
    page,
  }) => {
    test.skip(
      process.env["UEMP_E2E_PRODUCTION"] === "1",
      "Component injection uses the development module server.",
    );
    await signIn(page, staff, "lecturer");
    const diagnostics: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") diagnostics.push(message.text());
    });
    const module = "**/src/features/auth/provider.tsx*";
    await page.route(module, (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: 'export function AuthProvider() { throw new Error("synthetic-root-record"); } export function useAuth() { throw new Error("synthetic-root-record"); }',
      }),
    );
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "We couldn’t display this page" }),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText("synthetic-root-record");
    expect(diagnostics.join(" ")).not.toContain("synthetic-root-record");
    // The root recovery has no staff shell; verify the narrow landscape layout directly.
    await page.setViewportSize({ width: 568, height: 320 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(568);
    await page.screenshot({
      path: test.info().outputPath("root-recovery-landscape.png"),
      fullPage: true,
    });
    await page.unroute(module);
    await page.getByRole("button", { name: "Try again", exact: true }).tap();
    await expect(page.getByRole("heading", { name: "Staff overview" })).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Teaching dashboard" })
        .getByText("Assigned offerings", { exact: true }),
    ).toBeVisible();
  });
});
