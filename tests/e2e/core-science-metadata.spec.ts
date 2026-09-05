import { expect, test } from "@playwright/test";
import { buildings, jets, sharks, spaceCards } from "../../src/lib/game-data";
import { buildFactRound, buildGeoRound, buildNumberRound, buildOddRound, buildRevealRound, buildSortRound, buildTopTrumpRound, collectionCards } from "../../src/lib/game-modes";
import { buildHeadToHeadSession, buildSession } from "../../src/lib/questions";

test("core catalogs preserve every owned ID and explain measurement uncertainty", { tag: "@logic" }, () => {
  const catalogs = { buildings, sharks, space: spaceCards, jets };
  expect(Object.values(catalogs).map((cards) => cards.length)).toEqual([60, 50, 50, 50]);
  const collection = collectionCards();
  for (const [topic, cards] of Object.entries(catalogs)) for (const item of cards) {
    expect(collection.some((card) => card.topic === topic && card.id === item.id)).toBe(true);
    expect(item.metadata?.accuracyNote, item.id).toBeTruthy();
    expect(item.metadata?.sources?.length, item.id).toBeGreaterThan(0);
    expect(item.metadata?.taxonomyGroup, item.id).toBeTruthy();
    expect(item.metadata?.difficultyBand, item.id).toMatch(/^(easy|medium|hard)$/);
  }
  for (const shark of sharks) expect(shark.species, shark.id).toBeTruthy();
  const bull = sharks.find((card) => card.id === "bull-shark")!;
  const zambezi = sharks.find((card) => card.id === "zambezi-shark")!;
  expect(zambezi.species).toBe(bull.species);
  expect(zambezi.metadata?.imageDistinctGroup).toBe(bull.metadata?.imageDistinctGroup);
  expect(zambezi.fact).toContain("same species");
  expect(sharks.find((card) => card.id === "dunkleosteus")!.metadata?.taxonomyGroup).toContain("not sharks");
});

test("unknown measurements remain visible but never become invented numeric quiz answers", { tag: "@logic" }, () => {
  const collection = collectionCards();
  for (const id of ["rise-tower", "dubai-creek-tower", "b-21-raider", "stethacanthus"]) {
    const card = collection.find((item) => item.id === id)!;
    expect(card).toBeTruthy();
    expect(card.statDisplay).toMatch(/Unknown|Not confirmed/i);
    expect(Number.isFinite(card.statValue)).toBe(false);
  }
  expect(jets.find((item) => item.id === "mirage-2000")!.rangeMiles).toBeNull();
  expect(sharks.filter((item) => item.speedMph !== null).map((item) => item.id)).toEqual(["shortfin-mako"]);
  for (const topic of ["buildings", "sharks", "jets"] as const) for (const difficulty of [1, 2, 3] as const) for (let seed = 1; seed <= 35; seed++) {
    const sort = buildSortRound(topic, difficulty, seed * 31);
    const number = buildNumberRound(topic, difficulty, seed * 37);
    expect(sort.cards.every((card) => Number.isFinite(card.statValue))).toBe(true);
    expect(number.termValues.every(Number.isFinite)).toBe(true);
    expect(Number.isFinite(number.answer)).toBe(true);
    expect(JSON.stringify([sort, number])).not.toMatch(/NaN|undefined|Unknown mph|Not confirmed ft/);
    if (topic === "sharks") expect(sort.statLabel).not.toBe("Speed");
    const trumps = buildTopTrumpRound(topic, difficulty, seed * 41);
    for (const card of [trumps.player, trumps.computer]) {
      expect(card.stats.every((stat) => Number.isFinite(stat.value))).toBe(true);
      if (topic === "sharks") {
        expect(card.stats.some((stat) => stat.id === "weight")).toBe(false);
        expect(card.stats.find((stat) => stat.id === "power")?.label).toContain("game rating");
      }
    }
  }
  for (const topic of ["buildings", "sharks", "jets"] as const) for (const difficulty of [1, 2, 3] as const) {
    for (const question of [...buildSession(topic, difficulty, 7309, []), ...buildHeadToHeadSession(topic, difficulty, 7907, [])]) {
      expect(JSON.stringify(question)).not.toMatch(/NaN|undefined|Unknown mph|Not confirmed ft/);
      if (question.comparison) expect(question.comparison.every((card) => Number.isFinite(card.meterValue))).toBe(true);
      if (topic === "sharks") expect(question.kind).not.toBe("shark-faster");
    }
  }
});

test("Easy core rounds do not leak hard cards after source-driven recognition calibration", { tag: "@logic" }, () => {
  const rounds = [
    { cards: [buildGeoRound("buildings", 1, 20260579).card] },
    buildOddRound("buildings", 1, 20260599),
    (() => { const round = buildTopTrumpRound("buildings", 1, 20260609); return { cards: [round.player, round.computer] }; })(),
    buildSortRound("sharks", 1, 20260546),
    buildOddRound("sharks", 1, 20260596),
  ];
  for (const round of rounds) for (const card of round.cards) expect(card.metadata?.difficultyBand, card.title).not.toBe("hard");
  for (let seed = 1; seed <= 100; seed++) {
    const peek = buildRevealRound("sharks", 3, seed * 43);
    expect(peek.choices.filter((choice) => /Bull Shark/.test(choice)).length).toBeLessThanOrEqual(1);
    expect(buildFactRound("sharks", 3, seed * 47).statement).not.toContain("Not confirmed");
  }
});

test("space sorting compares physical quantities in common units and preserves real zero moon counts", { tag: "@logic" }, () => {
  const byId = new Map(spaceCards.map((card) => [card.id, card]));
  for (let seed = 1; seed <= 300; seed++) {
    const round = buildSortRound("space", 3, seed * 53);
    for (const card of round.cards) {
      const item = byId.get(card.id)!;
      if (round.statLabel === "Size") expect(card.statValue).toBeCloseTo(item.diameterMiles ?? item.radiusSolar! * 864600, 5);
      if (round.statLabel === "Temperature") expect(card.statValue).toBeCloseTo(item.surfaceTempK ?? (item.meanSurfaceTempF! - 32) * 5 / 9 + 273.15, 5);
      if (round.statLabel === "Distance") expect(card.statValue).toBeCloseTo(item.distanceFromSunMillionMiles ?? item.distanceLightYears! * 5878625.373, 1);
      expect(Number.isFinite(card.statValue)).toBe(true);
    }
    const sorted = [...round.cards].sort((a, b) => a.statValue - b.statValue);
    expect(round.answerIds).toEqual(sorted.map((card) => card.id));
  }
  expect(byId.get("mercury")!.moons).toBe(0);
  expect(byId.get("venus")!.moons).toBe(0);
  expect(byId.get("jupiter")!.moons).toBe(115);
  expect(byId.get("saturn")!.moons).toBe(293);
  expect(byId.get("saturn")!.metadata?.accuracyNote).toContain("2026-09-05");
  expect(byId.get("earth")!.diameterMiles).toBe(7918);
  expect(byId.get("stephenson-2-18")!.imageSourceUrl).toContain("Stephenson");
  expect(byId.get("stephenson-2-18")!.imageSourceUrl).not.toContain("Antares");
  const concept = collectionCards().find((card) => card.id === "black-hole")!;
  expect(concept.statLabel).toBe("Object type");
  expect(concept.statDisplay).toBe("Concept");
});


test("all jets have factual references and preserve variant-specific performance limits", { tag: "@logic" }, () => {
  const byId = new Map(jets.map((jet) => [jet.id, jet]));
  for (const jet of jets) {
    expect(jet.metadata?.sources?.some((source) => !/image provenance/i.test(source.label) && !/commons\.wikimedia\.org\/wiki\/File:/i.test(source.url)), jet.id).toBe(true);
  }
  expect(byId.get("l-39-albatros")!.rangeMiles).toBe(621);
  expect(byId.get("l-39-albatros")!.maxSpeedMph).toBe(466);
  expect(byId.get("f-5")!.rangeMiles).toBe(1590);
  expect(byId.get("f-4-phantom-ii")!.maxSpeedMph).toBe(1485);
  expect(byId.get("f-ck-1")!.rangeMiles).toBe(1174);
  expect(byId.get("f-a-18-super-hornet")!.rangeMiles).toBe(1910);
  expect(byId.get("f-a-18-super-hornet")!.metadata?.accuracyNote).toContain("ferry");
  for (const id of ["fc-31", "hal-tejas", "j-10", "hongdu-l-15", "j-20", "f-117-nighthawk"]) {
    expect(byId.get(id)!.maxSpeedMph, id).toBeNull();
    expect(byId.get(id)!.rangeMiles, id).toBeNull();
  }
  for (let seed = 1; seed <= 150; seed++) {
    const round = buildSortRound("jets", 3, seed * 59);
    expect(round.cards.every((card) => Number.isFinite(card.statValue))).toBe(true);
    for (const card of round.cards) {
      expect(byId.get(card.id)!.maxSpeedMph, card.id).not.toBeNull();
      expect(byId.get(card.id)!.rangeMiles, card.id).not.toBeNull();
    }
  }
});
