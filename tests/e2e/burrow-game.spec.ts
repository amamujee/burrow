import { expect, test, type Page } from "@playwright/test";
import { coreMiniExpeditions } from "../../src/components/core-mini-challenge";
import { buildNumberRound, buildNumberRoundFromCards, type GenericKnowledgeCard } from "../../src/lib/game-modes";

const modeLabels = ["Quiz Run", "Head to Head", "Top Trumps", "Sort", "True/False", "Peek", "Numbers", "Odd One", "Geo Finder"];
const topicLabels = ["Spicy Peppers", "Sky Scrapers", "Shark Tank", "Space Universe", "Jet Hangar", "Dinosaur Lab", "Tallest Mountains", "Tall Trees", "Bridges & Tunnels"];

const setupSummary = (page: Page) => page.locator("summary").filter({ hasText: "Setup" });
const setupDetails = (page: Page) => setupSummary(page).locator("xpath=..");
const buttonForLabel = (page: Page, label: string) => page.getByRole("button", { name: new RegExp(label.replace("/", "\\/")) });

const chooseOnlyMode = async (page: Page, target: string) => {
  await setupSummary(page).click();
  const targetButton = buttonForLabel(page, target);
  if ((await targetButton.getAttribute("aria-pressed")) !== "true") {
    await targetButton.click();
    await expect(targetButton).toHaveAttribute("aria-pressed", "true");
  }

  for (const label of modeLabels.filter((label) => label !== target)) {
    const button = buttonForLabel(page, label);
    if ((await button.getAttribute("aria-pressed")) === "true") {
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "false");
    }
  }
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));
  await expect(setupSummary(page)).toContainText("1 games");
};

const chooseOnlyBuiltInTopic = async (page: Page, target: string) => {
  await setupSummary(page).click();
  const targetButton = buttonForLabel(page, target);
  if ((await targetButton.getAttribute("aria-pressed")) !== "true") await targetButton.click();
  await expect(targetButton).toHaveAttribute("aria-pressed", "true");

  for (const label of topicLabels) {
    const button = buttonForLabel(page, label);
    if (label !== target && (await button.getAttribute("aria-pressed")) === "true") await button.click();
  }
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));
  await expect(setupSummary(page)).toContainText("1 topics");
};

const mathFixtureCards: GenericKnowledgeCard[] = [12, 20, 35, 48].map((value, index) => ({
  id: `math-card-${index}`,
  topic: "fixture",
  title: `Card ${index + 1}`,
  image: "/favicon.ico",
  imageAlt: `Card ${index + 1}`,
  imageCredit: "Test",
  statLabel: "Length",
  statValue: value,
  statDisplay: `${value} ft`,
  subStat: "Test card",
  fact: "Test fact.",
  qualityScore: 90,
  qualityFlags: [],
  categories: ["test"],
  stats: [{ id: "length", label: "Length", value, display: `${value} ft`, direction: "higher" }],
}));

test("every topic offers sensible addition, subtraction, and multiplication rounds", () => {
  const builtInTopics = {
    peppers: "peppers",
    buildings: "windows",
    sharks: "paper teeth",
    space: "rocks",
    jets: "jets",
  } as const;
  const packTopics = {
    dinosaurs: "eggs",
    "tallest-mountains": "climbers",
    "tall-trees": "birds",
    "bridges-and-tunnels": "lights",
  } as const;

  for (const [topic, expectedItems] of Object.entries(builtInTopics) as [keyof typeof builtInTopics, string][]) {
    const rounds = [0, 1, 2].map((seed) => buildNumberRound(topic, 1, seed));
    expect(new Set(rounds.map((round) => round.operation))).toEqual(new Set(["addition", "subtraction", "multiplication"]));
    const multiplication = rounds.find((round) => round.operation === "multiplication");
    expect(multiplication?.visual?.kind).toBe("equal-groups");
    expect(multiplication?.visual?.itemPlural).toBe(expectedItems);
    expect(multiplication?.prompt).toContain(expectedItems);
  }

  for (const [topic, expectedItems] of Object.entries(packTopics)) {
    const rounds = [0, 1, 2].map((seed) => buildNumberRoundFromCards(mathFixtureCards, topic, 1, seed));
    expect(new Set(rounds.map((round) => round.operation))).toEqual(new Set(["addition", "subtraction", "multiplication"]));
    const multiplication = rounds.find((round) => round.operation === "multiplication");
    expect(multiplication?.visual?.kind).toBe("equal-groups");
    expect(multiplication?.visual?.itemPlural).toBe(expectedItems);
    expect(multiplication?.prompt).toContain(expectedItems);
  }
});

test("hard multiplication reaches the full twelve-by-twelve table", () => {
  const round = buildNumberRound("peppers", 3, 137);
  expect(round.operation).toBe("multiplication");
  expect(round.biggerValue).toBe(12);
  expect(round.smallerValue).toBe(12);
  expect(round.answer).toBe(144);
  expect(round.termValues).toEqual([12, 12]);
});

test("mini challenges rotate through four deep cross-subject expeditions", () => {
  expect(coreMiniExpeditions).toHaveLength(4);
  expect(new Set(coreMiniExpeditions.map((expedition) => expedition.name)).size).toBe(4);
  for (const expedition of coreMiniExpeditions) {
    expect(new Set(expedition.steps.map((step) => step.skill))).toEqual(new Set(["Reading", "Geography", "Math", "Science", "Words"]));
  }
  expect(coreMiniExpeditions.map((expedition) => expedition.steps.find((step) => step.skill === "Math")?.question)).toEqual([
    "7 × 8 = ?",
    "9 × 12 = ?",
    "11 × 9 = ?",
    "12 × 12 = ?",
  ]);
});

test.beforeEach(async ({ page }) => {
  await page.route("**/api/content-issues", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.route("**/api/play-events", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, accepted: 1 }) });
  });
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem("burrow-test-storage-cleared")) {
      window.localStorage.clear();
      window.sessionStorage.setItem("burrow-test-storage-cleared", "true");
    }
  });
  await page.goto("/play");
  await expect(page.getByRole("heading", { name: "Burrow" })).toBeVisible();
  await page.waitForFunction(() => document.documentElement.dataset.burrowHydrated === "true");
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
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

test("every tenth answer opens an automatic mini challenge and returns after its summary", async ({ page }) => {
  await page.evaluate(() => {
    const key = "burrow-profiles-v1";
    const profiles = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { answered: number; challengeMilestone: number } }[];
    };
    const active = profiles.profiles.find((profile) => profile.id === profiles.activeProfileId);
    if (!active) throw new Error("Active profile was not saved");
    active.progress.answered = 9;
    active.progress.challengeMilestone = 0;
    window.localStorage.setItem(key, JSON.stringify(profiles));
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await chooseOnlyMode(page, "True/False");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByRole("button", { name: /Next|Finish round/ })).toBeVisible();
  await expect(page.getByText("Pepper mini challenge")).toHaveCount(0);
  await page.getByRole("button", { name: /Next|Finish round/ }).click();
  await expect(page.getByText("Pepper mini challenge")).toBeVisible();

  await page.getByRole("button", { name: "Seeds grow underwater" }).click();
  await expect(page.getByText("Answer: Roots still need air")).toBeVisible();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Map the pepper homeland" })).toBeVisible();

  await page.getByRole("button", { name: "Guatemala and Belize" }).click();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Count the harvest" })).toBeVisible();
  await expect(page.getByText("7 × 8 = ?")).toBeVisible();
  await expect(page.getByLabel("7 equal pepper groups of 8")).toBeVisible();

  await page.getByRole("button", { name: "56 peppers" }).click();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Investigate the heat" })).toBeVisible();
  await page.getByRole("button", { name: "Capsaicin coats its surface" }).click();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Unlock a science word" })).toBeVisible();
  await page.getByRole("button", { name: "Gathered in a larger amount" }).click();
  await page.getByRole("button", { name: "View challenge summary" }).click();

  await expect(page.getByRole("heading", { name: "Pepper field journal" })).toBeVisible();
  await expect(page.getByText("4/5 discoveries solved · all five notes collected")).toBeVisible();
  await page.getByRole("button", { name: "Continue regular questions" }).click();
  await expect(page.getByText("True or false?")).toBeVisible();
  await expect(page.getByText("Pepper mini challenge")).toHaveCount(0);

  await expect.poll(async () => page.evaluate(() => {
    const profiles = JSON.parse(window.localStorage.getItem("burrow-profiles-v1") ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { challengeMilestone: number } }[];
    };
    return profiles.profiles.find((profile) => profile.id === profiles.activeProfileId)?.progress.challengeMilestone;
  })).toBe(10);
});

test("pepper mini challenges do not interrupt unselected topics", async ({ page }) => {
  await page.evaluate(() => {
    const key = "burrow-profiles-v1";
    const profiles = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { answered: number; challengeMilestone: number } }[];
    };
    const active = profiles.profiles.find((profile) => profile.id === profiles.activeProfileId);
    if (!active) throw new Error("Active profile was not saved");
    active.progress.answered = 9;
    active.progress.challengeMilestone = 0;
    window.localStorage.setItem(key, JSON.stringify(profiles));
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await chooseOnlyMode(page, "True/False");

  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await page.getByRole("button", { name: /Next|Finish round/ }).click();

  await expect(page.getByText("Pepper mini challenge")).toHaveCount(0);
  await expect(page.getByText("True or false?")).toBeVisible();
});

test("flag image gives local feedback without leaking server details", async ({ page }) => {
  await page.getByRole("button", { name: /Flag an issue/ }).click();

  await expect(page.getByRole("button", { name: /Flag an issue/ })).toHaveText("Flagged");
  await setupSummary(page).click();
  await expect(page.getByText("1 logged")).toBeVisible();
});

test("head to head comparison images can submit an answer", async ({ page }) => {
  await chooseOnlyMode(page, "Head to Head");

  await expect(page.getByText(/Look at both cards|Use the numbers/)).toBeVisible();
  await page.getByRole("button", { name: /^Choose [AB]:/ }).first().click();
  await expect(page.getByRole("button", { name: /Next|Finish round/ })).toBeVisible();
});

test("play events capture anonymous question quality context", async ({ page }) => {
  await chooseOnlyMode(page, "Head to Head");

  await page.getByRole("button", { name: /^Choose [AB]:/ }).first().click();
  await expect(page.getByRole("button", { name: /Next|Finish round/ })).toBeVisible();

  const events = await page.evaluate(() => JSON.parse(window.localStorage.getItem("burrow-play-events-v1") ?? "[]") as Record<string, unknown>[]);
  const answerEvent = events.find((event) => event.action === "answer" && event.challengeMode === "versus");
  const viewEvent = events.find((event) => event.action === "view" && event.challengeMode === "versus");

  expect(viewEvent).toBeTruthy();
  expect(answerEvent).toMatchObject({
    schemaVersion: 2,
    action: "answer",
    challengeMode: "versus",
    mode: "mix",
    questionKind: expect.any(String),
    itemKey: expect.any(String),
    itemHash: expect.any(String),
    promptHash: expect.any(String),
    titleHash: expect.any(String),
    sessionId: expect.any(String),
    profileHash: expect.any(String),
    answerMs: expect.any(Number),
  });
  expect(answerEvent?.profileHash).not.toBe("player-1");
  expect(answerEvent?.itemKey).not.toMatch(/^\d+-/);
});

test("number rounds show an arithmetic equation and accept an answer", async ({ page }) => {
  await chooseOnlyMode(page, "Numbers");

  await expect(page.getByText(/\d[\d,]*\s[+\-x]\s\d[\d,]*(\s\+\s\d[\d,]*)?\s=\s\?/)).toBeVisible();
  await expect(page.getByLabel(/^Math picture:/)).toBeVisible();

  await page.locator("[data-number-choice]").first().click();
  await expect(page.getByRole("button", { name: /Next|Finish round/ })).toBeVisible();
});

test("pepper number rounds teach multiplication with equal plant groups", async ({ page }) => {
  await chooseOnlyMode(page, "Numbers");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  for (let attempt = 0; attempt < 3 && await page.getByText("Grow case", { exact: true }).count() === 0; attempt += 1) {
    await page.getByRole("button", { name: "Skip question" }).click();
  }

  await expect(page.getByText("Grow case", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /\d+ .* plants grow \d+ peppers each.*How many peppers/ })).toBeVisible();
  await expect(page.getByText(/\d+ x \d+ = \?/)).toBeVisible();

  const garden = page.getByLabel("Math picture: equal pepper plant groups");
  await expect(garden).toBeVisible();
  const plantCount = await garden.locator("[data-math-group]").count();
  expect(plantCount).toBeGreaterThanOrEqual(2);

  await page.locator("[data-number-choice]").first().click();
  await expect(page.getByRole("button", { name: /Next|Finish round/ })).toBeVisible();
});

test("building answers teach location without spoiling the question", async ({ page }) => {
  await chooseOnlyMode(page, "True/False");
  await chooseOnlyBuiltInTopic(page, "Sky Scrapers");

  await expect(page.getByLabel("Where in the world")).toHaveCount(0);
  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();

  const geography = page.getByLabel("Where in the world");
  await expect(geography).toBeVisible();
  await expect(geography).toContainText(/North America|South America|Europe|Asia|Africa|Oceania/);
});

test("bridge pack answers surface their world location", async ({ page }) => {
  await chooseOnlyMode(page, "True/False");
  await setupSummary(page).click();
  await page.getByRole("button", { name: /Bridges & Tunnels/ }).click();
  await page.getByRole("button", { name: /Shark Tank selected/ }).click();
  await page.getByRole("button", { name: /Jet Hangar selected/ }).click();
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));

  await expect(page.getByLabel("Where in the world")).toHaveCount(0);
  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByLabel("Where in the world")).toBeVisible();
});

test("peek rounds reset their reveal count after skip", async ({ page }) => {
  await chooseOnlyMode(page, "Peek");

  await expect(page.getByText("Peek round", { exact: true })).toBeVisible();
  await expect(page.getByText("4/12 open")).toBeVisible();
  await expect(page.getByText("5/12 open")).toBeVisible({ timeout: 2_000 });

  await page.getByRole("button", { name: "Skip question" }).click();
  await expect(page.getByText("4/12 open")).toBeVisible();
});

test("geo finder stays inside the selected topic", async ({ page }) => {
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");
  await chooseOnlyMode(page, "Geo Finder");

  for (let round = 0; round < 6; round += 1) {
    await expect(page.getByText("Spicy Peppers · Geo Finder", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Where on the map is/ })).toBeVisible();
    await expect(page.getByText("Tallest Mountains · Geo Finder", { exact: true })).toHaveCount(0);
    if (round < 5) await page.getByRole("button", { name: "Skip question" }).click();
  }
});

test("collection only shows selected topics", async ({ page }) => {
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");
  await page.getByRole("button", { name: /Cards/ }).click();

  const collection = page.getByText("Collection", { exact: true }).locator("xpath=ancestor::section[1]");
  await expect(collection.getByText("Spicy Peppers", { exact: true })).toBeVisible();
  await expect(collection.getByText("Shark Tank", { exact: true })).toHaveCount(0);
  await expect(collection.getByText("Tallest Mountains", { exact: true })).toHaveCount(0);
});

test("playable dinosaur pack appears in setup topics", async ({ page }) => {
  await setupSummary(page).click();
  const dinosaurTopic = page.getByRole("button", { name: /Dinosaur Lab/ });
  await expect(dinosaurTopic).toBeVisible();

  await dinosaurTopic.click();
  await expect(dinosaurTopic).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Shark Tank selected/ }).click();
  await expect(page.getByRole("button", { name: /Shark Tank selected/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Jet Hangar selected/ }).click();
  await expect(page.getByRole("button", { name: /Jet Hangar selected/ })).toHaveCount(0);
  await expect(page.getByText("Dinosaur Lab · Peek")).toBeVisible();
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

test("pepper top trumps uses concrete plant stats", async ({ page }) => {
  await chooseOnlyMode(page, "Top Trumps");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  await expect(page.getByText("Plant height").first()).toBeVisible();
  await expect(page.getByText("Natural roots")).toHaveCount(0);
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
