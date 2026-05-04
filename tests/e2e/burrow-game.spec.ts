import { expect, test, type Page } from "@playwright/test";

const modeLabels = ["Quiz Run", "Head to Head", "Top Trumps", "Sort", "True/False", "Peek", "Numbers", "Odd One"];

const setupSummary = (page: Page) => page.locator("summary").filter({ hasText: "Setup" });
const setupDetails = (page: Page) => setupSummary(page).locator("xpath=..");

const chooseOnlyMode = async (page: Page, target: string) => {
  await setupSummary(page).click();
  for (const label of modeLabels) {
    if (label !== target) await page.getByRole("button", { name: new RegExp(label.replace("/", "\\/")) }).click();
  }
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));
};

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

  await setupSummary(page).click();
  await expect(page.getByText("Game Types")).toBeVisible();
  await expect(page.getByText("Topics", { exact: true })).toBeVisible();

  for (const label of modeLabels.filter((label) => label !== "True/False")) {
    await page.getByRole("button", { name: new RegExp(label.replace("/", "\\/")) }).click();
  }
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));
  await expect(page.getByText("True or false?")).toBeVisible();

  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByText(/Answer:/)).toBeVisible();

  await page.getByRole("button", { name: /Next|Finish round/ }).click();
  await expect(page.getByText("True or false?")).toBeVisible();

  await page.getByRole("button", { name: /Cards/ }).click();
  await expect(page.getByText("Collection")).toBeVisible();
  await expect(page.getByText("Research library")).toBeVisible();
});

test("flag image gives local feedback without leaking server details", async ({ page }) => {
  await page.getByRole("button", { name: /Flag an issue/ }).click();

  await expect(page.getByRole("button", { name: /Flag an issue/ })).toHaveText("Flagged");
  await setupSummary(page).click();
  await expect(page.getByText("1 logged")).toBeVisible();
});

test("peek rounds reset their reveal count after skip", async ({ page }) => {
  await chooseOnlyMode(page, "Peek");

  await expect(page.getByText("Peek round", { exact: true })).toBeVisible();
  await expect(page.getByText("4/12 open")).toBeVisible();
  await expect(page.getByText("5/12 open")).toBeVisible({ timeout: 2_000 });

  await page.getByRole("button", { name: "Skip question" }).click();
  await expect(page.getByText("4/12 open")).toBeVisible();
});

test("top trumps lets player choose a category against the computer", async ({ page }) => {
  await chooseOnlyMode(page, "Top Trumps");

  await expect(page.getByRole("paragraph").filter({ hasText: "Top Trumps" })).toBeVisible();
  await expect(page.locator("div").filter({ hasText: /^Player$/ })).toBeVisible();
  await expect(page.getByText("Computer card", { exact: true })).toBeVisible();

  await page.locator("button").filter({ hasText: /higher wins|lower wins/ }).first().click();
  await expect(page.getByText(/Player wins the matchup|Computer wins the matchup/)).toBeVisible();
  await expect(page.getByText("Computer card", { exact: true })).not.toBeVisible();
});

test("setup menu opens and fits on mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile viewport coverage");

  await setupSummary(page).click();
  const menu = setupDetails(page).locator(":scope > div");
  await expect(menu).toBeVisible();

  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
