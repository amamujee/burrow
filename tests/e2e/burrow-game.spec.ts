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
import { cardRarities } from "../../src/lib/card-metadata";
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
import { buildLandingTopicCards } from "../../src/lib/landing-topics";
import { discoveryShuffle } from "../../src/lib/random";
import { migrateTopicSelection } from "../../src/lib/topic-selection";
import {
  addLearningExposure,
  learningIdentity,
  learningVarietyScore,
  summarizeLearningHistory,
} from "../../src/lib/learning-variety";

const modeLabels = ["Quiz Run", "Head to Head", "Top Trumps", "Sort", "True/False", "Peek", "Numbers", "Odd One", "Geo Finder"];
const topicLabels = [
  ...Object.values(topicPacks).map((pack) => pack.label),
  ...loadPlayablePacks().map(packToPlayableDeck).map((deck) => deck.title),
];

const modeControl = (page: Page) => page.getByRole("button", { name: /^Modes/ });
const topicsControl = (page: Page) => page.getByRole("button", { name: /^Topics/ });
const modeTray = (page: Page) => page.getByLabel("Choose game types");
const topicsTray = (page: Page) => page.getByLabel("Choose topics");
const mixOption = (page: Page, label: string) => modeTray(page).getByRole("button", { name: label, exact: true });

const chooseOnlyMode = async (page: Page, target: string) => {
  await modeControl(page).click();
  const targetButton = mixOption(page, target);
  if ((await targetButton.getAttribute("aria-pressed")) !== "true") await targetButton.click();
  await expect(targetButton).toHaveAttribute("aria-pressed", "true");

  for (const label of modeLabels) {
    const button = mixOption(page, label);
    if (label !== target && await button.isEnabled() && (await button.getAttribute("aria-pressed")) === "true") {
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "false");
    }
  }
  await expect(modeTray(page)).toBeVisible();
  await expect(modeControl(page)).toHaveText(/Modes/);
  await modeControl(page).click();
};

const chooseOnlyBuiltInTopic = async (page: Page, target: string) => {
  await topicsControl(page).click();
  const targetButton = topicsTray(page).getByRole("button", { name: target, exact: true });
  if ((await targetButton.getAttribute("aria-pressed")) !== "true") await targetButton.click();
  await expect(targetButton).toHaveAttribute("aria-pressed", "true");

  for (const label of topicLabels) {
    const button = topicsTray(page).getByRole("button", { name: label, exact: true });
    if (label !== target && (await button.getAttribute("aria-pressed")) === "true") {
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "false");
    }
  }
  await expect(topicsControl(page)).toHaveText(/Topics/);
  await topicsControl(page).click();
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
  await page.getByRole("button", { name: /^(Next|Finish round)/ }).click();
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

  expect(peppers).toHaveLength(164);
  for (const [topic, values] of Object.entries(expected)) {
    const pack = topicPacks[topic as keyof typeof topicPacks];
    expect(pack.libraryCount).toBe(values.count);
    expect(pack.featuredCount).toBe(values.count);
    expect(pack.eyebrow).toBe(values.eyebrow);
  }
});

test("the landing page automatically covers every playable category", () => {
  const packs = loadPlayablePacks();
  const landingCards = buildLandingTopicCards(packs);
  const expectedIds = [...Object.keys(topicPacks), ...packs.map((pack) => pack.id)];

  expect(new Set(landingCards.map((card) => card.id))).toEqual(new Set(expectedIds));
  expect(new Set(landingCards.map((card) => card.id)).size).toBe(landingCards.length);
  expect(new Set(landingCards.map((card) => card.title)).size).toBe(landingCards.length);
  expect(new Set(landingCards.map((card) => card.order)).size).toBe(landingCards.length);

  for (const pack of packs) {
    expect(pack.landing, `${pack.id} needs landing metadata`).toBeTruthy();
    expect(landingCards.find((card) => card.id === pack.id)).toMatchObject({
      title: pack.landing?.title ?? pack.title,
      detail: pack.landing?.detail,
      image: pack.landing?.image,
    });
    expect(pack.cards.some((card) => card.image === pack.landing?.image), `${pack.id} landing art should reuse a credited card image`).toBe(true);
  }
});

test("Hot Sauces ships 75 sourced cards with complete comparison metadata", () => {
  const pack = loadPlayablePacks().find((candidate) => candidate.id === "hot-sauces");
  expect(pack).toBeTruthy();
  expect(pack?.cards).toHaveLength(75);
  expect(pack?.recommendedModes).toContain("versus");
  expect(new Set(pack?.cards.map((card) => card.metadata?.flavorGrade))).toEqual(new Set(["A", "B", "C", "D"]));
  expect(new Set(pack?.cards.map((card) => card.metadata?.rarity))).toEqual(new Set(cardRarities));

  for (const card of pack?.cards ?? []) {
    expect(card.image).toBe(`/burrow-assets/hot-sauces/${card.id}.jpg`);
    expect(card.imageAlt).toMatch(/^Front label/);
    expect(card.metadata?.location?.countries.length).toBeGreaterThan(0);
    expect(card.metadata?.pepperTypes?.length).toBeGreaterThan(0);
    expect(card.metadata?.flavorGrade).toMatch(/^[A-D]$/);
    const pepperStat = card.stats.find((stat) => stat.id === "pepper-varieties");
    expect(pepperStat?.value).toBe(card.metadata?.pepperTypes?.length);
    expect(card.stats.find((stat) => stat.id === "rarity")?.display).toMatch(/^(Common|Uncommon|Rare|Epic)$/);
  }

  const deck = packToPlayableDeck(pack!);
  const tripleX = deck.cards.find((card) => card.id === "last-dab-triple-x");
  expect(tripleX?.details).toContainEqual({ label: "Peppers", value: "Pepper X · Chocolate Pepper X · Peach Pepper X" });
  expect(tripleX?.stats.find((stat) => stat.id === "pepper-varieties")?.display).toBe("3 types");

  const akabanga = pack?.cards.find((card) => card.id === "akabanga-chili-oil");
  expect(akabanga?.categories).toContain("Pepper oil");
  expect(akabanga?.metadata?.location?.countries).toEqual(["Rwanda"]);
  expect(akabanga?.metadata?.pepperTypes).toEqual(["African bird's eye chilli"]);

  const habamix = pack?.cards.find((card) => card.id === "habamix-sorrento");
  expect(habamix?.categories).toContain("Pepper oil");
  expect(habamix?.metadata?.pepperTypes).toHaveLength(7);
  expect(habamix?.stats.find((stat) => stat.id === "scoville")?.display).toBe("~2,200,000 SHU (pepper-based)");

  const recentSauceIds = ["thats-what-shishito-said", "pickled-garlic-sriracha", "last-dab-thermageddon", "funken-yellow"];
  expect(recentSauceIds.every((id) => pack?.cards.some((card) => card.id === id))).toBe(true);

  const extremeOilIds = ["creaper-choil", "bang-bang-oil", "salt-gang-ghost-crisp", "balacco-reaper-oil"];
  for (const id of extremeOilIds) {
    const oil = pack?.cards.find((card) => card.id === id);
    expect(oil?.categories.some((category) => category === "Pepper oil" || category === "Chili crisp")).toBe(true);
    expect(oil?.stats.find((stat) => stat.id === "scoville")?.display).toContain("pepper-based");
    expect(oil?.metadata?.difficultyBand).toBe("hard");
  }
});

test("difficulty progression gives Easy and Medium room before Hard", () => {
  expect(autoDifficulty(1, true, 10, 10, 10)).toBe(1);
  expect(autoDifficulty(1, true, 6, 16, 13)).toBe(2);
  expect(autoDifficulty(2, true, 12, 30, 27)).toBe(2);
  expect(autoDifficulty(2, true, 8, 45, 37)).toBe(3);
  expect(autoDifficulty(3, false, 0, 20, 7)).toBe(2);
});

test("standard Quiz questions offer four distinct choices at every difficulty", () => {
  let fourChoiceQuestions = 0;
  let binaryComparisons = 0;
  for (const topic of Object.keys(topicPacks) as (keyof typeof topicPacks)[]) {
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 0; seed < 24; seed += 1) {
        for (const question of buildSession(topic, difficulty, seed * 97, [])) {
          if (question.choices.length === 2) {
            expect(question.comparison, `${question.id} should only be binary for a direct comparison`).toBeDefined();
            binaryComparisons += 1;
            continue;
          }
          expect(question.choices, `${question.id} should have four choices`).toHaveLength(4);
          expect(new Set(question.choices).size, `${question.id} should not repeat a choice`).toBe(4);
          fourChoiceQuestions += 1;
        }
      }
    }
  }
  expect(fourChoiceQuestions).toBeGreaterThan(binaryComparisons);
});

test("Peek, Numbers, and Geo Finder also target four choices", () => {
  for (const topic of Object.keys(topicPacks) as (keyof typeof topicPacks)[]) {
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 0; seed < 12; seed += 1) {
        const rounds = [
          buildRevealRound(topic, difficulty, seed * 53),
          buildNumberRound(topic, difficulty, seed * 59),
          buildGeoRound(topic, difficulty, seed * 61),
        ];
        for (const round of rounds) {
          expect(round.choices, `${round.id} should have four choices`).toHaveLength(4);
          expect(new Set(round.choices.map((choice) => typeof choice === "object" ? choice.id : choice)).size, `${round.id} should not repeat a choice`).toBe(4);
        }
      }
    }
  }
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

  expect(round.prompt).toBe("Which mountain is the longest?");
  expect(round.answerId).toBe("math-card-3");
  expect(round.prompt).not.toMatch(/card/i);
  expect(round.explanation).not.toMatch(/each card/i);
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

test("10 rare baccatum ajis use real credited photos and honest cultivar metadata", () => {
  const expected = {
    "aji-angelo": [10000, 10000],
    "aji-benito": [1000, 30000],
    "aji-norteno": [30000, 50000],
    "aji-omnicolor": [30000, 50000],
    "brazilian-starfish": [5000, 30000],
    "criolla-sella": [15000, 30000],
    "aji-delight": [0, 0],
    "sugar-rush-cream": [1000, 10000],
    "aji-ayuyo": [20000, 25000],
    "aji-flor-morado": [10000, 30000],
  } as const;
  const newPepperIds = Object.keys(expected);
  const newPeppers = peppers.filter((pepper) => newPepperIds.includes(pepper.id));

  expect(newPeppers).toHaveLength(10);
  expect(new Set(newPeppers.map((pepper) => pepper.image)).size).toBe(10);
  expect(newPeppers.filter((pepper) => pepper.metadata?.location)).toHaveLength(9);

  for (const pepper of newPeppers) {
    expect([pepper.shuMin, pepper.shuMax]).toEqual(expected[pepper.id as keyof typeof expected]);
    expect(pepper.species).toBe("Capsicum baccatum (ají)");
    expect(pepper.image).toBe(`/burrow-assets/peppers/${pepper.id}.jpg`);
    expect(pepper.imageSourceFile).not.toMatch(/AI-generated/i);
    expect(pepper.imageCredit).toMatch(/\(used with permission\)$/);
    expect(pepper.imageFit).toBe("contain");
    expect(pepper.fact.length).toBeGreaterThanOrEqual(80);
    expect(pepper.metadata?.accuracyNote).toBeTruthy();
  }

  expect(newPeppers.find((pepper) => pepper.id === "brazilian-starfish")).toMatchObject({
    imageSourceFile: "BrazilianStarfish-INV_-_Edler-4-2.jpg",
    imageSourceUrl: "https://pepperjoe.com/products/brazilian-starfish-pepper-seeds",
    imageCredit: "Pepper Joe's (used with permission)",
    metadata: { location: { label: "Brazil", countries: ["Brazil"], continents: ["South America"] } },
  });
  expect(newPeppers.find((pepper) => pepper.id === "sugar-rush-cream")).toMatchObject({
    imageSourceFile: "IMG_3104_1024x1024@2x.JPG",
    imageSourceUrl: "https://towns-endchiliandspice.com/products/sugar-rush-cream-pepper-seeds",
    metadata: { location: { label: "Wales, United Kingdom", countries: ["United Kingdom"], continents: ["Europe"] } },
  });
  expect(newPeppers.find((pepper) => pepper.id === "aji-ayuyo")).toMatchObject({
    imageSourceFile: "aji-ayuyo_001_DSH_4785.jpg",
    imageCredit: "Claudio Dal Zovo / Pepperfriends (used with permission)",
  });

  const pepperCards = collectionCards().filter((card) => card.topic === "peppers");
  for (const pepper of newPeppers) {
    expect(pepperCards.find((card) => card.id === pepper.id)).toMatchObject({
      image: pepper.image,
      imageCredit: pepper.imageCredit,
      metadata: pepper.metadata,
      details: expect.arrayContaining([{ label: "Species", value: "Capsicum baccatum (ají)" }]),
    });
  }

  const hardIds = new Set(poolForDifficulty(peppers, 3).map((pepper) => pepper.id));
  for (const id of newPepperIds) expect(hardIds).toContain(id);
});

test("Jay's Peach Ghost Scorpion and 10 unusual peppers use permitted real photos and honest heat data", () => {
  const expected = {
    "jays-peach-ghost-scorpion": [1000000, 1000000],
    "purple-ufo": [10000, 10000],
    "khang-starr-lemon-starrburst": [100000, 200000],
    quintisho: [30000, 50000],
    cobanero: [30000, 50000],
    "farmers-market-jalapeno": [3000, 3000],
    "pimenta-da-neyde": [150000, 250000],
    "cgn-21500": [100000, 100000],
    "peachgum-tiger": [300000, 300000],
    "paradeisfruchtiger-gelber": [0, 0],
    "macedonian-rezha": [1000, 8000],
  } as const;
  const newPepperIds = Object.keys(expected);
  const newPeppers = peppers.filter((pepper) => newPepperIds.includes(pepper.id));

  expect(newPeppers).toHaveLength(11);
  expect(new Set(newPeppers.map((pepper) => pepper.image)).size).toBe(11);
  expect(newPeppers.filter((pepper) => pepper.metadata?.location)).toHaveLength(7);

  for (const pepper of newPeppers) {
    expect([pepper.shuMin, pepper.shuMax]).toEqual(expected[pepper.id as keyof typeof expected]);
    expect(pepper.image).toBe(`/burrow-assets/peppers/${pepper.id}.jpg`);
    expect(pepper.imageSourceFile).not.toMatch(/AI-generated/i);
    expect(pepper.imageSourceUrl).toMatch(/^https:\/\/peppergeek\.com\//);
    expect(pepper.imageCredit).toBe("Pepper Geek (used with permission)");
    expect(pepper.imageFit).toBe("contain");
    expect(pepper.fact.length).toBeGreaterThanOrEqual(100);
    if (pepper.scovilleStatus === "unofficial") expect(pepper.metadata?.accuracyNote).toBeTruthy();
  }

  expect(newPeppers.find((pepper) => pepper.id === "jays-peach-ghost-scorpion")).toMatchObject({
    name: "Jay's Peach Ghost Scorpion",
    species: "Capsicum chinense",
    imageSourceFile: "peachghost.jpg",
    metadata: {
      rarity: "rare",
      location: { label: "Bowers, Pennsylvania, United States", countries: ["United States"], continents: ["North America"] },
    },
  });
  expect(newPeppers.find((pepper) => pepper.id === "pimenta-da-neyde")).toMatchObject({
    species: "Capsicum chinense × Capsicum annuum",
    imageSourceFile: "SM-Pimenta-da-Neyde-peppers.jpeg",
    metadata: { location: { label: "Brazil", countries: ["Brazil"], continents: ["South America"] } },
  });
  expect(newPeppers.find((pepper) => pepper.id === "macedonian-rezha")).toMatchObject({
    imageSourceFile: "Rezha-Macedonia-2-sm.jpg",
    metadata: { location: { label: "North Macedonia", countries: ["North Macedonia"], continents: ["Europe"] } },
  });

  const pepperCards = collectionCards().filter((card) => card.topic === "peppers");
  for (const pepper of newPeppers) {
    expect(pepperCards.find((card) => card.id === pepper.id)).toMatchObject({
      image: pepper.image,
      imageCredit: pepper.imageCredit,
      statValue: pepper.shuMax,
      metadata: pepper.metadata,
    });
  }

  const hardIds = new Set(poolForDifficulty(peppers, 3).map((pepper) => pepper.id));
  for (const id of newPepperIds) expect(hardIds).toContain(id);
  expect(topicPacks.peppers.featuredCount).toBe(peppers.length);
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

test("easy shark reading uses real, distinct ocean menus instead of nonsense answers", () => {
  const readingQuestions = Array.from({ length: 120 }, (_, seed) => buildSession("sharks", 1, seed * 89, []))
    .flat()
    .filter((question) => question.kind === "shark-reading");
  const blueShark = readingQuestions.find((question) => question.imageAlt === "Blue Shark")!;

  expect(readingQuestions.length).toBeGreaterThan(20);
  expect(blueShark).toBeDefined();
  expect(blueShark.prompt).not.toBe("What is true?");
  expect(blueShark.prompt).toMatch(/fish|squid/i);
  expect(blueShark.readingClue).toContain("Compare the field notes:");
  expect(blueShark.readingClue).toContain("Blue Shark — fish and squid");
  expect(blueShark.answer).toBe("Blue Shark");
  expect(blueShark.choices).toContain("Blue Shark");

  for (const question of readingQuestions) {
    expect(question.choices).toHaveLength(4);
    expect(new Set(question.choices).size).toBe(4);
    expect(question.answer).toBe(question.imageAlt);
    for (const choice of question.choices) expect(question.readingClue).toContain(`${choice} —`);
    expect(question.choices).not.toEqual(expect.arrayContaining(["It is a pepper", "It is a skyscraper", "It has wheels"]));
  }
});

test("building comparisons name both choices in a direct child-friendly prompt", () => {
  const comparisons = Array.from({ length: 16 }, (_, seed) => buildSession("buildings", 3, seed * 83, []))
    .flat()
    .filter((question) => question.kind === "building-taller");
  expect(comparisons.length).toBeGreaterThan(0);
  for (const comparison of comparisons) {
    expect(comparison.prompt).toMatch(/^Which building is taller, .+ or .+\?$/);
  }
});

test("main collectible categories use the standard four rarity tiers", () => {
  const rarityCollections = { peppers, sharks, jets };
  for (const [topic, cards] of Object.entries(rarityCollections)) {
    const rarities = cards.map((card) => card.metadata?.rarity);
    expect(rarities, `${topic} cards should all have rarity metadata`).not.toContain(undefined);
    expect(new Set(rarities), `${topic} should use the complete four-tier standard`).toEqual(new Set(cardRarities));
  }
  for (const [topic, cards] of Object.entries({ buildings, countries, space: spaceCards })) {
    expect(cards.every((card) => card.metadata?.rarity === undefined), `${topic} should not receive artificial rarity labels`).toBe(true);
  }
});

test("collectible rarities follow the 60-25-10-5 distribution", () => {
  const hotSauces = loadPlayablePacks().find((pack) => pack.id === "hot-sauces")?.cards ?? [];
  const rarityCollections = { peppers, sharks, jets, hotSauces };
  const expectedByCollection = {
    peppers: { common: 98, uncommon: 41, rare: 16, epic: 9 },
    sharks: { common: 30, uncommon: 13, rare: 5, epic: 2 },
    jets: { common: 30, uncommon: 12, rare: 6, epic: 2 },
    hotSauces: { common: 45, uncommon: 19, rare: 7, epic: 4 },
  };
  const overall = { common: 0, uncommon: 0, rare: 0, epic: 0 };

  for (const [topic, cards] of Object.entries(rarityCollections)) {
    const counts = { common: 0, uncommon: 0, rare: 0, epic: 0 };
    for (const card of cards) {
      const rarity = card.metadata?.rarity;
      if (!rarity) throw new Error(`${topic}:${card.id} needs rarity metadata`);
      counts[rarity] += 1;
      overall[rarity] += 1;
    }
    expect(counts, `${topic} rarity distribution drifted`).toEqual(expectedByCollection[topic as keyof typeof expectedByCollection]);
  }

  expect(overall).toEqual({ common: 203, uncommon: 85, rare: 34, epic: 17 });
  const total = Object.values(overall).reduce((sum, count) => sum + count, 0);
  const targetShare = { common: 0.6, uncommon: 0.25, rare: 0.1, epic: 0.05 };
  for (const rarity of cardRarities) {
    expect(Math.abs(overall[rarity] / total - targetShare[rarity]), `${rarity} should stay within 0.2 percentage points of target`).toBeLessThanOrEqual(0.002);
  }

  expect(new Set(peppers.filter((card) => card.metadata?.rarity === "epic").map((card) => card.id))).toEqual(new Set([
    "ghost-pepper", "trinidad-scorpion-butch-t", "seven-pot-primo", "chocolate-bhutlah", "chocolate-moruga-scorpion",
    "trinidad-scorpion", "carolina-reaper", "dragons-breath", "pepper-x",
  ]));
  expect(new Set(sharks.filter((card) => card.metadata?.rarity === "epic").map((card) => card.id))).toEqual(new Set(["goblin-shark", "megalodon"]));
  expect(new Set(jets.filter((card) => card.metadata?.rarity === "epic").map((card) => card.id))).toEqual(new Set(["b-2-spirit", "sr-71-blackbird"]));
  expect(new Set(hotSauces.filter((card) => card.metadata?.rarity === "epic").map((card) => card.id))).toEqual(new Set([
    "last-dab-xperience", "reaper-squeezins", "gator-sauce", "last-dab-thermageddon",
  ]));

  for (const card of hotSauces) {
    const rarity = card.metadata?.rarity;
    if (!rarity) throw new Error(`hotSauces:${card.id} needs rarity metadata`);
    const rarityStat = card.stats.find((stat) => stat.id === "rarity");
    expect(rarityStat?.value, `${card.id} rarity stat should match its metadata`).toBe(cardRarities.indexOf(rarity) + 1);
    expect(rarityStat?.display).toBe(rarity[0].toUpperCase() + rarity.slice(1));
  }
});

test("Top Trumps uses four named rarity tiers and allows exact ties", () => {
  for (const topic of ["peppers", "sharks", "jets"] as const) {
    const round = buildTopTrumpRound(topic, 3, 9041);
    expect(round.player.stats.find((stat) => stat.id === "rarity")?.display).toMatch(/^(Common|Uncommon|Rare|Epic)$/);
    expect(round.computer.stats.find((stat) => stat.id === "rarity")?.display).toMatch(/^(Common|Uncommon|Rare|Epic)$/);
  }
  for (const topic of ["buildings", "countries", "space"] as const) {
    const round = buildTopTrumpRound(topic, 3, 9041);
    expect(round.player.stats.some((stat) => stat.id === "rarity"), `${topic} should omit the rarity stat`).toBe(false);
    expect(round.computer.stats.some((stat) => stat.id === "rarity"), `${topic} should omit the rarity stat`).toBe(false);
  }

  let tiedRound: ReturnType<typeof buildTopTrumpRound> | undefined;
  for (let seed = 0; seed < 600; seed += 1) {
    const round = buildTopTrumpRound("peppers", 3, seed * 41);
    const playerRarity = round.player.stats.find((stat) => stat.id === "rarity");
    const computerRarity = round.computer.stats.find((stat) => stat.id === "rarity");
    expect(playerRarity?.display).toMatch(/^(Common|Uncommon|Rare|Epic)$/);
    expect(computerRarity?.display).toMatch(/^(Common|Uncommon|Rare|Epic)$/);
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
        label: "Northeast India",
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

  expect(ordered.slice(0, 2).map((card) => card.title)).toEqual(["Aji Delight", "Bell Pepper"]);
  expect(ordered.map((card) => card.id)).toEqual(expectedOrder.map((card) => card.id));
  expect(ordered.findIndex((card) => card.id === "orange-seven-pot")).toBeLessThan(ordered.findIndex((card) => card.id === "armageddon"));
  expect(lowerBoundOnly.every((card) => !Number.isFinite(card.statValue))).toBe(true);
});

test("category collections keep every card in its meaningful order", () => {
  const pepperCards = collectionCards().filter((card) => card.topic === "peppers");
  const orderedPeppers = orderCollectionCardsForCategory(pepperCards);
  expect(orderedPeppers).toEqual(orderCollectionCardsByScoville(pepperCards));
  expect(collectionOrderLabel(orderedPeppers)).toBe("Scoville · mildest to hottest");

  const hotSaucePack = loadPlayablePacks().find((pack) => pack.id === "hot-sauces");
  expect(hotSaucePack).toBeTruthy();
  const hotSauceCards = packToPlayableDeck(hotSaucePack!).cards;
  const orderedHotSauces = orderCollectionCardsForCategory(hotSauceCards);
  expect(orderedHotSauces.map((card) => card.statValue)).toEqual(
    [...orderedHotSauces.map((card) => card.statValue)].sort((a, b) => a - b),
  );
  expect(orderedHotSauces.at(0)?.title).toBe("Frank's RedHot Original");
  expect(orderedHotSauces.at(-1)?.title).toBe("PuckerButt Gator Sauce");
  expect(collectionOrderLabel(orderedHotSauces)).toBe("Scoville · mildest to hottest");

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
  expect(geo.choices.map((choice) => choice.mapNote)).toEqual(
    geo.choices.map((choice) => choice.location.continents.join(" / ")),
  );
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

test("every playable category has ten distinct single-subject Challenge deep dives", () => {
  expect(new Set(playableChallengeCategories.map((category) => category.id)).size).toBe(playableChallengeCategories.length);

  for (const category of playableChallengeCategories) {
    const campaigns = buildChallengeCampaignsForCategory(category);
    expect(campaigns, `${category.id} needs 10 campaigns`).toHaveLength(challengeCampaignCountPerCategory);
    expect(new Set(campaigns.map((campaign) => campaign.id)).size).toBe(challengeCampaignCountPerCategory);

    for (const skill of ["Reading", "Math", "Science", "Words"] as const) {
      const steps = campaigns.map((campaign) => campaign.steps.find((step) => step.skill === skill)!);
      const optionSignatures = steps.map((step) => `${step.clue}|${step.question}|${step.answer}`);
      expect(new Set(optionSignatures).size, `${category.id}/${skill} needs 10 distinct options`).toBeGreaterThanOrEqual(10);
      expect(new Set(steps.map((step) => step.image)).size, `${category.id}/${skill} needs 10 distinct subject images`).toBeGreaterThanOrEqual(10);
    }
    const connectionSteps = campaigns.map((campaign) => campaign.steps.find((step) => step.skill === "Geography" || step.skill === "Classification")!);
    expect(new Set(connectionSteps.map((step) => `${step.clue}|${step.question}|${step.answer}`)).size, `${category.id} needs 10 distinct map or classification stops`).toBeGreaterThanOrEqual(10);
    expect(new Set(connectionSteps.map((step) => step.image)).size, `${category.id} needs 10 distinct map or classification images`).toBeGreaterThanOrEqual(10);

    for (const campaign of campaigns) {
      expect(campaign.steps).toHaveLength(5);
      expect(new Set(campaign.steps.map((step) => step.skill)).has("Reading")).toBe(true);
      expect(new Set(campaign.steps.map((step) => step.skill)).has("Math")).toBe(true);
      expect(new Set(campaign.steps.map((step) => step.skill)).has("Science")).toBe(true);
      expect(new Set(campaign.steps.map((step) => step.skill)).has("Words")).toBe(true);
      expect(campaign.steps.filter((step) => step.skill === "Geography" || step.skill === "Classification")).toHaveLength(1);
      expect(new Set(campaign.steps.map((step) => step.image)), `${campaign.id} must stay on one subject`).toEqual(new Set([campaign.image]));
      expect(campaign.completionTitle).toBe(`${campaign.name} field journal`);
      for (const step of campaign.steps) {
        expect(`${step.title} ${step.clue} ${step.question} ${step.summary}`, `${step.id} must stay anchored to ${campaign.name}`).toContain(campaign.name);
      }
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
      if (step.skill === "Science") expect([2, 4], `${step.id} should be a genuine comparison or a four-choice interpretation`).toContain(step.choices.length);
      else if (step.skill === "Classification") {
        expect(step.choices.length, `${step.id} needs at least two real field-guide groups`).toBeGreaterThanOrEqual(2);
        expect(step.choices.length, `${step.id} should stay concise`).toBeLessThanOrEqual(4);
      } else expect(step.choices, `${step.id} needs four choices`).toHaveLength(4);
      expect(new Set(step.choices).size, `${step.id} choices must be distinct`).toBe(step.choices.length);
      expect(step.image, `${step.id} needs its own subject image`).toBeTruthy();
      expect(step.choices.filter((choice) => ["Not enough information", "A different field note", "None of these", "All of these"].includes(choice)), `${step.id} should not need generic filler choices`).toEqual([]);

      if (step.skill === "Reading") {
        expect(step.choices).toContain(step.evidence);
        expect(`${step.title} ${step.clue} ${step.question}`).not.toContain(step.answer);
        expect(step.answer, `${step.id} should anonymize the subject name inside its correct field note`).not.toContain(campaign.name);
      } else if (step.skill === "Geography") {
        expect(step.map, `${step.id} must teach with a visible map`).toBeTruthy();
        if (!step.map) throw new Error(`${step.id} is missing its map`);
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
      } else if (step.skill === "Classification") {
        expect(step.title).toMatch(/^Classify /);
        expect(step.question).toContain("Which field-guide group best fits");
        expect(`${step.title} ${step.clue} ${step.question}`).not.toContain(step.answer);
        expect(step.summary).toContain("belongs in the field-guide group");
      } else if (step.skill === "Math") {
        expect(step.question).toBe(`${step.math.groups} × ${step.math.each} = ?`);
        expect(Number.parseInt(step.answer.replaceAll(",", ""), 10)).toBe(step.math.groups * step.math.each);
        expect(step.math.visual.ariaLabel).toContain(`${step.math.groups}`);
        expect(step.math.visual.ariaLabel).toContain(`${step.math.each}`);
      } else if (step.skill === "Science") {
        expect(`${step.title} ${step.clue} ${step.question}`).not.toContain(step.answer);
      }
    }
  }
});

test("Challenge copy keeps comparison subjects honest and space sizes in miles", () => {
  const tallTrees = playableChallengeCategories.find((category) => category.id === "tall-trees")!;
  const tallTreeCampaigns = buildChallengeCampaignsForCategory(tallTrees);
  const dave = tallTreeCampaigns.find((campaign) => campaign.name === "Dave the Human")!;
  expect(dave.steps.find((step) => step.skill === "Reading")?.question).toBe("Which field note belongs with this height subject?");
  expect(dave.steps.find((step) => step.skill === "Classification")?.title).toBe("Classify Dave the Human");

  const space = playableChallengeCategories.find((category) => category.id === "space")!;
  const pluto = buildChallengeCampaignsForCategory(space).find((campaign) => campaign.name === "Pluto")!;
  expect(pluto.steps.find((step) => step.skill === "Science")?.clue).toContain("1,477 mi");
  expect(pluto.steps.find((step) => step.skill === "Words")?.clue).toContain("1,477 mi");

  const hotSauces = playableChallengeCategories.find((category) => category.id === "hot-sauces")!;
  const nandos = buildChallengeCampaignsForCategory(hotSauces).find((campaign) => campaign.name === "Nando's Hot PERi-PERi")!;
  expect(nandos.steps.find((step) => step.skill === "Reading")?.question).toBe("Which field note belongs with this sauce?");
  expect(nandos.steps.find((step) => step.skill === "Reading")?.answer).toBe("This sauce centers African bird's eye chillies, a pepper also called peri-peri or piri-piri.");
  expect(nandos.steps.find((step) => step.skill === "Science")?.title).toBe("Compare the Scoville rating");
  expect(nandos.steps.find((step) => step.skill === "Science")?.answer).not.toBe(nandos.name);
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

  const questionStage = page.locator("[data-question-photo]");
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
  expect(stageBox!.height).toBeGreaterThanOrEqual(160);
  expect(stageBox!.height).toBeLessThanOrEqual(164);
  expect(promptBox!.y).toBeLessThan(viewport!.height);
  expect(choiceBox!.y).toBeLessThan(viewport!.height);
});

test("offline saving stays in Setup and the app shell supports an offline reload", { tag: "@mobile" }, async ({ page, context }) => {
  const moreButton = page.getByRole("button", { name: "More actions" });
  await moreButton.click();
  await expect(page.getByLabel("More controls")).toBeVisible();
  await page.getByRole("button", { name: "Setup", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Setup" })).toBeVisible();
  await expect(page.getByText("Offline", { exact: true })).toBeVisible();
  await expect(page.getByText(/Save \d+ selected cards · up to \d+ (?:KB|MB)/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Save offline" })).toBeEnabled();

  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("Service workers are unavailable");
    await navigator.serviceWorker.ready;
  });

  const incrementalCache = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active;
    if (!worker) throw new Error("Service worker is not active");
    const entries = [
      { url: "/icons/burrow-icon-32.png", revision: "offline-test-v1", bytes: 1 },
      { url: "/icons/burrow-icon-64.png", revision: "offline-test-v1", bytes: 1 },
    ];
    const cacheEntries = (requestId: string) => new Promise<{ cached: number; downloaded: number; failed: number }>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Offline cache request timed out")), 10_000);
      const handleMessage = (event: MessageEvent) => {
        const message = event.data;
        if (message?.type !== "OFFLINE_CACHE_COMPLETE" || message.requestId !== requestId) return;
        window.clearTimeout(timeout);
        navigator.serviceWorker.removeEventListener("message", handleMessage);
        resolve({ cached: message.cached, downloaded: message.downloaded, failed: message.failed });
      };
      navigator.serviceWorker.addEventListener("message", handleMessage);
      worker.postMessage({ type: "CACHE_URLS", requestId, entries });
    });
    return {
      first: await cacheEntries("offline-test-first"),
      second: await cacheEntries("offline-test-second"),
    };
  });

  expect(incrementalCache.first).toEqual({ cached: 0, downloaded: 2, failed: 0 });
  expect(incrementalCache.second).toEqual({ cached: 2, downloaded: 0, failed: 0 });

  await page.getByRole("button", { name: "Close setup" }).click();

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Burrow" })).toBeVisible();
    await page.waitForFunction(() => document.documentElement.dataset.burrowHydrated === "true");
  } finally {
    await context.setOffline(false);
  }
});

test("game types use the Topics multi-select pattern and advanced controls stay in More", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Burrow" })).toBeVisible();
  await expect(modeControl(page)).toHaveText(/Modes\s*▾/);
  await expect(topicsControl(page)).toHaveText(/Topics\s*▾/);
  await expect(page.getByRole("button", { name: /^Collection/ })).toBeVisible();
  const moreButton = page.getByRole("button", { name: "More actions" });
  await expect(moreButton).toBeVisible();
  await expect(page.getByRole("button", { name: "Setup", exact: true })).toHaveCount(0);

  await modeControl(page).click();
  await expect(modeTray(page)).toBeVisible();
  for (const label of modeLabels) await expect(mixOption(page, label)).toHaveAttribute("aria-pressed", "true");
  const modeChipClass = await mixOption(page, "Quiz Run").getAttribute("class");
  const modeCheckClass = await mixOption(page, "Quiz Run").locator("span").nth(1).getAttribute("class");
  const modeDotStyle = await mixOption(page, "Quiz Run").locator("span").first().getAttribute("style");

  for (const label of modeLabels.filter((label) => label !== "True/False")) {
    await mixOption(page, label).click();
    await expect(mixOption(page, label)).toHaveAttribute("aria-pressed", "false");
  }
  await expect(modeTray(page)).toBeVisible();
  await expect(modeControl(page)).toHaveText(/Modes/);
  await expect(mixOption(page, "True/False")).toHaveAttribute("aria-pressed", "true");

  await mixOption(page, "True/False").click();
  await expect(mixOption(page, "True/False")).toHaveAttribute("aria-pressed", "true");
  await expect(modeControl(page)).toHaveText(/Modes/);

  await topicsControl(page).click();
  await expect(modeTray(page)).toBeHidden();
  await expect(topicsTray(page)).toBeVisible();
  const topicChip = topicsTray(page).getByRole("button", { name: "Spicy Peppers", exact: true });
  await expect(topicChip).toHaveAttribute("class", modeChipClass ?? "");
  await expect(topicChip.locator("span").nth(1)).toHaveAttribute("class", modeCheckClass ?? "");
  await expect(topicChip.locator("span").nth(1)).toHaveText("✓");
  expect(await topicChip.locator("span").first().getAttribute("style")).not.toBe(modeDotStyle);

  await moreButton.click();
  await expect(topicsTray(page)).toBeHidden();
  const moreTray = page.getByLabel("More controls");
  await expect(moreTray).toBeVisible();
  await expect(moreTray.getByRole("button", { name: "Setup", exact: true })).toBeVisible();
  await expect(moreTray.getByRole("button", { name: "Reset", exact: true })).toBeVisible();
  await moreTray.getByRole("button", { name: "Setup", exact: true }).click();
  const setup = page.getByRole("dialog", { name: "Setup" });
  await expect(setup).toBeVisible();
  await expect(setup.getByRole("button", { name: /Turn sound effects/ })).toBeVisible();
  await setup.getByRole("button", { name: "Close setup" }).click();
  await moreButton.click();
  await expect(moreTray).toBeVisible();
  await moreTray.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(moreTray.getByText(/Reset all progress\? This can't be undone\./)).toBeVisible();
  await moreTray.getByRole("button", { name: "Cancel" }).click();
  await expect(moreTray.getByRole("button", { name: "Reset", exact: true })).toBeVisible();
  await moreButton.click();

  await expect(page.getByText("True or false?")).toBeVisible();

  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();

  await page.getByRole("button", { name: /Next|Finish round/ }).click();
  await expect(page.getByText("True or false?")).toBeVisible();

  await page.getByRole("button", { name: /^Collection/ }).click();
  await expect(page.getByText("Collection", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose a category" })).toBeVisible();
});

test("the level button opens progress stats and tracks topic and game-type activity", async ({ page }) => {
  await chooseOnlyMode(page, "True/False");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const saved = JSON.parse(window.localStorage.getItem("burrow-profiles-v1") ?? "{}") as {
      activeProfileId?: string;
      profiles?: { id: string; progress: { modeStats?: Record<string, { answered: number }> } }[];
    };
    return saved.profiles?.find((profile) => profile.id === saved.activeProfileId)?.progress.modeStats?.fact?.answered ?? 0;
  })).toBe(1);

  const tracked = await page.evaluate(() => {
    const saved = JSON.parse(window.localStorage.getItem("burrow-profiles-v1") ?? "{}") as {
      activeProfileId?: string;
      profiles?: {
        id: string;
        progress: {
          topicStats?: Record<string, { correct: number; answered: number }>;
          modeStats?: Record<string, { correct: number; answered: number; collected: number }>;
        };
      }[];
    };
    const progress = saved.profiles?.find((profile) => profile.id === saved.activeProfileId)?.progress;
    return {
      topic: progress?.topicStats?.peppers,
      mode: progress?.modeStats?.fact,
    };
  });

  expect(tracked.topic?.answered).toBe(1);
  expect(tracked.mode?.answered).toBe(1);
  if (tracked.mode?.correct) expect(tracked.mode.collected).toBeGreaterThan(0);
  else expect(tracked.mode?.collected).toBe(0);

  const levelButton = page.getByRole("button", { name: /Level \d+\. View progress stats/ });
  await levelButton.click();
  const dialog = page.getByRole("dialog", { name: /Progress at level/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Questions", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Correct", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Incorrect", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Collected", { exact: true })).toBeVisible();

  const topics = dialog.getByRole("heading", { name: "Topics explored" }).locator("xpath=ancestor::section[1]");
  await expect(topics.getByText("Spicy Peppers", { exact: true })).toBeVisible();
  await expect(topics.getByText("1 question", { exact: true })).toBeVisible();
  await expect(topics.getByText(`+ ${tracked.topic?.correct ?? 0} correct`, { exact: true })).toBeVisible();
  await expect(topics.getByText(`× ${1 - (tracked.topic?.correct ?? 0)} incorrect`, { exact: true })).toBeVisible();

  const modes = dialog.getByRole("heading", { name: "Game types played" }).locator("xpath=ancestor::section[1]");
  await expect(modes.getByText("True/False", { exact: true })).toBeVisible();
  await expect(modes.getByText(`◆ ${tracked.mode?.collected ?? 0} collected`, { exact: true })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(levelButton).toBeFocused();
});

test("HUD trays share one slot, stay open on selection, and protect the final topic", async ({ page }) => {
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  await topicsControl(page).click();
  const onlyTopic = topicsTray(page).getByRole("button", { name: "Spicy Peppers", exact: true });
  await onlyTopic.click();
  await expect(onlyTopic).toHaveAttribute("aria-pressed", "true");
  await expect(topicsTray(page)).toBeVisible();

  await modeControl(page).click();
  await expect(topicsTray(page)).toBeHidden();
  const peekMode = mixOption(page, "Peek");
  if ((await peekMode.getAttribute("aria-pressed")) !== "true") await peekMode.click();
  await expect(peekMode).toHaveAttribute("aria-pressed", "true");
  for (const label of modeLabels.filter((label) => label !== "Peek")) {
    const button = mixOption(page, label);
    if (await button.isEnabled() && (await button.getAttribute("aria-pressed")) === "true") await button.click();
  }
  await expect(modeTray(page)).toBeVisible();
  await expect(modeControl(page)).toHaveText(/Modes/);

  await page.getByRole("button", { name: "More actions" }).click();
  await expect(modeTray(page)).toBeHidden();
  await expect(page.getByLabel("More controls")).toBeVisible();
});

test("sound effects live in Setup and remember the choice", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("button", { name: "Setup", exact: true }).click();
  const soundOn = page.getByRole("button", { name: "Turn sound effects on" });
  await expect(soundOn).toBeVisible();
  await expect(soundOn).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("main")).toHaveAttribute("data-sound-effects", "off");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("burrow-sound-effects-v1"))).toBe("off");

  await soundOn.click();
  const soundOff = page.getByRole("button", { name: "Turn sound effects off" });
  await expect(soundOff).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("main")).toHaveAttribute("data-sound-effects", "on");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("burrow-sound-effects-v1"))).toBe("on");
  await page.getByRole("button", { name: "Close setup" }).click();

  await chooseOnlyMode(page, "True/False");
  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();

  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("button", { name: "Setup", exact: true }).click();
  await expect(page.getByRole("button", { name: "Turn sound effects off" })).toHaveAttribute("aria-pressed", "true");
  expect(pageErrors).toEqual([]);
});

test("HUD selector trays wrap onto new lines without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1194 });

  await topicsControl(page).click();
  const topicButtons = topicsTray(page).getByRole("button");
  await expect(topicButtons.first()).toBeVisible();
  expect(await topicsTray(page).evaluate((tray) => tray.scrollWidth <= tray.clientWidth + 1)).toBe(true);
  expect(await topicButtons.evaluateAll((buttons) => new Set(buttons.map((button) => Math.round(button.getBoundingClientRect().y))).size)).toBeGreaterThan(1);

  await modeControl(page).click();
  const modeButtons = modeTray(page).getByRole("button");
  await expect(modeButtons.first()).toBeVisible();
  expect(await modeTray(page).evaluate((tray) => tray.scrollWidth <= tray.clientWidth + 1)).toBe(true);
  expect(await modeButtons.evaluateAll((buttons) => new Set(buttons.map((button) => Math.round(button.getBoundingClientRect().y))).size)).toBeGreaterThan(1);
});

test("HUD stays on one line across iPad sizes without horizontal overflow", async ({ page }) => {
  for (const viewport of [
    { width: 2048, height: 900 },
    { width: 1194, height: 834 },
    { width: 1024, height: 768 },
    { width: 834, height: 1194 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.getByLabel("Play controls")).toBeVisible();
    await expect.poll(() => page.evaluate(() => ({
      viewport: window.innerWidth,
      page: document.documentElement.scrollWidth,
    }))).toEqual({ viewport: viewport.width, page: viewport.width });
    await expect(modeControl(page)).toBeVisible();
    await expect(topicsControl(page)).toBeVisible();
    await expect(page.getByRole("button", { name: /^Collection/ })).toBeVisible();
    const actionBoxes = await Promise.all([
      modeControl(page).boundingBox(),
      topicsControl(page).boundingBox(),
      page.getByRole("button", { name: /^Collection/ }).boundingBox(),
      page.getByRole("button", { name: "More actions" }).boundingBox(),
    ]);
    expect(actionBoxes.every(Boolean)).toBe(true);
    expect(new Set(actionBoxes.map((box) => Math.round(box!.y))).size).toBe(1);
    expect(new Set(actionBoxes.map((box) => Math.round(box!.height))).size).toBe(1);
    const progressBox = await page.locator("[data-hud-progress]").boundingBox();
    const difficultyBox = await page.locator("[data-hud-difficulty]").boundingBox();
    const difficultyLabelsFit = await page.locator("[data-hud-difficulty] button span").evaluateAll((labels) => (
      labels.every((label) => label.scrollWidth <= label.clientWidth + 1)
    ));
    expect(progressBox).not.toBeNull();
    expect(difficultyBox).not.toBeNull();
    expect(difficultyLabelsFit, `${viewport.width}px difficulty labels should remain fully visible`).toBe(true);
    expect(Math.abs(actionBoxes[0]!.y - progressBox!.y), `${viewport.width}px progress and actions should share the iPad HUD row`).toBeLessThanOrEqual(4);
    expect(Math.abs(actionBoxes[0]!.y - difficultyBox!.y), `${viewport.width}px difficulty and actions should share the iPad HUD row`).toBeLessThanOrEqual(4);
    expect(Math.abs(actionBoxes[0]!.height - difficultyBox!.height)).toBeLessThanOrEqual(1);
    if (viewport.width >= 1100) await expect(page.locator("[data-hud-identity]")).toBeVisible();
    else await expect(page.locator("[data-hud-identity]")).toBeHidden();
    if (viewport.width >= 1440) {
      const infoBox = await page.locator("[data-hud-info]").boundingBox();
      const controlsBox = await page.getByLabel("Play controls").boundingBox();
      const shellBox = await page.locator(".burrow-game-shell").boundingBox();
      expect(infoBox).not.toBeNull();
      expect(controlsBox).not.toBeNull();
      expect(shellBox).not.toBeNull();
      expect(controlsBox!.x).toBeGreaterThan(infoBox!.x + infoBox!.width);
      expect(controlsBox!.x + controlsBox!.width).toBeGreaterThanOrEqual(shellBox!.x + shellBox!.width - 18);
      expect(controlsBox!.width).toBeLessThanOrEqual(380);
      expect(actionBoxes[3]!.width).toBeGreaterThanOrEqual(50);
    }
  }
});

test("tablet and desktop play fill the available viewport with balanced photo and question panels", async ({ page }) => {
  await page.setViewportSize({ width: 1194, height: 834 });
  await chooseOnlyMode(page, "Quiz Run");

  for (const viewport of [
    { width: 1194, height: 834 },
    { width: 1024, height: 1366 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const photo = await page.locator("[data-question-photo]").boundingBox();
    const card = await page.locator("[data-question-card]").boundingBox();
    expect(photo).not.toBeNull();
    expect(card).not.toBeNull();
    expect(Math.abs(photo!.x + photo!.width - card!.x)).toBeLessThanOrEqual(16);
    expect(Math.abs(photo!.width - card!.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(photo!.height - card!.height)).toBeLessThanOrEqual(2);
    expect(photo!.height).toBeGreaterThan(460);
    expect(viewport.height - photo!.y - photo!.height).toBeLessThanOrEqual(32);
  }
});

test("iPad Geo Finder aligns both panels without a nested question scrollbar", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await chooseOnlyBuiltInTopic(page, "Jet Hangar");
  await chooseOnlyMode(page, "Geo Finder");

  const layout = page.locator("[data-geo-layout]");
  const stage = page.locator("[data-geo-stage]");
  const card = page.locator("[data-question-card]");
  await expect(layout).toBeVisible();

  const [stageBox, cardBox] = await Promise.all([stage.boundingBox(), card.boundingBox()]);
  expect(stageBox).not.toBeNull();
  expect(cardBox).not.toBeNull();
  expect(Math.abs(stageBox!.y - cardBox!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(stageBox!.height - cardBox!.height)).toBeLessThanOrEqual(1);
  expect(stageBox!.height).toBeGreaterThan(460);
  expect(768 - stageBox!.y - stageBox!.height).toBeLessThanOrEqual(32);
  expect(await card.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  expect(await card.evaluate((element) => getComputedStyle(element).overflowY)).not.toBe("auto");

  const geoChoices = card.locator("[data-geo-choice]");
  const choiceTextBeforeAnswer = await geoChoices.allTextContents();
  await geoChoices.first().click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  await expect(geoChoices).toHaveCount(choiceTextBeforeAnswer.length);
  expect(await geoChoices.allTextContents()).toEqual(choiceTextBeforeAnswer);
  for (const choice of await geoChoices.all()) {
    await expect(choice).toBeVisible();
    await expect(choice).toBeDisabled();
  }
  expect(await card.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  const geoPage = await page.evaluate(() => ({ pageHeight: document.documentElement.scrollHeight, viewportHeight: window.innerHeight, scrollY: window.scrollY }));
  expect(geoPage.pageHeight).toBeLessThanOrEqual(geoPage.viewportHeight + 1);
  expect(geoPage.scrollY).toBe(0);
});

test("iPad Sort uses a matched single-screen layout without duplicate order UI", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await chooseOnlyBuiltInTopic(page, "Space Universe");
  await chooseOnlyMode(page, "Sort");

  const layout = page.locator("[data-sort-layout]");
  const stage = page.locator("[data-sort-stage]");
  const card = page.locator("[data-question-card]");
  const cardGrid = page.locator("[data-sort-card-grid]");
  const cardButtons = cardGrid.getByRole("button");
  await expect(layout).toBeVisible();

  const [stageBox, cardBox, cardCount, columnCount] = await Promise.all([
    stage.boundingBox(),
    card.boundingBox(),
    cardButtons.count(),
    cardGrid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length),
  ]);
  expect(stageBox).not.toBeNull();
  expect(cardBox).not.toBeNull();
  expect(stageBox!.height).toBeGreaterThan(460);
  expect(768 - stageBox!.y - stageBox!.height).toBeLessThanOrEqual(32);
  expect(Math.abs(stageBox!.height - cardBox!.height)).toBeLessThanOrEqual(1);
  expect(columnCount).toBe(cardCount);
  await expect(page.locator("[data-sort-order-summary]")).toBeVisible();
  await expect(page.locator("[data-sort-graded-order]")).toHaveCount(0);

  for (let index = 0; index < cardCount; index += 1) await cardButtons.nth(index).click();
  await page.getByRole("button", { name: "Check order" }).click();

  await expect(page.locator("[data-sort-order-summary]")).toHaveCount(0);
  await expect(page.locator("[data-sort-graded-order]")).toBeVisible();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  expect(await card.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
  const sortPage = await page.evaluate(() => ({ pageHeight: document.documentElement.scrollHeight, viewportHeight: window.innerHeight, scrollY: window.scrollY }));
  expect(sortPage.pageHeight).toBeLessThanOrEqual(sortPage.viewportHeight + 1);
  expect(sortPage.scrollY).toBe(0);
});

test("phone HUD is exactly two lines with identity removed and full-size actions", { tag: "@mobile" }, async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile viewport coverage");

  await expect(page.locator("[data-hud-identity]")).toBeHidden();
  const progress = await page.locator("[data-hud-progress]").boundingBox();
  const difficulty = await page.locator("[data-hud-difficulty]").boundingBox();
  const actions = await Promise.all([
    modeControl(page).boundingBox(),
    topicsControl(page).boundingBox(),
    page.getByRole("button", { name: /^Collection/ }).boundingBox(),
    page.getByRole("button", { name: "More actions" }).boundingBox(),
  ]);

  expect(progress).not.toBeNull();
  expect(difficulty).not.toBeNull();
  expect(actions.every(Boolean)).toBe(true);
  expect(Math.abs(progress!.y - difficulty!.y)).toBeLessThanOrEqual(4);
  expect(new Set(actions.map((box) => Math.round(box!.y))).size).toBe(1);
  expect(actions[0]!.y).toBeGreaterThan(progress!.y + 20);
  expect(Math.min(...actions.map((box) => box!.height))).toBeGreaterThanOrEqual(44);
  await expect(page.getByLabel("Play controls").getByRole("button")).toHaveCount(4);
});

test("iPhone question scroll keeps Next card sticky and thumb-reachable", { tag: "@mobile" }, async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile viewport coverage");
  await chooseOnlyMode(page, "Quiz Run");

  const choices = page.getByLabel("Answer choices").getByRole("button");
  await choices.first().click();
  const feedback = page.getByLabel("Answer feedback");
  if (await feedback.count() === 0) await choices.last().click();
  await expect(feedback).toBeVisible();

  const sticky = page.locator("[data-sticky-next]");
  const next = sticky.getByRole("button", { name: /Next card|Finish round/ });
  await expect(next).toBeVisible();
  expect(await sticky.evaluate((element) => getComputedStyle(element).position)).toMatch(/sticky|fixed/);
  expect(Number.parseFloat(await sticky.evaluate((element) => getComputedStyle(element).bottom))).toBeGreaterThanOrEqual(0);

  await page.evaluate(() => window.scrollTo(0, Math.max(0, document.documentElement.scrollHeight - window.innerHeight - 40)));
  const box = await next.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
  expect(box!.y + box!.height).toBeGreaterThanOrEqual(viewport!.height - 100);
});

test("landing page explains the learning model and every playable topic pack", async ({ page }) => {
  const landingCards = buildLandingTopicCards(loadPlayablePacks());
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Burrow", exact: true })).toBeVisible();
  await expect(page.getByText("whatever's stuck in their head", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Every mode teaches new skills." })).toBeVisible();
  await expect(page.getByRole("heading", { name: new RegExp(`${landingCards.length} content packs from peppers to`) })).toBeVisible();
  for (const topic of landingCards) {
    await expect(page.getByRole("heading", { name: topic.title, exact: true })).toBeVisible();
    await expect(page.getByText(topic.detail, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Play Burrow" }).first()).toHaveAttribute("href", "/play");
});

test("fresh and existing profiles automatically select newly added topics", async ({ page }) => {
  await topicsControl(page).click();
  for (const label of topicLabels) {
    await expect(topicsTray(page).getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-pressed", "true");
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
  await expect(topicsControl(page)).toHaveText(/Topics/);
  await topicsControl(page).click();
  await expect(topicsTray(page).getByRole("button", { name: "Countries & Flags", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => page.evaluate(() => {
    const saved = JSON.parse(window.localStorage.getItem("burrow-profiles-v1") ?? "{}") as { knownTopics?: string[] };
    return saved.knownTopics ?? [];
  })).toContain("countries");
});

test("a mystery flag gives one clue retry and unlocks a country passport", { tag: "@mobile" }, async ({ page }) => {
  await chooseOnlyMode(page, "Quiz Run");
  await chooseOnlyBuiltInTopic(page, "Countries & Flags");

  const mysteryFlag = page.getByRole("img", { name: "Mystery country flag" });
  for (let attempt = 0; attempt < 18 && (await mysteryFlag.count()) === 0; attempt += 1) {
    await page.getByRole("button", { name: "Skip question" }).click();
  }
  await expect(mysteryFlag).toBeVisible();
  await expect(page.getByText(/^Image:/)).toHaveCount(0);

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
  await page.getByRole("button", { name: /^Collection/ }).click();

  const passport = page.getByText("Open country passport", { exact: true }).locator("xpath=ancestor::details[1]");
  await expect(passport).toBeVisible();
  await passport.locator("summary").click();
  await expect(passport.getByText(answerCountry!.capital, { exact: true })).toBeVisible();
  await expect(passport.getByText("Population", { exact: true })).toBeVisible();
  await expect(passport.getByText("Land area", { exact: true })).toBeVisible();
  await expect(passport.getByText("Continent", { exact: true })).toBeVisible();
  await expect(page.getByText(/^Image:/).first()).toBeVisible();

  await page.getByRole("button", { name: "Back to game" }).click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  await expect(page.getByRole("button", { name: /Next card|Finish round/ })).toBeVisible();
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
  await page.getByRole("button", { name: /Next card|Finish round/ }).click();

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
  await expect(page.getByRole("button", { name: /^(Next|Finish round)/ })).toBeVisible();
  await expect(page.getByLabel("Challenge Mode", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /^(Next|Finish round)/ }).click();
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

test("automatic Challenge Mode respects the selected category and keeps one subject between stops", async ({ page }) => {
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

  if (geography.skill === "Geography" && geography.map) {
    await expect(page.getByLabel("Challenge map story")).toBeVisible();
  } else if (geography.skill === "Classification") {
    const classificationStory = page.getByLabel("Challenge picture story");
    await expect(classificationStory.getByRole("img", { name: geography.imageAlt })).toBeVisible();
    await expect(classificationStory.getByRole("img")).toHaveAttribute("src", firstImage ?? "");
  } else {
    throw new Error("Second Challenge stop must be Geography or Classification");
  }
});

test("Hot Sauces Challenge replaces the answer-giving Scoville prompt with a real comparison", { tag: "@mobile" }, async ({ page }) => {
  const hotSauces = playableChallengeCategories.find((category) => category.id === "hot-sauces")!;
  const campaigns = buildChallengeCampaignsForCategory(hotSauces);
  const campaignIndex = campaigns.findIndex((campaign) => campaign.name === "Nando's Hot PERi-PERi");
  expect(campaignIndex).toBeGreaterThanOrEqual(0);
  const campaign = campaigns[campaignIndex];
  await openChallengeAt(page, (campaignIndex + 1) * challengeQuestionInterval, "Hot Sauces");

  await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText("Hot Sauces");
  await expect(page.getByLabel("Challenge Mode", { exact: true })).toContainText(campaign.name);

  for (const step of campaign.steps.slice(0, 3)) {
    if (step.skill === "Geography" && step.map) {
      const answerIndex = step.map.choices.findIndex((choice) => choice.label === step.answer);
      const answerChoice = step.map.choices[answerIndex];
      await page.getByRole("button", { name: `Choose map pin ${String.fromCharCode(65 + answerIndex)}: ${answerChoice.mapLabel ?? answerChoice.label}` }).click();
    } else {
      await page.getByLabel("Answer choices").getByRole("button", { name: step.answer, exact: true }).click();
    }
    await expect(page.getByLabel("Answer feedback")).toBeVisible();
    await page.getByRole("button", { name: "Next question" }).click();
  }

  const science = campaign.steps.find((step) => step.skill === "Science")!;
  expect(science.choices).toHaveLength(2);
  expect(science.answer).not.toBe(campaign.name);
  await expect(page.getByRole("heading", { name: "Compare the Scoville rating", exact: true })).toBeVisible();
  await expect(page.getByText(science.clue, { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Which statement is supported by the recorded values?", exact: true })).toBeVisible();
  await expect(page.getByLabel("Answer choices").getByRole("button")).toHaveCount(2);
  await expect(page.getByText("Which subject matches this measurement?", { exact: true })).toHaveCount(0);
  await page.getByLabel("Answer choices").getByRole("button", { name: science.answer, exact: true }).click();
  await expect(page.getByLabel("Answer feedback")).toContainText(science.summary);

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
});

test("Challenge Mode shares the iPad round layout and never scrolls its story panel", async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1194 });
  await openChallengeAt(page, challengeQuestionInterval, "Shark Tank");

  const challenge = page.locator("[data-challenge-layout]");
  const round = page.locator("[data-challenge-round]");
  const story = page.locator("[data-challenge-story]");
  const questionCard = page.locator("[data-question-card]");
  const campaign = buildChallengeCampaignsForCategory(playableChallengeCategories.find((category) => category.id === "sharks")!)[0];

  const expectSharedDesktopLayout = async () => {
    await expect(challenge).toBeVisible();
    await expect(round).toBeVisible();
    await expect(story).toBeVisible();
    await expect(questionCard).toBeVisible();

    const measurements = await page.evaluate(() => {
      const challengeElement = document.querySelector<HTMLElement>("[data-challenge-layout]");
      const roundElement = document.querySelector<HTMLElement>("[data-challenge-round]");
      const storyElement = document.querySelector<HTMLElement>("[data-challenge-story]");
      const questionElement = document.querySelector<HTMLElement>("[data-question-card]");
      if (!challengeElement || !roundElement || !storyElement || !questionElement) throw new Error("Challenge layout was not rendered");
      const storyRect = storyElement.getBoundingClientRect();
      const questionRect = questionElement.getBoundingClientRect();
      return {
        challengeOverflow: getComputedStyle(challengeElement).overflowY,
        challengeClientHeight: challengeElement.clientHeight,
        challengeScrollHeight: challengeElement.scrollHeight,
        roundColumns: getComputedStyle(roundElement).gridTemplateColumns.split(" ").length,
        storyOverflow: getComputedStyle(storyElement).overflowY,
        storyClientHeight: storyElement.clientHeight,
        storyScrollHeight: storyElement.scrollHeight,
        topDifference: Math.abs(storyRect.top - questionRect.top),
        bottomDifference: Math.abs(storyRect.bottom - questionRect.bottom),
      };
    });

    expect(measurements.challengeOverflow).toBe("hidden");
    expect(measurements.challengeScrollHeight).toBeLessThanOrEqual(measurements.challengeClientHeight + 1);
    expect(measurements.roundColumns).toBe(2);
    expect(["auto", "scroll"]).not.toContain(measurements.storyOverflow);
    expect(measurements.storyScrollHeight).toBeLessThanOrEqual(measurements.storyClientHeight + 1);
    expect(measurements.topDifference).toBeLessThanOrEqual(1);
    expect(measurements.bottomDifference).toBeLessThanOrEqual(1);
  };

  for (const [stepIndex, step] of campaign.steps.entries()) {
    await expectSharedDesktopLayout();

    if (step.skill === "Geography" && step.map) {
      const answerIndex = step.map.choices.findIndex((choice) => choice.label === step.answer);
      const answerChoice = step.map.choices[answerIndex];
      await page.getByRole("button", { name: `Choose map pin ${String.fromCharCode(65 + answerIndex)}: ${answerChoice.mapLabel ?? answerChoice.label}` }).click();
    } else {
      await page.getByLabel("Answer choices").getByRole("button").filter({ hasText: step.answer }).click();
    }

    await expect(page.getByLabel("Answer feedback")).toBeVisible();
    await expectSharedDesktopLayout();

    const nextAction = page.getByRole("button", { name: stepIndex === campaign.steps.length - 1 ? "View challenge summary" : "Next question" });
    const nextBox = await nextAction.boundingBox();
    const viewport = page.viewportSize();
    expect(nextBox).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(await page.locator("[data-sticky-next]").evaluate((element) => getComputedStyle(element).position)).toBe("fixed");
    expect(nextBox!.y).toBeGreaterThanOrEqual(0);
    expect(nextBox!.y + nextBox!.height).toBeLessThanOrEqual(viewport!.height);

    if (stepIndex === 0) {
      await page.setViewportSize({ width: 1024, height: 768 });
      await expectSharedDesktopLayout();
    }

    if (stepIndex < campaign.steps.length - 1) {
      await page.getByRole("button", { name: "Next question" }).click();
    }
  }
});

test("play removes the image-reporting control and uses XP-only feedback", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Flag an issue/ })).toHaveCount(0);
  await chooseOnlyMode(page, "True/False");
  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  const feedback = page.getByLabel("Answer feedback");
  await expect(feedback).toBeVisible();
  await expect(feedback).toContainText(/\+\d+ XP/);
  await expect(feedback).not.toContainText(/glow/i);
  await expect(feedback.getByRole("button", { name: /Next|Finish round/ })).toBeVisible();
});

test("quiz removes duplicate topic, score, progress, and heat-meter clutter", async ({ page }) => {
  await chooseOnlyMode(page, "Quiz Run");
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");

  const card = page.locator("[data-question-card]");
  const photo = page.locator("[data-question-photo]");
  await expect(card.getByText("Round 1", { exact: true })).toBeVisible();
  await expect(card.getByText("Spicy Peppers", { exact: true })).toHaveClass("sr-only");
  await expect(card.getByText(/^\d+\/\d+$/)).toHaveCount(0);
  await expect(photo.getByText(/\d+\/\d+ right/i)).toHaveCount(0);

  const choices = page.getByLabel("Answer choices").getByRole("button");
  await choices.first().click();
  if (await page.getByLabel("Answer feedback").count() === 0) await choices.last().click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  await expect(card.getByText("Pepper meter", { exact: true })).toHaveCount(0);
});

test("head to head comparison images can submit an answer", async ({ page }) => {
  await chooseOnlyMode(page, "Head to Head");

  await expect(page.getByRole("button", { name: /^Choose [AB]:/ })).toHaveCount(2);
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
  await expect(page.getByRole("heading", { name: /There (?:is|are) \d+ .* plants?\. Each plant grows \d+ peppers?\. How many peppers/ })).toBeVisible();
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

test("building answers keep location teaching in the round instead of repeating it in feedback", async ({ page }) => {
  await chooseOnlyMode(page, "True/False");
  await chooseOnlyBuiltInTopic(page, "Sky Scrapers");

  await expect(page.getByLabel("Where in the world")).toHaveCount(0);
  await expect(page.getByLabel("World map")).toBeVisible();
  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();

  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  await expect(page.getByLabel("Where in the world")).toHaveCount(0);
  await expect(page.getByLabel("World map")).toHaveCount(1);
});

test("bridge pack feedback does not repeat a location recap", async ({ page }) => {
  await chooseOnlyMode(page, "True/False");
  await chooseOnlyBuiltInTopic(page, "Bridges & Tunnels");

  await expect(page.getByLabel("Where in the world")).toHaveCount(0);
  await page.getByRole("button", { name: /^(True|False)$/ }).first().click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  await expect(page.getByLabel("Where in the world")).toHaveCount(0);
});

test("peek rounds reset their reveal count after skip", async ({ page }) => {
  await chooseOnlyBuiltInTopic(page, "Space Universe");
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
  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  await expect(page.getByLabel("Where in the world")).toHaveCount(0);
  await expect(page.getByLabel("World map")).toHaveCount(0);
});

test("geo finder stays inside the selected topic", async ({ page }) => {
  await chooseOnlyBuiltInTopic(page, "Spicy Peppers");
  await chooseOnlyMode(page, "Geo Finder");

  const seenPrompts = new Set<string>();
  for (let round = 0; round < 6; round += 1) {
    await expect(page.getByText("Spicy Peppers", { exact: true })).toBeVisible();
    const heading = page.getByRole("heading", { name: /^Where on the world map does/ });
    await expect(heading).toBeVisible();
    const prompt = await heading.textContent();
    expect(prompt).toBeTruthy();
    expect(seenPrompts.has(prompt ?? "")).toBe(false);
    seenPrompts.add(prompt ?? "");
    await expect(page.getByText("Tallest Mountains", { exact: true })).toHaveCount(0);
    const pinBoxes = await page.getByRole("button", { name: /^Choose map pin/ }).evaluateAll((pins) => pins.map((pin) => {
      const box = pin.getBoundingClientRect();
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    }));
    expect(pinBoxes).toHaveLength(4);
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
  await page.getByRole("button", { name: /^Collection/ }).click();

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

  await expect(collection.getByRole("button", { name: "Show all 164 cards" })).toBeVisible();
  expect(await collection.getByText("Locked card", { exact: true }).count()).toBeLessThan(20);
  await expect(collection.getByText("WikiPepper", { exact: true })).not.toBeVisible();

  const pepperGuides = collection.getByText("Open pepper field guide", { exact: true });
  expect(await pepperGuides.count()).toBeGreaterThan(1);
  await pepperGuides.first().click();
  expect(await pepperGuides.evaluateAll((guides) => guides.every((guide) => guide.closest("details")?.open))).toBe(true);
  const pepperCard = pepperGuides.first().locator("xpath=ancestor::div[contains(@class, 'overflow-hidden')][1]");
  await expect(pepperCard.getByText("Heat level", { exact: true })).toBeVisible();
  await expect(pepperCard.getByText("Scoville range", { exact: true })).toBeVisible();
  await expect(pepperCard.getByText("Color", { exact: true })).toBeVisible();
  await expect(pepperCard.getByText("Type", { exact: true })).toBeVisible();

  await pepperGuides.nth(1).click();
  expect(await pepperGuides.evaluateAll((guides) => guides.every((guide) => !guide.closest("details")?.open))).toBe(true);
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
  await page.getByRole("button", { name: /^Collection/ }).click();

  const collections = page.getByLabel("Card collections");
  const pepperCategory = collections.getByRole("button", { name: /Spicy Peppers: .* cards collected/ });
  const sharkCategory = collections.getByRole("button", { name: /Shark Tank: .* cards collected/ });
  const buildingCategory = collections.getByRole("button", { name: /Sky Scrapers: .* cards collected/ });
  await expect(pepperCategory).toBeVisible();
  await expect(sharkCategory).toBeVisible();
  await expect(buildingCategory).toBeVisible();

  await pepperCategory.click();
  await expect(pepperCategory).toHaveAttribute("aria-pressed", "true");
  const pepperCollection = page.getByLabel("Spicy Peppers card collection");
  const rarityFilter = pepperCollection.getByLabel("Filter cards by rarity");
  await expect(pepperCollection.getByRole("img", { name: "Bell Pepper" })).toBeVisible();
  await expect(rarityFilter).toBeVisible();
  await expect(rarityFilter.getByRole("button", { name: /Show Common rarity/ })).toBeVisible();
  await expect(rarityFilter.getByRole("button", { name: /Show Uncommon rarity/ })).toBeVisible();
  await expect(rarityFilter.getByRole("button", { name: /Show Rare rarity/ })).toBeVisible();
  await expect(rarityFilter.getByRole("button", { name: /Show Epic rarity/ })).toBeVisible();
  await rarityFilter.getByRole("button", { name: /Show Epic rarity/ }).click();
  await expect(pepperCollection.getByRole("img", { name: "Bell Pepper" })).toHaveCount(0);
  await rarityFilter.getByRole("button", { name: /Show all rarities/ }).click();
  await expect(pepperCollection.getByRole("img", { name: "Bell Pepper" })).toBeVisible();
  await expect(page.getByLabel("Shark Tank card collection")).toHaveCount(0);

  await sharkCategory.click();
  await expect(sharkCategory).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Shark Tank card collection").getByRole("img", { name: "Great White Shark" })).toBeVisible();
  await expect(page.getByLabel("Shark Tank card collection").getByLabel("Filter cards by rarity")).toBeVisible();
  await expect(page.getByLabel("Spicy Peppers card collection")).toHaveCount(0);

  await buildingCategory.click();
  await expect(buildingCategory).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Sky Scrapers card collection").getByLabel("Filter cards by rarity")).toHaveCount(0);
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
  await expect(page.getByLabel(`Selected position 1: ${hottest.title}`)).toBeVisible();
  await expect(cardButtons.nth(hottest.index)).toHaveAttribute("aria-pressed", "true");

  await cardButtons.nth(hottest.index).click();
  await expect(page.getByLabel("Selected position 1: empty")).toBeVisible();
  await expect(cardButtons.nth(hottest.index)).toHaveAttribute("aria-pressed", "false");

  await cardButtons.nth(hottest.index).click();
  await expect(page.getByLabel(`Selected position 1: ${hottest.title}`)).toBeVisible();

  for (const card of cards.filter((item) => item.index !== hottest.index)) {
    await cardButtons.nth(card.index).click();
  }
  await page.getByRole("button", { name: "Check order" }).click();
  await expect(page.getByLabel(`Sort slot ${cards.length}: ${hottest.title}`)).toBeVisible();
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

  await page.getByRole("button", { name: /^Collection/ }).click();
  const collection = page.getByText("Collection", { exact: true }).locator("xpath=ancestor::section[1]");
  await expect(collection.getByRole("img", { name: "Habanero", exact: true })).toBeVisible();
});

test("playable dinosaur pack appears in first-class topics", async ({ page }) => {
  await topicsControl(page).click();
  const dinosaurTopic = topicsTray(page).getByRole("button", { name: "Dinosaur Lab", exact: true });
  await expect(dinosaurTopic).toBeVisible();
  await expect(dinosaurTopic).toHaveAttribute("aria-pressed", "true");
  await topicsControl(page).click();

  await chooseOnlyBuiltInTopic(page, "Dinosaur Lab");
  await expect(page.getByText("Dinosaur Lab", { exact: true })).toBeVisible();
});

test("Hot Sauces Head to Head compares the number of pepper varieties", async ({ page }) => {
  await chooseOnlyMode(page, "Head to Head");
  await chooseOnlyBuiltInTopic(page, "Hot Sauces");

  await expect(page.getByRole("heading", { name: "Which one uses more pepper varieties?" })).toBeVisible();
  await expect(page.getByText("Pepper varieties", { exact: true })).toHaveCount(2);
  await expect(page.getByLabel("Answer choices").getByRole("button")).toHaveCount(2);
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

  await expect(page.getByRole("heading", { name: "Choose the category that gives your card its strongest advantage." })).toBeVisible();
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
  await expect(page.getByText(/Common|Uncommon|Rare|Epic/).first()).toBeVisible();
  await expect(page.getByText("Natural roots")).toHaveCount(0);
});

test("game type tray matches Topics and fits on mobile", { tag: "@mobile" }, async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile viewport coverage");

  await modeControl(page).click();
  const menu = modeTray(page);
  await expect(menu).toBeVisible();
  await expect(mixOption(page, "Quiz Run")).toBeVisible();
  await expect(mixOption(page, "Quiz Run")).toHaveAttribute("aria-pressed", "true");

  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
});
