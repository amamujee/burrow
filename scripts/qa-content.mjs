import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createJiti } from "jiti";

const jiti = createJiti(`${process.cwd()}/`);
const data = jiti("./src/lib/game-data.ts");
const library = jiti("./src/lib/content-library.ts");
const {
  buildFactRound,
  buildFactRoundFromCards,
  buildGeoRound,
  buildGeoRoundFromCards,
  buildNumberRound,
  buildNumberRoundFromCards,
  buildOddRound,
  buildOddRoundFromCards,
  buildRevealRound,
  buildRevealRoundFromCards,
  buildSortRound,
  buildSortRoundFromCards,
  buildTopTrumpRound,
  buildTopTrumpRoundFromCards,
  canBuildGeoRound,
  canBuildGeoRoundFromCards,
  collectionCards,
  geoChoiceSeparationForDifficulty,
  geoPointDistanceKm,
  geoPointMapDistance,
} = jiti("./src/lib/game-modes.ts");
const { packToPlayableDeck } = jiti("./src/lib/pack-adapter.ts");
const { buildHeadToHeadSession, buildSession } = jiti("./src/lib/questions.ts");

const userAgent = "BurrowContentQA/1.0";
const critical = [];
const warnings = [];
const validDifficultyBands = new Set(["easy", "medium", "hard"]);
const validWorldContinents = new Set(["Africa", "Antarctica", "Asia", "Europe", "North America", "South America", "Oceania"]);
const sourceVerifiedScovilleRanges = new Map([
  ["jimmy-nardello", { min: 0, max: 100, source: "https://www.tyler-farms.com/jimmy-nardello-sweet-italian-pepper-seeds/" }],
  ["habanada", { min: 0, max: 0, source: "https://www.tyler-farms.com/habanada-pepper-seeds/" }],
  ["corno-di-toro", { min: 0, max: 500, source: "https://www.tyler-farms.com/red-corno-di-toro-sweet-italian-pepper-seeds/" }],
  ["santa-fe-grande", { min: 500, max: 700, source: "https://www.tyler-farms.com/santa-fe-grande-pepper-seeds/" }],
  ["bulgarian-carrot", { min: 5000, max: 30000, source: "https://www.tyler-farms.com/bulgarian-carrot-pepper-seeds/" }],
  ["aleppo", { min: 10000, max: 10000, source: "https://www.tyler-farms.com/aleppo-pepper-seeds/" }],
  ["italian-wax", { min: 12000, max: 22000, source: "https://www.tyler-farms.com/italian-wax-pepper-seeds/" }],
  ["mattapeno", { min: 5000, max: 10000, source: "https://www.tyler-farms.com/mattapeno-pepper-seeds/" }],
  ["purple-jalapeno", { min: 2500, max: 8000, source: "https://www.tyler-farms.com/purple-jalapeno-pepper-seeds/" }],
  ["sugar-rush-peach", { min: 50000, max: 100000, source: "https://www.tyler-farms.com/sugar-rush-peach-pepper-seeds/" }],
  ["sugar-rush-stripey", { min: 50000, max: 100000, source: "https://www.tyler-farms.com/sugar-rush-stripey-pepper-seeds/" }],
  ["aji-mango", { min: 100000, max: 150000, source: "https://www.tyler-farms.com/aji-mango-pepper-seeds/" }],
  ["aji-pineapple", { min: 100000, max: 150000, source: "https://www.tyler-farms.com/aji-pineapple-pepper-seeds/" }],
  ["purple-thai", { min: 50000, max: 100000, source: "https://www.tyler-farms.com/purple-thai-pepper-seeds/" }],
  ["naga-morich", { min: 1000000, max: 1500000, source: "https://www.tyler-farms.com/naga-morich-pepper-seeds/" }],
  ["seven-pot-douglah", { min: 1150000, max: 1800000, source: "https://www.tyler-farms.com/7-pot-douglah-pepper-seeds/" }],
]);

const isImageFile = (target) => {
  const buffer = fs.readFileSync(target);
  const textStart = buffer.subarray(0, 120).toString("utf8").trimStart().toLowerCase();
  return (
    (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) ||
    (buffer[0] === 0x89 && buffer.subarray(1, 4).toString("ascii") === "PNG") ||
    buffer.subarray(0, 6).toString("ascii") === "GIF87a" ||
    buffer.subarray(0, 6).toString("ascii") === "GIF89a" ||
    (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") ||
    textStart.startsWith("<svg")
  );
};
const isSvgFile = (target) => fs.readFileSync(target).subarray(0, 120).toString("utf8").trimStart().toLowerCase().startsWith("<svg");

const localImagePath = (item) => {
  if (!item.image || item.image.startsWith("http") || !item.image.startsWith("/")) return null;
  return path.join("public", item.image.replace(/^\//, ""));
};

const localImageHash = (item) => {
  const target = localImagePath(item);
  if (!target || !fs.existsSync(target)) return null;
  return crypto.createHash("sha1").update(fs.readFileSync(target)).digest("hex");
};

const normalizeLabel = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");

const cardsInRound = (round) => [
  ...(round.card ? [round.card] : []),
  ...(round.cards ?? []),
  ...(round.player ? [round.player] : []),
  ...(round.computer ? [round.computer] : []),
];

const checkRemoteImage = async (url) => {
  const response = await fetch(url, {
    headers: {
      Range: "bytes=0-2048",
      "User-Agent": userAgent,
    },
  });
  const contentType = response.headers.get("content-type") ?? "";
  return response.ok && (contentType.startsWith("image/") || url.includes("Special:FilePath"));
};

const checkImage = async (item) => {
  if (!item.image) {
    critical.push(`${item.topic}/${item.id}: missing image`);
    return;
  }

  if (item.image.startsWith("http")) {
    try {
      if (!(await checkRemoteImage(item.image))) {
        critical.push(`${item.topic}/${item.id}: remote image did not return an image response`);
      }
    } catch (error) {
      critical.push(`${item.topic}/${item.id}: remote image failed (${error.message})`);
    }
    return;
  }

  const target = path.join("public", item.image.replace(/^\//, ""));
  if (!fs.existsSync(target)) {
    critical.push(`${item.topic}/${item.id}: missing local image ${target}`);
    return;
  }
  if (fs.statSync(target).size < 1024 && !isSvgFile(target)) {
    critical.push(`${item.topic}/${item.id}: image is too small`);
    return;
  }
  if (!isImageFile(target)) {
    critical.push(`${item.topic}/${item.id}: image file does not look like an image`);
  }
};

const loadPlayablePacks = () => {
  const packsRoot = "content/packs";
  if (!fs.existsSync(packsRoot)) return [];

  return fs.readdirSync(packsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith("_"))
    .map((entry) => path.join(packsRoot, entry.name, "pack.json"))
    .filter((packFile) => fs.existsSync(packFile))
    .flatMap((packFile) => {
      try {
        const pack = JSON.parse(fs.readFileSync(packFile, "utf8"));
        return pack.status === "playable" ? [pack] : [];
      } catch (error) {
        critical.push(`${packFile}: invalid pack JSON (${error.message})`);
        return [];
      }
    });
};

const requireText = (item, field, min = 2) => {
  const value = item[field];
  if (typeof value !== "string" || value.trim().length < min) critical.push(`${item.topic}/${item.id}: missing ${field}`);
};

const checkFeaturedMetadata = (item) => {
  requireText(item, "name");
  requireText(item, "fact", 24);
  requireText(item, "imageCredit");
  requireText(item, "imageSourceUrl", 8);

  if (item.topic === "peppers") {
    const hasRange = typeof item.shuMin === "number" && typeof item.shuMax === "number" && item.shuMin <= item.shuMax && item.shuMax >= 0;
    const isUnpublished = item.shuMin === null && item.shuMax === null && item.scovilleStatus === "unpublished";
    const hasUnofficialLowerBound = typeof item.shuMin === "number" && item.shuMin >= 0 && item.shuMax === null && item.scovilleStatus === "unofficial";
    if (!hasRange && !isUnpublished && !hasUnofficialLowerBound) critical.push(`${item.topic}/${item.id}: bad Scoville range`);
    const expectedHeat = data.heatBandForScoville(item.shuMax ?? item.shuMin ?? 500001);
    if (item.heat !== expectedHeat) critical.push(`${item.topic}/${item.id}: heat band ${item.heat} does not match its Scoville range (${expectedHeat})`);
    const verified = sourceVerifiedScovilleRanges.get(item.id);
    if (verified && (item.shuMin !== verified.min || item.shuMax !== verified.max)) {
      critical.push(`${item.topic}/${item.id}: expected source-verified ${verified.min}-${verified.max} SHU (${verified.source})`);
    }
  }
  if (item.topic === "buildings" && !(item.heightFt > 0 && item.city && item.country)) critical.push(`${item.topic}/${item.id}: bad building metadata`);
  if (item.topic === "sharks" && !(item.lengthFt > 0 && item.speedMph > 0 && item.power > 0 && item.family)) critical.push(`${item.topic}/${item.id}: bad shark metadata`);
  if (item.topic === "sharks" && item.family) {
    const family = normalizeLabel(item.family);
    const name = normalizeLabel(item.name);
    if (family === name || normalizeLabel(`${item.family} shark`) === name) critical.push(`${item.topic}/${item.id}: circular shark family label "${item.family}"`);
  }
  if (item.metadata) checkCardMetadata(item, `${item.topic}/${item.id}`);
  if (item.topic === "jets" && !(item.maxSpeedMph > 0 && item.rangeMiles > 0 && item.firepower > 0 && item.country && item.category)) critical.push(`${item.topic}/${item.id}: bad jet metadata`);
  if (item.topic === "space") {
    if (item.kind === "planet" && !(item.diameterMiles && item.distanceFromSunMillionMiles !== undefined && item.meanSurfaceTempF !== undefined)) critical.push(`${item.topic}/${item.id}: bad planet metadata`);
    if (item.kind === "star" && !(item.surfaceTempK && item.radiusSolar && item.distanceLightYears)) warnings.push(`${item.topic}/${item.id}: star has thin numeric metadata`);
    if (item.kind === "concept" && !(item.conceptQuestion && item.conceptAnswer)) critical.push(`${item.topic}/${item.id}: concept needs question and answer`);
  }
};

const checkCardMetadata = (item, label) => {
  if (item.tags !== undefined) {
    if (!Array.isArray(item.tags) || item.tags.length < 1) critical.push(`${label}: tags must be a non-empty array when present`);
    for (const tag of item.tags ?? []) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag)) critical.push(`${label}: invalid tag "${tag}"`);
    }
  }

  if (!item.metadata) return;
  if (item.metadata.difficultyBand !== undefined && !validDifficultyBands.has(item.metadata.difficultyBand)) critical.push(`${label}: invalid difficultyBand "${item.metadata.difficultyBand}"`);
  if (item.metadata.recognition !== undefined && (!Number.isInteger(item.metadata.recognition) || item.metadata.recognition < 1 || item.metadata.recognition > 5)) critical.push(`${label}: recognition must be 1-5`);
  if (item.metadata.difficultyBand === "easy" && item.metadata.recognition !== undefined && item.metadata.recognition < 4) critical.push(`${label}: easy cards need recognition >= 4`);
  if (item.metadata.difficultyBand === "hard" && item.metadata.recognition !== undefined && item.metadata.recognition > 3) critical.push(`${label}: hard cards should not have recognition > 3`);
  if (item.metadata.location !== undefined) {
    const location = item.metadata.location;
    if (!location || typeof location !== "object" || Array.isArray(location)) {
      critical.push(`${label}: location metadata must be an object`);
    } else {
      if (typeof location.label !== "string" || location.label.trim().length < 2) critical.push(`${label}: location metadata needs a label`);
      if (!Array.isArray(location.countries) || location.countries.length < 1 || location.countries.some((country) => typeof country !== "string" || country.trim().length < 2)) critical.push(`${label}: location metadata needs countries`);
      if (!Array.isArray(location.continents) || location.continents.length < 1 || location.continents.some((continent) => !validWorldContinents.has(continent))) critical.push(`${label}: location metadata has invalid continents`);
    }
  }
};

const featuredItems = [
  ...data.peppers.map((item) => ({ ...item, topic: "peppers" })),
  ...data.buildings.map((item) => ({ ...item, topic: "buildings" })),
  ...data.sharks.map((item) => ({ ...item, topic: "sharks" })),
  ...data.spaceCards.map((item) => ({ ...item, topic: "space" })),
  ...data.jets.map((item) => ({ ...item, topic: "jets" })),
];

for (const item of featuredItems) {
  checkFeaturedMetadata(item);
  await checkImage(item);
}
assertDistinctImageGroups(featuredItems, "featuredItems");

const cards = collectionCards();
for (const pepper of data.peppers) {
  const card = cards.find((item) => item.topic === "peppers" && item.id === pepper.id);
  if (!card) {
    critical.push(`peppers/${pepper.id}: missing collection card`);
    continue;
  }
  if (pepper.shuMax !== null && card.statValue !== pepper.shuMax) critical.push(`peppers/${pepper.id}: card Scoville value does not match shuMax`);
  if (pepper.shuMax === null && Number.isFinite(card.statValue)) critical.push(`peppers/${pepper.id}: unpublished maximum must not become a numeric card value`);
}
for (const card of cards.filter((item) => item.topic === "buildings")) {
  if (!card.metadata?.location) critical.push(`buildings/${card.id}: missing world location metadata`);
}
const lowConfidence = cards.filter((card) => card.qualityScore < 75);
for (const card of lowConfidence) {
  warnings.push(`${card.topic}/${card.id}: low confidence ${card.qualityScore} (${card.qualityFlags.join(", ")})`);
}

const assertTopicIsolation = (roundName, expectedTopic, round) => {
  if (round.topic !== expectedTopic) critical.push(`${roundName}: expected topic ${expectedTopic}, received ${round.topic}`);
  for (const card of cardsInRound(round)) {
    if (card.topic && card.topic !== expectedTopic) critical.push(`${roundName}: card ${card.id} leaked from topic ${card.topic}`);
  }
};

const assertRoundCardImages = async (roundName, round, expectedTopic) => {
  assertTopicIsolation(roundName, expectedTopic, round);
  const cardsToCheck = [];
  if (round.card) cardsToCheck.push(round.card);
  if (round.cards) cardsToCheck.push(...round.cards);
  for (const card of cardsToCheck) {
    await checkImage({ ...card, topic: card.topic ?? round.topic });
  }
  if (round.image) await checkImage({ id: round.id, topic: round.topic, image: round.image });
  if (!cardsToCheck.length && !round.image) critical.push(`${roundName}/${round.id}: no image-bearing content`);
};

const assertNoHardCardsInEasyRound = (roundName, round) => {
  for (const card of cardsInRound(round)) {
    if (card.metadata?.difficultyBand === "hard") critical.push(`${roundName}/${round.id}: hard card "${card.title ?? card.name ?? card.id}" appeared in easy round`);
  }
};

function assertDistinctImageGroups(items, scopeLabel) {
  const groups = new Map();
  for (const item of items) {
    const group = item.metadata?.imageDistinctGroup;
    if (!group) continue;
    const hash = localImageHash(item);
    if (!hash) continue;
    const entries = groups.get(group) ?? [];
    entries.push({ item, hash });
    groups.set(group, entries);
  }

  for (const [group, entries] of groups) {
    const byHash = new Map();
    for (const entry of entries) {
      const matches = byHash.get(entry.hash) ?? [];
      matches.push(entry.item);
      byHash.set(entry.hash, matches);
    }
    for (const matches of byHash.values()) {
      if (matches.length > 1) critical.push(`${scopeLabel}: imageDistinctGroup "${group}" reuses the same image for ${matches.map((item) => item.id).join(", ")}`);
    }
  }
}

const assertDistinctSortValues = (roundName, round) => {
  const values = round.cards.map((card) => card.statValue);
  if (new Set(values).size !== values.length) critical.push(`${roundName}: duplicate ${round.statLabel} values in sort round`);
};

const assertGeoChoiceSeparation = (roundName, round, difficulty) => {
  const minimum = geoChoiceSeparationForDifficulty(difficulty);
  for (let first = 0; first < round.choices.length; first += 1) {
    for (let second = first + 1; second < round.choices.length; second += 1) {
      const firstChoice = round.choices[first];
      const secondChoice = round.choices[second];
      const kilometers = geoPointDistanceKm(firstChoice.point, secondChoice.point);
      const mapPercent = geoPointMapDistance(firstChoice.point, secondChoice.point);
      if (kilometers < minimum.kilometers || mapPercent < minimum.mapPercent) {
        critical.push(`${roundName}: ${firstChoice.label} and ${secondChoice.label} are too close (${Math.round(kilometers)} km, ${mapPercent.toFixed(1)}% map distance)`);
      }
    }
  }
};

const assertPackPrimarySortStat = (deck) => {
  const labels = new Set(deck.cards.map((card) => card.statLabel));
  if (labels.size > 1) critical.push(`${deck.id}: mixed primary sort labels (${Array.from(labels).join(", ")})`);
};

const checkPackMetadata = (pack) => {
  const playableCards = pack.cards ?? [];
  const easyCards = playableCards.filter((card) => card.metadata?.difficultyBand === "easy");
  if (playableCards.length >= 16 && easyCards.length < 8) critical.push(`${pack.id}: playable packs need at least 8 easy metadata cards`);

  for (const card of playableCards) {
    const label = `${pack.id}/${card.id}`;
    checkCardMetadata({ ...card, topic: pack.id }, label);
    if (!Array.isArray(card.tags) || card.tags.length < 2) critical.push(`${label}: playable pack cards need at least 2 tags`);
    if (!card.metadata?.difficultyBand) critical.push(`${label}: missing metadata.difficultyBand`);
    if (!Number.isInteger(card.metadata?.recognition)) critical.push(`${label}: missing metadata.recognition`);
    if (!card.metadata?.taxonomyGroup) critical.push(`${label}: missing metadata.taxonomyGroup`);
    if (["bridges-and-tunnels", "tallest-mountains"].includes(pack.id) && !card.metadata?.location) critical.push(`${label}: missing world location metadata`);
    if (card.tags?.includes("not-dinosaur") && !card.metadata?.accuracyNote) critical.push(`${label}: not-dinosaur cards need metadata.accuracyNote`);
  }

  assertDistinctImageGroups(playableCards.map((card) => ({ ...card, topic: pack.id })), pack.id);
};

const assertQuestion = async (roundName, question, expectedTopic) => {
  assertTopicIsolation(roundName, expectedTopic, question);
  if (!question.id || !question.prompt || !question.answer) critical.push(`${roundName}/${question.id ?? "missing"}: incomplete question`);
  if (!question.choices?.includes(question.answer)) critical.push(`${roundName}/${question.id}: answer missing from choices`);
  await checkImage({ id: question.id, topic: question.topic, image: question.image });
  for (const comparison of question.comparison ?? []) {
    if (comparison.topic !== expectedTopic) critical.push(`${roundName}: comparison ${comparison.title} leaked from topic ${comparison.topic}`);
    await checkImage({ id: comparison.title, topic: comparison.topic, image: comparison.image });
  }
};

const checkRoundBuilders = async () => {
  const difficulties = [1, 2, 3];
  for (const topic of data.topicIds) {
    for (const difficulty of difficulties) {
      const seed = 20260430 + difficulty * 100 + topic.length;
      const session = buildSession(topic, difficulty, seed, []);
      if (session.length < 12) critical.push(`${topic}/quiz/d${difficulty}: short session`);
      for (const question of session) {
        await assertQuestion(`${topic}/quiz/d${difficulty}`, question, topic);
      }

      const headToHeadSession = buildHeadToHeadSession(topic, difficulty, seed + 5, []);
      if (headToHeadSession.length < 12) critical.push(`${topic}/versus/d${difficulty}: short session`);
      for (const question of headToHeadSession) {
        await assertQuestion(`${topic}/versus/d${difficulty}`, question, topic);
        if (!question.comparison || question.comparison.length !== 2) critical.push(`${topic}/versus/d${difficulty}/${question.id}: missing comparison cards`);
      }

      const sortRound = buildSortRound(topic, difficulty, seed + 10);
      if (sortRound.cards.length < 3 || sortRound.cards.length !== sortRound.answerIds.length) critical.push(`${topic}/sort/d${difficulty}: bad card count`);
      assertDistinctSortValues(`${topic}/sort/d${difficulty}`, sortRound);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${topic}/sort/d${difficulty}`, sortRound);
      await assertRoundCardImages(`${topic}/sort/d${difficulty}`, sortRound, topic);

      const factRound = buildFactRound(topic, difficulty, seed + 20);
      if (!["True", "False"].includes(factRound.answer)) critical.push(`${topic}/fact/d${difficulty}: bad answer`);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${topic}/fact/d${difficulty}`, factRound);
      await assertRoundCardImages(`${topic}/fact/d${difficulty}`, factRound, topic);

      const revealRound = buildRevealRound(topic, difficulty, seed + 30);
      if (!revealRound.choices.includes(revealRound.answer)) critical.push(`${topic}/peek/d${difficulty}: answer missing from choices`);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${topic}/peek/d${difficulty}`, revealRound);
      await assertRoundCardImages(`${topic}/peek/d${difficulty}`, revealRound, topic);

      if (canBuildGeoRound(topic, difficulty)) {
        const geoRound = buildGeoRound(topic, difficulty, seed + 40);
        if (!geoRound.choices.some((choice) => choice.id === geoRound.answerId)) critical.push(`${topic}/geo/d${difficulty}: answer missing from choices`);
        if (new Set(geoRound.choices.map((choice) => choice.id)).size !== geoRound.choices.length) critical.push(`${topic}/geo/d${difficulty}: duplicate geo choices`);
        assertGeoChoiceSeparation(`${topic}/geo/d${difficulty}`, geoRound, difficulty);
        if (difficulty === 1) assertNoHardCardsInEasyRound(`${topic}/geo/d${difficulty}`, geoRound);
        await assertRoundCardImages(`${topic}/geo/d${difficulty}`, geoRound, topic);
      }

      const numberRound = buildNumberRound(topic, difficulty, seed + 50);
      if (!numberRound.choices.includes(numberRound.answer) || numberRound.cards.length < 2 || numberRound.cards.length !== numberRound.termValues.length) critical.push(`${topic}/number/d${difficulty}: bad number choices`);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${topic}/number/d${difficulty}`, numberRound);
      await assertRoundCardImages(`${topic}/number/d${difficulty}`, numberRound, topic);

      const oddRound = buildOddRound(topic, difficulty, seed + 60);
      if (oddRound.cards.length !== 4 || !oddRound.cards.some((card) => card.id === oddRound.answerId)) critical.push(`${topic}/odd/d${difficulty}: bad odd-one-out set`);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${topic}/odd/d${difficulty}`, oddRound);
      await assertRoundCardImages(`${topic}/odd/d${difficulty}`, oddRound, topic);

      const topTrumpRound = buildTopTrumpRound(topic, difficulty, seed + 70);
      if (!topTrumpRound.player?.stats?.length || !topTrumpRound.computer?.stats?.length) critical.push(`${topic}/trumps/d${difficulty}: missing trumps stats`);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${topic}/trumps/d${difficulty}`, topTrumpRound);
      const playerStatIds = new Set(topTrumpRound.player.stats.map((stat) => stat.id));
      for (const stat of topTrumpRound.computer.stats) {
        if (!playerStatIds.has(stat.id)) critical.push(`${topic}/trumps/d${difficulty}: mismatched stat ${stat.id}`);
      }
      await assertRoundCardImages(`${topic}/trumps/d${difficulty}`, {
        id: topTrumpRound.id,
        topic: topTrumpRound.topic,
        cards: [topTrumpRound.player, topTrumpRound.computer],
      }, topic);
    }
  }
};

await checkRoundBuilders();

const playablePacks = loadPlayablePacks();

const checkPlayablePackRoundBuilders = async () => {
  const difficulties = [1, 2, 3];
  for (const pack of playablePacks) {
    checkPackMetadata(pack);
    const deck = packToPlayableDeck(pack);
    if (deck.cards.length < 4) critical.push(`${deck.id}: needs at least 4 playable cards`);
    assertPackPrimarySortStat(deck);

    for (const difficulty of difficulties) {
      const seed = 20260511 + difficulty * 100 + deck.id.length;

      const sortRound = buildSortRoundFromCards(deck.cards, deck.id, difficulty, seed + 10);
      if (sortRound.cards.length < 3 || sortRound.cards.length !== sortRound.answerIds.length) critical.push(`${deck.id}/sort/d${difficulty}: bad card count`);
      assertDistinctSortValues(`${deck.id}/sort/d${difficulty}`, sortRound);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${deck.id}/sort/d${difficulty}`, sortRound);
      await assertRoundCardImages(`${deck.id}/sort/d${difficulty}`, sortRound, deck.id);

      const factRound = buildFactRoundFromCards(deck.cards, deck.id, difficulty, seed + 20);
      if (!["True", "False"].includes(factRound.answer)) critical.push(`${deck.id}/fact/d${difficulty}: bad answer`);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${deck.id}/fact/d${difficulty}`, factRound);
      await assertRoundCardImages(`${deck.id}/fact/d${difficulty}`, factRound, deck.id);

      const revealRound = buildRevealRoundFromCards(deck.cards, deck.id, difficulty, seed + 30);
      if (!revealRound.choices.includes(revealRound.answer)) critical.push(`${deck.id}/peek/d${difficulty}: answer missing from choices`);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${deck.id}/peek/d${difficulty}`, revealRound);
      await assertRoundCardImages(`${deck.id}/peek/d${difficulty}`, revealRound, deck.id);

      if (canBuildGeoRoundFromCards(deck.cards, difficulty)) {
        const geoRound = buildGeoRoundFromCards(deck.cards, deck.id, difficulty, seed + 40);
        if (!geoRound.choices.some((choice) => choice.id === geoRound.answerId)) critical.push(`${deck.id}/geo/d${difficulty}: answer missing from choices`);
        if (new Set(geoRound.choices.map((choice) => choice.id)).size !== geoRound.choices.length) critical.push(`${deck.id}/geo/d${difficulty}: duplicate geo choices`);
        assertGeoChoiceSeparation(`${deck.id}/geo/d${difficulty}`, geoRound, difficulty);
        if (difficulty === 1) assertNoHardCardsInEasyRound(`${deck.id}/geo/d${difficulty}`, geoRound);
        await assertRoundCardImages(`${deck.id}/geo/d${difficulty}`, geoRound, deck.id);
      }

      const numberRound = buildNumberRoundFromCards(deck.cards, deck.id, difficulty, seed + 50);
      if (!numberRound.choices.includes(numberRound.answer) || numberRound.cards.length < 2 || numberRound.cards.length !== numberRound.termValues.length) critical.push(`${deck.id}/number/d${difficulty}: bad number choices`);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${deck.id}/number/d${difficulty}`, numberRound);
      await assertRoundCardImages(`${deck.id}/number/d${difficulty}`, numberRound, deck.id);

      const oddRound = buildOddRoundFromCards(deck.cards, deck.id, difficulty, seed + 60);
      if (oddRound.cards.length !== 4 || !oddRound.cards.some((card) => card.id === oddRound.answerId)) critical.push(`${deck.id}/odd/d${difficulty}: bad odd-one-out set`);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${deck.id}/odd/d${difficulty}`, oddRound);
      await assertRoundCardImages(`${deck.id}/odd/d${difficulty}`, oddRound, deck.id);

      const topTrumpRound = buildTopTrumpRoundFromCards(deck.cards, deck.id, difficulty, seed + 70);
      if (!topTrumpRound.player?.stats?.length || !topTrumpRound.computer?.stats?.length) critical.push(`${deck.id}/trumps/d${difficulty}: missing trumps stats`);
      if (difficulty === 1) assertNoHardCardsInEasyRound(`${deck.id}/trumps/d${difficulty}`, topTrumpRound);
      const playerStatIds = new Set(topTrumpRound.player.stats.map((stat) => stat.id));
      for (const stat of topTrumpRound.computer.stats) {
        if (!playerStatIds.has(stat.id)) critical.push(`${deck.id}/trumps/d${difficulty}: mismatched stat ${stat.id}`);
      }
      await assertRoundCardImages(`${deck.id}/trumps/d${difficulty}`, {
        id: topTrumpRound.id,
        topic: topTrumpRound.topic,
        cards: [topTrumpRound.player, topTrumpRound.computer],
      }, deck.id);
    }
  }
};

await checkPlayablePackRoundBuilders();

for (const pepper of library.pepperLibrary) {
  if (!pepper.id || !pepper.name || !pepper.sourceUrl) critical.push(`pepperLibrary/${pepper.id ?? "missing"}: missing identity/source`);
  if (!pepper.species || !pepper.heatRange || pepper.heatRange === "varies") warnings.push(`pepperLibrary/${pepper.id}: thin pepper metadata`);
}

for (const shark of library.sharkLibrary) {
  if (!shark.id || !shark.name || !shark.scientificName || !shark.sourceUrl) critical.push(`sharkLibrary/${shark.id ?? "missing"}: missing taxonomy/source`);
}

for (const building of library.buildingLibrary) {
  if (!building.id || !building.name || !building.sourceUrl) critical.push(`buildingLibrary/${building.id ?? "missing"}: missing identity/source`);
  if (!building.city || !building.country) critical.push(`buildingLibrary/${building.id}: missing city/country geography`);
  if (!(building.heightMeters > 100 && building.heightFeet > 300)) critical.push(`buildingLibrary/${building.id}: bad height`);
}

for (const jet of library.jetLibrary) {
  if (!jet.id || !jet.name || !jet.country || !jet.category || !jet.sourceUrl) critical.push(`jetLibrary/${jet.id ?? "missing"}: missing identity/source`);
}

const byTopic = Object.fromEntries(data.topicIds.map((topic) => [
  topic,
  cards.filter((card) => card.topic === topic),
]));
const confidence = Object.fromEntries(Object.entries(byTopic).map(([topic, topicCards]) => [
  topic,
  Math.round(topicCards.reduce((total, card) => total + card.qualityScore, 0) / topicCards.length),
]));

const result = {
  featuredItems: featuredItems.length,
  collectionCards: cards.length,
  playablePacks: playablePacks.length,
  confidence,
  researchLibrary: {
    peppers: library.pepperLibrary.length,
    sharks: library.sharkLibrary.length,
    buildings: library.buildingLibrary.length,
    jets: library.jetLibrary.length,
  },
  scovilleValidation: {
    pepperRanges: data.peppers.length,
    sourceVerifiedRanges: sourceVerifiedScovilleRanges.size,
  },
  warnings: warnings.slice(0, 30),
  warningCount: warnings.length,
  critical,
};

if (critical.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(result, null, 2));
