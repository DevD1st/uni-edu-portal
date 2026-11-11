import { randomUUID } from "node:crypto";
import { expect, test, type APIResponse, type Locator } from "@playwright/test";
import type { Dto } from "../packages/api-contracts/src/response";
import { apiOrigin, demoAdminHeaders } from "./support/demo-api";
import { studentOrigin } from "./support/origins";

async function read<T>(response: Promise<APIResponse>): Promise<T> {
  const result = await response;
  expect([200, 201]).toContain(result.status());
  return result.json() as Promise<T>;
}

async function expectPlacement(panel: Locator, names: string[]) {
  for (const name of names)
    await expect(panel.getByText(name, { exact: true })).toBeVisible();
  await expect(panel.getByText("Unavailable", { exact: true })).toHaveCount(0);
}

test("student placement labels survive inactive records without reopening signup choices", async ({
  page,
  request,
}) => {
  const headers = await demoAdminHeaders(request, "super-admin");
  const academic = apiOrigin + "/v1/admin/academic";
  const setup = await read<Dto<"AcademicSetupResponseDto">>(
    request.get(academic, { headers }),
  );
  const level = setup.levels.find(
    (item) =>
      item.programType === "undergrad" && item.stage === 1 && item.status === "active",
  );
  if (!level) throw new Error("An active first-year undergraduate level is required.");
  const suffix = randomUUID().slice(0, 8);
  const facultyInput: Dto<"FacultyWriteDto"> = {
    name: "Placement Faculty " + suffix,
    status: "active",
  };
  const faculty = await read<Dto<"FacultySetupResponseDto">>(
    request.post(academic + "/faculties", { headers, data: facultyInput }),
  );
  const departmentInput: Dto<"DepartmentWriteDto"> = {
    name: "Placement Department " + suffix,
    facultyId: faculty.id,
    status: "active",
  };
  const department = await read<Dto<"DepartmentSetupResponseDto">>(
    request.post(academic + "/departments", { headers, data: departmentInput }),
  );
  const programmeInput: Dto<"ProgrammeWriteDto"> = {
    name: "Placement Programme " + suffix,
    departmentId: department.id,
    programType: "undergrad",
    status: "active",
  };
  const programme = await read<Dto<"ProgrammeSetupResponseDto">>(
    request.post(academic + "/programmes", { headers, data: programmeInput }),
  );
  const password = "Placement example password 42";
  const input: Dto<"CreateStudentDto"> = {
    email: "placement-" + suffix + "@demo.example.test",
    password,
    firstName: "Placement",
    lastName: suffix,
    facultyId: faculty.id,
    departmentId: department.id,
    courseOfStudyId: programme.id,
    academicLevelId: level.id,
  };
  const student = await read<Dto<"UserResponseDto">>(
    request.post(apiOrigin + "/v1/admin/users/students", { headers, data: input }),
  );
  const names = [faculty.name, department.name, programme.name, level.displayName];

  try {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(studentOrigin + "/sign-in");
    await page.getByLabel("Email address").fill(input.email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expectPlacement(
      page.getByRole("region", { name: "Academic placement" }),
      names,
    );

    // These records still belong to the student after they stop accepting new placements.
    await read(
      request.put(academic + "/programmes/" + programme.id, {
        headers,
        data: { ...programmeInput, status: "inactive" },
      }),
    );
    await read(
      request.put(academic + "/departments/" + department.id, {
        headers,
        data: { ...departmentInput, status: "inactive" },
      }),
    );
    await read(
      request.put(academic + "/faculties/" + faculty.id, {
        headers,
        data: { ...facultyInput, status: "inactive" },
      }),
    );
    await read(
      request.put(academic + "/levels/" + level.id + "/status", {
        headers,
        data: { status: "inactive" },
      }),
    );
    const choices = await read<Dto<"AcademicReferencesResponseDto">>(
      request.get(apiOrigin + "/v1/academic-references"),
    );
    expect(choices.faculties.some(({ id }) => id === faculty.id)).toBe(false);
    expect(choices.departments.some(({ id }) => id === department.id)).toBe(false);
    expect(choices.programmes.some(({ id }) => id === programme.id)).toBe(false);
    expect(choices.levels.some(({ id }) => id === level.id)).toBe(false);

    await page.goto(studentOrigin + "/account");
    await expectPlacement(
      page.getByRole("region", { name: "Academic details" }),
      names,
    );
    await page.getByLabel("First name", { exact: true }).fill("Updated placement");
    await page.getByRole("button", { name: "Save profile", exact: true }).click();
    await expect(page.getByText("Your profile was updated.")).toBeVisible();
    await expectPlacement(
      page.getByRole("region", { name: "Academic details" }),
      names,
    );
    await page.goto(studentOrigin + "/overview");
    await expectPlacement(
      page.getByRole("region", { name: "Academic placement" }),
      names,
    );
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(320);
  } finally {
    // Levels are a shared taxonomy; restore availability for the other disposable-demo tests.
    await read(
      request.put(academic + "/levels/" + level.id + "/status", {
        headers,
        data: { status: level.status },
      }),
    );
    const deletion = await request.delete(apiOrigin + "/v1/admin/users/" + student.id, {
      headers,
    });
    expect(deletion.status()).toBe(204);
  }
});
