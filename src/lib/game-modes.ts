import {
  buildings,
  heatBandRangeLabel,
  heatProfiles,
  peppers,
  sharks,
  spaceCards,
  topicIds,
  type Building,
  type Difficulty,
  type KnowledgeTopic,
  type Pepper,
  type Shark,
  type SpaceCard,
  type TopicId,
} from "./game-data";

export type GameMode = "mix" | "quiz" | "versus" | "sort" | "fact" | "peek";

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

const formatNumber = (value: number) => value.toLocaleString("en-US");
const feet = (value: number) => `${formatNumber(value)} ft`;

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
