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

export type TopicScope = TopicId | readonly KnowledgeTopic[];

export type QuestionKind =
  | "pepper-heat"
  | "pepper-shu"
  | "pepper-hotter"
  | "pepper-reading"
  | "building-name"
  | "building-height"
  | "building-taller"
  | "building-difference"
  | "building-reading"
  | "shark-name"
  | "shark-family"
  | "shark-bigger"
  | "shark-faster"
  | "shark-difference"
  | "shark-power"
  | "shark-reading"
  | "space-name"
  | "space-hotter"
  | "space-bigger"
  | "space-farther"
  | "space-moons"
  | "space-concept"
  | "space-reading";

export type ComparisonCard = {
  label: "A" | "B";
  topic: KnowledgeTopic;
  title: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  statLabel: string;
  statValue: string;
  subStat: string;
  meterValue: number;
  meterMax: number;
};

export type Question = {
  id: string;
  topic: KnowledgeTopic;
  kind: QuestionKind;
  prompt: string;
  readingClue?: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  choices: string[];
  answer: string;
  explanation: string;
  comparison?: ComparisonCard[];
  heatMeter?: {
    label: HeatBand;
    icons: number;
    emoji: string;
    line: string;
  };
  numberLine?: {
    label: string;
    value: number;
    max: number;
    unit: string;
  };
};

const sessionLength = 16;
const maxShu = 2693000;
const maxHeight = 3281;
const maxSharkLength = 40;
const maxSharkSpeed = 45;
const maxSharkPower = 5;
const allTopics: KnowledgeTopic[] = [...topicIds];

const choiceCountForDifficulty = (difficulty: Difficulty) => (difficulty === 1 ? 3 : 4);

const shuffle = <T,>(items: T[], seed: number) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seedRandom(seed + i) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const topicsForScope = (topic: TopicScope): KnowledgeTopic[] => {
  if (typeof topic !== "string") return topic.length ? [...topic] : allTopics;
  return topic === "mixed" ? allTopics : [topic];
};

const seedRandom = (seed: number) => {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
};

const sample = <T,>(items: T[], seed: number) => items[Math.floor(seedRandom(seed) * items.length) % items.length];

const formatNumber = (value: number) => value.toLocaleString("en-US");
const formatShu = (value: number) => `${formatNumber(value)} SHU`;
const range = (pepper: Pepper) => pepper.shuMin === pepper.shuMax ? formatNumber(pepper.shuMax) : `${formatNumber(pepper.shuMin)}-${formatNumber(pepper.shuMax)}`;
const feet = (value: number) => `${formatNumber(value)} ft`;
const heatMeter = (heat: HeatBand) => ({ label: heat, icons: heatProfiles[heat].icons, emoji: heatProfiles[heat].emoji, line: heatProfiles[heat].kidLine });
const heatBandExplanation = (pepper: Pepper) => `${pepper.name} is ${pepper.heat} because its top Scoville score is ${formatShu(pepper.shuMax)}, which fits the ${heatBandRangeLabel(pepper.heat)} band.`;
const choiceSet = <T,>(correct: T, options: T[], seed: number, count: number) => {
  const distractors = shuffle(options.filter((option) => option !== correct), seed).slice(0, count - 1);
  return shuffle([correct, ...distractors], seed + 1);
};
const roundTo = (value: number, step: number) => Math.max(step, Math.round(value / step) * step);

const displayHeightChoice = (value: number, difficulty: Difficulty) => {
  if (difficulty === 3) return feet(value);
  return `about ${formatNumber(roundTo(value, difficulty === 1 ? 500 : 100))} ft`;
};

const buildingHeightChoices = (building: Building, difficulty: Difficulty, seed: number) => {
  const correct = displayHeightChoice(building.heightFt, difficulty);
  const correctValue = difficulty === 3 ? building.heightFt : roundTo(building.heightFt, difficulty === 1 ? 500 : 100);
  const minGap = difficulty === 1 ? 500 : difficulty === 2 ? 250 : 160;
  const generated = [
    correctValue - minGap * 2,
    correctValue - minGap,
    correctValue + minGap,
    correctValue + minGap * 2,
    1000,
    1500,
    2000,
    2500,
    3000,
  ];
  const fromBuildings = buildings
    .filter((item) => item.id !== building.id)
    .map((item) => (difficulty === 3 ? item.heightFt : roundTo(item.heightFt, difficulty === 1 ? 500 : 100)));
  const labels = [...fromBuildings, ...generated]
    .filter((value) => value >= 300 && value <= maxHeight + 250)
    .filter((value) => Math.abs(value - correctValue) >= minGap)
    .map((value) => (difficulty === 3 ? feet(value) : `about ${formatNumber(value)} ft`))
    .filter((label) => label !== correct);
  const distractors = Array.from(new Set(shuffle(labels, seed + 1))).slice(0, choiceCountForDifficulty(difficulty) - 1);
  return shuffle([correct, ...distractors], seed + 2);
};

const buildingDifferenceChoices = (diff: number, difficulty: Difficulty, seed: number) => {
  const gap = difficulty === 1 ? 200 : difficulty === 2 ? 100 : 50;
  const values = [
    diff,
    diff + gap,
    diff + gap * 2,
    Math.max(gap, diff - gap),
    Math.max(gap, diff - gap * 2),
  ];
  const labels = Array.from(new Set(values.map((value) => `${formatNumber(value)} ft`)));
  const correct = `${formatNumber(diff)} ft`;
  const distractors = shuffle(labels.filter((label) => label !== correct), seed + 1).slice(0, choiceCountForDifficulty(difficulty) - 1);
  return shuffle([correct, ...distractors], seed + 2);
};

const pepperCard = (pepper: Pepper, label: "A" | "B"): ComparisonCard => ({
  label,
  topic: "peppers",
  title: pepper.name,
  image: pepper.image,
  imageAlt: pepper.name,
  imageCredit: pepper.imageCredit,
  statLabel: "Scoville",
  statValue: formatShu(pepper.shuMax),
  subStat: `${heatProfiles[pepper.heat].label} · ${heatBandRangeLabel(pepper.heat)}`,
  meterValue: pepper.shuMax,
  meterMax: maxShu,
});

const buildingCard = (building: Building, label: "A" | "B"): ComparisonCard => ({
  label,
  topic: "buildings",
  title: building.name,
  image: building.image,
  imageAlt: building.name,
  imageCredit: building.imageCredit,
  statLabel: "Height",
  statValue: feet(building.heightFt),
  subStat: `${building.city}, ${building.country}`,
  meterValue: building.heightFt,
  meterMax: maxHeight,
});

const sharkCard = (shark: Shark, label: "A" | "B", stat: "length" | "speed" | "power"): ComparisonCard => ({
  label,
  topic: "sharks",
  title: shark.name,
  image: shark.image,
  imageAlt: shark.name,
  imageCredit: shark.imageCredit,
  statLabel: stat === "length" ? "Size" : stat === "speed" ? "Speed" : "Power",
  statValue: stat === "length" ? feet(shark.lengthFt) : stat === "speed" ? `${formatNumber(shark.speedMph)} mph` : `${shark.power}/5`,
  subStat: `${shark.family} · eats ${shark.diet}`,
  meterValue: stat === "length" ? shark.lengthFt : stat === "speed" ? shark.speedMph : shark.power,
  meterMax: stat === "length" ? maxSharkLength : stat === "speed" ? maxSharkSpeed : maxSharkPower,
});

const spacePlanets = spaceCards.filter((item) => item.kind === "planet");
const spaceStars = spaceCards.filter((item) => item.kind === "star");
const spaceConcepts = spaceCards.filter((item) => item.kind === "concept");
const maxPlanetDistance = Math.max(...spacePlanets.map((item) => item.distanceFromSunMillionMiles ?? 0));
const maxPlanetTemp = 900;
const maxStarTemp = Math.max(...spaceStars.map((item) => item.surfaceTempK ?? 0));
const maxStarRadius = Math.max(...spaceStars.map((item) => item.radiusSolar ?? 0));
const maxPlanetMoons = Math.max(...spacePlanets.map((item) => item.moons ?? 0));

const spaceValue = (item: SpaceCard, stat: "temp" | "radius" | "distance" | "moons") => {
  if (stat === "temp") return item.kind === "star" ? item.surfaceTempK ?? 0 : item.meanSurfaceTempF ?? 0;
  if (stat === "radius") return item.radiusSolar ?? item.diameterMiles ?? 0;
  if (stat === "distance") return item.distanceFromSunMillionMiles ?? item.distanceLightYears ?? 0;
  return item.moons ?? 0;
};

const spaceStatDisplay = (value: number, stat: "temp" | "radius" | "distance" | "moons", item: SpaceCard) => {
  if (stat === "temp") return item.kind === "star" ? `${formatNumber(value)} K` : `${formatNumber(value)}°F`;
  if (stat === "radius") return item.kind === "star" ? `${formatNumber(value)}x Sun radius` : `${formatNumber(value)} mi wide`;
  if (stat === "distance") return item.kind === "star" ? `${formatNumber(value)} ly` : `${formatNumber(value)}M mi`;
  return `${formatNumber(value)} moons`;
};

const spaceMeterMax = (stat: "temp" | "radius" | "distance" | "moons", item: SpaceCard) => {
  if (stat === "temp") return item.kind === "star" ? maxStarTemp : maxPlanetTemp;
  if (stat === "radius") return item.kind === "star" ? maxStarRadius : 90000;
  if (stat === "distance") return item.kind === "star" ? 20000 : maxPlanetDistance;
  return maxPlanetMoons;
};

const spaceCard = (item: SpaceCard, label: "A" | "B", stat: "temp" | "radius" | "distance" | "moons"): ComparisonCard => {
  const value = spaceValue(item, stat);
  return {
    label,
    topic: "space",
    title: item.name,
    image: item.image,
    imageAlt: item.name,
    imageCredit: item.imageCredit,
    statLabel: stat === "temp" ? "Temperature" : stat === "radius" ? "Size" : stat === "distance" ? "Distance" : "Moons",
    statValue: spaceStatDisplay(value, stat, item),
    subStat: `${item.group}${item.statNote ? ` · ${item.statNote}` : ""}`,
    meterValue: value,
    meterMax: spaceMeterMax(stat, item),
  };
};

const comparisonAnswer = (cards: ComparisonCard[], winnerName: string) => `${cards.find((card) => card.title === winnerName)?.label}: ${winnerName}`;

const pepperHotterQuestion = (seed: number, first: Pepper, second: Pepper): Question => {
  const hotter = first.shuMax >= second.shuMax ? first : second;
  const cards = shuffle([pepperCard(first, "A"), pepperCard(second, "B")], seed + 12);
  return {
    id: `${seed}-pepper-hotter-${first.id}-${second.id}`,
    topic: "peppers",
    kind: "pepper-hotter",
    prompt: `Which pepper is spicier: ${first.name} or ${second.name}?`,
    image: hotter.image,
    imageAlt: hotter.name,
    imageCredit: hotter.imageCredit,
    comparison: cards,
    choices: cards.map((card) => `${card.label}: ${card.title}`),
    answer: comparisonAnswer(cards, hotter.name),
    explanation: `${hotter.name} can reach ${formatShu(hotter.shuMax)}. Bigger Scoville numbers mean more heat.`,
    heatMeter: heatMeter(hotter.heat),
  };
};

const buildingTallerQuestion = (seed: number, first: Building, second: Building): Question => {
  const taller = first.heightFt >= second.heightFt ? first : second;
  const cards = shuffle([buildingCard(first, "A"), buildingCard(second, "B")], seed + 27);
  return {
    id: `${seed}-building-taller-${first.id}-${second.id}`,
    topic: "buildings",
    kind: "building-taller",
    prompt: `Which building is taller: ${first.name} or ${second.name}?`,
    image: taller.image,
    imageAlt: taller.name,
    imageCredit: taller.imageCredit,
    comparison: cards,
    choices: cards.map((card) => `${card.label}: ${card.title}`),
    answer: comparisonAnswer(cards, taller.name),
    explanation: `${taller.name} is ${feet(taller.heightFt)} tall. Taller means the bigger number wins.`,
    numberLine: { label: taller.name, value: taller.heightFt, max: maxHeight, unit: "ft" },
  };
};

const sharkComparisonQuestion = (seed: number, first: Shark, second: Shark, stat: "length" | "speed" | "power"): Question => {
  const firstValue = stat === "length" ? first.lengthFt : stat === "speed" ? first.speedMph : first.power;
  const secondValue = stat === "length" ? second.lengthFt : stat === "speed" ? second.speedMph : second.power;
  const winner = firstValue >= secondValue ? first : second;
  const winnerValue = stat === "length" ? winner.lengthFt : stat === "speed" ? winner.speedMph : winner.power;
  const cards = shuffle([sharkCard(first, "A", stat), sharkCard(second, "B", stat)], seed + 47);
  const kind: QuestionKind = stat === "length" ? "shark-bigger" : stat === "speed" ? "shark-faster" : "shark-power";
  const prompt = stat === "length"
    ? `Which shark is bigger: ${first.name} or ${second.name}?`
    : stat === "speed"
      ? `Which shark is faster: ${first.name} or ${second.name}?`
      : `Which shark has more predator power: ${first.name} or ${second.name}?`;
  const unit = stat === "length" ? "feet long" : stat === "speed" ? "mph" : "power points";
  return {
    id: `${seed}-${kind}-${first.id}-${second.id}`,
    topic: "sharks",
    kind,
    prompt,
    image: winner.image,
    imageAlt: winner.name,
    imageCredit: winner.imageCredit,
    comparison: cards,
    choices: cards.map((card) => `${card.label}: ${card.title}`),
    answer: comparisonAnswer(cards, winner.name),
    explanation: `${winner.name} wins this matchup with ${formatNumber(winnerValue)} ${unit}.`,
    numberLine: { label: stat === "length" ? "Size" : stat === "speed" ? "Speed" : "Power", value: winnerValue, max: stat === "length" ? maxSharkLength : stat === "speed" ? maxSharkSpeed : maxSharkPower, unit: stat === "length" ? "ft" : stat === "speed" ? "mph" : "/5" },
  };
};

const spaceComparisonQuestion = (seed: number, first: SpaceCard, second: SpaceCard, stat: "temp" | "radius" | "distance" | "moons"): Question => {
  const winner = spaceValue(first, stat) >= spaceValue(second, stat) ? first : second;
  const cards = shuffle([spaceCard(first, "A", stat), spaceCard(second, "B", stat)], seed + 67);
  const kind: QuestionKind = stat === "temp" ? "space-hotter" : stat === "radius" ? "space-bigger" : stat === "distance" ? "space-farther" : "space-moons";
  const noun = first.kind === "star" ? "star" : "planet";
  const prompt = stat === "temp"
    ? `Which ${noun} is hotter: ${first.name} or ${second.name}?`
    : stat === "radius"
      ? `Which ${noun} is bigger: ${first.name} or ${second.name}?`
      : stat === "distance"
        ? `Which ${noun} is farther away: ${first.name} or ${second.name}?`
        : `Which planet has more moons: ${first.name} or ${second.name}?`;
  return {
    id: `${seed}-${kind}-${first.id}-${second.id}`,
    topic: "space",
    kind,
    prompt,
    image: winner.image,
    imageAlt: winner.name,
    imageCredit: winner.imageCredit,
    comparison: cards,
    choices: cards.map((card) => `${card.label}: ${card.title}`),
    answer: comparisonAnswer(cards, winner.name),
    explanation: `${winner.name} wins with ${spaceStatDisplay(spaceValue(winner, stat), stat, winner)}. ${winner.statNote ?? winner.fact}`,
    numberLine: { label: stat === "temp" ? "Temperature" : stat === "radius" ? "Size" : stat === "distance" ? "Distance" : "Moons", value: spaceValue(winner, stat), max: spaceMeterMax(stat, winner), unit: winner.kind === "star" && stat === "radius" ? "x Sun" : stat === "temp" ? (winner.kind === "star" ? "K" : "°F") : stat === "distance" ? (winner.kind === "star" ? "ly" : "million mi") : stat === "moons" ? "moons" : "mi" },
  };
};

type HeadToHeadSpec =
  | { topic: "peppers"; stat: "heat"; firstId: string; secondId: string }
  | { topic: "buildings"; stat: "height"; firstId: string; secondId: string }
  | { topic: "sharks"; stat: "length" | "speed" | "power"; firstId: string; secondId: string }
  | { topic: "space"; stat: "temp" | "radius" | "distance" | "moons"; firstId: string; secondId: string };

const curatedHeadToHeads: HeadToHeadSpec[] = [
  { topic: "peppers", stat: "heat", firstId: "trinidad-scorpion", secondId: "pepper-x" },
  { topic: "peppers", stat: "heat", firstId: "trinidad-scorpion", secondId: "carolina-reaper" },
  { topic: "peppers", stat: "heat", firstId: "dragons-breath", secondId: "carolina-reaper" },
  { topic: "peppers", stat: "heat", firstId: "ghost-pepper", secondId: "habanero" },
  { topic: "peppers", stat: "heat", firstId: "jalapeno", secondId: "serrano" },
  { topic: "peppers", stat: "heat", firstId: "scotch-bonnet", secondId: "cayenne" },
  { topic: "buildings", stat: "height", firstId: "burj-khalifa", secondId: "merdeka-118" },
  { topic: "buildings", stat: "height", firstId: "shanghai-tower", secondId: "makkah-clock" },
  { topic: "buildings", stat: "height", firstId: "one-wtc", secondId: "taipei-101" },
  { topic: "buildings", stat: "height", firstId: "jeddah-tower", secondId: "burj-khalifa" },
  { topic: "sharks", stat: "speed", firstId: "tiger-shark", secondId: "blue-shark" },
  { topic: "sharks", stat: "speed", firstId: "shortfin-mako", secondId: "great-white" },
  { topic: "sharks", stat: "speed", firstId: "common-thresher", secondId: "blue-shark" },
  { topic: "sharks", stat: "length", firstId: "whale-shark", secondId: "basking-shark" },
  { topic: "sharks", stat: "length", firstId: "great-hammerhead", secondId: "tiger-shark" },
  { topic: "sharks", stat: "power", firstId: "bull-shark", secondId: "nurse-shark" },
  { topic: "space", stat: "temp", firstId: "venus", secondId: "mercury" },
  { topic: "space", stat: "radius", firstId: "jupiter", secondId: "neptune" },
  { topic: "space", stat: "distance", firstId: "neptune", secondId: "mars" },
  { topic: "space", stat: "temp", firstId: "rigel", secondId: "betelgeuse" },
  { topic: "space", stat: "radius", firstId: "betelgeuse", secondId: "sirius" },
];

const findById = <T extends { id: string }>(items: T[], id: string) => items.find((item) => item.id === id);

const headToHeadQuestionFromSpec = (spec: HeadToHeadSpec, seed: number): Question | null => {
  if (spec.topic === "peppers") {
    const first = findById(peppers, spec.firstId);
    const second = findById(peppers, spec.secondId);
    return first && second ? pepperHotterQuestion(seed, first, second) : null;
  }

  if (spec.topic === "buildings") {
    const first = findById(buildings, spec.firstId);
    const second = findById(buildings, spec.secondId);
    return first && second ? buildingTallerQuestion(seed, first, second) : null;
  }

  if (spec.topic === "sharks") {
    const first = findById(sharks, spec.firstId);
    const second = findById(sharks, spec.secondId);
    return first && second ? sharkComparisonQuestion(seed, first, second, spec.stat) : null;
  }

  const first = findById(spaceCards, spec.firstId);
  const second = findById(spaceCards, spec.secondId);
  return first && second ? spaceComparisonQuestion(seed, first, second, spec.stat) : null;
};

const randomHeadToHeadQuestion = (topic: KnowledgeTopic, difficulty: Difficulty, seed: number): Question => {
  if (topic === "peppers") {
    const first = sample(peppers, seed + 1);
    const second = sample(peppers.filter((item) => item.id !== first.id), seed + 2);
    return pepperHotterQuestion(seed, first, second);
  }

  if (topic === "buildings") {
    const first = sample(buildings, seed + 3);
    const second = sample(buildings.filter((item) => item.id !== first.id), seed + 4);
    return buildingTallerQuestion(seed, first, second);
  }

  if (topic === "sharks") {
    const stats: ("length" | "speed" | "power")[] = difficulty === 1 ? ["length", "speed"] : ["length", "speed", "power"];
    const stat = sample(stats, seed + 5);
    const first = sample(sharks, seed + 6);
    const second = sample(sharks.filter((item) => item.id !== first.id), seed + 7);
    return sharkComparisonQuestion(seed, first, second, stat);
  }

  const stats: ("temp" | "radius" | "distance" | "moons")[] = difficulty === 1 ? ["radius", "distance", "temp"] : ["temp", "radius", "distance", "moons"];
  const stat = sample(stats, seed + 8);
  const pool = stat === "distance" || stat === "moons"
    ? spacePlanets
    : seedRandom(seed + 9) > 0.5
      ? spaceStars
      : spacePlanets.filter((card) => stat !== "temp" || card.meanSurfaceTempF !== undefined);
  const first = sample(pool, seed + 10);
  const second = sample(pool.filter((item) => item.id !== first.id), seed + 11);
  return spaceComparisonQuestion(seed, first, second, stat);
};

const pepperQuestion = (seed: number, difficulty: Difficulty): Question => {
  const pepper = sample(peppers, seed);
  const kinds: QuestionKind[] = difficulty === 1
    ? ["pepper-heat", "pepper-shu", "pepper-hotter", "pepper-reading"]
    : difficulty === 2
      ? ["pepper-heat", "pepper-shu", "pepper-hotter", "pepper-reading"]
      : ["pepper-shu", "pepper-hotter", "pepper-reading", "pepper-heat"];
  const kind = sample(kinds, seed + 3);

  if (kind === "pepper-heat") {
    const choices = choiceSet(pepper.heat, heatBands, seed + 7, choiceCountForDifficulty(difficulty));
    return {
      id: `${seed}-pepper-heat-${pepper.id}`,
      topic: "peppers",
      kind,
      prompt: `Look at this ${pepper.color} pepper. What heat zone is ${pepper.name}?`,
      image: pepper.image,
      imageAlt: pepper.name,
      imageCredit: pepper.imageCredit,
      choices,
      answer: pepper.heat,
      explanation: `${heatBandExplanation(pepper)} ${heatProfiles[pepper.heat].kidLine}`,
      heatMeter: heatMeter(pepper.heat),
      numberLine: { label: "Scoville score", value: pepper.shuMax, max: maxShu, unit: "SHU" },
    };
  }

  if (kind === "pepper-hotter") {
    const challenger = sample(peppers.filter((item) => item.id !== pepper.id), seed + 11);
    return pepperHotterQuestion(seed, pepper, challenger);
  }

  if (kind === "pepper-reading") {
    const words: Record<HeatBand, string> = {
      "not spicy": "Not spicy means no pepper burn.",
      mild: "Mild means a tiny spicy spark.",
      warm: "Warm means two-pepper heat.",
      hot: "Hot means a real spicy kick.",
      "very hot": "Very hot means tiny bites only.",
      insane: "Insane means super-hot legend zone.",
    };
    const choices = choiceSet(pepper.heat, heatBands, seed + 13, choiceCountForDifficulty(difficulty));
    return {
      id: `${seed}-pepper-reading-${pepper.id}`,
      topic: "peppers",
      kind,
      prompt: `What word best matches ${pepper.name}?`,
      readingClue: words[pepper.heat],
      image: pepper.image,
      imageAlt: pepper.name,
      imageCredit: pepper.imageCredit,
      choices,
      answer: pepper.heat,
      explanation: heatBandExplanation(pepper),
      heatMeter: heatMeter(pepper.heat),
    };
  }

  const correct = `${range(pepper)} SHU`;
  const otherRanges = peppers.filter((item) => item.id !== pepper.id).map((item) => `${range(item)} SHU`);
  return {
    id: `${seed}-pepper-shu-${pepper.id}`,
    topic: "peppers",
    kind: "pepper-shu",
    prompt: `What Scoville score range fits ${pepper.name}?`,
    image: pepper.image,
    imageAlt: pepper.name,
    imageCredit: pepper.imageCredit,
    choices: shuffle([correct, ...shuffle(otherRanges, seed + 17).slice(0, choiceCountForDifficulty(difficulty) - 1)], seed + 18),
    answer: correct,
    explanation: `${pepper.name} is about ${correct}. Its top score puts it in the ${pepper.heat} band (${heatBandRangeLabel(pepper.heat)}).`,
    heatMeter: heatMeter(pepper.heat),
    numberLine: { label: "Heat", value: pepper.shuMax, max: maxShu, unit: "SHU" },
  };
};

const buildingQuestion = (seed: number, difficulty: Difficulty): Question => {
  const building = sample(buildings, seed);
  const kinds: QuestionKind[] = difficulty === 1
    ? ["building-name", "building-height", "building-taller", "building-reading"]
    : difficulty === 2
      ? ["building-name", "building-height", "building-taller", "building-difference", "building-reading"]
      : ["building-height", "building-taller", "building-difference", "building-reading"];
  const kind = sample(kinds, seed + 23);

  if (kind === "building-name") {
    const options = shuffle(buildings.filter((item) => item.id !== building.id).map((item) => item.name), seed + 24).slice(0, choiceCountForDifficulty(difficulty) - 1);
    return {
      id: `${seed}-building-name-${building.id}`,
      topic: "buildings",
      kind,
      prompt: `Which tall building is this?`,
      image: building.image,
      imageAlt: building.name,
      imageCredit: building.imageCredit,
      choices: shuffle([building.name, ...options], seed + 25),
      answer: building.name,
      explanation: `That is ${building.name} in ${building.city}. ${building.fact}`,
      numberLine: { label: "Height", value: building.heightFt, max: maxHeight, unit: "ft" },
    };
  }

  if (kind === "building-taller") {
    const challenger = sample(buildings.filter((item) => item.id !== building.id), seed + 26);
    return buildingTallerQuestion(seed, building, challenger);
  }

  if (kind === "building-difference") {
    const challenger = sample(buildings.filter((item) => item.id !== building.id && item.heightFt !== building.heightFt), seed + 28);
    const taller = building.heightFt > challenger.heightFt ? building : challenger;
    const shorter = building.heightFt > challenger.heightFt ? challenger : building;
    const diff = taller.heightFt - shorter.heightFt;
    const correct = `${formatNumber(diff)} ft`;
    const choices = buildingDifferenceChoices(diff, difficulty, seed + 29);
    const cards = shuffle([buildingCard(taller, "A"), buildingCard(shorter, "B")], seed + 30);
    return {
      id: `${seed}-building-difference-${taller.id}-${shorter.id}`,
      topic: "buildings",
      kind,
      prompt: `${taller.name} is ${feet(taller.heightFt)}. ${shorter.name} is ${feet(shorter.heightFt)}. How much taller is ${taller.name}?`,
      image: taller.image,
      imageAlt: taller.name,
      imageCredit: taller.imageCredit,
      comparison: cards,
      choices,
      answer: correct,
      explanation: `${formatNumber(taller.heightFt)} - ${formatNumber(shorter.heightFt)} = ${formatNumber(diff)}. So ${taller.name} is ${formatNumber(diff)} feet taller.`,
      numberLine: { label: "Difference", value: diff, max: 1000, unit: "ft" },
    };
  }

  if (kind === "building-reading") {
    const sentence = building.status === "finished"
      ? `${building.name} is finished. People can go inside.`
      : `${building.name} is still being built. It is not finished yet.`;
    return {
      id: `${seed}-building-reading-${building.id}`,
      topic: "buildings",
      kind,
      prompt: "What is true?",
      readingClue: sentence,
      image: building.image,
      imageAlt: building.name,
      imageCredit: building.imageCredit,
      choices: shuffle([
        building.status === "finished" ? "It is finished" : "It is still being built",
        "It is a pepper",
        "It is under the ocean",
        "It is only 10 feet tall",
      ], seed + 31).slice(0, choiceCountForDifficulty(difficulty)),
      answer: building.status === "finished" ? "It is finished" : "It is still being built",
      explanation: sentence,
    };
  }

  const correct = displayHeightChoice(building.heightFt, difficulty);
  return {
    id: `${seed}-building-height-${building.id}`,
    topic: "buildings",
    kind: "building-height",
    prompt: difficulty === 3 ? `How tall is ${building.name}?` : `About how tall is ${building.name}?`,
    image: building.image,
    imageAlt: building.name,
    imageCredit: building.imageCredit,
    choices: buildingHeightChoices(building, difficulty, seed + 32),
    answer: correct,
    explanation: `${building.name} is ${feet(building.heightFt)} tall. It is in ${building.city}, ${building.country}.`,
    numberLine: { label: "Height", value: building.heightFt, max: maxHeight, unit: "ft" },
  };
};

const sharkQuestion = (seed: number, difficulty: Difficulty): Question => {
  const shark = sample(sharks, seed);
  const kinds: QuestionKind[] = difficulty === 1
    ? ["shark-name", "shark-family", "shark-bigger", "shark-reading"]
    : difficulty === 2
      ? ["shark-name", "shark-family", "shark-bigger", "shark-faster", "shark-difference", "shark-power"]
      : ["shark-bigger", "shark-faster", "shark-difference", "shark-power", "shark-family"];
  const kind = sample(kinds, seed + 41);

  if (kind === "shark-name") {
    const options = shuffle(sharks.filter((item) => item.id !== shark.id).map((item) => item.name), seed + 42).slice(0, choiceCountForDifficulty(difficulty) - 1);
    return {
      id: `${seed}-shark-name-${shark.id}`,
      topic: "sharks",
      kind,
      prompt: "Which shark is this?",
      image: shark.image,
      imageAlt: shark.name,
      imageCredit: shark.imageCredit,
      choices: shuffle([shark.name, ...options], seed + 43),
      answer: shark.name,
      explanation: `That is the ${shark.name}. ${shark.fact}`,
      numberLine: { label: "Size", value: shark.lengthFt, max: maxSharkLength, unit: "ft" },
    };
  }

  if (kind === "shark-family") {
    const families = Array.from(new Set(sharks.map((item) => item.family)));
    const options = shuffle(families.filter((family) => family !== shark.family), seed + 44).slice(0, choiceCountForDifficulty(difficulty) - 1);
    return {
      id: `${seed}-shark-family-${shark.id}`,
      topic: "sharks",
      kind,
      prompt: `What shark family does ${shark.name} belong to?`,
      image: shark.image,
      imageAlt: shark.name,
      imageCredit: shark.imageCredit,
      choices: shuffle([shark.family, ...options], seed + 45),
      answer: shark.family,
      explanation: `${shark.name} is in the ${shark.family} group. ${shark.fact}`,
    };
  }

  if (kind === "shark-bigger" || kind === "shark-faster" || kind === "shark-power") {
    const challenger = sample(sharks.filter((item) => item.id !== shark.id), seed + 46);
    const stat = kind === "shark-bigger" ? "length" : kind === "shark-faster" ? "speed" : "power";
    return sharkComparisonQuestion(seed, shark, challenger, stat);
  }

  if (kind === "shark-difference") {
    const challenger = sample(sharks.filter((item) => item.id !== shark.id && item.lengthFt !== shark.lengthFt), seed + 48);
    const bigger = shark.lengthFt > challenger.lengthFt ? shark : challenger;
    const smaller = shark.lengthFt > challenger.lengthFt ? challenger : shark;
    const diff = bigger.lengthFt - smaller.lengthFt;
    const correct = `${formatNumber(diff)} ft`;
    const choices = shuffle([correct, `${formatNumber(diff + 3)} ft`, `${formatNumber(Math.max(1, diff - 3))} ft`, `${formatNumber(diff + 7)} ft`], seed + 49).slice(0, choiceCountForDifficulty(difficulty));
    const cards = shuffle([sharkCard(bigger, "A", "length"), sharkCard(smaller, "B", "length")], seed + 50);
    return {
      id: `${seed}-shark-difference-${bigger.id}-${smaller.id}`,
      topic: "sharks",
      kind,
      prompt: `${bigger.name} can be ${feet(bigger.lengthFt)}. ${smaller.name} can be ${feet(smaller.lengthFt)}. How much longer is ${bigger.name}?`,
      image: bigger.image,
      imageAlt: bigger.name,
      imageCredit: bigger.imageCredit,
      comparison: cards,
      choices: choices.includes(correct) ? choices : [correct, ...choices.slice(1)],
      answer: correct,
      explanation: `${bigger.lengthFt} - ${smaller.lengthFt} = ${diff}. So ${bigger.name} is ${diff} feet longer.`,
      numberLine: { label: "Difference", value: diff, max: maxSharkLength, unit: "ft" },
    };
  }

  return {
    id: `${seed}-shark-reading-${shark.id}`,
    topic: "sharks",
    kind: "shark-reading",
    prompt: "What is true?",
    readingClue: `${shark.name} eats ${shark.diet}.`,
    image: shark.image,
    imageAlt: shark.name,
    imageCredit: shark.imageCredit,
    choices: shuffle([`It eats ${shark.diet}`, "It is a pepper", "It is a skyscraper", "It has wheels"], seed + 51).slice(0, choiceCountForDifficulty(difficulty)),
    answer: `It eats ${shark.diet}`,
    explanation: `${shark.name} eats ${shark.diet}. ${shark.fact}`,
  };
};

const spaceQuestion = (seed: number, difficulty: Difficulty): Question => {
  const item = sample(spaceCards, seed);
  const kinds: QuestionKind[] = difficulty === 1
    ? ["space-name", "space-farther", "space-concept", "space-reading"]
    : difficulty === 2
      ? ["space-name", "space-hotter", "space-bigger", "space-farther", "space-moons", "space-concept", "space-reading"]
      : ["space-hotter", "space-bigger", "space-farther", "space-moons", "space-concept", "space-reading"];
  const kind = sample(kinds, seed + 61);

  if (kind === "space-name") {
    const options = shuffle(spaceCards.filter((card) => card.id !== item.id).map((card) => card.name), seed + 62).slice(0, choiceCountForDifficulty(difficulty) - 1);
    return {
      id: `${seed}-space-name-${item.id}`,
      topic: "space",
      kind,
      prompt: `Which space object or idea is this?`,
      image: item.image,
      imageAlt: item.name,
      imageCredit: item.imageCredit,
      choices: shuffle([item.name, ...options], seed + 63),
      answer: item.name,
      explanation: `${item.name}: ${item.fact}`,
      numberLine: item.kind === "planet" && item.distanceFromSunMillionMiles ? { label: "Distance from Sun", value: item.distanceFromSunMillionMiles, max: maxPlanetDistance, unit: "million mi" } : undefined,
    };
  }

  if (kind === "space-hotter") {
    const pool = seedRandom(seed + 64) > 0.45 ? spaceStars : spacePlanets.filter((card) => card.meanSurfaceTempF !== undefined);
    const first = sample(pool, seed + 65);
    const second = sample(pool.filter((card) => card.id !== first.id), seed + 66);
    return spaceComparisonQuestion(seed, first, second, "temp");
  }

  if (kind === "space-bigger") {
    const pool = seedRandom(seed + 68) > 0.5 ? spaceStars : spacePlanets;
    const first = sample(pool, seed + 69);
    const second = sample(pool.filter((card) => card.id !== first.id), seed + 70);
    return spaceComparisonQuestion(seed, first, second, "radius");
  }

  if (kind === "space-farther") {
    const first = sample(spacePlanets, seed + 72);
    const second = sample(spacePlanets.filter((card) => card.id !== first.id), seed + 73);
    return spaceComparisonQuestion(seed, first, second, "distance");
  }

  if (kind === "space-moons") {
    const first = sample(spacePlanets, seed + 75);
    const second = sample(spacePlanets.filter((card) => card.id !== first.id), seed + 76);
    return spaceComparisonQuestion(seed, first, second, "moons");
  }

  if (kind === "space-concept") {
    const concept = sample(spaceConcepts, seed + 78);
    const options = shuffle(spaceConcepts.filter((card) => card.id !== concept.id).map((card) => card.conceptAnswer ?? card.fact), seed + 79).slice(0, choiceCountForDifficulty(difficulty) - 1);
    return {
      id: `${seed}-space-concept-${concept.id}`,
      topic: "space",
      kind,
      prompt: concept.conceptQuestion ?? `What is ${concept.name}?`,
      image: concept.image,
      imageAlt: concept.name,
      imageCredit: concept.imageCredit,
      choices: shuffle([concept.conceptAnswer ?? concept.fact, ...options], seed + 80),
      answer: concept.conceptAnswer ?? concept.fact,
      explanation: concept.fact,
    };
  }

  const readable = item.kind === "star"
    ? `${item.name} is in the ${item.group} set. Some star measurements are estimates.`
    : item.kind === "planet"
      ? `${item.name} is about ${spaceStatDisplay(spaceValue(item, "distance"), "distance", item)} from the Sun.`
      : item.fact;
  return {
    id: `${seed}-space-reading-${item.id}`,
    topic: "space",
    kind: "space-reading",
    prompt: "What is true?",
    readingClue: readable,
    image: item.image,
    imageAlt: item.name,
    imageCredit: item.imageCredit,
    choices: shuffle([
      item.kind === "star" ? "Giant star sizes can be estimates" : item.kind === "planet" ? `${item.name} is in the solar system` : item.conceptAnswer ?? item.fact,
      "It is a pepper",
      "It is a shark family",
      "It is a skyscraper",
    ], seed + 81).slice(0, choiceCountForDifficulty(difficulty)),
    answer: item.kind === "star" ? "Giant star sizes can be estimates" : item.kind === "planet" ? `${item.name} is in the solar system` : item.conceptAnswer ?? item.fact,
    explanation: readable,
  };
};

export const buildHeadToHeadSession = (topic: TopicScope, difficulty: Difficulty, sessionSeed: number, seenIds: string[]) => {
  const questions: Question[] = [];
  const topicOrder = topicsForScope(topic);
  const curatedOrder = shuffle(curatedHeadToHeads.filter((spec) => topicOrder.includes(spec.topic)), sessionSeed + 313);
  let attempt = 0;

  while (questions.length < sessionLength && attempt < 180) {
    const seed = sessionSeed + attempt * 43 + questions.length * 29;
    const curated = curatedOrder[attempt];
    const question = curated
      ? headToHeadQuestionFromSpec(curated, seed)
      : randomHeadToHeadQuestion(topicOrder[(questions.length + attempt) % topicOrder.length], difficulty, seed);

    if (question?.comparison && !seenIds.includes(question.id) && !questions.some((item) => item.id === question.id)) {
      questions.push(question);
    }
    attempt += 1;
  }

  while (questions.length < sessionLength) {
    const seed = sessionSeed + questions.length * 101 + attempt;
    const currentTopic = topicOrder[questions.length % topicOrder.length];
    questions.push(randomHeadToHeadQuestion(currentTopic, difficulty, seed));
  }

  return questions;
};

export const buildSession = (topic: TopicScope, difficulty: Difficulty, sessionSeed: number, seenIds: string[]) => {
  const questions: Question[] = [];
  const topicOrder = topicsForScope(topic);
  let attempt = 0;

  while (questions.length < sessionLength && attempt < 160) {
    const currentTopic = topicOrder[(questions.length + attempt) % topicOrder.length];
    const seed = sessionSeed + attempt * 17 + questions.length * 31;
    const question = currentTopic === "peppers" ? pepperQuestion(seed, difficulty) : currentTopic === "buildings" ? buildingQuestion(seed, difficulty) : currentTopic === "sharks" ? sharkQuestion(seed, difficulty) : spaceQuestion(seed, difficulty);
    if (!seenIds.includes(question.id) && !questions.some((item) => item.id === question.id)) {
      questions.push(question);
    }
    attempt += 1;
  }

  while (questions.length < sessionLength) {
    const seed = sessionSeed + questions.length * 101 + attempt;
    const currentTopic = topicOrder[questions.length % topicOrder.length];
    questions.push(currentTopic === "peppers" ? pepperQuestion(seed, difficulty) : currentTopic === "buildings" ? buildingQuestion(seed, difficulty) : currentTopic === "sharks" ? sharkQuestion(seed, difficulty) : spaceQuestion(seed, difficulty));
  }

  return questions;
};
