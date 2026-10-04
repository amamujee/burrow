import { expect, test, type Page } from "@playwright/test";
import { countries } from "../../src/lib/game-data";
import type { WorldLocation } from "../../src/lib/card-metadata";
import { continentForLocations, continentMapPoint, continentRegions, isContinentRegion } from "../../src/lib/continent-map";
import outlines from "../../src/lib/continent-map-data.json";
import { mapRegionForLocations } from "../../src/lib/us-map";
import { buildGeoChoicesForLocations, buildGeoRound, buildRevealRoundFromCards, collectionCards, geoAnswerForLocation, geoChoiceMapDistance, geoChoiceSeparationForDifficulty, geoPointDistanceKm, modeOptions } from "../../src/lib/game-modes";
import { buildSession } from "../../src/lib/questions";

const locations = countries.map((country) => country.metadata.location!);
const countryLocation = (name: string) => locations.find((location) => location.label === name)!;

test("medium and hard country rounds stay inside each continent with distinct, reachable countries", { tag: "@logic" }, () => {
  const seen = new Set<string>();
  let mediumDistance = 0, hardDistance = 0;
  for (const location of locations) {
    const continent = continentForLocations([location]);
    if (!continent || continent === "Antarctica") continue;
    for (const difficulty of [2, 3] as const) {
      const choices = buildGeoChoicesForLocations([location], location, difficulty, 73)!;
      expect(choices, `${location.label} at difficulty ${difficulty}`).not.toBeNull();
      expect(choices).toHaveLength(4);
      expect(mapRegionForLocations(choices.map((choice) => choice.location)), location.label).toBe(continent);
      seen.add(continent);
      expect(new Set(choices.map((choice) => choice.location.countries[0])).size).toBe(4);
      expect(choices.filter((choice) => choice.id === location.label)).toHaveLength(1);
      const minimum = geoChoiceSeparationForDifficulty(difficulty, continent);
      const answer = geoAnswerForLocation(choices, location);
      for (const choice of choices) {
        expect(choice.label).toBe(choice.location.countries[0]);
        expect(outlines[continent].some((country) => country.name === choice.label), `${continent} outline for ${choice.label}`).toBe(true);
        if (choice !== answer) {
          const distance = geoPointDistanceKm(answer.point, choice.point);
          if (difficulty === 2) mediumDistance += distance; else hardDistance += distance;
        }
        for (const other of choices.filter((other) => other !== choice)) {
          expect(geoChoiceMapDistance(choice, other, continent), `${location.label}: ${choice.label}/${other.label}`).toBeGreaterThanOrEqual(minimum.mapPercent);
          expect(geoPointDistanceKm(choice.point, other.point)).toBeGreaterThanOrEqual(minimum.kilometers);
        }
      }
    }
  }
  expect(seen).toEqual(new Set(continentRegions.filter((region) => region !== "Antarctica")));
  expect(hardDistance).toBeLessThan(mediumDistance * 0.8);
});

test("broad origins and transcontinental locations retain their source meaning", { tag: "@logic" }, () => {
  const broad: WorldLocation = { label: "Andes, South America", countries: ["Peru", "Bolivia"], continents: ["South America"], coordinates: [-13, -73] };
  for (const location of [broad, countryLocation("Russia"), { label: "Antarctica", countries: [], continents: ["Antarctica"], coordinates: [-82, 0] } as WorldLocation]) {
    const choices = buildGeoChoicesForLocations([...locations, location], location, 3, 13)!;
    expect(geoAnswerForLocation(choices, location).label).toBe(location.label);
    expect(geoAnswerForLocation(choices, location).location.countries).toEqual(location.countries);
  }
  expect(buildGeoRound("peppers", 1, 71).mapRegion).toBe("world");
});

test("all seven detailed maps include real outlines and handle the date line and pole", { tag: "@logic" }, () => {
  for (const region of continentRegions) expect(outlines[region].length).toBeGreaterThan(0);
  for (const [region, name] of [["Africa", "Kenya"], ["Europe", "France"], ["Asia", "Japan"], ["North America", "Mexico"], ["South America", "Brazil"], ["Oceania", "Fiji"], ["Antarctica", "Antarctica"]] as const) {
    expect(outlines[region].find((country) => country.name === name)?.path.length).toBeGreaterThan(20);
  }
  const east = continentMapPoint("Oceania", [-17, 179]);
  const west = continentMapPoint("Oceania", [-17, -179]);
  expect(Math.abs(east.x - west.x)).toBeLessThan(3);
  expect(continentMapPoint("Antarctica", [-90, 0])).toEqual({ x: 50, y: 50 });
  expect(mapRegionForLocations([countryLocation("Japan"), countryLocation("France")])).toBe("world");
});

test("country answers grade consistently in Quiz, Geo and Peek while explanations keep the specific origin", { tag: "@logic" }, () => {
  const regions = new Set<string>();
  for (const topic of ["peppers", "buildings", "countries"] as const) {
    for (let seed = 0; seed < 12; seed++) {
      for (const question of buildSession(topic, 3, seed * 101, []).filter((question) => question.map)) {
        expect(question.choices).toContain(question.answer);
        expect(question.map!.answerId).toBe(question.answer);
        const region = mapRegionForLocations(question.map!.choices.map((choice) => choice.location));
        regions.add(region);
        if (isContinentRegion(region)) expect(question.map!.choices.every((choice) => choice.location.countries.length === 1)).toBe(true);
      }
      const geo = buildGeoRound(topic, 3, seed * 71);
      expect(geo.choices.some((choice) => choice.id === geo.answerId && choice.label === geo.answerLabel)).toBe(true);
      expect(geo.explanation).toContain(geo.location.label);
    }
  }
  expect(regions.has("Asia")).toBe(true);
  expect(regions.has("Europe")).toBe(true);
  const cards = collectionCards().filter((card) => card.topic === "buildings").map((card) => ({ ...card, categories: ["building"], stats: [] }));
  let mapped = 0;
  for (let seed = 0; seed < 20; seed++) {
    const round = buildRevealRoundFromCards(cards, "buildings", 3, seed * 43);
    if (round.map) {
      mapped++;
      expect(round.choices).toContain(round.answer);
      expect(round.map.answerId).toBe(round.answer);
    }
  }
  expect(mapped).toBeGreaterThan(0);
});

async function chooseCountriesGeo(page: Page) {
  await page.route("**/api/play-events", (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true,"accepted":1}' }));
  await page.goto("/play");
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await page.getByRole("button", { name: /^Topics/ }).click();
  const tray = page.getByLabel("Choose topics");
  const target = tray.getByRole("button", { name: /Countries/ });
  if (await target.getAttribute("aria-pressed") !== "true") await target.click();
  for (const button of await tray.getByRole("button").all()) {
    if (!(await button.textContent())?.includes("Countries") && await button.getAttribute("aria-pressed") === "true") await button.click();
  }
  await page.getByRole("button", { name: /^Topics/ }).click();
  await page.getByRole("button", { name: /^Modes/ }).click();
  const modes = page.getByLabel("Choose game types");
  const geo = modes.getByRole("button", { name: "Geo Finder", exact: true });
  if (await geo.getAttribute("aria-pressed") !== "true") await geo.click();
  for (const mode of modeOptions.filter((mode) => !["mix", "geo"].includes(mode.id))) {
    const button = modes.getByRole("button", { name: mode.label, exact: true });
    if (await button.isEnabled() && await button.getAttribute("aria-pressed") === "true") await button.click();
  }
  await page.getByRole("button", { name: /^Modes/ }).click();
  await page.getByRole("button", { name: "Hard", exact: true }).click();
  await expect(page.getByLabel("Preparing the next round")).toBeHidden();
}

for (const viewport of [null, { width: 820, height: 1180 }, { width: 1280, height: 720 }] as const) {
  test(`continent maps explore, switch, reset and grade country pins${viewport ? ` at ${viewport.width}x${viewport.height}` : ""}`, { tag: ["@browser", "@mobile"] }, async ({ page }, testInfo) => {
    if (viewport) await page.setViewportSize(viewport);
    await chooseCountriesGeo(page);
    const maps = page.locator('[aria-label$=" map"]').filter({ has: page.locator("[data-continent-map-plot]") });
    for (let attempt = 0; attempt < 12 && !(await maps.count()); attempt++) {
      await page.getByRole("button", { name: "Skip question", exact: true }).click();
      await expect(page.getByLabel("Preparing the next round")).toBeHidden();
    }
    const map = maps.first();
    await expect(map).toBeVisible();
    const region = await map.getByLabel("Map view").inputValue();
    const pins = map.getByRole("button", { name: /^Choose map pin/ });
    await expect(pins).toHaveCount(4);
    const mapBox = (await map.boundingBox())!;
    const plotBox = (await map.locator("[data-continent-map-plot]").boundingBox())!;
    const footerBox = (await map.getByText("Find the country, then choose its lettered pin.", { exact: true }).boundingBox())!;
    await page.screenshot({ path: testInfo.outputPath("continent-before-pins.png"), fullPage: true });
    expect(plotBox.width).toBeGreaterThan(250);
    expect(plotBox.y + plotBox.height).toBeLessThanOrEqual(mapBox.y + mapBox.height);
    expect(footerBox.y + footerBox.height).toBeLessThanOrEqual(mapBox.y + mapBox.height);
    const names = await pins.evaluateAll((pins) => pins.map((pin) => pin.getAttribute("aria-label")!));
    for (const pin of await pins.all()) await pin.click({ trial: true });
    const centers = await pins.evaluateAll((pins) => pins.map((pin) => { const r = pin.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }));
    for (let i = 0; i < centers.length; i++) for (let j = i + 1; j < centers.length; j++) expect(Math.hypot(centers[i][0] - centers[j][0], centers[i][1] - centers[j][1])).toBeGreaterThan(40);
    for (const button of await page.locator("[data-geo-choice]").all()) await expect(button).toContainText(/Pin [A-D]/);
    const firstCountry = names[0].split(": ")[1];
    await map.getByLabel("Find a country").selectOption(firstCountry);
    await expect(map.getByRole("button", { name: `Explore ${firstCountry}`, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("Answer feedback")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("continent-map.png"), fullPage: true });
    for (const continent of continentRegions) {
      await page.getByLabel("Map view", { exact: true }).selectOption(continent);
      await expect(page.getByLabel(`${continent} country boundaries`, { exact: true })).toBeVisible();
      if (continent === "Asia") {
        await expect(page.getByLabel("Find a country").getByRole("option", { name: "Japan", exact: true })).toHaveCount(1);
        await expect(page.getByLabel("Find a country").getByRole("option", { name: "Russia", exact: true })).toHaveCount(1);
        await expect(page.getByLabel("Find a country").getByRole("option", { name: "Brazil", exact: true })).toHaveCount(0);
      }
    }
    await expect(page.getByText("Antarctica has no countries.", { exact: true })).toBeVisible();
    await page.getByLabel("Map view", { exact: true }).selectOption("world");
    await expect(page.getByLabel("World map", { exact: true }).getByRole("button", { name: /^Choose map pin/ })).toHaveCount(4);
    await page.getByLabel("Map view", { exact: true }).selectOption(region);
    expect(await pins.evaluateAll((pins) => pins.map((pin) => pin.getAttribute("aria-label")!))).toEqual(names);
    const heading = await page.getByRole("heading", { name: /^Where on the/ }).innerText();
    const answer = countries.find((country) => heading.includes(`${country.name} belong?`))!;
    await map.getByRole("button", { name: names.find((name) => name.endsWith(`: ${answer.name}`))!, exact: true }).click();
    await expect(page.getByLabel("Answer feedback")).toBeVisible();
    expect(await page.evaluate(() => { const saved = JSON.parse(localStorage.getItem("burrow-profiles-v1")!); return saved.profiles.find((p: { id: string }) => p.id === saved.activeProfileId).progress.modeStats.geo.correct; })).toBe(1);
    await expect(pins.first()).toBeDisabled();
    await page.getByLabel("Map view", { exact: true }).selectOption("Antarctica");
    await page.getByRole("button", { name: /^(Next card|Finish round)/ }).click();
    await expect(page.getByLabel("Preparing the next round")).toBeHidden();
    await expect(page.getByLabel("Map view", { exact: true })).not.toHaveValue("Antarctica");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
