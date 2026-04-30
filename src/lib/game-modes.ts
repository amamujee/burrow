import {
  buildings,
  heatProfiles,
  peppers,
  sharks,
  type Building,
  type Difficulty,
  type Pepper,
  type Shark,
  type TopicId,
} from "./game-data";

export type GameMode = "quiz" | "versus" | "sort" | "fact" | "collection";

export const modeOptions: {
  id: GameMode;
  label: string;
  eyebrow: string;
  loop: string;
}[] = [
  { id: "quiz", label: "Quiz Run", eyebrow: "mixed skills", loop: "15-20 bites" },
  { id: "versus", label: "Versus", eyebrow: "pick winner", loop: "fast duels" },
  { id: "sort", label: "Sort", eyebrow: "order cards", loop: "tap order" },
  { id: "fact", label: "Fact/Fake", eyebrow: "read fast", loop: "true or not" },
  { id: "collection", label: "Collection", eyebrow: "unlocks", loop: "progress book" },
];

export type KnowledgeTopic = "peppers" | "buildings" | "sharks";

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
  answer: "Fact" | "Fake";
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

const topicOrder = (topic: TopicId, seed: number): KnowledgeTopic => {
  const topics: KnowledgeTopic[] = topic === "mixed" ? ["peppers", "buildings", "sharks"] : [topic];
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
  subStat: `${heatProfiles[pepper.heat].label} · ${"🌶️".repeat(heatProfiles[pepper.heat].icons) || "0 heat"}`,
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

export const collectionCards = (): KnowledgeCard[] => [
  ...peppers.map(pepperCard),
  ...buildings.map(buildingCard),
  ...sharks.map((shark) => sharkCard(shark)),
];

export const buildSortRound = (topic: TopicId, difficulty: Difficulty, seed: number): SortRound => {
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

export const buildFactRound = (topic: TopicId, difficulty: Difficulty, seed: number): FactRound => {
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
      prompt: "Fact or fake?",
      statement,
      image: pepper.image,
      imageAlt: pepper.name,
      imageCredit: pepper.imageCredit,
      answer: truthful ? "Fact" : "Fake",
      explanation: `${pepper.name} is ${pepper.heat} and its range is ${pepperRange(pepper)} SHU.`,
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
      prompt: "Fact or fake?",
      statement,
      image: building.image,
      imageAlt: building.name,
      imageCredit: building.imageCredit,
      answer: truthful ? "Fact" : "Fake",
      explanation: `${building.name} is ${feet(building.heightFt)} tall and is in ${building.city}, ${building.country}.`,
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
    prompt: "Fact or fake?",
    statement,
    image: shark.image,
    imageAlt: shark.name,
    imageCredit: shark.imageCredit,
    answer: truthful ? "Fact" : "Fake",
    explanation: `${shark.name} is a ${shark.family}, can grow to about ${feet(shark.lengthFt)}, and eats ${shark.diet}.`,
  };
};
