import { expect, test } from "@playwright/test";
import { mathTrailChallenges } from "../../src/components/experiments/math-lenses";
import { pepperExpeditionStops } from "../../src/components/experiments/pepper-expedition";

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

test("every standalone Reading stop is grounded in visible evidence", () => {
  const readingStops = pepperExpeditionStops.filter((stop) => stop.skill === "Reading");

  expect(readingStops).not.toHaveLength(0);
  for (const stop of readingStops) {
    const evidence = stop.evidence;
    expect(evidence, `${stop.id} needs an evidence quote`).toBeTruthy();
    if (!evidence) throw new Error(`${stop.id} needs an evidence quote`);
    expect(stop.story, `${stop.id} must display its evidence`).toContain(evidence);
    expect(stop.choices, `${stop.id} must include its answer`).toContain(stop.answer);
    expect(new Set(stop.choices).size, `${stop.id} choices must be distinct`).toBe(3);
    expect(stop.journal.length, `${stop.id} needs explanatory feedback`).toBeGreaterThan(40);
  }
});

test.beforeEach(async ({ page }) => {
  await page.goto("/experiments");
  await expect(page.getByRole("heading", { name: "Learning Labs" })).toBeVisible();
});

test("pepper expedition moves between subjects and collects a journal clue", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Read the seed packet" })).toBeVisible();
  await page.getByRole("button", { name: "Water until the soil is damp, then stop" }).click();
  await expect(page.getByText("Correct!")).toBeVisible();
  await expect(page.getByText("Evidence:", { exact: true }).locator("..")).toContainText("Keep the soil evenly damp, but never waterlogged");
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Find a pepper homeland" })).toBeVisible();
  await expect(page.getByText("1 of 5 collected")).toBeVisible();
});

test("pepper expedition teaches a missed answer and moves on", async ({ page }) => {
  await page.getByRole("button", { name: "Keep pouring until water covers the soil" }).click();
  await expect(page.getByText("Answer: Water until the soil is damp, then stop")).toBeVisible();
  await expect(page.getByRole("button", { name: "Water until the soil is damp, then stop" })).toBeDisabled();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Find a pepper homeland" })).toBeVisible();
});

test("pepper expedition summary continues into word explorer", async ({ page }) => {
  const answers = [
    "Water until the soil is damp, then stop",
    "Guatemala and Belize",
    "56 peppers",
    "Capsaicin can coat its surface",
    "Gathered in a larger amount",
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

  await expect(page.getByRole("button", { name: /Sentence Builder/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Wrinkled Carolina Reaper" }).click();
  await expect(page.getByText("Answer: Lobed Purple Beauty")).toBeVisible();
  await expect(page.getByRole("button", { name: "Lobed Purple Beauty" })).toBeDisabled();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Sentence Builder" })).toBeVisible();
  await page.getByRole("button", { name: "strong and sharp" }).click();
  await expect(page.getByText("You found the clue!")).toBeVisible();

  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Evidence Hunt" })).toBeVisible();
  await page.getByRole("button", { name: "Color alone cannot tell you exactly how hot a pepper is." }).click();
  await expect(page.getByText(/genetics and growing conditions/)).toBeVisible();
  await page.getByRole("button", { name: "View reading summary" }).click();
  await expect(page.getByRole("heading", { name: "Pepper word journal" })).toBeVisible();
  await page.getByRole("button", { name: "Continue to Math Trail" }).click();
  await expect(page.getByText("6 × 7 = ?")).toBeVisible();
});

test("math trail chooses varied question types and moves across topic worlds", async ({ page }) => {
  await page.getByRole("button", { name: /Math Trail/ }).click();
  await expect(page.getByText("6 × 7 = ?")).toBeVisible();
  await expect(page.getByLabel("6 groups with 7 peppers each")).toBeVisible();
  await expect(page.getByRole("img", { name: "Pepper X" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Bell pepper" })).toBeVisible();
  await expect(page.getByText("Parent observation")).toHaveCount(0);
  await expect(page.getByRole("tab")).toHaveCount(0);

  await page.getByRole("button", { name: "42" }).click();
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
  await expect(page.getByText("38 + 27 = ?")).toBeVisible();
  await expect(page.getByLabel("38 plus 27 windows")).toBeVisible();
});

test("math trail completes all ten stops and continues to Burrow", async ({ page }) => {
  await page.getByRole("button", { name: /Math Trail/ }).click();

  for (const [index, challenge] of mathTrailChallenges.entries()) {
    await page.getByRole("button", { name: String(challenge.answer), exact: true }).click();
    await page.getByRole("button", { name: index === mathTrailChallenges.length - 1 ? "View math summary" : "Next question" }).click();
  }

  await expect(page.getByRole("heading", { name: "Nine worlds of numbers—and 12 × 12" })).toBeVisible();
  await expect(page.getByText("10/10 solved · every answer explored")).toBeVisible();
  await page.getByRole("link", { name: "Continue to Burrow" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.getByRole("heading", { name: "Burrow" })).toBeVisible();
});

test("lab selector fits the mobile viewport", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile viewport coverage");
  const navigation = page.getByRole("navigation", { name: "Experimental learning modes" });
  const box = await navigation.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
