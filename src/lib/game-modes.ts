import {
  buildings,
  heatBands,
  heatBandRangeLabel,
  heatProfiles,
  peppers,
  sharks,
  spaceCards,
  topicIds,
  type Building,
  type Difficulty,
  type HeatBand,
  type KnowledgeTopic,
  type Pepper,
  type Shark,
  type SpaceCard,
  type TopicId,
} from "./game-data";
import { scoreFeaturedContent } from "./content-quality";

export type GameMode = "mix" | "quiz" | "versus" | "sort" | "fact" | "peek" | "build" | "number" | "odd";

export const modeOptions: {
  id: GameMode;
  label: string;
  eyebrow: string;
  loop: string;
}[] = [
  { id: "mix", label: "Mix", eyebrow: "shuffle", loop: "all games" },
  { id: "quiz", label: "Quiz Run", eyebrow: "mixed skills", loop: "15-20 bites" },
  { id: "versus", label: "Versus", eyebrow: "pick winner", loop: "fast duels" },
  { id: "sort", label: "Sort", eyebrow: "order cards", loop: "tap order" },
  { id: "fact", label: "True/False", eyebrow: "read fast", loop: "true or not" },
  { id: "peek", label: "Peek", eyebrow: "picture clue", loop: "reveal guess" },
  { id: "build", label: "Build", eyebrow: "make a fact", loop: "tap words" },
  { id: "number", label: "Numbers", eyebrow: "math clue", loop: "solve gap" },
  { id: "odd", label: "Odd One", eyebrow: "spot rule", loop: "logic pick" },
];

export type { KnowledgeTopic } from "./game-data";
export type TopicScope = TopicId | readonly KnowledgeTopic[];

export type KnowledgeCard = {
  id: string;
  topic: KnowledgeTopic;
  title: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  statLabel: string;
  statValue: number;
  statDisplay: string;
  subStat: string;
  fact: string;
  qualityScore: number;
  qualityFlags: string[];
};

export type SortRound = {
  id: string;
  topic: KnowledgeTopic;
  prompt: string;
  cards: KnowledgeCard[];
  answerIds: string[];
  explanation: string;
  statLabel: string;
};

export type FactRound = {
  id: string;
  topic: KnowledgeTopic;
  prompt: string;
  statement: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  answer: "True" | "False";
  explanation: string;
};

export type RevealRound = {
  id: string;
  topic: KnowledgeTopic;
  prompt: string;
  card: KnowledgeCard;
  choices: string[];
  answer: string;
  explanation: string;
};

export type FactToken = {
  id: string;
  text: string;
};

export type BuildFactRound = {
  id: string;
  topic: KnowledgeTopic;
  prompt: string;
  card: KnowledgeCard;
  tokens: FactToken[];
  answerIds: string[];
  answerText: string;
  explanation: string;
};

export type NumberRound = {
  id: string;
  topic: KnowledgeTopic;
  prompt: string;
  cards: KnowledgeCard[];
  statLabel: string;
  unit: string;
  biggerLabel: string;
  smallerLabel: string;
  biggerValue: number;
  smallerValue: number;
  answer: number;
  choices: number[];
  explanation: string;
};

export type OddRound = {
  id: string;
  topic: KnowledgeTopic;
  prompt: string;
  cards: KnowledgeCard[];
  answerId: string;
  reason: string;
  explanation: string;
};

const formatNumber = (value: number) => value.toLocaleString("en-US");
const formatShu = (value: number) => `${formatNumber(value)} SHU`;
const feet = (value: number) => `${formatNumber(value)} ft`;
const numberWithUnit = (value: number, unit: string) => `${formatNumber(value)} ${unit}`;

const seedRandom = (seed: number) => {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
};

const shuffle = <T,>(items: T[], seed: number) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seedRandom(seed + i) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const sample = <T,>(items: T[], seed: number) => items[Math.floor(seedRandom(seed) * items.length) % items.length];
const sampleSafe = <T,>(items: T[], fallback: T[], seed: number) => sample(items.length ? items : fallback, seed);
const roundTo = (value: number, step: number) => Math.round(value / step) * step;

const allTopics: KnowledgeTopic[] = [...topicIds];

const topicsForScope = (topic: TopicScope): KnowledgeTopic[] => {
  if (typeof topic !== "string") return topic.length ? [...topic] : allTopics;
  return topic === "mixed" ? allTopics : [topic];
};

const topicOrder = (topic: TopicScope, seed: number): KnowledgeTopic => {
  const topics = topicsForScope(topic);
  return topics[Math.floor(seedRandom(seed) * topics.length) % topics.length];
};

const pepperRange = (pepper: Pepper) =>
  pepper.shuMin === pepper.shuMax ? formatNumber(pepper.shuMax) : `${formatNumber(pepper.shuMin)}-${formatNumber(pepper.shuMax)}`;
const heatRank = Object.fromEntries(heatBands.map((heat, index) => [heat, index])) as Record<HeatBand, number>;
const spaceKindLabel = (space: SpaceCard) => {
  if (space.kind === "concept") return "space idea";
  if (space.kind === "region") return "space region";
  return space.kind;
};

const pepperCard = (pepper: Pepper): KnowledgeCard => ({
  id: pepper.id,
  topic: "peppers",
  title: pepper.name,
  image: pepper.image,
  imageAlt: pepper.name,
  imageCredit: pepper.imageCredit,
  statLabel: "Scoville",
  statValue: pepper.shuMax,
  statDisplay: `${formatNumber(pepper.shuMax)} SHU`,
  subStat: `${heatProfiles[pepper.heat].label} · ${heatBandRangeLabel(pepper.heat)} · ${heatProfiles[pepper.heat].emoji}`,
  fact: pepper.fact,
  qualityScore: scoreFeaturedContent({ ...pepper, statValue: pepper.shuMax }).score,
  qualityFlags: scoreFeaturedContent({ ...pepper, statValue: pepper.shuMax }).flags,
});

const buildingCard = (building: Building): KnowledgeCard => ({
  id: building.id,
  topic: "buildings",
  title: building.name,
  image: building.image,
  imageAlt: building.name,
  imageCredit: building.imageCredit,
  statLabel: "Height",
  statValue: building.heightFt,
  statDisplay: feet(building.heightFt),
  subStat: `${building.city}, ${building.country}`,
  fact: building.fact,
  qualityScore: scoreFeaturedContent({ ...building, statValue: building.heightFt }).score,
  qualityFlags: scoreFeaturedContent({ ...building, statValue: building.heightFt }).flags,
});

const sharkCard = (shark: Shark, metric: "length" | "speed" | "power" = "length"): KnowledgeCard => ({
  id: shark.id,
  topic: "sharks",
  title: shark.name,
  image: shark.image,
  imageAlt: shark.name,
  imageCredit: shark.imageCredit,
  statLabel: metric === "length" ? "Size" : metric === "speed" ? "Speed" : "Power",
  statValue: metric === "length" ? shark.lengthFt : metric === "speed" ? shark.speedMph : shark.power,
  statDisplay: metric === "length" ? feet(shark.lengthFt) : metric === "speed" ? `${formatNumber(shark.speedMph)} mph` : `${shark.power}/5`,
  subStat: `${shark.family} · eats ${shark.diet}`,
  fact: shark.fact,
  qualityScore: scoreFeaturedContent({ ...shark, statValue: metric === "length" ? shark.lengthFt : metric === "speed" ? shark.speedMph : shark.power }).score,
  qualityFlags: scoreFeaturedContent({ ...shark, statValue: metric === "length" ? shark.lengthFt : metric === "speed" ? shark.speedMph : shark.power }).flags,
});

const spaceMetricValue = (space: SpaceCard, metric: "distance" | "temperature" | "size" | "moons") => {
  if (metric === "distance") return space.distanceFromSunMillionMiles ?? space.distanceLightYears ?? 0;
  if (metric === "temperature") return space.surfaceTempK ?? space.meanSurfaceTempF ?? 0;
  if (metric === "size") return space.radiusSolar ?? space.diameterMiles ?? 0;
  return space.moons ?? 0;
};

const spaceMetricDisplay = (space: SpaceCard, metric: "distance" | "temperature" | "size" | "moons") => {
  const value = spaceMetricValue(space, metric);
  if (metric === "distance") return space.kind === "star" ? `${formatNumber(value)} ly` : `${formatNumber(value)}M mi`;
  if (metric === "temperature") return space.kind === "star" ? `${formatNumber(value)} K` : `${formatNumber(value)}°F`;
  if (metric === "size") return space.kind === "star" ? `${formatNumber(value)}x Sun` : feet(value);
  return `${formatNumber(value)} moons`;
};

const spaceCard = (space: SpaceCard, metric: "distance" | "temperature" | "size" | "moons" = "distance"): KnowledgeCard => ({
  id: space.id,
  topic: "space",
  title: space.name,
  image: space.image,
  imageAlt: space.name,
  imageCredit: space.imageCredit,
  statLabel: metric === "distance" ? "Distance" : metric === "temperature" ? "Temperature" : metric === "size" ? "Size" : "Moons",
  statValue: spaceMetricValue(space, metric),
  statDisplay: spaceMetricDisplay(space, metric),
  subStat: `${space.group} · ${space.kind}`,
  fact: space.fact,
  qualityScore: scoreFeaturedContent({
    ...space,
    statValue: spaceMetricValue(space, metric),
    sourceCaution: space.statNote ? "estimated stat" : undefined,
  }).score,
  qualityFlags: scoreFeaturedContent({
    ...space,
    statValue: spaceMetricValue(space, metric),
    sourceCaution: space.statNote ? "estimated stat" : undefined,
  }).flags,
});

export const collectionCards = (): KnowledgeCard[] => [
  ...peppers.map(pepperCard),
  ...buildings.map(buildingCard),
  ...sharks.map((shark) => sharkCard(shark)),
  ...spaceCards.map((space) => spaceCard(space, space.kind === "star" ? "temperature" : space.kind === "planet" ? "distance" : "size")),
];

export const buildRevealRound = (topic: TopicScope, difficulty: Difficulty, seed: number): RevealRound => {
  const currentTopic = topicOrder(topic, seed);
  const count = difficulty === 1 ? 3 : 4;
  const allCards = collectionCards();
  const topicCards = allCards.filter((card) => card.topic === currentTopic);
  const card = sample(topicCards, seed + 1);
  const distractors = shuffle(topicCards.filter((item) => item.id !== card.id).map((item) => item.title), seed + 2).slice(0, count - 1);

  return {
    id: `${seed}-peek-${currentTopic}-${card.id}`,
    topic: currentTopic,
    prompt: "What is hiding in the picture?",
    card,
    choices: shuffle([card.title, ...distractors], seed + 3),
    answer: card.title,
    explanation: `${card.title}: ${card.fact}`,
  };
};

const factTokens = (seed: number, parts: string[]) => {
  const answer = parts.map((text, index) => ({ id: `${seed}-token-${index}`, text }));
  return {
    answer,
    shuffled: shuffle(answer, seed + 19),
    sentence: parts.join(" ").replace(/\s+([.,])/g, "$1"),
  };
};

export const buildBuildFactRound = (topic: TopicScope, difficulty: Difficulty, seed: number): BuildFactRound => {
  const currentTopic = topicOrder(topic, seed);

  if (currentTopic === "peppers") {
    const pepper = sample(peppers, seed + 1);
    const card = pepperCard(pepper);
    const parts =
      difficulty === 1
        ? [pepper.name, "has", pepper.heat, "heat."]
        : difficulty === 2
          ? [pepper.name, "can reach", formatShu(pepper.shuMax), "and has", pepper.heat, "heat."]
          : [pepper.name, "fits", heatBandRangeLabel(pepper.heat), "because it can reach", formatShu(pepper.shuMax), "."];
    const tokens = factTokens(seed, parts);
    return {
      id: `${seed}-build-pepper-${pepper.id}`,
      topic: currentTopic,
      prompt: "Build the pepper fact.",
      card,
      tokens: tokens.shuffled,
      answerIds: tokens.answer.map((token) => token.id),
      answerText: tokens.sentence,
      explanation: `${pepper.name}: ${pepper.fact}`,
    };
  }

  if (currentTopic === "buildings") {
    const building = sample(buildings, seed + 2);
    const card = buildingCard(building);
    const parts =
      difficulty === 1
        ? [building.name, "is in", building.city, "."]
        : difficulty === 2
          ? [building.name, "is", feet(building.heightFt), "tall", "in", building.city, "."]
          : [building.name, "is", building.status, "and rises", feet(building.heightFt), "in", building.city, "."];
    const tokens = factTokens(seed, parts);
    return {
      id: `${seed}-build-building-${building.id}`,
      topic: currentTopic,
      prompt: "Build the building fact.",
      card,
      tokens: tokens.shuffled,
      answerIds: tokens.answer.map((token) => token.id),
      answerText: tokens.sentence,
      explanation: `${building.name}: ${building.fact}`,
    };
  }

  if (currentTopic === "space") {
    const space = sample(spaceCards, seed + 3);
    const card = spaceCard(space, space.kind === "star" ? "temperature" : space.kind === "planet" ? "distance" : "size");
    const kindLabel = spaceKindLabel(space);
    const parts =
      difficulty === 1
        ? [space.name, "is a", kindLabel, "."]
        : difficulty === 2
          ? [space.name, "belongs in", space.group, "."]
          : [space.name, "is part of", space.group, "and is a", kindLabel, "."];
    const tokens = factTokens(seed, parts);
    return {
      id: `${seed}-build-space-${space.id}`,
      topic: currentTopic,
      prompt: "Build the space fact.",
      card,
      tokens: tokens.shuffled,
      answerIds: tokens.answer.map((token) => token.id),
      answerText: tokens.sentence,
      explanation: `${space.name}: ${space.fact}`,
    };
  }

  const shark = sample(sharks, seed + 4);
  const card = sharkCard(shark);
  const parts =
    difficulty === 1
      ? [shark.name, "is in the", `${shark.family} group`, "."]
      : difficulty === 2
        ? [shark.name, "can grow to", feet(shark.lengthFt), "and eats", shark.diet, "."]
        : [shark.name, "can swim about", `${formatNumber(shark.speedMph)} mph`, "and eats", shark.diet, "."];
  const tokens = factTokens(seed, parts);
  return {
    id: `${seed}-build-shark-${shark.id}`,
    topic: currentTopic,
    prompt: "Build the shark fact.",
    card,
    tokens: tokens.shuffled,
    answerIds: tokens.answer.map((token) => token.id),
    answerText: tokens.sentence,
    explanation: `${shark.name}: ${shark.fact}`,
  };
};

const numberChoices = (answer: number, step: number, seed: number) => {
  const candidates = [answer, Math.max(step, answer - step), answer + step, answer + step * 2, Math.max(step, answer - step * 2)];
  const uniqueDistractors = Array.from(new Set(candidates.filter((item) => item >= 0 && item !== answer)));
  return shuffle([answer, ...shuffle(uniqueDistractors, seed + 1).slice(0, 3)], seed);
};

export const buildNumberRound = (topic: TopicScope, difficulty: Difficulty, seed: number): NumberRound => {
  const currentTopic = topicOrder(topic, seed);

  if (currentTopic === "peppers") {
    const hotter = sampleSafe(peppers.filter((pepper) => pepper.shuMax >= 50000), peppers, seed + 1);
    const milder = sampleSafe(peppers.filter((pepper) => pepper.id !== hotter.id && pepper.shuMax <= hotter.shuMax * 0.35), peppers.filter((pepper) => pepper.id !== hotter.id), seed + 2);
    const step = difficulty === 1 ? 10000 : difficulty === 2 ? 5000 : 1000;
    const biggerValue = roundTo(hotter.shuMax, step);
    const smallerValue = roundTo(milder.shuMax, step);
    const answer = Math.abs(biggerValue - smallerValue);
    return {
      id: `${seed}-number-peppers-${hotter.id}-${milder.id}`,
      topic: currentTopic,
      prompt: `${hotter.name} can reach ${numberWithUnit(biggerValue, "SHU")}. ${milder.name} can reach ${numberWithUnit(smallerValue, "SHU")}. How much spicier is ${hotter.name}?`,
      cards: [pepperCard(hotter), pepperCard(milder)],
      statLabel: "Scoville",
      unit: "SHU",
      biggerLabel: hotter.name,
      smallerLabel: milder.name,
      biggerValue,
      smallerValue,
      answer,
      choices: numberChoices(answer, Math.max(step, answer > 100000 ? 50000 : step * 2), seed + 3),
      explanation: `${formatNumber(biggerValue)} - ${formatNumber(smallerValue)} = ${formatNumber(answer)} SHU.`,
    };
  }

  if (currentTopic === "buildings") {
    const taller = sampleSafe(buildings.filter((building) => building.heightFt >= 1800), buildings, seed + 4);
    const shorter = sampleSafe(buildings.filter((building) => building.id !== taller.id && building.heightFt <= taller.heightFt - 150), buildings.filter((building) => building.id !== taller.id), seed + 5);
    const step = difficulty === 1 ? 50 : difficulty === 2 ? 25 : 1;
    const biggerValue = roundTo(taller.heightFt, step);
    const smallerValue = roundTo(shorter.heightFt, step);
    const answer = Math.abs(biggerValue - smallerValue);
    return {
      id: `${seed}-number-buildings-${taller.id}-${shorter.id}`,
      topic: currentTopic,
      prompt: `${taller.name} is ${feet(biggerValue)}. ${shorter.name} is ${feet(smallerValue)}. How much taller is ${taller.name}?`,
      cards: [buildingCard(taller), buildingCard(shorter)],
      statLabel: "Height",
      unit: "ft",
      biggerLabel: taller.name,
      smallerLabel: shorter.name,
      biggerValue,
      smallerValue,
      answer,
      choices: numberChoices(answer, difficulty === 1 ? 100 : 50, seed + 6),
      explanation: `${formatNumber(biggerValue)} - ${formatNumber(smallerValue)} = ${formatNumber(answer)} feet.`,
    };
  }

  if (currentTopic === "space") {
    const moreMoons = sampleSafe(spaceCards.filter((space) => (space.moons ?? 0) >= 10), spaceCards.filter((space) => space.moons !== undefined), seed + 7);
    const fewerMoons = sampleSafe(spaceCards.filter((space) => space.id !== moreMoons.id && (space.moons ?? 0) < (moreMoons.moons ?? 0)), spaceCards.filter((space) => space.id !== moreMoons.id && space.moons !== undefined), seed + 8);
    const biggerValue = moreMoons.moons ?? 0;
    const smallerValue = fewerMoons.moons ?? 0;
    const answer = Math.abs(biggerValue - smallerValue);
    return {
      id: `${seed}-number-space-${moreMoons.id}-${fewerMoons.id}`,
      topic: currentTopic,
      prompt: `${moreMoons.name} has ${formatNumber(biggerValue)} moons. ${fewerMoons.name} has ${formatNumber(smallerValue)} moons. How many more moons does ${moreMoons.name} have?`,
      cards: [spaceCard(moreMoons, "moons"), spaceCard(fewerMoons, "moons")],
      statLabel: "Moons",
      unit: "moons",
      biggerLabel: moreMoons.name,
      smallerLabel: fewerMoons.name,
      biggerValue,
      smallerValue,
      answer,
      choices: numberChoices(answer, difficulty === 1 ? 5 : 3, seed + 9),
      explanation: `${formatNumber(biggerValue)} - ${formatNumber(smallerValue)} = ${formatNumber(answer)} moons.`,
    };
  }

  const bigger = sampleSafe(sharks.filter((shark) => shark.lengthFt >= 15), sharks, seed + 10);
  const smaller = sampleSafe(sharks.filter((shark) => shark.id !== bigger.id && shark.lengthFt <= bigger.lengthFt - 5), sharks.filter((shark) => shark.id !== bigger.id), seed + 11);
  const biggerValue = bigger.lengthFt;
  const smallerValue = smaller.lengthFt;
  const answer = Math.abs(biggerValue - smallerValue);
  return {
    id: `${seed}-number-sharks-${bigger.id}-${smaller.id}`,
    topic: currentTopic,
    prompt: `${bigger.name} can be ${feet(biggerValue)}. ${smaller.name} can be ${feet(smallerValue)}. How much longer is ${bigger.name}?`,
    cards: [sharkCard(bigger), sharkCard(smaller)],
    statLabel: "Length",
    unit: "ft",
    biggerLabel: bigger.name,
    smallerLabel: smaller.name,
    biggerValue,
    smallerValue,
    answer,
    choices: numberChoices(answer, difficulty === 1 ? 5 : 3, seed + 12),
    explanation: `${formatNumber(biggerValue)} - ${formatNumber(smallerValue)} = ${formatNumber(answer)} feet.`,
  };
};

export const buildOddRound = (topic: TopicScope, difficulty: Difficulty, seed: number): OddRound => {
  const currentTopic = topicOrder(topic, seed);

  if (currentTopic === "peppers") {
    const eligibleHeats = heatBands.filter((heat) => {
      const sameCount = peppers.filter((pepper) => pepper.heat === heat).length;
      const hasClearOdd = peppers.some((pepper) => Math.abs(heatRank[pepper.heat] - heatRank[heat]) >= 2);
      return sameCount >= 3 && hasClearOdd;
    });
    const heat = sample(eligibleHeats, seed + 1);
    const same = shuffle(peppers.filter((pepper) => pepper.heat === heat), seed + 2).slice(0, 3);
    const odd = sampleSafe(
      peppers.filter((pepper) => Math.abs(heatRank[pepper.heat] - heatRank[heat]) >= 2),
      peppers.filter((pepper) => pepper.heat !== heat),
      seed + 3,
    );
    const cards = shuffle([...same.map(pepperCard), pepperCard(odd)], seed + 4);
    return {
      id: `${seed}-odd-peppers-${heat}-${odd.id}`,
      topic: currentTopic,
      prompt: "Which pepper has the different heat level?",
      cards,
      answerId: odd.id,
      reason: `${odd.name} is ${odd.heat}; the others are ${heat}.`,
      explanation: `The rule is heat zone. ${odd.name} is the odd one out because it is ${odd.heat}.`,
    };
  }

  if (currentTopic === "buildings") {
    const same = shuffle(buildings.filter((building) => building.status === "finished"), seed + 5).slice(0, 3);
    const odd = sampleSafe(buildings.filter((building) => building.status !== "finished"), buildings, seed + 6);
    const cards = shuffle([...same.map(buildingCard), buildingCard(odd)], seed + 7);
    return {
      id: `${seed}-odd-buildings-${odd.id}`,
      topic: currentTopic,
      prompt: "Which building does not fit?",
      cards,
      answerId: odd.id,
      reason: `${odd.name} is ${odd.status}; the others are finished.`,
      explanation: `The rule is building status. ${odd.name} is the odd one out because it is ${odd.status}.`,
    };
  }

  if (currentTopic === "space") {
    const kind = sample(["planet", "star", "concept"] as const, seed + 8);
    const same = shuffle(spaceCards.filter((space) => space.kind === kind), seed + 9).slice(0, 3);
    const odd = sampleSafe(spaceCards.filter((space) => space.kind !== kind), spaceCards, seed + 10);
    const cards = shuffle([...same.map((space) => spaceCard(space)), spaceCard(odd)], seed + 11);
    return {
      id: `${seed}-odd-space-${kind}-${odd.id}`,
      topic: currentTopic,
      prompt: "Which space card does not fit?",
      cards,
      answerId: odd.id,
      reason: `${odd.name} is a ${odd.kind}; the others are ${kind}s.`,
      explanation: `The rule is space type. ${odd.name} is the odd one out because it is a ${odd.kind}.`,
    };
  }

  const families = Array.from(new Set(sharks.map((shark) => shark.family)));
  const family = sampleSafe(families.filter((item) => sharks.filter((shark) => shark.family === item).length >= 3), families, seed + 12);
  const same = shuffle(sharks.filter((shark) => shark.family === family), seed + 13).slice(0, 3);
  const odd = sampleSafe(sharks.filter((shark) => shark.family !== family), sharks, seed + 14);
  const cards = shuffle([...same.map((shark) => sharkCard(shark)), sharkCard(odd)], seed + 15);
  return {
    id: `${seed}-odd-sharks-${family}-${odd.id}`,
    topic: currentTopic,
    prompt: "Which shark does not fit the family rule?",
    cards,
    answerId: odd.id,
    reason: `${odd.name} is a ${odd.family}; the others are ${family}s.`,
    explanation: `The rule is shark family. ${odd.name} is the odd one out because it is a ${odd.family}.`,
  };
};

export const buildSortRound = (topic: TopicScope, difficulty: Difficulty, seed: number): SortRound => {
  const currentTopic = topicOrder(topic, seed);
  const count = difficulty === 1 ? 3 : 4;

  if (currentTopic === "peppers") {
    const cards = shuffle(peppers, seed + 1).slice(0, count).map(pepperCard);
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-peppers`,
      topic: currentTopic,
      prompt: "Tap the peppers from not spicy to insane.",
      cards: shuffle(cards, seed + 2),
      answerIds,
      explanation: [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => `${card.title}: ${card.statDisplay}`).join("  |  "),
      statLabel: "Scoville heat",
    };
  }

  if (currentTopic === "buildings") {
    const cards = shuffle(buildings, seed + 3).slice(0, count).map(buildingCard);
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-buildings`,
      topic: currentTopic,
      prompt: "Tap the buildings from shortest to tallest.",
      cards: shuffle(cards, seed + 4),
      answerIds,
      explanation: [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => `${card.title}: ${card.statDisplay}`).join("  |  "),
      statLabel: "Height",
    };
  }

  if (currentTopic === "space") {
    const metric = sample(["distance", "temperature", "size", "moons"] as const, seed + 5);
    const pool = spaceCards.filter((item) => {
      if (metric === "distance") return item.distanceFromSunMillionMiles !== undefined || item.distanceLightYears !== undefined;
      if (metric === "temperature") return item.surfaceTempK !== undefined || item.meanSurfaceTempF !== undefined;
      if (metric === "size") return item.radiusSolar !== undefined || item.diameterMiles !== undefined;
      return item.moons !== undefined;
    });
    const cards = shuffle(pool, seed + 6).slice(0, count).map((space) => spaceCard(space, metric));
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-space-${metric}`,
      topic: currentTopic,
      prompt: metric === "distance" ? "Tap the space cards from nearest to farthest." : metric === "temperature" ? "Tap from coolest to hottest." : metric === "size" ? "Tap from smallest to biggest." : "Tap from fewest moons to most moons.",
      cards: shuffle(cards, seed + 7),
      answerIds,
      explanation: [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => `${card.title}: ${card.statDisplay}`).join("  |  "),
      statLabel: metric === "distance" ? "Distance" : metric === "temperature" ? "Temperature" : metric === "size" ? "Size" : "Moons",
    };
  }

  const metric = sample(["length", "speed", "power"] as const, seed + 5);
  const cards = shuffle(sharks, seed + 6).slice(0, count).map((shark) => sharkCard(shark, metric));
  const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
  return {
    id: `${seed}-sort-sharks-${metric}`,
    topic: currentTopic,
    prompt: metric === "length" ? "Tap the sharks from smallest to biggest." : metric === "speed" ? "Tap the sharks from slowest to fastest." : "Tap the sharks from lowest power to highest power.",
    cards: shuffle(cards, seed + 7),
    answerIds,
    explanation: [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => `${card.title}: ${card.statDisplay}`).join("  |  "),
    statLabel: metric === "length" ? "Size" : metric === "speed" ? "Speed" : "Power",
  };
};

export const buildFactRound = (topic: TopicScope, difficulty: Difficulty, seed: number): FactRound => {
  const currentTopic = topicOrder(topic, seed);
  const truthful = seedRandom(seed + 11) > 0.46;

  if (currentTopic === "peppers") {
    const pepper = sample(peppers, seed + 12);
    const fake = sample(peppers.filter((item) => item.id !== pepper.id && item.heat !== pepper.heat), seed + 13);
    const useMath = difficulty > 1 && seedRandom(seed + 14) > 0.5;
    const statement = truthful
      ? useMath
        ? `${pepper.name} can reach about ${formatNumber(pepper.shuMax)} Scoville heat units.`
        : `${pepper.name} belongs in the ${pepper.heat} heat zone.`
      : useMath
        ? `${pepper.name} can reach about ${formatNumber(fake.shuMax)} Scoville heat units.`
        : `${pepper.name} belongs in the ${fake.heat} heat zone.`;
    return {
      id: `${seed}-fact-pepper-${pepper.id}`,
      topic: currentTopic,
      prompt: "True or false?",
      statement,
      image: pepper.image,
      imageAlt: pepper.name,
      imageCredit: pepper.imageCredit,
      answer: truthful ? "True" : "False",
      explanation: `${pepper.name} can reach ${formatNumber(pepper.shuMax)} SHU, so it is ${pepper.heat} (${heatBandRangeLabel(pepper.heat)}). Its full range is ${pepperRange(pepper)} SHU.`,
    };
  }

  if (currentTopic === "buildings") {
    const building = sample(buildings, seed + 15);
    const fake = sample(buildings.filter((item) => item.id !== building.id), seed + 16);
    const factType = difficulty === 1 ? "city" : sample(["city", "height", "status"] as const, seed + 17);
    const statement = truthful
      ? factType === "height"
        ? `${building.name} is ${feet(building.heightFt)} tall.`
        : factType === "status"
          ? `${building.name} is ${building.status}.`
          : `${building.name} is in ${building.city}.`
      : factType === "height"
        ? `${building.name} is ${feet(fake.heightFt)} tall.`
        : factType === "status"
          ? `${building.name} is ${building.status === "finished" ? "under construction" : "finished"}.`
          : `${building.name} is in ${fake.city}.`;
    return {
      id: `${seed}-fact-building-${building.id}`,
      topic: currentTopic,
      prompt: "True or false?",
      statement,
      image: building.image,
      imageAlt: building.name,
      imageCredit: building.imageCredit,
      answer: truthful ? "True" : "False",
      explanation: `${building.name} is ${feet(building.heightFt)} tall and is in ${building.city}, ${building.country}.`,
    };
  }

  if (currentTopic === "space") {
    const space = sample(spaceCards, seed + 18);
    const fake = sample(spaceCards.filter((item) => item.id !== space.id), seed + 19);
    const factType = difficulty === 1 ? "group" : sample(["group", "fact", "temperature", "distance"] as const, seed + 20);
    const realTemperature = space.surfaceTempK ?? space.meanSurfaceTempF;
    const fakeTemperature = fake.surfaceTempK ?? fake.meanSurfaceTempF;
    const realDistance = space.distanceFromSunMillionMiles ?? space.distanceLightYears;
    const fakeDistance = fake.distanceFromSunMillionMiles ?? fake.distanceLightYears;
    const statement = truthful
      ? factType === "temperature" && realTemperature !== undefined
        ? `${space.name} has a listed temperature of about ${spaceMetricDisplay(space, "temperature")}.`
        : factType === "distance" && realDistance !== undefined
          ? `${space.name} has a listed distance of about ${spaceMetricDisplay(space, "distance")}.`
          : factType === "fact"
            ? space.fact
            : `${space.name} belongs in ${space.group}.`
      : factType === "temperature" && fakeTemperature !== undefined
        ? `${space.name} has a listed temperature of about ${spaceMetricDisplay(fake, "temperature")}.`
        : factType === "distance" && fakeDistance !== undefined
          ? `${space.name} has a listed distance of about ${spaceMetricDisplay(fake, "distance")}.`
          : factType === "fact"
            ? fake.fact
            : `${space.name} belongs in ${fake.group}.`;
    return {
      id: `${seed}-fact-space-${space.id}`,
      topic: currentTopic,
      prompt: "True or false?",
      statement,
      image: space.image,
      imageAlt: space.name,
      imageCredit: space.imageCredit,
      answer: truthful ? "True" : "False",
      explanation: `${space.name}: ${space.fact}`,
    };
  }

  const shark = sample(sharks, seed + 18);
  const fake = sample(sharks.filter((item) => item.id !== shark.id), seed + 19);
  const factType = difficulty === 1 ? "family" : sample(["family", "speed", "size", "diet"] as const, seed + 20);
  const statement = truthful
    ? factType === "speed"
      ? `${shark.name} can swim about ${formatNumber(shark.speedMph)} mph.`
      : factType === "size"
        ? `${shark.name} can grow to about ${feet(shark.lengthFt)}.`
        : factType === "diet"
          ? `${shark.name} eats ${shark.diet}.`
          : `${shark.name} is a ${shark.family}.`
    : factType === "speed"
      ? `${shark.name} can swim about ${formatNumber(fake.speedMph)} mph.`
      : factType === "size"
        ? `${shark.name} can grow to about ${feet(fake.lengthFt)}.`
        : factType === "diet"
          ? `${shark.name} eats ${fake.diet}.`
          : `${shark.name} is a ${fake.family}.`;
  return {
    id: `${seed}-fact-shark-${shark.id}`,
    topic: currentTopic,
    prompt: "True or false?",
    statement,
    image: shark.image,
    imageAlt: shark.name,
    imageCredit: shark.imageCredit,
    answer: truthful ? "True" : "False",
    explanation: `${shark.name} is a ${shark.family}, can grow to about ${feet(shark.lengthFt)}, and eats ${shark.diet}.`,
  };
};
