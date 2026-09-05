import { expect, test } from "@playwright/test";
import { questionDepthForSelection } from "../../src/lib/difficulty";
import {
  buildNumberRound,
  buildNumberRoundFromCards,
  buildSortRoundFromCards,
  buildTopTrumpRoundFromCards,
  isSortOrderCorrect,
  type GenericKnowledgeCard,
} from "../../src/lib/game-modes";
import { packToPlayableDeck } from "../../src/lib/pack-adapter";
import { loadPlayablePacks } from "../../src/lib/pack-loader";

const rankedCards: GenericKnowledgeCard[] = Array.from({ length: 100 }, (_, index) => {
  const value = index + 1;
  return {
    id: `ranked-${value}`,
    topic: "fixture",
    title: `Card ${value}`,
    image: "/favicon.ico",
    imageAlt: `Card ${value}`,
    imageCredit: "Test fixture",
    statLabel: "Length",
    statValue: value,
    statDisplay: `${value} ft`,
    subStat: "Test card",
    fact: "Test fact.",
    qualityScore: 90,
    qualityFlags: [],
    categories: ["test"],
    stats: [
      { id: "length", label: "Length", value, display: `${value} ft`, direction: "higher" },
      { id: "mass", label: "Mass", value, display: `${value} lb`, direction: "higher" },
    ],
  };
});

test.describe("Hard difficulty calibration", { tag: "@logic" }, () => {
  test("Hard multiplication averages about twenty percent larger across a full seed sample", () => {
    const rounds = Array.from({ length: 1000 }, (_, index) => buildNumberRound("peppers", 3, index * 3 + 2));
    const average = rounds.reduce((sum, round) => sum + round.answer, 0) / rounds.length;
    // The same sample averaged 81.273 before this Hard-only recalibration.
    expect(average / 81.273).toBeGreaterThan(1.15);
    expect(average / 81.273).toBeLessThan(1.25);
    expect(Math.max(...rounds.flatMap((round) => round.termValues))).toBe(16);
  });

  test("built-in and loaded-pack multiplication stays truthful, bounded, and playable", () => {
    const builders = [
      ...(["peppers", "buildings", "sharks", "space", "jets"] as const).map((topic) => ({
        topic,
        build: (seed: number) => buildNumberRound(topic, 3, seed),
      })),
      ...loadPlayablePacks().map(packToPlayableDeck).filter((deck) => deck.recommendedModes.includes("number")).map((deck) => ({
        topic: deck.id,
        build: (seed: number) => buildNumberRoundFromCards(deck.cards, deck.id, 3, seed),
      })),
    ];
    for (const { topic, build } of builders) {
      for (let index = 0; index < 75; index += 1) {
        const seed = index * 3 + 2;
        const round = build(seed);
        const depth = questionDepthForSelection(3, seed);
        const [min, max] = depth === 1 ? [1, 6] : depth === 2 ? [2, 12] : [6, 16];
        expect(round.operation, topic).toBe("multiplication");
        expect(round.termValues, topic).toHaveLength(2);
        expect(round.termValues.every((value) => Number.isInteger(value) && value >= min && value <= max), topic).toBe(true);
        expect(round.answer, topic).toBe(round.termValues[0] * round.termValues[1]);
        expect(new Set(round.choices).size, topic).toBe(4);
        expect(round.choices.filter((choice) => choice === round.answer), topic).toHaveLength(1);
        expect(round.visual?.kind, topic).toBe("equal-groups");
      }
    }
  });

  test("Hard Sort uses closer values with four distinct cards and still grades the actual order", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 200; seed += 1) {
      const round = buildSortRoundFromCards(rankedCards, "fixture", 3, seed);
      const values = round.cards.map((card) => card.statValue);
      expect(round.cards).toHaveLength(4);
      expect(new Set(values).size).toBe(4);
      expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(63);
      expect(isSortOrderCorrect(round, round.answerIds)).toBe(true);
      expect(isSortOrderCorrect(round, [...round.answerIds].reverse())).toBe(false);
      round.cards.forEach((card) => seen.add(card.id));
    }
    // The window must rotate across the catalog, rather than always selecting
    // the same 64 candidates.
    expect(seen.size).toBeGreaterThan(64);
  });

  test("Hard Top Trumps avoids the most distant opponents without dropping shared stats", () => {
    for (let seed = 0; seed < 100; seed += 1) {
      const round = buildTopTrumpRoundFromCards(rankedCards, "fixture", 3, seed);
      const playerValue = round.player.stats[0].value;
      const distance = (value: number) => Math.abs(Math.log1p(playerValue) - Math.log1p(value));
      const opponentDistance = distance(round.computer.stats[0].value);
      const closerCandidates = rankedCards.filter((card) => card.id !== round.player.id && distance(card.statValue) < opponentDistance);
      expect(closerCandidates.length).toBeLessThan(64);
      expect(round.player.id).not.toBe(round.computer.id);
      expect(round.player.stats.map((stat) => stat.id)).toEqual(["length", "mass"]);
      expect(round.computer.stats.map((stat) => stat.id)).toEqual(["length", "mass"]);
    }
  });
});
