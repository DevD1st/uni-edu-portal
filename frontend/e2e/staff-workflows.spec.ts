import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

const origin = "http://localhost:3002";
const password = process.env["UEMP_E2E_PASSWORD"];
const accountPassword = "Staff demo password 42";

async function signIn(page: Page, account: string, secret = password) {
  if (!secret)
    throw new Error("Set UEMP_E2E_PASSWORD for the disposable demo backend.");
  await page.goto(origin);
  await page.getByLabel("Email address").fill(account + "@demo.example.test");
  await page.getByLabel("Password", { exact: true }).fill(secret);
  await page.getByRole("button", { name: "Sign in", exact: true }).tap();
  await expect(page.getByRole("heading", { name: "Staff overview" })).toBeVisible();
}

async function navigate(page: Page, label: string) {
  await page.getByRole("button", { name: "Open navigation" }).tap();
  const drawer = page.getByRole("dialog", { name: "Navigation" });
  await drawer.getByRole("link", { name: label, exact: true }).tap();
}

async function fitsPhone(page: Page, width: number) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(width);
}

test.describe("staff workflows on a phone", () => {
  test.use({
    actionTimeout: 15_000,
    viewport: { width: 320, height: 780 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });

  test("lecturer closes an assigned roster, saves marks, and submits", async ({
    page,
  }) => {
    await signIn(page, "lecturer");
    await navigate(page, "My teaching");
    await page
      .getByRole("table", { name: "Your course offerings" })
      .getByRole("link", { name: "DEMO103" })
      .tap();
    await expect(page.getByRole("table", { name: "Enrolled students" })).toBeVisible();
    await page.getByRole("button", { name: "Marks", exact: true }).tap();
    await expect(
      page.getByRole("button", { name: "Submit for review" }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "Class roster", exact: true }).tap();
    await page.getByRole("button", { name: "Close registration", exact: true }).tap();
    await page
      .getByRole("dialog", { name: "Close course registration" })
      .getByRole("button", { name: "Close registration" })
      .tap();
    await expect(page.getByText("Registration closed.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Marks", exact: true }).tap();
    await page.getByRole("spinbutton", { name: /^CA for / }).fill("24");
    await page.getByRole("spinbutton", { name: /^Exam for / }).fill("48");
    await fitsPhone(page, 320);
    await page.getByRole("button", { name: "Save marks" }).tap();
    await expect(page.getByText("Saved total 72.00 · A")).toBeVisible();
    await page.getByRole("button", { name: "Submit for review" }).tap();
    await page
      .getByRole("dialog", { name: "Submit results for review" })
      .getByRole("button", { name: "Submit results" })
      .tap();
    await expect(page.getByText("Awaiting review", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save marks" })).toHaveCount(0);
    await page.goto(origin + "/workspaces/result-review");
    await expect(
      page.getByRole("heading", { name: "Access restricted" }),
    ).toBeVisible();
  });

  test("HOD reviews results, registers a student, and provisions a lecturer in scope", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await signIn(page, "hod");
    await navigate(page, "Result review");
    await page
      .getByRole("table", { name: "Departmental results" })
      .getByRole("link", { name: "DEMO103" })
      .tap();
    await page.getByRole("button", { name: "Request corrections", exact: true }).tap();
    const correction = page.getByRole("dialog", { name: "Request corrections" });
    await correction
      .getByLabel("Correction feedback")
      .fill("Verify the saved exam score.");
    await correction.getByRole("button", { name: "Request corrections" }).tap();
    await expect(
      page.getByText("Verify the saved exam score.", { exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Back to result review" }).tap();
    await page
      .getByRole("table", { name: "Departmental results" })
      .getByRole("link", { name: "DEMO102" })
      .tap();
    await page.getByRole("button", { name: "Approve and publish", exact: true }).tap();
    await page
      .getByRole("dialog", { name: "Approve and publish results" })
      .getByRole("button", { name: "Approve and publish results" })
      .tap();
    await expect(page.getByText("Results published.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Reopen results" }).tap();
    const reopening = page.getByRole("dialog", { name: "Reopen result group" });
    await reopening.getByLabel("Reopening reason").selectOption("mark_correction");
    await reopening.getByRole("button", { name: "Reopen result group" }).tap();
    await expect(page.getByText("Results reopened.", { exact: true })).toBeVisible();

    await navigate(page, "Registration oversight");
    await expect(
      page.getByRole("table", { name: "Department registrations" }),
    ).toBeVisible();
    await page
      .getByRole("table", { name: "Students eligible for delegated registration" })
      .getByRole("link", { name: /student-nora/ })
      .tap();
    await page.getByRole("checkbox", { name: /DEMO104/ }).check();
    await page.getByRole("button", { name: "Review selection" }).tap();
    await page
      .getByRole("dialog", { name: "Confirm student registration" })
      .getByRole("button", { name: "Register courses" })
      .tap();
    await expect(page.getByText("Courses registered for the student.")).toBeVisible();

    await navigate(page, "Accounts");
    const suffix = randomUUID().slice(0, 8);
    const email = "lecturer-" + suffix + "@demo.example.test";
    await page.getByRole("button", { name: "Create staff account" }).tap();
    const creation = page.getByRole("dialog", { name: "Create staff account" });
    await creation.getByLabel("First name").fill("Provisioned");
    await creation.getByLabel("Last name").fill(suffix);
    await creation.getByLabel("Email address").fill(email);
    await creation.getByLabel("Initial password").fill(accountPassword);
    await expect(creation.getByText(/receive the Lecturer role/)).toBeVisible();
    await creation.getByRole("button", { name: "Create account", exact: true }).tap();
    await expect(page.getByText("Staff account created.")).toBeVisible();
    await page.getByRole("button", { name: "Staff", exact: true }).tap();
    await page.getByRole("link", { name: "Provisioned " + suffix }).tap();
    await page.getByRole("button", { name: "Edit profile" }).tap();
    const edit = page.getByRole("dialog", { name: "Edit profile" });
    await expect(edit.getByLabel("Email address")).toHaveCount(0);
    await edit.getByLabel("First name").fill("Updated");
    await edit.getByRole("button", { name: "Save profile" }).tap();
    await expect(
      page.getByRole("heading", { name: "Updated " + suffix }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Assign role" })).toHaveCount(0);
    await fitsPhone(page, 320);
    await page.goto(origin + "/workspaces/audit");
    await expect(
      page.getByRole("heading", { name: "Access restricted" }),
    ).toBeVisible();
  });

  test("Super Admin configures academics and delegates a scoped report role", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, "super-admin");
    await navigate(page, "Academic setup");
    const suffix = randomUUID().slice(0, 8);
    const faculty = "Demo Faculty " + suffix;
    await page.getByRole("button", { name: "Add faculty" }).tap();
    const facultyForm = page.getByRole("dialog", { name: "Add faculty" });
    await facultyForm.getByLabel("Faculty name").fill(faculty);
    await facultyForm.getByRole("button", { name: "Create faculty" }).tap();
    await expect(page.getByRole("heading", { name: faculty })).toBeVisible();
    await page.getByRole("button", { name: "Departments", exact: true }).tap();
    await page.getByRole("button", { name: "Add department" }).tap();
    const departmentForm = page.getByRole("dialog", { name: "Add department" });
    await departmentForm.getByLabel("Faculty").selectOption({ label: faculty });
    const department = "Demo Department " + suffix;
    await departmentForm.getByLabel("Department name").fill(department);
    await departmentForm.getByRole("button", { name: "Create department" }).tap();
    await expect(page.getByRole("heading", { name: department })).toBeVisible();
    await fitsPhone(page, 390);

    await page.getByRole("button", { name: "Course catalog", exact: true }).tap();
    await page.getByRole("button", { name: "Add course", exact: true }).tap();
    const courseForm = page.getByRole("dialog", { name: "Add course" });
    const courseCode = "MOB" + suffix.toUpperCase();
    const courseName = "Mobile course " + suffix;
    await courseForm.getByLabel("Course code").fill(courseCode);
    await courseForm.getByLabel("Course title").fill(courseName);
    await courseForm.getByLabel("Credit units").fill("3");
    await courseForm.getByRole("button", { name: "Create course" }).tap();
    await expect(
      page.getByRole("heading", { name: courseCode + " · " + courseName }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Curriculum", exact: true }).tap();
    await page.getByRole("button", { name: "Add curriculum link" }).tap();
    const curriculumForm = page.getByRole("dialog", { name: "Add curriculum link" });
    await curriculumForm
      .getByLabel("Programme")
      .selectOption({ label: "Demo Computer Science" });
    await curriculumForm
      .getByLabel("Course", { exact: true })
      .selectOption({ label: courseCode + " · " + courseName });
    await curriculumForm.getByRole("button", { name: "Create curriculum link" }).tap();
    await expect(
      page.getByRole("heading", { name: courseName, exact: true }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Offerings", exact: true }).tap();
    await page.getByRole("button", { name: "Add offering" }).tap();
    const offeringForm = page.getByRole("dialog", { name: "Add offering" });
    await offeringForm
      .getByLabel("Department")
      .selectOption({ label: "Demo Computing" });
    await offeringForm
      .getByLabel("Course", { exact: true })
      .selectOption({ label: courseCode + " · " + courseName });
    await offeringForm
      .getByLabel("Semester", { exact: true })
      .selectOption({ index: 1 });
    await offeringForm
      .getByLabel("Academic level")
      .selectOption({ label: "100 Level · undergrad" });
    await offeringForm.getByLabel("Lecturer").selectOption({ label: "Demo lecturer" });
    await offeringForm.getByLabel("Status", { exact: true }).selectOption("active");
    await offeringForm.getByRole("button", { name: "Create offering" }).tap();
    await expect(
      page.getByRole("heading", { name: courseCode + " · " + courseName }),
    ).toBeVisible();

    await navigate(page, "Roles");
    const role = "reporter-" + suffix;
    await page.getByRole("button", { name: "Create custom role" }).tap();
    const roleForm = page.getByRole("dialog", { name: "Create custom role" });
    await roleForm.getByLabel("Role name").fill(role);
    await roleForm.getByRole("checkbox", { name: "read reports", exact: true }).check();
    await roleForm.getByRole("button", { name: "Save role" }).tap();
    await expect(page.getByRole("heading", { name: role })).toBeVisible();

    await navigate(page, "Accounts");
    await page.getByRole("button", { name: "Create staff account" }).tap();
    const account = "reporter-" + suffix;
    const create = page.getByRole("dialog", { name: "Create staff account" });
    await create.getByLabel("First name").fill("Reporter");
    await create.getByLabel("Last name").fill(suffix);
    await create.getByLabel("Email address").fill(account + "@demo.example.test");
    await create.getByLabel("Initial password").fill(accountPassword);
    await create.getByRole("button", { name: "Create account", exact: true }).tap();
    await expect(page.getByText("Staff account created.")).toBeVisible();
    await page.getByRole("button", { name: "Staff", exact: true }).tap();
    await page.getByRole("link", { name: "Reporter " + suffix }).tap();
    await page.getByRole("button", { name: "Assign role", exact: true }).tap();
    const assignment = page.getByRole("dialog", { name: "Assign staff role" });
    await assignment.getByLabel("Scope").selectOption({ label: "Demo Computing" });
    await assignment.getByLabel("Role").selectOption({ label: role });
    await assignment.getByRole("button", { name: "Assign role" }).tap();
    await expect(page.getByRole("heading", { name: role })).toBeVisible();

    await navigate(page, "Audit trail");
    await page.getByLabel("Action", { exact: true }).fill("admin.role.assign");
    await page.getByRole("button", { name: "Apply filters" }).tap();
    await page
      .getByRole("table", { name: "Administrative audit events" })
      .getByRole("link", { name: "admin.role.assign" })
      .first()
      .tap();
    await expect(
      page.getByRole("heading", { name: "admin.role.assign" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign out" }).tap();
    await expect(page).toHaveURL(/\/sign-in$/);

    await signIn(page, account, accountPassword);
    await expect(
      page
        .getByRole("region", { name: "Academic dashboard" })
        .getByText("Students registered", { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Report department").getByRole("option")).toHaveText([
      "Demo Computing",
    ]);
    await expect(page.getByRole("region", { name: "Teaching dashboard" })).toHaveCount(
      0,
    );
    await expect(page.getByRole("region", { name: "Review dashboard" })).toHaveCount(0);
    await navigate(page, "Reports");
    await expect(
      page
        .getByRole("region", { name: "Academic overview" })
        .getByText("Published grades", { exact: true }),
    ).toBeVisible();
    const departments = page
      .getByLabel("Department", { exact: true })
      .getByRole("option");
    await expect(departments).toHaveCount(1);
    await expect(departments.first()).toHaveText("Demo Computing");
    await expect(page.getByRole("table", { name: "Course performance" })).toBeVisible();
    await fitsPhone(page, 390);
    await page.goto(origin + "/workspaces/academics");
    await expect(
      page.getByRole("heading", { name: "Access restricted" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).tap();
    await signIn(page, "super-admin");
    await navigate(page, "Accounts");
    await page.getByRole("button", { name: "Staff", exact: true }).tap();
    await page.getByRole("link", { name: "Reporter " + suffix }).tap();
    await page.getByRole("button", { name: "Revoke assignment" }).tap();
    await page
      .getByRole("dialog", { name: "Revoke staff role" })
      .getByRole("button", { name: "Revoke assignment" })
      .tap();
    await expect(page.getByRole("heading", { name: role })).toHaveCount(0);
  });
});
