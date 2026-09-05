import { expect, test } from "@playwright/test";
import { loadPlayablePacks } from "../../src/lib/pack-loader";
import { packToPlayableDeck } from "../../src/lib/pack-adapter";
import { poolForDifficulty } from "../../src/lib/difficulty-pool";
import { buildFactRoundFromCards, buildNumberRoundFromCards, buildOddRoundFromCards, buildSortRoundFromCards, buildTopTrumpRoundFromCards, orderCollectionCardsForCategory } from "../../src/lib/game-modes";

const auditedIds = ["dinosaurs", "tallest-mountains", "hot-sauces", "bridges-and-tunnels"];
const packs = loadPlayablePacks().filter((pack) => auditedIds.includes(pack.id));

test("audited packs retain card-level provenance and explicit measurement scope", { tag: "@logic" }, () => {
  expect(packs).toHaveLength(4);
  for (const pack of packs) for (const card of pack.cards) {
    expect(card.metadata?.sources?.length, `${pack.id}/${card.id} sources`).toBeGreaterThan(0);
    expect(card.metadata?.accuracyNote, `${pack.id}/${card.id} uncertainty`).toBeTruthy();
    for (const stat of card.stats) expect(stat.note, `${pack.id}/${card.id}/${stat.id} scope`).toBeTruthy();
  }
  const dinosaurs = packs.find((pack) => pack.id === "dinosaurs")!;
  for (const card of dinosaurs.cards) {
    expect(card.stats.some((stat) => stat.id === "height")).toBe(false);
    expect(["herbivore", "carnivore", "omnivore"]).not.toContain(card.metadata!.taxonomyGroup);
    if (card.metadata?.taxonomyGroup === "pterosaur") {
      expect(card.stats.some((stat) => stat.id === "wingspan")).toBe(true);
      expect(card.stats.some((stat) => stat.id === "length")).toBe(false);
    }
    for (const stat of card.stats.filter((stat) => stat.id === "weight")) expect(stat.unit).toBe("tonnes");
  }
  expect(dinosaurs.cards.find((card) => card.id === "archaeopteryx")!.stats.find((stat) => stat.id === "weight")!.value).toBeLessThan(0.001);
  const mountains = packs.find((pack) => pack.id === "tallest-mountains")!;
  for (const id of ["mount-fuji", "mauna-kea", "mount-kosciuszko"]) {
    expect(mountains.cards.find((card) => card.id === id)!.stats.some((stat) => stat.id === "first-ascent-year")).toBe(false);
  }
  expect(mountains.cards.find((card) => card.id === "mount-fuji")!.categories).not.toContain("Japanese Alps");
});

test("unknown sauce heat stays unknown and ingredient heat is a separate comparison", { tag: "@logic" }, () => {
  const pack = packs.find((pack) => pack.id === "hot-sauces")!;
  for (const id of ["marie-sharps-belizean-heat", "nandos-hot-peri-peri", "akabanga-chili-oil", "lao-gan-ma-spicy-chili-crisp", "fly-by-jing-sichuan-chili-crisp", "lee-kum-kee-chiu-chow-oil", "s-b-la-yu-chili-oil", "chile-crunch-original"]) {
    expect(pack.cards.find((card) => card.id === id)!.stats.some((stat) => stat.id.includes("scoville"))).toBe(false);
  }
  expect(pack.cards.find((card) => card.id === "cholula-original")!.stats.find((stat) => stat.id === "scoville")!.value).toBe(2000);
  expect(pack.cards.find((card) => card.id === "tabasco-original")!.stats.find((stat) => stat.id === "scoville")!.value).toBe(5000);
  const ingredient = pack.cards.find((card) => card.id === "habamix-sorrento")!;
  expect(ingredient.stats.find((stat) => stat.id === "pepper-scoville")?.note).toContain("not comparable");
  const deck = packToPlayableDeck(pack);
  expect(deck.cards).toHaveLength(pack.cards.length);
  const ordered = orderCollectionCardsForCategory(deck.cards);
  const numeric = ordered.filter((card) => card.collectionSortValue !== undefined);
  expect(numeric.map((card) => card.collectionSortValue)).toEqual(numeric.map((card) => card.collectionSortValue).sort((a, b) => a! - b!));
});

test("pack comparisons never mix measurement types or duplicate unit conversions", { tag: "@logic" }, () => {
  for (const pack of packs) {
    const deck = packToPlayableDeck(pack);
    const byId = new Map(deck.cards.map((card) => [card.id, card]));
    const primaryKeys = (cards: readonly { id: string }[]) => new Set(cards.map((card) => {
      const stat = byId.get(card.id)!.stats[0];
      return `${stat.id}/${stat.unit}`;
    }));
    for (const difficulty of [1, 2, 3] as const) for (let seed = 1; seed <= 60; seed++) {
      const round = buildTopTrumpRoundFromCards(deck.cards, deck.id, difficulty, seed * 37);
      expect(round.player.stats.length).toBeGreaterThanOrEqual(2);
      expect(round.player.stats.map((stat) => stat.id)).toEqual(round.computer.stats.map((stat) => stat.id));
      expect(round.player.stats.map((stat) => stat.unit)).toEqual(round.computer.stats.map((stat) => stat.unit));
      expect(new Set(round.player.stats.map((stat) => stat.label)).size).toBe(round.player.stats.length);
      const sort = buildSortRoundFromCards(deck.cards, deck.id, difficulty, seed * 41);
      expect(primaryKeys(sort.cards).size).toBe(1);
      const odd = buildOddRoundFromCards(deck.cards, deck.id, difficulty, seed * 43);
      expect(primaryKeys(odd.cards).size).toBe(1);
      const fact = buildFactRoundFromCards(deck.cards, deck.id, difficulty, seed * 47);
      expect(fact.statement).not.toContain("undefined");
      if (fact.map) expect(fact.statement).toMatch(/^The location listed for /);
      if (pack.recommendedModes?.includes("number")) {
        const number = buildNumberRoundFromCards(deck.cards, deck.id, difficulty, seed * 53);
        expect(primaryKeys(number.cards).size).toBe(1);
        expect(number.unit).not.toContain("~");
      }
    }
  }
});

test("pack Top Trumps excludes matching stat IDs whose units disagree", { tag: "@logic" }, () => {
  const base = packToPlayableDeck(packs.find((pack) => pack.id === "bridges-and-tunnels")!).cards;
  const cards = base.slice(0, 3).map((card, index) => ({
    ...card,
    stats: [...card.stats.slice(0, 2), { id: "extra-length", label: "Extra length", value: 10 + index, display: "test", unit: ["ft", "m", "mi"][index], direction: "higher" as const }],
  }));
  for (let seed = 1; seed <= 20; seed++) {
    const round = buildTopTrumpRoundFromCards(cards, "bridges-and-tunnels", 3, seed);
    expect(round.player.stats.map((stat) => stat.id)).toEqual(["length-mi", "opened-year"]);
    expect(round.computer.stats.map((stat) => stat.id)).toEqual(["length-mi", "opened-year"]);
  }
});

test("Easy sauce comparisons keep singular pepper counts in the same measurement", { tag: "@logic" }, () => {
  const deck = packToPlayableDeck(packs.find((pack) => pack.id === "hot-sauces")!);
  const easy = poolForDifficulty(deck.cards, 1);
  const pepperCount = (card: typeof deck.cards[number]) => card.stats.find((stat) => stat.id === "pepper-varieties")!;
  const comparable = (first: typeof deck.cards[number], second: typeof deck.cards[number]) => {
    const left = pepperCount(first);
    const right = pepperCount(second);
    return first.id !== second.id && left.value !== right.value
      && left.unit === right.unit && left.direction === right.direction;
  };
  expect(easy.every((card) => card.metadata?.difficultyBand !== "hard")).toBe(true);
  const easyPairs = easy.flatMap((card, index) => easy.slice(index + 1).filter((other) => comparable(card, other)));
  expect(easyPairs.length, "Easy needs enough comparisons to avoid the full-deck fallback").toBeGreaterThanOrEqual(8);
  for (const card of deck.cards.filter((item) => pepperCount(item).value === 1)) {
    expect(deck.cards.some((other) => comparable(card, other)), `${card.id} can compete against a larger pepper count`).toBe(true);
    expect(pepperCount(card).display).not.toBe("1 types");
  }
});
