import { expect, test } from "@playwright/test";
import { countries, peppers, spaceCards } from "../../src/lib/game-data";
import { buildGeoRound, buildSortRound, buildTopTrumpRound, canBuildGeoRound, collectionCards } from "../../src/lib/game-modes";
import { poolForDifficulty } from "../../src/lib/difficulty-pool";
import areaSnapshot from "../../scripts/data/country-area-stats.json";

test("country measurements retain audited source scope and population dates", { tag: "@logic" }, () => {
  expect(countries).toHaveLength(200);
  const areas = areaSnapshot.countries as Record<string, { value: number; note: string }>;
  for (const country of countries) {
    expect(country.areaKm2, country.code).toBe(areas[country.code].value);
    expect(country.metadata.accuracyNote).toContain(areas[country.code].note);
    expect(country.metadata.sources?.length).toBeGreaterThanOrEqual(3);
    expect(country.fact).not.toMatch(/land area|square kilometres/);
    expect(country.metadata.location?.coordinates).toEqual([country.latitude, country.longitude]);
  }
  expect(countries.find((country) => country.code === "CA")?.areaKm2).toBe(9984670);
  expect(countries.find((country) => country.code === "US")?.areaKm2).toBe(9833516.8);
  expect(countries.find((country) => country.code === "CN")?.areaKm2).toBe(9600000);
  for (const code of ["CK", "NU"]) expect(countries.find((country) => country.code === code)?.populationNote).toContain("including visitors");
  const countryCards = collectionCards().filter((card) => card.topic === "countries");
  expect(countryCards.every((card) => card.details?.some((detail) => detail.label === "Area"))).toBe(true);
  for (let seed = 0; seed < 80; seed++) {
    const round = buildSortRound("countries", 3, seed);
    expect(["Population", "Area"]).toContain(round.statLabel);
    expect(round.cards.every((card) => Number.isFinite(card.statValue))).toBe(true);
  }
});

test("pepper factual references are separate from image credits and preserve uncertainty", { tag: "@logic" }, () => {
  expect(peppers).toHaveLength(262);
  for (const pepper of peppers) {
    expect(pepper.metadata.sources?.length, pepper.id).toBeGreaterThan(0);
    expect(pepper.metadata.accuracyNote, pepper.id).toBeTruthy();
    for (const source of pepper.metadata.sources ?? []) {
      expect(new URL(source.url).protocol).toMatch(/^https?:$/);
      expect(source.url).not.toMatch(/commons.wikimedia.org\/wiki\/File:|openai.com/);
    }
    if (pepper.scovilleStatus === "unpublished") expect(pepper.shuMax).toBeNull();
  }
});

test("space Top Trumps uses common physical units and never invents unknown zeroes", { tag: "@logic" }, () => {
  const seen = new Set<string>();
  for (let seed = 0; seed < 500; seed++) {
    const round = buildTopTrumpRound("space", 3, seed);
    for (const card of [round.player, round.computer]) {
      seen.add(card.id);
      const raw = spaceCards.find((space) => space.id === card.id)!;
      const size = card.stats.find((stat) => stat.id === "size");
      const temperature = card.stats.find((stat) => stat.id === "temperature");
      const moons = card.stats.find((stat) => stat.id === "moons");
      if (size) {
        expect(size.display).toContain(" mi");
        expect(size.value).toBeCloseTo(raw.diameterMiles ?? raw.radiusSolar! * 864600, 2);
      }
      if (temperature) {
        expect(temperature.display).toContain(" K");
        expect(temperature.value).toBeCloseTo(raw.surfaceTempK ?? (raw.meanSurfaceTempF! - 32) * 5 / 9 + 273.15, 2);
      }
      if (raw.moons === undefined) expect(moons).toBeUndefined();
      else if (moons) expect(moons.value).toBe(raw.moons);
    }
  }
  expect(seen.has("neptune")).toBe(true);
  expect(seen.has("mercury")).toBe(true);
});

test("Easy fallback fills from eligible familiar subjects without admitting hard cards", { tag: "@logic" }, () => {
  const items = Array.from({ length: 30 }, (_, index) => ({
    id: `item-${index}`,
    metadata: { difficultyBand: index < 4 ? "easy" as const : index < 12 ? "medium" as const : "hard" as const },
  }));
  const easy = poolForDifficulty(items, 1);
  expect(easy).toHaveLength(12);
  expect(easy.every((item) => item.metadata.difficultyBand !== "hard")).toBe(true);
  expect(poolForDifficulty(items, 3)).toHaveLength(30);
  expect(poolForDifficulty(items.filter((item) => item.metadata.difficultyBand === "hard"), 1).length).toBeGreaterThanOrEqual(4);
});

test("familiar aircraft retain Geo Finder with diverse in-category map distractors", { tag: "@logic" }, () => {
  expect(canBuildGeoRound("jets", 1)).toBe(true);
  for (let seed = 0; seed < 50; seed++) {
    const round = buildGeoRound("jets", 1, seed);
    expect(round.topic).toBe("jets");
    expect(round.card.metadata?.difficultyBand).not.toBe("hard");
    expect(round.choices).toHaveLength(4);
    expect(new Set(round.choices.map((choice) => choice.id)).size).toBe(4);
  }
});
