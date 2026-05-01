import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/content-issues", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.goto("/play");
  await expect(page.getByRole("heading", { name: "Burrow" })).toBeVisible();
  await page.waitForFunction(() => document.documentElement.dataset.burrowHydrated === "true");
});

test("setup menu opens and core game controls keep working", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Burrow" })).toBeVisible();

  await page.locator("summary").click();
  await expect(page.getByText("Play mode")).toBeVisible();
  await expect(page.getByText("Mix includes")).toBeVisible();

  await page.getByRole("button", { name: "True/False read fast" }).click();
  await expect(page.getByText("Read and decide")).toBeVisible();

  await page.locator("details").evaluate((details) => details.removeAttribute("open"));
  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByText(/glow|Good try|Answer:/)).toBeVisible();

  await page.getByRole("button", { name: /Next|Finish round/ }).click();
  await expect(page.getByText("Read and decide")).toBeVisible();

  await page.getByRole("button", { name: /Cards/ }).click();
  await expect(page.getByText("Collection")).toBeVisible();
  await expect(page.getByText("Research library")).toBeVisible();
});

test("flag image gives local feedback without leaking server details", async ({ page }) => {
  await page.getByRole("button", { name: /Flag an issue/ }).click();

  await expect(page.getByRole("button", { name: /Flag an issue/ })).toHaveText("Flagged");
  await page.locator("summary").click();
  await expect(page.getByText("1 logged")).toBeVisible();
});

test("peek rounds reset their reveal count after skip", async ({ page }) => {
  await page.locator("summary").click();
  await page.getByRole("button", { name: "Peek picture clue" }).click();

  await expect(page.locator("article").getByText("Picture clue", { exact: true })).toBeVisible();
  await expect(page.getByText("4/12 open")).toBeVisible();
  await expect(page.getByText("5/12 open")).toBeVisible({ timeout: 2_000 });

  await page.getByRole("button", { name: "Skip question" }).click();
  await expect(page.getByText("4/12 open")).toBeVisible();
});

test("setup menu opens and fits on mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile viewport coverage");

  await page.locator("summary").click();
  const menu = page.locator("details > div");
  await expect(menu).toBeVisible();

  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
