import { buildings, heatBands, peppers, type Difficulty, type HeatBand, type Pepper, type TopicId } from "./game-data";

export type QuestionKind =
  | "pepper-heat"
  | "pepper-shu"
  | "pepper-hotter"
  | "pepper-reading"
  | "building-name"
  | "building-height"
  | "building-taller"
  | "building-math"
  | "building-reading";

export type Question = {
  id: string;
  topic: "peppers" | "buildings";
  kind: QuestionKind;
  prompt: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  choices: string[];
  answer: string;
  explanation: string;
  numberLine?: {
    label: string;
    value: number;
    max: number;
    unit: string;
  };
};

const choiceCountForDifficulty = (difficulty: Difficulty) => (difficulty === 1 ? 3 : 4);

const shuffle = <T,>(items: T[], seed: number) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seedRandom(seed + i) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const seedRandom = (seed: number) => {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
};

const sample = <T,>(items: T[], seed: number) => items[Math.floor(seedRandom(seed) * items.length) % items.length];

const formatShu = (value: number) => value.toLocaleString("en-US");
const range = (pepper: Pepper) => pepper.shuMin === pepper.shuMax ? formatShu(pepper.shuMax) : `${formatShu(pepper.shuMin)}-${formatShu(pepper.shuMax)}`;
const feet = (value: number) => `${value.toLocaleString("en-US")} ft`;

const pepperQuestion = (seed: number, difficulty: Difficulty): Question => {
  const pepper = sample(peppers, seed);
  const kinds: QuestionKind[] = difficulty === 1
    ? ["pepper-heat", "pepper-shu", "pepper-reading"]
    : difficulty === 2
      ? ["pepper-heat", "pepper-shu", "pepper-hotter", "pepper-reading"]
      : ["pepper-shu", "pepper-hotter", "pepper-reading", "pepper-heat"];
  const kind = sample(kinds, seed + 3);

  if (kind === "pepper-heat") {
    const options = shuffle(heatBands, seed + 7).slice(0, choiceCountForDifficulty(difficulty));
    const choices = options.includes(pepper.heat) ? options : [pepper.heat, ...options.slice(1)];
    return {
      id: `${seed}-pepper-heat-${pepper.id}`,
      topic: "peppers",
      kind,
      prompt: `Look at this ${pepper.color} pepper. How spicy is a ${pepper.name}?`,
      image: pepper.image,
      imageAlt: pepper.name,
      imageCredit: pepper.imageCredit,
      choices: shuffle(choices, seed + 8),
      answer: pepper.heat,
      explanation: `${pepper.name} is ${pepper.heat}. Its Scoville score is about ${range(pepper)} SHU.`,
      numberLine: { label: "Scoville score", value: pepper.shuMax, max: 2200000, unit: "SHU" },
    };
  }

  if (kind === "pepper-hotter") {
    const challenger = sample(peppers.filter((item) => item.id !== pepper.id), seed + 11);
    const hotter = pepper.shuMax >= challenger.shuMax ? pepper : challenger;
    return {
      id: `${seed}-pepper-hotter-${pepper.id}-${challenger.id}`,
      topic: "peppers",
      kind,
      prompt: `Which pepper can be hotter?`,
      image: hotter.image,
      imageAlt: hotter.name,
      imageCredit: hotter.imageCredit,
      choices: shuffle([pepper.name, challenger.name, "They are exactly the same"], seed + 12).slice(0, 3),
      answer: hotter.name,
      explanation: `${hotter.name} can reach ${formatShu(hotter.shuMax)} SHU. Bigger Scoville numbers mean more heat.`,
      numberLine: { label: hotter.name, value: hotter.shuMax, max: 2200000, unit: "SHU" },
    };
  }

  if (kind === "pepper-reading") {
    const words: Record<HeatBand, string> = {
      mild: "Mild means little or no spicy burn.",
      medium: "Medium means spicy, but not super-hot.",
      hot: "Hot means a big spicy kick.",
      "very hot": "Very hot means only tiny bites for grown-ups.",
    };
    return {
      id: `${seed}-pepper-reading-${pepper.id}`,
      topic: "peppers",
      kind,
      prompt: `Read this: "${words[pepper.heat]}" What word best matches ${pepper.name}?`,
      image: pepper.image,
      imageAlt: pepper.name,
      imageCredit: pepper.imageCredit,
      choices: shuffle(heatBands, seed + 13).slice(0, 4),
      answer: pepper.heat,
      explanation: `${pepper.name} belongs in the "${pepper.heat}" group.`,
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
    explanation: `${pepper.name} is about ${correct}. Scoville numbers measure pepper heat.`,
    numberLine: { label: "Heat", value: pepper.shuMax, max: 2200000, unit: "SHU" },
  };
};

const buildingQuestion = (seed: number, difficulty: Difficulty): Question => {
  const building = sample(buildings, seed);
  const kinds: QuestionKind[] = difficulty === 1
    ? ["building-name", "building-height", "building-reading"]
    : difficulty === 2
      ? ["building-name", "building-height", "building-taller", "building-math", "building-reading"]
      : ["building-height", "building-taller", "building-math", "building-reading"];
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
      numberLine: { label: "Height", value: building.heightFt, max: 3281, unit: "ft" },
    };
  }

  if (kind === "building-taller") {
    const challenger = sample(buildings.filter((item) => item.id !== building.id), seed + 26);
    const taller = building.heightFt >= challenger.heightFt ? building : challenger;
    return {
      id: `${seed}-building-taller-${building.id}-${challenger.id}`,
      topic: "buildings",
      kind,
      prompt: `Which one is taller?`,
      image: taller.image,
      imageAlt: taller.name,
      imageCredit: taller.imageCredit,
      choices: shuffle([building.name, challenger.name, "Same height"], seed + 27),
      answer: taller.name,
      explanation: `${taller.name} is ${feet(taller.heightFt)} tall. Taller means the bigger number wins.`,
      numberLine: { label: taller.name, value: taller.heightFt, max: 3281, unit: "ft" },
    };
  }

  if (kind === "building-math") {
    const rounded = Math.round(building.heightFt / 100) * 100;
    return {
      id: `${seed}-building-math-${building.id}`,
      topic: "buildings",
      kind,
      prompt: `${building.name} is ${feet(building.heightFt)}. What is that closest to?`,
      image: building.image,
      imageAlt: building.name,
      imageCredit: building.imageCredit,
      choices: shuffle([`${rounded.toLocaleString("en-US")} ft`, `${(rounded + 500).toLocaleString("en-US")} ft`, `${Math.max(100, rounded - 500).toLocaleString("en-US")} ft`], seed + 28),
      answer: `${rounded.toLocaleString("en-US")} ft`,
      explanation: `${feet(building.heightFt)} rounds to about ${rounded.toLocaleString("en-US")} feet.`,
      numberLine: { label: "Height", value: building.heightFt, max: 3281, unit: "ft" },
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
      prompt: `Read this: "${sentence}" What is true?`,
      image: building.image,
      imageAlt: building.name,
      imageCredit: building.imageCredit,
      choices: shuffle([
        building.status === "finished" ? "It is finished" : "It is still being built",
        "It is a pepper",
        "It is under the ocean",
        "It is only 10 feet tall",
      ], seed + 29).slice(0, choiceCountForDifficulty(difficulty)),
      answer: building.status === "finished" ? "It is finished" : "It is still being built",
      explanation: sentence,
    };
  }

  const correct = feet(building.heightFt);
  const options = shuffle(buildings.filter((item) => item.id !== building.id).map((item) => feet(item.heightFt)), seed + 30).slice(0, choiceCountForDifficulty(difficulty) - 1);
  return {
    id: `${seed}-building-height-${building.id}`,
    topic: "buildings",
    kind: "building-height",
    prompt: `How tall is ${building.name}?`,
    image: building.image,
    imageAlt: building.name,
    imageCredit: building.imageCredit,
    choices: shuffle([correct, ...options], seed + 31),
    answer: correct,
    explanation: `${building.name} is ${correct} tall. It is in ${building.city}, ${building.country}.`,
    numberLine: { label: "Height", value: building.heightFt, max: 3281, unit: "ft" },
  };
};

export const buildSession = (topic: TopicId, difficulty: Difficulty, sessionSeed: number, seenIds: string[]) => {
  const questions: Question[] = [];
  const topicOrder = topic === "mixed" ? ["peppers", "buildings"] as const : [topic] as const;
  let attempt = 0;

  while (questions.length < 8 && attempt < 80) {
    const currentTopic = topicOrder[(questions.length + attempt) % topicOrder.length];
    const seed = sessionSeed + attempt * 17 + questions.length * 31;
    const question = currentTopic === "peppers" ? pepperQuestion(seed, difficulty) : buildingQuestion(seed, difficulty);
    if (!seenIds.includes(question.id) && !questions.some((item) => item.id === question.id)) {
      questions.push(question);
    }
    attempt += 1;
  }

  while (questions.length < 8) {
    const seed = sessionSeed + questions.length * 101 + attempt;
    questions.push(topicOrder[questions.length % topicOrder.length] === "peppers" ? pepperQuestion(seed, difficulty) : buildingQuestion(seed, difficulty));
  }

  return questions;
};
