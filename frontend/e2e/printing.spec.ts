import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { studentOrigin } from "./support/origins";
import { openPrintView } from "./support/print-view";
import { signIn } from "./support/session-browser";

test("print views contain complete records, fit paper, and call the browser print dialog", async ({
  page,
}) => {
  await signIn(page);
  for (const [section, label, caption] of [
    ["registration", "Print registration summary", "Registered courses"],
    ["results", "Print result statement", "Published grades"],
  ] as const) {
    await page.goto(studentOrigin + "/" + section);
    await page.getByRole("link", { name: /First Semester/ }).click();
    const view = await openPrintView(page, label);
    await expect(
      view.getByRole("definition").filter({ hasText: "Maya" }),
    ).toBeVisible();
    for (const name of [
      "Student name",
      "Matriculation number",
      "Department",
      "Programme",
      "Academic level",
    ])
      await expect(view.getByText(name, { exact: true })).toBeVisible();
    await expect(view.getByText(/First Semester · \d{4}\/\d{4}/)).toBeVisible();
    await expect(view.getByText(/Generated/)).toBeVisible();
    if (section === "results") {
      const averages = view.locator('dl[aria-label="Academic averages"]');
      for (const name of ["Semester GPA", "Cumulative GPA"])
        await expect(
          averages
            .locator("div")
            .filter({ has: view.getByText(name, { exact: true }) })
            .getByRole("definition"),
        ).toHaveText("4.00 / 5.00");
      await expect(
        view.getByRole("columnheader", { name: "Grade points" }),
      ).toBeVisible();
      await expect(
        view.getByRole("row", { name: /DEMO105.*65\.00.*B.*4\.00/ }),
      ).toBeVisible();
      await expect(view.getByText("DEMO106")).toHaveCount(0);
    }
    for (const mode of ["light", "dark"]) {
      await view.evaluate((theme) => {
        document.documentElement.dataset["theme"] = theme;
      }, mode);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await view.setViewportSize({ width, height: 900 });
        expect(
          await view.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);
        if (section === "results" && width === 320) {
          const region = view.getByRole("region", { name: "Published grades" });
          expect(
            await region.evaluate(
              (element) => element.scrollWidth > element.clientWidth,
            ),
          ).toBe(true);
          await region.evaluate((element) => {
            element.scrollLeft = element.scrollWidth;
          });
          await expect(
            view.getByRole("columnheader", { name: "Grade points" }),
          ).toBeInViewport();
          await region.evaluate((element) => {
            element.scrollLeft = 0;
          });
        }
      }
      const result = await new AxeBuilder({ page: view })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(result.violations.map(({ id }) => id)).toEqual([]);
    }
    await view.evaluate(() => {
      window.print = () => {
        document.body.dataset["printed"] = "yes";
      };
    });
    await view.getByRole("button", { name: "Print", exact: true }).click();
    await expect(view.locator("body")).toHaveAttribute("data-printed", "yes");
    await view.setViewportSize({ width: 794, height: 1123 });
    await view.emulateMedia({ media: "print" });
    await expect(view.getByRole("button", { name: "Print", exact: true })).toBeHidden();
    await expect(view.getByRole("link", { name: /^Back to/ })).toBeHidden();
    const table = view.getByRole("table", { name: caption });
    await expect(table).toBeVisible();
    expect(
      await table.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
    ).toBe(true);
    expect(
      await view
        .locator("html")
        .evaluate((element) => getComputedStyle(element).colorScheme),
    ).toBe("light");
    await view.close();
  }
});

test("print routes require a student session and reject invalid or unavailable terms", async ({
  page,
  request,
}) => {
  for (const section of ["registration", "results"]) {
    const response = await request.get(
      studentOrigin + "/" + section + "/0191e192-67ad-746b-9acb-c850234b408a/print",
      { maxRedirects: 0 },
    );
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toBe("/sign-in");
  }
  await signIn(page);
  for (const section of ["registration", "results"]) {
    for (const id of ["invalid", "0191e192-67ad-746b-9acb-c850234b408a"]) {
      const response = await page.goto(
        studentOrigin + "/" + section + "/" + id + "/print",
      );
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("table")).toHaveCount(0);
    }
  }
});
