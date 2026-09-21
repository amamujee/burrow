import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { loadPlayablePacks } from "../../src/lib/pack-loader";
import { packToPlayableDeck } from "../../src/lib/pack-adapter";
import { buildLandingTopicCards } from "../../src/lib/landing-topics";
import {
  buildFactRoundFromCards, buildGeoRoundFromCards, buildNumberRoundFromCards,
  buildOddRoundFromCards, buildRevealRoundFromCards, buildSortRoundFromCards,
  buildTopTrumpRoundFromCards, collectionOrderLabel, isSortOrderCorrect,
  modeOptions, orderCollectionCardsForCategory,
} from "../../src/lib/game-modes";
import source from "../../scripts/data/fruits.json";

const pack = loadPlayablePacks().find((candidate) => candidate.id === "fruits")!;
const deck = packToPlayableDeck(pack);
const weighted = new Map(source.cards.filter((card) => card.weight).map((card) => [card.id, card.weight!.grams]));

test.describe("Fruits", { tag: "@logic" }, () => {
  test("125 distinct fruit cards have local photos, provenance and complete profiles across six continents", () => {
    expect(pack.cards).toHaveLength(125);
    expect(new Set(pack.cards.map((card) => card.id)).size).toBe(125);
    expect(new Set(pack.cards.map((card) => card.name)).size).toBe(125);
    expect(new Set(source.cards.map((card) => card.location.continents[0])).size).toBe(6);
    expect(buildLandingTopicCards([pack]).find((card) => card.id === "fruits")?.title).toBe("Fruits");
    const hashes = new Set<string>();
    for (const card of source.cards) {
      const data = fs.readFileSync(path.join(process.cwd(), "public", card.image));
      expect(data.byteLength, card.id).toBeGreaterThan(1024);
      hashes.add(crypto.createHash("sha256").update(data).digest("hex"));
      expect(card.imageSourceUrl).toContain("commons.wikimedia.org/wiki/File:");
      expect(card.imageLicense).toMatch(/CC BY|Public domain/);
      expect(card.sourceFile).toBeTruthy();
      expect(card.sourceUrls.length).toBeGreaterThan(0);
      for (const field of [card.scientificName, card.origin, card.flavor, card.texture, card.availabilityBand, card.fact]) expect(field).toBeTruthy();
    }
    expect(hashes.size).toBe(125);
    expect(pack.cards.map((card) => card.id)).toEqual(expect.arrayContaining([
      "grapefruit", "mandarin", "clementine", "nectarine", "cantaloupe", "honeydew",
      "date", "cranberry", "avocado", "olive", "plantain", "asian-pear", "golden-kiwifruit",
    ]));
    for (const card of deck.cards) {
      expect(card.details?.map((detail) => detail.label)).toEqual(expect.arrayContaining(["Scientific name", "Origin / heritage", "Flavor", "Texture", "Finding it", "Comparison guide"]));
      expect(card.stats.filter((stat) => /rating/.test(stat.id))).toHaveLength(3);
      expect(card.stats.some((stat) => /countries|tastiness|brix/i.test(stat.label))).toBe(false);
    }
  });

  test("undocumented weight stays unknown, sorts last and never becomes a flavor-score weight", () => {
    expect(weighted.size).toBe(65);
    for (const card of deck.cards) {
      expect(card.statLabel).toBe("Example weight");
      if (weighted.has(card.id)) {
        expect(card.statValue).toBe(weighted.get(card.id));
        expect(card.stats[0].unit).toBe("g");
      } else {
        expect(Number.isNaN(card.statValue), card.id).toBe(true);
        expect(card.statDisplay).toBe("Not documented");
        expect(card.stats.some((stat) => stat.id === "weight-g")).toBe(false);
      }
    }
    const sorted = orderCollectionCardsForCategory(deck.cards);
    expect(sorted.slice(0, weighted.size).every((card) => weighted.has(card.id))).toBe(true);
    expect(sorted.slice(weighted.size).every((card) => !weighted.has(card.id))).toBe(true);
    expect(sorted.slice(0, weighted.size).map((card) => card.statValue)).toEqual([...weighted.values()].sort((a, b) => a - b));
    expect(sorted.slice(weighted.size).map((card) => card.title)).toEqual(sorted.slice(weighted.size).map((card) => card.title).sort((a, b) => a.localeCompare(b)));
    const tied = sorted.filter((card) => card.statValue === 1).map((card) => card.title);
    expect(tied).toEqual([...tied].sort((a, b) => a.localeCompare(b)));
    expect(orderCollectionCardsForCategory([...deck.cards].reverse()).map((card) => card.id)).toEqual(sorted.map((card) => card.id));
    expect(collectionOrderLabel(sorted)).toBe("Example weight · lightest to heaviest");
  });

  test("all difficulties generate fruit-only rounds with honest weights and matching comparisons", () => {
    const seen = new Set<string>();
    for (const difficulty of [1, 2, 3] as const) {
      for (let seed = 0; seed < 120; seed++) {
        const sort = buildSortRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(isSortOrderCorrect(sort, sort.answerIds)).toBe(true);
        expect(isSortOrderCorrect(sort, [...sort.answerIds].reverse())).toBe(false);
        const odd = buildOddRoundFromCards(deck.cards, deck.id, difficulty, seed);
        const number = buildNumberRoundFromCards(deck.cards, deck.id, difficulty, seed);
        for (const card of [...sort.cards, ...odd.cards, ...number.cards]) {
          expect(card.topic).toBe("fruits");
          expect(weighted.has(card.id), card.id).toBe(true);
          expect(card.statValue).toBeGreaterThan(0);
          if (number.operation !== "multiplication" && number.cards.includes(card)) expect(card.statValue).toBe(weighted.get(card.id));
        }
        expect(number.choices.filter((value) => value === number.answer)).toHaveLength(1);
        if (number.operation === "fit") {
          expect(number.prompt).toContain("weigh the same");
          expect(number.prompt).not.toContain("fit into");
        }
        const fact = buildFactRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(["True", "False"]).toContain(fact.answer);
        const reveal = buildRevealRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(reveal.choices.filter((choice) => choice === reveal.answer)).toHaveLength(1);
        const geo = buildGeoRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(geo.choices.filter((choice) => choice.id === geo.answerId)).toHaveLength(1);
        const trumps = buildTopTrumpRoundFromCards(deck.cards, deck.id, difficulty, seed);
        expect(trumps.player.stats.map((stat) => stat.id)).toEqual(trumps.computer.stats.map((stat) => stat.id));
        expect(trumps.player.stats.length).toBeGreaterThanOrEqual(3);
        for (const card of [trumps.player, trumps.computer, reveal.card, geo.card]) {
          expect(card.topic).toBe("fruits");
          seen.add(card.id);
        }
      }
    }
    for (let seed = 120; seed < 1000 && seen.size < 125; seed++) {
      seen.add(buildRevealRoundFromCards(deck.cards, deck.id, 3, seed).card.id);
    }
    expect(seen.size).toBe(125);
  });
});

const onlyMode = async (page: Page, target: string) => {
  await page.getByRole("button", { name: /^Modes/ }).click();
  const tray = page.getByLabel("Choose game types");
  const button = tray.getByRole("button", { name: target, exact: true });
  if (await button.getAttribute("aria-pressed") !== "true") await button.click();
  for (const mode of modeOptions.filter((mode) => mode.id !== "mix" && mode.label !== target)) {
    const other = tray.getByRole("button", { name: mode.label, exact: true });
    if (await other.isEnabled() && await other.getAttribute("aria-pressed") === "true") await other.click();
  }
  await page.getByRole("button", { name: /^Modes/ }).click();
  await expect(page.getByLabel("Preparing the next round")).toBeHidden();
};

test("Fruits opens, plays, and displays sourced profiles on tablet and mobile", { tag: ["@browser", "@mobile"] }, async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop") await page.setViewportSize({ width: 1024, height: 768 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/play-events", (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true,"accepted":1}' }));
  await page.goto("/");
  await expect(page.getByText("125 fruits, from sweet to surprising", { exact: true })).toBeVisible();
  await page.goto("/play");
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await page.getByRole("button", { name: /^Topics/ }).click();
  const tray = page.getByLabel("Choose topics");
  const fruit = tray.getByRole("button", { name: "Fruits", exact: true });
  if (await fruit.getAttribute("aria-pressed") !== "true") await fruit.click();
  for (const button of await tray.getByRole("button").all()) {
    if (!(await button.textContent())?.includes("Fruits") && await button.getAttribute("aria-pressed") === "true") await button.click();
  }
  await expect(fruit).toHaveAttribute("aria-pressed", "true");
  await expect(tray.getByRole("button", { pressed: true })).toHaveCount(1);
  await page.getByRole("button", { name: /^Topics/ }).click();
  await onlyMode(page, "Top Trumps");
  await expect(page.getByText("Sweetness rating", { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("fruits-trumps.png"), fullPage: true });
  await onlyMode(page, "Sort");
  await expect(page.getByText(/lowest example weight/)).toBeVisible();
  await page.getByRole("button", { name: "Skip question", exact: true }).click();
  await expect(page.getByLabel("Preparing the next round")).toBeHidden();
  await expect(page.getByLabel("Round could not load")).toHaveCount(0);
  await page.evaluate((fruitIds) => {
    const saved = JSON.parse(localStorage.getItem("burrow-profiles-v1")!);
    const active = saved.profiles.find((profile: { id: string }) => profile.id === saved.activeProfileId);
    active.progress.unlockedCards = fruitIds;
    localStorage.setItem("burrow-profiles-v1", JSON.stringify(saved));
  }, deck.cards.map((card) => `fruits:${card.id}`));
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await page.getByRole("button", { name: /^Collection/ }).click();
  const collection = page.getByLabel("Fruits card collection");
  await expect(collection).toBeVisible();
  await expect(collection.getByRole("button", { name: "Show all rarities (125 cards)" })).toBeVisible();
  await expect(collection.getByText("Example weight · lightest to heaviest", { exact: true })).toBeVisible();
  const titles = collection.locator("div.overflow-hidden.rounded-lg > div.p-2 > p:first-child");
  await expect(titles).toHaveText(orderCollectionCardsForCategory(deck.cards).map((card) => card.title));
  const newFruit = collection.locator("div.overflow-hidden.rounded-lg").filter({ has: page.getByText("Golden Kiwifruit", { exact: true }) });
  await newFruit.scrollIntoViewIfNeeded();
  await expect(newFruit.getByText("~98 g", { exact: true })).toBeVisible();
  const newPhoto = newFruit.getByRole("img", { name: "Golden Kiwifruit fruit", exact: true });
  await expect.poll(() => newPhoto.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await newFruit.screenshot({ path: testInfo.outputPath("fruits-new-card.png") });
  const lime = collection.locator("div.overflow-hidden.rounded-lg").filter({ has: page.getByText("Finger Lime", { exact: true }) });
  await expect(lime.getByText("Not documented", { exact: true })).toBeVisible();
  await lime.locator("summary").click();
  await expect(lime.getByText("Citrus australasica", { exact: true })).toBeVisible();
  await expect(lime.getByText("Tiny popping juice pearls", { exact: true })).toBeVisible();
  const photo = lime.getByRole("img", { name: "Finger Lime fruit", exact: true });
  await expect(photo).toHaveAttribute("data-original-src", "/burrow-assets/fruits/finger-lime.jpg");
  await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  expect(await lime.evaluate((card) => [...card.querySelectorAll("p, dt, dd")]
    .filter((text) => text.scrollWidth > text.clientWidth + 1)
    .map((text) => text.textContent))).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("fruits-collection.png") });
  await lime.screenshot({ path: testInfo.outputPath("fruits-profile.png") });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});
