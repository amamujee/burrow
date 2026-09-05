import { expect, test } from "@playwright/test";
import { cardDiscoveryIdentities } from "../../src/lib/card-discovery";
import type { WorldLocation } from "../../src/lib/card-metadata";
import { poolForDifficulty } from "../../src/lib/difficulty-pool";
import {
  buildGeoChoicesForLocations,
  buildGeoRound,
  buildGeoRoundFromCards,
  collectionCards,
} from "../../src/lib/game-modes";
import { packToPlayableDeck } from "../../src/lib/pack-adapter";
import { loadPlayablePacks } from "../../src/lib/pack-loader";
import { discoveryShuffle } from "../../src/lib/random";

test("Geo keeps the existing seeded world questions and choice order", { tag: "@logic" }, () => {
  const fixtures = [
    {
      topic: "peppers", difficulty: 1, seed: 71, cardId: "sugar-rush-cream",
      choices: ["Wales, United Kingdom", "Japan", "Anaheim, United States", "Limpopo, South Africa"],
    },
    {
      topic: "peppers", difficulty: 3, seed: 71, cardId: "moruga-red",
      choices: ["Trinidad and Tobago", "Sindh, Pakistan", "Limpopo, South Africa", "North Queensland, Australia"],
    },
    {
      topic: "countries", difficulty: 3, seed: 907, cardId: "country-mali",
      choices: ["Mali", "Japan", "New Zealand", "Samoa"],
    },
    {
      topic: "buildings", difficulty: 3, seed: 201, cardId: "30-hudson-yards",
      choices: ["Mecca, Saudi Arabia", "Saint Petersburg, Russia", "New York City, United States", "Seoul, South Korea"],
    },
  ] as const;

  for (const fixture of fixtures) {
    const round = buildGeoRound(fixture.topic, fixture.difficulty, fixture.seed);
    expect(round.card.id).toBe(fixture.cardId);
    expect(round.mapRegion).toBe("world");
    expect(round.answerId).toBe(round.location.label);
    expect(round.choices.map((choice) => choice.id)).toEqual(fixture.choices);
  }
});

test("Geo preserves the US map preference and seeded pack choices", { tag: "@logic" }, () => {
  const pack = loadPlayablePacks().find((item) => item.id === "bridges-and-tunnels")!;
  const deck = packToPlayableDeck(pack);
  const round = buildGeoRoundFromCards(deck.cards, deck.id, 3, 61);

  expect(round.card.id).toBe("fort-mchenry-tunnel");
  expect(round.mapRegion).toBe("us");
  expect(round.answerId).toBe("Baltimore, Maryland, United States");
  expect(round.choices.map((choice) => choice.id)).toEqual([
    "Astoria, Oregon–Megler, Washington, United States",
    "Whittier, Alaska, United States",
    "Baltimore, Maryland, United States",
    "Cañon City, Colorado, United States",
  ]);
});

test("Geo skips an impossible first card and stops after the first playable card", { tag: "@logic" }, () => {
  let locationReads = 0;
  const locations: WorldLocation[] = [
    ["center", 0, 0], ["north", 22, 0], ["east", 0, 44], ["south", -22, 0], ["west", 0, -44],
  ].map(([label, latitude, longitude]) => ({
    label: String(label), countries: ["Example"], continents: ["Africa"],
    coordinates: [Number(latitude), Number(longitude)],
  }));
  const cards = locations.map((location) => ({
    ...collectionCards()[0], id: location.label, title: location.label, topic: "synthetic",
    metadata: {
      get location() {
        locationReads += 1;
        return location;
      },
    },
  }));
  const seed = 10;
  const order = discoveryShuffle(poolForDifficulty(cards, 1), seed + 1, [], cardDiscoveryIdentities);
  expect(order.map((card) => card.id)).toEqual(["center", "east", "south", "north", "west"]);
  expect(buildGeoChoicesForLocations(locations, locations[0], 1, seed)).toBeNull();

  // Prepare the reusable pool, then measure only this round's candidate work.
  buildGeoRoundFromCards(cards, "synthetic", 1, seed);
  locationReads = 0;
  const round = buildGeoRoundFromCards(cards, "synthetic", 1, seed);
  const roundLocationReads = locationReads;

  expect(round.card.id).toBe("east");
  expect(round.choices.map((choice) => choice.id)).toEqual(["west", "north", "south", "east"]);
  // Read the rejected center, the chosen east card, and its final location only.
  expect(roundLocationReads).toBe(3);
});
