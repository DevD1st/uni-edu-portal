import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type APIResponse, type Page } from "@playwright/test";
import type { components } from "../packages/api-contracts/src/generated";
import { apiOrigin, demoAdminHeaders } from "./support/demo-api";
import { adminOrigin as origin } from "./support/origins";

type Dto<Name extends keyof components["schemas"]> = components["schemas"][Name];

async function read<T>(response: Promise<APIResponse>): Promise<T> {
  const result = await response;
  expect([200, 201]).toContain(result.status());
  return result.json() as Promise<T>;
}

async function signIn(page: Page, account: string) {
  const password = process.env["UEMP_E2E_PASSWORD"];
  if (!password) throw new Error("Set UEMP_E2E_PASSWORD for the disposable demo.");
  await page.goto(origin);
  await page.getByLabel("Email address").fill(account + "@demo.example.test");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).tap();
  await expect(page.getByRole("heading", { name: "Staff overview" })).toBeVisible();
}

async function verifyLayout(page: Page) {
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
  }
}

test.describe("staff permission and state regressions", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("review scopes retain inactive departments, drafts survive roster paging, and a lecturer can approve their own submission", async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);
    const headers = await demoAdminHeaders(request, "super-admin");
    const setup = await read<Dto<"AcademicSetupResponseDto">>(
      request.get(apiOrigin + "/v1/admin/academic", { headers }),
    );
    const department = setup.departments.find(({ name }) => name === "Demo Computing");
    if (!department) throw new Error("The demo Computing department is required.");
    const queue = await read<Dto<"ResultGroupPageDto">>(
      request.get(apiOrigin + "/v1/admin/results", {
        headers,
        params: { departmentId: department.id },
      }),
    );
    const group = queue.items.find(({ code }) => code === "DEMO106");
    if (!group) throw new Error("DEMO106 must be awaiting review.");
    const suffix = randomUUID().slice(0, 8);
    const role = await read<Dto<"RoleResponseDto">>(
      request.post(apiOrigin + "/v1/admin/roles", {
        headers,
        data: { name: "approval-check-" + suffix, privileges: ["approve_result"] },
      }),
    );
    const archive = await read<Dto<"DepartmentSetupResponseDto">>(
      request.post(apiOrigin + "/v1/admin/academic/departments", {
        headers,
        data: {
          facultyId: department.facultyId,
          name: "Review Archive " + suffix,
          status: "active",
        },
      }),
    );
    const grantPath = apiOrigin + "/v1/admin/admins/" + group.lecturerId + "/roles";
    const otherGrant = await read<Dto<"RoleAssignmentResponseDto">>(
      request.post(grantPath, {
        headers,
        data: { roleId: role.id, departmentId: archive.id },
      }),
    );
    const resultPath = apiOrigin + "/v1/admin/results/" + group.id;
    let ownGrant: Dto<"RoleAssignmentResponseDto"> | undefined;
    try {
      await read(
        request.put(apiOrigin + "/v1/admin/academic/departments/" + archive.id, {
          headers,
          data: {
            facultyId: department.facultyId,
            name: archive.name,
            status: "inactive",
          },
        }),
      );
      const lecturerHeaders = await demoAdminHeaders(request, "lecturer");
      const options = await read<Dto<"ResultReviewOptionsDto">>(
        request.get(apiOrigin + "/v1/admin/results/options", {
          headers: lecturerHeaders,
        }),
      );
      expect(options.departments).toEqual([{ id: archive.id, name: archive.name }]);
      const forbidden = await request.get(resultPath, { headers: lecturerHeaders });
      expect(forbidden.status()).toBe(403);
      const deniedApproval = await request.post(resultPath + "/approve", {
        headers: lecturerHeaders,
        data: {},
      });
      expect(deniedApproval.status()).toBe(403);
      await signIn(page, "lecturer");
      await expect(
        page.getByRole("region", { name: "Review dashboard" }),
      ).toBeVisible();
      await expect(
        page.getByRole("region", { name: "Academic dashboard" }),
      ).toHaveCount(0);
      await page.goto(origin + "/workspaces/result-review");
      await expect(
        page.getByLabel("Department", { exact: true }).getByRole("option"),
      ).toHaveText([archive.name]);
      await page.goto(origin + "/workspaces/result-review/" + group.id);
      await expect(
        page
          .getByRole("alert")
          .getByText("Couldn’t load result group", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Approve and publish", exact: true }),
      ).toHaveCount(0);
      await page.getByRole("button", { name: "Sign out" }).tap();
      await expect(page).toHaveURL(/\/sign-in$/);

      ownGrant = await read<Dto<"RoleAssignmentResponseDto">>(
        request.post(grantPath, {
          headers,
          data: { roleId: role.id, departmentId: department.id },
        }),
      );
      await read(
        request.post(resultPath + "/reopen", {
          headers,
          data: { reason: "mark_correction" },
        }),
      );
      // A one-row API page exercises real roster pagination without manufacturing response data.
      await page.route("**/v1/lecturer/offerings/*/roster**", async (route) => {
        const url = new URL(route.request().url());
        url.searchParams.set("limit", "1");
        await route.continue({ url: url.toString() });
      });
      await signIn(page, "lecturer");
      await page.goto(origin + "/workspaces/teaching/" + group.offeringId);
      await expect(
        page.getByRole("table", { name: "Enrolled students" }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Marks", exact: true }).tap();
      const ca = page.getByRole("spinbutton", { name: /^CA for / }).first();
      const saved = await ca.inputValue();
      await ca.fill("27");
      await page.getByRole("button", { name: "Class roster", exact: true }).tap();
      await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
      await page.getByRole("button", { name: "Marks", exact: true }).tap();
      await expect(ca).toHaveValue("27");
      await expect(
        page.getByRole("button", { name: "Refresh results" }),
      ).toBeDisabled();
      await verifyLayout(page);
      await page.getByRole("button", { name: "Discard edits" }).tap();
      await expect(ca).toHaveValue(saved);
      await page.getByRole("button", { name: "Class roster", exact: true }).tap();
      await page.getByRole("button", { name: "Next page" }).tap();
      await expect(page.getByText("Page 2", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Marks", exact: true }).tap();
      await page.getByRole("button", { name: "Submit for review" }).tap();
      await page
        .getByRole("dialog", { name: "Submit results for review" })
        .getByRole("button", { name: "Submit results", exact: true })
        .tap();
      await expect(page.getByText("Awaiting review", { exact: true })).toBeVisible();
      await page.goto(origin + "/workspaces/result-review/" + group.id);
      await expect(
        page.getByRole("button", { name: "Request corrections", exact: true }),
      ).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Reopen results" })).toHaveCount(0);
      await page
        .getByRole("button", { name: "Approve and publish", exact: true })
        .tap();
      await page
        .getByRole("dialog", { name: "Approve and publish results" })
        .getByRole("button", { name: "Approve and publish results", exact: true })
        .tap();
      await expect(page.getByText("Results published.", { exact: true })).toBeVisible();
      await verifyLayout(page);
      await page.goto(origin + "/workspaces/teaching/missing/nested");
      await expect(page.getByText("Page not found", { exact: true })).toBeVisible();
      await page.getByRole("link", { name: "Back to my teaching" }).tap();
      await expect(
        page.getByRole("table", { name: "Your course offerings" }),
      ).toBeVisible();
    } finally {
      const current = await read<Dto<"ResultGroupDetailDto">>(
        request.get(resultPath, { headers }),
      );
      if (current.status !== "submitted") {
        if (current.status === "approved")
          await read(
            request.post(resultPath + "/reopen", {
              headers,
              data: { reason: "mark_correction" },
            }),
          );
        const lecturerHeaders = await demoAdminHeaders(request, "lecturer");
        await read(
          request.post(apiOrigin + "/v1/lecturer/results/" + group.id + "/submit", {
            headers: lecturerHeaders,
            data: {},
          }),
        );
      }
      for (const grant of [ownGrant, otherGrant]) {
        if (grant)
          expect(
            (await request.delete(grantPath + "/" + grant.id, { headers })).status(),
          ).toBe(204);
      }
      expect(
        (
          await request.delete(apiOrigin + "/v1/admin/roles/" + role.id, { headers })
        ).status(),
      ).toBe(204);
    }
  });

  test("all staff workspaces fit phones through desktop and pass accessibility checks in both themes", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await signIn(page, "super-admin");
    for (const [slug, ready] of [
      ["academics", "Faculties"],
      ["registration", "Department registrations"],
      ["accounts", "Student accounts"],
      ["roles", "Roles"],
      ["reports", "Course performance"],
      ["audit", "Administrative audit events"],
    ]) {
      await page.goto(origin + "/workspaces/" + slug);
      await expect(
        page
          .getByRole("heading", { name: ready, exact: true })
          .or(page.getByRole("table", { name: ready, exact: true }))
          .first(),
      ).toBeVisible();
      await expect(page.getByText(/^Loading /)).toHaveCount(0);
      await expect(page.getByRole("alert")).toHaveCount(0);
      await verifyLayout(page);
    }
  });
});
