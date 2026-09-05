import { expect, test } from "@playwright/test";
import { loadPlayablePacks } from "../../src/lib/pack-loader";
import { packToPlayableDeck } from "../../src/lib/pack-adapter";
import { buildGeoRoundFromCards, canBuildGeoRoundFromCards, modeOptions } from "../../src/lib/game-modes";
import { isUsMapLocation, usMapDistance, usMapPoint } from "../../src/lib/us-map";
import usStates from "../../src/lib/us-map-data.json";

const pack = loadPlayablePacks().find((pack) => pack.id === "bridges-and-tunnels")!;
const deck = packToPlayableDeck(pack);

test("audited crossings retain the world collection and add 20 US landmarks", { tag: "@logic" }, () => {
  expect(pack.cards).toHaveLength(62);
  expect(pack.cards.filter((card) => card.metadata?.location?.countries.includes("United States"))).toHaveLength(38);
  const stateNames = new Set(usStates.map((state) => state.name));
  for (const card of pack.cards) {
    const location = card.metadata!.location!;
    expect(location.coordinates).toHaveLength(2);
    expect(new Set(card.categories).size).toBe(card.categories.length);
    expect(card.stats.find((stat) => stat.id === "length-mi")?.note).toBeTruthy();
    expect(card.stats.find((stat) => stat.id === "opened-year")?.note).toBeTruthy();
    if (location.countries.includes("United States")) {
      expect(location.states?.length).toBeGreaterThan(0);
      expect(location.states!.every((state) => stateNames.has(state))).toBe(true);
      expect(isUsMapLocation(location)).toBe(true);
    }
  }
  for (const id of ["monitor-merrimac-memorial-bridge-tunnel", "hampton-roads-bridge-tunnel", "james-river-bridge"]) {
    const card = pack.cards.find((card) => card.id === id)!;
    expect(card.metadata!.location!.states).toEqual(["Virginia"]);
  }
  for (const [id, length, opened] of [
    ["queensboro-bridge", 1.41, 1909], ["throgs-neck-bridge", 2.13, 1961],
    ["bayonne-bridge", 1.36, 1931], ["goethals-bridge", 1.35, 2017],
    ["governor-mario-cuomo-bridge", 3, 2017], ["james-river-bridge", 4.5, 1982],
  ] as const) {
    const card = pack.cards.find((card) => card.id === id)!;
    expect(card.stats.find((stat) => stat.id === "length-mi")!.value).toBe(length);
    expect(card.stats.find((stat) => stat.id === "opened-year")!.value).toBe(opened);
  }
  expect(pack.cards.find((card) => card.id === "james-river-bridge")!.metadata!.taxonomyGroup).toBe("vertical-lift");
  expect(pack.cards.find((card) => card.id === "goethals-bridge")!.imageSourceUrl).toContain("New_Goethals_Bridge");
});

test("US geography rounds use separated crossing locations and support Alaska", { tag: "@logic" }, () => {
  const usCards = deck.cards.filter((card) => isUsMapLocation(card.metadata?.location));
  let usRounds = 0, worldRounds = 0;
  for (const difficulty of [1, 2, 3] as const) {
    expect(canBuildGeoRoundFromCards(usCards, difficulty)).toBe(true);
    for (let seed = 1; seed <= 50; seed++) {
      const round = buildGeoRoundFromCards(deck.cards, deck.id, difficulty, seed * 61);
      if (round.mapRegion !== "us") { worldRounds++; continue; }
      usRounds++;
      expect(round.choices).toHaveLength(4);
      expect(round.choices.filter((choice) => choice.id === round.answerId)).toHaveLength(1);
      for (let i = 0; i < round.choices.length; i++) {
        expect(isUsMapLocation(round.choices[i].location)).toBe(true);
        for (let j = i + 1; j < round.choices.length; j++) {
          expect(usMapDistance(round.choices[i].location, round.choices[j].location)).toBeGreaterThanOrEqual(16);
        }
      }
    }
  }
  expect(usRounds).toBeGreaterThan(25);
  expect(worldRounds).toBeGreaterThan(10);
  const alaska = usMapPoint([60.78823, -148.80663])!;
  const hawaii = usMapPoint([21.3, -157.8])!;
  expect(alaska.x).toBeLessThan(27);
  expect(alaska.y).toBeGreaterThan(65);
  expect(hawaii.x).toBeGreaterThan(29);
  expect(hawaii.y).toBeGreaterThan(80);
  expect(usMapPoint([51.5, -0.1])).toBeNull();
  expect(usStates).toHaveLength(51);
});

test("US map explores states and grades the selected pin on desktop and mobile", { tag: ["@browser", "@mobile"] }, async ({ page }, testInfo) => {
  await page.route("**/api/play-events", (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true,"accepted":1}' }));
  await page.goto("/play");
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await page.getByRole("button", { name: /^Topics/ }).click();
  const topicTray = page.getByLabel("Choose topics");
  for (const button of await topicTray.getByRole("button").all()) {
    const selected = await button.getAttribute("aria-pressed");
    if (selected === null) continue;
    const isBridge = (await button.textContent())?.includes("Bridges & Tunnels");
    if ((selected === "true") !== isBridge) await button.click();
  }
  await page.getByRole("button", { name: /^Topics/ }).click();
  await page.getByRole("button", { name: /^Modes/ }).click();
  const modeTray = page.getByLabel("Choose game types");
  const geo = modeTray.getByRole("button", { name: "Geo Finder", exact: true });
  if (await geo.getAttribute("aria-pressed") !== "true") await geo.click();
  for (const option of modeOptions.filter((mode) => !["mix", "geo"].includes(mode.id))) {
    const button = modeTray.getByRole("button", { name: option.label, exact: true });
    if (await button.isEnabled() && await button.getAttribute("aria-pressed") === "true") await button.click();
  }
  await page.getByRole("button", { name: /^Modes/ }).click();
  const map = page.getByLabel("United States map", { exact: true });
  for (let i = 0; i < 12 && !(await map.isVisible()); i++) await page.getByRole("button", { name: "Skip question", exact: true }).click();
  await expect(map).toBeVisible();
  await expect(map.getByRole("button", { name: /^Explore / })).toHaveCount(51);
  await map.getByLabel("Find a US state").selectOption("Virginia");
  await expect(map.getByRole("button", { name: "Explore Virginia", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Answer feedback")).toHaveCount(0);
  const pins = map.getByRole("button", { name: /^Choose map pin/ });
  await expect(pins).toHaveCount(4);
  const boxes = await pins.evaluateAll((pins) => pins.map((pin) => {
    const box = pin.getBoundingClientRect();
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }));
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    expect(Math.hypot(boxes[i].x - boxes[j].x, boxes[i].y - boxes[j].y)).toBeGreaterThan(36);
  }
  await page.screenshot({ path: testInfo.outputPath("us-map.png"), fullPage: true });
  const names = await pins.evaluateAll((pins) => pins.map((pin) => pin.getAttribute("aria-label")!));
  await map.getByRole("button", { name: "Show world view" }).click();
  await expect(page.getByLabel("World map", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show US view" }).click();
  expect(await pins.evaluateAll((pins) => pins.map((pin) => pin.getAttribute("aria-label")!))).toEqual(names);
  const prompt = await page.getByRole("heading", { name: /^Where on the US map/ }).innerText();
  const answerCard = pack.cards.find((card) => prompt.includes(`${card.name} belong?`))!;
  const wrongPin = names.find((name) => !name.endsWith(`: ${answerCard.metadata!.location!.label}`))!;
  await map.getByRole("button", { name: wrongPin, exact: true }).click();
  await expect(page.getByLabel("Answer feedback")).toBeVisible();
  expect(await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("burrow-profiles-v1")!);
    return saved.profiles.find((profile: { id: string }) => profile.id === saved.activeProfileId).progress.modeStats.geo.correct;
  })).toBe(0);
});
