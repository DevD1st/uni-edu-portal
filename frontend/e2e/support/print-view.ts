import { expect, type Page } from "@playwright/test";

export async function openPrintView(page: Page, label: string) {
  const opened = page.waitForEvent("popup");
  await page.getByRole("link", { name: label }).click();
  const view = await opened;
  await expect(view.getByRole("button", { name: "Print", exact: true })).toBeVisible();
  await expect(view.getByRole("navigation")).toHaveCount(0);
  return view;
}
