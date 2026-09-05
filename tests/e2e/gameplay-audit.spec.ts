import { expect, test, type Page } from "@playwright/test";
import { topicIds } from "../../src/lib/game-data";
import { loadPlayablePacks } from "../../src/lib/pack-loader";

const knownTopics = [...topicIds, ...loadPlayablePacks().map((pack) => pack.id)];

const openHardTopic = async (page: Page, topic: string) => {
  await page.route("**/api/play-events", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "{\"ok\":true}" });
  });
  await page.addInitScript(({ selectedTopic, topics }) => {
    window.localStorage.clear();
    window.localStorage.setItem("burrow-profiles-v1", JSON.stringify({
      activeProfileId: "audit-player",
      knownTopics: topics,
      profiles: [{
        id: "audit-player",
        name: "Audit player",
        interests: [selectedTopic],
        progress: { difficulty: 3 },
      }],
    }));
  }, { selectedTopic: topic, topics: knownTopics });
  await page.goto("/play");
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
};

const chooseOnlyMode = async (page: Page, target: string) => {
  const control = page.getByRole("button", { name: /^Modes/ });
  await control.click();
  const tray = page.getByLabel("Choose game types");
  const targetButton = tray.getByRole("button", { name: target, exact: true });
  if (await targetButton.getAttribute("aria-pressed") !== "true") await targetButton.click();
  const selectedLabels = await tray.getByRole("button", { pressed: true }).evaluateAll((buttons) => buttons.map((button) => button.lastElementChild?.textContent ?? ""));
  for (const label of selectedLabels) {
    if (label.trim() !== target) await tray.getByRole("button", { name: label.trim(), exact: true }).click();
  }
  await control.click();
  await expect(page.getByLabel("Preparing the next round")).toBeHidden();
};

const savedScore = (page: Page) => page.evaluate(() => {
  const state = JSON.parse(window.localStorage.getItem("burrow-profiles-v1") ?? "{}");
  const progress = state.profiles.find((profile: { id: string }) => profile.id === state.activeProfileId).progress;
  return { answered: progress.answered, correct: progress.correct };
});

test.describe("gameplay audit regressions", { tag: ["@browser", "@mobile"] }, () => {
  for (const topic of ["buildings", "sharks", "jets"]) {
    test(`${topic} subtraction keeps its solution hidden and photos do not submit answers`, async ({ page, isMobile }) => {
      await openHardTopic(page, topic);
      await chooseOnlyMode(page, "Quiz Run");
      const prompt = page.getByRole("heading", { name: /How much (taller|longer|faster)/ });
      for (let attempt = 0; attempt < 24 && await prompt.count() === 0; attempt += 1) {
        await page.getByRole("button", { name: "Skip question" }).click();
      }
      await expect(prompt).toBeVisible();

      const quantities = [...(await prompt.innerText()).matchAll(/about ([\d,]+) (ft|mph)/g)];
      expect(quantities).toHaveLength(2);
      const difference = Math.abs(Number(quantities[0][1].replaceAll(",", "")) - Number(quantities[1][1].replaceAll(",", "")));
      const answer = `${difference.toLocaleString("en-US")} ${quantities[0][2]}`;
      const photo = page.locator("[data-question-photo]");

      await expect(photo.locator("[data-question-photo-stat]")).toHaveCount(0);
      await expect(photo.getByRole("button")).toHaveCount(0);
      const firstPhoto = photo.getByRole("img").first();
      await firstPhoto.scrollIntoViewIfNeeded();
      const bounds = await firstPhoto.boundingBox();
      expect(bounds).not.toBeNull();
      // A narrow photo can have its caption over the center. Tap the visible
      // card naturally, including that overlay, rather than requiring the img
      // element itself to receive the pointer event.
      const x = bounds!.x + bounds!.width / 2;
      const y = bounds!.y + bounds!.height / 2;
      if (isMobile) await page.touchscreen.tap(x, y);
      else await page.mouse.click(x, y);
      await expect(page.getByLabel("Answer feedback")).toHaveCount(0);
      await expect.poll(() => savedScore(page)).toEqual({ answered: 0, correct: 0 });

      await page.getByLabel("Answer choices").getByRole("button", { name: answer, exact: true }).click();
      await expect(page.getByLabel("Answer feedback")).toBeVisible();
      await expect(photo.locator("[data-question-photo-stat]")).toHaveText(answer);
      await expect.poll(() => savedScore(page)).toEqual({ answered: 1, correct: 1 });
    });
  }

  for (const { topic, promptPattern } of [
    { topic: "buildings", promptPattern: /^(?:About how tall|How tall|(?:About what|What) is .*(?:height|spire))/ },
    { topic: "peppers", promptPattern: /Scoville score range|Which SHU range|Read every range/ },
  ]) {
    test(`${topic} numeric recall reveals the photo statistic only after answering`, async ({ page }) => {
      await openHardTopic(page, topic);
      await chooseOnlyMode(page, "Quiz Run");
      const prompt = page.getByRole("heading", { name: promptPattern });
      for (let attempt = 0; attempt < 24 && await prompt.count() === 0; attempt += 1) {
        await page.getByRole("button", { name: "Skip question" }).click();
      }
      await expect(prompt).toBeVisible();
      const photoStat = page.locator("[data-question-photo-stat]");
      await expect(photoStat).toHaveCount(0);
      await page.getByLabel("Answer choices").getByRole("button").first().click();
      await expect(page.getByLabel("Answer feedback")).toBeVisible();
      await expect(photoStat).toBeVisible();
      await expect.poll(async () => (await savedScore(page)).answered).toBe(1);
    });
  }

  test("Head to Head still accepts the correct comparison photo", async ({ page }) => {
    await openHardTopic(page, "buildings");
    await chooseOnlyMode(page, "Head to Head");
    const cards = page.getByRole("button", { name: /^Choose [AB]:/ });
    await expect(cards).toHaveCount(2);
    const heights = (await cards.allTextContents()).map((text) => {
      const match = text.match(/([\d,]+)\s*ft/);
      expect(match).not.toBeNull();
      return Number(match![1].replaceAll(",", ""));
    });
    await cards.nth(heights[0] > heights[1] ? 0 : 1).click();
    await expect(page.getByLabel("Answer feedback")).toBeVisible();
    await expect.poll(() => savedScore(page)).toEqual({ answered: 1, correct: 1 });
  });

  test("pack comparison photos honor the same clue retry as answer buttons", async ({ page }) => {
    await openHardTopic(page, "hot-sauces");
    await chooseOnlyMode(page, "Head to Head");
    const cards = page.getByRole("button", { name: /^Choose [AB]:/ });
    await expect(cards).toHaveCount(2);
    const counts = (await cards.allTextContents()).map((text) => {
      const match = text.match(/Listed pepper types\s*(\d+)/);
      expect(match).not.toBeNull();
      return Number(match![1]);
    });
    const correctIndex = counts[0] > counts[1] ? 0 : 1;
    const wrongPhoto = cards.nth(1 - correctIndex);
    await wrongPhoto.click();
    await expect(page.getByText("One more guess", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Answer feedback")).toHaveCount(0);
    await expect(wrongPhoto).toBeDisabled();
    await expect.poll(() => savedScore(page)).toEqual({ answered: 0, correct: 0 });

    await cards.nth(correctIndex).click();
    await expect(page.getByLabel("Answer feedback")).toBeVisible();
    await expect.poll(() => savedScore(page)).toEqual({ answered: 1, correct: 1 });
  });
});
