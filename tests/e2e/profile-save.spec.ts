import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { topicIds } from "../../src/lib/game-data";
import { modeOptions } from "../../src/lib/game-modes";
import { createProfileSave, maxSaveBytes, parseProfileSave, profilesKey, type ProfilesState, type Progress } from "../../src/lib/profile-save";

const progressFixture = (): Progress => ({
  xp: 1234, level: 11, streak: 3, bestStreak: 9, sessions: 7, correct: 70, answered: 87, challengeMilestone: 80, difficulty: 2,
  // Preserve both modern IDs and older card names, including unselected pack categories.
  seenIds: ["pepper-question"], unlockedCards: ["peppers:jalapeno", "Jalapeno", "Great White Shark", "Hyperion", "bridges-and-tunnels:golden-gate-bridge"],
  learningHistory: [{ exactKey: "pepper-question", conceptKey: "peppers:compare", subjectKeys: ["peppers:jalapeno"], mode: "quiz", topic: "peppers", outcome: "incorrect", sequence: 87 }],
  topicWins: Object.fromEntries(topicIds.map((id) => [id, id === "peppers" ? 70 : 0])) as Progress["topicWins"],
  topicStats: Object.fromEntries(topicIds.map((id) => [id, { correct: id === "peppers" ? 70 : 0, answered: id === "peppers" ? 87 : 0 }])),
  modeWins: Object.fromEntries(modeOptions.map(({ id }) => [id, id === "quiz" ? 70 : 0])) as Progress["modeWins"],
  modeStats: Object.fromEntries(modeOptions.filter(({ id }) => id !== "mix").map(({ id }) => [id, { correct: id === "quiz" ? 70 : 0, answered: id === "quiz" ? 87 : 0, collected: id === "quiz" ? 4 : 0 }])) as Progress["modeStats"],
});
const stateFixture = (): ProfilesState => ({
  activeProfileId: "kal",
  knownTopics: [...topicIds],
  profiles: [
    { id: "other", name: "Other player", interests: ["space"], progress: { ...progressFixture(), xp: 240, level: 3 } },
    { id: "kal", name: "Kal", interests: ["peppers", "sharks"], progress: progressFixture() },
  ],
});
const saveContents = (profilesState = stateFixture()) => JSON.stringify({ format: "burrow-save", version: 1, exportedAt: "2026-09-20T15:00:00.000Z", profilesState });

test.describe("save validation", { tag: "@logic" }, () => {
  test("round trips every player's saved fields and active profile", async () => {
    const state = stateFixture();
    const file = createProfileSave(state);
    expect(file.name).toMatch(/^burrow-save-.*\.json$/);
    expect(parseProfileSave(await file.text()).profilesState).toEqual(state);
  });

  test("rejects unrelated, broken, oversized, future, and unsafe files", () => {
    for (const contents of ["not json", "null", "{}", saveContents().slice(0, -5), saveContents().replace('"version":1', '"version":2'), saveContents().replace('"xp":1234', '"__proto__":{},"xp":1234')]) {
      expect(() => parseProfileSave(contents)).toThrow();
    }
    expect(() => parseProfileSave(" ".repeat(maxSaveBytes + 1))).toThrow(/too large/);
  });

  test("rejects damaged nested progress and ambiguous player identities", () => {
    const mutations = [
      (state: ProfilesState) => { state.activeProfileId = "missing"; },
      (state: ProfilesState) => { state.profiles[1].id = state.profiles[0].id; },
      (state: ProfilesState) => { state.profiles = []; },
      (state: ProfilesState) => { state.profiles[0].progress.xp = -1; },
      (state: ProfilesState) => { state.profiles[0].progress.difficulty = 4 as Progress["difficulty"]; },
      (state: ProfilesState) => { state.profiles[0].progress.learningHistory[0].subjectKeys = [null as unknown as string]; },
      (state: ProfilesState) => { state.profiles[0].progress.modeStats.quiz = null as unknown as Progress["modeStats"]["quiz"]; },
      (state: ProfilesState) => { state.profiles[0].progress.topicStats.peppers.answered = "87" as unknown as number; },
      (state: ProfilesState) => { state.profiles[0].progress.unlockedCards = {} as string[]; },
    ];
    for (const mutate of mutations) {
      const state = stateFixture();
      mutate(state);
      expect(() => parseProfileSave(saveContents(state))).toThrow(/incomplete or damaged/);
    }
  });
});

const openGame = async (page: Page, url = "/play") => {
  await page.route("**/api/play-events", (route) => route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
};
const openSetup = async (page: Page) => {
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("button", { name: "Setup", exact: true }).click();
  return page.getByRole("dialog", { name: "Setup", exact: true });
};
const storedState = (page: Page): Promise<ProfilesState> => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), profilesKey);

test.describe("save transfer", { tag: ["@browser", "@mobile"] }, () => {
  test("exports to a file and restores all progress in a separate iPad-sized session", async ({ page, browser }, testInfo) => {
    await openGame(page);
    const existing = await storedState(page);
    const fixture = { ...stateFixture(), knownTopics: existing.knownTopics };
    await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: profilesKey, state: fixture });
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
    const original = await storedState(page);
    await openSetup(page);
    await page.evaluate(() => Object.defineProperty(navigator, "canShare", { configurable: true, value: () => false }));
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export save", exact: true }).click();
    const download = await downloadEvent;
    const filePath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(filePath);
    const exported = parseProfileSave(await readFile(filePath, "utf8"));
    expect(exported.profilesState).toEqual(original);
    expect(await storedState(page)).toEqual(original);

    const targetContext = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true });
    try {
      const target = await targetContext.newPage();
      await openGame(target, page.url());
      const beforeImport = await storedState(target);
      const dialog = await openSetup(target);
      const input = dialog.getByLabel("Choose Burrow save");
      await input.setInputFiles(filePath);
      const kalPreview = dialog.getByLabel("Kal's saved progress");
      await expect(kalPreview).toContainText("Kal · Level 11 · 1234 XP · Active player");
      await expect(kalPreview).toContainText("87 answered · 70 correct · 4 collected items");
      await dialog.getByRole("button", { name: "Replace players and import" }).scrollIntoViewIfNeeded();
      await target.screenshot({ path: testInfo.outputPath("import-preview.png") });
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(await storedState(target)).toEqual(beforeImport);
      await dialog.getByRole("button", { name: "Cancel import" }).click();
      expect(await storedState(target)).toEqual(beforeImport);
      await input.setInputFiles(filePath);
      await dialog.getByRole("button", { name: "Replace players and import" }).click();
      await expect(dialog.getByRole("status")).toContainText("Save imported");
      expect(await storedState(target)).toEqual(original);
      await dialog.getByRole("button", { name: "Close setup" }).click();
      await expect(target.getByRole("button", { name: /Level 11\. View progress stats/ })).toBeVisible();
      await expect(target.getByRole("status", { name: "Preparing the next round" })).toBeHidden();
      await target.reload();
      await target.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
      expect(await storedState(target)).toEqual(original);
      await target.getByRole("button", { name: /Level 11\. View progress stats/ }).click();
      const statsDialog = target.getByRole("dialog", { name: "Progress at level 11" });
      for (const [label, total] of [["Questions", 87], ["Correct", 70], ["Incorrect", 17], ["Collected", 4]] as const) {
        await expect(statsDialog.getByText(label, { exact: true }).locator("..").locator("strong")).toHaveText(String(total));
      }
      await statsDialog.getByRole("button", { name: "Close progress stats" }).click();
      // Reveal the restored pack collections as well as the initially selected core categories.
      await target.getByRole("button", { name: "Topics ▾" }).click();
      await target.getByRole("button", { name: /Tall Trees/ }).click();
      await target.getByRole("button", { name: /Bridges & Tunnels/ }).click();
      await target.getByRole("button", { name: "Topics ▾" }).click();
      await expect(target.getByRole("status", { name: "Preparing the next round" })).toBeHidden();
      await target.getByRole("button", { name: /^Collection/ }).click();
      const collections = target.getByLabel("Card collections");
      for (const [category, imageName] of [
        ["Spicy Peppers", "Jalapeno"],
        ["Shark Tank", "Great White Shark"],
        ["Tall Trees", "Coast redwoods towering beside a road in a California forest"],
        ["Bridges & Tunnels", "Golden Gate Bridge photo"],
      ]) {
        const categoryButton = collections.getByRole("button", { name: new RegExp(`^${category}: 1 of .* cards collected$`) });
        await categoryButton.click();
        await expect(target.getByLabel(`${category} card collection`).getByRole("img", { name: imageName, exact: true })).toBeVisible();
      }
      await target.getByRole("button", { name: /^Back to game/ }).click();
      await target.getByLabel("Answer choices").getByRole("button").first().click();
      await expect.poll(async () => (await storedState(target)).profiles.find((profile) => profile.id === "kal")?.progress.answered).toBe(88);
      const restoredDialog = await openSetup(target);
      await expect(restoredDialog.getByRole("combobox", { name: "Player", exact: true })).toHaveValue("kal");
      await restoredDialog.getByRole("combobox", { name: "Player", exact: true }).selectOption("other");
      await restoredDialog.getByRole("button", { name: "Close setup" }).click();
      await expect(target.getByRole("button", { name: /Level 3\. View progress stats/ })).toBeVisible();
    } finally {
      await targetContext.close();
    }
  });

  test("bad files and failed storage leave the current save untouched", async ({ page }) => {
    await openGame(page);
    const before = await storedState(page);
    const dialog = await openSetup(page);
    const input = dialog.getByLabel("Choose Burrow save");
    await input.setInputFiles({ name: "broken.json", mimeType: "application/json", buffer: Buffer.from('{"format":"burrow-save","version":1}') });
    await expect(dialog.getByRole("alert")).toContainText("incomplete or damaged");
    await expect(dialog.getByRole("button", { name: "Replace players and import" })).toHaveCount(0);
    expect(await storedState(page)).toEqual(before);
    await input.setInputFiles({ name: "kal.json", mimeType: "application/json", buffer: Buffer.from(saveContents()) });
    await page.evaluate((key) => {
      const originalSet = Storage.prototype.setItem;
      Storage.prototype.setItem = function (storageKey, value) {
        if (storageKey === key) throw new DOMException("Storage full", "QuotaExceededError");
        return originalSet.call(this, storageKey, value);
      };
    }, profilesKey);
    await dialog.getByRole("button", { name: "Replace players and import" }).click();
    await expect(dialog.getByRole("alert")).toContainText("could not store the save");
    expect(await storedState(page)).toEqual(before);
    await expect(dialog.getByRole("combobox", { name: "Player", exact: true })).toHaveValue(before.activeProfileId);
  });

  test("uses native file sharing and falls back to a download when sharing fails", async ({ page }) => {
    await openGame(page);
    const before = await storedState(page);
    const dialog = await openSetup(page);
    await page.evaluate(() => {
      Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
      Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => {
        sessionStorage.setItem("test-shared-save", await data.files![0].text());
      } });
    });
    await dialog.getByRole("button", { name: "Export save", exact: true }).click();
    await expect(dialog.getByRole("status")).toContainText("Save shared");
    const shared = await page.evaluate(() => sessionStorage.getItem("test-shared-save")!);
    expect(parseProfileSave(shared).profilesState).toEqual(before);
    await page.evaluate(() => Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new DOMException("Cancelled", "AbortError"); } }));
    await dialog.getByRole("button", { name: "Export save", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "Export save", exact: true })).toBeEnabled();
    await expect(dialog.getByRole("alert")).toHaveCount(0);
    await expect(dialog.getByRole("status")).toHaveCount(0);
    await page.evaluate(() => Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new DOMException("File type unsupported", "NotAllowedError"); } }));
    const downloadEvent = page.waitForEvent("download");
    await dialog.getByRole("button", { name: "Export save", exact: true }).click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toMatch(/^burrow-save-.*\.json$/);
    expect(await storedState(page)).toEqual(before);
  });
});
