import { expect, test, type Page } from "@playwright/test";
import {
  challengeConceptVisualLabels,
  pepperChallengeCampaignForMilestone,
  pepperChallengeCampaigns,
} from "../../src/components/core-mini-challenge";
import { peppers } from "../../src/lib/game-data";
import {
  buildFactRound,
  buildGeoRound,
  buildNumberRound,
  buildNumberRoundFromCards,
  buildRevealRound,
  buildSortRound,
  buildTopTrumpRound,
  collectionCards,
  type GenericKnowledgeCard,
} from "../../src/lib/game-modes";
import { buildSession } from "../../src/lib/questions";

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
    if (label !== target && (await button.getAttribute("aria-pressed")) === "true") {
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "false");
    }
  }
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));
  await expect(setupSummary(page)).toContainText("1 topics");
};

const openPepperChallengeAt = async (page: Page, milestone: number) => {
  await page.evaluate((targetMilestone) => {
    const key = "burrow-profiles-v1";
    const profiles = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { answered: number; challengeMilestone: number } }[];
    };
    const active = profiles.profiles.find((profile) => profile.id === profiles.activeProfileId);
    if (!active) throw new Error("Active profile was not saved");
    active.progress.answered = targetMilestone - 1;
    active.progress.challengeMilestone = targetMilestone - 20;
    window.localStorage.setItem(key, JSON.stringify(profiles));
  }, milestone);
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await chooseOnlyMode(page, "True/False");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");
  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await page.getByRole("button", { name: /Next|Finish round/ }).click();
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

test("Pepper Y, Armageddon, and The Noah join with Noah's open-ended estimate marked unofficial", () => {
  const newPeppers = Object.fromEntries(
    peppers
      .filter((pepper) => ["pepper-y", "armageddon", "the-noah"].includes(pepper.id))
      .map((pepper) => [pepper.id, pepper]),
  );

  expect(Object.keys(newPeppers).sort()).toEqual(["armageddon", "pepper-y", "the-noah"]);
  expect(newPeppers.armageddon).toMatchObject({ name: "Armageddon", shuMax: 1300000, image: "/burrow-assets/peppers/armageddon.png" });
  expect(newPeppers["pepper-y"]).toMatchObject({ name: "Pepper Y", shuMax: 3000000, scovilleStatus: "unofficial", image: "/burrow-assets/peppers/pepper-y.png" });
  expect(newPeppers["the-noah"]).toMatchObject({ name: "The Noah", shuMin: 2000000, shuMax: null, heat: "insane", scovilleStatus: "unofficial", image: "/burrow-assets/peppers/the-noah.png" });

  const noahCard = collectionCards().find((card) => card.id === "the-noah");
  expect(noahCard?.statDisplay).toBe("2,000,000+ SHU (unofficial)");
  expect(Number.isNaN(noahCard?.statValue)).toBe(true);

  for (let seed = 0; seed < 100; seed += 1) {
    const sortRound = buildSortRound("peppers", 3, seed);
    expect(sortRound.cards.every((card) => card.id !== "the-noah" && Number.isFinite(card.statValue))).toBe(true);

    const quiz = buildSession("peppers", 3, seed * 101, []);
    for (const question of quiz.filter((item) => item.image === "/burrow-assets/peppers/the-noah.png")) {
      expect(["pepper-heat", "pepper-reading", "pepper-location"]).toContain(question.kind);
      expect(question.numberLine).toBeUndefined();
    }
  }

  for (const difficulty of [1, 2, 3] as const) {
    const ordinaryQuestions = Array.from({ length: 100 }, (_, seed) => buildSession("peppers", difficulty, seed * 101, [])).flat();
    expect(ordinaryQuestions.some((question) => question.image === "/burrow-assets/peppers/the-noah.png")).toBe(true);

    const unlockedOtherPeppers = peppers.filter((pepper) => pepper.id !== "the-noah").map((pepper) => pepper.name);
    const discoveryQuestions = Array.from({ length: 100 }, (_, seed) => buildSession("peppers", difficulty, seed * 101, [], unlockedOtherPeppers)).flat();
    const ordinaryNoahCount = ordinaryQuestions.filter((question) => question.image === "/burrow-assets/peppers/the-noah.png").length;
    const discoveryNoahCount = discoveryQuestions.filter((question) => question.image === "/burrow-assets/peppers/the-noah.png").length;
    expect(discoveryNoahCount).toBeGreaterThan(ordinaryNoahCount);
    expect(discoveryNoahCount).toBeLessThan(discoveryQuestions.length);

    const discoveryRounds = Array.from({ length: 100 }, (_, seed) => [
      buildRevealRound("peppers", difficulty, seed, unlockedOtherPeppers).card.id,
      buildGeoRound("peppers", difficulty, seed, unlockedOtherPeppers).card.id,
      buildFactRound("peppers", difficulty, seed, unlockedOtherPeppers).imageAlt,
      buildTopTrumpRound("peppers", difficulty, seed, unlockedOtherPeppers).player.id,
    ]).flat();
    const visibleNoahCount = discoveryRounds.filter((value) => value === "the-noah" || value === "The Noah").length;
    expect(visibleNoahCount).toBeGreaterThan(200);
    expect(visibleNoahCount).toBeLessThan(discoveryRounds.length);
  }
});

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

test("challenge campaigns use one future-ready five-stop contract", () => {
  expect(pepperChallengeCampaigns).toHaveLength(4);
  expect(new Set(pepperChallengeCampaigns.map((campaign) => campaign.id)).size).toBe(4);
  expect(new Set(pepperChallengeCampaigns.map((campaign) => campaign.name)).size).toBe(4);
  for (const campaign of pepperChallengeCampaigns) {
    expect(campaign.topicId).toBe("peppers");
    expect(campaign.topicLabel).toBe("Spicy Peppers");
    expect(campaign.completionTitle.length).toBeGreaterThan(10);
    expect(new Set(campaign.steps.map((step) => step.skill))).toEqual(new Set(["Reading", "Geography", "Math", "Science", "Words"]));
  }
  expect(pepperChallengeCampaigns.map((campaign) => campaign.steps.find((step) => step.skill === "Math")?.question)).toEqual([
    "7 × 8 = ?",
    "9 × 12 = ?",
    "11 × 9 = ?",
    "12 × 12 = ?",
  ]);
  for (const campaign of pepperChallengeCampaigns) {
    const math = campaign.steps.find((step) => step.skill === "Math")?.math;
    expect(math?.visual.ariaLabel).toContain("Math picture:");
    expect(math?.visual.groupSingular).toBeTruthy();
    expect(math?.visual.itemPlural).toBeTruthy();
  }
});

test("every Challenge subject has valid content and its required teaching stage", () => {
  const stepIds = pepperChallengeCampaigns.flatMap((campaign) => campaign.steps.map((step) => step.id));
  expect(new Set(stepIds).size).toBe(stepIds.length);

  for (const campaign of pepperChallengeCampaigns) {
    for (const step of campaign.steps) {
      expect(step.clue.length, `${step.id} needs a useful clue`).toBeGreaterThan(20);
      expect(step.summary.length, `${step.id} needs teaching feedback`).toBeGreaterThan(35);
      expect(step.choices, `${step.id} must contain its answer`).toContain(step.answer);
      expect(step.choices, `${step.id} needs three choices`).toHaveLength(3);
      expect(new Set(step.choices).size, `${step.id} choices must be distinct`).toBe(3);

      if (step.skill === "Reading") {
        expect(step.clue).toContain(step.evidence);
      } else if (step.skill === "Geography") {
        expect(step.map.choices.map((choice) => choice.label)).toEqual(step.choices);
        for (const choice of step.map.choices) {
          expect(choice.x, `${step.id} map x must be valid`).toBeGreaterThanOrEqual(0);
          expect(choice.x, `${step.id} map x must be valid`).toBeLessThanOrEqual(100);
          expect(choice.y, `${step.id} map y must be valid`).toBeGreaterThanOrEqual(0);
          expect(choice.y, `${step.id} map y must be valid`).toBeLessThanOrEqual(100);
        }
      } else if (step.skill === "Math") {
        expect(step.question).toBe(`${step.math.groups} × ${step.math.each} = ?`);
        expect(Number.parseInt(step.answer.replaceAll(",", ""), 10)).toBe(step.math.groups * step.math.each);
        expect(step.math.visual.ariaLabel).toContain(`${step.math.groups}`);
        expect(step.math.visual.ariaLabel).toContain(`${step.math.each}`);
      } else if (step.skill === "Science") {
        expect(challengeConceptVisualLabels[step.conceptVisual].length).toBeGreaterThan(20);
      }
    }
  }
});

test("campaign selection rotates through every deep dive every twenty questions", () => {
  expect([20, 40, 60, 80, 100].map((milestone) => pepperChallengeCampaignForMilestone(milestone).id)).toEqual([
    "jalapeno-fieldwork",
    "caribbean-pepper-quest",
    "ghost-pepper-mission",
    "pepper-x-research-lab",
    "jalapeno-fieldwork",
  ]);
});

test("every automatic Reading stop is grounded in visible evidence", () => {
  const readingSteps = pepperChallengeCampaigns.flatMap((campaign) => campaign.steps.filter((step) => step.skill === "Reading"));

  expect(readingSteps).toHaveLength(pepperChallengeCampaigns.length);
  for (const step of readingSteps) {
    const evidence = step.evidence;
    expect(evidence, `${step.id} needs an evidence quote`).toBeTruthy();
    if (!evidence) throw new Error(`${step.id} needs an evidence quote`);
    expect(step.clue, `${step.id} must display its evidence`).toContain(evidence);
    expect(step.choices, `${step.id} must include its answer`).toContain(step.answer);
    expect(new Set(step.choices).size, `${step.id} choices must be distinct`).toBe(3);
    expect(step.summary.length, `${step.id} needs explanatory feedback`).toBeGreaterThan(40);
  }
});

test("every challenge Geography and Science stop has a teaching visual", () => {
  const geographySteps = pepperChallengeCampaigns.flatMap((campaign) => campaign.steps.filter((step) => step.skill === "Geography"));
  const scienceSteps = pepperChallengeCampaigns.flatMap((campaign) => campaign.steps.filter((step) => step.skill === "Science"));

  expect(geographySteps).toHaveLength(pepperChallengeCampaigns.length);
  for (const step of geographySteps) {
    expect(step.map, `${step.id} needs a map`).toBeTruthy();
    expect(step.map?.choices.map((choice) => choice.label)).toEqual(step.choices);
    expect(step.map?.choices.some((choice) => choice.label === step.answer)).toBe(true);
  }

  expect(scienceSteps).toHaveLength(pepperChallengeCampaigns.length);
  for (const step of scienceSteps) {
    expect(step.conceptVisual, `${step.id} needs a concept diagram`).toBeTruthy();
    expect(step.choices).toContain(step.answer);
    expect(step.summary.length).toBeGreaterThan(40);
    expect(step.clue.split(/\s+/).length, `${step.id} clue should be quick to read`).toBeLessThanOrEqual(24);
    expect(step.question.split(/\s+/).length, `${step.id} question should be quick to read`).toBeLessThanOrEqual(10);
    for (const choice of step.choices) {
      expect(choice.split(/\s+/).length, `${step.id} choices should be scannable`).toBeLessThanOrEqual(6);
    }
  }
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
  await expect(setupSummary(page)).toContainText("9 games · 9 topics");

  await setupSummary(page).click();
  await expect(page.getByText("Game Types")).toBeVisible();
  await expect(page.getByText("Topics", { exact: true })).toBeVisible();

  for (const label of modeLabels.filter((label) => label !== "True/False")) {
    await page.getByRole("button", { name: new RegExp(label.replace("/", "\\/")) }).click();
  }
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));
  await expect(page.getByText("True or false?")).toBeVisible();

  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();

  await page.getByRole("button", { name: /Next|Finish round/ }).click();
  await expect(page.getByText("True or false?")).toBeVisible();

  await page.getByRole("button", { name: /Cards/ }).click();
  await expect(page.getByText("Collection")).toBeVisible();
  await expect(page.getByText("Research library")).toBeVisible();
});

test("every twentieth answer opens an automatic mini challenge and returns after its summary", async ({ page }) => {
  await page.evaluate(() => {
    const key = "burrow-profiles-v1";
    const profiles = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { answered: number; challengeMilestone: number } }[];
    };
    const active = profiles.profiles.find((profile) => profile.id === profiles.activeProfileId);
    if (!active) throw new Error("Active profile was not saved");
    active.progress.answered = 19;
    active.progress.challengeMilestone = 0;
    window.localStorage.setItem(key, JSON.stringify(profiles));
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await chooseOnlyMode(page, "True/False");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByRole("button", { name: /Next|Finish round/ })).toBeVisible();
  await expect(page.getByLabel("Challenge Mode", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Next|Finish round/ }).click();
  await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText("Deep dive: Jalapeño fieldwork");

  await page.getByRole("button", { name: "Keep pouring until water covers the soil" }).click();
  await expect(page.getByLabel("Answer feedback")).toContainText("Answer: Water until the soil is damp, then stop");
  await expect(page.getByText("Evidence:", { exact: true }).locator("..")).toContainText("Keep the soil evenly damp, but never waterlogged");
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Map the pepper homeland" })).toBeVisible();
  await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText("Stop 2 of 5");
  await expect(page.getByLabel("Challenge map story")).toBeVisible();
  await expect(page.getByRole("button", { name: "Choose map pin A: Mexico" })).toBeVisible();

  await page.getByRole("button", { name: "Choose map pin A: Mexico" }).click();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Count the harvest" })).toBeVisible();
  await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText("Stop 3 of 5");
  await expect(page.getByRole("heading", { name: "7 × 8 = ?" })).toBeVisible();
  const challengeMath = page.getByLabel("Challenge math story").getByLabel("Math picture: 7 equal plant groups of 8 peppers");
  await expect(challengeMath).toBeVisible();
  await expect(challengeMath.getByLabel("Break apart multiplication strategy")).toContainText("5 × 8 = 40");
  await expect(challengeMath.getByLabel("Break apart multiplication strategy")).toContainText("2 × 8 = 16");
  await expect(challengeMath.getByLabel("Break apart multiplication strategy")).toContainText("40 + 16 = ?");

  await page.getByRole("button", { name: "56 peppers" }).click();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Find the pepper's heat factory" })).toBeVisible();
  await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText("Stop 4 of 5");
  await expect(page.getByLabel("Labeled pepper anatomy diagram")).toBeVisible();
  await page.getByRole("button", { name: "The pale placenta" }).click();
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.getByRole("heading", { name: "Unlock a science word" })).toBeVisible();
  await page.getByRole("button", { name: "Gathered in a larger amount" }).click();
  await page.getByRole("button", { name: "View challenge summary" }).click();

  await expect(page.getByRole("heading", { name: "Jalapeño field journal" })).toBeVisible();
  await expect(page.getByText("4/5 discoveries solved · all five notes collected")).toBeVisible();
  await expect(page.getByText("Your next regular question is ready.")).toBeVisible();
  await page.getByRole("button", { name: "Back to the game" }).click();
  await expect(page.getByText("True or false?")).toBeVisible();
  await expect(page.getByLabel("Challenge Mode", { exact: true })).toHaveCount(0);

  await expect.poll(async () => page.evaluate(() => {
    const profiles = JSON.parse(window.localStorage.getItem("burrow-profiles-v1") ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { challengeMilestone: number } }[];
    };
    return profiles.profiles.find((profile) => profile.id === profiles.activeProfileId)?.progress.challengeMilestone;
  })).toBe(20);
});

for (const [campaignOffset, campaign] of pepperChallengeCampaigns.slice(1).entries()) {
  test(`every subject stage renders and teaches in ${campaign.name}`, async ({ page }) => {
    const milestone = (campaignOffset + 2) * 20;
    await openPepperChallengeAt(page, milestone);
    await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText(`Deep dive: ${campaign.name}`);

    const reading = campaign.steps.find((step) => step.skill === "Reading");
    const geography = campaign.steps.find((step) => step.skill === "Geography");
    const math = campaign.steps.find((step) => step.skill === "Math");
    const science = campaign.steps.find((step) => step.skill === "Science");
    const words = campaign.steps.find((step) => step.skill === "Words");
    if (!reading || reading.skill !== "Reading" || !geography || geography.skill !== "Geography" || !math || math.skill !== "Math" || !science || science.skill !== "Science" || !words || words.skill !== "Words") {
      throw new Error(`${campaign.id} is missing a required subject`);
    }

    await expect(page.getByRole("heading", { name: reading.title })).toBeVisible();
    await expect(page.getByLabel("Challenge picture story")).toBeVisible();
    await page.getByRole("button", { name: reading.answer }).click();
    await expect(page.getByLabel("Answer feedback")).toContainText(reading.summary);
    await expect(page.getByLabel("Answer feedback")).toContainText(reading.evidence);
    await page.getByRole("button", { name: "Next question" }).click();

    await expect(page.getByRole("heading", { name: geography.title })).toBeVisible();
    await expect(page.getByLabel("Challenge map story")).toBeVisible();
    const mapChoiceIndex = geography.map.choices.findIndex((choice) => choice.label === geography.answer);
    await page.getByRole("button", { name: `Choose map pin ${String.fromCharCode(65 + mapChoiceIndex)}: ${geography.answer}` }).click();
    await expect(page.getByLabel("Answer feedback")).toContainText(geography.summary);
    await page.getByRole("button", { name: "Next question" }).click();

    await expect(page.getByRole("heading", { name: math.title })).toBeVisible();
    await expect(page.getByRole("heading", { name: math.question })).toBeVisible();
    const mathStory = page.getByLabel("Challenge math story");
    await expect(mathStory.getByLabel(math.math.visual.ariaLabel)).toBeVisible();
    await expect(mathStory.locator("[data-math-group]")).toHaveCount(math.math.groups);
    await expect(mathStory.getByLabel("Break apart multiplication strategy")).toBeVisible();
    await page.getByRole("button", { name: math.answer }).click();
    await expect(page.getByLabel("Answer feedback")).toContainText(math.summary);
    await page.getByRole("button", { name: "Next question" }).click();

    await expect(page.getByRole("heading", { name: science.title })).toBeVisible();
    await expect(page.getByLabel("Challenge science story")).toBeVisible();
    await expect(page.getByLabel(challengeConceptVisualLabels[science.conceptVisual])).toBeVisible();
    await page.getByRole("button", { name: science.answer }).click();
    await expect(page.getByLabel("Answer feedback")).toContainText(science.summary);
    await page.getByRole("button", { name: "Next question" }).click();

    await expect(page.getByRole("heading", { name: words.title })).toBeVisible();
    await expect(page.getByLabel("Challenge picture story")).toBeVisible();
    await page.getByRole("button", { name: words.answer }).click();
    await expect(page.getByLabel("Answer feedback")).toContainText(words.summary);
    await page.getByRole("button", { name: "View challenge summary" }).click();
    await expect(page.getByRole("heading", { name: campaign.completionTitle })).toBeVisible();
  });
}

test("pepper mini challenges do not interrupt unselected topics", async ({ page }) => {
  await page.evaluate(() => {
    const key = "burrow-profiles-v1";
    const profiles = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { answered: number; challengeMilestone: number } }[];
    };
    const active = profiles.profiles.find((profile) => profile.id === profiles.activeProfileId);
    if (!active) throw new Error("Active profile was not saved");
    active.progress.answered = 19;
    active.progress.challengeMilestone = 0;
    window.localStorage.setItem(key, JSON.stringify(profiles));
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await chooseOnlyMode(page, "True/False");
  await chooseOnlyBuiltInTopic(page, "Shark Tank");

  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await page.getByRole("button", { name: /Next|Finish round/ }).click();

  await expect(page.getByLabel("Challenge Mode", { exact: true })).toHaveCount(0);
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

  await expect(page.getByLabel("Number equation")).toContainText(/\d[\d,]*\s[+\-x]\s\d[\d,]*(\s\+\s\d[\d,]*)?\s=\s\?/);
  const storyStage = page.getByLabel("Numbers story stage");
  await expect(storyStage).toBeVisible();
  await expect(storyStage.getByLabel(/^Math picture:/)).toBeVisible();

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
  await expect(page.getByLabel("Number equation")).toContainText(/\d+ x \d+ = \?/);

  const garden = page.getByLabel("Numbers story stage").getByLabel("Math picture: equal pepper plant groups");
  await expect(garden).toBeVisible();
  const plantCount = await garden.locator("[data-math-group]").count();
  expect(plantCount).toBeGreaterThanOrEqual(1);
  if (plantCount > 5) {
    await expect(garden.getByLabel("Break apart multiplication strategy")).toBeVisible();
  } else {
    await expect(garden.getByLabel("Skip counting multiplication strategy")).toBeVisible();
  }

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
    const pinBoxes = await page.getByRole("button", { name: /^Choose map pin/ }).evaluateAll((pins) => pins.map((pin) => {
      const box = pin.getBoundingClientRect();
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    }));
    expect(pinBoxes).toHaveLength(3);
    for (let first = 0; first < pinBoxes.length; first += 1) {
      for (let second = first + 1; second < pinBoxes.length; second += 1) {
        expect(Math.hypot(pinBoxes[second].x - pinBoxes[first].x, pinBoxes[second].y - pinBoxes[first].y)).toBeGreaterThanOrEqual(48);
      }
    }
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
  await expect(dinosaurTopic).toHaveAttribute("aria-pressed", "true");
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));

  await chooseOnlyBuiltInTopic(page, "Dinosaur Lab");
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
