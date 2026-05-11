import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const jiti = createJiti(`${process.cwd()}/`);
const data = jiti("./src/lib/game-data.ts");
const library = jiti("./src/lib/content-library.ts");
const {
  buildFactRound,
  buildFactRoundFromCards,
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
  collectionCards,
} = jiti("./src/lib/game-modes.ts");
const { packToPlayableDeck } = jiti("./src/lib/pack-adapter.ts");
const { buildHeadToHeadSession, buildSession } = jiti("./src/lib/questions.ts");

const userAgent = "BurrowContentQA/1.0";
const critical = [];
const warnings = [];

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
  if (fs.statSync(target).size < 1024) {
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

  if (item.topic === "peppers" && !(item.shuMin <= item.shuMax && item.shuMax >= 0)) critical.push(`${item.topic}/${item.id}: bad Scoville range`);
  if (item.topic === "buildings" && !(item.heightFt > 250 && item.city && item.country)) critical.push(`${item.topic}/${item.id}: bad building metadata`);
  if (item.topic === "sharks" && !(item.lengthFt > 0 && item.speedMph > 0 && item.power > 0 && item.family)) critical.push(`${item.topic}/${item.id}: bad shark metadata`);
  if (item.topic === "jets" && !(item.maxSpeedMph > 0 && item.rangeMiles > 0 && item.firepower > 0 && item.country && item.category)) critical.push(`${item.topic}/${item.id}: bad jet metadata`);
  if (item.topic === "space") {
    if (item.kind === "planet" && !(item.diameterMiles && item.distanceFromSunMillionMiles !== undefined && item.meanSurfaceTempF !== undefined)) critical.push(`${item.topic}/${item.id}: bad planet metadata`);
    if (item.kind === "star" && !(item.surfaceTempK && item.radiusSolar && item.distanceLightYears)) warnings.push(`${item.topic}/${item.id}: star has thin numeric metadata`);
    if (item.kind === "concept" && !(item.conceptQuestion && item.conceptAnswer)) critical.push(`${item.topic}/${item.id}: concept needs question and answer`);
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

const cards = collectionCards();
const lowConfidence = cards.filter((card) => card.qualityScore < 75);
for (const card of lowConfidence) {
  warnings.push(`${card.topic}/${card.id}: low confidence ${card.qualityScore} (${card.qualityFlags.join(", ")})`);
}

const assertRoundCardImages = async (roundName, round) => {
  const cardsToCheck = [];
  if (round.card) cardsToCheck.push(round.card);
  if (round.cards) cardsToCheck.push(...round.cards);
  for (const card of cardsToCheck) {
    await checkImage({ ...card, topic: card.topic ?? round.topic });
  }
  if (round.image) await checkImage({ id: round.id, topic: round.topic, image: round.image });
  if (!cardsToCheck.length && !round.image) critical.push(`${roundName}/${round.id}: no image-bearing content`);
};

const assertDistinctSortValues = (roundName, round) => {
  const values = round.cards.map((card) => card.statValue);
  if (new Set(values).size !== values.length) critical.push(`${roundName}: duplicate ${round.statLabel} values in sort round`);
};

const assertPackPrimarySortStat = (deck) => {
  const labels = new Set(deck.cards.map((card) => card.statLabel));
  if (labels.size > 1) critical.push(`${deck.id}: mixed primary sort labels (${Array.from(labels).join(", ")})`);
};

const assertQuestion = async (roundName, question) => {
  if (!question.id || !question.prompt || !question.answer) critical.push(`${roundName}/${question.id ?? "missing"}: incomplete question`);
  if (!question.choices?.includes(question.answer)) critical.push(`${roundName}/${question.id}: answer missing from choices`);
  await checkImage({ id: question.id, topic: question.topic, image: question.image });
  for (const comparison of question.comparison ?? []) {
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
        await assertQuestion(`${topic}/quiz/d${difficulty}`, question);
      }

      const headToHeadSession = buildHeadToHeadSession(topic, difficulty, seed + 5, []);
      if (headToHeadSession.length < 12) critical.push(`${topic}/versus/d${difficulty}: short session`);
      for (const question of headToHeadSession) {
        await assertQuestion(`${topic}/versus/d${difficulty}`, question);
        if (!question.comparison || question.comparison.length !== 2) critical.push(`${topic}/versus/d${difficulty}/${question.id}: missing comparison cards`);
      }

      const sortRound = buildSortRound(topic, difficulty, seed + 10);
      if (sortRound.cards.length < 3 || sortRound.cards.length !== sortRound.answerIds.length) critical.push(`${topic}/sort/d${difficulty}: bad card count`);
      assertDistinctSortValues(`${topic}/sort/d${difficulty}`, sortRound);
      await assertRoundCardImages(`${topic}/sort/d${difficulty}`, sortRound);

      const factRound = buildFactRound(topic, difficulty, seed + 20);
      if (!["True", "False"].includes(factRound.answer)) critical.push(`${topic}/fact/d${difficulty}: bad answer`);
      await assertRoundCardImages(`${topic}/fact/d${difficulty}`, factRound);

      const revealRound = buildRevealRound(topic, difficulty, seed + 30);
      if (!revealRound.choices.includes(revealRound.answer)) critical.push(`${topic}/peek/d${difficulty}: answer missing from choices`);
      await assertRoundCardImages(`${topic}/peek/d${difficulty}`, revealRound);

      const numberRound = buildNumberRound(topic, difficulty, seed + 50);
      if (!numberRound.choices.includes(numberRound.answer) || numberRound.cards.length < 2 || numberRound.cards.length !== numberRound.termValues.length) critical.push(`${topic}/number/d${difficulty}: bad number choices`);
      await assertRoundCardImages(`${topic}/number/d${difficulty}`, numberRound);

      const oddRound = buildOddRound(topic, difficulty, seed + 60);
      if (oddRound.cards.length !== 4 || !oddRound.cards.some((card) => card.id === oddRound.answerId)) critical.push(`${topic}/odd/d${difficulty}: bad odd-one-out set`);
      await assertRoundCardImages(`${topic}/odd/d${difficulty}`, oddRound);

      const topTrumpRound = buildTopTrumpRound(topic, difficulty, seed + 70);
      if (!topTrumpRound.player?.stats?.length || !topTrumpRound.computer?.stats?.length) critical.push(`${topic}/trumps/d${difficulty}: missing trumps stats`);
      const playerStatIds = new Set(topTrumpRound.player.stats.map((stat) => stat.id));
      for (const stat of topTrumpRound.computer.stats) {
        if (!playerStatIds.has(stat.id)) critical.push(`${topic}/trumps/d${difficulty}: mismatched stat ${stat.id}`);
      }
      await assertRoundCardImages(`${topic}/trumps/d${difficulty}`, {
        id: topTrumpRound.id,
        topic: topTrumpRound.topic,
        cards: [topTrumpRound.player, topTrumpRound.computer],
      });
    }
  }
};

await checkRoundBuilders();

const playablePacks = loadPlayablePacks();

const checkPlayablePackRoundBuilders = async () => {
  const difficulties = [1, 2, 3];
  for (const pack of playablePacks) {
    const deck = packToPlayableDeck(pack);
    if (deck.cards.length < 4) critical.push(`${deck.id}: needs at least 4 playable cards`);
    assertPackPrimarySortStat(deck);

    for (const difficulty of difficulties) {
      const seed = 20260511 + difficulty * 100 + deck.id.length;

      const sortRound = buildSortRoundFromCards(deck.cards, deck.id, difficulty, seed + 10);
      if (sortRound.cards.length < 3 || sortRound.cards.length !== sortRound.answerIds.length) critical.push(`${deck.id}/sort/d${difficulty}: bad card count`);
      assertDistinctSortValues(`${deck.id}/sort/d${difficulty}`, sortRound);
      await assertRoundCardImages(`${deck.id}/sort/d${difficulty}`, sortRound);

      const factRound = buildFactRoundFromCards(deck.cards, deck.id, difficulty, seed + 20);
      if (!["True", "False"].includes(factRound.answer)) critical.push(`${deck.id}/fact/d${difficulty}: bad answer`);
      await assertRoundCardImages(`${deck.id}/fact/d${difficulty}`, factRound);

      const revealRound = buildRevealRoundFromCards(deck.cards, deck.id, difficulty, seed + 30);
      if (!revealRound.choices.includes(revealRound.answer)) critical.push(`${deck.id}/peek/d${difficulty}: answer missing from choices`);
      await assertRoundCardImages(`${deck.id}/peek/d${difficulty}`, revealRound);

      const numberRound = buildNumberRoundFromCards(deck.cards, deck.id, difficulty, seed + 50);
      if (!numberRound.choices.includes(numberRound.answer) || numberRound.cards.length < 2 || numberRound.cards.length !== numberRound.termValues.length) critical.push(`${deck.id}/number/d${difficulty}: bad number choices`);
      await assertRoundCardImages(`${deck.id}/number/d${difficulty}`, numberRound);

      const oddRound = buildOddRoundFromCards(deck.cards, deck.id, difficulty, seed + 60);
      if (oddRound.cards.length !== 4 || !oddRound.cards.some((card) => card.id === oddRound.answerId)) critical.push(`${deck.id}/odd/d${difficulty}: bad odd-one-out set`);
      await assertRoundCardImages(`${deck.id}/odd/d${difficulty}`, oddRound);

      const topTrumpRound = buildTopTrumpRoundFromCards(deck.cards, deck.id, difficulty, seed + 70);
      if (!topTrumpRound.player?.stats?.length || !topTrumpRound.computer?.stats?.length) critical.push(`${deck.id}/trumps/d${difficulty}: missing trumps stats`);
      const playerStatIds = new Set(topTrumpRound.player.stats.map((stat) => stat.id));
      for (const stat of topTrumpRound.computer.stats) {
        if (!playerStatIds.has(stat.id)) critical.push(`${deck.id}/trumps/d${difficulty}: mismatched stat ${stat.id}`);
      }
      await assertRoundCardImages(`${deck.id}/trumps/d${difficulty}`, {
        id: topTrumpRound.id,
        topic: topTrumpRound.topic,
        cards: [topTrumpRound.player, topTrumpRound.computer],
      });
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
  warnings: warnings.slice(0, 30),
  warningCount: warnings.length,
  critical,
};

if (critical.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(result, null, 2));
