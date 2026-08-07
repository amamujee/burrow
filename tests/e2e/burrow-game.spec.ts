import { expect, test, type Page } from "@playwright/test";
import {
  buildChallengeCampaignsForCategory,
  challengeCampaignCountPerCategory,
  challengeCampaignForMilestone,
  challengeQuestionInterval,
  pepperChallengeCampaignForMilestone,
  pepperChallengeCampaigns,
} from "../../src/components/core-mini-challenge";
import { weightTopicsForAccuracy } from "../../src/lib/adaptive-topics";
import { cardDiscoveryIdentities, cardUnlockKey, isCardUnlocked } from "../../src/lib/card-discovery";
import { buildings, countries, jets, peppers, sharks, spaceCards, topicPacks } from "../../src/lib/game-data";
import { poolForDifficulty } from "../../src/lib/difficulty-pool";
import { autoDifficulty } from "../../src/lib/difficulty";
import {
  buildFactRound,
  buildFactRoundFromCards,
  buildGeoRound,
  buildNumberRound,
  buildNumberRoundFromCards,
  buildOddRound,
  buildOddRoundFromCards,
  buildRevealRound,
  buildRevealRoundFromCards,
  buildSortRound,
  buildTopTrumpRound,
  collectionOrderLabel,
  collectionCards,
  geoChoiceSeparationForDifficulty,
  geoPointDistanceKm,
  geoPointMapDistance,
  orderCollectionCardsByScoville,
  orderCollectionCardsForCategory,
  slotSortCardIds,
  topTrumpOutcome,
  type GenericKnowledgeCard,
} from "../../src/lib/game-modes";
import { buildHeadToHeadSession, buildSession } from "../../src/lib/questions";
import { packToPlayableDeck } from "../../src/lib/pack-adapter";
import { loadPlayablePacks } from "../../src/lib/pack-loader";
import { discoveryShuffle } from "../../src/lib/random";
import { migrateTopicSelection } from "../../src/lib/topic-selection";
import {
  addLearningExposure,
  learningIdentity,
  learningVarietyScore,
  summarizeLearningHistory,
} from "../../src/lib/learning-variety";

const modeLabels = ["Quiz Run", "Head to Head", "Top Trumps", "Sort", "True/False", "Peek", "Numbers", "Odd One", "Geo Finder"];
const topicLabels = ["Spicy Peppers", "Sky Scrapers", "Shark Tank", "Space Universe", "Jet Hangar", "Countries & Flags", "Dinosaur Lab", "Tallest Mountains", "Tall Trees", "Bridges & Tunnels"];

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

const openChallengeAt = async (page: Page, milestone: number, topicLabel: string) => {
  await page.evaluate(({ targetMilestone, interval }) => {
    const key = "burrow-profiles-v1";
    const profiles = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { answered: number; challengeMilestone: number } }[];
    };
    const active = profiles.profiles.find((profile) => profile.id === profiles.activeProfileId);
    if (!active) throw new Error("Active profile was not saved");
    active.progress.answered = targetMilestone - 1;
    active.progress.challengeMilestone = targetMilestone - interval;
    window.localStorage.setItem(key, JSON.stringify(profiles));
  }, { targetMilestone: milestone, interval: challengeQuestionInterval });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await chooseOnlyMode(page, "True/False");
  await chooseOnlyBuiltInTopic(page, topicLabel);
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

const playableChallengeCategories = [
  ...Object.values(topicPacks).map((pack) => ({
    id: pack.id,
    label: pack.label,
    cards: collectionCards().filter((card) => card.topic === pack.id),
  })),
  ...loadPlayablePacks().map(packToPlayableDeck).map((deck) => ({
    id: deck.id,
    label: deck.title,
    cards: deck.cards,
  })),
];

test.describe("logic and content coverage", { tag: "@logic" }, () => {
test.describe.configure({ mode: "serial" });

test("built-in topic totals match the playable card catalogs", () => {
  const expected = {
    peppers: { count: peppers.length, eyebrow: `${peppers.length} peppers` },
    buildings: { count: buildings.length, eyebrow: `${buildings.length} towers` },
    sharks: { count: sharks.length, eyebrow: `${sharks.length} sharks` },
    space: { count: spaceCards.length, eyebrow: `${spaceCards.length} space cards` },
    jets: { count: jets.length, eyebrow: `${jets.length} aircraft` },
    countries: { count: countries.length, eyebrow: `${countries.length} flag cards` },
  };

  expect(peppers).toHaveLength(143);
  for (const [topic, values] of Object.entries(expected)) {
    const pack = topicPacks[topic as keyof typeof topicPacks];
    expect(pack.libraryCount).toBe(values.count);
    expect(pack.featuredCount).toBe(values.count);
    expect(pack.eyebrow).toBe(values.eyebrow);
  }
});

test("difficulty progression gives Easy and Medium room before Hard", () => {
  expect(autoDifficulty(1, true, 10, 10, 10)).toBe(1);
  expect(autoDifficulty(1, true, 6, 16, 13)).toBe(2);
  expect(autoDifficulty(2, true, 12, 30, 27)).toBe(2);
  expect(autoDifficulty(2, true, 8, 45, 37)).toBe(3);
  expect(autoDifficulty(3, false, 0, 20, 7)).toBe(2);
});

test("difficulty pools grow cumulatively from familiar to obscure countries", () => {
  const easy = new Set(poolForDifficulty(countries, 1).map((country) => country.name));
  const medium = new Set(poolForDifficulty(countries, 2).map((country) => country.name));
  const hard = new Set(poolForDifficulty(countries, 3).map((country) => country.name));

  expect(easy).toContain("United States");
  expect(easy).not.toContain("Belgium");
  expect(easy).not.toContain("Guinea");
  expect(medium).toContain("United States");
  expect(medium).toContain("Belgium");
  expect(medium).not.toContain("Guinea");
  expect(hard).toContain("United States");
  expect(hard).toContain("Belgium");
  expect(hard).toContain("Guinea");
});

test("Hard retains every Easy subject and adds the rest of every category", () => {
  for (const category of playableChallengeCategories) {
    const easy = poolForDifficulty(category.cards, 1);
    const hard = poolForDifficulty(category.cards, 3);
    const hardIds = new Set(hard.map((card) => card.id));

    expect(easy.length, `${category.id} needs a broad Easy pool`).toBeGreaterThanOrEqual(10);
    expect(hard.length, `${category.id} Hard should use the whole catalog`).toBe(category.cards.length);
    expect(easy.every((card) => hardIds.has(card.id)), `${category.id} Hard should retain every Easy card`).toBe(true);
  }
});

test("hard multiplication uses genuinely harder factors", () => {
  const easyRounds = Array.from({ length: 30 }, (_, seed) => buildNumberRound("peppers", 1, seed * 3 + 2));
  const hardRounds = Array.from({ length: 30 }, (_, seed) => buildNumberRound("peppers", 3, seed * 3 + 2));
  expect(easyRounds.every((round) => round.operation === "multiplication" && round.termValues.every((value) => value <= 5))).toBe(true);
  expect(hardRounds.every((round) => round.operation === "multiplication" && round.termValues.every((value) => value >= 6 && value <= 12))).toBe(true);
});

test("pack Odd One rounds never ask children to infer a hidden category", () => {
  const cards = mathFixtureCards.map((card, index) => ({
    ...card,
    categories: index === 1 ? ["andes"] : ["karakoram"],
  }));
  const round = buildOddRoundFromCards(cards, "mountains", 3, 137);

  expect(round.prompt).toBe("Which card has the highest Length?");
  expect(round.answerId).toBe("math-card-3");
  expect(`${round.prompt} ${round.reason} ${round.explanation}`).not.toMatch(/category|karakoram|andes/i);
  expect(new Set(round.cards.map((card) => card.statValue)).size).toBe(4);
});

test("50 Hudson Yards and 28 Liberty Street use real credited photos", () => {
  const expected = {
    "50-hudson-yards": {
      image: "/burrow-assets/buildings/50-hudson-yards.jpg",
      imageSourceFile: "50 Hudson Yards (55379880087).jpg",
      imageSourceUrl: "https://commons.wikimedia.org/wiki/File:50_Hudson_Yards_(55379880087).jpg",
      imageCredit: "Ajay Suresh, CC BY 4.0 · Wikimedia Commons",
    },
    "28-liberty": {
      image: "/burrow-assets/buildings/28-liberty.jpg",
      imageSourceFile: "28 Liberty Street 010.jpg",
      imageSourceUrl: "https://commons.wikimedia.org/wiki/File:28_Liberty_Street_010.jpg",
      imageCredit: "Kidfly182, CC BY 4.0 · Wikimedia Commons",
    },
  } as const;

  for (const [id, image] of Object.entries(expected)) {
    const building = buildings.find((candidate) => candidate.id === id);
    expect(building).toMatchObject(image);
    expect(building?.image).not.toMatch(/\.svg$/);
    expect(collectionCards().find((card) => card.id === id)?.image).toBe(image.image);
  }
});

test("learning variety blocks exact repeats while timing review of missed concepts", () => {
  const original = learningIdentity({
    exactKey: "geo:pepper:jalapeno:mexico",
    conceptKey: "location:jalapeno",
    topic: "peppers",
    subjects: ["Jalapeno"],
  });
  const alternate = learningIdentity({
    exactKey: "quiz:pepper:jalapeno:location-clue",
    conceptKey: "location:jalapeno",
    topic: "peppers",
    subjects: ["Jalapeno"],
  });
  const fresh = learningIdentity({
    exactKey: "geo:pepper:habanero:mexico",
    conceptKey: "location:habanero",
    topic: "peppers",
    subjects: ["Habanero"],
  });
  const recentMiss = addLearningExposure([], original, { mode: "geo", topic: "peppers", outcome: "incorrect" });
  const spacedMiss = [
    ...Array.from({ length: 7 }, (_, index) => ({
      ...learningIdentity({
        exactKey: `quiz:filler:${index}`,
        conceptKey: `filler:${index}`,
        topic: "peppers",
        subjects: [`Filler ${index}`],
      }),
      mode: "quiz",
      topic: "peppers",
      outcome: "correct" as const,
      sequence: 8 - index,
    })),
    recentMiss[0],
  ];

  expect(learningVarietyScore(original, recentMiss)).toBeLessThan(learningVarietyScore(fresh, recentMiss));
  expect(learningVarietyScore(alternate, spacedMiss)).toBeGreaterThan(learningVarietyScore(alternate, recentMiss));
  expect(learningVarietyScore(alternate, spacedMiss)).toBeGreaterThan(learningVarietyScore(fresh, spacedMiss));
  expect(learningVarietyScore(original, spacedMiss)).toBeLessThan(learningVarietyScore(fresh, spacedMiss));
});

test("learning recap separates strong ideas from ideas ready to revisit", () => {
  const strong = learningIdentity({ exactKey: "quiz:strong", conceptKey: "heat:jalapeno", topic: "peppers", subjects: ["Jalapeno"] });
  const review = learningIdentity({ exactKey: "geo:review", conceptKey: "location:habanero", topic: "peppers", subjects: ["Habanero"] });
  const practiced = learningIdentity({ exactKey: "quiz:practiced", conceptKey: "heat:bell-pepper", topic: "peppers", subjects: ["Bell Pepper"] });

  let history = addLearningExposure([], strong, { mode: "quiz", topic: "peppers", outcome: "correct" });
  history = addLearningExposure(history, strong, { mode: "versus", topic: "peppers", outcome: "correct" });
  history = addLearningExposure(history, review, { mode: "geo", topic: "peppers", outcome: "skip" });
  history = addLearningExposure(history, practiced, { mode: "quiz", topic: "peppers", outcome: "correct" });

  expect(summarizeLearningHistory(history)).toEqual({
    practicedConcepts: 3,
    strongConcepts: 1,
    reviewConcepts: 1,
  });
});

test("card discovery scopes duplicate titles to their category while preserving legacy saves", () => {
  const sharkMegalodon = { id: "megalodon", topic: "sharks", title: "Megalodon" };
  const dinosaurMegalodon = { id: "megalodon", topic: "dinosaurs", title: "Megalodon" };
  const sharkUnlock = cardUnlockKey(sharkMegalodon.topic, sharkMegalodon.id);

  expect(isCardUnlocked([sharkUnlock], sharkMegalodon)).toBe(true);
  expect(isCardUnlocked([sharkUnlock], dinosaurMegalodon)).toBe(false);
  expect(isCardUnlocked(["Megalodon"], dinosaurMegalodon)).toBe(true);

  const shuffled = discoveryShuffle(
    [sharkMegalodon, dinosaurMegalodon],
    2,
    [sharkUnlock],
    cardDiscoveryIdentities,
  );
  expect(shuffled[0]).toEqual(dinosaurMegalodon);
});

test("adaptive topic weighting includes downloadable pack categories", () => {
  const weighted = weightTopicsForAccuracy(
    ["sharks", "dinosaurs", "bridges-and-tunnels"],
    {
      sharks: { correct: 10, answered: 10 },
      dinosaurs: { correct: 1, answered: 5 },
      "bridges-and-tunnels": { correct: 4, answered: 5 },
    },
  );

  expect(weighted.filter((topic) => topic === "sharks")).toHaveLength(1);
  expect(weighted.filter((topic) => topic === "dinosaurs")).toHaveLength(3);
  expect(weighted.filter((topic) => topic === "bridges-and-tunnels")).toHaveLength(1);
});

test("saved profiles select newly added topics once without undoing later choices", () => {
  const currentTopics = ["peppers", "buildings", "sharks", "space", "jets", "countries"];
  const legacy = migrateTopicSelection({
    interests: currentTopics.filter((topic) => topic !== "countries"),
    availableTopics: currentTopics,
  });
  expect(legacy.interests).toEqual(currentTopics);

  const withNewTopic = migrateTopicSelection({
    interests: ["sharks"],
    knownTopics: currentTopics,
    availableTopics: [...currentTopics, "ocean-life"],
  });
  expect(withNewTopic.interests).toEqual(["sharks", "ocean-life"]);

  const afterTurningNewTopicOff = migrateTopicSelection({
    interests: ["sharks"],
    knownTopics: withNewTopic.knownTopics,
    availableTopics: [...currentTopics, "ocean-life"],
  });
  expect(afterTurningNewTopicOff.interests).toEqual(["sharks"]);
});

test("the derived card catalog is reused across round generation", () => {
  expect(collectionCards()).toBe(collectionCards());
});

test("every collection card has a structured fact profile", () => {
  const cards = [
    ...collectionCards(),
    ...loadPlayablePacks().flatMap((pack) => packToPlayableDeck(pack).cards),
  ];
  for (const card of cards) {
    expect(card.details?.length, `${card.topic}/${card.id} needs structured details`).toBeGreaterThanOrEqual(2);
    expect(card.details?.some((detail) => detail.label === "Data note"), `${card.topic}/${card.id} should keep data notes out of the child-facing card`).toBe(false);
    expect(new Set(card.details?.map((detail) => detail.label)).size, `${card.topic}/${card.id} detail labels must be distinct`).toBe(card.details?.length);
    for (const detail of card.details ?? []) {
      expect(detail.label.trim(), `${card.topic}/${card.id} has an empty detail label`).toBeTruthy();
      expect(detail.value.trim(), `${card.topic}/${card.id} has an empty detail value`).toBeTruthy();
    }
  }
});

test("every generated Quiz location question carries matching map choices", () => {
  for (const topic of ["peppers", "buildings"] as const) {
    for (const difficulty of [1, 2, 3] as const) {
      const locationQuestions: ReturnType<typeof buildSession> = [];
      for (let seed = 0; seed < 24 && locationQuestions.length < 8; seed += 1) {
        locationQuestions.push(
          ...buildSession(topic, difficulty, seed * 101, [])
            .filter((question) => question.kind.endsWith("-location")),
        );
      }
      expect(locationQuestions.length).toBeGreaterThan(0);
      for (const question of locationQuestions) {
        expect(question.map, `${question.id} needs a teaching map`).toBeTruthy();
        expect(question.map?.answerId).toBe(question.answer);
        expect(question.map?.choices.map((choice) => choice.label)).toEqual(question.choices);
        const minimum = geoChoiceSeparationForDifficulty(difficulty);
        for (let first = 0; first < (question.map?.choices.length ?? 0); first += 1) {
          for (let second = first + 1; second < (question.map?.choices.length ?? 0); second += 1) {
            const firstChoice = question.map?.choices[first];
            const secondChoice = question.map?.choices[second];
            expect(geoPointDistanceKm(firstChoice!.point, secondChoice!.point)).toBeGreaterThanOrEqual(minimum.kilometers);
            expect(geoPointMapDistance(firstChoice!.point, secondChoice!.point)).toBeGreaterThanOrEqual(minimum.mapPercent);
          }
        }
      }
    }
  }
});

test("location-based True/False rounds carry claimed and actual map points", () => {
  const minimum = geoChoiceSeparationForDifficulty(3);
  for (const topic of ["peppers", "buildings", "jets"] as const) {
    const difficulty = topic === "jets" ? 2 : 1;
    const locationRounds: ReturnType<typeof buildFactRound>[] = [];
    for (let seed = 0; seed < 80 && locationRounds.length < 10; seed += 1) {
      const round = buildFactRound(topic, difficulty, seed * 37);
      if (round.statement.includes(" is in ") || round.statement.includes(" is linked to ") || round.statement.includes(" is from ")) {
        locationRounds.push(round);
      }
    }
    expect(locationRounds.length).toBeGreaterThan(0);
    for (const round of locationRounds) {
      expect(round.map, `${round.id} needs a claimed and actual map point`).toBeTruthy();
      expect(round.map?.actual.label).toBe(round.locations?.[0]?.label);
      if (round.answer === "False") {
        expect(geoPointDistanceKm(round.map!.actual.point, round.map!.claimed.point)).toBeGreaterThanOrEqual(minimum.kilometers);
        expect(geoPointMapDistance(round.map!.actual.point, round.map!.claimed.point)).toBeGreaterThanOrEqual(minimum.mapPercent);
      }
    }
  }

  const mappedCards = collectionCards()
    .filter((card) => card.topic === "buildings")
    .map((card) => ({
      ...card,
      categories: ["building"],
      stats: [{
        id: "height",
        label: card.statLabel,
        value: card.statValue,
        display: card.statDisplay,
        direction: "higher" as const,
      }],
    })) satisfies GenericKnowledgeCard[];
  const falseLocationRounds: ReturnType<typeof buildFactRoundFromCards>[] = [];
  for (let seed = 0; seed < 80 && falseLocationRounds.length < 10; seed += 1) {
    const round = buildFactRoundFromCards(mappedCards, "fixture-pack", 1, seed * 41);
    if (round.answer === "False" && round.map) falseLocationRounds.push(round);
  }
  expect(falseLocationRounds.length).toBeGreaterThan(0);
  for (const round of falseLocationRounds) {
    expect(geoPointDistanceKm(round.map!.actual.point, round.map!.claimed.point)).toBeGreaterThanOrEqual(minimum.kilometers);
    expect(geoPointMapDistance(round.map!.actual.point, round.map!.claimed.point)).toBeGreaterThanOrEqual(minimum.mapPercent);
  }
});

test("every generated Peek location question carries well-separated map choices", () => {
  const mappedCards = collectionCards()
    .filter((card) => card.topic === "buildings")
    .map((card) => ({ ...card, categories: ["building"], stats: [] })) satisfies GenericKnowledgeCard[];

  for (const difficulty of [1, 2, 3] as const) {
    const locationRounds: ReturnType<typeof buildRevealRoundFromCards>[] = [];
    for (let seed = 0; seed < 60 && locationRounds.length < 8; seed += 1) {
      const round = buildRevealRoundFromCards(mappedCards, "buildings", difficulty, seed * 43);
      if (round.prompt === "Where in the world is this found?") locationRounds.push(round);
    }
    expect(locationRounds.length).toBeGreaterThan(0);
    for (const round of locationRounds) {
      expect(round.map, `${round.id} needs a teaching map`).toBeTruthy();
      expect(round.map?.answerId).toBe(round.answer);
      expect(round.map?.choices.map((choice) => choice.label)).toEqual(round.choices);
      const minimum = geoChoiceSeparationForDifficulty(difficulty);
      for (let first = 0; first < (round.map?.choices.length ?? 0); first += 1) {
        for (let second = first + 1; second < (round.map?.choices.length ?? 0); second += 1) {
          const firstChoice = round.map?.choices[first];
          const secondChoice = round.map?.choices[second];
          expect(geoPointDistanceKm(firstChoice!.point, secondChoice!.point)).toBeGreaterThanOrEqual(minimum.kilometers);
          expect(geoPointMapDistance(firstChoice!.point, secondChoice!.point)).toBeGreaterThanOrEqual(minimum.mapPercent);
        }
      }
    }
  }
});

test("location-based Odd One rounds preserve locations for map feedback", () => {
  const locationRounds: ReturnType<typeof buildOddRound>[] = [];
  for (let seed = 0; seed < 80 && locationRounds.length < 8; seed += 1) {
    const round = buildOddRound("buildings", 2, seed * 47);
    if (/not in (New York City|Brooklyn|Asia|the United States|China)/.test(round.prompt)) locationRounds.push(round);
  }
  expect(locationRounds.length).toBeGreaterThan(0);
  for (const round of locationRounds) expect(round.locations?.length).toBe(4);
});

test("source-verified Scoville ranges stay accurate", () => {
  expect(peppers.find((pepper) => pepper.id === "jimmy-nardello")).toMatchObject({
    name: "Jimmy Nardello",
    shuMin: 0,
    shuMax: 100,
    heat: "not spicy",
  });
});

test("15 new peppers share their verified records and real photos across the game", () => {
  const expected = {
    habanada: [0, 0],
    "corno-di-toro": [0, 500],
    "santa-fe-grande": [500, 700],
    "bulgarian-carrot": [5000, 30000],
    aleppo: [10000, 10000],
    "italian-wax": [12000, 22000],
    mattapeno: [5000, 10000],
    "purple-jalapeno": [2500, 8000],
    "sugar-rush-peach": [50000, 100000],
    "sugar-rush-stripey": [50000, 100000],
    "aji-mango": [100000, 150000],
    "aji-pineapple": [100000, 150000],
    "purple-thai": [50000, 100000],
    "naga-morich": [1000000, 1500000],
    "seven-pot-douglah": [1150000, 1800000],
  } as const;
  const newPepperIds = Object.keys(expected);
  const newPeppers = peppers.filter((pepper) => newPepperIds.includes(pepper.id));

  expect(newPeppers).toHaveLength(15);
  expect(new Set(newPeppers.map((pepper) => pepper.id)).size).toBe(15);
  for (const pepper of newPeppers) {
    expect([pepper.shuMin, pepper.shuMax]).toEqual(expected[pepper.id as keyof typeof expected]);
    expect(pepper.image).toBe(`/burrow-assets/peppers/${pepper.id}.jpg`);
    expect(pepper.imageCredit).toBe("Tyler Farms (used with permission)");
    expect(pepper.imageSourceUrl).toMatch(/^https:\/\/www\.tyler-farms\.com\//);
  }

  const pepperCards = collectionCards().filter((card) => card.topic === "peppers");
  for (const pepper of newPeppers) {
    expect(pepperCards.find((card) => card.id === pepper.id)).toMatchObject({
      image: pepper.image,
      statValue: pepper.shuMax,
    });
  }

  const hardPool = new Set(poolForDifficulty(peppers, 3).map((pepper) => pepper.id));
  for (const pepper of newPeppers) expect(hardPool).toContain(pepper.id);

  const mediumPool = new Set(poolForDifficulty(peppers, 2).map((pepper) => pepper.id));
  expect(newPeppers.filter((pepper) => mediumPool.has(pepper.id)).length).toBeGreaterThanOrEqual(8);
});

test("21 rare and unusual peppers keep verified metadata, honest estimates, and natural rotation", () => {
  const expected = {
    "peach-aribibi-gusano": [5000, 30000],
    "mustard-seven-pot": [800000, 1000000],
    peachadew: [1000, 1000],
    "aji-rojo": [40000, 70000],
    "red-thunder-mountain-longhorn": [20000, 40000],
    "orange-aji-fantasy": [5000, 10000],
    "peppapeach-stripey": [1000, 1000],
    "purple-tiger": [5000, 11000],
    "purple-taj-mahal": [250000, 400000],
    "aji-confusion": [10000, 15000],
    "piccante-calabrese": [25000, 40000],
    "pink-tiger": [250000, 500000],
    "orange-seven-pot": [1000000, null],
    "white-carolina-reaper": [1500000, null],
    "ghost-breath": [1500000, null],
    "red-primotalii": [1000000, null],
    "thors-thunderbolt": [300000, 500000],
    "gator-jigsaw": [1000000, null],
    "aji-fantasy": [5000, 30000],
    santaka: [30000, 50000],
    "white-aji-fantasy": [5000, 30000],
  } as const;
  const newPepperIds = Object.keys(expected);
  const newPeppers = peppers.filter((pepper) => newPepperIds.includes(pepper.id));

  expect(newPeppers).toHaveLength(21);
  expect(new Set(newPeppers.map((pepper) => pepper.id)).size).toBe(21);
  expect(newPeppers.filter((pepper) => pepper.metadata?.location)).toHaveLength(9);

  for (const pepper of newPeppers) {
    expect([pepper.shuMin, pepper.shuMax]).toEqual(expected[pepper.id as keyof typeof expected]);
    expect(pepper.image).toBe(`/burrow-assets/peppers/${pepper.id}.jpg`);
    expect(pepper.imageCredit).toBe("Tyler Farms (used with permission)");
    expect(pepper.imageSourceUrl).toMatch(/^https:\/\/www\.tyler-farms\.com\//);
    expect(pepper.fact.length).toBeGreaterThanOrEqual(50);
    if (pepper.scovilleStatus === "unofficial") {
      expect(pepper.metadata?.accuracyNote).toBeTruthy();
    }
  }

  const pepperCards = collectionCards().filter((card) => card.topic === "peppers");
  for (const pepper of newPeppers) {
    const card = pepperCards.find((item) => item.id === pepper.id);
    expect(card).toMatchObject({ image: pepper.image, metadata: pepper.metadata });
    if (pepper.shuMax === null) expect(Number.isNaN(card?.statValue)).toBe(true);
    else expect(card?.statValue).toBe(pepper.shuMax);
  }

  const idsByDifficulty = new Map(
    ([1, 2, 3] as const).map((difficulty) => [
      difficulty,
      new Set(poolForDifficulty(peppers, difficulty).map((pepper) => pepper.id)),
    ]),
  );
  const seenCount = (difficulty: 1 | 2 | 3) =>
    newPeppers.filter((pepper) => idsByDifficulty.get(difficulty)?.has(pepper.id)).length;

  expect(seenCount(1)).toBeGreaterThanOrEqual(5);
  expect(seenCount(2)).toBeGreaterThanOrEqual(12);
  expect(seenCount(3)).toBe(21);
});

test("25 world peppers add credited source photos, honest heat data, geography, and natural rotation", () => {
  const expected = {
    "seven-pot-barrackpore": [1000000, null],
    "aji-cito": [80000, 100000],
    "aji-cristal": [30000, 30000],
    "aji-habanero": [5000, 10000],
    "aji-sivri": [5000, 30000],
    "brain-strain": [1000000, 1350000],
    "caribbean-red": [300000, 475000],
    "carmen-italian-sweet": [0, 500],
    cascabella: [1500, 6000],
    "chilhuacle-amarillo": [5000, 5000],
    chimayo: [4000, 6000],
    cowhorn: [2500, 5000],
    "devils-tongue": [125000, 325000],
    dolmalik: [1000, 5000],
    "doux-des-landes": [0, 0],
    dundicut: [55000, 65000],
    espelette: [0, 4000],
    "guntur-sannam": [25000, 40000],
    "gypsy-pepper": [0, 0],
    "kashmiri-chili": [1000, 2000],
    "piment-de-bresse": [1500, 2500],
    "wiri-wiri": [60000, 350000],
    "aji-panca": [500, 1000],
    "alma-paprika": [500, 2000],
    "cheiro-roxa": [60000, 80000],
  } as const;
  const newPepperIds = Object.keys(expected);
  const newPeppers = peppers.filter((pepper) => newPepperIds.includes(pepper.id));

  expect(newPeppers).toHaveLength(25);
  expect(new Set(newPeppers.map((pepper) => pepper.id)).size).toBe(25);
  expect(new Set(newPeppers.map((pepper) => pepper.image)).size).toBe(25);
  expect(newPeppers.filter((pepper) => pepper.metadata?.location)).toHaveLength(21);
  expect(newPeppers.every((pepper) => !pepper.isCondiment)).toBe(true);

  for (const pepper of newPeppers) {
    expect([pepper.shuMin, pepper.shuMax]).toEqual(expected[pepper.id as keyof typeof expected]);
    expect(pepper.image).toBe(`/burrow-assets/peppers/${pepper.id}.jpg`);
    expect(pepper.imageFit).toBe("contain");
    expect(pepper.fact.length).toBeGreaterThanOrEqual(50);
    if (pepper.scovilleStatus === "unofficial") expect(pepper.metadata?.accuracyNote).toBeTruthy();
  }

  expect(newPeppers.filter((pepper) => pepper.imageCredit === "Chili Pepper Madness (used with permission)")).toHaveLength(23);
  expect(newPeppers.find((pepper) => pepper.id === "alma-paprika")).toMatchObject({
    imageCredit: "Chili Peps Wiki (used with permission)",
    imageSourceUrl: "https://chilipeps.fandom.com/wiki/List_of_Capsicum_cultivars",
  });
  expect(newPeppers.find((pepper) => pepper.id === "cheiro-roxa")).toMatchObject({
    name: "Cheiro Roxa",
    color: "purple to peach",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Cheiro_roxa2.jpg",
    imageCredit: "Mptu22, CC BY-SA 4.0, Wikimedia Commons",
    metadata: {
      location: { label: "Brazil", countries: ["Brazil"], continents: ["South America"] },
    },
  });
  expect(newPeppers.find((pepper) => pepper.id === "dundicut")).toMatchObject({
    name: "Dundicut",
    color: "ruby red",
    imageSourceUrl: "https://www.chilipeppermadness.com/chili-pepper-types/medium-hot-chili-peppers/dundicut-chili-peppers/",
    metadata: {
      location: { label: "Sindh, Pakistan", countries: ["Pakistan"], continents: ["Asia"] },
    },
  });

  const pepperCards = collectionCards().filter((card) => card.topic === "peppers");
  for (const pepper of newPeppers) {
    const card = pepperCards.find((item) => item.id === pepper.id);
    expect(card).toMatchObject({ image: pepper.image, metadata: pepper.metadata });
    if (pepper.shuMax === null) expect(Number.isNaN(card?.statValue)).toBe(true);
    else expect(card?.statValue).toBe(pepper.shuMax);
  }
  expect(pepperCards.find((card) => card.id === "seven-pot-barrackpore")?.statDisplay).toBe("1,000,000+ SHU (unofficial)");

  const easyIds = new Set(poolForDifficulty(peppers, 1).map((pepper) => pepper.id));
  const mediumIds = new Set(poolForDifficulty(peppers, 2).map((pepper) => pepper.id));
  const hardIds = new Set(poolForDifficulty(peppers, 3).map((pepper) => pepper.id));
  expect(newPepperIds.filter((id) => easyIds.has(id)).length).toBeGreaterThanOrEqual(8);
  expect(newPepperIds.filter((id) => mediumIds.has(id)).length).toBeGreaterThanOrEqual(15);
  for (const id of newPepperIds) expect(hardIds).toContain(id);
});

test("Super Chilli, Moruga Red, and three chocolate varieties join normal pepper play", () => {
  const expected = {
    "super-chilli": {
      name: "Super Chilli",
      range: [40000, 50000],
      color: "green through orange to red",
      status: "unofficial",
    },
    "moruga-red": {
      name: "Moruga Red",
      range: [300000, 500000],
      color: "blood red",
      status: undefined,
    },
    "chocolate-ghost": {
      name: "Chocolate Ghost Pepper",
      range: [800000, 1041427],
      color: "chocolate brown",
      status: "unofficial",
    },
    "chocolate-moruga-scorpion": {
      name: "Chocolate Moruga Scorpion",
      range: [1200000, 2000000],
      color: "chocolate brown",
      status: "unofficial",
    },
    "chocolate-scotch-bonnet": {
      name: "Chocolate Scotch Bonnet",
      range: [100000, 350000],
      color: "chocolate brown",
      status: "unofficial",
    },
  } as const;
  const pepperCards = collectionCards().filter((card) => card.topic === "peppers");

  for (const [id, details] of Object.entries(expected)) {
    const pepper = peppers.find((item) => item.id === id);
    expect(pepper).toMatchObject({
      name: details.name,
      shuMin: details.range[0],
      shuMax: details.range[1],
      color: details.color,
      image: `/burrow-assets/peppers/${id}.png`,
      imageSourceUrl: "https://openai.com/",
      imageCredit: "AI-generated for Burrow",
    });
    expect(pepper?.scovilleStatus).toBe(details.status);
    if (details.status === "unofficial") expect(pepper?.metadata?.accuracyNote).toBeTruthy();

    const card = pepperCards.find((item) => item.id === id);
    expect(card).toMatchObject({
      image: pepper?.image,
      metadata: pepper?.metadata,
      statValue: details.range[1],
    });
  }

  expect(peppers.find((item) => item.id === "moruga-red")?.metadata?.location).toEqual({
    label: "Trinidad and Tobago",
    countries: ["Trinidad and Tobago"],
    continents: ["North America"],
  });
  expect(peppers.find((item) => item.id === "moruga-red")?.fact).toContain("not the wrinkled Trinidad Moruga Scorpion");

  const expectedByDifficulty = {
    1: ["super-chilli", "chocolate-scotch-bonnet"],
    2: ["super-chilli", "moruga-red", "chocolate-ghost", "chocolate-scotch-bonnet"],
    3: Object.keys(expected),
  } as const;

  for (const difficulty of [1, 2, 3] as const) {
    const eligibleIds = new Set(poolForDifficulty(peppers, difficulty).map((pepper) => pepper.id));
    for (const id of expectedByDifficulty[difficulty]) {
      expect(eligibleIds).toContain(id);
    }
  }
});

test("Tangerine Dream and Chocolate Rocoto X join pepper play with honest heat data", () => {
  const expected = {
    "tangerine-dream": { name: "Tangerine Dream", range: [0, 0], color: "orange-red", status: undefined },
    "chocolate-rocoto-x": { name: "Chocolate Rocoto X", range: [6000, 6000], color: "chocolate-burgundy", status: "unofficial" },
  } as const;

  for (const [id, details] of Object.entries(expected)) {
    const pepper = peppers.find((item) => item.id === id);
    expect(pepper).toMatchObject({
      name: details.name,
      shuMin: details.range[0],
      shuMax: details.range[1],
      color: details.color,
      image: `/burrow-assets/peppers/${id}.png`,
      imageSourceUrl: "https://openai.com/",
      imageCredit: "AI-generated for Burrow",
    });
    expect(pepper?.scovilleStatus).toBe(details.status);
    expect(pepper?.metadata?.accuracyNote).toBeTruthy();
  }

  const eligibleIds = new Set(poolForDifficulty(peppers, 3).map((pepper) => pepper.id));
  for (const id of Object.keys(expected)) expect(eligibleIds).toContain(id);
});

test("reading questions rotate instructions and pepper comprehension patterns", () => {
  const pepperReading: ReturnType<typeof buildSession> = [];
  for (let seed = 0; seed < 36; seed += 1) {
    pepperReading.push(...buildSession("peppers", 2, seed * 97, []).filter((question) => question.kind === "pepper-reading"));
    const patterns = new Set(pepperReading.map((question) => question.id.match(/pepper-reading-(color|fact-identity|heat-word)-/)?.[1]).filter(Boolean));
    if (patterns.size === 3) break;
  }
  const pepperPatterns = new Set(pepperReading.map((question) => question.id.match(/pepper-reading-(color|fact-identity|heat-word)-/)?.[1]).filter(Boolean));
  expect([...pepperPatterns].sort()).toEqual(["color", "fact-identity", "heat-word"]);

  for (const [topic, minimum] of [["sharks", 3], ["jets", 3], ["space", 4]] as const) {
    const prompts = new Set<string>();
    for (let seed = 0; seed < 30 && prompts.size < minimum; seed += 1) {
      for (const question of buildSession(topic, 1, seed * 89, [])) {
        if (question.kind.endsWith("-reading")) prompts.add(question.prompt);
      }
    }
    expect(prompts.size, `${topic} should rotate reading instructions`).toBeGreaterThanOrEqual(minimum);
  }
});

test("building comparisons use a direct child-friendly prompt", () => {
  const comparisons = Array.from({ length: 16 }, (_, seed) => buildSession("buildings", 3, seed * 83, []))
    .flat()
    .filter((question) => question.kind === "building-taller");
  expect(comparisons.length).toBeGreaterThan(0);
  expect(new Set(comparisons.map((question) => question.prompt))).toEqual(new Set(["Which one is taller?"]));
});

test("pepper Top Trumps uses named rarity tiers and allows exact ties", () => {
  let tiedRound: ReturnType<typeof buildTopTrumpRound> | undefined;
  for (let seed = 0; seed < 600; seed += 1) {
    const round = buildTopTrumpRound("peppers", 3, seed * 41);
    const playerRarity = round.player.stats.find((stat) => stat.id === "rarity");
    const computerRarity = round.computer.stats.find((stat) => stat.id === "rarity");
    expect(playerRarity?.display).toMatch(/^(Common|Uncommon|Rare|Epic|Legendary)$/);
    expect(computerRarity?.display).toMatch(/^(Common|Uncommon|Rare|Epic|Legendary)$/);
    expect(round.player.stats.map((stat) => stat.id)).toEqual(round.computer.stats.map((stat) => stat.id));
    if (playerRarity && computerRarity && topTrumpOutcome(playerRarity, computerRarity) === "tie") {
      tiedRound = round;
      break;
    }
  }
  expect(tiedRound, "at least one naturally dealt rarity matchup should tie").toBeTruthy();
});

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

  for (let seed = 0; seed < 24; seed += 1) {
    const sortRound = buildSortRound("peppers", 3, seed);
    expect(sortRound.cards.every((card) => card.id !== "the-noah" && Number.isFinite(card.statValue))).toBe(true);
  }

  expect(new Set(poolForDifficulty(peppers, 3).map((pepper) => pepper.id))).toContain("the-noah");
  expect(new Set(poolForDifficulty(peppers, 1).map((pepper) => pepper.id))).not.toContain("the-noah");

  const candidates = peppers.map((pepper) => ({ id: pepper.id, title: pepper.name }));
  const unlockedOtherPeppers = peppers.filter((pepper) => pepper.id !== "the-noah").map((pepper) => pepper.name);
  const ordinaryNoahCount = Array.from({ length: 100 }, (_, seed) =>
    discoveryShuffle(candidates, seed, [], (item) => item.title)[0].id,
  ).filter((id) => id === "the-noah").length;
  const discoveryNoahCount = Array.from({ length: 100 }, (_, seed) =>
    discoveryShuffle(candidates, seed, unlockedOtherPeppers, (item) => item.title)[0].id,
  ).filter((id) => id === "the-noah").length;
  expect(discoveryNoahCount).toBeGreaterThan(ordinaryNoahCount);
  expect(discoveryNoahCount).toBeLessThan(100);

  const discoveryQuestions = Array.from({ length: 24 }, (_, seed) =>
    buildSession("peppers", 3, seed * 101, [], unlockedOtherPeppers),
  ).flat().filter((question) => question.image === "/burrow-assets/peppers/the-noah.png");
  expect(discoveryQuestions.length).toBeGreaterThan(0);
  for (const question of discoveryQuestions) {
    expect(["pepper-heat", "pepper-reading", "pepper-location"]).toContain(question.kind);
    expect(question.numberLine).toBeUndefined();
  }
});

test("Pepper Y snaps directly into the hottest sort slot", () => {
  let round: ReturnType<typeof buildSortRound> | undefined;
  for (let seed = 0; seed < 500; seed += 1) {
    const candidate = buildSortRound("peppers", 3, seed);
    if (candidate.cards.some((card) => card.id === "pepper-y")) {
      round = candidate;
      break;
    }
  }

  expect(round).toBeDefined();
  expect(round?.answerIds.at(-1)).toBe("pepper-y");
  expect(slotSortCardIds(round!, ["pepper-y"])).toEqual([
    ...Array(round!.answerIds.length - 1).fill(undefined),
    "pepper-y",
  ]);
});

test("Orange Butch T and Goat Trail join normal pepper play with Goat Trail's cayenne-based estimate marked unofficial", () => {
  const newPeppers = Object.fromEntries(
    peppers
      .filter((pepper) => ["orange-butch-t", "goat-trail"].includes(pepper.id))
      .map((pepper) => [pepper.id, pepper]),
  );

  expect(Object.keys(newPeppers).sort()).toEqual(["goat-trail", "orange-butch-t"]);
  expect(newPeppers["orange-butch-t"]).toMatchObject({
    name: "Orange Butch T",
    shuMin: 800000,
    shuMax: 1463700,
    heat: "insane",
    color: "orange",
    image: "/burrow-assets/peppers/orange-butch-t.png",
  });
  expect(newPeppers["goat-trail"]).toMatchObject({
    name: "Goat Trail",
    shuMin: 30000,
    shuMax: 50000,
    heat: "hot",
    scovilleStatus: "unofficial",
    color: "bright red",
    image: "/burrow-assets/peppers/goat-trail.png",
  });
  expect(newPeppers["goat-trail"].metadata?.accuracyNote).toContain("unofficial estimate");

  const goatTrailCard = collectionCards().find((card) => card.id === "goat-trail");
  expect(goatTrailCard?.statDisplay).toBe("~50,000 SHU (unofficial)");
  expect(goatTrailCard?.subStat).toContain("25,001-50,000 SHU");
  expect(goatTrailCard?.statValue).toBe(50000);

  for (const difficulty of [1, 2, 3] as const) {
    const eligibleIds = new Set(poolForDifficulty(peppers, difficulty).map((pepper) => pepper.id));
    expect(eligibleIds).toContain("goat-trail");
    if (difficulty >= 2) expect(eligibleIds).toContain("orange-butch-t");
  }

  for (let seed = 0; seed < 24; seed += 1) {
    expect(buildSortRound("peppers", 3, seed).cards.every((card) => Number.isFinite(card.statValue))).toBe(true);
  }
});

test("Yellow Bhut Assam joins normal pepper play with its permitted source image and Northeast India origin", () => {
  const pepper = peppers.find((item) => item.id === "yellow-bhut-assam");

  expect(pepper).toMatchObject({
    name: "Yellow Bhut Assam",
    shuMin: 800000,
    shuMax: 1000000,
    heat: "insane",
    color: "golden yellow",
    image: "/burrow-assets/peppers/yellow-bhut-assam.png",
    imageSourceUrl: "https://knowthepepper.com/peppers/bhut-jolokia-yellow/",
    imageCredit: "KnowThePepper.com (used with permission)",
    metadata: {
      location: {
        label: "Northeast India, India",
        countries: ["India"],
        continents: ["Asia"],
      },
    },
  });
  expect(pepper?.fact).toContain("Yellow Bhut Jolokia");
  expect(pepper?.fact).toContain("fruity, citrusy");

  const card = collectionCards().find((item) => item.id === "yellow-bhut-assam");
  expect(card).toMatchObject({
    image: "/burrow-assets/peppers/yellow-bhut-assam.png",
    statValue: 1000000,
    statDisplay: "1,000,000 SHU",
    metadata: pepper?.metadata,
  });

  for (const difficulty of [1, 2, 3] as const) {
    const eligibleIds = new Set(poolForDifficulty(peppers, difficulty).map((item) => item.id));
    expect(eligibleIds).toContain("yellow-bhut-assam");
  }
});

test("pepper collection cards use their displayed Scoville score from least to hottest", () => {
  const ordered = orderCollectionCardsByScoville(collectionCards().filter((card) => card.topic === "peppers"));
  const displayedScores = new Map(peppers.map((pepper) => [pepper.id, pepper.shuMax ?? pepper.shuMin ?? Number.POSITIVE_INFINITY]));
  const expectedOrder = [...ordered]
    .sort((a, b) => (displayedScores.get(a.id) ?? Number.POSITIVE_INFINITY) - (displayedScores.get(b.id) ?? Number.POSITIVE_INFINITY)
      || a.title.localeCompare(b.title));
  const lowerBoundOnly = ordered.filter((card) => {
    const pepper = peppers.find((item) => item.id === card.id);
    return pepper?.shuMin !== null && pepper?.shuMax === null;
  });

  expect(ordered[0].title).toBe("Bell Pepper");
  expect(ordered.map((card) => card.id)).toEqual(expectedOrder.map((card) => card.id));
  expect(ordered.findIndex((card) => card.id === "orange-seven-pot")).toBeLessThan(ordered.findIndex((card) => card.id === "armageddon"));
  expect(lowerBoundOnly.every((card) => !Number.isFinite(card.statValue))).toBe(true);
});

test("category collections keep every card in its meaningful order", () => {
  const pepperCards = collectionCards().filter((card) => card.topic === "peppers");
  const orderedPeppers = orderCollectionCardsForCategory(pepperCards);
  expect(orderedPeppers).toEqual(orderCollectionCardsByScoville(pepperCards));
  expect(collectionOrderLabel(orderedPeppers)).toBe("Scoville · mildest to hottest");

  const buildingCards = collectionCards().filter((card) => card.topic === "buildings");
  const orderedBuildings = orderCollectionCardsForCategory(buildingCards);
  expect(orderedBuildings.map((card) => card.statValue)).toEqual(
    [...orderedBuildings.map((card) => card.statValue)].sort((a, b) => b - a),
  );
  expect(collectionOrderLabel(orderedBuildings)).toBe("Height · highest to lowest");
});

test("Countries & Flags ships an exact 200-card passport catalog", () => {
  expect(countries).toHaveLength(200);
  expect(new Set(countries.map((country) => country.code)).size).toBe(200);
  expect(countries.every((country) => country.capital && country.population > 0 && country.areaKm2 > 0)).toBe(true);
  expect(countries.every((country) => Number.isInteger(country.landNeighborCount) && country.landNeighborCount >= 0 && country.landNeighborCount <= 14)).toBe(true);
  expect(countries.every((country) => country.highestPointName && country.highestPointM > 0 && country.highestPointM <= 8849)).toBe(true);
  expect(countries.every((country) => country.continents.length > 0 && country.metadata.location?.coordinates?.length === 2)).toBe(true);
  expect(countries.every((country) => country.image === `/burrow-assets/countries/${country.code.toLowerCase()}.svg`)).toBe(true);

  const countryCards = collectionCards().filter((card) => card.topic === "countries");
  expect(countryCards).toHaveLength(200);
  expect(countryCards.every((card) => card.details?.map((detail) => detail.label).join("|") === "Capital|Population|Land area|Land neighbors|Highest point|Continent|Region|Country code")).toBe(true);

  expect(countries.find((country) => country.code === "CM")).toMatchObject({ landNeighborCount: 6, highestPointM: 4045 });
  expect(countries.find((country) => country.code === "CN")).toMatchObject({ landNeighborCount: 14, highestPointName: "Mount Everest", highestPointM: 8849 });
  expect(countries.find((country) => country.code === "MV")).toMatchObject({ landNeighborCount: 0, highestPointM: 5 });
});

test("country quiz rotation moves from recognition to deeper metadata", () => {
  const mediumRounds = Array.from({ length: 90 }, (_, seed) => buildSession("countries", 2, seed * 101, [])).flat();
  expect(new Set(mediumRounds.map((round) => round.kind))).toEqual(new Set(["country-flag", "country-capital", "country-location", "country-population", "country-area"]));

  const rounds = Array.from({ length: 90 }, (_, seed) => buildSession("countries", 3, seed * 101, [])).flat();
  const kinds = new Set(rounds.map((round) => round.kind));
  expect(kinds).toEqual(new Set(["country-population", "country-area", "country-neighbors", "country-highest-point"]));

  const flagRound = mediumRounds.find((round) => round.kind === "country-flag");
  expect(flagRound?.secondChanceClue).toMatch(/capital is .+ in .+ people/);
  expect(flagRound?.imageAlt).toBe("Mystery country flag");
  expect(flagRound?.collectionTitles).toEqual([flagRound?.answer]);

  const mapRound = mediumRounds.find((round) => round.kind === "country-location");
  expect(mapRound?.map?.choices.length).toBe(4);
  expect(mapRound?.map?.choices.some((choice) => choice.id === mapRound.map?.answerId)).toBe(true);

  const hardFacts = Array.from({ length: 90 }, (_, seed) => buildFactRound("countries", 3, seed * 103, []));
  expect(new Set(hardFacts.map((round) => round.id.match(/fact-country-(population|area|neighbors|highest-point)-/)?.[1]))).toEqual(
    new Set(["population", "area", "neighbors", "highest-point"]),
  );
});

test("country play works across every card-game mode", () => {
  const headToHeads = buildHeadToHeadSession("countries", 3, 719, []);
  expect(new Set(headToHeads.map((round) => round.kind))).toEqual(new Set(["country-population", "country-area"]));

  const numberRounds = [0, 1, 2, 3, 4, 5].map((seed) => buildNumberRound("countries", 2, seed));
  expect(new Set(numberRounds.map((round) => round.operation))).toEqual(new Set(["addition", "subtraction"]));
  expect(numberRounds.every((round) => round.prompt.includes("million"))).toBe(true);

  const geo = buildGeoRound("countries", 3, 907);
  expect(geo.topic).toBe("countries");
  expect(geo.choices.some((choice) => choice.id === geo.answerId)).toBe(true);
  expect(Number.isFinite(geo.point.x) && Number.isFinite(geo.point.y)).toBe(true);

  const sort = buildSortRound("countries", 3, 911);
  expect(["Population", "Land area"]).toContain(sort.statLabel);
  expect(sort.cards).toHaveLength(4);

  const odd = buildOddRound("countries", 3, 919);
  expect(odd.cards).toHaveLength(4);
  expect(odd.reason).toContain("the others are in");

  expect(buildFactRound("countries", 3, 929).topic).toBe("countries");
  expect(buildRevealRound("countries", 3, 937).topic).toBe("countries");

  const trumps = buildTopTrumpRound("countries", 3, 941);
  expect(trumps.player.stats.map((stat) => stat.id)).toEqual(["population", "area", "land-neighbors", "highest-point"]);
  expect(trumps.computer.stats.map((stat) => stat.id)).toEqual(["population", "area", "land-neighbors", "highest-point"]);
  expect(trumps.player.stats.map((stat) => stat.label)).toEqual(["Population", "Land area", "Land neighbors", "Highest point"]);
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

test("every playable category has ten distinct options in every Challenge skill", () => {
  expect(playableChallengeCategories).toHaveLength(10);

  for (const category of playableChallengeCategories) {
    const campaigns = buildChallengeCampaignsForCategory(category);
    expect(campaigns, `${category.id} needs 10 campaigns`).toHaveLength(challengeCampaignCountPerCategory);
    expect(new Set(campaigns.map((campaign) => campaign.id)).size).toBe(challengeCampaignCountPerCategory);

    for (const skill of ["Reading", "Geography", "Math", "Science", "Words"] as const) {
      const steps = campaigns.map((campaign) => campaign.steps.find((step) => step.skill === skill)!);
      const optionSignatures = steps.map((step) => `${step.clue}|${step.question}|${step.answer}`);
      expect(new Set(optionSignatures).size, `${category.id}/${skill} needs 10 distinct options`).toBeGreaterThanOrEqual(10);
      expect(new Set(steps.map((step) => step.image)).size, `${category.id}/${skill} needs 10 distinct subject images`).toBeGreaterThanOrEqual(10);
    }

    for (const campaign of campaigns) {
      expect(new Set(campaign.steps.map((step) => step.skill))).toEqual(new Set(["Reading", "Geography", "Math", "Science", "Words"]));
      expect(new Set(campaign.steps.map((step) => step.image)).size, `${campaign.id} must not repeat its story image`).toBe(5);
    }
  }
});

test("every generated Challenge step is answerable and has a useful teaching stage", () => {
  const campaigns = playableChallengeCategories.flatMap(buildChallengeCampaignsForCategory);
  const stepIds = campaigns.flatMap((campaign) => campaign.steps.map((step) => step.id));
  expect(new Set(stepIds).size).toBe(stepIds.length);

  for (const campaign of campaigns) {
    for (const step of campaign.steps) {
      expect(step.clue.length, `${step.id} needs a useful clue`).toBeGreaterThan(20);
      expect(step.summary.length, `${step.id} needs teaching feedback`).toBeGreaterThan(35);
      expect(step.choices, `${step.id} must contain its answer`).toContain(step.answer);
      expect(step.choices, `${step.id} needs at least four choices`).toHaveLength(4);
      expect(new Set(step.choices).size, `${step.id} choices must be distinct`).toBe(4);
      expect(step.image, `${step.id} needs its own subject image`).toBeTruthy();

      if (step.skill === "Reading") {
        expect(step.clue).toContain(step.evidence);
      } else if (step.skill === "Geography" && step.map) {
        expect(step.map.choices.map((choice) => choice.label)).toEqual(step.choices);
        expect(step.answer).toMatch(/^Pin [A-D]$/);
        expect(step.question).toMatch(/^Which pin marks .+\?$/);
        expect(step.summary).toContain(step.answer);
        if (campaign.topicId === "countries") {
          expect(step.clue).toContain("is a country in");
          expect(step.clue).not.toContain("is connected with");
        }
        for (const choice of step.map.choices) {
          expect(choice.mapLabel).toBeTruthy();
          expect(choice.x).toBeGreaterThanOrEqual(0);
          expect(choice.x).toBeLessThanOrEqual(100);
          expect(choice.y).toBeGreaterThanOrEqual(0);
          expect(choice.y).toBeLessThanOrEqual(100);
        }
      } else if (step.skill === "Math") {
        expect(step.question).toBe(`${step.math.groups} × ${step.math.each} = ?`);
        expect(Number.parseInt(step.answer.replaceAll(",", ""), 10)).toBe(step.math.groups * step.math.each);
        expect(step.math.visual.ariaLabel).toContain(`${step.math.groups}`);
        expect(step.math.visual.ariaLabel).toContain(`${step.math.each}`);
      }
    }
  }
});

test("Challenge selection rotates categories before repeating a category campaign", () => {
  const categories = playableChallengeCategories.slice(0, 2);
  const selected = [25, 50, 75, 100].map((milestone) => challengeCampaignForMilestone(milestone, categories));
  expect(selected.map((campaign) => campaign.topicId)).toEqual([
    categories[0].id,
    categories[1].id,
    categories[0].id,
    categories[1].id,
  ]);
  expect(selected[0].id).not.toBe(selected[2].id);
  expect(selected[1].id).not.toBe(selected[3].id);
  expect(new Set(Array.from({ length: 10 }, (_, index) => pepperChallengeCampaignForMilestone((index + 1) * challengeQuestionInterval).id)).size).toBe(10);
  expect(pepperChallengeCampaigns).toHaveLength(10);
});

});

test.describe("browser game flows", { tag: "@browser" }, () => {
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

test("mobile keeps the question and first answer in the opening viewport", { tag: "@mobile" }, async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile viewport coverage");
  await chooseOnlyMode(page, "Quiz Run");

  const questionStage = page.getByRole("button", { name: /Flag an issue with this question image/ }).locator("xpath=ancestor::article[1]");
  const prompt = page.locator("h2").first();
  const firstChoice = page.getByLabel("Answer choices").getByRole("button").first();
  const [stageBox, promptBox, choiceBox] = await Promise.all([
    questionStage.boundingBox(),
    prompt.boundingBox(),
    firstChoice.boundingBox(),
  ]);
  const viewport = page.viewportSize();

  expect(stageBox).not.toBeNull();
  expect(promptBox).not.toBeNull();
  expect(choiceBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(stageBox!.height).toBeLessThanOrEqual(342);
  expect(promptBox!.y).toBeLessThan(viewport!.height);
  expect(choiceBox!.y).toBeLessThan(viewport!.height);
});

test("flight mode caches the app shell for a real offline reload", { tag: "@mobile" }, async ({ page, context }) => {
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("Service workers are unavailable");
    await navigator.serviceWorker.ready;
  });
  await setupSummary(page).click();
  await expect(page.getByText("Flight mode", { exact: true })).toBeVisible();
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Burrow" })).toBeVisible();
    await page.waitForFunction(() => document.documentElement.dataset.burrowHydrated === "true");
  } finally {
    await context.setOffline(false);
  }
});

test("setup menu opens and core game controls keep working", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Burrow" })).toBeVisible();
  await expect(setupSummary(page)).toContainText("9 games · 10 topics");

  await setupSummary(page).click();
  await expect(page.getByText("Game Types")).toBeVisible();
  await expect(page.getByText("Topics", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Learning recap")).toContainText("Ready for the first field note");
  for (const [label, count] of [
    ["Spicy Peppers", "143 peppers"],
    ["Sky Scrapers", "60 towers"],
    ["Shark Tank", "50 sharks"],
    ["Space Universe", "50 space cards"],
    ["Jet Hangar", "50 aircraft"],
    ["Countries & Flags", "200 flag cards"],
  ]) {
    const topicButton = buttonForLabel(page, label);
    await topicButton.click();
    await expect(topicButton).toHaveAttribute("aria-pressed", "false");
    await expect(topicButton).toContainText(count);
    await topicButton.click();
    await expect(topicButton).toHaveAttribute("aria-pressed", "true");
  }

  for (const label of modeLabels.filter((label) => label !== "True/False")) {
    await page.getByRole("button", { name: new RegExp(label.replace("/", "\\/")) }).click();
  }
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));
  await expect(page.getByText("True or false?")).toBeVisible();

  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();

  await setupSummary(page).click();
  await expect(page.getByLabel("Learning recap")).toContainText(/1\s*idea practiced/);
  await setupDetails(page).evaluate((details) => details.removeAttribute("open"));

  await page.getByRole("button", { name: /Next|Finish round/ }).click();
  await expect(page.getByText("True or false?")).toBeVisible();

  await page.getByRole("button", { name: /Cards/ }).click();
  await expect(page.getByText("Collection", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose a category" })).toBeVisible();
});

test("fresh and existing profiles automatically select newly added topics", async ({ page }) => {
  await setupSummary(page).click();
  for (const label of topicLabels) {
    await expect(buttonForLabel(page, label)).toHaveAttribute("aria-pressed", "true");
  }

  await page.evaluate(() => {
    window.localStorage.setItem("burrow-profiles-v1", JSON.stringify({
      activeProfileId: "player-1",
      profiles: [{
        id: "player-1",
        name: "Player 1",
        interests: ["peppers", "buildings", "sharks", "space", "jets", "dinosaurs", "tallest-mountains", "tall-trees", "bridges-and-tunnels"],
        progress: {},
      }],
    }));
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await expect(setupSummary(page)).toContainText("10 topics");
  await setupSummary(page).click();
  await expect(buttonForLabel(page, "Countries & Flags")).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => page.evaluate(() => {
    const saved = JSON.parse(window.localStorage.getItem("burrow-profiles-v1") ?? "{}") as { knownTopics?: string[] };
    return saved.knownTopics ?? [];
  })).toContain("countries");
});

test("a mystery flag gives one clue retry and unlocks a country passport", async ({ page }) => {
  await chooseOnlyMode(page, "Quiz Run");
  await chooseOnlyBuiltInTopic(page, "Countries & Flags");

  const mysteryFlag = page.getByRole("img", { name: "Mystery country flag" });
  for (let attempt = 0; attempt < 18 && (await mysteryFlag.count()) === 0; attempt += 1) {
    await page.getByRole("button", { name: "Skip question" }).click();
  }
  await expect(mysteryFlag).toBeVisible();

  const flagPath = await mysteryFlag.getAttribute("src");
  const countryCode = flagPath?.match(/\/([a-z]{2})\.svg/)?.[1]?.toUpperCase();
  const answerCountry = countries.find((country) => country.code === countryCode);
  expect(answerCountry, `No country found for ${flagPath}`).toBeTruthy();

  const visibleButtonLabels = await page.locator("article button").allTextContents();
  const wrongCountry = visibleButtonLabels
    .map((label) => label.trim())
    .find((label) => countries.some((country) => country.name === label) && label !== answerCountry?.name);
  expect(wrongCountry).toBeTruthy();

  const wrongButton = page.locator("article button").filter({ hasText: wrongCountry! }).first();
  await wrongButton.click();
  await expect(page.getByText("One more guess", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Answer feedback")).toHaveCount(0);
  await expect(wrongButton).toBeDisabled();

  await page.getByRole("button", { name: answerCountry!.name, exact: true }).click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  await page.getByRole("button", { name: /Cards/ }).click();

  const passport = page.getByText("Open country passport", { exact: true }).locator("xpath=ancestor::details[1]");
  await expect(passport).toBeVisible();
  await passport.locator("summary").click();
  await expect(passport.getByText(answerCountry!.capital, { exact: true })).toBeVisible();
  await expect(passport.getByText("Population", { exact: true })).toBeVisible();
  await expect(passport.getByText("Land area", { exact: true })).toBeVisible();
  await expect(passport.getByText("Continent", { exact: true })).toBeVisible();
});

test("Next builds a different round without passing the click event as learning history", { tag: "@mobile" }, async ({ page }) => {
  await chooseOnlyMode(page, "Peek");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  const roundImage = page.locator("main article img");
  await expect(roundImage).toHaveCount(1);
  const firstImageAlt = await roundImage.getAttribute("alt");
  expect(firstImageAlt).toBeTruthy();

  await page.getByRole("button", { name: firstImageAlt ?? "", exact: true }).click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await expect(page.getByLabel("Answer feedback")).toHaveCount(0);
  await expect(roundImage).not.toHaveAttribute("alt", firstImageAlt ?? "");
  expect(pageErrors).toEqual([]);
});

test("every twenty-fifth answer opens an automatic mini challenge and returns after its summary", { tag: "@mobile" }, async ({ page }) => {
  const campaign = pepperChallengeCampaigns[0];
  await page.evaluate(() => {
    const key = "burrow-profiles-v1";
    const profiles = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { answered: number; challengeMilestone: number } }[];
    };
    const active = profiles.profiles.find((profile) => profile.id === profiles.activeProfileId);
    if (!active) throw new Error("Active profile was not saved");
    active.progress.answered = 24;
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
  await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText(`Deep dive: ${campaign.name}`);

  for (const [stepIndex, step] of campaign.steps.entries()) {
    await expect(page.getByRole("heading", { name: step.title })).toBeVisible();
    await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText(`Stop ${stepIndex + 1} of 5`);

    if (step.skill === "Geography" && step.map) {
      const mapChoiceIndex = step.map.choices.findIndex((choice) => choice.label === step.answer);
      const mapChoice = step.map.choices[mapChoiceIndex];
      await expect(page.getByLabel("Challenge map story")).toBeVisible();
      await page.getByRole("button", { name: `Choose map pin ${String.fromCharCode(65 + mapChoiceIndex)}: ${mapChoice.mapLabel ?? mapChoice.label}` }).click();
    } else {
      const story = step.skill === "Math" ? page.getByLabel("Challenge math story") : page.getByLabel("Challenge picture story");
      await expect(story.getByRole("img", { name: step.imageAlt })).toBeVisible();
      if (step.skill === "Math") {
        await expect(story.getByLabel(step.math.visual.ariaLabel)).toBeVisible();
      }
      await page.getByLabel("Answer choices").getByRole("button").filter({ hasText: step.answer }).click();
    }

    await expect(page.getByLabel("Answer feedback")).toContainText(step.summary);
    await page.getByRole("button", { name: stepIndex === campaign.steps.length - 1 ? "View challenge summary" : "Next question" }).click();
  }

  await expect(page.getByRole("heading", { name: campaign.completionTitle })).toBeVisible();
  await expect(page.getByText("5/5 discoveries solved · all five notes collected")).toBeVisible();
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
  })).toBe(25);
});

test("mini challenges do not interrupt before the next milestone", async ({ page }) => {
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

test("automatic Challenge Mode respects the selected category and changes subjects between stops", async ({ page }) => {
  const sharkCategory = playableChallengeCategories.find((category) => category.id === "sharks")!;
  const campaign = buildChallengeCampaignsForCategory(sharkCategory)[0];
  await openChallengeAt(page, challengeQuestionInterval, "Shark Tank");

  await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText("Shark Tank");
  await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText(campaign.name);
  const reading = campaign.steps[0];
  const geography = campaign.steps[1];
  const readingStory = page.getByLabel("Challenge picture story");
  await expect(readingStory.getByRole("img", { name: reading.imageAlt })).toBeVisible();
  const firstImage = await readingStory.getByRole("img").getAttribute("src");
  await page.getByRole("button", { name: reading.answer, exact: true }).click();
  await page.getByRole("button", { name: "Next question" }).click();

  if (geography.skill !== "Geography") throw new Error("Second Challenge stop must be Geography");
  if (geography.map) {
    await expect(page.getByLabel("Challenge map story")).toBeVisible();
  } else {
    const geographyStory = page.getByLabel("Challenge picture story");
    await expect(geographyStory.getByRole("img", { name: geography.imageAlt })).toBeVisible();
    await expect(geographyStory.getByRole("img")).not.toHaveAttribute("src", firstImage ?? "");
  }
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

test("odd one image cards can submit an answer", async ({ page }) => {
  await chooseOnlyMode(page, "Odd One");

  const imageChoice = page.getByRole("button", { name: /^Choose [A-D]:/ }).first();
  await expect(imageChoice.getByRole("img")).toBeVisible();
  await imageChoice.click();
  await expect(imageChoice).toHaveAttribute("aria-pressed", "true");
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

test("shark number rounds keep the photos larger than the supporting math model", { tag: "@mobile" }, async ({ page }) => {
  await chooseOnlyMode(page, "Numbers");
  await chooseOnlyBuiltInTopic(page, "Shark Tank");
  await page.getByRole("button", { name: "Hard", exact: true }).click();

  const equation = page.getByLabel("Number equation");
  for (let attempt = 0; attempt < 12 && !/\+/.test(await equation.innerText()); attempt += 1) {
    await page.getByRole("button", { name: "Skip question" }).click();
  }
  await expect(equation).toContainText("+");

  const storyStage = page.getByLabel("Numbers story stage");
  const imageStage = storyStage.locator("[data-number-story-images]");
  expect(await imageStage.getByRole("img").count()).toBeGreaterThanOrEqual(2);
  const layout = await storyStage.locator("[data-number-story-images], [data-number-math-model]").evaluateAll(([images, model]) => ({
    imageHeight: images.getBoundingClientRect().height,
    modelHeight: model.getBoundingClientRect().height,
  }));
  expect(layout.imageHeight).toBeGreaterThan(layout.modelHeight);
});

test("pepper number rounds teach multiplication with equal plant groups", async ({ page }) => {
  await chooseOnlyMode(page, "Numbers");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  const numberPrompt = page.getByLabel("Number equation").locator("xpath=preceding-sibling::h2[1]");
  for (let attempt = 0; attempt < 9 && await page.getByText("Grow case", { exact: true }).count() === 0; attempt += 1) {
    const previousPrompt = await numberPrompt.textContent();
    await page.getByRole("button", { name: "Skip question" }).click();
    if (previousPrompt) await expect(numberPrompt).not.toHaveText(previousPrompt);
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
  await expect(page.getByLabel("World map")).toBeVisible();
  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();

  const geography = page.getByLabel("Where in the world");
  await expect(geography).toBeVisible();
  await expect(geography).toContainText(/North America|South America|Europe|Asia|Africa|Oceania/);
  await expect(page.getByLabel("World map")).toHaveCount(1);
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
  await expect(page.getByLabel("World map")).toHaveCount(1);
});

test("peek rounds reset their reveal count after skip", async ({ page }) => {
  await chooseOnlyMode(page, "Peek");

  await expect(page.getByText("Peek round", { exact: true })).toBeVisible();
  await expect(page.getByText("4/12 open")).toBeVisible();
  await expect(page.getByText("5/12 open")).toBeVisible({ timeout: 2_000 });

  await page.getByRole("button", { name: "Skip question" }).click();
  await expect(page.getByText("4/12 open")).toBeVisible();
});

test("Peek location rounds show the complete named subject before map feedback", async ({ page }) => {
  await chooseOnlyMode(page, "Peek");
  await chooseOnlyBuiltInTopic(page, "Bridges & Tunnels");

  const locationPrompt = page.getByRole("heading", { name: "Where in the world is this found?" });
  for (let attempt = 0; attempt < 12 && await locationPrompt.count() === 0; attempt += 1) {
    await page.getByRole("button", { name: "Skip question" }).click();
  }

  await expect(locationPrompt).toBeVisible();
  const subject = page.getByLabel("Location subject");
  await expect(subject).toBeVisible();
  await expect(subject.getByText("Find this place", { exact: true })).toBeVisible();
  await expect(page.getByLabel("World map")).toHaveCount(0);

  const imageFits = await subject.getByRole("img").evaluate((image) => {
    const imageBox = image.getBoundingClientRect();
    const frameBox = image.parentElement?.getBoundingClientRect();
    return Boolean(frameBox) && imageBox.top >= frameBox!.top - 1 && imageBox.bottom <= frameBox!.bottom + 1;
  });
  expect(imageFits).toBe(true);

  const answerPanel = page.locator("main section > article").nth(1);
  await answerPanel.getByRole("button").filter({ hasNotText: "Skip question" }).first().click();
  await expect(page.getByLabel("Where in the world")).toBeVisible();
  await expect(page.getByLabel("World map")).toHaveCount(1);
});

test("geo finder stays inside the selected topic", async ({ page }) => {
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");
  await chooseOnlyMode(page, "Geo Finder");

  const seenPrompts = new Set<string>();
  for (let round = 0; round < 6; round += 1) {
    await expect(page.getByText("Spicy Peppers · Geo Finder", { exact: true })).toBeVisible();
    const heading = page.getByRole("heading", { name: /^Where on the map is/ });
    await expect(heading).toBeVisible();
    const prompt = await heading.textContent();
    expect(prompt).toBeTruthy();
    expect(seenPrompts.has(prompt ?? "")).toBe(false);
    seenPrompts.add(prompt ?? "");
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
  await page.evaluate(() => {
    const key = "burrow-profiles-v1";
    const profiles = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { unlockedCards: string[] } }[];
    };
    const active = profiles.profiles.find((profile) => profile.id === profiles.activeProfileId);
    if (!active) throw new Error("Active profile was not saved");
    active.progress.unlockedCards = [
      "Naga Jolokia",
      "Chocolate Bhutlah",
      "Habanada",
      "7 Pot Douglah",
      "Orange 7 Pot",
      "Armageddon",
      "Ghost Breath",
      "Pepper X",
    ];
    window.localStorage.setItem(key, JSON.stringify(profiles));
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await page.getByRole("button", { name: /Cards/ }).click();

  const collection = page.getByText("Collection", { exact: true }).locator("xpath=ancestor::section[1]");
  await expect(collection.getByText("Spicy Peppers", { exact: true })).toBeVisible();
  await expect(collection.getByText("Shark Tank", { exact: true })).toHaveCount(0);
  await expect(collection.getByText("Tallest Mountains", { exact: true })).toHaveCount(0);

  const scovilleOrder = collection.getByText(/^(Orange 7 Pot|Armageddon|Ghost Breath|Pepper X)$/);
  await expect(scovilleOrder).toHaveCount(4);
  expect(await scovilleOrder.allTextContents()).toEqual(["Orange 7 Pot", "Armageddon", "Ghost Breath", "Pepper X"]);

  const featuredPhotos = collection.getByRole("img", { name: /Habanada|Naga Jolokia|7 Pot Douglah|Chocolate Bhutlah/ });
  await expect(featuredPhotos).toHaveCount(4);
  const photoLayout = await featuredPhotos.evaluateAll((photos) => photos.map((photo) => {
    const imageBox = photo.getBoundingClientRect();
    const frameBox = photo.parentElement?.getBoundingClientRect();
    return {
      alt: photo.getAttribute("alt"),
      src: photo.getAttribute("src"),
      fullyContained: frameBox ? imageBox.top >= frameBox.top - 1 && imageBox.bottom <= frameBox.bottom + 1 : false,
    };
  }));
  expect(photoLayout).toEqual([
    expect.objectContaining({ alt: "Habanada", src: "/burrow-assets/peppers/habanada.jpg", fullyContained: true }),
    expect.objectContaining({ alt: "Naga Jolokia", src: "/burrow-assets/peppers/naga-jolokia.png", fullyContained: true }),
    expect.objectContaining({ alt: "7 Pot Douglah", src: "/burrow-assets/peppers/seven-pot-douglah.jpg", fullyContained: true }),
    expect.objectContaining({ alt: "Chocolate Bhutlah", src: "/burrow-assets/peppers/chocolate-bhutlah-plant-closeup.jpg", fullyContained: true }),
  ]);

  await expect(collection.getByRole("button", { name: "Show all 143 cards" })).toBeVisible();
  expect(await collection.getByText("Locked card", { exact: true }).count()).toBeLessThan(20);
  await expect(collection.getByText("WikiPepper", { exact: true })).not.toBeVisible();

  const pepperGuide = collection.getByText("Open pepper field guide", { exact: true }).first();
  await pepperGuide.click();
  const pepperCard = pepperGuide.locator("xpath=ancestor::div[contains(@class, 'overflow-hidden')][1]");
  await expect(pepperCard.getByText("Heat level", { exact: true })).toBeVisible();
  await expect(pepperCard.getByText("Scoville range", { exact: true })).toBeVisible();
  await expect(pepperCard.getByText("Color", { exact: true })).toBeVisible();
  await expect(pepperCard.getByText("Type", { exact: true })).toBeVisible();
});

test("collection category picker shows one category album at a time", { tag: "@mobile" }, async ({ page }) => {
  await page.evaluate(() => {
    const key = "burrow-profiles-v1";
    const profiles = JSON.parse(window.localStorage.getItem(key) ?? "{}") as {
      activeProfileId: string;
      profiles: { id: string; progress: { unlockedCards: string[] } }[];
    };
    const active = profiles.profiles.find((profile) => profile.id === profiles.activeProfileId);
    if (!active) throw new Error("Active profile was not saved");
    active.progress.unlockedCards = ["Bell Pepper", "Great White Shark"];
    window.localStorage.setItem(key, JSON.stringify(profiles));
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await page.getByRole("button", { name: /Cards/ }).click();

  const collections = page.getByLabel("Card collections");
  const pepperCategory = collections.getByRole("button", { name: /Spicy Peppers: .* cards collected/ });
  const sharkCategory = collections.getByRole("button", { name: /Shark Tank: .* cards collected/ });
  await expect(pepperCategory).toBeVisible();
  await expect(sharkCategory).toBeVisible();

  await pepperCategory.click();
  await expect(pepperCategory).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Spicy Peppers card collection").getByRole("img", { name: "Bell Pepper" })).toBeVisible();
  await expect(page.getByLabel("Shark Tank card collection")).toHaveCount(0);

  await sharkCategory.click();
  await expect(sharkCategory).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Shark Tank card collection").getByRole("img", { name: "Great White Shark" })).toBeVisible();
  await expect(page.getByLabel("Spicy Peppers card collection")).toHaveCount(0);
});

test("sort cards snap into their ranked slots instead of the next empty slot", { tag: "@mobile" }, async ({ page }) => {
  await chooseOnlyMode(page, "Sort");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  const cardButtons = page.locator("main section > article").first().getByRole("button");
  const cards = await cardButtons.evaluateAll((buttons) => buttons.map((button, index) => {
    const labels = Array.from(button.querySelectorAll("p")).map((label) => label.textContent?.trim() ?? "");
    const score = Number(labels[1]?.replace(/[^0-9]/g, ""));
    return { index, title: labels[0], score };
  }));
  expect(cards.length).toBeGreaterThanOrEqual(3);

  const hottest = [...cards].sort((a, b) => b.score - a.score)[0];
  await cardButtons.nth(hottest.index).click();
  await expect(page.getByLabel(`Sort slot ${cards.length}: ${hottest.title}`)).toBeVisible();
  await expect(page.getByLabel(`Selected position 1: ${hottest.title}`)).toBeVisible();
  await expect(cardButtons.nth(hottest.index)).toHaveAttribute("aria-pressed", "true");

  await cardButtons.nth(hottest.index).click();
  await expect(page.getByLabel(`Sort slot ${cards.length}: empty`)).toBeVisible();
  await expect(page.getByLabel("Selected position 1: empty")).toBeVisible();
  await expect(cardButtons.nth(hottest.index)).toHaveAttribute("aria-pressed", "false");

  await cardButtons.nth(hottest.index).click();
  await expect(page.getByLabel(`Selected position 1: ${hottest.title}`)).toBeVisible();

  for (const card of cards.filter((item) => item.index !== hottest.index)) {
    await cardButtons.nth(card.index).click();
  }
  await page.getByRole("button", { name: "Check order" }).click();
  await expect(page.getByText("Perfect order!")).toBeVisible();
});

test("a correct head to head answer unlocks both peppers, while skips do not", async ({ page }) => {
  await chooseOnlyMode(page, "Head to Head");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  let sawHabanero = false;
  for (let round = 0; round < 6; round += 1) {
    const visibleTitles = await page.locator("main article").first().getByRole("img").evaluateAll((images) =>
      images.map((image) => image.getAttribute("alt")).filter((title): title is string => Boolean(title)),
    );
    expect(visibleTitles).toHaveLength(2);
    if (visibleTitles.includes("Habanero")) {
      sawHabanero = true;
      break;
    }
    await page.getByRole("button", { name: "Skip question" }).click();
  }
  expect(sawHabanero).toBe(true);

  const unlockedCards = async () => page.evaluate(() => {
    const profiles = JSON.parse(window.localStorage.getItem("burrow-profiles-v1") ?? "{}") as {
      activeProfileId?: string;
      profiles?: { id: string; progress: { unlockedCards: string[] } }[];
    };
    return profiles.profiles
      ?.find((profile) => profile.id === profiles.activeProfileId)
      ?.progress.unlockedCards ?? [];
  });
  expect(await unlockedCards()).not.toContain("peppers:habanero");

  await page.getByRole("button", { name: /Choose [AB]: Ghost Pepper/ }).click();
  await page.waitForFunction(() => {
    const profiles = JSON.parse(window.localStorage.getItem("burrow-profiles-v1") ?? "{}") as {
      activeProfileId?: string;
      profiles?: { id: string; progress: { unlockedCards: string[] } }[];
    };
    return profiles.profiles
      ?.find((profile) => profile.id === profiles.activeProfileId)
      ?.progress.unlockedCards.includes("peppers:habanero")
      && profiles.profiles
        ?.find((profile) => profile.id === profiles.activeProfileId)
        ?.progress.unlockedCards.includes("peppers:ghost-pepper");
  });

  await page.getByRole("button", { name: /Cards/ }).click();
  const collection = page.getByText("Collection", { exact: true }).locator("xpath=ancestor::section[1]");
  await expect(collection.getByRole("img", { name: "Habanero", exact: true })).toBeVisible();
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

test("downloadable category answers persist adaptive performance stats", async ({ page }) => {
  await chooseOnlyMode(page, "True/False");
  await chooseOnlyBuiltInTopic(page, "Dinosaur Lab");
  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();

  await page.waitForFunction(() => {
    const profiles = JSON.parse(window.localStorage.getItem("burrow-profiles-v1") ?? "{}") as {
      activeProfileId?: string;
      profiles?: { id: string; progress: { topicStats?: Record<string, { answered: number }> } }[];
    };
    const active = profiles.profiles?.find((profile) => profile.id === profiles.activeProfileId);
    return active?.progress.topicStats?.dinosaurs?.answered === 1;
  });
});

test("country Top Trumps offers four meaningful geography stats", async ({ page }) => {
  await chooseOnlyMode(page, "Top Trumps");
  await chooseOnlyBuiltInTopic(page, "Countries & Flags");

  const gamePanel = page.locator("main article").last();
  for (const label of ["Population", "Land area", "Land neighbors", "Highest point"]) {
    await expect(gamePanel.getByRole("button", { name: new RegExp(label) })).toBeVisible();
  }
  await expect(page.getByText("Capital name length", { exact: true })).toHaveCount(0);
});

test("top trumps lets player choose a category against the computer", async ({ page }) => {
  await chooseOnlyMode(page, "Top Trumps");

  await expect(page.getByRole("paragraph").filter({ hasText: "Top Trumps" })).toBeVisible();
  await expect(page.locator("div").filter({ hasText: /^Player$/ })).toBeVisible();
  await expect(page.getByText("Computer card", { exact: true })).toBeVisible();

  await page.locator("button").filter({ hasText: /higher wins|lower wins/ }).first().click();
  await expect(page.getByText(/Player wins the matchup|Computer wins the matchup|round is a tie/)).toBeVisible();
  await expect(page.getByText("Computer card", { exact: true })).not.toBeVisible();
});

test("pepper top trumps uses concrete plant stats", async ({ page }) => {
  await chooseOnlyMode(page, "Top Trumps");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  await expect(page.getByText("Plant height").first()).toBeVisible();
  await expect(page.getByText("Rarity").first()).toBeVisible();
  await expect(page.getByText(/Common|Uncommon|Rare|Epic|Legendary/).first()).toBeVisible();
  await expect(page.getByText("Natural roots")).toHaveCount(0);
});

test("setup menu opens and fits on mobile", { tag: "@mobile" }, async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile viewport coverage");

  await setupSummary(page).click();
  const menu = setupDetails(page).locator(":scope > div");
  await expect(menu).toBeVisible();

  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
});
