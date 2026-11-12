import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { apiOrigin } from "./support/demo-api";
import { studentOrigin } from "./support/origins";
import { readResultHistory } from "../apps/student/src/features/results/contracts";
import { readRegistrationHistory } from "../apps/student/src/features/registration/contracts";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test("student overview charts inspect real published grades and registered units on mobile", async ({
  page,
  request,
}) => {
  const password = process.env["UEMP_E2E_PASSWORD"];
  if (!password)
    throw new Error("Set UEMP_E2E_PASSWORD for the disposable demo backend.");
  // Read expectations before browser sign-in rotates this account's token family.
  const login = await request.post(apiOrigin + "/v1/auth/sign-in", {
    data: { email: "student-maya@demo.example.test", password, role: "student" },
  });
  expect(login.status()).toBe(200);
  const session = await login.json();
  const headers = { Authorization: "Bearer " + session.access.token };
  const [resultsResponse, registrationResponse] = await Promise.all([
    request.get(apiOrigin + "/v1/student/results", { headers }),
    request.get(apiOrigin + "/v1/student/registrations", { headers }),
  ]);
  expect(resultsResponse.status()).toBe(200);
  expect(registrationResponse.status()).toBe(200);
  const history = readResultHistory(await resultsResponse.json());
  const registered = readRegistrationHistory(await registrationResponse.json());
  const latest = history.terms.find(
    (term) => term.approvedUnits > 0 && term.gpa !== null,
  );
  const latestRegistration = registered.terms[0];
  if (!latest || latest.gpa === null || !latestRegistration)
    throw new Error("The chart demo needs a published semester and a registration.");

  await page.goto(studentOrigin + "/sign-in");
  await page.getByLabel("Email address").fill("student-maya@demo.example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).tap();
  await expect(page).toHaveURL(/\/overview$/);

  const gpa = page.getByRole("figure", {
    name: "Published GPA by semester",
    exact: true,
  });
  const plot = gpa.getByRole("button", { name: "Explore Published GPA by semester" });
  await plot.tap();
  await plot.focus();
  await plot.press("End");
  await expect(gpa.getByRole("status")).toContainText(
    latest.gpa.toFixed(2) + " / 5.00",
  );
  await expect(gpa.getByRole("status")).toContainText(
    latest.semesterName + " · " + latest.academicSession,
  );
  await expect(gpa.getByRole("status")).toContainText(
    latest.approvedUnits + " approved credit units",
  );
  await expect(
    gpa.getByRole("link", { name: "Open semester results" }),
  ).toHaveAttribute("href", "/results/" + latest.semesterId);
  await gpa.getByText("View data table", { exact: true }).tap();
  const table = gpa.getByRole("table", { name: "Published GPA by semester data" });
  await expect(table).toBeVisible();
  const publishedCount = history.terms.filter(
    (term) => term.approvedUnits > 0 && term.gpa !== null,
  ).length;
  await expect(table.locator("tbody tr")).toHaveCount(Math.min(publishedCount, 6));

  const load = page.getByRole("figure", {
    name: "Registered credit load",
    exact: true,
  });
  const bars = load.getByRole("button");
  const lastBar = bars.filter({ hasNotText: "View data table" }).last();
  await lastBar.tap();
  await lastBar.press("End");
  await expect(load.getByRole("status")).toContainText(
    String(latestRegistration.totalUnits),
  );
  await expect(load.getByRole("status")).toContainText(
    latestRegistration.semesterName + " · " + latestRegistration.academicSession,
  );
  await expect(
    load.getByRole("link", { name: "Open semester registration" }),
  ).toHaveAttribute("href", "/registration/" + latestRegistration.semesterId);

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ["light", "dark"]) {
    await page.getByLabel("Color theme").selectOption(theme);
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
      path: test.info().outputPath("student-overview-charts-" + theme + ".png"),
      fullPage: true,
    });
  }

  await gpa.getByRole("link", { name: "Open semester results" }).tap();
  await expect(
    page.getByRole("heading", { name: "Result statement", exact: true }),
  ).toBeVisible();
});

test("a student without academic history sees useful chart empty states", async ({
  page,
}) => {
  const password = process.env["UEMP_E2E_PASSWORD"];
  if (!password)
    throw new Error("Set UEMP_E2E_PASSWORD for the disposable demo backend.");
  await page.goto(studentOrigin + "/sign-in");
  await page.getByLabel("Email address").fill("student-nora@demo.example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).tap();
  await expect(page).toHaveURL(/\/overview$/);
  const grades = page.getByRole("figure", {
    name: "Published GPA by semester",
    exact: true,
  });
  await expect(grades).toContainText(
    "Your GPA history will appear when your first results are approved.",
  );
  await expect(
    grades.getByRole("button", { name: "Explore Published GPA by semester" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("figure", { name: "Registered credit load", exact: true }),
  ).toContainText(
    "Your credit-load comparison will appear after your first course registration.",
  );
});
