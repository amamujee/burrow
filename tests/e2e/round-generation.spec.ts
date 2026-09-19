import { expect, test } from "@playwright/test";
import { topicPacks } from "../../src/lib/game-data";
import {
  buildFactRound, buildFactRoundFromCards,
  buildGeoRound, buildGeoRoundFromCards, canBuildGeoRound, canBuildGeoRoundFromCards,
  buildNumberRound, buildNumberRoundFromCards,
  buildOddRound, buildOddRoundFromCards,
  buildRevealRound, buildRevealRoundFromCards,
  buildSortRound, buildSortRoundFromCards,
  buildTopTrumpRound, buildTopTrumpRoundFromCards,
} from "../../src/lib/game-modes";
import { packToPlayableDeck } from "../../src/lib/pack-adapter";
import { loadPlayablePacks } from "../../src/lib/pack-loader";
import { buildHeadToHeadSession, buildSession } from "../../src/lib/questions";

const decks = loadPlayablePacks().map(packToPlayableDeck);

for (const topic of Object.values(topicPacks)) {
  test(`${topic.id} can generate card rounds at every difficulty`, { tag: "@logic" }, () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let index = 0; index < 100; index += 1) {
        const seed = 20260430 + index * 137;
        for (const build of [buildFactRound, buildNumberRound, buildOddRound, buildRevealRound, buildSortRound, buildTopTrumpRound]) {
          expect(() => build(topic.id, difficulty, seed), `${build.name}/${difficulty}/${seed}`).not.toThrow();
        }
      }
    }
  });
}

for (const deck of decks) {
  test(`${deck.id} can generate card rounds at every difficulty`, { tag: "@logic" }, () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let index = 0; index < 100; index += 1) {
        const seed = 20260430 + index * 137;
        for (const build of [buildFactRoundFromCards, buildNumberRoundFromCards, buildOddRoundFromCards, buildRevealRoundFromCards, buildSortRoundFromCards, buildTopTrumpRoundFromCards]) {
          expect(() => build(deck.cards, deck.id, difficulty, seed), `${build.name}/${difficulty}/${seed}`).not.toThrow();
        }
      }
    }
  });
}

for (const topic of Object.values(topicPacks)) {
  test(`${topic.id} can generate quiz, comparison and available map rounds`, { tag: "@logic" }, () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let index = 0; index < 30; index += 1) {
        const seed = 20260430 + index * 137;
        expect(buildSession(topic.id, difficulty, seed, []).length).toBeGreaterThan(0);
        expect(buildHeadToHeadSession(topic.id, difficulty, seed, []).length).toBeGreaterThan(0);
        if (canBuildGeoRound(topic.id, difficulty)) expect(buildGeoRound(topic.id, difficulty, seed).id).toBeTruthy();
      }
    }
  });
}

for (const deck of decks) {
  test(`${deck.id} can generate available map rounds`, { tag: "@logic" }, () => {
    for (const difficulty of [1, 2, 3] as const) {
      if (!canBuildGeoRoundFromCards(deck.cards, difficulty)) continue;
      for (let index = 0; index < 30; index += 1) {
        expect(buildGeoRoundFromCards(deck.cards, deck.id, difficulty, 20260430 + index * 137).id).toBeTruthy();
      }
    }
  });
}
