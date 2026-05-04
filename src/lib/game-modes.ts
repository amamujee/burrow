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
  topic: KnowledgeTopic;
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
  topic: KnowledgeTopic;
  prompt: string;
  player: TopTrumpCard;
  computer: TopTrumpCard;
};

const formatNumber = (value: number) => value.toLocaleString("en-US");
const feet = (value: number) => `${formatNumber(value)} ft`;
const numberWithUnit = (value: number, unit: string) => `${formatNumber(value)} ${unit}`;
const pounds = (value: number) => `${formatNumber(value)} lb`;
const inches = (value: number) => `${value.toFixed(value >= 10 ? 0 : 1)} in`;

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

  if (currentTopic === "jets") {
    const faster = sampleSafe(jets.filter((jet) => jet.maxSpeedMph >= 1200), jets, seed + 10);
    const slower = sampleSafe(jets.filter((jet) => jet.id !== faster.id && jet.maxSpeedMph <= faster.maxSpeedMph - 250), jets.filter((jet) => jet.id !== faster.id), seed + 11);
    const step = difficulty === 1 ? 100 : difficulty === 2 ? 50 : 10;
    const biggerValue = roundTo(faster.maxSpeedMph, step);
    const smallerValue = roundTo(slower.maxSpeedMph, step);
    const answer = Math.abs(biggerValue - smallerValue);
    return {
      id: `${seed}-number-jets-${faster.id}-${slower.id}`,
      topic: currentTopic,
      prompt: `${faster.name} can reach about ${numberWithUnit(biggerValue, "mph")}. ${slower.name} can reach about ${numberWithUnit(smallerValue, "mph")}. How much faster is ${faster.name}?`,
      cards: [jetCard(faster, "speed"), jetCard(slower, "speed")],
      statLabel: "Speed",
      unit: "mph",
      biggerLabel: faster.name,
      smallerLabel: slower.name,
      biggerValue,
      smallerValue,
      answer,
      choices: numberChoices(answer, difficulty === 1 ? 200 : 100, seed + 12),
      explanation: `${formatNumber(biggerValue)} - ${formatNumber(smallerValue)} = ${formatNumber(answer)} mph.`,
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

  if (currentTopic === "jets") {
    const metric = sample(["speed", "range", "firepower"] as const, seed + 5);
    const cards = shuffle(jets, seed + 6).slice(0, count).map((jet) => jetCard(jet, metric));
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-jets-${metric}`,
      topic: currentTopic,
      prompt: metric === "speed" ? "Tap the jets from slowest to fastest." : metric === "range" ? "Tap the jets from shortest range to longest range." : "Tap the jets from lowest firepower to highest firepower.",
      cards: shuffle(cards, seed + 7),
      answerIds,
      explanation: [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => `${card.title}: ${card.statDisplay}`).join("  |  "),
      statLabel: metric === "speed" ? "Speed" : metric === "range" ? "Range" : "Firepower",
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

  if (currentTopic === "jets") {
    const jet = sample(jets, seed + 18);
    const fake = sample(jets.filter((item) => item.id !== jet.id), seed + 19);
    const factType = difficulty === 1 ? "category" : sample(["category", "speed", "range", "country"] as const, seed + 20);
    const statement = truthful
      ? factType === "speed"
        ? `${jet.name} can reach about ${formatNumber(jet.maxSpeedMph)} mph.`
        : factType === "range"
          ? `${jet.name} has a range of about ${formatNumber(jet.rangeMiles)} miles.`
          : factType === "country"
            ? `${jet.name} is from ${jet.country}.`
            : `${jet.name} is a ${jetCategoryLabels[jet.category]} aircraft.`
      : factType === "speed"
        ? `${jet.name} can reach about ${formatNumber(fake.maxSpeedMph)} mph.`
        : factType === "range"
          ? `${jet.name} has a range of about ${formatNumber(fake.rangeMiles)} miles.`
          : factType === "country"
            ? `${jet.name} is from ${fake.country}.`
            : `${jet.name} is a ${jetCategoryLabels[fake.category]} aircraft.`;
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
