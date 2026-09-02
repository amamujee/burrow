import {
  buildings,
  countries,
  heatBands,
  heatBandRangeLabel,
  heatProfiles,
  jets,
  peppers,
  sharks,
  spaceCards,
  topicIds,
  type Building,
  type Country,
  type Difficulty,
  type HeatBand,
  type Jet,
  type JetCategory,
  type KnowledgeTopic,
  type Pepper,
  type Shark,
  type SpaceCard,
  type TopicId,
} from "./game-data";
import { cardDiscoveryIdentities } from "./card-discovery";
import { questionDepthForSelection } from "./difficulty";
import { poolForDifficulty } from "./difficulty-pool";
import { discoveryShuffle, sample, seedRandom, shuffle } from "./random";
import { worldLocationDisplay, type WorldLocation } from "./card-metadata";
import {
  buildGeoChoicesForLocations,
  countryCapitalLabel,
  countryFactSentence,
  countryNameInProse,
  jetCategoryWithArticle,
  jetCountryInProse,
  jetWorldLocation,
  sentenceStart,
  worldContinentLabel,
  worldLocationLabelInProse,
  type GeoChoice,
  type RoundTopic,
} from "./game-modes";

export type TopicScope = TopicId | readonly KnowledgeTopic[];

export type QuestionKind =
  | "pepper-heat"
  | "pepper-shu"
  | "pepper-hotter"
  | "pepper-reading"
  | "pepper-location"
  | "building-name"
  | "building-height"
  | "building-taller"
  | "building-difference"
  | "building-reading"
  | "building-location"
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
  | "space-reading"
  | "jet-name"
  | "jet-category"
  | "jet-faster"
  | "jet-range"
  | "jet-firepower"
  | "jet-difference"
  | "jet-reading"
  | "country-flag"
  | "country-capital"
  | "country-continent"
  | "country-location"
  | "country-population"
  | "country-area"
  | "country-neighbors"
  | "country-highest-point"
  | "pack-comparison";

export type ComparisonCard = {
  label: "A" | "B";
  topic: RoundTopic;
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
  topic: RoundTopic;
  kind: QuestionKind;
  prompt: string;
  readingClue?: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  choices: string[];
  answer: string;
  explanation: string;
  collectionTitles?: string[];
  locations?: WorldLocation[];
  map?: {
    choices: GeoChoice[];
    answerId: string;
  };
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
  secondChanceClue?: string;
};

const sessionLength = 16;
type MeasuredPepper = Pepper & { shuMin: number; shuMax: number };
const hasScovilleMeasurement = <T extends Pepper>(pepper: T): pepper is T & MeasuredPepper => pepper.shuMin !== null && pepper.shuMax !== null;
const isPepperFruit = (pepper: Pepper) => !pepper.isCondiment;
const maxShu = Math.max(...peppers.filter(hasScovilleMeasurement).map((pepper) => pepper.shuMax));
const maxHeight = 6562;
const maxSharkLength = 65;
const maxSharkSpeed = 45;
const maxSharkPower = 5;
const maxJetSpeed = 2200;
const maxJetRange = 8800;
const maxJetFirepower = 5;
const maxCountryPopulation = Math.max(...countries.map((country) => country.population));
const maxCountryArea = Math.max(...countries.map((country) => country.areaKm2));
const allTopics: KnowledgeTopic[] = [...topicIds];
const preferredPool = <T extends { id: string }>(items: readonly T[], difficulty: Difficulty) => poolForDifficulty(items, difficulty);

const choiceCountForDifficulty = (difficulty: Difficulty) => {
  void difficulty;
  return 4;
};

const topicsForScope = (topic: TopicScope): KnowledgeTopic[] => {
  if (typeof topic !== "string") return topic.length ? [...topic] : allTopics;
  return topic === "mixed" ? allTopics : [topic];
};

const formatNumber = (value: number) => value.toLocaleString("en-US");
const formatShu = (value: number) => `${formatNumber(value)} SHU`;
const compactPeople = (value: number) => value >= 1_000_000_000
  ? `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} billion`
  : value >= 1_000_000
    ? `${Math.round(value / 1_000_000)} million`
    : value >= 1_000
      ? `${Math.round(value / 1_000)} thousand`
      : formatNumber(value);
const range = (pepper: MeasuredPepper) => pepper.shuMin === pepper.shuMax ? formatNumber(pepper.shuMax) : `${formatNumber(pepper.shuMin)}-${formatNumber(pepper.shuMax)}`;
const feet = (value: number) => `${formatNumber(value)} ft`;
const heatMeter = (heat: HeatBand) => ({ label: heat, icons: heatProfiles[heat].icons, emoji: heatProfiles[heat].emoji, line: heatProfiles[heat].kidLine });
const heatBandExplanation = (pepper: Pepper) => hasScovilleMeasurement(pepper)
  ? `${pepper.name} is ${pepper.heat} because its top Scoville score is ${pepper.scovilleStatus === "unofficial" ? "unofficially " : ""}${formatShu(pepper.shuMax)}, which falls within the ${heatBandRangeLabel(pepper.heat)} range.`
  : pepper.scovilleStatus === "not-applicable"
    ? `${pepper.name} is not a chile, so the Scoville scale does not apply. Sanshool gives it a tingly, numbing feeling instead of capsaicin heat.`
  : pepper.shuMin !== null
    ? `${pepper.name} is placed above ${formatShu(pepper.shuMin)} as an unofficial estimate, which classifies its heat as ${pepper.heat}; no lab score has been published.`
    : `${pepper.name}'s heat is described as ${pepper.heat} because no Scoville measurement has been published.`;
const heatReadingClues: Record<HeatBand, { prompt: string; clue: string; answer: string; distractors: string[]; explanation: string }> = {
  "not spicy": {
    prompt: "What does this note tell you about the pepper?",
    clue: "This pepper has no capsaicin heat, so it does not cause a burning feeling.",
    answer: "It will not feel spicy",
    distractors: ["It has gentle warmth", "It has strong heat", "It is extremely hot"],
    explanation: "The note says that the pepper has no capsaicin heat, so it will not feel spicy.",
  },
  mild: {
    prompt: "How strong is this pepper's heat?",
    clue: "This pepper has only a small amount of heat.",
    answer: "Very gentle",
    distractors: ["Not present at all", "Strong and obvious", "Extremely intense"],
    explanation: "A small amount of heat feels gentle rather than strong.",
  },
  warm: {
    prompt: "How strong is this pepper's heat?",
    clue: "This pepper's heat is easy to notice, but it is not strong enough to be called hot.",
    answer: "Noticeable but not strong",
    distractors: ["Not present at all", "Strong and obvious", "Extremely intense"],
    explanation: "The heat is noticeable, but the note says that it is not strong enough to be called hot.",
  },
  hot: {
    prompt: "How strong is this pepper's heat?",
    clue: "This pepper has a strong kick that is easy to notice.",
    answer: "Strong and obvious",
    distractors: ["Not present at all", "Very gentle", "Almost impossible to notice"],
    explanation: "A strong kick means that the pepper's heat is easy to notice.",
  },
  "very hot": {
    prompt: "How should this pepper be tasted?",
    clue: "This pepper's heat is intense, so it should be tasted in very small bites.",
    answer: "In very small bites",
    distractors: ["In large bites", "As if it had no heat", "Without paying attention to the heat"],
    explanation: "The note says that the pepper's intense heat calls for very small bites.",
  },
  insane: {
    prompt: "What does this note tell you about the pepper's heat?",
    clue: "This pepper belongs to the highest, super-hot range.",
    answer: "It is extremely hot",
    distractors: ["It has no heat", "It is only mildly warm", "Its heat is difficult to notice"],
    explanation: "The highest, super-hot range contains peppers with extreme heat.",
  },
};
const choiceSet = <T,>(correct: T, options: T[], seed: number, count: number) => {
  const distractors = shuffle(options.filter((option) => option !== correct), seed).slice(0, count - 1);
  return shuffle([correct, ...distractors], seed + 1);
};
const answerChoices = <T,>(correct: T, distractors: T[], seed: number, count: number) => {
  const uniqueDistractors = Array.from(new Set(distractors.filter((option) => option !== correct)));
  return shuffle([correct, ...shuffle(uniqueDistractors, seed).slice(0, count - 1)], seed + 1);
};
const promptVariant = (seed: number, variants: readonly string[]) => variants[Math.abs(seed) % variants.length];
const naturalList = (value: string) => {
  const items = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (items.length < 2) return value;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
};
const countryRegionDetail = (country: Country) => {
  const continent = worldContinentLabel(country.continents);
  return country.subregion === continent ? "" : ` Geographers place it in the ${country.subregion} subregion.`;
};
const countryPopulationSourceSentence = (country: Country) => country.populationStatus === "world-bank"
  ? `The population figure uses World Bank data from ${country.populationYear}.`
  : country.populationStatus === "census"
    ? `The population figure comes from the ${country.populationYear} census.`
    : `The population figure is based on a ${country.populationNote.toLowerCase()}.`;
const dietParts = (diet: string) => diet
  .toLowerCase()
  .split(/,|\band\b/)
  .map((part) => part.trim())
  .filter(Boolean);
const dietKeywords = (diet: string) => (diet.toLowerCase().match(/[a-z]+/g) ?? [])
  .filter((word) => !["and", "big", "deep", "fast", "from", "large", "other", "round", "sea", "small", "tiny"].includes(word));
const dietsOverlap = (first: string, second: string) => dietKeywords(first).some((word) => dietKeywords(second).includes(word));
const clueWithoutLeadingName = (fact: string, name: string) => {
  if (fact.toLowerCase().startsWith(`${name.toLowerCase()}s `)) return `This pepper ${fact.slice(name.length + 2)}`;
  if (fact.toLowerCase().startsWith(`${name.toLowerCase()} `)) return `This pepper ${fact.slice(name.length + 1)}`;
  return fact.replace(name, "This pepper");
};
const hasLocationMetadata = <T extends { metadata?: { location?: WorldLocation } }>(item: T): item is T & { metadata: { location: WorldLocation } } =>
  Boolean(item.metadata?.location);
const itemLocations = (...items: { metadata?: { location?: WorldLocation } }[]): WorldLocation[] =>
  items.flatMap((item) => (item.metadata?.location ? [item.metadata.location] : []));
const locationQuestionChoices = <T extends { metadata?: { location?: WorldLocation } }>(
  correctItem: T & { metadata: { location: WorldLocation } },
  options: readonly T[],
  difficulty: Difficulty,
  seed: number,
) => buildGeoChoicesForLocations(
  options.filter(hasLocationMetadata).map((item) => item.metadata.location),
  correctItem.metadata.location,
  difficulty,
  seed,
);
const roundTo = (value: number, step: number) => Math.max(step, Math.round(value / step) * step);
const roundedSubtractionPair = (bigger: number, smaller: number, step: number) => {
  const biggerValue = roundTo(bigger, step);
  const smallerValue = Math.max(0, Math.min(biggerValue - step, roundTo(smaller, step)));
  return { biggerValue, smallerValue, diff: biggerValue - smallerValue };
};
const roundedComparisonCard = (card: ComparisonCard, value: number, unit: string): ComparisonCard => ({
  ...card,
  statValue: `${formatNumber(value)} ${unit}`,
  meterValue: value,
});

const seedPrefixPattern = /^\d+-/;
const compactKeyPart = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

const questionIdWithoutSeed = (id: string) => id.replace(seedPrefixPattern, "");

export const questionMemoryKey = (question: Pick<Question, "id" | "topic" | "kind" | "comparison">) => {
  if (question.comparison?.length) {
    const stat = compactKeyPart(question.comparison[0]?.statLabel ?? "comparison");
    const cards = question.comparison.map((card) => compactKeyPart(card.title)).sort().join("-");
    return `${question.topic}:${question.kind}:${stat}:${cards}`;
  }

  return `${question.topic}:${questionIdWithoutSeed(question.id)}`;
};

const questionHistoryKeySet = (seenIds: readonly string[]) => {
  const keys = new Set<string>();
  for (const id of seenIds) {
    keys.add(id);
    keys.add(questionIdWithoutSeed(id));
  }
  return keys;
};

const rememberFreshQuestion = (question: Question, keys: Set<string>) => {
  const memoryKey = questionMemoryKey(question);
  const seedlessId = questionIdWithoutSeed(question.id);
  if (keys.has(question.id) || keys.has(seedlessId) || keys.has(memoryKey)) return false;

  keys.add(question.id);
  keys.add(seedlessId);
  keys.add(memoryKey);
  return true;
};

const heightChoiceStep = (value: number, difficulty: Difficulty) => {
  if (difficulty === 3) return 1;
  if (value < 100) return 8;
  if (value < 300) return 40;
  return difficulty === 1 ? 400 : 80;
};

const displayHeightChoice = (value: number, difficulty: Difficulty) => {
  if (difficulty === 3) return feet(value);
  return `about ${formatNumber(roundTo(value, heightChoiceStep(value, difficulty)))} ft`;
};

const buildingHeightLabel = (building: Building) => building.heightLabel ?? (building.status === "finished" ? "Height" : "Planned height");
const buildingHeightSentence = (building: Building) => {
  const label = buildingHeightLabel(building);
  return label === "Height" ? `${building.name} is ${feet(building.heightFt)} tall` : `${building.name}'s ${label.toLowerCase()} is ${feet(building.heightFt)}`;
};
const buildingHeightClause = (building: Building) => {
  const label = buildingHeightLabel(building);
  return label === "Height" ? `is ${feet(building.heightFt)} tall` : `has a ${label.toLowerCase()} of ${feet(building.heightFt)}`;
};
const buildingHeightAnswer = (building: Building) => {
  const label = buildingHeightLabel(building);
  return label === "Height" ? `It is ${feet(building.heightFt)} tall.` : `Its ${label.toLowerCase()} is ${feet(building.heightFt)}.`;
};
const buildingHeightPrompt = (building: Building, difficulty: Difficulty) => {
  const label = buildingHeightLabel(building);
  if (label === "Height") return difficulty === 3 ? `How tall is ${building.name}?` : `About how tall is ${building.name}?`;
  return difficulty === 3 ? `What is ${building.name}'s ${label.toLowerCase()}?` : `About what is ${building.name}'s ${label.toLowerCase()}?`;
};

const buildingHeightChoices = (building: Building, difficulty: Difficulty, seed: number) => {
  const correct = displayHeightChoice(building.heightFt, difficulty);
  const correctValue = difficulty === 3 ? building.heightFt : roundTo(building.heightFt, heightChoiceStep(building.heightFt, difficulty));
  const minGap = building.heightFt < 100 ? 16 : building.heightFt < 300 ? 40 : difficulty === 1 ? 400 : difficulty === 2 ? 200 : 125;
  const minDistractor = building.heightFt < 100 ? 10 : 100;
  const generated = [
    correctValue - minGap * 2,
    correctValue - minGap,
    correctValue + minGap,
    correctValue + minGap * 2,
    150,
    200,
    250,
    300,
    1000,
    1500,
    2000,
    2500,
    3000,
  ];
  const fromBuildings = buildings
    .filter((item) => item.id !== building.id)
    .map((item) => (difficulty === 3 ? item.heightFt : roundTo(item.heightFt, heightChoiceStep(item.heightFt, difficulty))));
  const labels = [...fromBuildings, ...generated]
    .filter((value) => value >= minDistractor && value <= maxHeight + 250)
    .filter((value) => Math.abs(value - correctValue) >= minGap)
    .map((value) => (difficulty === 3 ? feet(value) : `about ${formatNumber(value)} ft`))
    .filter((label) => label !== correct);
  const distractors = Array.from(new Set(shuffle(labels, seed + 1))).slice(0, choiceCountForDifficulty(difficulty) - 1);
  return shuffle([correct, ...distractors], seed + 2);
};

const buildingDifferenceChoices = (diff: number, difficulty: Difficulty, seed: number) => {
  const gap = difficulty === 1 ? 300 : difficulty === 2 ? 150 : 75;
  const values = [
    diff,
    diff + gap * 2,
    diff + gap * 3,
    Math.max(gap, diff - gap * 2),
    Math.max(gap, diff - gap * 3),
    diff + gap * 4,
    diff + gap * 5,
  ];
  const labels = Array.from(new Set(values.map((value) => `${formatNumber(value)} ft`)));
  const correct = `${formatNumber(diff)} ft`;
  const distractors = shuffle(labels.filter((label) => label !== correct), seed + 1).slice(0, choiceCountForDifficulty(difficulty) - 1);
  return shuffle([correct, ...distractors], seed + 2);
};

const buildingStatusLabel = (building: Building) => {
  if (building.status === "finished") return "a completed building";
  if (building.status === "under construction") return "still being built";
  return "still proposed";
};
const brooklynBuildingIds = new Set(["brooklyn-tower", "brooklyn-point", "ava-dobro", "11-hoyt", "the-everly", "385-atlantic-avenue"]);
const falseHeightComparisons = (building: Building, thresholds: number[]) =>
  thresholds.flatMap((threshold) => {
    const taller = building.heightFt > threshold;
    const shorter = building.heightFt < threshold;
    return [
      shorter ? `It is taller than ${feet(threshold)}.` : "",
      taller ? `It is shorter than ${feet(threshold)}.` : "",
    ].filter(Boolean);
  });

const buildingReadingQuestion = (seed: number, building: Building, difficulty: Difficulty): Question => {
  const count = choiceCountForDifficulty(difficulty);
  const otherCities = Array.from(new Set(buildings.filter((item) => item.city !== building.city).map((item) => item.city)));
  const otherFloors = Array.from(new Set(buildings.map((item) => item.floors).filter((floors): floors is number => Boolean(floors && floors !== building.floors))));
  const thresholds = difficulty === 1 ? [500, 1000, 1500] : difficulty === 2 ? [720, 1000, 1200, 1500] : [984, 1200, 1400, 1776];
  const selectedThreshold = sample(thresholds.filter((threshold) => threshold !== building.heightFt), seed + 33);
  const heightAnswer = building.heightFt > selectedThreshold
    ? `It is taller than ${feet(selectedThreshold)}.`
    : `It is shorter than ${feet(selectedThreshold)}.`;

  const templates = [
    {
      id: "city",
      prompt: "Which detail is supported by the clue?",
      clue: `${building.name} rises in ${building.city}, ${building.country}.`,
      answer: `It is in ${building.city}.`,
      distractors: shuffle(otherCities, seed + 34).map((city) => `It is in ${city}.`),
      explanation: `${building.name} is in ${building.city}, ${building.country}.`,
    },
    {
      id: "height-compare",
      prompt: "Which height sentence is true?",
      clue: `${buildingHeightSentence(building)}.`,
      answer: heightAnswer,
      distractors: falseHeightComparisons(building, thresholds),
      explanation: `${buildingHeightSentence(building)}, so ${heightAnswer.toLowerCase()}`,
    },
    {
      id: "floors",
      prompt: "Which floor count matches the field note?",
      clue: `${building.name} has ${building.floors ?? "many"} floors and ${buildingHeightClause(building)}.`,
      answer: building.floors ? `It has ${building.floors} floors.` : buildingHeightAnswer(building),
      distractors: building.floors
        ? shuffle(otherFloors, seed + 35).map((floors) => `It has ${floors} floors.`)
        : falseHeightComparisons(building, thresholds),
      explanation: building.floors ? `${building.name} has ${building.floors} floors.` : `${buildingHeightSentence(building)}.`,
    },
    ...(building.status === "finished"
      ? []
      : [
          {
            id: "status",
            prompt: "Which statement is supported by the clue?",
            clue: `${building.name} is ${buildingStatusLabel(building)} in ${building.city}.`,
            answer: `It is ${buildingStatusLabel(building)}.`,
            distractors: [
              "It is a completed building.",
              "It is still being built.",
              "It is still proposed.",
              "It is a pepper variety.",
              "It is a shark species.",
              "It is a planet.",
            ].filter((choice) => choice !== `It is ${buildingStatusLabel(building)}.`),
            explanation: `${building.name} is ${buildingStatusLabel(building)}.`,
          },
        ]),
    ...(brooklynBuildingIds.has(building.id)
      ? [
          {
            id: "borough",
            prompt: "Which detail is supported by the clue?",
            clue: `${building.name} rises in Brooklyn, New York City.`,
            answer: "It is in Brooklyn.",
            distractors: ["It is in Chicago.", "It is in Dubai.", "It is in Hong Kong.", "It is in Shanghai."],
            explanation: `${building.name} is one of the Brooklyn buildings in this deck.`,
          },
        ]
      : []),
    {
      id: "fact",
      prompt: "Which building does the clue describe?",
      clue: building.fact,
      answer: building.name,
      distractors: shuffle(buildings.filter((item) => item.id !== building.id), seed + 36).map((item) => item.name),
      explanation: `${building.name} is the answer. ${building.fact}`,
    },
  ].filter((template) => template.distractors.length >= count - 1);

  const template = sample(templates, seed + 37);
  const choices = answerChoices(template.answer, template.distractors, seed + 38, count);

  return {
    id: `${seed}-building-reading-${template.id}-${building.id}`,
    topic: "buildings",
    kind: "building-reading",
    prompt: template.prompt,
    readingClue: template.clue,
    image: building.image,
    imageAlt: building.name,
    imageCredit: building.imageCredit,
    choices,
    answer: template.answer,
    explanation: template.explanation,
    locations: buildingLocations(building),
    numberLine: template.id === "height-compare" || template.id === "floors" ? { label: "Height", value: building.heightFt, max: maxHeight, unit: "ft" } : undefined,
  };
};

const differenceChoices = (diff: number, unit: string, gap: number, difficulty: Difficulty, seed: number) => {
  const values = [
    diff,
    diff + gap * 2,
    diff + gap * 3,
    Math.max(gap, diff - gap * 2),
    Math.max(gap, diff - gap * 3),
    diff + gap * 4,
    diff + gap * 5,
  ];
  const labels = Array.from(new Set(values.map((value) => `${formatNumber(value)} ${unit}`)));
  const correct = `${formatNumber(diff)} ${unit}`;
  const distractors = shuffle(labels.filter((label) => label !== correct), seed + 1).slice(0, choiceCountForDifficulty(difficulty) - 1);
  return shuffle([correct, ...distractors], seed + 2);
};

const pepperCard = (pepper: MeasuredPepper, label: "A" | "B"): ComparisonCard => ({
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
  statLabel: buildingHeightLabel(building),
  statValue: feet(building.heightFt),
  subStat: building.metadata?.location ? worldLocationDisplay(building.metadata.location) : `${building.city}, ${building.country}`,
  meterValue: building.heightFt,
  meterMax: maxHeight,
});

const buildingLocations = (...items: Building[]): WorldLocation[] =>
  items.flatMap((item) => (item.metadata?.location ? [item.metadata.location] : []));

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

const jetCategoryLabels: Record<JetCategory, string> = {
  stealth: "stealth",
  dogfighter: "dogfighter",
  multirole: "multirole",
  bomber: "bomber",
  recon: "recon",
  attack: "attack",
  interceptor: "interceptor",
  trainer: "trainer",
};

const jetCard = (jet: Jet, label: "A" | "B", stat: "speed" | "range" | "firepower"): ComparisonCard => ({
  label,
  topic: "jets",
  title: jet.name,
  image: jet.image,
  imageAlt: jet.name,
  imageCredit: jet.imageCredit,
  statLabel: stat === "speed" ? "Speed" : stat === "range" ? "Range" : "Firepower",
  statValue: stat === "speed" ? `${formatNumber(jet.maxSpeedMph)} mph` : stat === "range" ? `${formatNumber(jet.rangeMiles)} mi` : `${jet.firepower}/5`,
  subStat: `${jet.country} · ${jetCategoryLabels[jet.category]}`,
  meterValue: stat === "speed" ? jet.maxSpeedMph : stat === "range" ? jet.rangeMiles : jet.firepower,
  meterMax: stat === "speed" ? maxJetSpeed : stat === "range" ? maxJetRange : maxJetFirepower,
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
const spaceStatProse = (value: number, stat: "temp" | "radius" | "distance" | "moons", item: SpaceCard) => {
  if (stat === "temp") return item.kind === "star" ? `${formatNumber(value)} kelvins` : `${formatNumber(value)} degrees Fahrenheit`;
  if (stat === "radius") return item.kind === "star" ? `${formatNumber(value)} times the Sun's radius` : `${formatNumber(value)} miles wide`;
  if (stat === "distance") return item.kind === "star" ? `${formatNumber(value)} light-years` : `${formatNumber(value)} million miles`;
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

const countryComparisonCard = (country: Country, label: "A" | "B", stat: "population" | "area"): ComparisonCard => ({
  label,
  topic: "countries",
  title: country.name,
  image: country.image,
  imageAlt: `Flag of ${country.name}`,
  imageCredit: country.imageCredit,
  statLabel: stat === "population" ? "Population" : "Land area",
  statValue: stat === "population" ? `${formatNumber(country.population)} people` : `${formatNumber(country.areaKm2)} km²`,
  subStat: `${countryCapitalLabel(country)} · ${worldContinentLabel(country.continents)}`,
  meterValue: stat === "population" ? country.population : country.areaKm2,
  meterMax: stat === "population" ? maxCountryPopulation : maxCountryArea,
});

const comparisonAnswer = (cards: ComparisonCard[], winnerName: string) => `${cards.find((card) => card.title === winnerName)?.label}: ${winnerName}`;

const pepperHotterQuestion = (seed: number, first: MeasuredPepper, second: MeasuredPepper): Question => {
  const hotter = first.shuMax >= second.shuMax ? first : second;
  const cards = shuffle([pepperCard(first, "A"), pepperCard(second, "B")], seed + 12);
  return {
    id: `${seed}-pepper-hotter-${first.id}-${second.id}`,
    topic: "peppers",
    kind: "pepper-hotter",
    prompt: promptVariant(seed + 11, [
      `Which pepper is hotter, ${first.name} or ${second.name}?`,
      `Compare the Scoville cards. Which pepper has the higher score, ${first.name} or ${second.name}?`,
      `A higher Scoville score means more heat. Which pepper has the higher score, ${first.name} or ${second.name}?`,
      `Which of these peppers is spicier, ${first.name} or ${second.name}?`,
    ]),
    image: hotter.image,
    imageAlt: hotter.name,
    imageCredit: hotter.imageCredit,
    comparison: cards,
    choices: cards.map((card) => `${card.label}: ${card.title}`),
    answer: comparisonAnswer(cards, hotter.name),
    explanation: `${hotter.name} has the higher maximum at ${formatShu(hotter.shuMax)}. A higher Scoville score indicates more heat.`,
    locations: itemLocations(first, second),
    heatMeter: heatMeter(hotter.heat),
  };
};

const countryComparisonQuestion = (seed: number, first: Country, second: Country, stat: "population" | "area"): Question => {
  const firstValue = stat === "population" ? first.population : first.areaKm2;
  const secondValue = stat === "population" ? second.population : second.areaKm2;
  const winner = firstValue >= secondValue ? first : second;
  const cards = shuffle([countryComparisonCard(first, "A", stat), countryComparisonCard(second, "B", stat)], seed + 19);
  const unit = stat === "population" ? "people" : "km²";
  const winningValue = stat === "population" ? winner.population : winner.areaKm2;
  return {
    id: `${seed}-country-${stat}-${first.id}-${second.id}`,
    topic: "countries",
    kind: stat === "population" ? "country-population" : "country-area",
    prompt: stat === "population"
      ? `Which country has more people, ${countryNameInProse(first)} or ${countryNameInProse(second)}?`
      : `Which country has the larger land area, ${countryNameInProse(first)} or ${countryNameInProse(second)}?`,
    image: winner.image,
    imageAlt: `Flag of ${winner.name}`,
    imageCredit: winner.imageCredit,
    comparison: cards,
    choices: cards.map((card) => `${card.label}: ${card.title}`),
    answer: comparisonAnswer(cards, winner.name),
    explanation: `${sentenceStart(countryNameInProse(winner))} has the higher value: ${formatNumber(winningValue)} ${unit}. ${stat === "population" ? `This population figure is from ${winner.populationYear}.` : "Land area measures the size of the country's land surface."}`,
    locations: itemLocations(first, second),
    numberLine: { label: stat === "population" ? "Population" : "Land area", value: winningValue, max: stat === "population" ? maxCountryPopulation : maxCountryArea, unit },
  };
};

const buildingTallerQuestion = (seed: number, first: Building, second: Building): Question => {
  const taller = first.heightFt >= second.heightFt ? first : second;
  const cards = shuffle([buildingCard(first, "A"), buildingCard(second, "B")], seed + 27);
  return {
    id: `${seed}-building-taller-${first.id}-${second.id}`,
    topic: "buildings",
    kind: "building-taller",
    prompt: `Which building is taller, ${first.name} or ${second.name}?`,
    image: taller.image,
    imageAlt: taller.name,
    imageCredit: taller.imageCredit,
    comparison: cards,
    choices: cards.map((card) => `${card.label}: ${card.title}`),
    answer: comparisonAnswer(cards, taller.name),
    explanation: `${buildingHeightSentence(taller)}, making it the taller of the two buildings.`,
    locations: buildingLocations(first, second),
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
    ? promptVariant(seed + 46, [`Which shark can grow longer, ${first.name} or ${second.name}?`, `Compare the recorded lengths. Which shark is longer, ${first.name} or ${second.name}?`, `Which shark has the greater maximum length, ${first.name} or ${second.name}?`])
    : stat === "speed"
      ? promptVariant(seed + 46, [`Which shark is faster, ${first.name} or ${second.name}?`, `Compare the speed cards. Which shark has the higher top speed, ${first.name} or ${second.name}?`, `Which shark can swim faster, ${first.name} or ${second.name}?`])
      : promptVariant(seed + 46, [`Which shark has the higher predator-power rating, ${first.name} or ${second.name}?`, `Compare the predator-power ratings. Which shark scores higher, ${first.name} or ${second.name}?`, `Which shark has the stronger predator-power score, ${first.name} or ${second.name}?`]);
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
    explanation: `${winner.name} has the higher value in this comparison: ${formatNumber(winnerValue)} ${unit}.`,
    numberLine: { label: stat === "length" ? "Size" : stat === "speed" ? "Speed" : "Power", value: winnerValue, max: stat === "length" ? maxSharkLength : stat === "speed" ? maxSharkSpeed : maxSharkPower, unit: stat === "length" ? "ft" : stat === "speed" ? "mph" : "/5" },
  };
};

const jetComparisonQuestion = (seed: number, first: Jet, second: Jet, stat: "speed" | "range" | "firepower"): Question => {
  const firstValue = stat === "speed" ? first.maxSpeedMph : stat === "range" ? first.rangeMiles : first.firepower;
  const secondValue = stat === "speed" ? second.maxSpeedMph : stat === "range" ? second.rangeMiles : second.firepower;
  const winner = firstValue >= secondValue ? first : second;
  const winnerValue = stat === "speed" ? winner.maxSpeedMph : stat === "range" ? winner.rangeMiles : winner.firepower;
  const cards = shuffle([jetCard(first, "A", stat), jetCard(second, "B", stat)], seed + 57);
  const kind: QuestionKind = stat === "speed" ? "jet-faster" : stat === "range" ? "jet-range" : "jet-firepower";
  const prompt = stat === "speed"
    ? promptVariant(seed + 56, [`Which jet is faster, ${first.name} or ${second.name}?`, `Compare the top speeds. Which jet is faster, ${first.name} or ${second.name}?`, `Which aircraft has the higher top speed, ${first.name} or ${second.name}?`])
    : stat === "range"
      ? promptVariant(seed + 56, [`Which jet can fly farther, ${first.name} or ${second.name}?`, `Compare the range figures. Which jet can travel farther, ${first.name} or ${second.name}?`, `Which aircraft has the longer range, ${first.name} or ${second.name}?`])
      : promptVariant(seed + 56, [`Which jet has more firepower, ${first.name} or ${second.name}?`, `Compare the firepower ratings. Which jet scores higher, ${first.name} or ${second.name}?`, `Which aircraft has the stronger firepower rating, ${first.name} or ${second.name}?`]);
  return {
    id: `${seed}-${kind}-${first.id}-${second.id}`,
    topic: "jets",
    kind,
    prompt,
    image: winner.image,
    imageAlt: winner.name,
    imageCredit: winner.imageCredit,
    comparison: cards,
    choices: cards.map((card) => `${card.label}: ${card.title}`),
    answer: comparisonAnswer(cards, winner.name),
    explanation: `${winner.name} has the higher value: ${stat === "speed" ? `${formatNumber(winnerValue)} mph` : stat === "range" ? `${formatNumber(winnerValue)} miles of range` : `a firepower rating of ${winnerValue}/5`}.`,
    numberLine: { label: stat === "speed" ? "Speed" : stat === "range" ? "Range" : "Firepower", value: winnerValue, max: stat === "speed" ? maxJetSpeed : stat === "range" ? maxJetRange : maxJetFirepower, unit: stat === "speed" ? "mph" : stat === "range" ? "mi" : "/5" },
  };
};

const spaceComparisonQuestion = (seed: number, first: SpaceCard, second: SpaceCard, stat: "temp" | "radius" | "distance" | "moons"): Question => {
  const winner = spaceValue(first, stat) >= spaceValue(second, stat) ? first : second;
  const cards = shuffle([spaceCard(first, "A", stat), spaceCard(second, "B", stat)], seed + 67);
  const kind: QuestionKind = stat === "temp" ? "space-hotter" : stat === "radius" ? "space-bigger" : stat === "distance" ? "space-farther" : "space-moons";
  const noun = first.kind === "star" ? "star" : "planet";
  const prompt = stat === "temp"
    ? promptVariant(seed + 66, [`Which ${noun} is hotter, ${first.name} or ${second.name}?`, `Compare the temperatures. Which ${noun} is hotter, ${first.name} or ${second.name}?`, `Which ${noun} has the higher temperature, ${first.name} or ${second.name}?`])
    : stat === "radius"
      ? promptVariant(seed + 66, [`Which ${noun} is larger, ${first.name} or ${second.name}?`, `Compare the size cards. Which ${noun} is larger, ${first.name} or ${second.name}?`, `Which ${noun} has the greater size, ${first.name} or ${second.name}?`])
      : stat === "distance"
        ? promptVariant(seed + 66, [`Which ${noun} is farther away, ${first.name} or ${second.name}?`, `Compare the distances. Which ${noun} is farther away, ${first.name} or ${second.name}?`, `Which ${noun} has the greater distance, ${first.name} or ${second.name}?`])
        : promptVariant(seed + 66, [`Which planet has more moons, ${first.name} or ${second.name}?`, `Compare the moon counts. Which planet has more, ${first.name} or ${second.name}?`, `Which planet has the larger number of moons, ${first.name} or ${second.name}?`]);
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
    explanation: `${winner.name} has the higher value: ${spaceStatProse(spaceValue(winner, stat), stat, winner)}. ${winner.statNote ?? winner.fact}`,
    numberLine: { label: stat === "temp" ? "Temperature" : stat === "radius" ? "Size" : stat === "distance" ? "Distance" : "Moons", value: spaceValue(winner, stat), max: spaceMeterMax(stat, winner), unit: winner.kind === "star" && stat === "radius" ? "x Sun" : stat === "temp" ? (winner.kind === "star" ? "K" : "°F") : stat === "distance" ? (winner.kind === "star" ? "ly" : "million mi") : stat === "moons" ? "moons" : "mi" },
  };
};

type HeadToHeadSpec =
  | { topic: "peppers"; stat: "heat"; firstId: string; secondId: string }
  | { topic: "buildings"; stat: "height"; firstId: string; secondId: string }
  | { topic: "sharks"; stat: "length" | "speed" | "power"; firstId: string; secondId: string }
  | { topic: "space"; stat: "temp" | "radius" | "distance" | "moons"; firstId: string; secondId: string }
  | { topic: "jets"; stat: "speed" | "range" | "firepower"; firstId: string; secondId: string };

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
  { topic: "jets", stat: "speed", firstId: "sr-71-blackbird", secondId: "f-22-raptor" },
  { topic: "jets", stat: "range", firstId: "b-52-stratofortress", secondId: "f-35-lightning-ii" },
  { topic: "jets", stat: "firepower", firstId: "f-15-eagle", secondId: "l-39-albatros" },
  { topic: "jets", stat: "speed", firstId: "mig-31", secondId: "a-10-thunderbolt-ii" },
  { topic: "jets", stat: "range", firstId: "u-2", secondId: "f-16-fighting-falcon" },
];

const findById = <T extends { id: string }>(items: T[], id: string) => items.find((item) => item.id === id);

const headToHeadQuestionFromSpec = (spec: HeadToHeadSpec, seed: number): Question | null => {
  if (spec.topic === "peppers") {
    const first = findById(peppers, spec.firstId);
    const second = findById(peppers, spec.secondId);
    return first && second && hasScovilleMeasurement(first) && hasScovilleMeasurement(second)
      ? pepperHotterQuestion(seed, first, second)
      : null;
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

  if (spec.topic === "jets") {
    const first = findById(jets, spec.firstId);
    const second = findById(jets, spec.secondId);
    return first && second ? jetComparisonQuestion(seed, first, second, spec.stat) : null;
  }

  const first = findById(spaceCards, spec.firstId);
  const second = findById(spaceCards, spec.secondId);
  return first && second ? spaceComparisonQuestion(seed, first, second, spec.stat) : null;
};

const randomHeadToHeadQuestion = (topic: KnowledgeTopic, difficulty: Difficulty, seed: number): Question => {
  const questionDepth = questionDepthForSelection(difficulty, seed);
  if (topic === "peppers") {
    const pool = preferredPool(peppers.filter(hasScovilleMeasurement).filter(isPepperFruit), difficulty);
    const first = sample(pool, seed + 1);
    const second = sample(pool.filter((item) => item.id !== first.id), seed + 2);
    return pepperHotterQuestion(seed, first, second);
  }

  if (topic === "buildings") {
    const pool = preferredPool(buildings, difficulty);
    const first = sample(pool, seed + 3);
    const second = sample(pool.filter((item) => item.id !== first.id), seed + 4);
    return buildingTallerQuestion(seed, first, second);
  }

  if (topic === "sharks") {
    const stats: ("length" | "speed" | "power")[] = questionDepth === 1 ? ["length", "speed"] : ["length", "speed", "power"];
    const stat = sample(stats, seed + 5);
    const pool = preferredPool(sharks, difficulty);
    const first = sample(pool, seed + 6);
    const second = sample(pool.filter((item) => item.id !== first.id), seed + 7);
    return sharkComparisonQuestion(seed, first, second, stat);
  }

  if (topic === "jets") {
    const stats: ("speed" | "range" | "firepower")[] = questionDepth === 1 ? ["speed", "range"] : ["speed", "range", "firepower"];
    const stat = sample(stats, seed + 5);
    const pool = preferredPool(jets, difficulty);
    const first = sample(pool, seed + 6);
    const second = sample(pool.filter((item) => item.id !== first.id), seed + 7);
    return jetComparisonQuestion(seed, first, second, stat);
  }

  if (topic === "countries") {
    const stat = sample(["population", "area"] as const, seed + 8);
    const pool = preferredPool(countries, difficulty);
    const first = sample(pool, seed + 9);
    const firstValue = stat === "population" ? first.population : first.areaKm2;
    const second = sample(
      pool.filter((item) => item.id !== first.id && (stat === "population" ? item.population : item.areaKm2) !== firstValue),
      seed + 10,
    );
    return countryComparisonQuestion(seed, first, second, stat);
  }

  const stats: ("temp" | "radius" | "distance" | "moons")[] = questionDepth === 1 ? ["radius", "distance", "temp"] : ["temp", "radius", "distance", "moons"];
  const stat = sample(stats, seed + 8);
  const pool = preferredPool(stat === "distance" || stat === "moons"
    ? spacePlanets
    : seedRandom(seed + 9) > 0.5
      ? spaceStars
      : spacePlanets.filter((card) => stat !== "temp" || card.meanSurfaceTempF !== undefined), difficulty);
  const first = sample(pool, seed + 10);
  const second = sample(pool.filter((item) => item.id !== first.id), seed + 11);
  return spaceComparisonQuestion(seed, first, second, stat);
};

const countryQuestion = (seed: number, difficulty: Difficulty, unlockedTitles: readonly string[] = []): Question => {
  const pool = preferredPool(countries, difficulty);
  const questionDepth = questionDepthForSelection(difficulty, seed);
  const country = discoveryShuffle(pool, seed, unlockedTitles, (item) => cardDiscoveryIdentities({
    id: item.id,
    topic: "countries",
    title: item.name,
  }))[0];
  const kinds: QuestionKind[] = questionDepth === 1
    ? ["country-flag", "country-capital", "country-continent", "country-location", "country-flag"]
    : questionDepth === 2
      ? ["country-flag", "country-capital", "country-location", "country-population", "country-area"]
      : ["country-population", "country-area", "country-neighbors", "country-highest-point", "country-population", "country-area"];
  const kind = sample(kinds, seed + 17);

  if (kind === "country-location") {
    const locatedPool = pool.filter(hasLocationMetadata);
    const locatedCountry = hasLocationMetadata(country) ? country : locatedPool[0];
    const mapChoices = locationQuestionChoices(locatedCountry, locatedPool, questionDepth, seed + 21);
    if (!mapChoices) return countryQuestion(seed + 1, difficulty, unlockedTitles);
    const choices = mapChoices.map((choice) => choice.label);
    return {
      id: `${seed}-country-location-${locatedCountry.id}`,
      topic: "countries",
      kind,
      prompt: `Where on the world map is ${countryNameInProse(locatedCountry)}?`,
      image: locatedCountry.image,
      imageAlt: `Flag of ${locatedCountry.name}`,
      imageCredit: locatedCountry.imageCredit,
      choices,
      answer: locatedCountry.name,
      explanation: `${countryFactSentence(locatedCountry)}${countryRegionDetail(locatedCountry)}`,
      collectionTitles: [locatedCountry.name],
      locations: itemLocations(locatedCountry),
      map: { choices: mapChoices, answerId: locatedCountry.name },
    };
  }

  if (kind === "country-capital") {
    const capital = countryCapitalLabel(country);
    return {
      id: `${seed}-country-capital-${country.id}`,
      topic: "countries",
      kind,
      prompt: `What is the capital of ${countryNameInProse(country)}?`,
      image: country.image,
      imageAlt: `Flag of ${country.name}`,
      imageCredit: country.imageCredit,
      choices: answerChoices(capital, pool.filter((item) => item.id !== country.id).map(countryCapitalLabel), seed + 19, choiceCountForDifficulty(difficulty)),
      answer: capital,
      explanation: countryFactSentence(country),
      collectionTitles: [country.name],
      locations: itemLocations(country),
    };
  }

  if (kind === "country-continent") {
    const answer = worldContinentLabel(country.continents);
    const continentOptions = Array.from(new Set(countries.map((item) => worldContinentLabel(item.continents))));
    return {
      id: `${seed}-country-continent-${country.id}`,
      topic: "countries",
      kind,
      prompt: `On which continent is ${countryNameInProse(country)} located?`,
      image: country.image,
      imageAlt: `Flag of ${country.name}`,
      imageCredit: country.imageCredit,
      choices: answerChoices(answer, continentOptions, seed + 20, choiceCountForDifficulty(difficulty)),
      answer,
      explanation: `${sentenceStart(countryNameInProse(country))} is in ${answer}.${countryRegionDetail(country)}`,
      collectionTitles: [country.name],
      locations: itemLocations(country),
    };
  }

  if (kind === "country-population" || kind === "country-area") {
    const stat = kind === "country-population" ? "population" : "area";
    const value = stat === "population" ? country.population : country.areaKm2;
    const challenger = sample(
      pool.filter((item) => item.id !== country.id && (stat === "population" ? item.population : item.areaKm2) !== value),
      seed + 22,
    );
    return countryComparisonQuestion(seed, country, challenger, stat);
  }

  if (kind === "country-neighbors") {
    const answer = `${formatNumber(country.landNeighborCount)} land ${country.landNeighborCount === 1 ? "neighbor" : "neighbors"}`;
    const otherCounts = pool
      .filter((item) => item.id !== country.id)
      .map((item) => `${formatNumber(item.landNeighborCount)} land ${item.landNeighborCount === 1 ? "neighbor" : "neighbors"}`);
    return {
      id: `${seed}-country-neighbors-${country.id}`,
      topic: "countries",
      kind,
      prompt: `How many land neighbors does ${countryNameInProse(country)} have?`,
      image: country.image,
      imageAlt: `Flag of ${country.name}`,
      imageCredit: country.imageCredit,
      choices: answerChoices(answer, otherCounts, seed + 22, choiceCountForDifficulty(difficulty)),
      answer,
      explanation: `${sentenceStart(countryNameInProse(country))} has ${answer}.`,
      collectionTitles: [country.name],
      locations: itemLocations(country),
    };
  }

  if (kind === "country-highest-point") {
    return {
      id: `${seed}-country-highest-point-${country.id}`,
      topic: "countries",
      kind,
      prompt: `What is the highest point in ${countryNameInProse(country)}?`,
      image: country.image,
      imageAlt: `Flag of ${country.name}`,
      imageCredit: country.imageCredit,
      choices: answerChoices(country.highestPointName, pool.filter((item) => item.id !== country.id).map((item) => item.highestPointName), seed + 22, choiceCountForDifficulty(difficulty)),
      answer: country.highestPointName,
      explanation: `${country.highestPointName} is the highest point in ${countryNameInProse(country)}, at about ${formatNumber(country.highestPointM)} meters above sea level.`,
      collectionTitles: [country.name],
      locations: itemLocations(country),
    };
  }

  const sameContinent = pool.filter((item) => item.id !== country.id && item.continents.some((continent) => country.continents.includes(continent)));
  const distractors = questionDepth === 1 || sameContinent.length < 3
    ? pool.filter((item) => item.id !== country.id)
    : sameContinent;
  return {
    id: `${seed}-country-flag-${country.id}`,
    topic: "countries",
    kind: "country-flag",
    prompt: "Which country has this flag?",
    image: country.image,
    imageAlt: "Mystery country flag",
    imageCredit: country.imageCredit,
    choices: answerChoices(country.name, distractors.map((item) => item.name), seed + 23, choiceCountForDifficulty(difficulty)),
    answer: country.name,
    secondChanceClue: `Second-chance clue: its capital is ${countryCapitalLabel(country)}. It is in ${worldContinentLabel(country.continents)} and has about ${compactPeople(country.population)} people.`,
    explanation: `That is the flag of ${countryNameInProse(country)}. ${countryFactSentence(country)} ${countryPopulationSourceSentence(country)}`,
    collectionTitles: [country.name],
    locations: itemLocations(country),
    numberLine: { label: "Population", value: country.population, max: maxCountryPopulation, unit: "people" },
  };
};

const pepperQuestion = (seed: number, difficulty: Difficulty, unlockedTitles: readonly string[] = []): Question => {
  const pool = preferredPool(peppers, difficulty);
  const questionDepth = questionDepthForSelection(difficulty, seed);
  const pepper = discoveryShuffle(pool, seed, unlockedTitles, (item) => cardDiscoveryIdentities({
    id: item.id,
    topic: "peppers",
    title: item.name,
  }))[0];
  const measuredPool = pool.filter(hasScovilleMeasurement).filter(isPepperFruit);
  const locationPool = pool.filter(hasLocationMetadata);
  const locationCandidates = locationPool.flatMap((item, index) => {
    const mapChoices = locationQuestionChoices(item, locationPool, questionDepth, seed + 5 + index);
    return mapChoices ? [{ item, mapChoices }] : [];
  });
  const baseKinds: QuestionKind[] = questionDepth === 1
    ? ["pepper-heat", "pepper-shu", "pepper-hotter", "pepper-reading"]
    : questionDepth === 2
      ? ["pepper-heat", "pepper-shu", "pepper-hotter", "pepper-reading"]
      : ["pepper-shu", "pepper-hotter", "pepper-reading", "pepper-heat"];
  const kinds = locationCandidates.length ? [...baseKinds, "pepper-location"] : baseKinds;
  const kind = sample(kinds, seed + 3);

  if (kind === "pepper-location") {
    const locationCandidate = discoveryShuffle(locationCandidates, seed + 4, unlockedTitles, (candidate) => cardDiscoveryIdentities({
      id: candidate.item.id,
      topic: "peppers",
      title: candidate.item.name,
    }))[0];
    const locatedPepper = locationCandidate.item;
    const mapChoices = locationCandidate.mapChoices;
    const choices = mapChoices.map((choice) => choice.label);
    return {
      id: `${seed}-pepper-location-${locatedPepper.id}`,
      topic: "peppers",
      kind,
      prompt: promptVariant(seed + 5, [`Which place is ${locatedPepper.name} linked to?`, `Read the map labels. Which place is connected with ${locatedPepper.name}?`, `Which place has a strong connection with ${locatedPepper.name}?`]),
      image: locatedPepper.image,
      imageAlt: locatedPepper.name,
      imageCredit: locatedPepper.imageCredit,
      choices,
      answer: locatedPepper.metadata.location.label,
      explanation: `${locatedPepper.name} is linked to ${worldLocationLabelInProse(locatedPepper.metadata.location.label)}. A pepper's location may describe its origin, namesake, or a strong regional food connection.`,
      locations: itemLocations(locatedPepper),
      map: {
        choices: mapChoices,
        answerId: locatedPepper.metadata.location.label,
      },
      heatMeter: heatMeter(locatedPepper.heat),
    };
  }

  if (kind === "pepper-heat") {
    const choices = choiceSet(pepper.heat, heatBands, seed + 7, choiceCountForDifficulty(difficulty));
    return {
      id: `${seed}-pepper-heat-${pepper.id}`,
      topic: "peppers",
      kind,
      prompt: pepper.isCondiment
        ? promptVariant(seed + 6, [`How spicy is the condiment ${pepper.name}?`, `Which heat level describes the condiment ${pepper.name}?`, `Choose the heat level for ${pepper.name}.`])
        : promptVariant(seed + 6, [`How spicy is ${pepper.name}?`, `Which heat level describes ${pepper.name}?`, `Choose the heat level for ${pepper.name}.`]),
      image: pepper.image,
      imageAlt: pepper.name,
      imageCredit: pepper.imageCredit,
      choices,
      answer: pepper.heat,
      explanation: `${heatBandExplanation(pepper)} ${heatProfiles[pepper.heat].kidLine}`,
      locations: itemLocations(pepper),
      heatMeter: heatMeter(pepper.heat),
      numberLine: hasScovilleMeasurement(pepper) ? { label: "Scoville score", value: pepper.shuMax, max: maxShu, unit: "SHU" } : undefined,
    };
  }

  if (kind === "pepper-hotter") {
    const measuredPepper = isPepperFruit(pepper) && hasScovilleMeasurement(pepper)
      ? pepper
      : sample(measuredPool, seed + 10);
    const challenger = sample(measuredPool.filter((item) => item.id !== measuredPepper.id), seed + 11);
    return pepperHotterQuestion(seed, measuredPepper, challenger);
  }

  if (kind === "pepper-reading") {
    const heatReading = heatReadingClues[pepper.heat];
    const count = choiceCountForDifficulty(difficulty);
    const templates = [
      {
        id: "heat-word",
        prompt: heatReading.prompt,
        clue: heatReading.clue,
        answer: heatReading.answer,
        distractors: heatReading.distractors,
        explanation: `${heatReading.explanation} ${heatBandExplanation(pepper)}`,
      },
      {
        id: "color",
        prompt: promptVariant(seed + 13, [`Which color is listed for ${pepper.name}?`, "Read carefully. Which color does the field note name?", "Which color appears in the field note?"]),
        clue: `${pepper.name} is catalogued as ${pepper.color}; its heat level is ${pepper.heat}.`,
        answer: pepper.color,
        distractors: pool.filter((item) => item.id !== pepper.id).map((item) => item.color),
        explanation: `${pepper.name} is ${pepper.color}. ${heatBandExplanation(pepper)}`,
      },
      {
        id: "fact-identity",
        prompt: promptVariant(seed + 14, ["Which pepper does this field note describe?", "Read the fact, then identify the pepper.", "The picture is only one clue. Which name matches the written description?"]),
        clue: clueWithoutLeadingName(pepper.fact, pepper.name),
        answer: pepper.name,
        distractors: pool.filter((item) => item.id !== pepper.id).map((item) => item.name),
        explanation: `${pepper.name} is the answer. ${pepper.fact}`,
      },
    ];
    const template = sample(templates, seed + 15);
    return {
      id: `${seed}-pepper-reading-${template.id}-${pepper.id}`,
      topic: "peppers",
      kind,
      prompt: template.prompt,
      readingClue: template.clue,
      image: pepper.image,
      imageAlt: pepper.name,
      imageCredit: pepper.imageCredit,
      choices: answerChoices(template.answer, template.distractors, seed + 16, count),
      answer: template.answer,
      explanation: template.explanation,
      locations: itemLocations(pepper),
      heatMeter: heatMeter(pepper.heat),
    };
  }

  const measuredPepper = hasScovilleMeasurement(pepper) ? pepper : sample(measuredPool, seed + 16);
  const correct = `${range(measuredPepper)} SHU`;
  const otherRanges = measuredPool.filter((item) => item.id !== measuredPepper.id).map((item) => `${range(item)} SHU`);
  return {
    id: `${seed}-pepper-shu-${measuredPepper.id}`,
    topic: "peppers",
    kind: "pepper-shu",
    prompt: promptVariant(seed + 17, [`What Scoville score range fits ${measuredPepper.name}?`, `Which SHU range belongs to ${measuredPepper.name}?`, `Read every range. Where does ${measuredPepper.name} fit on the Scoville scale?`]),
    image: measuredPepper.image,
    imageAlt: measuredPepper.name,
    imageCredit: measuredPepper.imageCredit,
    choices: answerChoices(correct, otherRanges, seed + 17, choiceCountForDifficulty(difficulty)),
    answer: correct,
    explanation: `${measuredPepper.name} has a reported range of ${correct}${measuredPepper.scovilleStatus === "unofficial" ? " in unofficial listings" : ""}. Its highest reported score classifies its heat as ${measuredPepper.heat} (${heatBandRangeLabel(measuredPepper.heat)}).`,
    locations: itemLocations(measuredPepper),
    heatMeter: heatMeter(measuredPepper.heat),
    numberLine: { label: "Heat", value: measuredPepper.shuMax, max: maxShu, unit: "SHU" },
  };
};

const buildingQuestion = (seed: number, difficulty: Difficulty): Question => {
  const pool = preferredPool(buildings, difficulty);
  const questionDepth = questionDepthForSelection(difficulty, seed);
  const building = sample(pool, seed);
  const locationPool = pool.filter(hasLocationMetadata);
  const locationCandidates = locationPool.flatMap((item, index) => {
    const mapChoices = locationQuestionChoices(item, locationPool, questionDepth, seed + 25 + index);
    return mapChoices ? [{ item, mapChoices }] : [];
  });
  const baseKinds: QuestionKind[] = questionDepth === 1
    ? ["building-name", "building-height", "building-taller", "building-reading"]
    : questionDepth === 2
      ? ["building-name", "building-height", "building-taller", "building-difference", "building-reading"]
      : ["building-height", "building-taller", "building-difference", "building-reading"];
  const kinds = locationCandidates.length ? [...baseKinds, "building-location"] : baseKinds;
  const kind = sample(kinds, seed + 23);

  if (kind === "building-location") {
    const locationCandidate = sample(locationCandidates, seed + 24);
    const locatedBuilding = locationCandidate.item;
    const mapChoices = locationCandidate.mapChoices;
    const choices = mapChoices.map((choice) => choice.label);
    return {
      id: `${seed}-building-location-${locatedBuilding.id}`,
      topic: "buildings",
      kind,
      prompt: promptVariant(seed + 24, [`In which city and country is ${locatedBuilding.name}?`, `Find the place linked to ${locatedBuilding.name}.`, `Read the location choices. Where is ${locatedBuilding.name}?`]),
      image: locatedBuilding.image,
      imageAlt: locatedBuilding.name,
      imageCredit: locatedBuilding.imageCredit,
      choices,
      answer: locatedBuilding.metadata.location.label,
      explanation: `${locatedBuilding.name} is in ${worldLocationLabelInProse(locatedBuilding.metadata.location.label)}.`,
      locations: itemLocations(locatedBuilding),
      map: {
        choices: mapChoices,
        answerId: locatedBuilding.metadata.location.label,
      },
      numberLine: { label: "Height", value: locatedBuilding.heightFt, max: maxHeight, unit: "ft" },
    };
  }

  if (kind === "building-name") {
    const options = shuffle(pool.filter((item) => item.id !== building.id).map((item) => item.name), seed + 24).slice(0, choiceCountForDifficulty(difficulty) - 1);
    return {
      id: `${seed}-building-name-${building.id}`,
      topic: "buildings",
      kind,
      prompt: promptVariant(seed + 24, ["Which building is shown here?", "Study the picture. What is this building called?", "Which building name matches this skyline?"]),
      image: building.image,
      imageAlt: building.name,
      imageCredit: building.imageCredit,
      choices: shuffle([building.name, ...options], seed + 25),
      answer: building.name,
      explanation: `The building is ${building.name}, in ${building.city}. ${building.fact}`,
      locations: buildingLocations(building),
      numberLine: { label: "Height", value: building.heightFt, max: maxHeight, unit: "ft" },
    };
  }

  if (kind === "building-taller") {
    const challenger = sample(pool.filter((item) => item.id !== building.id), seed + 26);
    return buildingTallerQuestion(seed, building, challenger);
  }

  if (kind === "building-difference") {
    const challenger = sample(pool.filter((item) => item.id !== building.id && item.heightFt !== building.heightFt), seed + 28);
    const taller = building.heightFt > challenger.heightFt ? building : challenger;
    const shorter = building.heightFt > challenger.heightFt ? challenger : building;
    const { biggerValue, smallerValue, diff } = roundedSubtractionPair(taller.heightFt, shorter.heightFt, questionDepth === 1 ? 150 : questionDepth === 2 ? 75 : 40);
    const correct = `${formatNumber(diff)} ft`;
    const choices = buildingDifferenceChoices(diff, questionDepth, seed + 29);
    const cards = shuffle([roundedComparisonCard(buildingCard(taller, "A"), biggerValue, "ft"), roundedComparisonCard(buildingCard(shorter, "B"), smallerValue, "ft")], seed + 30);
    return {
      id: `${seed}-building-difference-${taller.id}-${shorter.id}`,
      topic: "buildings",
      kind,
      prompt: `${taller.name} is about ${feet(biggerValue)}. ${shorter.name} is about ${feet(smallerValue)}. How much taller is ${taller.name}?`,
      image: taller.image,
      imageAlt: taller.name,
      imageCredit: taller.imageCredit,
      comparison: cards,
      choices,
      answer: correct,
      explanation: `Subtracting the heights gives ${formatNumber(biggerValue)} − ${formatNumber(smallerValue)} = ${formatNumber(diff)}. Therefore, ${taller.name} is about ${formatNumber(diff)} feet taller.`,
      locations: buildingLocations(taller, shorter),
      numberLine: { label: "Difference", value: diff, max: 1000, unit: "ft" },
    };
  }

  if (kind === "building-reading") {
    return buildingReadingQuestion(seed, building, questionDepth);
  }

  const correct = displayHeightChoice(building.heightFt, questionDepth);
  return {
    id: `${seed}-building-height-${building.id}`,
    topic: "buildings",
    kind: "building-height",
    prompt: buildingHeightPrompt(building, questionDepth),
    image: building.image,
    imageAlt: building.name,
    imageCredit: building.imageCredit,
    choices: buildingHeightChoices(building, questionDepth, seed + 32),
    answer: correct,
    explanation: `${buildingHeightSentence(building)}. It is in ${building.city}, ${building.country}.`,
    locations: buildingLocations(building),
    numberLine: { label: "Height", value: building.heightFt, max: maxHeight, unit: "ft" },
  };
};

const sharkQuestion = (seed: number, difficulty: Difficulty): Question => {
  const pool = preferredPool(sharks, difficulty);
  const questionDepth = questionDepthForSelection(difficulty, seed);
  const shark = sample(pool, seed);
  const kinds: QuestionKind[] = questionDepth === 1
    ? ["shark-name", "shark-family", "shark-bigger", "shark-reading"]
    : questionDepth === 2
      ? ["shark-name", "shark-family", "shark-bigger", "shark-faster", "shark-difference", "shark-power"]
      : ["shark-bigger", "shark-faster", "shark-difference", "shark-power", "shark-family"];
  const kind = sample(kinds, seed + 41);

  if (kind === "shark-name") {
    const options = shuffle(pool.filter((item) => item.id !== shark.id).map((item) => item.name), seed + 42).slice(0, choiceCountForDifficulty(difficulty) - 1);
    return {
      id: `${seed}-shark-name-${shark.id}`,
      topic: "sharks",
      kind,
      prompt: promptVariant(seed + 42, ["Which shark is shown here?", "Study the picture. Which shark name fits?", "Which shark does this field photograph show?"]),
      image: shark.image,
      imageAlt: shark.name,
      imageCredit: shark.imageCredit,
      choices: shuffle([shark.name, ...options], seed + 43),
      answer: shark.name,
      explanation: `The photograph shows the ${shark.name}. ${shark.fact}`,
      numberLine: { label: "Size", value: shark.lengthFt, max: maxSharkLength, unit: "ft" },
    };
  }

  if (kind === "shark-family") {
    const families = Array.from(new Set(pool.map((item) => item.family)));
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
    const challenger = sample(pool.filter((item) => item.id !== shark.id), seed + 46);
    const stat = kind === "shark-bigger" ? "length" : kind === "shark-faster" ? "speed" : "power";
    return sharkComparisonQuestion(seed, shark, challenger, stat);
  }

  if (kind === "shark-difference") {
    const challenger = sample(pool.filter((item) => item.id !== shark.id && item.lengthFt !== shark.lengthFt), seed + 48);
    const bigger = shark.lengthFt > challenger.lengthFt ? shark : challenger;
    const smaller = shark.lengthFt > challenger.lengthFt ? challenger : shark;
    const roundedLengths = roundedSubtractionPair(bigger.lengthFt, smaller.lengthFt, 4);
    const biggerValue = roundedLengths.biggerValue;
    const smallerValue = Math.max(1, roundedLengths.smallerValue);
    const diff = biggerValue - smallerValue;
    const correct = `${formatNumber(diff)} ft`;
    const choices = differenceChoices(diff, "ft", 4, difficulty, seed + 49);
    const cards = shuffle([roundedComparisonCard(sharkCard(bigger, "A", "length"), biggerValue, "ft"), roundedComparisonCard(sharkCard(smaller, "B", "length"), smallerValue, "ft")], seed + 50);
    return {
      id: `${seed}-shark-difference-${bigger.id}-${smaller.id}`,
      topic: "sharks",
      kind,
      prompt: `${bigger.name} can be about ${feet(biggerValue)}. ${smaller.name} can be about ${feet(smallerValue)}. How much longer is ${bigger.name}?`,
      image: bigger.image,
      imageAlt: bigger.name,
      imageCredit: bigger.imageCredit,
      comparison: cards,
      choices: choices.includes(correct) ? choices : [correct, ...choices.slice(1)],
      answer: correct,
      explanation: `Subtracting the lengths gives ${formatNumber(biggerValue)} − ${formatNumber(smallerValue)} = ${formatNumber(diff)}. Therefore, ${bigger.name} is about ${formatNumber(diff)} feet longer.`,
      numberLine: { label: "Difference", value: diff, max: maxSharkLength, unit: "ft" },
    };
  }

  const choiceCount = choiceCountForDifficulty(difficulty);
  const otherSharks = sharks.filter((item) => item.id !== shark.id);
  const distinctMenus = otherSharks.filter((item) => !dietsOverlap(shark.diet, item.diet));
  const distractorPool = distinctMenus.length >= choiceCount - 1 ? distinctMenus : otherSharks;
  const distractorSharks = shuffle(distractorPool, seed + 51).slice(0, choiceCount - 1);
  const menuSharks = shuffle([shark, ...distractorSharks], seed + 52);
  const targetFood = sample(dietParts(shark.diet), seed + 53);
  return {
    id: `${seed}-shark-reading-${shark.id}`,
    topic: "sharks",
    kind: "shark-reading",
    prompt: promptVariant(seed + 51, [
      `Which shark's menu includes ${targetFood}?`,
      `Use the field notes: which shark would choose ${targetFood}?`,
      `Find ${targetFood} in the menus. Which shark does it belong to?`,
    ]),
    readingClue: `Compare the field notes: ${menuSharks.map((item) => `${item.name} — ${naturalList(item.diet)}`).join(". ")}.`,
    image: shark.image,
    imageAlt: shark.name,
    imageCredit: shark.imageCredit,
    choices: answerChoices(shark.name, distractorSharks.map((item) => item.name), seed + 51, choiceCount),
    answer: shark.name,
    explanation: `${shark.name} eats ${naturalList(shark.diet)}. ${shark.fact}`,
  };
};

const jetNameDistractors = (jet: Jet, difficulty: Difficulty, seed: number) => {
  const count = choiceCountForDifficulty(difficulty) - 1;
  const pool = preferredPool(jets, difficulty);
  const closePool = pool.filter((item) => item.id !== jet.id && (item.category === jet.category || item.country === jet.country));
  const fallbackPool = pool.filter((item) => item.id !== jet.id);
  return shuffle(closePool.length >= count ? closePool : fallbackPool, seed).slice(0, count).map((item) => item.name);
};

const jetReadingOptions = (jet: Jet, seed: number, count: number) => {
  const wrongCategory = sample(jets.filter((item) => item.category !== jet.category), seed + 1);
  const wrongCountry = sample(jets.filter((item) => item.country !== jet.country), seed + 2);
  const wrongSpeed = sample(jets.filter((item) => Math.abs(item.maxSpeedMph - jet.maxSpeedMph) >= 250), seed + 3);
  const wrongRange = sample(jets.filter((item) => Math.abs(item.rangeMiles - jet.rangeMiles) >= 800), seed + 4);
  const correctOptions = [
    `${jet.name} is ${jetCategoryWithArticle(jet.category)}`,
    `${jet.name} is from ${jetCountryInProse(jet.country)}`,
    `${jet.name} reaches about ${formatNumber(jet.maxSpeedMph)} mph`,
    `${jet.name} has about ${formatNumber(jet.rangeMiles)} miles of range`,
  ];
  const correct = sample(correctOptions, seed + 5);
  const distractors = [
    `${jet.name} is ${jetCategoryWithArticle(wrongCategory.category)}`,
    `${jet.name} is from ${jetCountryInProse(wrongCountry.country)}`,
    `${jet.name} reaches about ${formatNumber(wrongSpeed.maxSpeedMph)} mph`,
    `${jet.name} has about ${formatNumber(wrongRange.rangeMiles)} miles of range`,
  ].filter((option) => option !== correct);

  return {
    answer: correct,
    choices: shuffle([correct, ...shuffle(Array.from(new Set(distractors)), seed + 6).slice(0, count - 1)], seed + 7),
  };
};

const jetQuestion = (seed: number, difficulty: Difficulty): Question => {
  const pool = preferredPool(jets, difficulty);
  const questionDepth = questionDepthForSelection(difficulty, seed);
  const jet = sample(pool, seed);
  const kinds: QuestionKind[] = questionDepth === 1
    ? ["jet-name", "jet-category", "jet-faster", "jet-reading"]
    : questionDepth === 2
      ? ["jet-name", "jet-category", "jet-faster", "jet-range", "jet-firepower", "jet-difference"]
      : ["jet-faster", "jet-range", "jet-firepower", "jet-difference", "jet-category"];
  const kind = sample(kinds, seed + 53);

  if (kind === "jet-name") {
    const options = jetNameDistractors(jet, difficulty, seed + 54);
    return {
      id: `${seed}-jet-name-${jet.id}`,
      topic: "jets",
      kind,
      prompt: "Which jet is shown here?",
      image: jet.image,
      imageAlt: jet.name,
      imageCredit: jet.imageCredit,
      choices: shuffle([jet.name, ...options], seed + 55),
      answer: jet.name,
      explanation: `The photograph shows the ${jet.name}. ${jet.fact}`,
      numberLine: { label: "Speed", value: jet.maxSpeedMph, max: maxJetSpeed, unit: "mph" },
    };
  }

  if (kind === "jet-category") {
    const categories = Array.from(new Set(pool.map((item) => jetCategoryLabels[item.category])));
    const correct = jetCategoryLabels[jet.category];
    const options = shuffle(categories.filter((category) => category !== correct), seed + 56).slice(0, choiceCountForDifficulty(difficulty) - 1);
    return {
      id: `${seed}-jet-category-${jet.id}`,
      topic: "jets",
      kind,
      prompt: promptVariant(seed + 56, [`Which mission category describes ${jet.name}?`, `Read the category choices. What kind of aircraft is ${jet.name}?`, `Which mission label belongs to ${jet.name}?`]),
      image: jet.image,
      imageAlt: jet.name,
      imageCredit: jet.imageCredit,
      choices: shuffle([correct, ...options], seed + 57),
      answer: correct,
      explanation: `${jet.name} is ${jetCategoryWithArticle(jet.category)} from ${jetCountryInProse(jet.country)}. ${jet.fact}`,
      locations: [jetWorldLocation(jet)],
    };
  }

  if (kind === "jet-faster" || kind === "jet-range" || kind === "jet-firepower") {
    const challenger = sample(pool.filter((item) => item.id !== jet.id), seed + 58);
    const stat = kind === "jet-faster" ? "speed" : kind === "jet-range" ? "range" : "firepower";
    return jetComparisonQuestion(seed, jet, challenger, stat);
  }

  if (kind === "jet-difference") {
    const challenger = sample(pool.filter((item) => item.id !== jet.id && item.maxSpeedMph !== jet.maxSpeedMph), seed + 59);
    const faster = jet.maxSpeedMph > challenger.maxSpeedMph ? jet : challenger;
    const slower = jet.maxSpeedMph > challenger.maxSpeedMph ? challenger : jet;
    const step = questionDepth === 1 ? 150 : questionDepth === 2 ? 75 : 40;
    const { biggerValue, smallerValue, diff } = roundedSubtractionPair(faster.maxSpeedMph, slower.maxSpeedMph, step);
    const correct = `${formatNumber(diff)} mph`;
    const choiceStep = questionDepth === 1 ? 150 : questionDepth === 2 ? 75 : 80;
    const choices = differenceChoices(diff, "mph", choiceStep, questionDepth, seed + 60);
    const cards = shuffle([roundedComparisonCard(jetCard(faster, "A", "speed"), biggerValue, "mph"), roundedComparisonCard(jetCard(slower, "B", "speed"), smallerValue, "mph")], seed + 61);
    return {
      id: `${seed}-jet-difference-${faster.id}-${slower.id}`,
      topic: "jets",
      kind,
      prompt: `${faster.name} can reach about ${formatNumber(biggerValue)} mph. ${slower.name} can reach about ${formatNumber(smallerValue)} mph. How much faster is ${faster.name}?`,
      image: faster.image,
      imageAlt: faster.name,
      imageCredit: faster.imageCredit,
      comparison: cards,
      choices: choices.includes(correct) ? choices : [correct, ...choices.slice(1)],
      answer: correct,
      explanation: `Subtracting the speeds gives ${formatNumber(biggerValue)} − ${formatNumber(smallerValue)} = ${formatNumber(diff)}. Therefore, ${faster.name} is about ${formatNumber(diff)} mph faster.`,
      numberLine: { label: "Difference", value: diff, max: maxJetSpeed, unit: "mph" },
    };
  }

  const reading = jetReadingOptions(jet, seed + 62, choiceCountForDifficulty(difficulty));
  return {
    id: `${seed}-jet-reading-${jet.id}`,
    topic: "jets",
    kind: "jet-reading",
    prompt: promptVariant(seed + 63, ["Which statement is true?", "Read the aircraft card. Which statement matches?", "Which statement is supported by the field note?"]),
    readingClue: `${jet.name} is ${jetCategoryWithArticle(jet.category)} from ${jetCountryInProse(jet.country)}. It can reach about ${formatNumber(jet.maxSpeedMph)} mph and has a range of about ${formatNumber(jet.rangeMiles)} miles.`,
    image: jet.image,
    imageAlt: jet.name,
    imageCredit: jet.imageCredit,
    choices: reading.choices,
    answer: reading.answer,
    explanation: `${jet.name} is the answer. ${jet.fact}`,
    locations: [jetWorldLocation(jet)],
  };
};

const spaceQuestion = (seed: number, difficulty: Difficulty): Question => {
  const pool = preferredPool(spaceCards, difficulty);
  const questionDepth = questionDepthForSelection(difficulty, seed);
  const item = sample(pool, seed);
  const kinds: QuestionKind[] = questionDepth === 1
    ? ["space-name", "space-farther", "space-concept", "space-reading"]
    : questionDepth === 2
      ? ["space-name", "space-hotter", "space-bigger", "space-farther", "space-moons", "space-concept", "space-reading"]
      : ["space-hotter", "space-bigger", "space-farther", "space-moons", "space-concept", "space-reading"];
  const kind = sample(kinds, seed + 61);

  if (kind === "space-name") {
    const options = shuffle(pool.filter((card) => card.id !== item.id).map((card) => card.name), seed + 62).slice(0, choiceCountForDifficulty(difficulty) - 1);
    return {
      id: `${seed}-space-name-${item.id}`,
      topic: "space",
      kind,
      prompt: "Which space object or concept is shown here?",
      image: item.image,
      imageAlt: item.name,
      imageCredit: item.imageCredit,
      choices: shuffle([item.name, ...options], seed + 63),
      answer: item.name,
      explanation: `${item.name} is the answer. ${item.fact}`,
      numberLine: item.kind === "planet" && item.distanceFromSunMillionMiles ? { label: "Distance from Sun", value: item.distanceFromSunMillionMiles, max: maxPlanetDistance, unit: "million mi" } : undefined,
    };
  }

  if (kind === "space-hotter") {
    const comparisonPool = preferredPool(seedRandom(seed + 64) > 0.45 ? spaceStars : spacePlanets.filter((card) => card.meanSurfaceTempF !== undefined), difficulty);
    const first = sample(comparisonPool, seed + 65);
    const second = sample(comparisonPool.filter((card) => card.id !== first.id), seed + 66);
    return spaceComparisonQuestion(seed, first, second, "temp");
  }

  if (kind === "space-bigger") {
    const comparisonPool = preferredPool(seedRandom(seed + 68) > 0.5 ? spaceStars : spacePlanets, difficulty);
    const first = sample(comparisonPool, seed + 69);
    const second = sample(comparisonPool.filter((card) => card.id !== first.id), seed + 70);
    return spaceComparisonQuestion(seed, first, second, "radius");
  }

  if (kind === "space-farther") {
    const comparisonPool = preferredPool(spacePlanets, difficulty);
    const first = sample(comparisonPool, seed + 72);
    const second = sample(comparisonPool.filter((card) => card.id !== first.id), seed + 73);
    return spaceComparisonQuestion(seed, first, second, "distance");
  }

  if (kind === "space-moons") {
    const comparisonPool = preferredPool(spacePlanets, difficulty);
    const first = sample(comparisonPool, seed + 75);
    const second = sample(comparisonPool.filter((card) => card.id !== first.id), seed + 76);
    return spaceComparisonQuestion(seed, first, second, "moons");
  }

  if (kind === "space-concept") {
    const conceptPool = preferredPool(spaceConcepts, difficulty);
    const concept = sample(conceptPool, seed + 78);
    const answer = concept.conceptAnswer ?? concept.fact;
    const options = [
      ...conceptPool.filter((card) => card.id !== concept.id).map((card) => card.conceptAnswer ?? card.fact),
      "A small rocky world that travels around the Sun.",
      "A natural satellite that travels around a planet.",
      "A band of icy objects beyond Neptune.",
    ];
    return {
      id: `${seed}-space-concept-${concept.id}`,
      topic: "space",
      kind,
      prompt: concept.conceptQuestion ?? `What is ${concept.name}?`,
      image: concept.image,
      imageAlt: concept.name,
      imageCredit: concept.imageCredit,
      choices: answerChoices(answer, options, seed + 80, choiceCountForDifficulty(difficulty)),
      answer,
      explanation: concept.fact,
    };
  }

  const readable = item.kind === "star"
    ? `${item.name} belongs to the ${item.group} group. Some measurements of giant stars are estimates.`
    : item.kind === "planet"
      ? `${item.name} is about ${spaceStatProse(spaceValue(item, "distance"), "distance", item)} from the Sun.`
      : item.fact;
  return {
    id: `${seed}-space-reading-${item.id}`,
    topic: "space",
    kind: "space-reading",
    prompt: promptVariant(seed + 81, ["Which statement is true?", "Read the space note. Which statement matches?", "Which statement is supported by the clue?", "Choose the statement that the field note supports."]),
    readingClue: readable,
    image: item.image,
    imageAlt: item.name,
    imageCredit: item.imageCredit,
    choices: answerChoices(
      item.kind === "star" ? "Measurements of giant stars can be estimates" : item.kind === "planet" ? `${item.name} is in the solar system` : item.conceptAnswer ?? item.fact,
      ["It is a pepper", "It is a shark family", "It is a skyscraper"],
      seed + 81,
      choiceCountForDifficulty(difficulty),
    ),
    answer: item.kind === "star" ? "Measurements of giant stars can be estimates" : item.kind === "planet" ? `${item.name} is in the solar system` : item.conceptAnswer ?? item.fact,
    explanation: readable,
  };
};

export const buildHeadToHeadSession = (topic: TopicScope, difficulty: Difficulty, sessionSeed: number, seenIds: string[]) => {
  const questions: Question[] = [];
  const topicOrder = topicsForScope(topic);
  const curatedOrder = shuffle(curatedHeadToHeads.filter((spec) => topicOrder.includes(spec.topic)), sessionSeed + 313);
  const usedKeys = questionHistoryKeySet(seenIds);
  let attempt = 0;

  while (questions.length < sessionLength && attempt < 180) {
    const seed = sessionSeed + attempt * 43 + questions.length * 29;
    const curated = curatedOrder[attempt];
    const question = curated
      ? headToHeadQuestionFromSpec(curated, seed)
      : randomHeadToHeadQuestion(topicOrder[(questions.length + attempt) % topicOrder.length], difficulty, seed);

    if (question?.comparison && rememberFreshQuestion(question, usedKeys)) {
      questions.push(question);
    }
    attempt += 1;
  }

  let fallbackAttempt = 0;
  while (questions.length < sessionLength && fallbackAttempt < 240) {
    const seed = sessionSeed + questions.length * 101 + attempt + fallbackAttempt * 37;
    const currentTopic = topicOrder[questions.length % topicOrder.length];
    const question = randomHeadToHeadQuestion(currentTopic, difficulty, seed);
    if (rememberFreshQuestion(question, usedKeys)) questions.push(question);
    fallbackAttempt += 1;
  }

  while (questions.length < sessionLength) {
    const seed = sessionSeed + questions.length * 101 + attempt + fallbackAttempt;
    const currentTopic = topicOrder[questions.length % topicOrder.length];
    questions.push(randomHeadToHeadQuestion(currentTopic, difficulty, seed));
  }

  return questions;
};

export const buildSession = (topic: TopicScope, difficulty: Difficulty, sessionSeed: number, seenIds: string[], unlockedTitles: readonly string[] = []) => {
  const questions: Question[] = [];
  const topicOrder = topicsForScope(topic);
  const usedKeys = questionHistoryKeySet(seenIds);
  let attempt = 0;

  while (questions.length < sessionLength && attempt < 160) {
    const currentTopic = topicOrder[(questions.length + attempt) % topicOrder.length];
    const seed = sessionSeed + attempt * 17 + questions.length * 31;
    const question = currentTopic === "peppers" ? pepperQuestion(seed, difficulty, unlockedTitles) : currentTopic === "buildings" ? buildingQuestion(seed, difficulty) : currentTopic === "sharks" ? sharkQuestion(seed, difficulty) : currentTopic === "jets" ? jetQuestion(seed, difficulty) : currentTopic === "countries" ? countryQuestion(seed, difficulty, unlockedTitles) : spaceQuestion(seed, difficulty);
    if (rememberFreshQuestion(question, usedKeys)) {
      questions.push(question);
    }
    attempt += 1;
  }

  let fallbackAttempt = 0;
  while (questions.length < sessionLength && fallbackAttempt < 240) {
    const seed = sessionSeed + questions.length * 101 + attempt + fallbackAttempt * 37;
    const currentTopic = topicOrder[questions.length % topicOrder.length];
    const question = currentTopic === "peppers" ? pepperQuestion(seed, difficulty, unlockedTitles) : currentTopic === "buildings" ? buildingQuestion(seed, difficulty) : currentTopic === "sharks" ? sharkQuestion(seed, difficulty) : currentTopic === "jets" ? jetQuestion(seed, difficulty) : currentTopic === "countries" ? countryQuestion(seed, difficulty, unlockedTitles) : spaceQuestion(seed, difficulty);
    if (rememberFreshQuestion(question, usedKeys)) questions.push(question);
    fallbackAttempt += 1;
  }

  while (questions.length < sessionLength) {
    const seed = sessionSeed + questions.length * 101 + attempt + fallbackAttempt;
    const currentTopic = topicOrder[questions.length % topicOrder.length];
    questions.push(currentTopic === "peppers" ? pepperQuestion(seed, difficulty, unlockedTitles) : currentTopic === "buildings" ? buildingQuestion(seed, difficulty) : currentTopic === "sharks" ? sharkQuestion(seed, difficulty) : currentTopic === "jets" ? jetQuestion(seed, difficulty) : currentTopic === "countries" ? countryQuestion(seed, difficulty, unlockedTitles) : spaceQuestion(seed, difficulty));
  }

  return questions;
};
