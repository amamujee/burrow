import { expect, test } from "@playwright/test";
import { loadPlayablePacks } from "../../src/lib/pack-loader";
import { packToPlayableDeck } from "../../src/lib/pack-adapter";
import { packQuizCandidates, packReadings } from "../../src/lib/pack-quiz";
import { recentTopicStats } from "../../src/lib/adaptive-topics";
import { addLearningExposure, learningIdentity, learningVarietyScore, summarizeLearningHistory } from "../../src/lib/learning-variety";

const identity = (key: string) => learningIdentity({ exactKey: key, conceptKey: key, topic: "peppers", subjects: [key] });

test.describe("audit learning improvements", { tag: "@logic" }, () => {
  test("missed concepts survive the recent window and return without repeating immediately", () => {
    const miss = identity("old-miss");
    let history = addLearningExposure([], miss, { mode: "quiz", topic: "peppers", outcome: "incorrect" });
    expect(learningVarietyScore(miss, history)).toBeLessThan(learningVarietyScore(identity("new"), history));
    for (let n = 0; n < 302; n++) history = addLearningExposure(history, identity(`other-${n}`), { mode: "quiz", topic: "peppers", outcome: "correct" });
    expect(summarizeLearningHistory(history).reviewConcepts).toBe(1);
    expect(learningVarietyScore(miss, history)).toBeGreaterThan(learningVarietyScore(identity("new"), history));
    const nextTurn = addLearningExposure(history, identity("another"), { mode: "quiz", topic: "peppers", outcome: "correct" });
    expect(learningVarietyScore(miss, nextTurn)).toBeLessThan(learningVarietyScore(identity("new"), nextTurn));
    history = addLearningExposure(history, miss, { mode: "quiz", topic: "peppers", outcome: "correct" });
    expect(summarizeLearningHistory(history).reviewConcepts).toBe(0);
  });

  test("recent improvement outweighs old mistakes and ties never count as misses", () => {
    let history = addLearningExposure([], identity("same"), { mode: "trumps", topic: "peppers", outcome: "incorrect" });
    for (let n = 0; n < 20; n++) history = addLearningExposure(history, identity("same"), { mode: "quiz", topic: "peppers", outcome: "correct" });
    history = addLearningExposure(history, identity("tie"), { mode: "trumps", topic: "peppers", outcome: "tie" });
    expect(recentTopicStats(history)).toEqual({ peppers: { answered: 20, correct: 20 } });
    expect(summarizeLearningHistory(history)).toEqual({ practicedConcepts: 1, strongConcepts: 1, reviewConcepts: 0 });
  });

  test("every playable pack offers valid four-choice quizzes and sourced reading passages", () => {
    const seenReadings = new Set<string>();
    for (const pack of loadPlayablePacks()) {
      const deck = packToPlayableDeck(pack);
      const kinds = new Set<string>();
      for (const difficulty of [1, 2, 3] as const) {
        for (const seed of [0, 3]) {
          const candidates = packQuizCandidates(deck, difficulty, seed);
          expect(candidates.length).toBeGreaterThanOrEqual(4);
          for (const question of candidates) {
            expect(new Set(question.choices).size).toBe(4);
            expect(question.choices.filter((choice) => choice === question.answer)).toHaveLength(1);
            expect(question.prompt).toBeTruthy();
            expect(question.topic).toBe(pack.id);
            kinds.add(question.kind);
            if (question.kind === "pack-reading") {
              const card = pack.cards.find((card) => card.name === question.collectionTitles![0])!;
              expect(question.readingClue).toBe(card.fact);
              expect(pack.sources.length + (card.metadata?.sources?.length ?? 0)).toBeGreaterThan(0);
              seenReadings.add(`${pack.id}:${card.id}`);
            }
          }
        }
      }
      expect(kinds.has("pack-reading"), pack.id).toBe(true);
      expect(kinds.has("pack-name"), pack.id).toBe(true);
    }
    expect([...seenReadings].sort()).toEqual(Object.keys(packReadings).sort());
  });
});

test("updated originals invalidate optimized images and unindexed images are refreshed", { tag: ["@browser", "@mobile"] }, async ({ page, context }) => {
  await page.goto("/play");
  await page.waitForFunction(() => document.documentElement.dataset.burrowProfilesReady === "true");
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("button", { name: "Setup", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save offline" })).toBeEnabled();
  const result = await page.evaluate(async () => {
    const worker = (await navigator.serviceWorker.ready).active!;
    const name = (await caches.keys()).find((name) => name.endsWith("-content"))!;
    const cache = await caches.open(name);
    const original = "/icons/burrow-icon-32.png";
    const optimized = `/_next/image?url=${encodeURIComponent(original)}&w=64&q=75`;
    await cache.put(original, new Response("old unindexed image"));
    await cache.put(optimized, new Response("old optimized image"));
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Cache refresh timed out")), 10000);
      const listener = (event: MessageEvent) => {
        if (event.data?.type !== "OFFLINE_CACHE_COMPLETE" || event.data.requestId !== "revision-regression") return;
        clearTimeout(timer);
        navigator.serviceWorker.removeEventListener("message", listener);
        if (event.data.failed) reject(new Error("Cache refresh failed")); else resolve();
      };
      navigator.serviceWorker.addEventListener("message", listener);
      worker.postMessage({ type: "CACHE_URLS", requestId: "revision-regression", entries: [{ url: original, revision: "new-revision", bytes: 1 }] });
    });
    await cache.put("/burrow-assets/countries/offline-test.svg", new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { headers: { "Content-Type": "image/svg+xml" } }));
    return { text: await (await cache.match(original))!.text(), optimized: Boolean(await cache.match(optimized)) };
  });
  expect(result.text).not.toBe("old unindexed image");
  expect(result.optimized).toBe(false);
  // The version on optimized requests changes whenever the image manifest changes.
  const src = await page.locator('img[data-original-src*="/burrow-assets/"]').first().getAttribute("src");
  expect(decodeURIComponent(src!)).toMatch(/\?v=[a-f0-9]{20}/);
  // An old tab's revision can be rejected by the new optimizer allowlist.
  // Keep displaying the saved original on HTTP failures as well as offline.
  expect(await page.evaluate(async () => (await fetch("/_next/image?url=%2Ficons%2Fburrow-icon-32.png%3Fv%3Dstale&w=64&q=75")).ok)).toBe(true);
  await context.setOffline(true);
  try {
    const response = await page.evaluate(async () => {
      const response = await fetch("/_next/image?url=%2Ficons%2Fburrow-icon-32.png%3Fv%3Dtest&w=64&q=75");
      return { ok: response.ok, type: response.headers.get("content-type") };
    });
    expect(response.ok).toBe(true);
    expect(response.type).toContain("image/");
    expect(await page.evaluate(async () => (await fetch("/burrow-assets/countries/offline-test.svg?v=current")).ok)).toBe(true);
  } finally { await context.setOffline(false); }
});
