import { expect, test } from "@playwright/test";

test("old learning trail links return to the regular game", { tag: ["@browser", "@mobile", "@webkit"] }, async ({ page }) => {
  await page.goto("/experiments");
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.getByRole("heading", { name: "Burrow" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Field Guide|Math Trail|Reading Trail/ })).toHaveCount(0);
});
