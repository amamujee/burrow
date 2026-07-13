import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/experiments");
  await expect(page.getByRole("heading", { name: "Learning Labs" })).toBeVisible();
});

test("pepper expedition moves between subjects and collects a journal clue", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Read the seed packet" })).toBeVisible();
  await page.getByRole("button", { name: "A little wet" }).click();
  await expect(page.getByText("Correct!")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find a pepper homeland" })).toBeVisible();
  await expect(page.getByText("1 of 5 collected")).toBeVisible();
});

test("pepper expedition teaches a missed answer and moves on", async ({ page }) => {
  await page.getByRole("button", { name: "Completely dry" }).click();
  await expect(page.getByText("Answer: A little wet")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find a pepper homeland" })).toBeVisible();
});

test("word explorer supports matching, sentence context, and evidence", async ({ page }) => {
  await page.getByRole("button", { name: /Word Explorer/ }).click();
  await expect(page.getByRole("heading", { name: "Word Match" })).toBeVisible();

  await page.getByRole("button", { name: /Sentence Builder/ }).click();
  await page.getByRole("button", { name: "spicy" }).click();
  await expect(page.getByText("You found the clue!")).toBeVisible();

  await expect(page.getByRole("heading", { name: "Evidence Hunt" })).toBeVisible();
  await page.getByRole("button", { name: "A red jalapeño is not a different species." }).click();
  await expect(page.getByText(/That sentence directly says/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pepper word journal" })).toBeVisible();
});

test("math lenses keep one equation while switching four representations", async ({ page }) => {
  await page.getByRole("button", { name: /Math Lenses/ }).click();
  await expect(page.getByText("4 × 6 = ?")).toBeVisible();
  await expect(page.getByLabel("Equal groups representation")).toBeVisible();

  await page.getByRole("tab", { name: /Pepper array/ }).click();
  await expect(page.getByLabel("Pepper array representation")).toBeVisible();
  await page.getByRole("tab", { name: /Repeated addition/ }).click();
  await expect(page.getByLabel("Repeated addition representation")).toBeVisible();
  await page.getByRole("tab", { name: /Number line/ }).click();
  await expect(page.getByLabel("Number line representation")).toBeVisible();
  await expect(page.getByText("4/4 views tried")).toBeVisible();

  await page.getByRole("button", { name: "24 peppers" }).click();
  await expect(page.getByText("All four lenses agree!")).toBeVisible();
});

test("lab selector fits the mobile viewport", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile viewport coverage");
  const navigation = page.getByRole("navigation", { name: "Experimental learning modes" });
  const box = await navigation.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
