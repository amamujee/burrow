import {
  buildings,
  heatBands,
  heatBandRangeLabel,
  heatProfiles,
  jets,
  peppers,
  sharks,
  spaceCards,
  topicIds,
  type Building,
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
import { scoreFeaturedContent } from "./content-quality";
import { sample, sampleSafe, seedRandom, shuffle } from "./random";

export type GameMode = "mix" | "quiz" | "versus" | "trumps" | "sort" | "fact" | "peek" | "number" | "odd";

export const modeOptions: {
  id: GameMode;
  label: string;
  eyebrow: string;
  loop: string;
}[] = [
  { id: "mix", label: "Mix", eyebrow: "shuffle", loop: "all games" },
  { id: "quiz", label: "Quiz Run", eyebrow: "mixed skills", loop: "15-20 bites" },
  { id: "versus", label: "Head to Head", eyebrow: "pick winner", loop: "fast duels" },
  { id: "trumps", label: "Top Trumps", eyebrow: "player vs CPU", loop: "choose stat" },
  { id: "sort", label: "Sort", eyebrow: "order cards", loop: "tap order" },
  { id: "fact", label: "True/False", eyebrow: "read fast", loop: "true or not" },
  { id: "peek", label: "Peek", eyebrow: "picture clue", loop: "reveal guess" },
  { id: "number", label: "Numbers", eyebrow: "math clue", loop: "solve gap" },
  { id: "odd", label: "Odd One", eyebrow: "spot rule", loop: "logic pick" },
];

export type { KnowledgeTopic } from "./game-data";
export type TopicScope = TopicId | readonly KnowledgeTopic[];
export type RoundTopic = string;

export type KnowledgeCard = {
  id: string;
  topic: RoundTopic;
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
  topic: RoundTopic;
  prompt: string;
  cards: KnowledgeCard[];
  answerIds: string[];
  explanation: string;
  statLabel: string;
};

export type FactRound = {
  id: string;
  topic: RoundTopic;
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
  topic: RoundTopic;
  prompt: string;
  card: KnowledgeCard;
  choices: string[];
  answer: string;
  explanation: string;
};

export type NumberRound = {
  id: string;
  topic: RoundTopic;
  operation: "addition" | "subtraction";
  prompt: string;
  cards: KnowledgeCard[];
  statLabel: string;
  unit: string;
  operator: "+" | "-";
  termValues: number[];
  resultLabel: string;
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
  topic: RoundTopic;
  prompt: string;
  cards: KnowledgeCard[];
  answerId: string;
  reason: string;
  explanation: string;
};

export type TopTrumpDirection = "higher" | "lower";

export type TopTrumpStat = {
  id: string;
  label: string;
  value: number;
  display: string;
  direction: TopTrumpDirection;
};

export type TopTrumpCard = {
  id: string;
  topic: RoundTopic;
  title: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  subStat: string;
  fact: string;
  stats: TopTrumpStat[];
};

export type TopTrumpRound = {
  id: string;
  topic: RoundTopic;
  prompt: string;
  player: TopTrumpCard;
  computer: TopTrumpCard;
};

export type GenericKnowledgeCard = KnowledgeCard & {
  categories: string[];
  stats: TopTrumpStat[];
};

const formatNumber = (value: number) => value.toLocaleString("en-US");
const feet = (value: number) => `${formatNumber(value)} ft`;
const numberWithUnit = (value: number, unit: string) => `${formatNumber(value)} ${unit}`;
const pounds = (value: number) => `${formatNumber(value)} lb`;
const inches = (value: number) => `${value.toFixed(value >= 10 ? 0 : 1)} in`;

const roundTo = (value: number, step: number) => Math.round(value / step) * step;
const roundedSubtractionPair = (bigger: number, smaller: number, step: number) => {
  const biggerValue = Math.max(step, roundTo(bigger, step));
  const smallerValue = Math.max(0, Math.min(biggerValue - step, roundTo(smaller, step)));
  return { biggerValue, smallerValue, answer: biggerValue - smallerValue };
};
const roundedStatCard = (card: KnowledgeCard, value: number, unit: string): KnowledgeCard => ({
  ...card,
  statValue: value,
  statDisplay: `${formatNumber(value)} ${unit}`,
});

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

const jetCard = (jet: Jet, metric: "speed" | "range" | "firepower" = "speed"): KnowledgeCard => ({
  id: jet.id,
  topic: "jets",
  title: jet.name,
  image: jet.image,
  imageAlt: jet.name,
  imageCredit: jet.imageCredit,
  statLabel: metric === "speed" ? "Speed" : metric === "range" ? "Range" : "Firepower",
  statValue: metric === "speed" ? jet.maxSpeedMph : metric === "range" ? jet.rangeMiles : jet.firepower,
  statDisplay: metric === "speed" ? `${formatNumber(jet.maxSpeedMph)} mph` : metric === "range" ? `${formatNumber(jet.rangeMiles)} mi` : `${jet.firepower}/5`,
  subStat: `${jet.country} · ${jetCategoryLabels[jet.category]}`,
  fact: jet.fact,
  qualityScore: scoreFeaturedContent({ ...jet, statValue: metric === "speed" ? jet.maxSpeedMph : metric === "range" ? jet.rangeMiles : jet.firepower }).score,
  qualityFlags: scoreFeaturedContent({ ...jet, statValue: metric === "speed" ? jet.maxSpeedMph : metric === "range" ? jet.rangeMiles : jet.firepower }).flags,
});

export const collectionCards = (): KnowledgeCard[] => [
  ...peppers.map(pepperCard),
  ...buildings.map(buildingCard),
  ...sharks.map((shark) => sharkCard(shark)),
  ...spaceCards.map((space) => spaceCard(space, space.kind === "star" ? "temperature" : space.kind === "planet" ? "distance" : "size")),
  ...jets.map((jet) => jetCard(jet)),
];

const pepperSizeInches: Record<string, number> = {
  "bell-pepper": 4,
  "banana-pepper": 6,
  pepperoncini: 3,
  poblano: 5,
  anaheim: 7,
  jalapeno: 3,
  fresno: 3,
  serrano: 2.5,
  cayenne: 5,
  tabasco: 1.5,
  "thai-chili": 2,
  "scotch-bonnet": 1.5,
  habanero: 2,
  fatalii: 3,
  "ghost-pepper": 3,
  "seven-pot-primo": 2,
  "trinidad-scorpion": 2,
  "carolina-reaper": 2,
  "dragons-breath": 1.5,
  "pepper-x": 2,
  shishito: 4,
  padron: 2,
  ancho: 5,
  guajillo: 5,
  "chile-de-arbol": 3,
  "aji-amarillo": 5,
  rocoto: 2.5,
  chiltepin: 0.4,
  cubanelle: 6,
  "cherry-pepper": 1.5,
  pasilla: 8,
  mulato: 5,
  cascabel: 1.5,
  "hatch-chile": 6,
  "new-mexico-chile": 6,
  datil: 3,
  manzano: 2.5,
  "aji-limo": 3,
  "aji-charapita": 0.4,
  "lemon-drop": 3,
  "bishop-crown": 2,
  "fish-pepper": 3,
  "goat-pepper": 2,
  pequin: 0.8,
  "naga-viper": 2,
  "komodo-dragon": 2,
  "trinidad-perfume": 1.5,
  "peter-pepper": 4,
  "purple-beauty": 4,
  "madame-jeanette": 3,
};

const pepperWildness = (pepper: Pepper) => {
  if (["chiltepin", "pequin", "aji-charapita"].includes(pepper.id)) return 10;
  if (["padron", "shishito", "rocoto", "manzano", "aji-amarillo", "aji-limo", "lemon-drop", "bishop-crown", "tabasco", "cayenne", "poblano", "jalapeno", "serrano", "fish-pepper"].includes(pepper.id)) return 7;
  if (["bell-pepper", "banana-pepper", "pepperoncini", "anaheim", "fresno", "thai-chili", "habanero", "scotch-bonnet", "cubanelle", "cherry-pepper", "pasilla", "mulato", "cascabel", "hatch-chile", "new-mexico-chile", "datil", "goat-pepper", "trinidad-perfume", "peter-pepper", "purple-beauty", "madame-jeanette"].includes(pepper.id)) return 5;
  return 2;
};

const sharkWeightLb = (shark: Shark) => Math.round(Math.max(10, shark.lengthFt ** 2.85 * (shark.power >= 4 ? 0.85 : 0.55)));
const sharkRarity = (shark: Shark) => {
  const rarity: Record<string, number> = {
    dunkleosteus: 10,
    megalodon: 10,
    "goblin-shark": 9,
    megamouth: 9,
    "frilled-shark": 9,
    "greenland-shark": 8,
    cookiecutter: 8,
    sawshark: 7,
    "great-hammerhead": 7,
    "scalloped-hammerhead": 7,
    "oceanic-whitetip": 7,
    "basking-shark": 6,
    "common-thresher": 6,
    "shortfin-mako": 6,
    "bull-shark": 5,
    "tiger-shark": 5,
    "great-white": 5,
    "blue-shark": 4,
    "lemon-shark": 4,
    "zebra-shark": 4,
    "nurse-shark": 3,
    "blacktip-reef": 3,
    "sand-tiger": 3,
    "whale-shark": 6,
    "epaulette-shark": 5,
    "longfin-mako": 8,
    "bigeye-thresher": 7,
    "pelagic-thresher": 7,
    "silky-shark": 5,
    "spinner-shark": 5,
    "dusky-shark": 6,
    "sandbar-shark": 4,
    "galapagos-shark": 6,
    "whitetip-reef": 4,
    "grey-reef-shark": 4,
    porbeagle: 6,
    "salmon-shark": 6,
    bonnethead: 3,
    "smooth-hammerhead": 6,
    "horn-shark": 4,
    "port-jackson-shark": 4,
    "spotted-wobbegong": 5,
    angelshark: 8,
    "pyjama-shark": 5,
    "bamboo-shark": 3,
    "caribbean-reef": 4,
    "silvertip-shark": 6,
    "swell-shark": 4,
    "zambezi-shark": 5,
  };
  return rarity[shark.id] ?? 5;
};
const buildingCompletedYear = (building: Building) => {
  const years: Record<string, number> = {
    "willis-tower": 1974,
    "empire-state": 1931,
    "bank-of-china": 1990,
    "petronas-towers": 1998,
    "jin-mao": 1999,
    "taipei-101": 2004,
    "burj-khalifa": 2010,
    "icc": 2010,
    "makkah-clock": 2012,
    "princess-tower": 2012,
    "432-park": 2015,
    "one-wtc": 2014,
    "shanghai-tower": 2015,
    "shanghai-wfc": 2008,
    "ping-an": 2017,
    "lotte-world-tower": 2017,
    "guangzhou-ctf": 2016,
    "tianjin-ctf": 2019,
    "lakhta-center": 2019,
    "china-zun": 2018,
    "landmark-81": 2018,
    "wuhan-greenland-center": 2023,
    "111-west-57th": 2021,
    "one-vanderbilt": 2020,
    "central-park-tower": 2020,
    "merdeka-118": 2023,
    "jeddah-tower": 2030,
  };
  return years[building.id] ?? (building.status === "under construction" ? 2030 : 2018);
};

const buildingIsInAsia = (building: Building) =>
  ["China", "Hong Kong", "Malaysia", "Saudi Arabia", "South Korea", "Taiwan", "United Arab Emirates", "Vietnam"].includes(building.country);
const buildingIsInBrooklyn = (building: Building) => ["brooklyn-tower", "brooklyn-point", "ava-dobro", "11-hoyt", "the-everly"].includes(building.id);
const buildingIsSupertall = (building: Building) => building.heightFt >= 984;
const buildingIsMegaTall = (building: Building) => building.heightFt >= 1968;

const jetFirstFlightYear = (jet: Jet) => {
  const years: Record<string, number> = {
    "f-35-lightning-ii": 2006,
    "f-22-raptor": 1997,
    "su-57": 2010,
    "j-20": 2011,
    "b-2-spirit": 1989,
    "b-21-raider": 2023,
    "f-117-nighthawk": 1981,
    "sr-71-blackbird": 1964,
    "u-2": 1955,
    "f-15-eagle": 1972,
    "f-a-18-hornet": 1978,
    "f-a-18-super-hornet": 1995,
    "f-16-fighting-falcon": 1974,
    "f-14-tomcat": 1970,
    "a-10-thunderbolt-ii": 1972,
    rafale: 1986,
    "eurofighter-typhoon": 1994,
    "jas-39-gripen": 1988,
    "mig-29": 1977,
    "su-27": 1977,
    "su-35": 2008,
    "su-34": 1990,
    "mig-31": 1975,
    "tu-160": 1981,
    "tu-22m": 1969,
    "b-1-lancer": 1974,
    "b-52-stratofortress": 1952,
    "mirage-2000": 1978,
    "mirage-f1": 1966,
    "sepecat-jaguar": 1968,
    "panavia-tornado": 1974,
    "av-8b-harrier-ii": 1981,
    "hawker-harrier": 1967,
    "l-39-albatros": 1968,
    "t-50-golden-eagle": 2002,
    "yak-130": 1996,
    "hongdu-l-15": 2006,
    "j-10": 1998,
    "j-11": 1998,
    "j-16": 2011,
    "fc-31": 2012,
    "hal-tejas": 2001,
    "mitsubishi-f-2": 1995,
    "f-15j": 1980,
    "f-ck-1": 1989,
    "iai-kfir": 1973,
    "f-5": 1959,
    "f-4-phantom-ii": 1958,
    "english-electric-lightning": 1954,
    "mig-21": 1955,
  };
  return years[jet.id] ?? 1985;
};

const jetWeightLb = (jet: Jet) => {
  const weights: Record<string, number> = {
    "f-35-lightning-ii": 70000,
    "f-22-raptor": 83500,
    "su-57": 77000,
    "j-20": 81600,
    "b-2-spirit": 336500,
    "b-21-raider": 160000,
    "f-117-nighthawk": 52500,
    "sr-71-blackbird": 172000,
    "u-2": 40000,
    "f-15-eagle": 68000,
    "f-a-18-hornet": 51900,
    "f-a-18-super-hornet": 66000,
    "f-16-fighting-falcon": 42300,
    "f-14-tomcat": 74350,
    "a-10-thunderbolt-ii": 51000,
    rafale: 54000,
    "eurofighter-typhoon": 51800,
    "jas-39-gripen": 36400,
    "mig-29": 40800,
    "su-27": 67100,
    "su-35": 76100,
    "su-34": 99200,
    "mig-31": 101000,
    "tu-160": 606000,
    "tu-22m": 275600,
    "b-1-lancer": 477000,
    "b-52-stratofortress": 488000,
    "mirage-2000": 37500,
    "mirage-f1": 35700,
    "sepecat-jaguar": 34400,
    "panavia-tornado": 61700,
    "av-8b-harrier-ii": 31000,
    "hawker-harrier": 25200,
    "l-39-albatros": 10360,
    "t-50-golden-eagle": 27300,
    "yak-130": 22700,
    "hongdu-l-15": 21600,
    "j-10": 42500,
    "j-11": 72750,
    "j-16": 77000,
    "fc-31": 61700,
    "hal-tejas": 29100,
    "mitsubishi-f-2": 48700,
    "f-15j": 68000,
    "f-ck-1": 26900,
    "iai-kfir": 36400,
    "f-5": 24700,
    "f-4-phantom-ii": 61795,
    "english-electric-lightning": 45750,
    "mig-21": 22900,
  };
  return weights[jet.id] ?? 30000;
};

const jetAltitudeFt = (jet: Jet) => {
  const altitudes: Record<string, number> = {
    "f-35-lightning-ii": 50000,
    "f-22-raptor": 65000,
    "su-57": 66000,
    "j-20": 66000,
    "b-2-spirit": 50000,
    "b-21-raider": 50000,
    "f-117-nighthawk": 45000,
    "sr-71-blackbird": 85000,
    "u-2": 70000,
    "f-15-eagle": 65000,
    "f-a-18-hornet": 50000,
    "f-a-18-super-hornet": 50000,
    "f-16-fighting-falcon": 50000,
    "f-14-tomcat": 53000,
    "a-10-thunderbolt-ii": 45000,
    rafale: 50000,
    "eurofighter-typhoon": 65000,
    "jas-39-gripen": 50000,
    "mig-29": 59000,
    "su-27": 62000,
    "su-35": 59000,
    "su-34": 56000,
    "mig-31": 67000,
    "tu-160": 52000,
    "tu-22m": 44000,
    "b-1-lancer": 60000,
    "b-52-stratofortress": 50000,
    "mirage-2000": 59000,
    "mirage-f1": 66000,
    "sepecat-jaguar": 46000,
    "panavia-tornado": 50000,
    "av-8b-harrier-ii": 50000,
    "hawker-harrier": 51000,
    "l-39-albatros": 36000,
    "t-50-golden-eagle": 48000,
    "yak-130": 41000,
    "hongdu-l-15": 52000,
    "j-10": 59000,
    "j-11": 62000,
    "j-16": 59000,
    "fc-31": 52000,
    "hal-tejas": 50000,
    "mitsubishi-f-2": 59000,
    "f-15j": 65000,
    "f-ck-1": 55000,
    "iai-kfir": 58000,
    "f-5": 51800,
    "f-4-phantom-ii": 60000,
    "english-electric-lightning": 60000,
    "mig-21": 57400,
  };
  return altitudes[jet.id] ?? 50000;
};

const spaceTrumpPool = () => spaceCards.filter((card) => card.distanceFromSunMillionMiles !== undefined);

const topTrumpCard = (topic: KnowledgeTopic, id: string): TopTrumpCard | null => {
  if (topic === "peppers") {
    const pepper = peppers.find((item) => item.id === id);
    if (!pepper) return null;
    return {
      id: pepper.id,
      topic,
      title: pepper.name,
      image: pepper.image,
      imageAlt: pepper.name,
      imageCredit: pepper.imageCredit,
      subStat: `${heatProfiles[pepper.heat].label} · ${pepper.color}`,
      fact: pepper.fact,
      stats: [
        { id: "scoville", label: "Scoville", value: pepper.shuMax, display: `${formatNumber(pepper.shuMax)} SHU`, direction: "higher" },
        { id: "size", label: "Fruit size", value: pepperSizeInches[pepper.id] ?? 2, display: inches(pepperSizeInches[pepper.id] ?? 2), direction: "higher" },
        { id: "wildness", label: "Natural roots", value: pepperWildness(pepper), display: `${pepperWildness(pepper)}/10`, direction: "higher" },
      ],
    };
  }

  if (topic === "buildings") {
    const building = buildings.find((item) => item.id === id);
    if (!building) return null;
    return {
      id: building.id,
      topic,
      title: building.name,
      image: building.image,
      imageAlt: building.name,
      imageCredit: building.imageCredit,
      subStat: `${building.city}, ${building.country}`,
      fact: building.fact,
      stats: [
        { id: "height", label: "Height", value: building.heightFt, display: feet(building.heightFt), direction: "higher" },
        { id: "floors", label: "Floors", value: building.floors ?? 0, display: `${building.floors ?? "?"}`, direction: "higher" },
        { id: "year", label: "Year built", value: buildingCompletedYear(building), display: `${buildingCompletedYear(building)} (older wins)`, direction: "lower" },
        { id: "fame", label: "Skyline fame", value: Math.min(10, Math.max(5, Math.round(building.heightFt / 350) + (building.status === "finished" ? 2 : 0))), display: `${Math.min(10, Math.max(5, Math.round(building.heightFt / 350) + (building.status === "finished" ? 2 : 0)))}/10`, direction: "higher" },
      ],
    };
  }

  if (topic === "sharks") {
    const shark = sharks.find((item) => item.id === id);
    if (!shark) return null;
    return {
      id: shark.id,
      topic,
      title: shark.name,
      image: shark.image,
      imageAlt: shark.name,
      imageCredit: shark.imageCredit,
      subStat: `${shark.family} · eats ${shark.diet}`,
      fact: shark.fact,
      stats: [
        { id: "speed", label: "Speed", value: shark.speedMph, display: `${formatNumber(shark.speedMph)} mph`, direction: "higher" },
        { id: "weight", label: "Weight", value: sharkWeightLb(shark), display: pounds(sharkWeightLb(shark)), direction: "higher" },
        { id: "length", label: "Length", value: shark.lengthFt, display: feet(shark.lengthFt), direction: "higher" },
        { id: "power", label: "Predator power", value: shark.power * 2, display: `${shark.power * 2}/10`, direction: "higher" },
        { id: "rarity", label: "Rarity", value: sharkRarity(shark), display: `${sharkRarity(shark)}/10`, direction: "higher" },
      ],
    };
  }

  if (topic === "space") {
    const space = spaceCards.find((item) => item.id === id);
    if (!space) return null;
    const sizeValue = space.radiusSolar ?? space.diameterMiles ?? 0;
    const tempValue = space.surfaceTempK ?? space.meanSurfaceTempF ?? 0;
    return {
      id: space.id,
      topic,
      title: space.name,
      image: space.image,
      imageAlt: space.name,
      imageCredit: space.imageCredit,
      subStat: `${space.group} · ${space.kind}`,
      fact: space.fact,
      stats: ([
        { id: "size", label: "Size", value: sizeValue, display: space.radiusSolar ? `${formatNumber(sizeValue)}x Sun` : `${formatNumber(sizeValue)} mi`, direction: "higher" },
        { id: "temperature", label: "Temperature", value: tempValue, display: space.surfaceTempK ? `${formatNumber(tempValue)} K` : `${formatNumber(tempValue)}°F`, direction: "higher" },
        { id: "distance", label: "Distance from Sun", value: space.distanceFromSunMillionMiles ?? 0, display: `${formatNumber(space.distanceFromSunMillionMiles ?? 0)}M mi`, direction: "higher" },
        { id: "moons", label: "Moons", value: space.moons ?? 0, display: `${formatNumber(space.moons ?? 0)}`, direction: "higher" },
      ] satisfies TopTrumpStat[]).filter((stat) => stat.value > 0 || stat.id === "moons"),
    };
  }

  const jet = jets.find((item) => item.id === id);
  if (!jet) return null;
  return {
    id: jet.id,
    topic,
    title: jet.name,
    image: jet.image,
    imageAlt: jet.name,
    imageCredit: jet.imageCredit,
    subStat: `${jet.country} · ${jetCategoryLabels[jet.category]}`,
    fact: jet.fact,
    stats: [
      { id: "speed", label: "Speed", value: jet.maxSpeedMph, display: `${formatNumber(jet.maxSpeedMph)} mph`, direction: "higher" },
      { id: "range", label: "Range", value: jet.rangeMiles, display: `${formatNumber(jet.rangeMiles)} mi`, direction: "higher" },
      { id: "weight", label: "Weight", value: jetWeightLb(jet), display: pounds(jetWeightLb(jet)), direction: "higher" },
      { id: "deadliness", label: "Deadliness", value: jet.firepower * 2, display: `${jet.firepower * 2}/10`, direction: "higher" },
      { id: "year", label: "Year created", value: jetFirstFlightYear(jet), display: `${jetFirstFlightYear(jet)} (older wins)`, direction: "lower" },
      { id: "altitude", label: "Max altitude", value: jetAltitudeFt(jet), display: feet(jetAltitudeFt(jet)), direction: "higher" },
    ],
  };
};

export const buildTopTrumpRound = (topic: TopicScope, difficulty: Difficulty, seed: number): TopTrumpRound => {
  const currentTopic = topicOrder(topic, seed);
  const pool =
    currentTopic === "peppers" ? peppers :
    currentTopic === "buildings" ? buildings :
    currentTopic === "sharks" ? sharks :
    currentTopic === "space" ? spaceTrumpPool() :
    jets;
  const shuffled = shuffle(pool.map((item) => item.id), seed + difficulty);
  const first = shuffled[0];
  const second = shuffled.find((id) => id !== first) ?? shuffled[1];
  const player = topTrumpCard(currentTopic, first);
  const computer = topTrumpCard(currentTopic, second);
  if (!player || !computer) throw new Error(`Could not build Top Trumps round for ${currentTopic}`);

  return {
    id: `${seed}-trumps-${currentTopic}-${player.id}-${computer.id}`,
    topic: currentTopic,
    prompt: "Choose your strongest category.",
    player,
    computer,
  };
};

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

const numberChoices = (answer: number, gap: number, seed: number) => {
  const candidates = [answer, Math.max(gap, answer - gap * 2), answer + gap * 2, answer + gap * 3, Math.max(gap, answer - gap * 3), answer + gap * 4, answer + gap * 5];
  const uniqueDistractors = Array.from(new Set(candidates.filter((item) => item >= 0 && item !== answer)));
  return shuffle([answer, ...shuffle(uniqueDistractors, seed + 1).slice(0, 3)], seed);
};

const cardsWithStats = (cards: readonly GenericKnowledgeCard[]) => cards.filter((card) => card.stats.length && Number.isFinite(card.statValue));

const distinctStatCards = <T extends { statValue: number }>(cards: readonly T[], seed: number, requestedCount: number) => {
  const selected: T[] = [];
  const seenValues = new Set<number>();
  for (const card of shuffle(cards.filter((item) => Number.isFinite(item.statValue)), seed)) {
    if (seenValues.has(card.statValue)) continue;
    seenValues.add(card.statValue);
    selected.push(card);
    if (selected.length === requestedCount) break;
  }
  return selected;
};

const statValueGap = (values: readonly number[]) => {
  const sorted = [...new Set(values.map((value) => Math.abs(value)).filter((value) => Number.isFinite(value)))].sort((a, b) => a - b);
  const max = sorted.at(-1) ?? 10;
  if (max >= 1000) return 100;
  if (max >= 100) return 10;
  if (max >= 10) return 2;
  return 1;
};

const sameStatCard = (card: GenericKnowledgeCard, value: number): KnowledgeCard => ({
  ...card,
  statValue: value,
  statDisplay: numberWithUnit(value, card.stats[0]?.display.replace(formatNumber(card.stats[0].value), "").trim() || ""),
});

export const buildSortRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
): SortRound => {
  const pool = cardsWithStats(cards);
  if (pool.length < 3) throw new Error(`Need at least 3 stat cards to build a sort round for ${topic}`);
  const count = Math.min(pool.length, difficulty === 1 ? 3 : 4);
  const selected = distinctStatCards(pool, seed + 1, count);
  if (selected.length < 3) throw new Error(`Need at least 3 distinct stat values to build a sort round for ${topic}`);
  const sorted = [...selected].sort((a, b) => a.statValue - b.statValue);

  return {
    id: `${seed}-sort-${topic}-${selected.map((card) => card.id).join("-")}`,
    topic,
    prompt: `Tap from lowest to highest ${selected[0].statLabel}.`,
    cards: shuffle(selected, seed + 2),
    answerIds: sorted.map((card) => card.id),
    explanation: sorted.map((card) => `${card.title}: ${card.statDisplay}`).join("  |  "),
    statLabel: selected[0].statLabel,
  };
};

export const buildRevealRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
): RevealRound => {
  if (cards.length < 3) throw new Error(`Need at least 3 cards to build a peek round for ${topic}`);
  const count = Math.min(cards.length, difficulty === 1 ? 3 : 4);
  const card = sample(cards, seed + 1);
  const distractors = shuffle(cards.filter((item) => item.id !== card.id).map((item) => item.title), seed + 2).slice(0, count - 1);

  return {
    id: `${seed}-peek-${topic}-${card.id}`,
    topic,
    prompt: "What is hiding in the picture?",
    card,
    choices: shuffle([card.title, ...distractors], seed + 3),
    answer: card.title,
    explanation: `${card.title}: ${card.fact}`,
  };
};

export const buildFactRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
): FactRound => {
  const pool = cardsWithStats(cards);
  if (pool.length < 2) throw new Error(`Need at least 2 stat cards to build a fact round for ${topic}`);
  const truthful = seedRandom(seed + 11) > 0.46;
  const card = sample(pool, seed + 12);
  const fakeCard = sampleSafe(pool.filter((item) => item.id !== card.id && item.statValue !== card.statValue), pool.filter((item) => item.id !== card.id), seed + 13);
  const useStat = difficulty > 1 || seedRandom(seed + 14) > 0.45;
  const statement = truthful
    ? useStat
      ? `${card.title} has ${card.statDisplay}.`
      : card.fact
    : `${card.title} has ${fakeCard.statDisplay}.`;

  return {
    id: `${seed}-fact-${topic}-${card.id}`,
    topic,
    prompt: "True or false?",
    statement,
    image: card.image,
    imageAlt: card.imageAlt,
    imageCredit: card.imageCredit,
    answer: truthful ? "True" : "False",
    explanation: `${card.title} has ${card.statDisplay}. ${card.fact}`,
  };
};

export const buildNumberRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
): NumberRound => {
  const pool = cardsWithStats(cards).filter((card) => card.statValue >= 0);
  if (pool.length < 2) throw new Error(`Need at least 2 non-negative stat cards to build a number round for ${topic}`);
  const values = pool.map((card) => card.statValue);
  const gap = statValueGap(values);
  const shouldAdd = pool.length >= 3 && shouldBuildAdditionRound(difficulty, seed);
  const unit = pool[0].stats[0]?.display.replace(formatNumber(pool[0].stats[0].value), "").trim() || "";

  if (shouldAdd) {
    const count = Math.min(pool.length, additionTermCount(difficulty, seed));
    const selected = shuffle(pool, seed + 1).slice(0, count);
    const termValues = selected.map((card) => Math.max(0, roundTo(card.statValue, gap)));
    const answer = sumValues(termValues);

    return {
      id: `${seed}-number-${topic}-add-${selected.map((card) => card.id).join("-")}`,
      topic,
      operation: "addition",
      prompt: `${additionPromptStart(count)}. What is their total ${selected[0].statLabel}?`,
      cards: selected.map((card, index) => sameStatCard(card, termValues[index])),
      statLabel: selected[0].statLabel,
      unit,
      operator: "+",
      termValues,
      resultLabel: stackedTotalLabel(count),
      biggerLabel: selected[0]?.title ?? "Card",
      smallerLabel: selected[1]?.title ?? "Card",
      biggerValue: termValues[0] ?? 0,
      smallerValue: termValues[1] ?? 0,
      answer,
      choices: numberChoices(answer, Math.max(gap, answer > 1000 ? 100 : gap), seed + 3),
      explanation: `${termValues.map(formatNumber).join(" + ")} = ${formatNumber(answer)}${unit ? ` ${unit}` : ""}.`,
    };
  }

  const sorted = shuffle(pool, seed + 1).sort((a, b) => b.statValue - a.statValue);
  const bigger = sorted[0];
  const smaller = sorted.find((card) => card.id !== bigger.id && card.statValue <= bigger.statValue) ?? sorted[1];
  const { biggerValue, smallerValue, answer } = roundedSubtractionPair(bigger.statValue, smaller.statValue, gap);

  return {
    id: `${seed}-number-${topic}-${bigger.id}-${smaller.id}`,
    topic,
    operation: "subtraction",
    prompt: `${bigger.title} has ${numberWithUnit(biggerValue, unit)}. ${smaller.title} has ${numberWithUnit(smallerValue, unit)}. What is the difference?`,
    cards: [sameStatCard(bigger, biggerValue), sameStatCard(smaller, smallerValue)],
    statLabel: bigger.statLabel,
    unit,
    operator: "-",
    termValues: [biggerValue, smallerValue],
    resultLabel: "difference",
    biggerLabel: bigger.title,
    smallerLabel: smaller.title,
    biggerValue,
    smallerValue,
    answer,
    choices: numberChoices(answer, gap, seed + 12),
    explanation: `${formatNumber(biggerValue)} - ${formatNumber(smallerValue)} = ${formatNumber(answer)}${unit ? ` ${unit}` : ""}.`,
  };
};

export const buildOddRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  _difficulty: Difficulty,
  seed: number,
): OddRound => {
  if (cards.length < 4) throw new Error(`Need at least 4 cards to build an odd-one round for ${topic}`);
  const categories = Array.from(new Set(cards.flatMap((card) => card.categories)));
  const eligibleCategories = categories.filter((category) => cards.filter((card) => card.categories.includes(category)).length >= 3);
  const category = sampleSafe(eligibleCategories, categories, seed + 1);

  if (category) {
    const same = shuffle(cards.filter((card) => card.categories.includes(category)), seed + 2).slice(0, 3);
    const odd = sampleSafe(cards.filter((card) => !card.categories.includes(category)), cards.filter((card) => !same.some((sameCard) => sameCard.id === card.id)), seed + 3);
    const displayCategory = category.toLowerCase();
    const cardsInRound = shuffle([...same, odd], seed + 4);
    return {
      id: `${seed}-odd-${topic}-${category}-${odd.id}`,
      topic,
      prompt: "Which card does not fit the category rule?",
      cards: cardsInRound,
      answerId: odd.id,
      reason: `${odd.title} is not ${displayCategory}; the others are.`,
      explanation: `The rule is category. Three cards share ${displayCategory}.`,
    };
  }

  const selected = shuffle(cardsWithStats(cards), seed + 5).slice(0, 4);
  const sorted = [...selected].sort((a, b) => a.statValue - b.statValue);
  const odd = sorted.at(-1) ?? selected[0];
  return {
    id: `${seed}-odd-${topic}-stat-${odd.id}`,
    topic,
    prompt: `Which card has the highest ${odd.statLabel}?`,
    cards: shuffle(selected, seed + 6),
    answerId: odd.id,
    reason: `${odd.title} has ${odd.statDisplay}.`,
    explanation: `The rule is highest ${odd.statLabel}.`,
  };
};

export const buildTopTrumpRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
): TopTrumpRound => {
  const pool = cards.filter((card) => card.stats.length >= 2);
  if (pool.length < 2) throw new Error(`Need at least 2 multi-stat cards to build a Top Trumps round for ${topic}`);
  const shuffled = shuffle(pool, seed + difficulty);
  const player = shuffled[0];
  const computer = shuffled.find((card) => card.id !== player.id && card.stats.some((stat) => player.stats.some((playerStat) => playerStat.id === stat.id))) ?? shuffled[1];
  const sharedStatIds = new Set(computer.stats.map((stat) => stat.id));
  const playerStats = player.stats.filter((stat) => sharedStatIds.has(stat.id));
  const computerStats = computer.stats.filter((stat) => playerStats.some((playerStat) => playerStat.id === stat.id));

  return {
    id: `${seed}-trumps-${topic}-${player.id}-${computer.id}`,
    topic,
    prompt: "Choose your strongest category.",
    player: { ...player, stats: playerStats },
    computer: { ...computer, stats: computerStats },
  };
};

const shouldBuildAdditionRound = (difficulty: Difficulty, seed: number) => seedRandom(seed + difficulty * 23) > (difficulty === 1 ? 0.45 : 0.35);
const additionTermCount = (difficulty: Difficulty, seed: number) => difficulty === 1 ? 2 : seedRandom(seed + difficulty * 17) > 0.45 ? 3 : 2;
const additionPromptStart = (count: number) => count === 2 ? "Add these together" : "Add all three together";
const stackedTotalLabel = (count: number) => count === 2 ? "stacked total" : "three-part total";
const sumValues = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const buildNumberRound = (topic: TopicScope, difficulty: Difficulty, seed: number): NumberRound => {
  const currentTopic = topicOrder(topic, seed);

  if (currentTopic === "peppers") {
    const step = difficulty === 1 ? 1000 : difficulty === 2 ? 5000 : 10000;
    if (shouldBuildAdditionRound(difficulty, seed)) {
      const count = additionTermCount(difficulty, seed);
      const selected = shuffle(peppers.filter((pepper) => pepper.shuMax >= step), seed + 1).slice(0, count);
      const values = selected.map((pepper) => Math.max(step, roundTo(pepper.shuMax, step)));
      const answer = sumValues(values);
      return {
        id: `${seed}-number-peppers-add-${selected.map((pepper) => pepper.id).join("-")}`,
        topic: currentTopic,
        operation: "addition",
        prompt: `${additionPromptStart(count)}. What is their total Scoville score?`,
        cards: selected.map((pepper, index) => roundedStatCard(pepperCard(pepper), values[index], "SHU")),
        statLabel: "Scoville",
        unit: "SHU",
        operator: "+",
        termValues: values,
        resultLabel: stackedTotalLabel(count),
        biggerLabel: selected[0]?.name ?? "Pepper",
        smallerLabel: selected[1]?.name ?? "Pepper",
        biggerValue: values[0] ?? 0,
        smallerValue: values[1] ?? 0,
        answer,
        choices: numberChoices(answer, Math.max(step * 2, answer > 100000 ? 100000 : step), seed + 3),
        explanation: `${values.map(formatNumber).join(" + ")} = ${formatNumber(answer)} SHU.`,
      };
    }

    const hotter = sampleSafe(peppers.filter((pepper) => pepper.shuMax >= 50000), peppers, seed + 1);
    const nonzeroPeppers = peppers.filter((pepper) => pepper.id !== hotter.id && pepper.shuMax >= step);
    const milder = sampleSafe(
      nonzeroPeppers.filter((pepper) => pepper.shuMax <= hotter.shuMax * 0.35),
      nonzeroPeppers,
      seed + 2,
    );
    const { biggerValue, smallerValue, answer } = roundedSubtractionPair(hotter.shuMax, milder.shuMax, step);
    return {
      id: `${seed}-number-peppers-${hotter.id}-${milder.id}`,
      topic: currentTopic,
      operation: "subtraction",
      prompt: `${hotter.name} can reach ${numberWithUnit(biggerValue, "SHU")}. ${milder.name} can reach ${numberWithUnit(smallerValue, "SHU")}. How much spicier is ${hotter.name}?`,
      cards: [roundedStatCard(pepperCard(hotter), biggerValue, "SHU"), roundedStatCard(pepperCard(milder), smallerValue, "SHU")],
      statLabel: "Scoville",
      unit: "SHU",
      operator: "-",
      termValues: [biggerValue, smallerValue],
      resultLabel: "difference",
      biggerLabel: hotter.name,
      smallerLabel: milder.name,
      biggerValue,
      smallerValue,
      answer,
      choices: numberChoices(answer, Math.max(step, answer > 100000 ? 100000 : step * 2), seed + 3),
      explanation: `${formatNumber(biggerValue)} - ${formatNumber(smallerValue)} = ${formatNumber(answer)} SHU.`,
    };
  }

  if (currentTopic === "buildings") {
    const step = difficulty === 1 ? 200 : difficulty === 2 ? 100 : 50;
    if (shouldBuildAdditionRound(difficulty, seed)) {
      const count = additionTermCount(difficulty, seed);
      const selected = shuffle(buildings, seed + 4).slice(0, count);
      const values = selected.map((building) => Math.max(step, roundTo(building.heightFt, step)));
      const answer = sumValues(values);
      return {
        id: `${seed}-number-buildings-add-${selected.map((building) => building.id).join("-")}`,
        topic: currentTopic,
        operation: "addition",
        prompt: `${additionPromptStart(count)}. If you stacked ${selected.map((building) => building.name).join(" + ")}, how tall would the stack be?`,
        cards: selected.map((building, index) => roundedStatCard(buildingCard(building), values[index], "ft")),
        statLabel: "Height",
        unit: "ft",
        operator: "+",
        termValues: values,
        resultLabel: stackedTotalLabel(count),
        biggerLabel: selected[0]?.name ?? "Building",
        smallerLabel: selected[1]?.name ?? "Building",
        biggerValue: values[0] ?? 0,
        smallerValue: values[1] ?? 0,
        answer,
        choices: numberChoices(answer, difficulty === 1 ? 400 : 200, seed + 6),
        explanation: `${values.map(formatNumber).join(" + ")} = ${formatNumber(answer)} feet.`,
      };
    }

    const taller = sampleSafe(buildings.filter((building) => building.heightFt >= 1800), buildings, seed + 4);
    const shorter = sampleSafe(buildings.filter((building) => building.id !== taller.id && building.heightFt <= taller.heightFt - 150), buildings.filter((building) => building.id !== taller.id), seed + 5);
    const { biggerValue, smallerValue, answer } = roundedSubtractionPair(taller.heightFt, shorter.heightFt, step);
    return {
      id: `${seed}-number-buildings-${taller.id}-${shorter.id}`,
      topic: currentTopic,
      operation: "subtraction",
      prompt: `${taller.name} is ${feet(biggerValue)}. ${shorter.name} is ${feet(smallerValue)}. How much taller is ${taller.name}?`,
      cards: [roundedStatCard(buildingCard(taller), biggerValue, "ft"), roundedStatCard(buildingCard(shorter), smallerValue, "ft")],
      statLabel: "Height",
      unit: "ft",
      operator: "-",
      termValues: [biggerValue, smallerValue],
      resultLabel: "difference",
      biggerLabel: taller.name,
      smallerLabel: shorter.name,
      biggerValue,
      smallerValue,
      answer,
      choices: numberChoices(answer, difficulty === 1 ? 200 : 100, seed + 6),
      explanation: `${formatNumber(biggerValue)} - ${formatNumber(smallerValue)} = ${formatNumber(answer)} feet.`,
    };
  }

  if (currentTopic === "space") {
    if (shouldBuildAdditionRound(difficulty, seed)) {
      const count = additionTermCount(difficulty, seed);
      const step = difficulty === 1 ? 500 : difficulty === 2 ? 100 : 50;
      const selected = shuffle(spaceCards.filter((space) => space.diameterMiles !== undefined), seed + 7).slice(0, count);
      const values = selected.map((space) => Math.max(step, roundTo(space.diameterMiles ?? 0, step)));
      const answer = sumValues(values);
      return {
        id: `${seed}-number-space-add-${selected.map((space) => space.id).join("-")}`,
        topic: currentTopic,
        operation: "addition",
        prompt: `${additionPromptStart(count)}. If these space bodies lined up edge to edge, how wide would they be?`,
        cards: selected.map((space, index) => roundedStatCard(spaceCard(space, "size"), values[index], "mi")),
        statLabel: "Diameter",
        unit: "mi",
        operator: "+",
        termValues: values,
        resultLabel: stackedTotalLabel(count),
        biggerLabel: selected[0]?.name ?? "Space body",
        smallerLabel: selected[1]?.name ?? "Space body",
        biggerValue: values[0] ?? 0,
        smallerValue: values[1] ?? 0,
        answer,
        choices: numberChoices(answer, difficulty === 1 ? 1000 : 500, seed + 9),
        explanation: `${values.map(formatNumber).join(" + ")} = ${formatNumber(answer)} miles.`,
      };
    }

    const moreMoons = sampleSafe(spaceCards.filter((space) => (space.moons ?? 0) >= 10), spaceCards.filter((space) => space.moons !== undefined), seed + 7);
    const fewerMoons = sampleSafe(spaceCards.filter((space) => space.id !== moreMoons.id && (space.moons ?? 0) < (moreMoons.moons ?? 0)), spaceCards.filter((space) => space.id !== moreMoons.id && space.moons !== undefined), seed + 8);
    const step = difficulty === 1 ? 10 : 5;
    const { biggerValue, smallerValue, answer } = roundedSubtractionPair(moreMoons.moons ?? 0, fewerMoons.moons ?? 0, step);
    return {
      id: `${seed}-number-space-${moreMoons.id}-${fewerMoons.id}`,
      topic: currentTopic,
      operation: "subtraction",
      prompt: `${moreMoons.name} has ${formatNumber(biggerValue)} moons. ${fewerMoons.name} has ${formatNumber(smallerValue)} moons. How many more moons does ${moreMoons.name} have?`,
      cards: [roundedStatCard(spaceCard(moreMoons, "moons"), biggerValue, "moons"), roundedStatCard(spaceCard(fewerMoons, "moons"), smallerValue, "moons")],
      statLabel: "Moons",
      unit: "moons",
      operator: "-",
      termValues: [biggerValue, smallerValue],
      resultLabel: "difference",
      biggerLabel: moreMoons.name,
      smallerLabel: fewerMoons.name,
      biggerValue,
      smallerValue,
      answer,
      choices: numberChoices(answer, difficulty === 1 ? 10 : 5, seed + 9),
      explanation: `${formatNumber(biggerValue)} - ${formatNumber(smallerValue)} = ${formatNumber(answer)} moons.`,
    };
  }

  if (currentTopic === "jets") {
    const step = difficulty === 1 ? 200 : difficulty === 2 ? 100 : 50;
    if (shouldBuildAdditionRound(difficulty, seed)) {
      const count = additionTermCount(difficulty, seed);
      const selected = shuffle(jets, seed + 10).slice(0, count);
      const values = selected.map((jet) => Math.max(step, roundTo(jet.maxSpeedMph, step)));
      const answer = sumValues(values);
      return {
        id: `${seed}-number-jets-add-${selected.map((jet) => jet.id).join("-")}`,
        topic: currentTopic,
        operation: "addition",
        prompt: `${additionPromptStart(count)}. What is the total if you add their top speeds?`,
        cards: selected.map((jet, index) => roundedStatCard(jetCard(jet, "speed"), values[index], "mph")),
        statLabel: "Speed",
        unit: "mph",
        operator: "+",
        termValues: values,
        resultLabel: stackedTotalLabel(count),
        biggerLabel: selected[0]?.name ?? "Jet",
        smallerLabel: selected[1]?.name ?? "Jet",
        biggerValue: values[0] ?? 0,
        smallerValue: values[1] ?? 0,
        answer,
        choices: numberChoices(answer, difficulty === 1 ? 400 : 200, seed + 12),
        explanation: `${values.map(formatNumber).join(" + ")} = ${formatNumber(answer)} mph.`,
      };
    }

    const faster = sampleSafe(jets.filter((jet) => jet.maxSpeedMph >= 1200), jets, seed + 10);
    const slower = sampleSafe(jets.filter((jet) => jet.id !== faster.id && jet.maxSpeedMph <= faster.maxSpeedMph - 250), jets.filter((jet) => jet.id !== faster.id), seed + 11);
    const { biggerValue, smallerValue, answer } = roundedSubtractionPair(faster.maxSpeedMph, slower.maxSpeedMph, step);
    return {
      id: `${seed}-number-jets-${faster.id}-${slower.id}`,
      topic: currentTopic,
      operation: "subtraction",
      prompt: `${faster.name} can reach about ${numberWithUnit(biggerValue, "mph")}. ${slower.name} can reach about ${numberWithUnit(smallerValue, "mph")}. How much faster is ${faster.name}?`,
      cards: [roundedStatCard(jetCard(faster, "speed"), biggerValue, "mph"), roundedStatCard(jetCard(slower, "speed"), smallerValue, "mph")],
      statLabel: "Speed",
      unit: "mph",
      operator: "-",
      termValues: [biggerValue, smallerValue],
      resultLabel: "difference",
      biggerLabel: faster.name,
      smallerLabel: slower.name,
      biggerValue,
      smallerValue,
      answer,
      choices: numberChoices(answer, difficulty === 1 ? 400 : 200, seed + 12),
      explanation: `${formatNumber(biggerValue)} - ${formatNumber(smallerValue)} = ${formatNumber(answer)} mph.`,
    };
  }

  const step = difficulty === 1 ? 5 : 2;
  if (shouldBuildAdditionRound(difficulty, seed)) {
    const count = additionTermCount(difficulty, seed);
    const selected = shuffle(sharks, seed + 10).slice(0, count);
    const values = selected.map((shark) => Math.max(step, roundTo(shark.lengthFt, step)));
    const answer = sumValues(values);
    return {
      id: `${seed}-number-sharks-add-${selected.map((shark) => shark.id).join("-")}`,
      topic: currentTopic,
      operation: "addition",
      prompt: `${additionPromptStart(count)}. If these sharks lined up nose to tail, how long would the line be?`,
      cards: selected.map((shark, index) => roundedStatCard(sharkCard(shark), values[index], "ft")),
      statLabel: "Length",
      unit: "ft",
      operator: "+",
      termValues: values,
      resultLabel: stackedTotalLabel(count),
      biggerLabel: selected[0]?.name ?? "Shark",
      smallerLabel: selected[1]?.name ?? "Shark",
      biggerValue: values[0] ?? 0,
      smallerValue: values[1] ?? 0,
      answer,
      choices: numberChoices(answer, difficulty === 1 ? 10 : 4, seed + 12),
      explanation: `${values.map(formatNumber).join(" + ")} = ${formatNumber(answer)} feet.`,
    };
  }

  const bigger = sampleSafe(sharks.filter((shark) => shark.lengthFt >= 15), sharks, seed + 10);
  const smaller = sampleSafe(sharks.filter((shark) => shark.id !== bigger.id && shark.lengthFt <= bigger.lengthFt - 5), sharks.filter((shark) => shark.id !== bigger.id), seed + 11);
  const { biggerValue, smallerValue, answer } = roundedSubtractionPair(bigger.lengthFt, smaller.lengthFt, step);
  return {
    id: `${seed}-number-sharks-${bigger.id}-${smaller.id}`,
    topic: currentTopic,
    operation: "subtraction",
    prompt: `${bigger.name} can be ${feet(biggerValue)}. ${smaller.name} can be ${feet(smallerValue)}. How much longer is ${bigger.name}?`,
    cards: [roundedStatCard(sharkCard(bigger), biggerValue, "ft"), roundedStatCard(sharkCard(smaller), smallerValue, "ft")],
    statLabel: "Length",
    unit: "ft",
    operator: "-",
    termValues: [biggerValue, smallerValue],
    resultLabel: "difference",
    biggerLabel: bigger.name,
    smallerLabel: smaller.name,
    biggerValue,
    smallerValue,
    answer,
    choices: numberChoices(answer, difficulty === 1 ? 5 : 4, seed + 12),
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
    const rules: {
      id: string;
      prompt: string;
      same: (building: Building) => boolean;
      odd: (building: Building) => boolean;
      reason: (odd: Building) => string;
      explanation: (odd: Building) => string;
    }[] = [
      {
        id: "new-york-city",
        prompt: "Which building is not in New York City?",
        same: (building) => building.city === "New York City",
        odd: (building) => building.city !== "New York City",
        reason: (odd) => `${odd.name} is in ${odd.city}; the others are in New York City.`,
        explanation: (odd) => `The rule is location. ${odd.name} is the odd one out because it is in ${odd.city}, not New York City.`,
      },
      {
        id: "brooklyn",
        prompt: "Which building is not in Brooklyn?",
        same: buildingIsInBrooklyn,
        odd: (building) => !buildingIsInBrooklyn(building),
        reason: (odd) => `${odd.name} is not in Brooklyn; the others are Brooklyn towers.`,
        explanation: (odd) => `The rule is borough. ${odd.name} is the odd one out because it is not one of the Brooklyn towers.`,
      },
      {
        id: "asia",
        prompt: "Which building is not in Asia?",
        same: buildingIsInAsia,
        odd: (building) => !buildingIsInAsia(building),
        reason: (odd) => `${odd.name} is in ${odd.country}; the others are in Asia.`,
        explanation: (odd) => `The rule is region. ${odd.name} is the odd one out because it is not in Asia.`,
      },
      {
        id: "united-states",
        prompt: "Which building is not in the United States?",
        same: (building) => building.country === "United States",
        odd: (building) => building.country !== "United States",
        reason: (odd) => `${odd.name} is in ${odd.country}; the others are in the United States.`,
        explanation: (odd) => `The rule is country. ${odd.name} is the odd one out because it is in ${odd.country}.`,
      },
      {
        id: "china",
        prompt: "Which building is not in China?",
        same: (building) => building.country === "China",
        odd: (building) => building.country !== "China",
        reason: (odd) => `${odd.name} is in ${odd.country}; the others are in China.`,
        explanation: (odd) => `The rule is country. ${odd.name} is the odd one out because it is not in China.`,
      },
      {
        id: "supertall",
        prompt: "Which building is not supertall?",
        same: buildingIsSupertall,
        odd: (building) => !buildingIsSupertall(building),
        reason: (odd) => `${odd.name} is ${feet(odd.heightFt)}; the others are at least ${feet(984)}.`,
        explanation: (odd) => `The rule is height. ${odd.name} is below the 984-foot supertall mark.`,
      },
      {
        id: "megatall",
        prompt: "Which building is not megatall?",
        same: buildingIsMegaTall,
        odd: (building) => !buildingIsMegaTall(building),
        reason: (odd) => `${odd.name} is ${feet(odd.heightFt)}; the others are at least ${feet(1968)}.`,
        explanation: (odd) => `The rule is height. ${odd.name} is below the 1,968-foot megatall mark.`,
      },
      {
        id: "status",
        prompt: "Which building is still being built?",
        same: (building) => building.status === "finished",
        odd: (building) => building.status !== "finished",
        reason: (odd) => `${odd.name} is ${odd.status}; the others are finished.`,
        explanation: (odd) => `The rule is building status. ${odd.name} is the odd one out because it is ${odd.status}.`,
      },
    ];
    const eligibleRules = rules.filter((rule) => buildings.filter(rule.same).length >= 3 && buildings.some(rule.odd));
    const rule = sampleSafe(eligibleRules, rules, seed + 5);
    const same = shuffle(buildings.filter(rule.same), seed + 6).slice(0, 3);
    const odd = sampleSafe(buildings.filter(rule.odd), buildings.filter((building) => !same.some((card) => card.id === building.id)), seed + 7);
    const cards = shuffle([...same.map(buildingCard), buildingCard(odd)], seed + 8);
    return {
      id: `${seed}-odd-buildings-${rule.id}-${odd.id}`,
      topic: currentTopic,
      prompt: rule.prompt,
      cards,
      answerId: odd.id,
      reason: rule.reason(odd),
      explanation: rule.explanation(odd),
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

  if (currentTopic === "jets") {
    const category = sample(["stealth", "bomber", "trainer", "interceptor", "attack", "multirole", "dogfighter"] as JetCategory[], seed + 12);
    const same = shuffle(jets.filter((jet) => jet.category === category), seed + 13).slice(0, 3);
    const odd = sampleSafe(jets.filter((jet) => jet.category !== category), jets, seed + 14);
    const cards = shuffle([...same.map((jet) => jetCard(jet)), jetCard(odd)], seed + 15);
    return {
      id: `${seed}-odd-jets-${category}-${odd.id}`,
      topic: currentTopic,
      prompt: "Which jet has the different mission category?",
      cards,
      answerId: odd.id,
      reason: `${odd.name} is ${jetCategoryLabels[odd.category]}; the others are ${jetCategoryLabels[category]}.`,
      explanation: `The rule is aircraft mission category. ${odd.name} is the odd one out because it is ${jetCategoryLabels[odd.category]}.`,
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
    const cards = distinctStatCards(shuffle(peppers, seed + 1).map(pepperCard), seed + 2, count);
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-peppers`,
      topic: currentTopic,
      prompt: "Tap the peppers from least to most spicy.",
      cards: shuffle(cards, seed + 3),
      answerIds,
      explanation: [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => `${card.title}: ${card.statDisplay}`).join("  |  "),
      statLabel: "Scoville heat",
    };
  }

  if (currentTopic === "buildings") {
    const cards = distinctStatCards(shuffle(buildings, seed + 3).map(buildingCard), seed + 4, count);
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-buildings`,
      topic: currentTopic,
      prompt: "Tap the buildings from shortest to tallest.",
      cards: shuffle(cards, seed + 5),
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
    const cards = distinctStatCards(shuffle(pool, seed + 6).map((space) => spaceCard(space, metric)), seed + 7, count);
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-space-${metric}`,
      topic: currentTopic,
      prompt: metric === "distance" ? "Tap the space cards from nearest to farthest." : metric === "temperature" ? "Tap from coolest to hottest." : metric === "size" ? "Tap from smallest to biggest." : "Tap from fewest moons to most moons.",
      cards: shuffle(cards, seed + 8),
      answerIds,
      explanation: [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => `${card.title}: ${card.statDisplay}`).join("  |  "),
      statLabel: metric === "distance" ? "Distance" : metric === "temperature" ? "Temperature" : metric === "size" ? "Size" : "Moons",
    };
  }

  if (currentTopic === "jets") {
    const metric = sample(["speed", "range", "firepower"] as const, seed + 5);
    const cards = distinctStatCards(shuffle(jets, seed + 6).map((jet) => jetCard(jet, metric)), seed + 7, count);
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-jets-${metric}`,
      topic: currentTopic,
      prompt: metric === "speed" ? "Tap the jets from slowest to fastest." : metric === "range" ? "Tap the jets from shortest range to longest range." : "Tap the jets from lowest firepower to highest firepower.",
      cards: shuffle(cards, seed + 8),
      answerIds,
      explanation: [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => `${card.title}: ${card.statDisplay}`).join("  |  "),
      statLabel: metric === "speed" ? "Speed" : metric === "range" ? "Range" : "Firepower",
    };
  }

  const metric = sample(["length", "speed", "power"] as const, seed + 5);
  const cards = distinctStatCards(shuffle(sharks, seed + 6).map((shark) => sharkCard(shark, metric)), seed + 7, count);
  const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
  return {
    id: `${seed}-sort-sharks-${metric}`,
    topic: currentTopic,
    prompt: metric === "length" ? "Tap the sharks from smallest to biggest." : metric === "speed" ? "Tap the sharks from slowest to fastest." : "Tap the sharks from lowest power to highest power.",
    cards: shuffle(cards, seed + 8),
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
    const fakeHeat = sample(peppers.filter((item) => item.id !== pepper.id && item.heat !== pepper.heat), seed + 13);
    const fakeShu = sampleSafe(peppers.filter((item) => item.id !== pepper.id && item.shuMax !== pepper.shuMax), peppers.filter((item) => item.id !== pepper.id), seed + 14);
    const useMath = difficulty > 1 && seedRandom(seed + 14) > 0.5;
    const statement = truthful
      ? useMath
        ? `${pepper.name} can reach about ${formatNumber(pepper.shuMax)} Scoville heat units.`
        : `${pepper.name} belongs in the ${pepper.heat} heat zone.`
      : useMath
        ? `${pepper.name} can reach about ${formatNumber(fakeShu.shuMax)} Scoville heat units.`
        : `${pepper.name} belongs in the ${fakeHeat.heat} heat zone.`;
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
    const factType = difficulty === 1 ? "city" : sample(["city", "height", "status"] as const, seed + 17);
    const fakeCity = sampleSafe(buildings.filter((item) => item.id !== building.id && item.city !== building.city), buildings.filter((item) => item.id !== building.id), seed + 16);
    const fakeHeight = sampleSafe(buildings.filter((item) => item.id !== building.id && item.heightFt !== building.heightFt), buildings.filter((item) => item.id !== building.id), seed + 18);
    const statement = truthful
      ? factType === "height"
        ? `${building.name} is ${feet(building.heightFt)} tall.`
        : factType === "status"
          ? `${building.name} is ${building.status}.`
          : `${building.name} is in ${building.city}.`
      : factType === "height"
        ? `${building.name} is ${feet(fakeHeight.heightFt)} tall.`
        : factType === "status"
          ? `${building.name} is ${building.status === "finished" ? "under construction" : "finished"}.`
          : `${building.name} is in ${fakeCity.city}.`;
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
    const factType = difficulty === 1 ? "group" : sample(["group", "fact", "temperature", "distance"] as const, seed + 20);
    const realTemperature = space.surfaceTempK ?? space.meanSurfaceTempF;
    const realDistance = space.distanceFromSunMillionMiles ?? space.distanceLightYears;
    const fakeGroup = sampleSafe(spaceCards.filter((item) => item.id !== space.id && item.group !== space.group), spaceCards.filter((item) => item.id !== space.id), seed + 19);
    const fakeFact = sample(spaceCards.filter((item) => item.id !== space.id), seed + 21);
    const fakeTemperatureCard = sampleSafe(
      spaceCards.filter((item) => {
        const value = item.surfaceTempK ?? item.meanSurfaceTempF;
        return item.id !== space.id && value !== undefined && value !== realTemperature;
      }),
      spaceCards.filter((item) => item.id !== space.id),
      seed + 22,
    );
    const fakeDistanceCard = sampleSafe(
      spaceCards.filter((item) => {
        const value = item.distanceFromSunMillionMiles ?? item.distanceLightYears;
        return item.id !== space.id && value !== undefined && value !== realDistance;
      }),
      spaceCards.filter((item) => item.id !== space.id),
      seed + 23,
    );
    const fakeTemperature = fakeTemperatureCard.surfaceTempK ?? fakeTemperatureCard.meanSurfaceTempF;
    const fakeDistance = fakeDistanceCard.distanceFromSunMillionMiles ?? fakeDistanceCard.distanceLightYears;
    const statement = truthful
      ? factType === "temperature" && realTemperature !== undefined
        ? `${space.name} has a listed temperature of about ${spaceMetricDisplay(space, "temperature")}.`
        : factType === "distance" && realDistance !== undefined
          ? `${space.name} has a listed distance of about ${spaceMetricDisplay(space, "distance")}.`
          : factType === "fact"
            ? space.fact
            : `${space.name} belongs in ${space.group}.`
      : factType === "temperature" && fakeTemperature !== undefined
        ? `${space.name} has a listed temperature of about ${spaceMetricDisplay(fakeTemperatureCard, "temperature")}.`
        : factType === "distance" && fakeDistance !== undefined
          ? `${space.name} has a listed distance of about ${spaceMetricDisplay(fakeDistanceCard, "distance")}.`
          : factType === "fact"
            ? fakeFact.fact
            : `${space.name} belongs in ${fakeGroup.group}.`;
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

  if (currentTopic === "jets") {
    const jet = sample(jets, seed + 18);
    const factType = difficulty === 1 ? "category" : sample(["category", "speed", "range", "country"] as const, seed + 20);
    const fakeCategory = sampleSafe(jets.filter((item) => item.id !== jet.id && item.category !== jet.category), jets.filter((item) => item.id !== jet.id), seed + 19);
    const fakeSpeed = sampleSafe(jets.filter((item) => item.id !== jet.id && item.maxSpeedMph !== jet.maxSpeedMph), jets.filter((item) => item.id !== jet.id), seed + 21);
    const fakeRange = sampleSafe(jets.filter((item) => item.id !== jet.id && item.rangeMiles !== jet.rangeMiles), jets.filter((item) => item.id !== jet.id), seed + 22);
    const fakeCountry = sampleSafe(jets.filter((item) => item.id !== jet.id && item.country !== jet.country), jets.filter((item) => item.id !== jet.id), seed + 23);
    const statement = truthful
      ? factType === "speed"
        ? `${jet.name} can reach about ${formatNumber(jet.maxSpeedMph)} mph.`
        : factType === "range"
          ? `${jet.name} has a range of about ${formatNumber(jet.rangeMiles)} miles.`
          : factType === "country"
            ? `${jet.name} is from ${jet.country}.`
            : `${jet.name} is a ${jetCategoryLabels[jet.category]} aircraft.`
      : factType === "speed"
        ? `${jet.name} can reach about ${formatNumber(fakeSpeed.maxSpeedMph)} mph.`
        : factType === "range"
          ? `${jet.name} has a range of about ${formatNumber(fakeRange.rangeMiles)} miles.`
          : factType === "country"
            ? `${jet.name} is from ${fakeCountry.country}.`
            : `${jet.name} is a ${jetCategoryLabels[fakeCategory.category]} aircraft.`;
    return {
      id: `${seed}-fact-jet-${jet.id}`,
      topic: currentTopic,
      prompt: "True or false?",
      statement,
      image: jet.image,
      imageAlt: jet.name,
      imageCredit: jet.imageCredit,
      answer: truthful ? "True" : "False",
      explanation: `${jet.name} is from ${jet.country}, is a ${jetCategoryLabels[jet.category]} aircraft, reaches about ${formatNumber(jet.maxSpeedMph)} mph, and has about ${formatNumber(jet.rangeMiles)} miles of range.`,
    };
  }

  const shark = sample(sharks, seed + 18);
  const factType = difficulty === 1 ? "family" : sample(["family", "speed", "size", "diet"] as const, seed + 20);
  const fakeFamily = sampleSafe(sharks.filter((item) => item.id !== shark.id && item.family !== shark.family), sharks.filter((item) => item.id !== shark.id), seed + 19);
  const fakeSpeed = sampleSafe(sharks.filter((item) => item.id !== shark.id && item.speedMph !== shark.speedMph), sharks.filter((item) => item.id !== shark.id), seed + 21);
  const fakeSize = sampleSafe(sharks.filter((item) => item.id !== shark.id && item.lengthFt !== shark.lengthFt), sharks.filter((item) => item.id !== shark.id), seed + 22);
  const fakeDiet = sampleSafe(sharks.filter((item) => item.id !== shark.id && item.diet !== shark.diet), sharks.filter((item) => item.id !== shark.id), seed + 23);
  const statement = truthful
    ? factType === "speed"
      ? `${shark.name} can swim about ${formatNumber(shark.speedMph)} mph.`
      : factType === "size"
        ? `${shark.name} can grow to about ${feet(shark.lengthFt)}.`
        : factType === "diet"
          ? `${shark.name} eats ${shark.diet}.`
          : `${shark.name} is a ${shark.family}.`
    : factType === "speed"
      ? `${shark.name} can swim about ${formatNumber(fakeSpeed.speedMph)} mph.`
      : factType === "size"
        ? `${shark.name} can grow to about ${feet(fakeSize.lengthFt)}.`
        : factType === "diet"
          ? `${shark.name} eats ${fakeDiet.diet}.`
          : `${shark.name} is a ${fakeFamily.family}.`;
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
