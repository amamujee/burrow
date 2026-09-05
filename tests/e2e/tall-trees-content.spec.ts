import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { packToPlayableDeck } from "../../src/lib/pack-adapter";
import { loadPlayablePacks } from "../../src/lib/pack-loader";
import {
  buildFactRoundFromCards,
  buildGeoRoundFromCards,
  buildNumberRoundFromCards,
  buildOddRoundFromCards,
  buildRevealRoundFromCards,
  buildSortRoundFromCards,
  isSortOrderCorrect,
} from "../../src/lib/game-modes";

const pack = loadPlayablePacks().find((item) => item.id === "tall-trees")!;
const deck = packToPlayableDeck(pack);
const byId = new Map(pack.cards.map((card) => [card.id, card]));
const stat = (id: string, statId: string) => byId.get(id)!.stats.find((item) => item.id === statId)!.value;
const additions = [
  "western-redcedar", "ponderosa-pine", "eastern-white-pine", "tulip-tree",
  "sugar-maple", "american-sycamore", "ginkgo", "dawn-redwood", "monkey-puzzle",
  "kapok", "african-baobab", "river-red-gum",
];

test.describe("Tall Trees content quality", { tag: "@logic" }, () => {
  test("expands real tree coverage with traceable local photographs", () => {
    expect(pack.cards).toHaveLength(31);
    expect(pack.cards.filter((card) => !card.categories.includes("reference"))).toHaveLength(27);
    for (const id of additions) {
      const card = byId.get(id)!;
      expect(card, id).toBeDefined();
      expect(card.categories, id).toContain("tree type");
      expect(card.metadata?.sources?.length, id).toBeGreaterThan(0);
      expect(card.metadata?.accuracyNote, id).toMatch(/height|ft| m /);
      expect(card.imageSourceUrl, id).toContain("commons.wikimedia.org/wiki/File:");
      expect(card.imageCredit, id).toMatch(/CC BY|Public domain/);
      expect(fs.existsSync(path.join(process.cwd(), "public", card.image)), id).toBe(true);
    }
    expect(new Set(additions.map((id) => byId.get(id)!.image)).size).toBe(additions.length);
    expect(pack.recommendedModes).not.toContain("trumps");
  });

  test("distinguishes individuals, species examples and historical measurements", () => {
    expect(stat("general-sherman", "height-m")).toBe(83.8);
    expect(stat("centurion", "height-m")).toBe(96.5);
    expect(stat("southern-blue-gum", "height-m")).toBe(90.7);
    expect(stat("manna-gum", "height-m")).toBe(50);
    expect(stat("menara-yellow-meranti", "height-m")).toBe(97.6);
    expect(byId.get("menara-yellow-meranti")!.metadata?.accuracyNote).toContain("(98.90 + 96.26) / 2");
    expect(byId.get("mountain-ash-type")!.metadata?.accuracyNote).toContain("historical");
    expect(byId.get("ravens-tower-sitka-spruce")!.name).toBe("Sitka Spruce");
    expect(byId.get("ravens-tower-sitka-spruce")!.metadata?.location?.countries).toContain("Canada");
    expect(byId.get("doerner-fir")!.image).toContain("doerner-fir-exact");
    expect(byId.get("ginkgo")!.categories).not.toContain("conifer");
    expect(byId.get("dawn-redwood")!.categories).toContain("deciduous");
    for (const card of pack.cards) {
      expect(card.metadata?.sources?.length, card.id).toBeGreaterThan(0);
      expect(card.metadata?.accuracyNote, card.id).toBeTruthy();
    }
  });

  test("keeps all derived height comparisons numerically consistent", () => {
    for (const card of pack.cards) {
      const feet = stat(card.id, "height-ft");
      const meters = stat(card.id, "height-m");
      expect(Math.abs(feet * 0.3048 - meters), card.id).toBeLessThanOrEqual(0.51);
      expect(stat(card.id, "dave-stacks"), card.id).toBe(Math.round(feet / 6));
      expect(stat(card.id, "giraffe-stacks"), card.id).toBe(feet < 18 ? Math.round(feet / 18 * 10) / 10 : Math.round(feet / 18));
    }
  });

  test("all recommended round types remain scoped, answerable and honest at each difficulty", () => {
    const cardIds = new Set(deck.cards.map((card) => card.id));
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 0; seed < 45; seed += 1) {
        const sort = buildSortRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(sort.cards.every((card) => cardIds.has(card.id))).toBe(true);
        expect(isSortOrderCorrect(sort, sort.answerIds)).toBe(true);
        expect(isSortOrderCorrect(sort, [...sort.answerIds].reverse())).toBe(false);
        const reveal = buildRevealRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(reveal.choices.filter((choice) => choice === reveal.answer)).toHaveLength(1);
        expect(cardIds.has(reveal.card.id)).toBe(true);
        const odd = buildOddRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(odd.cards.filter((card) => card.id === odd.answerId)).toHaveLength(1);
        const answerValue = odd.cards.find((card) => card.id === odd.answerId)!.statValue;
        expect(answerValue).toBe(Math.max(...odd.cards.map((card) => card.statValue)));
        const fact = buildFactRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(["True", "False"]).toContain(fact.answer);
        const number = buildNumberRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(number.choices.filter((choice) => choice === number.answer)).toHaveLength(1);
        expect(number.cards.every((card) => cardIds.has(card.id))).toBe(true);
        const geo = buildGeoRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(geo.choices.filter((choice) => choice.id === geo.answerId)).toHaveLength(1);
        expect(cardIds.has(geo.card.id)).toBe(true);
        expect(geo.location.countries.length).toBeGreaterThan(0);
      }
    }
  });
});
