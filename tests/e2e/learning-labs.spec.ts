import { expect, test } from "@playwright/test";
import { mathTrailChallenges } from "../../src/components/experiments/math-lenses";

test("math trail content covers every playable topic with mixed operations", () => {
  expect(new Set(mathTrailChallenges.map((challenge) => challenge.category))).toEqual(new Set([
    "Spicy Peppers",
    "Sky Scrapers",
    "Shark Tank",
    "Space Universe",
    "Jet Hangar",
    "Dinosaur Lab",
    "Tallest Mountains",
    "Tall Trees",
    "Bridges & Tunnels",
  ]));
  expect(mathTrailChallenges.some((challenge) => challenge.equation.includes("+"))).toBe(true);
  expect(mathTrailChallenges.some((challenge) => challenge.equation.includes("−"))).toBe(true);
  expect(mathTrailChallenges.some((challenge) => challenge.equation.includes("×"))).toBe(true);
  expect(mathTrailChallenges).toContainEqual(expect.objectContaining({ equation: "12 × 12 = ?", answer: 144 }));
  expect(new Set(mathTrailChallenges.flatMap((challenge) => challenge.scene?.images.map((image) => image.image) ?? [] )).size).toBeGreaterThanOrEqual(20);
});

test.beforeEach(async ({ page }) => {
  await page.goto("/experiments");
  await expect(page.getByRole("heading", { name: "Learning Labs" })).toBeVisible();
});

test("pepper expedition moves between subjects and collects a journal clue", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Read the seed packet" })).toBeVisible();
  await page.getByRole("button", { name: "A little wet" }).click();
  await expect(page.getByText("Correct!")).toBeVisible();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Find a pepper homeland" })).toBeVisible();
  await expect(page.getByText("1 of 5 collected")).toBeVisible();
});

test("pepper expedition teaches a missed answer and moves on", async ({ page }) => {
  await page.getByRole("button", { name: "Completely dry" }).click();
  await expect(page.getByText("Answer: A little wet")).toBeVisible();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Find a pepper homeland" })).toBeVisible();
});

test("pepper expedition summary continues into word explorer", async ({ page }) => {
  const answers = [
    "A little wet",
    "South of the United States",
    "24 peppers",
    "The pale inner tissue",
    "Makes peppers feel hot",
  ];

  for (const [index, answer] of answers.entries()) {
    await page.getByRole("button", { name: answer }).click();
    await page.getByRole("button", { name: index === answers.length - 1 ? "View expedition summary" : "Next question" }).click();
  }

  await expect(page.getByRole("heading", { name: "Jalapeño field journal" })).toBeVisible();
  await page.getByRole("button", { name: "Continue to Word Explorer" }).click();
  await expect(page.getByRole("heading", { name: "Word Explorer" })).toBeVisible();
});

test("word explorer supports matching, sentence context, and evidence", async ({ page }) => {
  await page.getByRole("button", { name: /Word Explorer/ }).click();
  await expect(page.getByRole("heading", { name: "Word Match" })).toBeVisible();

  await page.getByRole("button", { name: /Sentence Builder/ }).click();
  await page.getByRole("button", { name: "spicy" }).click();
  await expect(page.getByText("You found the clue!")).toBeVisible();

  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Evidence Hunt" })).toBeVisible();
  await page.getByRole("button", { name: "A red jalapeño is not a different species." }).click();
  await expect(page.getByText(/That sentence directly says/)).toBeVisible();
  await page.getByRole("button", { name: "View reading summary" }).click();
  await expect(page.getByRole("heading", { name: "Pepper word journal" })).toBeVisible();
});

test("math trail chooses varied question types and moves across topic worlds", async ({ page }) => {
  await page.getByRole("button", { name: /Math Trail/ }).click();
  await expect(page.getByText("3 × 4 = ?")).toBeVisible();
  await expect(page.getByLabel("Three mixed pepper baskets with four peppers each")).toBeVisible();
  await expect(page.getByRole("img", { name: "Pepper X" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Bell pepper" })).toBeVisible();
  await expect(page.getByText("Parent observation")).toHaveCount(0);
  await expect(page.getByRole("tab")).toHaveCount(0);

  await page.getByRole("button", { name: "12" }).click();
  await expect(page.getByText("Correct!")).toBeVisible();
  await page.getByRole("button", { name: "Next question" }).click();

  await expect(page.getByText("Shark Tank · Large multiplication")).toBeVisible();
  await expect(page.getByText("4 × 50 = ?")).toBeVisible();
  await expect(page.getByLabel("4 groups with 50 paper teeth each")).toBeVisible();
  await expect(page.getByRole("img", { name: "Longfin mako" })).toBeVisible();
  await page.getByRole("button", { name: "150" }).click();
  await expect(page.getByText("Answer: 200")).toBeVisible();
  await page.getByRole("button", { name: "Next question" }).click();

  await expect(page.getByText("Sky Scrapers · Addition")).toBeVisible();
  await expect(page.getByText("12 + 9 = ?")).toBeVisible();
  await expect(page.getByLabel("12 plus 9 windows")).toBeVisible();
});

test("lab selector fits the mobile viewport", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile viewport coverage");
  const navigation = page.getByRole("navigation", { name: "Experimental learning modes" });
  const box = await navigation.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
