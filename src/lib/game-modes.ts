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
import { scoreFeaturedContent } from "./content-quality";
import { cardRarityLabels, cardRarityTier, worldLocationDisplay, type CardMetadata, type CardRarity, type WorldContinent, type WorldLocation } from "./card-metadata";
import { cardDiscoveryIdentities } from "./card-discovery";
import { poolForDifficulty } from "./difficulty-pool";
import { discoveryShuffle, sample, sampleSafe, seedRandom, shuffle } from "./random";

export type GameMode = "mix" | "quiz" | "versus" | "trumps" | "sort" | "fact" | "peek" | "number" | "odd" | "geo";

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
  { id: "geo", label: "Geo Finder", eyebrow: "map clue", loop: "tap pin" },
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
  collectionSortValue?: number;
  subStat: string;
  fact: string;
  qualityScore: number;
  qualityFlags: string[];
  tags?: string[];
  metadata?: CardMetadata;
  details?: { label: string; value: string }[];
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

export const slotSortCardIds = (round: SortRound, pickedIds: readonly string[]) => {
  const remaining = [...pickedIds];
  return round.answerIds.map((answerId) => {
    const answerCard = round.cards.find((card) => card.id === answerId);
    if (!answerCard) return undefined;

    const matchIndex = remaining.findIndex((pickedId) => {
      const pickedCard = round.cards.find((card) => card.id === pickedId);
      return pickedCard && (pickedCard.statValue === answerCard.statValue || pickedCard.statDisplay === answerCard.statDisplay);
    });
    if (matchIndex < 0) return undefined;
    return remaining.splice(matchIndex, 1)[0];
  });
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
  locations?: WorldLocation[];
  map?: {
    claimed: GeoChoice;
    actual: GeoChoice;
  };
};

export type RevealRound = {
  id: string;
  topic: RoundTopic;
  prompt: string;
  card: KnowledgeCard;
  choices: string[];
  answer: string;
  explanation: string;
  map?: {
    choices: GeoChoice[];
    answerId: string;
  };
};

export type GeoPoint = {
  lat: number;
  lon: number;
  x: number;
  y: number;
};

export type GeoChoice = {
  id: string;
  label: string;
  location: WorldLocation;
  point: GeoPoint;
  mapNote: string;
};

export type GeoRound = {
  id: string;
  topic: RoundTopic;
  prompt: string;
  card: KnowledgeCard;
  choices: GeoChoice[];
  answerId: string;
  answerLabel: string;
  location: WorldLocation;
  point: GeoPoint;
  mapHint: string;
  explanation: string;
};

export type NumberRound = {
  id: string;
  topic: RoundTopic;
  operation: "addition" | "subtraction" | "multiplication" | "fit";
  prompt: string;
  cards: KnowledgeCard[];
  statLabel: string;
  unit: string;
  operator: "+" | "-" | "x";
  termValues: number[];
  resultLabel: string;
  biggerLabel: string;
  smallerLabel: string;
  biggerValue: number;
  smallerValue: number;
  answer: number;
  choices: number[];
  explanation: string;
  visual?: {
    kind: "equal-groups";
    badge: string;
    ariaLabel: string;
    groupSingular: string;
    groupPlural: string;
    groupEmoji: string;
    itemSingular: string;
    itemPlural: string;
    itemEmoji: string;
  };
};

export type OddRound = {
  id: string;
  topic: RoundTopic;
  prompt: string;
  cards: KnowledgeCard[];
  answerId: string;
  reason: string;
  explanation: string;
  locations?: WorldLocation[];
};

export type TopTrumpDirection = "higher" | "lower";

export type TopTrumpStat = {
  id: string;
  label: string;
  value: number;
  display: string;
  direction: TopTrumpDirection;
};

export type TopTrumpOutcome = "win" | "tie" | "loss";

export const topTrumpOutcome = (playerStat: TopTrumpStat, computerStat: TopTrumpStat): TopTrumpOutcome => {
  if (playerStat.value === computerStat.value) return "tie";
  const playerWins = playerStat.direction === "lower" ? playerStat.value < computerStat.value : playerStat.value > computerStat.value;
  return playerWins ? "win" : "loss";
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
  tags?: string[];
  metadata?: CardMetadata;
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
const naturalList = (items: readonly string[]) => {
  if (items.length < 2) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
};

export const worldContinentLabel = (continents: readonly WorldContinent[]) => naturalList(continents);
const countryNamesWithLeadingArticle = new Set([
  "Bahamas",
  "Central African Republic",
  "Comoros",
  "Cook Islands",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Dominican Republic",
  "Federated States of Micronesia",
  "Gambia",
  "Maldives",
  "Marshall Islands",
  "Netherlands",
  "Philippines",
  "Republic of the Congo",
  "Seychelles",
  "Solomon Islands",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
]);
export const countryNameInProse = (country: Pick<Country, "name"> | string) => {
  const name = typeof country === "string" ? country : country.name;
  return countryNamesWithLeadingArticle.has(name) ? `the ${name}` : name;
};
export const worldLocationLabelInProse = (label: string) => {
  if (label === "Caribbean" || label.startsWith("Andes,")) return `the ${label}`;
  if (label.includes("/")) return naturalList(label.split("/").map((name) => countryNameInProse(name)));
  return countryNameInProse(label);
};
export const sentenceStart = (value: string) => value.replace(/^./, (letter) => letter.toUpperCase());
export const countryCapitalLabel = (country: Pick<Country, "capital">) =>
  naturalList(country.capital.split(/\s*\/\s*/).filter(Boolean));
export const countryFactSentence = (country: Pick<Country, "name" | "capital" | "areaKm2" | "continents">) => {
  const capital = countryCapitalLabel(country);
  const capitalClause = capital === "No official capital" ? "It has no official capital" : `Its capital is ${capital}`;
  return `${sentenceStart(countryNameInProse(country))} is in ${worldContinentLabel(country.continents)}. ${capitalClause}, and it covers ${formatNumber(country.areaKm2)} square kilometers of land.`;
};

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
const sortOrderExplanation = (cards: readonly KnowledgeCard[]) =>
  `The correct order is ${cards.map((card) => `${card.title} (${card.statDisplay})`).join("; ")}.`;

const allTopics: KnowledgeTopic[] = [...topicIds];
const preferredPool = <T extends { id: string }>(items: readonly T[], difficulty: Difficulty) => poolForDifficulty(items, difficulty);

const topicsForScope = (topic: TopicScope): KnowledgeTopic[] => {
  if (typeof topic !== "string") return topic.length ? [...topic] : allTopics;
  return topic === "mixed" ? allTopics : [topic];
};

const topicOrder = (topic: TopicScope, seed: number): KnowledgeTopic => {
  const topics = topicsForScope(topic);
  return topics[Math.floor(seedRandom(seed) * topics.length) % topics.length];
};

type MeasuredPepper = Pepper & { shuMin: number; shuMax: number };
const hasScovilleMeasurement = <T extends Pepper>(pepper: T): pepper is T & MeasuredPepper => pepper.shuMin !== null && pepper.shuMax !== null;
const pepperRange = (pepper: MeasuredPepper) =>
  pepper.shuMin === pepper.shuMax ? formatNumber(pepper.shuMax) : `${formatNumber(pepper.shuMin)}-${formatNumber(pepper.shuMax)}`;
const pepperScovilleDisplay = (pepper: Pepper) => {
  if (pepper.scovilleStatus === "not-applicable") return "Not on the Scoville scale";
  if (pepper.shuMin !== null && pepper.shuMax === null) return `${formatNumber(pepper.shuMin)}+ SHU (unofficial)`;
  if (!hasScovilleMeasurement(pepper)) return "SHU not published";
  return `${pepper.scovilleStatus === "unofficial" ? "~" : ""}${formatNumber(pepper.shuMax)} SHU${pepper.scovilleStatus === "unofficial" ? " (unofficial)" : ""}`;
};
const pepperHeatExplanation = (pepper: Pepper) => hasScovilleMeasurement(pepper)
  ? `${pepper.name} can reach ${pepperScovilleDisplay(pepper)}, so it is ${pepper.heat} (${heatBandRangeLabel(pepper.heat)}). Its full range is ${pepperRange(pepper)} SHU.`
  : pepper.scovilleStatus === "not-applicable"
    ? `${pepper.name} is not a chile, so the Scoville scale does not apply. Sanshool gives it a tingly, numbing feeling instead of capsaicin heat.`
  : pepper.shuMin !== null
    ? `${pepper.name} is placed at ${pepperScovilleDisplay(pepper)}, so it is ${pepper.heat}; that lower bound is unofficial because no lab score has been published.`
    : `${pepper.name}'s ${pepper.heat} label is descriptive because no Scoville measurement has been published.`;
const heatRank = Object.fromEntries(heatBands.map((heat, index) => [heat, index])) as Record<HeatBand, number>;
const rarityDetails = (metadata?: CardMetadata) => metadata?.rarity
  ? [{ label: "Card rarity", value: cardRarityLabels[metadata.rarity] }]
  : [];

const pepperCard = (pepper: Pepper): KnowledgeCard => ({
  id: pepper.id,
  topic: "peppers",
  title: pepper.name,
  image: pepper.image,
  imageAlt: pepper.name,
  imageCredit: pepper.imageCredit,
  statLabel: "Scoville",
  statValue: hasScovilleMeasurement(pepper) ? pepper.shuMax : Number.NaN,
  statDisplay: pepperScovilleDisplay(pepper),
  collectionSortValue: pepper.shuMax ?? pepper.shuMin ?? Number.NaN,
  subStat: pepper.scovilleStatus === "not-applicable"
    ? "tingly · not a chile · ✨"
    : `${heatProfiles[pepper.heat].label} · ${hasScovilleMeasurement(pepper) ? heatBandRangeLabel(pepper.heat) : "SHU not published"} · ${heatProfiles[pepper.heat].emoji}`,
  fact: pepper.fact,
  qualityScore: scoreFeaturedContent({ ...pepper, statValue: hasScovilleMeasurement(pepper) ? pepper.shuMax : undefined, sourceCaution: hasScovilleMeasurement(pepper) ? undefined : "unpublished Scoville score" }).score,
  qualityFlags: scoreFeaturedContent({ ...pepper, statValue: hasScovilleMeasurement(pepper) ? pepper.shuMax : undefined, sourceCaution: hasScovilleMeasurement(pepper) ? undefined : "unpublished Scoville score" }).flags,
  metadata: pepper.metadata,
  details: [
    ...rarityDetails(pepper.metadata),
    { label: "Heat level", value: heatProfiles[pepper.heat].label },
    { label: "Scoville range", value: hasScovilleMeasurement(pepper) ? `${pepperRange(pepper)} SHU` : pepperScovilleDisplay(pepper) },
    { label: "Color", value: pepper.color },
    ...(pepper.species ? [{ label: "Species", value: pepper.species }] : []),
    { label: "Type", value: pepper.isCondiment ? "Pepper condiment" : "Chile pepper" },
    ...(pepper.metadata?.location ? [
      { label: "Origin", value: pepper.metadata.location.label },
      { label: "Continent", value: worldContinentLabel(pepper.metadata.location.continents) },
    ] : []),
  ],
});

const buildingHeightLabel = (building: Building) => building.heightLabel ?? (building.status === "finished" ? "Height" : "Planned height");
const buildingHeightSentence = (building: Building) => {
  const label = buildingHeightLabel(building);
  return label === "Height" ? `${building.name} is ${feet(building.heightFt)} tall` : `${building.name}'s ${label.toLowerCase()} is ${feet(building.heightFt)}`;
};

const buildingCard = (building: Building): KnowledgeCard => ({
  id: building.id,
  topic: "buildings",
  title: building.name,
  image: building.image,
  imageAlt: building.name,
  imageCredit: building.imageCredit,
  statLabel: buildingHeightLabel(building),
  statValue: building.heightFt,
  statDisplay: feet(building.heightFt),
  subStat: worldLocationDisplay(building.metadata.location!),
  fact: building.fact,
  qualityScore: scoreFeaturedContent({ ...building, statValue: building.heightFt }).score,
  qualityFlags: scoreFeaturedContent({ ...building, statValue: building.heightFt }).flags,
  metadata: building.metadata,
  details: [
    ...rarityDetails(building.metadata),
    { label: buildingHeightLabel(building), value: feet(building.heightFt) },
    { label: "Floors", value: building.floors ? formatNumber(building.floors) : "Not listed" },
    { label: "Status", value: building.status.replace(/^./, (letter) => letter.toUpperCase()) },
    { label: "City", value: building.city },
    { label: "Country", value: building.country },
    { label: "Continent", value: building.metadata.location ? worldContinentLabel(building.metadata.location.continents) : "Not listed" },
  ],
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
  tags: shark.tags,
  metadata: shark.metadata,
  details: [
    ...rarityDetails(shark.metadata),
    { label: "Length", value: feet(shark.lengthFt) },
    { label: "Speed", value: `${formatNumber(shark.speedMph)} mph` },
    { label: "Power", value: `${shark.power}/5` },
    { label: "Family", value: shark.family },
    { label: "Diet", value: shark.diet },
    ...(shark.metadata?.location ? [{ label: "Range", value: shark.metadata.location.label }] : []),
  ],
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
  if (metric === "size") return space.kind === "star" ? `${formatNumber(value)}x Sun` : `${formatNumber(value)} mi`;
  return `${formatNumber(value)} moons`;
};
const spaceMetricProse = (space: SpaceCard, metric: "distance" | "temperature" | "size" | "moons") => {
  const value = spaceMetricValue(space, metric);
  if (metric === "distance") return space.kind === "star" ? `${formatNumber(value)} light-years` : `${formatNumber(value)} million miles`;
  if (metric === "temperature") return space.kind === "star" ? `${formatNumber(value)} kelvins` : `${formatNumber(value)} degrees Fahrenheit`;
  if (metric === "size") return space.kind === "star" ? `${formatNumber(value)} times the Sun's radius` : `${formatNumber(value)} miles wide`;
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
  metadata: space.metadata,
  details: [
    ...rarityDetails(space.metadata),
    { label: "Object type", value: space.kind.replace(/^./, (letter) => letter.toUpperCase()) },
    { label: "Group", value: space.group },
    ...(space.distanceFromSunMillionMiles !== undefined ? [{ label: "Distance from Sun", value: `${formatNumber(space.distanceFromSunMillionMiles)}M mi` }] : []),
    ...(space.distanceLightYears !== undefined ? [{ label: "Distance from Earth", value: `${formatNumber(space.distanceLightYears)} ly` }] : []),
    ...(space.diameterMiles !== undefined ? [{ label: "Diameter", value: `${formatNumber(space.diameterMiles)} mi` }] : []),
    ...(space.radiusSolar !== undefined ? [{ label: "Radius", value: `${formatNumber(space.radiusSolar)}x Sun` }] : []),
    ...(space.meanSurfaceTempF !== undefined ? [{ label: "Temperature", value: `${formatNumber(space.meanSurfaceTempF)}°F` }] : []),
    ...(space.surfaceTempK !== undefined ? [{ label: "Temperature", value: `${formatNumber(space.surfaceTempK)} K` }] : []),
    ...(space.moons !== undefined ? [{ label: "Moons", value: formatNumber(space.moons) }] : []),
  ],
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
const jetCategoryDescription = (category: JetCategory) => `${jetCategoryLabels[category]} aircraft`;
export const jetCategoryWithArticle = (category: JetCategory) =>
  `${/^[aeiou]/i.test(jetCategoryLabels[category]) ? "an" : "a"} ${jetCategoryDescription(category)}`;
export const jetCountryInProse = (country: string) => naturalList(country.split("/").map((name) =>
  ["Soviet Union", "United Kingdom", "United States"].includes(name) ? `the ${name}` : name));

const jetCountryContinents: Record<string, WorldContinent[]> = {
  China: ["Asia"],
  Czechoslovakia: ["Europe"],
  France: ["Europe"],
  Germany: ["Europe"],
  India: ["Asia"],
  Israel: ["Asia"],
  Italy: ["Europe"],
  Japan: ["Asia"],
  Russia: ["Europe", "Asia"],
  "South Korea": ["Asia"],
  "Soviet Union": ["Europe", "Asia"],
  Spain: ["Europe"],
  Sweden: ["Europe"],
  Taiwan: ["Asia"],
  "United Kingdom": ["Europe"],
  "United States": ["North America"],
};

export const jetWorldLocation = (jet: Pick<Jet, "country">): WorldLocation => {
  const countries = jet.country.split("/");
  return {
    label: jet.country,
    countries: countries.map((country) => country === "Czechoslovakia" ? "Czech Republic" : country === "Soviet Union" ? "Russia" : country),
    continents: Array.from(new Set(countries.flatMap((country) => jetCountryContinents[country] ?? []))),
  };
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
  metadata: { ...jet.metadata, location: jetWorldLocation(jet) },
  qualityScore: scoreFeaturedContent({ ...jet, statValue: metric === "speed" ? jet.maxSpeedMph : metric === "range" ? jet.rangeMiles : jet.firepower }).score,
  qualityFlags: scoreFeaturedContent({ ...jet, statValue: metric === "speed" ? jet.maxSpeedMph : metric === "range" ? jet.rangeMiles : jet.firepower }).flags,
  details: [
    ...rarityDetails(jet.metadata),
    { label: "Top speed", value: `${formatNumber(jet.maxSpeedMph)} mph` },
    { label: "Range", value: `${formatNumber(jet.rangeMiles)} mi` },
    { label: "Firepower", value: `${jet.firepower}/5` },
    { label: "Country", value: jet.country },
    { label: "Aircraft type", value: jetCategoryLabels[jet.category].replace(/^./, (letter) => letter.toUpperCase()) },
    { label: "Continent", value: worldContinentLabel(jetWorldLocation(jet).continents) },
  ],
});

type CountryMetric = "population" | "area";
const countryPopulationDisplay = (country: Country) => `${formatNumber(country.population)} people`;
const countryAreaDisplay = (country: Country) => `${formatNumber(country.areaKm2)} km²`;
const countryNeighborDisplay = (country: Country) => `${country.landNeighborCount} ${country.landNeighborCount === 1 ? "country" : "countries"}`;
const countryHighestPointDisplay = (country: Country) => `${formatNumber(country.highestPointM)} m`;
const countryTrumpStats = (country: Country): TopTrumpStat[] => [
  { id: "population", label: "Population", value: country.population, display: countryPopulationDisplay(country), direction: "higher" },
  { id: "area", label: "Land area", value: country.areaKm2, display: countryAreaDisplay(country), direction: "higher" },
  { id: "land-neighbors", label: "Land neighbors", value: country.landNeighborCount, display: countryNeighborDisplay(country), direction: "higher" },
  { id: "highest-point", label: "Highest point", value: country.highestPointM, display: countryHighestPointDisplay(country), direction: "higher" },
];
const countryQuality = (country: Country, statValue: number) => scoreFeaturedContent({
  ...country,
  statValue,
  sourceCaution: country.populationStatus === "world-bank" ? undefined : country.populationNote,
});

const countryCard = (country: Country, metric: CountryMetric = "population"): KnowledgeCard => {
  const statValue = metric === "population" ? country.population : country.areaKm2;
  const quality = countryQuality(country, statValue);
  return {
    id: country.id,
    topic: "countries",
    title: country.name,
    image: country.image,
    imageAlt: `Flag of ${country.name}`,
    imageCredit: country.imageCredit,
    statLabel: metric === "population" ? "Population" : "Land area",
    statValue,
    statDisplay: metric === "population" ? countryPopulationDisplay(country) : countryAreaDisplay(country),
    subStat: `${country.flagEmoji} ${countryCapitalLabel(country)} · ${worldContinentLabel(country.continents)}`,
    fact: countryFactSentence(country),
    qualityScore: quality.score,
    qualityFlags: quality.flags,
    metadata: country.metadata,
    details: [
      { label: "Capital", value: countryCapitalLabel(country) },
      { label: "Population", value: `${formatNumber(country.population)} (${country.populationYear})` },
      { label: "Land area", value: countryAreaDisplay(country) },
      { label: "Land neighbors", value: countryNeighborDisplay(country) },
      { label: "Highest point", value: `${country.highestPointName} · ${countryHighestPointDisplay(country)}` },
      { label: "Continent", value: worldContinentLabel(country.continents) },
      { label: "Region", value: country.subregion },
      { label: "Country code", value: `${country.code} · ${country.code3}` },
    ],
  };
};

const countryGenericCard = (country: Country): GenericKnowledgeCard => ({
  ...countryCard(country),
  categories: [
    ...country.continents,
    country.subregion,
    country.areaKm2 < 1000 ? "microstate" : country.areaKm2 < 50000 ? "small country" : "large country",
  ],
  stats: countryTrumpStats(country),
});

const collectionCardCatalog: KnowledgeCard[] = [
  ...peppers.map(pepperCard),
  ...buildings.map(buildingCard),
  ...sharks.map((shark) => sharkCard(shark)),
  ...spaceCards.map((space) => spaceCard(space, space.kind === "star" ? "temperature" : space.kind === "planet" ? "distance" : "size")),
  ...jets.map((jet) => jetCard(jet)),
  ...countries.map((country) => countryCard(country)),
];

export const collectionCards = (): KnowledgeCard[] => collectionCardCatalog;

export const orderCollectionCardsByScoville = (cards: readonly KnowledgeCard[]): KnowledgeCard[] => {
  const peppersByHeat = cards
    .filter((card) => card.topic === "peppers")
    .sort((a, b) => {
      const aScoville = typeof a.collectionSortValue === "number" && Number.isFinite(a.collectionSortValue)
        ? a.collectionSortValue
        : Number.POSITIVE_INFINITY;
      const bScoville = typeof b.collectionSortValue === "number" && Number.isFinite(b.collectionSortValue)
        ? b.collectionSortValue
        : Number.POSITIVE_INFINITY;
      return aScoville - bScoville || a.title.localeCompare(b.title);
    });
  let pepperIndex = 0;

  return cards.map((card) => card.topic === "peppers" ? peppersByHeat[pepperIndex++] : card);
};

const comparableCollectionStatLabel = (cards: readonly KnowledgeCard[]): string | null => {
  if (cards.length === 0 || !cards.every((card) => Number.isFinite(card.statValue))) return null;
  if (cards.every((card) => card.topic === "buildings")) return "Height";
  const statLabels = new Set(cards.map((card) => card.statLabel));
  return statLabels.size === 1 ? cards[0].statLabel : null;
};

export const orderCollectionCardsForCategory = (cards: readonly KnowledgeCard[]): KnowledgeCard[] => {
  if (cards.length === 0) return [];
  if (cards.every((card) => card.topic === "peppers")) return orderCollectionCardsByScoville(cards);

  const hasComparablePrimaryStat = comparableCollectionStatLabel(cards) !== null;
  return [...cards].sort((a, b) => hasComparablePrimaryStat
    ? b.statValue - a.statValue || a.title.localeCompare(b.title)
    : a.title.localeCompare(b.title));
};

export const collectionOrderLabel = (cards: readonly KnowledgeCard[]): string => {
  if (cards.length === 0) return "No cards";
  if (cards.every((card) => card.topic === "peppers")) return "Scoville · mildest to hottest";
  const statLabel = comparableCollectionStatLabel(cards);
  return statLabel
    ? `${statLabel} · highest to lowest`
    : "Name · A to Z";
};

const pepperSizeInches: Record<string, number> = {
  "bell-pepper": 4,
  "tangerine-dream": 3,
  "chocolate-rocoto-x": 3.5,
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
  "naga-jolokia": 3,
  "seven-pot-primo": 2,
  "chocolate-bhutlah": 2,
  "super-chilli": 2,
  "moruga-red": 1.5,
  "chocolate-ghost": 3,
  "chocolate-moruga-scorpion": 2,
  "chocolate-scotch-bonnet": 1.5,
  "trinidad-scorpion": 2,
  "trinidad-scorpion-butch-t": 2,
  "orange-butch-t": 2,
  "carolina-reaper": 2,
  "dragons-breath": 1.5,
  armageddon: 2,
  "pepper-y": 2,
  "the-noah": 2,
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
  "goat-trail": 5,
  pequin: 0.8,
  "naga-viper": 2,
  "komodo-dragon": 2,
  "trinidad-perfume": 1.5,
  "peter-pepper": 4,
  "purple-beauty": 4,
  "madame-jeanette": 3,
  "aji-dulce": 1.5,
  "bolivian-rainbow": 1,
  chilaca: 8,
  "hungarian-wax": 6,
  "numex-twilight": 1,
  biquinho: 0.8,
  "piri-piri": 1,
  piquillo: 3,
  "black-pearl": 0.6,
  mirasol: 5,
  "red-savina": 2,
  "dorset-naga": 2,
  "chocolate-habanero": 2,
  "chinese-five-color": 1.5,
  malagueta: 1.5,
  habanada: 3,
  "corno-di-toro": 8,
  "santa-fe-grande": 4,
  "bulgarian-carrot": 4,
  aleppo: 4,
  "italian-wax": 4,
  mattapeno: 3,
  "purple-jalapeno": 3.5,
  "sugar-rush-peach": 3,
  "sugar-rush-stripey": 3,
  "aji-mango": 2.5,
  "aji-pineapple": 2.5,
  "purple-thai": 3.5,
  "naga-morich": 3,
  "seven-pot-douglah": 2.5,
  "peach-aribibi-gusano": 3,
  "mustard-seven-pot": 2.5,
  peachadew: 1.5,
  "aji-rojo": 2.5,
  "red-thunder-mountain-longhorn": 15,
  "orange-aji-fantasy": 2.5,
  "peppapeach-stripey": 1.5,
  "purple-tiger": 2.5,
  "purple-taj-mahal": 2,
  "aji-confusion": 2,
  "piccante-calabrese": 1.5,
  "pink-tiger": 3,
  "orange-seven-pot": 2.5,
  "white-carolina-reaper": 2,
  "ghost-breath": 3,
  "red-primotalii": 2.5,
  "thors-thunderbolt": 3,
  "gator-jigsaw": 2.5,
  "aji-fantasy": 2,
  santaka: 2,
  "white-aji-fantasy": 2,
  "seven-pot-barrackpore": 2,
  "aji-cito": 2,
  "aji-cristal": 4,
  "aji-habanero": 3,
  "aji-sivri": 10,
  "brain-strain": 2.5,
  "caribbean-red": 1.5,
  "carmen-italian-sweet": 6,
  cascabella: 2,
  "chilhuacle-amarillo": 3.5,
  chimayo: 7,
  cowhorn: 10,
  "devils-tongue": 3,
  dolmalik: 4,
  "doux-des-landes": 12,
  dundicut: 1,
  espelette: 6,
  "guntur-sannam": 3,
  "gypsy-pepper": 4,
  "kashmiri-chili": 3,
  "piment-de-bresse": 5,
  "wiri-wiri": 0.5,
  "aji-panca": 5,
  "alma-paprika": 2.5,
  "cheiro-roxa": 1.2,
  "aji-angelo": 3,
  "aji-benito": 2,
  "aji-norteno": 3.5,
  "aji-omnicolor": 2.5,
  "brazilian-starfish": 2,
  "criolla-sella": 2.5,
  "aji-delight": 3,
  "sugar-rush-cream": 3,
  "aji-ayuyo": 1,
  "aji-flor-morado": 2.5,
};

const pepperPlantHeightInches: Record<string, number> = {
  "bell-pepper": 30,
  "tangerine-dream": 12,
  "chocolate-rocoto-x": 72,
  "jimmy-nardello": 30,
  "banana-pepper": 24,
  pepperoncini: 24,
  poblano: 30,
  anaheim: 30,
  jalapeno: 30,
  fresno: 28,
  serrano: 36,
  cayenne: 36,
  tabasco: 54,
  "thai-chili": 24,
  "scotch-bonnet": 48,
  habanero: 42,
  fatalii: 42,
  "ghost-pepper": 48,
  "naga-jolokia": 48,
  "seven-pot-primo": 48,
  "chocolate-bhutlah": 48,
  "super-chilli": 24,
  "moruga-red": 48,
  "chocolate-ghost": 48,
  "chocolate-moruga-scorpion": 48,
  "chocolate-scotch-bonnet": 48,
  "trinidad-scorpion": 48,
  "trinidad-scorpion-butch-t": 48,
  "orange-butch-t": 36,
  "carolina-reaper": 48,
  "dragons-breath": 42,
  "pepper-x": 42,
  armageddon: 30,
  "pepper-y": 42,
  "the-noah": 42,
  shishito: 24,
  padron: 24,
  ancho: 30,
  guajillo: 36,
  "chile-de-arbol": 48,
  "aji-amarillo": 60,
  rocoto: 60,
  chiltepin: 36,
  cubanelle: 30,
  "cherry-pepper": 24,
  pasilla: 36,
  mulato: 30,
  cascabel: 30,
  "hatch-chile": 30,
  "new-mexico-chile": 30,
  datil: 36,
  manzano: 60,
  "aji-limo": 48,
  "aji-charapita": 36,
  "lemon-drop": 48,
  "bishop-crown": 48,
  "fish-pepper": 24,
  "goat-pepper": 36,
  "goat-trail": 36,
  pequin: 36,
  "naga-viper": 42,
  "komodo-dragon": 42,
  "trinidad-perfume": 36,
  "peter-pepper": 30,
  "purple-beauty": 24,
  "madame-jeanette": 48,
  "aji-dulce": 36,
  "bolivian-rainbow": 20,
  chilaca: 36,
  "hungarian-wax": 30,
  "numex-twilight": 24,
  biquinho: 30,
  "piri-piri": 36,
  piquillo: 30,
  "black-pearl": 12,
  mirasol: 24,
  "red-savina": 42,
  "dorset-naga": 48,
  "chocolate-habanero": 42,
  "chinese-five-color": 24,
  malagueta: 36,
  habanada: 36,
  "corno-di-toro": 36,
  "santa-fe-grande": 30,
  "bulgarian-carrot": 30,
  aleppo: 30,
  "italian-wax": 30,
  mattapeno: 30,
  "purple-jalapeno": 30,
  "sugar-rush-peach": 60,
  "sugar-rush-stripey": 60,
  "aji-mango": 36,
  "aji-pineapple": 36,
  "purple-thai": 24,
  "naga-morich": 48,
  "seven-pot-douglah": 42,
  "peach-aribibi-gusano": 36,
  "mustard-seven-pot": 42,
  peachadew: 36,
  "aji-rojo": 48,
  "red-thunder-mountain-longhorn": 48,
  "orange-aji-fantasy": 36,
  "peppapeach-stripey": 36,
  "purple-tiger": 24,
  "purple-taj-mahal": 36,
  "aji-confusion": 48,
  "piccante-calabrese": 30,
  "pink-tiger": 42,
  "orange-seven-pot": 48,
  "white-carolina-reaper": 48,
  "ghost-breath": 48,
  "red-primotalii": 48,
  "thors-thunderbolt": 42,
  "gator-jigsaw": 48,
  "aji-fantasy": 48,
  santaka: 24,
  "white-aji-fantasy": 48,
  "seven-pot-barrackpore": 48,
  "aji-cito": 48,
  "aji-cristal": 48,
  "aji-habanero": 48,
  "aji-sivri": 36,
  "brain-strain": 48,
  "caribbean-red": 36,
  "carmen-italian-sweet": 30,
  cascabella: 30,
  "chilhuacle-amarillo": 48,
  chimayo: 30,
  cowhorn: 36,
  "devils-tongue": 42,
  dolmalik: 36,
  "doux-des-landes": 36,
  dundicut: 30,
  espelette: 36,
  "guntur-sannam": 36,
  "gypsy-pepper": 30,
  "kashmiri-chili": 30,
  "piment-de-bresse": 30,
  "wiri-wiri": 36,
  "aji-panca": 48,
  "alma-paprika": 30,
  "cheiro-roxa": 28,
  "aji-angelo": 48,
  "aji-benito": 42,
  "aji-norteno": 48,
  "aji-omnicolor": 24,
  "brazilian-starfish": 60,
  "criolla-sella": 36,
  "aji-delight": 36,
  "sugar-rush-cream": 48,
  "aji-ayuyo": 36,
  "aji-flor-morado": 48,
};

const pepperPlantHeight = (pepper: Pepper) => {
  const heatReference = pepper.shuMax ?? pepper.shuMin ?? 0;
  return pepperPlantHeightInches[pepper.id] ?? (heatReference >= 500000 ? 48 : heatReference >= 50000 ? 42 : 30);
};

const rarityStat = (rarity: CardRarity): TopTrumpStat => ({
  id: "rarity",
  label: "Rarity",
  value: cardRarityTier(rarity),
  display: cardRarityLabels[rarity],
  direction: "higher",
});
const rarityStats = (metadata?: CardMetadata): TopTrumpStat[] => metadata?.rarity ? [rarityStat(metadata.rarity)] : [];
const plantHeight = (value: number) => (value >= 24 && value % 12 === 0 ? `${value / 12} ft` : `${value} in`);

const sharkWeightLb = (shark: Shark) => Math.round(Math.max(10, shark.lengthFt ** 2.85 * (shark.power >= 4 ? 0.85 : 0.55)));
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
    "rise-tower": 2030,
    "dubai-creek-tower": 2030,
    "cayan-tower": 2013,
    "520-fifth-avenue": 2026,
    "35-hudson-yards": 2019,
    "one-manhattan-west": 2019,
    "50-hudson-yards": 2022,
    "28-liberty": 1961,
    "dominion-tower": 1987,
    "icon-norfolk": 1967,
    "wells-fargo-center-norfolk": 2010,
    "150-west-main-street": 2002,
    "norfolk-waterside-marriott": 1991,
    "big-ben": 1859,
    "eiffel-tower": 1889,
    "leaning-tower-of-pisa": 1372,
  };
  return years[building.id] ?? (building.status === "finished" ? 2018 : 2030);
};

const buildingStatusLabel = (building: Building) => {
  if (building.status === "finished") return "a completed building";
  if (building.status === "under construction") return "under construction";
  return "still proposed";
};
const buildingFalseStatusLabel = (building: Building) => building.status === "finished" ? "under construction" : "a completed building";
const buildingYearDisplay = (building: Building) => building.status === "proposed" ? "Proposed" : `${buildingCompletedYear(building)} (older wins)`;

const buildingIsInAsia = (building: Building) =>
  ["China", "Hong Kong", "Malaysia", "Saudi Arabia", "South Korea", "Taiwan", "United Arab Emirates", "Vietnam"].includes(building.country);
const buildingIsInBrooklyn = (building: Building) => ["brooklyn-tower", "brooklyn-point", "ava-dobro", "11-hoyt", "the-everly", "385-atlantic-avenue"].includes(building.id);
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

const spaceTrumpPool = () => spaceCards.filter((card) =>
  card.diameterMiles !== undefined &&
  card.distanceFromSunMillionMiles !== undefined &&
  card.meanSurfaceTempF !== undefined,
);
const pepperPlantPool = () => peppers.filter((pepper) => !pepper.isCondiment);
const pepperTrumpPool = () => pepperPlantPool().filter((pepper) => pepper.scovilleStatus !== "not-applicable");

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
      subStat: pepper.scovilleStatus === "not-applicable" ? `tingly · ${pepper.color}` : `${heatProfiles[pepper.heat].label} · ${pepper.color}`,
      fact: pepper.fact,
      metadata: pepper.metadata,
      stats: [
        ...(hasScovilleMeasurement(pepper) ? [{ id: "scoville", label: "Scoville", value: pepper.shuMax, display: pepperScovilleDisplay(pepper), direction: "higher" as const }] : []),
        ...rarityStats(pepper.metadata),
        { id: "size", label: "Fruit size", value: pepperSizeInches[pepper.id] ?? 2, display: inches(pepperSizeInches[pepper.id] ?? 2), direction: "higher" },
        { id: "plant-height", label: "Plant height", value: pepperPlantHeight(pepper), display: plantHeight(pepperPlantHeight(pepper)), direction: "higher" },
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
      subStat: worldLocationDisplay(building.metadata.location!),
      fact: building.fact,
      metadata: building.metadata,
      stats: [
        ...rarityStats(building.metadata),
        { id: "height", label: buildingHeightLabel(building), value: building.heightFt, display: feet(building.heightFt), direction: "higher" },
        { id: "floors", label: "Floors", value: building.floors ?? 0, display: `${building.floors ?? "?"}`, direction: "higher" },
        { id: "year", label: "Year built", value: buildingCompletedYear(building), display: buildingYearDisplay(building), direction: "lower" },
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
      metadata: shark.metadata,
      stats: [
        ...rarityStats(shark.metadata),
        { id: "speed", label: "Speed", value: shark.speedMph, display: `${formatNumber(shark.speedMph)} mph`, direction: "higher" },
        { id: "weight", label: "Weight", value: sharkWeightLb(shark), display: pounds(sharkWeightLb(shark)), direction: "higher" },
        { id: "length", label: "Length", value: shark.lengthFt, display: feet(shark.lengthFt), direction: "higher" },
        { id: "power", label: "Predator power", value: shark.power * 2, display: `${shark.power * 2}/10`, direction: "higher" },
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
      metadata: space.metadata,
      stats: ([
        ...rarityStats(space.metadata),
        { id: "size", label: "Size", value: sizeValue, display: space.radiusSolar ? `${formatNumber(sizeValue)}x Sun` : `${formatNumber(sizeValue)} mi`, direction: "higher" },
        { id: "temperature", label: "Temperature", value: tempValue, display: space.surfaceTempK ? `${formatNumber(tempValue)} K` : `${formatNumber(tempValue)}°F`, direction: "higher" },
        { id: "distance", label: "Distance from Sun", value: space.distanceFromSunMillionMiles ?? 0, display: `${formatNumber(space.distanceFromSunMillionMiles ?? 0)}M mi`, direction: "higher" },
        { id: "moons", label: "Moons", value: space.moons ?? 0, display: `${formatNumber(space.moons ?? 0)}`, direction: "higher" },
      ] satisfies TopTrumpStat[]).filter((stat) => stat.value > 0 || stat.id === "moons"),
    };
  }

  if (topic === "countries") {
    const country = countries.find((item) => item.id === id);
    if (!country) return null;
    return countryGenericCard(country);
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
    metadata: { ...jet.metadata, location: jetWorldLocation(jet) },
    stats: [
      ...rarityStats(jet.metadata),
      { id: "speed", label: "Speed", value: jet.maxSpeedMph, display: `${formatNumber(jet.maxSpeedMph)} mph`, direction: "higher" },
      { id: "range", label: "Range", value: jet.rangeMiles, display: `${formatNumber(jet.rangeMiles)} mi`, direction: "higher" },
      { id: "weight", label: "Weight", value: jetWeightLb(jet), display: pounds(jetWeightLb(jet)), direction: "higher" },
      { id: "deadliness", label: "Deadliness", value: jet.firepower * 2, display: `${jet.firepower * 2}/10`, direction: "higher" },
      { id: "year", label: "Year created", value: jetFirstFlightYear(jet), display: `${jetFirstFlightYear(jet)} (older wins)`, direction: "lower" },
      { id: "altitude", label: "Max altitude", value: jetAltitudeFt(jet), display: feet(jetAltitudeFt(jet)), direction: "higher" },
    ],
  };
};

export const buildTopTrumpRound = (topic: TopicScope, difficulty: Difficulty, seed: number, unlockedTitles: readonly string[] = []): TopTrumpRound => {
  const currentTopic = topicOrder(topic, seed);
  const pool =
    currentTopic === "peppers" ? preferredPool(pepperTrumpPool(), difficulty) :
    currentTopic === "buildings" ? preferredPool(buildings, difficulty) :
    currentTopic === "sharks" ? preferredPool(sharks, difficulty) :
    currentTopic === "space" ? preferredPool(spaceTrumpPool(), difficulty) :
    currentTopic === "countries" ? preferredPool(countries, difficulty) :
    preferredPool(jets, difficulty);
  const shuffled = discoveryShuffle(
    pool.map((item) => ({ id: item.id, topic: currentTopic, title: item.name })),
    seed + difficulty,
    unlockedTitles,
    cardDiscoveryIdentities,
  );
  const first = shuffled[0].id;
  const second = shuffled.find((item) => item.id !== first)?.id ?? shuffled[1].id;
  const player = topTrumpCard(currentTopic, first);
  const computer = topTrumpCard(currentTopic, second);
  if (!player || !computer) throw new Error(`Could not build Top Trumps round for ${currentTopic}`);
  const sharedStatIds = new Set(player.stats.map((stat) => stat.id).filter((id) => computer.stats.some((stat) => stat.id === id)));

  return {
    id: `${seed}-trumps-${currentTopic}-${player.id}-${computer.id}`,
    topic: currentTopic,
    prompt: "Choose the category that gives your card its strongest advantage.",
    player: { ...player, stats: player.stats.filter((stat) => sharedStatIds.has(stat.id)) },
    computer: { ...computer, stats: computer.stats.filter((stat) => sharedStatIds.has(stat.id)) },
  };
};

export const buildRevealRound = (topic: TopicScope, difficulty: Difficulty, seed: number, unlockedTitles: readonly string[] = []): RevealRound => {
  const currentTopic = topicOrder(topic, seed);
  const count = 4;
  const allCards = collectionCards();
  const topicCards = preferredPool(allCards.filter((card) => card.topic === currentTopic), difficulty);
  const card = discoveryShuffle(topicCards, seed + 1, unlockedTitles, cardDiscoveryIdentities)[0];
  const distractors = shuffle(topicCards.filter((item) => item.id !== card.id).map((item) => item.title), seed + 2).slice(0, count - 1);

  return {
    id: `${seed}-peek-${currentTopic}-${card.id}`,
    topic: currentTopic,
    prompt: "Which subject is shown in the picture?",
    card,
    choices: shuffle([card.title, ...distractors], seed + 3),
    answer: card.title,
    explanation: `${card.title} is the answer. ${card.fact}`,
  };
};

const numberChoices = (answer: number, gap: number, seed: number) => {
  const candidates = [answer, Math.max(gap, answer - gap * 2), answer + gap * 2, answer + gap * 3, Math.max(gap, answer - gap * 3), answer + gap * 4, answer + gap * 5];
  const uniqueDistractors = Array.from(new Set(candidates.filter((item) => item >= 0 && item !== answer)));
  return shuffle([answer, ...shuffle(uniqueDistractors, seed + 1).slice(0, 3)], seed);
};

type NumberOperation = "addition" | "subtraction" | "multiplication";

type MultiplicationScenario = {
  badge: string;
  ariaLabel: string;
  statLabel: string;
  groupSingular: string;
  groupPlural: string;
  groupEmoji: string;
  itemSingular: string;
  itemPlural: string;
  itemEmoji: string;
  prompt: (title: string, groups: number, itemsPerGroup: number) => string;
};

const numberOperationForSeed = (seed: number): NumberOperation => {
  const index = Math.abs(Math.trunc(seed)) % 3;
  return index === 0 ? "addition" : index === 1 ? "subtraction" : "multiplication";
};

const factorRangeForDifficulty = (difficulty: Difficulty) => difficulty === 1
  ? { groups: [1, 5] as const, items: [1, 5] as const }
  : difficulty === 2
    ? { groups: [2, 10] as const, items: [2, 10] as const }
    : { groups: [6, 12] as const, items: [6, 12] as const };

const pickFactor = ([min, max]: readonly [number, number], factorSeed: number) => min + Math.floor(seedRandom(factorSeed) * (max - min + 1));
const countLabel = (count: number, singular: string, plural: string) => `${count} ${count === 1 ? singular : plural}`;
const thereAre = (count: number, singular: string, plural: string) =>
  `${count === 1 ? "There is" : "There are"} ${countLabel(count, singular, plural)}.`;

const multiplicationScenarioForTopic = (topic: RoundTopic): MultiplicationScenario => {
  switch (topic) {
    case "peppers":
      return {
        badge: "Grow case",
        ariaLabel: "Math picture: equal pepper plant groups",
        statLabel: "Peppers per plant",
        groupSingular: "plant",
        groupPlural: "plants",
        groupEmoji: "🌱",
        itemSingular: "pepper",
        itemPlural: "peppers",
        itemEmoji: "🌶️",
        prompt: (title, groups, items) => `${thereAre(groups, `${title} plant`, `${title} plants`)} Each plant grows ${countLabel(items, "pepper", "peppers")}. How many peppers are there altogether?`,
      };
    case "buildings":
      return {
        badge: "Window case",
        ariaLabel: "Math picture: equal building floor groups",
        statLabel: "Windows per floor",
        groupSingular: "floor",
        groupPlural: "floors",
        groupEmoji: "🏢",
        itemSingular: "window",
        itemPlural: "windows",
        itemEmoji: "🪟",
        prompt: (title, groups, items) => `A model of ${title} has ${countLabel(groups, "floor", "floors")}. Each floor has ${countLabel(items, "window", "windows")}. How many windows are there altogether?`,
      };
    case "sharks":
      return {
        badge: "Tooth case",
        ariaLabel: "Math picture: equal shark model groups",
        statLabel: "Paper teeth per model",
        groupSingular: "model",
        groupPlural: "models",
        groupEmoji: "🦈",
        itemSingular: "paper tooth",
        itemPlural: "paper teeth",
        itemEmoji: "🦷",
        prompt: (title, groups, items) => `A class makes ${countLabel(groups, `${title} model`, `${title} models`)}. Each model has ${countLabel(items, "paper tooth", "paper teeth")}. How many paper teeth do they use altogether?`,
      };
    case "space":
      return {
        badge: "Mission case",
        ariaLabel: "Math picture: equal space sample groups",
        statLabel: "Rocks per box",
        groupSingular: "sample box",
        groupPlural: "sample boxes",
        groupEmoji: "📦",
        itemSingular: "rock",
        itemPlural: "rocks",
        itemEmoji: "🪨",
        prompt: (title, groups, items) => `A mission studying ${title} fills ${countLabel(groups, "sample box", "sample boxes")}. Each box holds ${countLabel(items, "rock", "rocks")}. How many rocks are packed altogether?`,
      };
    case "jets":
      return {
        badge: "Air-show case",
        ariaLabel: "Math picture: equal air-show team groups",
        statLabel: "Jets per team",
        groupSingular: "team",
        groupPlural: "teams",
        groupEmoji: "🛫",
        itemSingular: "jet",
        itemPlural: "jets",
        itemEmoji: "✈️",
        prompt: (title, groups, items) => `${thereAre(groups, "air-show team", "air-show teams")} Each team flies ${countLabel(items, `${title} jet`, `${title} jets`)}. How many jets fly altogether?`,
      };
    case "dinosaurs":
      return {
        badge: "Nest case",
        ariaLabel: "Math picture: equal dinosaur nest groups",
        statLabel: "Eggs per nest",
        groupSingular: "nest",
        groupPlural: "nests",
        groupEmoji: "🪺",
        itemSingular: "egg",
        itemPlural: "eggs",
        itemEmoji: "🥚",
        prompt: (title, groups, items) => `${thereAre(groups, `${title} nest`, `${title} nests`)} Each nest has ${countLabel(items, "egg", "eggs")}. How many eggs are there altogether?`,
      };
    case "tallest-mountains":
      return {
        badge: "Climbing case",
        ariaLabel: "Math picture: equal mountain climbing groups",
        statLabel: "Climbers per team",
        groupSingular: "team",
        groupPlural: "teams",
        groupEmoji: "🏔️",
        itemSingular: "climber",
        itemPlural: "climbers",
        itemEmoji: "🧗",
        prompt: (title, groups, items) => `${groups === 1 ? "There is" : "There are"} ${countLabel(groups, "climbing team", "climbing teams")} on ${title}. Each team has ${countLabel(items, "climber", "climbers")}. How many climbers are there altogether?`,
      };
    case "tall-trees":
      return {
        badge: "Branch case",
        ariaLabel: "Math picture: equal tree branch groups",
        statLabel: "Birds per branch",
        groupSingular: "branch",
        groupPlural: "branches",
        groupEmoji: "🌿",
        itemSingular: "bird",
        itemPlural: "birds",
        itemEmoji: "🐦",
        prompt: (title, groups, items) => `${thereAre(groups, `branch on ${title}`, `branches on ${title}`)} Each branch has ${countLabel(items, "bird", "birds")}. How many birds are there altogether?`,
      };
    case "bridges-and-tunnels":
      return {
        badge: "Light case",
        ariaLabel: "Math picture: equal bridge or tunnel section groups",
        statLabel: "Lights per section",
        groupSingular: "section",
        groupPlural: "sections",
        groupEmoji: "🛤️",
        itemSingular: "light",
        itemPlural: "lights",
        itemEmoji: "💡",
        prompt: (title, groups, items) => `A model of ${title} has ${countLabel(groups, "section", "sections")}. Each section has ${countLabel(items, "light", "lights")}. How many lights are there altogether?`,
      };
    default:
      return {
        badge: "Display case",
        ariaLabel: "Math picture: equal museum display groups",
        statLabel: "Models per row",
        groupSingular: "row",
        groupPlural: "rows",
        groupEmoji: "🗂️",
        itemSingular: "model",
        itemPlural: "models",
        itemEmoji: "🔹",
        prompt: (title, groups, items) => `A display about ${title} has ${countLabel(groups, "row", "rows")}. Each row has ${countLabel(items, "model", "models")}. How many models are there altogether?`,
      };
  }
};

const multiplicationRound = (
  card: KnowledgeCard,
  companion: KnowledgeCard,
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
): NumberRound => {
  const scenario = multiplicationScenarioForTopic(topic);
  const ranges = factorRangeForDifficulty(difficulty);
  const groups = pickFactor(ranges.groups, seed + 41);
  const itemsPerGroup = pickFactor(ranges.items, seed + 42);
  const answer = groups * itemsPerGroup;
  const repeatedAddition = Array.from({ length: groups }, () => itemsPerGroup).join(" + ");
  const answerLabel = countLabel(answer, scenario.itemSingular, scenario.itemPlural);
  const countingCard: KnowledgeCard = {
    ...card,
    statLabel: scenario.statLabel,
    statValue: itemsPerGroup,
    statDisplay: `${countLabel(itemsPerGroup, scenario.itemSingular, scenario.itemPlural)} per ${scenario.groupSingular}`,
  };
  const companionCard: KnowledgeCard = {
    ...companion,
    statLabel: scenario.statLabel,
    statValue: itemsPerGroup,
    statDisplay: `${countLabel(itemsPerGroup, scenario.itemSingular, scenario.itemPlural)} per ${scenario.groupSingular}`,
  };

  return {
    id: `${seed}-number-${topic}-multiply-${card.id}-${groups}x${itemsPerGroup}`,
    topic,
    operation: "multiplication",
    prompt: scenario.prompt(card.title, groups, itemsPerGroup),
    cards: [countingCard, companionCard],
    statLabel: scenario.statLabel,
    unit: scenario.itemPlural,
    operator: "x",
    termValues: [groups, itemsPerGroup],
    resultLabel: `total ${scenario.itemPlural}`,
    biggerLabel: countLabel(groups, scenario.groupSingular, scenario.groupPlural),
    smallerLabel: card.title,
    biggerValue: groups,
    smallerValue: itemsPerGroup,
    answer,
    choices: numberChoices(answer, 1, seed + 43),
    explanation: groups === 1
      ? `There is 1 group of ${itemsPerGroup}, so 1 × ${itemsPerGroup} = ${answerLabel}.`
      : `There are ${groups} equal groups of ${itemsPerGroup}. The repeated addition is ${repeatedAddition} = ${answer}, so ${groups} × ${itemsPerGroup} = ${answerLabel}.`,
    visual: {
      kind: "equal-groups",
      badge: scenario.badge,
      ariaLabel: scenario.ariaLabel,
      groupSingular: scenario.groupSingular,
      groupPlural: scenario.groupPlural,
      groupEmoji: scenario.groupEmoji,
      itemSingular: scenario.itemSingular,
      itemPlural: scenario.itemPlural,
      itemEmoji: scenario.itemEmoji,
    },
  };
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

const shouldBuildFitRound = (difficulty: Difficulty, seed: number) => difficulty > 1 && seedRandom(seed + 21) > 0.48;

const pluralTitle = (title: string) => {
  if (title.endsWith("s")) return title;
  if (title.endsWith("y")) return `${title.slice(0, -1)}ies`;
  return `${title}s`;
};

const hasLocationMetadata = <T extends { metadata?: CardMetadata }>(card: T): card is T & { metadata: CardMetadata & { location: WorldLocation } } =>
  Boolean(card.metadata?.location);

const uniqueLocationLabels = <T extends { metadata?: CardMetadata }>(cards: readonly T[]) =>
  Array.from(new Set(cards.filter(hasLocationMetadata).map((card) => card.metadata.location.label)));

type LatLon = readonly [number, number];

const geoChoiceCountForDifficulty = (difficulty: Difficulty) => {
  void difficulty;
  return 4;
};
export const geoChoiceSeparationForDifficulty = (difficulty: Difficulty) => difficulty === 1
  ? { kilometers: 2500, mapPercent: 18 }
  : difficulty === 2
    ? { kilometers: 1500, mapPercent: 13 }
    : { kilometers: 750, mapPercent: 9 };
const clampGeo = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const continentCoordinates: Record<WorldContinent, LatLon> = {
  Africa: [2, 20],
  Antarctica: [-82, 0],
  Asia: [34, 88],
  Europe: [50, 10],
  "North America": [42, -102],
  Oceania: [-25, 135],
  "South America": [-15, -60],
};
const countryCoordinates: Record<string, LatLon> = {
  Argentina: [-34, -64],
  Australia: [-25, 134],
  Bahamas: [25, -77],
  Barbados: [13, -59.5],
  Bolivia: [-17, -65],
  Brazil: [-10, -52],
  Canada: [57, -106],
  Belize: [17.2, -88.7],
  China: [35, 104],
  Cuba: [21.5, -79.5],
  "Czech Republic": [49.8, 15.5],
  Denmark: [56, 10],
  Ecuador: [-1.5, -78],
  France: [46, 2],
  "French Guiana": [4, -53],
  India: [22, 79],
  Hungary: [47, 19],
  Indonesia: [-2, 118],
  Italy: [42, 12],
  Jamaica: [18, -77],
  Japan: [36, 138],
  Kenya: [0, 38],
  Malaysia: [4, 102],
  Mexico: [23, -102],
  Mozambique: [-18.5, 35],
  Nepal: [28, 84],
  "New Zealand": [-41, 174],
  Norway: [61, 8],
  Pakistan: [30, 70],
  Peru: [-9, -75],
  "Puerto Rico": [18.2, -66.5],
  Russia: [61, 105],
  Rwanda: [-1.9, 29.9],
  "Saudi Arabia": [24, 45],
  "South Korea": [36, 128],
  "South Africa": [-30.6, 22.9],
  Spain: [40, -4],
  Suriname: [4, -56],
  Sweden: [62, 15],
  Switzerland: [47, 8],
  Taiwan: [23.7, 121],
  Tanzania: [-6, 35],
  Thailand: [15, 101],
  "Trinidad and Tobago": [10.5, -61],
  Turkey: [39, 35],
  "United Arab Emirates": [24, 54],
  "United Kingdom": [54, -2],
  "United States": [39, -98],
  Vietnam: [16, 108],
};
const locationCoordinateOverrides: Record<string, LatLon> = {
  "Puebla, Mexico": [19.1, -98.2],
  "Anaheim, United States": [33.8, -117.9],
  "Xalapa, Mexico": [19.5, -96.9],
  "Fresno, United States": [36.7, -119.8],
  "Puebla and Hidalgo, Mexico": [20.0, -98.3],
  "Cayenne, French Guiana": [4.9, -52.3],
  "Tabasco, Mexico": [17.9, -92.6],
  "Jamaica and Trinidad and Tobago": [14.3, -69],
  "Yucatan, Mexico and the Caribbean": [20.8, -89],
  "Northeast India, India": [26.2, 92.9],
  "Louisiana, United States": [31, -92],
  "Fort Mill, United States": [35, -80.9],
  "Wales, United Kingdom": [52.3, -3.8],
  "Padron, Spain": [42.7, -8.7],
  "Andes, South America": [-13, -73],
  "Cuba and the Caribbean": [21.5, -79.5],
  "Hatch, United States": [32.7, -107.2],
  "New Mexico, United States": [34.5, -106],
  "St. Augustine, United States": [29.9, -81.3],
  "Chesapeake Bay, United States": [37.8, -76.2],
  "Cumbria, United Kingdom": [54.6, -3.1],
  "Bedfordshire, United Kingdom": [52.1, -0.5],
  "Navarra, Spain": [42.7, -1.6],
  "Dorset, United Kingdom": [50.7, -2.4],
  "Beltsville, United States": [39, -76.9],
  "Dubai, United Arab Emirates": [25.2, 55.3],
  "Kuala Lumpur, Malaysia": [3.1, 101.7],
  "Shanghai, China": [31.2, 121.5],
  "Mecca, Saudi Arabia": [21.4, 39.8],
  "Shenzhen, China": [22.5, 114.1],
  "Seoul, South Korea": [37.6, 127],
  "New York City, United States": [40.7, -74],
  "Guangzhou, China": [23.1, 113.3],
  "Tianjin, China": [39.1, 117.2],
  "Beijing, China": [39.9, 116.4],
  "Taipei, Taiwan": [25, 121.6],
  "Hong Kong, China": [22.3, 114.2],
  "Saint Petersburg, Russia": [59.9, 30.3],
  "Ho Chi Minh City, Vietnam": [10.8, 106.7],
  "Chicago, United States": [41.9, -87.6],
  "Jeddah, Saudi Arabia": [21.5, 39.2],
  "Riyadh, Saudi Arabia": [24.7, 46.7],
  "Wuhan, China": [30.6, 114.3],
  "Brooklyn, United States": [40.7, -73.9],
  "Norfolk, United States": [36.9, -76.3],
  "London, United Kingdom": [51.5, -0.1],
  "Paris, France": [48.9, 2.3],
  "Pisa, Italy": [43.7, 10.4],
  "New York-New Jersey, United States": [40.8, -74.5],
  "New York, United States": [42.9, -75.5],
  "San Francisco, United States": [37.8, -122.4],
  "Sydney, Australia": [-33.9, 151.2],
  "Kobe-Awaji, Japan": [34.6, 135],
  "Millau, France": [44.1, 3.1],
  "Florence, Italy": [43.8, 11.3],
  "Venice, Italy": [45.4, 12.3],
  "Prague, Czech Republic": [50.1, 14.4],
  "Scotland, United Kingdom": [56.8, -4.2],
  "Denmark-Sweden": [56, 12.7],
  "Istanbul, Turkey": [41, 29],
  "Jiangsu, China": [32.8, 119.8],
  "Pearl River Delta, China": [22.6, 113.8],
  "Michigan, United States": [44.3, -85.6],
  "Florida, United States": [27.8, -81.7],
  "California, United States": [36.8, -119.4],
  "Swiss Alps, Switzerland": [46.6, 8.1],
  "Tsugaru Strait, Japan": [41.5, 140.5],
  "United Kingdom-France": [50.8, 1.6],
  "Virginia, United States": [37.5, -76],
  "Tokyo, Japan": [35.7, 139.7],
  "Shaanxi, China": [34.3, 108.9],
  "Tokyo Bay, Japan": [35.4, 139.9],
  "Nepal/China": [28, 86.9],
  "Pakistan/China": [35.8, 76.5],
  "Nepal/India": [27.7, 88],
  "China/Nepal": [28, 87.1],
  "France/Italy": [45.8, 6.9],
  "Switzerland/Italy": [45.9, 7.7],
  Antarctica: [-82, 0],
  "Betws-y-Coed, United Kingdom": [53.1, -3.8],
  "Tasmania, Australia": [-42, 147],
  "Tibet, China": [31.7, 88],
  "Oregon, United States": [44, -120.5],
  "Borneo, Malaysia": [4, 114],
  "Washington, United States": [47.5, -120.5],
};

const pointFromLatLon = ([lat, lon]: LatLon): GeoPoint => ({
  lat,
  lon,
  x: clampGeo(((lon + 180) / 360) * 100, 5, 95),
  y: clampGeo(((90 - lat) / 180) * 100, 7, 93),
});

const averageLatLon = (coordinates: readonly LatLon[]): LatLon | null => {
  if (!coordinates.length) return null;
  const totals = coordinates.reduce((sum, [lat, lon]) => ({ lat: sum.lat + lat, lon: sum.lon + lon }), { lat: 0, lon: 0 });
  return [totals.lat / coordinates.length, totals.lon / coordinates.length];
};

const coordinatesForLocation = (location: WorldLocation): LatLon => {
  if (location.coordinates) return location.coordinates;
  const override = locationCoordinateOverrides[location.label];
  if (override) return override;

  const countryPoints = location.countries.map((country) => countryCoordinates[country]).filter((point): point is LatLon => Boolean(point));
  const averagedCountry = averageLatLon(countryPoints);
  if (averagedCountry) return averagedCountry;

  const continent = location.continents[0] ?? "North America";
  return continentCoordinates[continent];
};

const pointForLocation = (location: WorldLocation) => pointFromLatLon(coordinatesForLocation(location));

const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);

export const geoPointDistanceKm = (first: GeoPoint, second: GeoPoint) => {
  const latitudeDelta = degreesToRadians(second.lat - first.lat);
  const longitudeDelta = degreesToRadians(second.lon - first.lon);
  const firstLatitude = degreesToRadians(first.lat);
  const secondLatitude = degreesToRadians(second.lat);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 12742 * Math.asin(Math.min(1, Math.sqrt(haversine)));
};

export const geoPointMapDistance = (first: GeoPoint, second: GeoPoint) =>
  Math.hypot(second.x - first.x, second.y - first.y);

const factLocationMinimum = geoChoiceSeparationForDifficulty(3);

export const geoLocationsAreSeparatedForFact = (first: WorldLocation, second: WorldLocation) => {
  const firstPoint = pointForLocation(first);
  const secondPoint = pointForLocation(second);
  return geoPointDistanceKm(firstPoint, secondPoint) >= factLocationMinimum.kilometers
    && geoPointMapDistance(firstPoint, secondPoint) >= factLocationMinimum.mapPercent;
};

const separatedFactLocationPartners = <T extends { id: string; metadata?: CardMetadata }>(
  card: T & { metadata: CardMetadata & { location: WorldLocation } },
  pool: readonly (T & { metadata: CardMetadata & { location: WorldLocation } })[],
) => pool.filter((candidate) =>
  candidate.id !== card.id
  && candidate.metadata.location.label !== card.metadata.location.label
  && geoLocationsAreSeparatedForFact(card.metadata.location, candidate.metadata.location));

const hemisphereLabel = (point: GeoPoint) => {
  const northSouth = point.lat >= 0 ? "Northern Hemisphere" : "Southern Hemisphere";
  const eastWest = point.lon >= 0 ? "Eastern Hemisphere" : "Western Hemisphere";
  return `${northSouth} · ${eastWest}`;
};

export const geoChoiceForLocation = (location: WorldLocation): GeoChoice => {
  const point = pointForLocation(location);
  return {
    id: location.label,
    label: location.label,
    location,
    point,
    mapNote: worldContinentLabel(location.continents),
  };
};

const geoChoiceCandidates = <T extends { metadata?: CardMetadata }>(cards: readonly T[]) => {
  const byLabel = new Map<string, GeoChoice>();
  for (const card of cards.filter(hasLocationMetadata)) {
    const choice = geoChoiceForLocation(card.metadata.location);
    if (!byLabel.has(choice.id)) byLabel.set(choice.id, choice);
  }
  return Array.from(byLabel.values());
};

const diverseGeoChoices = (
  answer: GeoChoice,
  candidates: readonly GeoChoice[],
  count: number,
  difficulty: Difficulty,
  seed: number,
) => {
  const minimum = geoChoiceSeparationForDifficulty(difficulty);
  const selected = [answer];
  const remaining = shuffle(candidates.filter((choice) => choice.id !== answer.id), seed);

  while (selected.length < count) {
    const ranked = remaining
      .map((choice, index) => {
        const separations = selected.map((selectedChoice) => ({
          kilometers: geoPointDistanceKm(choice.point, selectedChoice.point),
          mapPercent: geoPointMapDistance(choice.point, selectedChoice.point),
        }));
        const qualifies = separations.every((separation) => separation.kilometers >= minimum.kilometers && separation.mapPercent >= minimum.mapPercent);
        const score = Math.min(...separations.map((separation) => Math.min(
          separation.kilometers / minimum.kilometers,
          separation.mapPercent / minimum.mapPercent,
        )));
        return { choice, index, qualifies, score };
      })
      .filter((candidate) => candidate.qualifies)
      .sort((first, second) => second.score - first.score || first.index - second.index);
    const next = ranked[0];
    if (!next) return null;
    selected.push(next.choice);
    remaining.splice(remaining.findIndex((choice) => choice.id === next.choice.id), 1);
  }

  return selected;
};

export const buildGeoChoicesForLocations = (
  locations: readonly WorldLocation[],
  answerLocation: WorldLocation,
  difficulty: Difficulty,
  seed: number,
) => {
  const byLabel = new Map<string, GeoChoice>();
  for (const location of locations) {
    const choice = geoChoiceForLocation(location);
    if (!byLabel.has(choice.id)) byLabel.set(choice.id, choice);
  }
  const answer = geoChoiceForLocation(answerLocation);
  const diverse = diverseGeoChoices(answer, Array.from(byLabel.values()), geoChoiceCountForDifficulty(difficulty), difficulty, seed);
  return diverse ? shuffle(diverse, seed + 1) : null;
};

type LocatedKnowledgeCard = KnowledgeCard & { metadata: CardMetadata & { location: WorldLocation } };

const geoCards = <T extends KnowledgeCard>(cards: readonly T[]) =>
  cards.filter(hasLocationMetadata) as (T & LocatedKnowledgeCard)[];

const geoCapabilityCache = new WeakMap<readonly KnowledgeCard[], Map<Difficulty, boolean>>();

const cachedGeoCapability = (cards: readonly KnowledgeCard[], difficulty: Difficulty, calculate: () => boolean) => {
  const cachedByDifficulty = geoCapabilityCache.get(cards);
  const cached = cachedByDifficulty?.get(difficulty);
  if (cached !== undefined) return cached;
  const result = calculate();
  const nextCache = cachedByDifficulty ?? new Map<Difficulty, boolean>();
  nextCache.set(difficulty, result);
  if (!cachedByDifficulty) geoCapabilityCache.set(cards, nextCache);
  return result;
};

export const canBuildGeoRoundFromCards = (cards: readonly KnowledgeCard[], difficulty: Difficulty = 1) => {
  return cachedGeoCapability(cards, difficulty, () => {
    const count = geoChoiceCountForDifficulty(difficulty);
    const candidates = geoChoiceCandidates(preferredPool(geoCards(cards), difficulty));
    return candidates.some((answer, index) => diverseGeoChoices(answer, candidates, count, difficulty, index) !== null);
  });
};

const geoScopedCards = new Map<string, KnowledgeCard[]>();
const geoFallbackCards = collectionCardCatalog.filter((card) => card.topic === "peppers" || card.topic === "buildings");

const cardsForGeoScope = (topic: TopicScope) => {
  const topics = [...new Set(topicsForScope(topic))].sort();
  const key = topics.join("|");
  const cached = geoScopedCards.get(key);
  if (cached) return cached;
  const topicSet = new Set(topics);
  const cards = collectionCardCatalog.filter((card) => topicSet.has(card.topic as KnowledgeTopic));
  geoScopedCards.set(key, cards);
  return cards;
};

export const canBuildGeoRound = (topic: TopicScope, difficulty: Difficulty = 1) => {
  return canBuildGeoRoundFromCards(cardsForGeoScope(topic), difficulty);
};

type GeoPoolPlan = {
  pool: LocatedKnowledgeCard[];
  choicesPool: GeoChoice[];
};

const geoPoolPlanCache = new WeakMap<readonly KnowledgeCard[], Map<Difficulty, GeoPoolPlan>>();

const geoPoolPlanForCards = (cards: readonly KnowledgeCard[], difficulty: Difficulty): GeoPoolPlan => {
  const cachedByDifficulty = geoPoolPlanCache.get(cards);
  const cached = cachedByDifficulty?.get(difficulty);
  if (cached) return cached;

  const allLocatedCards = geoCards(cards);
  const preferred = preferredPool(allLocatedCards, difficulty);
  const pool = canBuildGeoRoundFromCards(preferred, difficulty) ? preferred : allLocatedCards;
  const plan = { pool, choicesPool: geoChoiceCandidates(pool) };
  const nextCache = cachedByDifficulty ?? new Map<Difficulty, GeoPoolPlan>();
  nextCache.set(difficulty, plan);
  if (!cachedByDifficulty) geoPoolPlanCache.set(cards, nextCache);
  return plan;
};

export const buildGeoRoundFromCards = (
  cards: readonly KnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
  unlockedTitles: readonly string[] = [],
): GeoRound => {
  const count = geoChoiceCountForDifficulty(difficulty);
  const { pool, choicesPool } = geoPoolPlanForCards(cards, difficulty);
  const orderedCards = discoveryShuffle(pool, seed + 1, unlockedTitles, cardDiscoveryIdentities);
  const selected = orderedCards.map((card, index) => {
    const answer = geoChoiceForLocation(card.metadata.location);
    return { card, choices: diverseGeoChoices(answer, choicesPool, count, difficulty, seed + index) };
  }).find((candidate) => candidate.choices !== null);
  if (!selected?.choices) throw new Error(`Need at least ${count} well-separated mapped locations to build a geo round for ${topic}`);

  const { card, choices: diverseChoices } = selected;
  const location = card.metadata.location;
  const point = pointForLocation(location);
  const answer = geoChoiceForLocation(location);
  const choices = shuffle(diverseChoices, seed + 3);
  const continentHint = location.continents.length > 1 ? location.continents.join(" and ") : location.continents[0];

  return {
    id: `${seed}-geo-${card.topic}-${card.id}`,
    topic: card.topic || topic,
    prompt: `Where on the world map does ${card.title} belong?`,
    card,
    choices,
    answerId: answer.id,
    answerLabel: answer.label,
    location,
    point,
    mapHint: `${card.title} belongs in ${continentHint}. Look for a pin in the ${hemisphereLabel(point).toLowerCase()}.`,
    explanation: `${card.title} is connected with ${worldLocationLabelInProse(location.label)}, which is in ${continentHint}. ${card.fact}`,
  };
};

export const buildGeoRound = (topic: TopicScope, difficulty: Difficulty, seed: number, unlockedTitles: readonly string[] = []): GeoRound => {
  const scopedCards = cardsForGeoScope(topic);
  if (canBuildGeoRoundFromCards(scopedCards, difficulty)) return buildGeoRoundFromCards(scopedCards, typeof topic === "string" ? topic : "mixed", difficulty, seed, unlockedTitles);
  return buildGeoRoundFromCards(geoFallbackCards, "mixed", difficulty, seed + 97, unlockedTitles);
};

export const buildSortRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
): SortRound => {
  const pool = cardsWithStats(cards);
  const preferred = preferredPool(pool, difficulty);
  if (preferred.length < 3) throw new Error(`Need at least 3 stat cards to build a sort round for ${topic}`);
  const count = Math.min(preferred.length, difficulty === 1 ? 3 : 4);
  const selected = distinctStatCards(preferred, seed + 1, count);
  if (selected.length < 3) throw new Error(`Need at least 3 distinct stat values to build a sort round for ${topic}`);
  const sorted = [...selected].sort((a, b) => a.statValue - b.statValue);

  return {
    id: `${seed}-sort-${topic}-${selected.map((card) => card.id).join("-")}`,
    topic,
    prompt: `Tap the cards in order from the lowest ${selected[0].statLabel.toLowerCase()} to the highest.`,
    cards: shuffle(selected, seed + 2),
    answerIds: sorted.map((card) => card.id),
    explanation: sortOrderExplanation(sorted),
    statLabel: selected[0].statLabel,
  };
};

export const buildRevealRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
  unlockedTitles: readonly string[] = [],
): RevealRound => {
  if (cards.length < 3) throw new Error(`Need at least 3 cards to build a peek round for ${topic}`);
  const pool = preferredPool(cards, difficulty);
  const locationPool = preferredPool(cards.filter(hasLocationMetadata), difficulty);
  const count = Math.min(pool.length, 4);
  const locationCandidates = locationPool.flatMap((card, index) => {
    const mapChoices = buildGeoChoicesForLocations(
      locationPool.map((item) => item.metadata.location),
      card.metadata.location,
      difficulty,
      seed + 2 + index,
    );
    return mapChoices ? [{ card, mapChoices }] : [];
  });
  const askLocation = locationCandidates.length > 0 && seedRandom(seed + 4) > 0.42;

  if (askLocation) {
    const candidate = discoveryShuffle(locationCandidates, seed + 1, unlockedTitles, (item) => cardDiscoveryIdentities(item.card))[0];
    const { card, mapChoices } = candidate;
    const location = card.metadata.location;

    return {
      id: `${seed}-peek-location-${topic}-${card.id}`,
      topic,
      prompt: "Where in the world is this found?",
      card,
      choices: mapChoices.map((choice) => choice.label),
      answer: location.label,
      explanation: `${card.title} is connected with ${worldLocationLabelInProse(location.label)}. ${card.fact}`,
      map: {
        choices: mapChoices,
        answerId: location.label,
      },
    };
  }

  const card = discoveryShuffle(pool, seed + 1, unlockedTitles, cardDiscoveryIdentities)[0];
  const distractors = shuffle(pool.filter((item) => item.id !== card.id).map((item) => item.title), seed + 2).slice(0, count - 1);

  return {
    id: `${seed}-peek-${topic}-${card.id}`,
    topic,
    prompt: "Which subject is shown in the picture?",
    card,
    choices: shuffle([card.title, ...distractors], seed + 3),
    answer: card.title,
    explanation: `${card.title} is the answer. ${card.fact}`,
  };
};

export const buildFactRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
  unlockedTitles: readonly string[] = [],
): FactRound => {
  const pool = preferredPool(cardsWithStats(cards), difficulty);
  if (pool.length < 2) throw new Error(`Need at least 2 stat cards to build a fact round for ${topic}`);
  const truthful = seedRandom(seed + 11) > 0.46;
  const locationPool = pool.filter(hasLocationMetadata);
  const falseLocationPool = locationPool.filter((card) => separatedFactLocationPartners(card, locationPool).length > 0);
  const eligibleLocationPool = truthful ? locationPool : falseLocationPool;
  const useLocation = eligibleLocationPool.length > 0
    && uniqueLocationLabels(locationPool).length >= 2
    && (difficulty === 1 || seedRandom(seed + 14) > 0.5);

  if (useLocation) {
    const card = discoveryShuffle(eligibleLocationPool, seed + 12, unlockedTitles, cardDiscoveryIdentities)[0];
    const location = card.metadata.location;
    const fakeCard = truthful ? card : sample(separatedFactLocationPartners(card, locationPool), seed + 13);
    const statement = truthful
      ? `${card.title} is found in ${location.label}.`
      : `${card.title} is found in ${fakeCard.metadata.location.label}.`;
    const claimedLocation = truthful ? location : fakeCard.metadata.location;

    return {
      id: `${seed}-fact-location-${topic}-${card.id}`,
      topic,
      prompt: "True or false?",
      statement,
      image: card.image,
      imageAlt: card.imageAlt,
      imageCredit: card.imageCredit,
      answer: truthful ? "True" : "False",
      explanation: `${card.title} is actually connected with ${worldLocationLabelInProse(location.label)}. ${card.fact}`,
      locations: [location],
      map: {
        claimed: geoChoiceForLocation(claimedLocation),
        actual: geoChoiceForLocation(location),
      },
    };
  }

  const card = discoveryShuffle(pool, seed + 12, unlockedTitles, cardDiscoveryIdentities)[0];
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
    explanation: `${card.title}'s recorded ${card.statLabel.toLowerCase()} is ${card.statDisplay}. ${card.fact}`,
    locations: card.metadata?.location ? [card.metadata.location] : undefined,
  };
};

export const buildNumberRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
): NumberRound => {
  const pool = preferredPool(cardsWithStats(cards).filter((card) => card.statValue >= 0), difficulty);
  if (pool.length < 2) throw new Error(`Need at least 2 non-negative stat cards to build a number round for ${topic}`);
  const values = pool.map((card) => card.statValue);
  const gap = statValueGap(values);
  const requestedOperation = numberOperationForSeed(seed);
  const shouldAdd = pool.length >= 3 && requestedOperation === "addition";
  const unit = pool[0].stats[0]?.display.replace(formatNumber(pool[0].stats[0].value), "").trim() || "";

  if (requestedOperation === "multiplication") {
    const [card, companion] = shuffle(pool, seed + 40).slice(0, 2);
    return multiplicationRound(card, companion, topic, difficulty, seed);
  }

  if (requestedOperation === "subtraction" && shouldBuildFitRound(difficulty, seed)) {
    const sorted = shuffle(pool, seed + 1).sort((a, b) => b.statValue - a.statValue);
    const bigger = sorted[0];
    const smaller = sorted.find((card) => card.id !== bigger.id && card.statValue > 0 && card.statValue <= bigger.statValue / 2);
    if (smaller) {
      const biggerValue = Math.max(gap, roundTo(bigger.statValue, gap));
      const smallerValue = Math.max(gap, roundTo(smaller.statValue, gap));
      const answer = Math.max(2, Math.round(biggerValue / smallerValue));

      return {
        id: `${seed}-number-${topic}-fit-${bigger.id}-${smaller.id}`,
        topic,
        operation: "fit",
        prompt: `${bigger.title} has about ${numberWithUnit(biggerValue, unit)}. ${smaller.title} has about ${numberWithUnit(smallerValue, unit)}. About how many ${pluralTitle(smaller.title)} fit into ${bigger.title}?`,
        cards: [sameStatCard(smaller, smallerValue), sameStatCard(bigger, biggerValue)],
        statLabel: bigger.statLabel,
        unit: "stacks",
        operator: "x",
        termValues: [smallerValue, biggerValue],
        resultLabel: "number that fit",
        biggerLabel: bigger.title,
        smallerLabel: smaller.title,
        biggerValue,
        smallerValue,
        answer,
        choices: numberChoices(answer, 1, seed + 12),
        explanation: `${formatNumber(smallerValue)} × ${formatNumber(answer)} = ${formatNumber(smallerValue * answer)}${unit ? ` ${unit}` : ""}, which is close to ${formatNumber(biggerValue)}${unit ? ` ${unit}` : ""}.`,
      };
    }
  }

  if (shouldAdd) {
    const count = Math.min(pool.length, additionTermCount(difficulty, seed));
    const selected = shuffle(pool, seed + 1).slice(0, count);
    const termValues = selected.map((card) => Math.max(0, roundTo(card.statValue, gap)));
    const answer = sumValues(termValues);

    return {
      id: `${seed}-number-${topic}-add-${selected.map((card) => card.id).join("-")}`,
      topic,
      operation: "addition",
      prompt: packAdditionPrompt(topic, count, selected[0].statLabel),
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
      explanation: `Adding the values gives ${termValues.map(formatNumber).join(" + ")} = ${formatNumber(answer)}${unit ? ` ${unit}` : ""}.`,
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
    explanation: `Subtracting the smaller value from the larger gives ${formatNumber(biggerValue)} − ${formatNumber(smallerValue)} = ${formatNumber(answer)}${unit ? ` ${unit}` : ""}.`,
  };
};

const subjectNounForCards = (topic: RoundTopic, cards: readonly GenericKnowledgeCard[]) => {
  const normalizedCategories = cards.map((card) => card.categories.map((category) => category.toLowerCase()));
  const everyCardHas = (category: string) => normalizedCategories.every((categories) => categories.includes(category));

  if (topic === "bridges-and-tunnels") {
    if (everyCardHas("bridge")) return "bridge";
    if (everyCardHas("tunnel")) return "tunnel";
    return "bridge or tunnel";
  }
  if (topic === "dinosaurs") return "prehistoric animal";
  if (topic === "tallest-mountains" || topic === "mountains") return "mountain";
  if (topic === "tall-trees") return normalizedCategories.every((categories) => !categories.includes("reference")) ? "tree" : "subject";
  if (topic === "hot-sauces") return "sauce or pepper oil";
  return "subject";
};

const superlativeForStat = (statLabel: string) => {
  const normalized = statLabel.toLowerCase();
  if (/length|distance|range|span/.test(normalized)) return "longest";
  if (/height/.test(normalized)) return "tallest";
  if (/elevation|prominence/.test(normalized)) return "highest";
  if (/speed/.test(normalized)) return "fastest";
  if (/weight|mass/.test(normalized)) return "heaviest";
  if (/age/.test(normalized)) return "oldest";
  if (/temperature|heat/.test(normalized)) return "hottest";
  return null;
};

export const buildOddRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
): OddRound => {
  const preferred = preferredPool(cards, difficulty);
  const preferredWithDistinctStats = distinctStatCards(cardsWithStats(preferred), seed + 1, 4);
  const pool = preferredWithDistinctStats.length === 4
    ? preferredWithDistinctStats
    : distinctStatCards(cardsWithStats(cards), seed + 2, 4);
  if (pool.length < 4) throw new Error(`Need at least 4 cards to build an odd-one round for ${topic}`);
  const odd = [...pool].sort((a, b) => b.statValue - a.statValue)[0];
  const subjectNoun = subjectNounForCards(topic, pool);
  const superlative = superlativeForStat(odd.statLabel);
  return {
    id: `${seed}-odd-${topic}-stat-${odd.id}`,
    topic,
    prompt: superlative
      ? `Which ${subjectNoun} is the ${superlative}?`
      : `Which ${subjectNoun} has the highest ${odd.statLabel.toLowerCase()}?`,
    cards: shuffle(pool, seed + 3),
    answerId: odd.id,
    reason: `${odd.title} has ${odd.statDisplay}.`,
    explanation: superlative
      ? `Compare the ${odd.statLabel.toLowerCase()} shown for each ${subjectNoun}. ${odd.title} is the ${superlative}.`
      : `Compare the ${odd.statLabel.toLowerCase()} shown for each ${subjectNoun}. ${odd.title} has the highest value.`,
  };
};

export const buildTopTrumpRoundFromCards = (
  cards: readonly GenericKnowledgeCard[],
  topic: RoundTopic,
  difficulty: Difficulty,
  seed: number,
  unlockedTitles: readonly string[] = [],
): TopTrumpRound => {
  const pool = preferredPool(cards.filter((card) => card.stats.length >= 2), difficulty);
  if (pool.length < 2) throw new Error(`Need at least 2 multi-stat cards to build a Top Trumps round for ${topic}`);
  const shuffled = discoveryShuffle(pool, seed + difficulty, unlockedTitles, cardDiscoveryIdentities);
  const player = shuffled[0];
  const computer = shuffled.find((card) => card.id !== player.id && card.stats.some((stat) => player.stats.some((playerStat) => playerStat.id === stat.id))) ?? shuffled[1];
  const sharedStatIds = new Set(computer.stats.map((stat) => stat.id));
  const playerStats = player.stats.filter((stat) => sharedStatIds.has(stat.id));
  const computerStats = computer.stats.filter((stat) => playerStats.some((playerStat) => playerStat.id === stat.id));

  return {
    id: `${seed}-trumps-${topic}-${player.id}-${computer.id}`,
    topic,
    prompt: "Choose the category that gives your card its strongest advantage.",
    player: { ...player, stats: playerStats },
    computer: { ...computer, stats: computerStats },
  };
};

const additionTermCount = (difficulty: Difficulty, seed: number) => difficulty === 1 ? 2 : difficulty === 3 ? 3 : seedRandom(seed + difficulty * 17) > 0.45 ? 3 : 2;
const additionPromptStart = (count: number) => count === 2 ? "Add these together" : "Add all three together";
const stackedTotalLabel = (count: number) => count === 2 ? "stacked total" : "three-part total";
const sumValues = (values: number[]) => values.reduce((total, value) => total + value, 0);
const packAdditionPrompt = (topic: RoundTopic, count: number, statLabel: string) => {
  if (topic === "dinosaurs") return `${additionPromptStart(count)}. If these dinosaurs lined up nose to tail, what is their total length?`;
  if (topic === "tall-trees") return `${additionPromptStart(count)}. If these trees were placed end to end, what is their total height?`;
  if (topic === "bridges-and-tunnels") return `${additionPromptStart(count)}. If these routes were joined end to end, what is their total length?`;
  if (topic === "tallest-mountains") return `${additionPromptStart(count)}. In this number puzzle, what is the sum of their elevations?`;
  return `${additionPromptStart(count)}. What is their total ${statLabel.toLowerCase()}?`;
};

export const buildNumberRound = (topic: TopicScope, difficulty: Difficulty, seed: number): NumberRound => {
  const currentTopic = topicOrder(topic, seed);
  const requestedOperation = numberOperationForSeed(seed);

  if (currentTopic === "countries") {
    const populationStep = difficulty === 1 ? 10 : difficulty === 2 ? 5 : 1;
    const pool = preferredPool(countries.filter((country) => country.population >= 1_000_000), difficulty);
    const first = shuffle(pool, seed + 1)[0];
    const firstMillions = Math.max(populationStep, roundTo(first.population / 1_000_000, populationStep));
    const second = shuffle(pool.filter((country) => {
      const millions = Math.max(populationStep, roundTo(country.population / 1_000_000, populationStep));
      return country.id !== first.id && millions !== firstMillions;
    }), seed + 2)[0];
    const secondMillions = Math.max(populationStep, roundTo(second.population / 1_000_000, populationStep));

    if (requestedOperation === "addition") {
      const answer = firstMillions + secondMillions;
      return {
        id: `${seed}-number-countries-add-${first.id}-${second.id}`,
        topic: currentTopic,
        operation: "addition",
        prompt: `${sentenceStart(countryNameInProse(first))} has about ${formatNumber(firstMillions)} million people, and ${countryNameInProse(second)} has about ${formatNumber(secondMillions)} million. About how many million people is that altogether?`,
        cards: [roundedStatCard(countryCard(first), firstMillions, "million people"), roundedStatCard(countryCard(second), secondMillions, "million people")],
        statLabel: "Rounded population",
        unit: "million people",
        operator: "+",
        termValues: [firstMillions, secondMillions],
        resultLabel: "combined population",
        biggerLabel: first.name,
        smallerLabel: second.name,
        biggerValue: firstMillions,
        smallerValue: secondMillions,
        answer,
        choices: numberChoices(answer, populationStep, seed + 3),
        explanation: `Adding the rounded populations gives ${formatNumber(firstMillions)} + ${formatNumber(secondMillions)} = ${formatNumber(answer)} million people. The figures are rounded to make the mental math manageable.`,
      };
    }

    const bigger = firstMillions > secondMillions ? first : second;
    const smaller = firstMillions > secondMillions ? second : first;
    const biggerValue = Math.max(firstMillions, secondMillions);
    const smallerValue = Math.min(firstMillions, secondMillions);
    const answer = biggerValue - smallerValue;
    return {
      id: `${seed}-number-countries-difference-${bigger.id}-${smaller.id}`,
      topic: currentTopic,
      operation: "subtraction",
      prompt: `${sentenceStart(countryNameInProse(bigger))} has about ${formatNumber(biggerValue)} million people. ${sentenceStart(countryNameInProse(smaller))} has about ${formatNumber(smallerValue)} million. About how many million more people live in ${countryNameInProse(bigger)}?`,
      cards: [roundedStatCard(countryCard(bigger), biggerValue, "million people"), roundedStatCard(countryCard(smaller), smallerValue, "million people")],
      statLabel: "Rounded population",
      unit: "million people",
      operator: "-",
      termValues: [biggerValue, smallerValue],
      resultLabel: "population difference",
      biggerLabel: bigger.name,
      smallerLabel: smaller.name,
      biggerValue,
      smallerValue,
      answer,
      choices: numberChoices(answer, populationStep, seed + 4),
      explanation: `Subtracting the rounded populations gives ${formatNumber(biggerValue)} − ${formatNumber(smallerValue)} = ${formatNumber(answer)} million people. The figures are rounded to make the mental math manageable.`,
    };
  }

  if (currentTopic === "peppers") {
    const pool = preferredPool(pepperPlantPool(), difficulty);
    if (requestedOperation === "multiplication") {
      const [first, second] = shuffle(pool, seed + 1).slice(0, 2);
      return multiplicationRound(pepperCard(first), pepperCard(second), currentTopic, difficulty, seed);
    }

    const [first, second] = shuffle(pool, seed + 1).slice(0, 2);
    const countRange = difficulty === 1 ? [2, 7] as const : difficulty === 2 ? [4, 12] as const : [7, 20] as const;
    const firstCount = pickFactor(countRange, seed + 2);
    const secondCount = pickFactor(countRange, seed + 3);

    if (requestedOperation === "addition") {
      const answer = firstCount + secondCount;
      return {
        id: `${seed}-number-peppers-add-${first.id}-${second.id}`,
        topic: currentTopic,
        operation: "addition",
        prompt: `In this garden, one ${first.name} plant has ${firstCount} ripe peppers and one ${second.name} plant has ${secondCount}. How many peppers are there altogether?`,
        cards: [roundedStatCard(pepperCard(first), firstCount, "peppers"), roundedStatCard(pepperCard(second), secondCount, "peppers")],
        statLabel: "Garden count",
        unit: "peppers",
        operator: "+",
        termValues: [firstCount, secondCount],
        resultLabel: "total peppers",
        biggerLabel: first.name,
        smallerLabel: second.name,
        biggerValue: firstCount,
        smallerValue: secondCount,
        answer,
        choices: numberChoices(answer, 1, seed + 4),
        explanation: `Adding the two harvests gives ${firstCount} + ${secondCount} = ${answer} peppers.`,
      };
    }

    const biggerCount = Math.max(firstCount, secondCount) + 2;
    const smallerCount = Math.min(firstCount, secondCount);
    const answer = biggerCount - smallerCount;

    return {
      id: `${seed}-number-peppers-subtract-${first.id}-${second.id}`,
      topic: currentTopic,
      operation: "subtraction",
      prompt: `In this garden, a ${first.name} plant has ${biggerCount} peppers and a ${second.name} plant has ${smallerCount}. How many more peppers does the ${first.name} plant have?`,
      cards: [roundedStatCard(pepperCard(first), biggerCount, "peppers"), roundedStatCard(pepperCard(second), smallerCount, "peppers")],
      statLabel: "Garden count",
      unit: "peppers",
      operator: "-",
      termValues: [biggerCount, smallerCount],
      resultLabel: "difference",
      biggerLabel: first.name,
      smallerLabel: second.name,
      biggerValue: biggerCount,
      smallerValue: smallerCount,
      answer,
      choices: numberChoices(answer, 1, seed + 4),
      explanation: `The difference is ${biggerCount} − ${smallerCount} = ${answer} peppers.`,
    };
  }

  if (currentTopic === "buildings") {
    const pool = preferredPool(buildings, difficulty);
    if (requestedOperation === "multiplication") {
      const [first, second] = shuffle(pool, seed + 3).slice(0, 2);
      return multiplicationRound(buildingCard(first), buildingCard(second), currentTopic, difficulty, seed);
    }
    const step = difficulty === 1 ? 200 : difficulty === 2 ? 100 : 50;
    if (requestedOperation === "addition") {
      const count = additionTermCount(difficulty, seed);
      const selected = shuffle(pool, seed + 4).slice(0, count);
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
        explanation: `Adding the heights gives ${values.map(formatNumber).join(" + ")} = ${formatNumber(answer)} feet.`,
      };
    }

    const taller = sampleSafe(pool.filter((building) => building.heightFt >= 1800), pool, seed + 4);
    const shorter = sampleSafe(pool.filter((building) => building.id !== taller.id && building.heightFt <= taller.heightFt - 150), pool.filter((building) => building.id !== taller.id), seed + 5);
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
      explanation: `The height difference is ${formatNumber(biggerValue)} − ${formatNumber(smallerValue)} = ${formatNumber(answer)} feet.`,
    };
  }

  if (currentTopic === "space") {
    const pool = preferredPool(spaceCards, difficulty);
    if (requestedOperation === "multiplication") {
      const [first, second] = shuffle(pool, seed + 6).slice(0, 2);
      return multiplicationRound(spaceCard(first, "size"), spaceCard(second, "size"), currentTopic, difficulty, seed);
    }
    if (requestedOperation === "addition") {
      const count = additionTermCount(difficulty, seed);
      const step = difficulty === 1 ? 500 : difficulty === 2 ? 100 : 50;
      const selected = shuffle(pool.filter((space) => space.diameterMiles !== undefined), seed + 7).slice(0, count);
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
        explanation: `Adding the diameters gives ${values.map(formatNumber).join(" + ")} = ${formatNumber(answer)} miles.`,
      };
    }

    const planetsWithMoonCounts = pool.filter((space) => space.kind === "planet" && space.moons !== undefined);
    const moreMoons = sampleSafe(planetsWithMoonCounts.filter((space) => (space.moons ?? 0) >= 10), planetsWithMoonCounts, seed + 7);
    const fewerMoons = sampleSafe(planetsWithMoonCounts.filter((space) => space.id !== moreMoons.id && (space.moons ?? 0) < (moreMoons.moons ?? 0)), planetsWithMoonCounts.filter((space) => space.id !== moreMoons.id), seed + 8);
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
      explanation: `The difference is ${formatNumber(biggerValue)} − ${formatNumber(smallerValue)} = ${formatNumber(answer)} moons.`,
    };
  }

  if (currentTopic === "jets") {
    const pool = preferredPool(jets, difficulty);
    if (requestedOperation === "multiplication") {
      const [first, second] = shuffle(pool, seed + 9).slice(0, 2);
      return multiplicationRound(jetCard(first), jetCard(second), currentTopic, difficulty, seed);
    }
    const step = difficulty === 1 ? 200 : difficulty === 2 ? 100 : 50;
    if (requestedOperation === "addition") {
      const count = additionTermCount(difficulty, seed);
      const selected = shuffle(pool, seed + 10).slice(0, count);
      const countRange = difficulty === 1 ? [2, 7] as const : difficulty === 2 ? [4, 12] as const : [7, 20] as const;
      const values = selected.map((_, index) => pickFactor(countRange, seed + 20 + index));
      const answer = sumValues(values);
      return {
        id: `${seed}-number-jets-add-${selected.map((jet) => jet.id).join("-")}`,
        topic: currentTopic,
        operation: "addition",
        prompt: `${additionPromptStart(count)}. An air museum displays these groups of model jets. How many models are there altogether?`,
        cards: selected.map((jet, index) => roundedStatCard(jetCard(jet, "speed"), values[index], "model jets")),
        statLabel: "Display count",
        unit: "model jets",
        operator: "+",
        termValues: values,
        resultLabel: stackedTotalLabel(count),
        biggerLabel: selected[0]?.name ?? "Jet",
        smallerLabel: selected[1]?.name ?? "Jet",
        biggerValue: values[0] ?? 0,
        smallerValue: values[1] ?? 0,
        answer,
        choices: numberChoices(answer, 1, seed + 12),
        explanation: `Adding the display groups gives ${values.map(formatNumber).join(" + ")} = ${formatNumber(answer)} model jets.`,
      };
    }

    const faster = sampleSafe(pool.filter((jet) => jet.maxSpeedMph >= 1200), pool, seed + 10);
    const slower = sampleSafe(pool.filter((jet) => jet.id !== faster.id && jet.maxSpeedMph <= faster.maxSpeedMph - 250), pool.filter((jet) => jet.id !== faster.id), seed + 11);
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
      explanation: `The speed difference is ${formatNumber(biggerValue)} − ${formatNumber(smallerValue)} = ${formatNumber(answer)} mph.`,
    };
  }

  const step = difficulty === 1 ? 5 : 2;
  const sharkPool = preferredPool(sharks, difficulty);
  if (requestedOperation === "multiplication") {
    const [first, second] = shuffle(sharkPool, seed + 9).slice(0, 2);
    return multiplicationRound(sharkCard(first), sharkCard(second), currentTopic, difficulty, seed);
  }
  if (requestedOperation === "addition") {
    const count = additionTermCount(difficulty, seed);
    const selected = shuffle(sharkPool, seed + 10).slice(0, count);
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
      explanation: `Adding the lengths gives ${values.map(formatNumber).join(" + ")} = ${formatNumber(answer)} feet.`,
    };
  }

  const bigger = sampleSafe(sharkPool.filter((shark) => shark.lengthFt >= 15), sharkPool, seed + 10);
  const smaller = sampleSafe(sharkPool.filter((shark) => shark.id !== bigger.id && shark.lengthFt <= bigger.lengthFt - 5), sharkPool.filter((shark) => shark.id !== bigger.id), seed + 11);
  const roundedLengths = roundedSubtractionPair(bigger.lengthFt, smaller.lengthFt, step);
  const biggerValue = roundedLengths.biggerValue;
  const smallerValue = Math.max(1, roundedLengths.smallerValue);
  const answer = biggerValue - smallerValue;
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
    explanation: `The length difference is ${formatNumber(biggerValue)} − ${formatNumber(smallerValue)} = ${formatNumber(answer)} feet.`,
  };
};

export const buildOddRound = (topic: TopicScope, difficulty: Difficulty, seed: number): OddRound => {
  const currentTopic = topicOrder(topic, seed);

  if (currentTopic === "countries") {
    const pool = preferredPool(countries, difficulty);
    const continentGroups = (["Africa", "Asia", "Europe", "North America", "South America", "Oceania"] as WorldContinent[])
      .filter((continent) => pool.filter((country) => country.continents.includes(continent)).length >= 3)
      .filter((continent) => pool.some((country) => !country.continents.includes(continent)));
    const continent = sample(continentGroups, seed + 1);
    const same = shuffle(pool.filter((country) => country.continents.includes(continent)), seed + 2).slice(0, 3);
    const odd = sample(pool.filter((country) => !country.continents.includes(continent)), seed + 3);
    return {
      id: `${seed}-odd-countries-${continent}-${odd.id}`,
      topic: currentTopic,
      prompt: "Which flag belongs to the country on a different continent from the other three?",
      cards: shuffle([...same.map((country) => countryCard(country)), countryCard(odd)], seed + 4),
      answerId: odd.id,
      reason: `${sentenceStart(countryNameInProse(odd))} is in ${worldContinentLabel(odd.continents)}, while the others are in ${continent}.`,
      explanation: `The rule is continent. ${sentenceStart(countryNameInProse(odd))} is the odd one out.`,
    };
  }

  if (currentTopic === "peppers") {
    const pepperPlants = pepperPlantPool();
    const preferred = preferredPool(pepperPlants, difficulty);
    const preferredEligibleHeats = heatBands.filter((heat) => {
      const sameCount = preferred.filter((pepper) => pepper.heat === heat).length;
      const hasClearOdd = preferred.some((pepper) => Math.abs(heatRank[pepper.heat] - heatRank[heat]) >= 2);
      return sameCount >= 3 && hasClearOdd;
    });
    const pool = preferredEligibleHeats.length ? preferred : pepperPlants;
    const eligibleHeats = (preferredEligibleHeats.length ? preferredEligibleHeats : heatBands).filter((heat) => {
      const sameCount = pool.filter((pepper) => pepper.heat === heat).length;
      const hasClearOdd = pool.some((pepper) => Math.abs(heatRank[pepper.heat] - heatRank[heat]) >= 2);
      return sameCount >= 3 && hasClearOdd;
    });
    const heat = sample(eligibleHeats, seed + 1);
    const same = shuffle(pool.filter((pepper) => pepper.heat === heat), seed + 2).slice(0, 3);
    const odd = sampleSafe(
      pool.filter((pepper) => Math.abs(heatRank[pepper.heat] - heatRank[heat]) >= 2),
      pool.filter((pepper) => pepper.heat !== heat),
      seed + 3,
    );
    const cards = shuffle([...same.map(pepperCard), pepperCard(odd)], seed + 4);
    return {
      id: `${seed}-odd-peppers-${heat}-${odd.id}`,
      topic: currentTopic,
      prompt: "Which pepper belongs to a different heat level from the other three?",
      cards,
      answerId: odd.id,
      reason: `${odd.name} is ${odd.heat}; the others are ${heat}.`,
      explanation: `The rule is heat level. ${odd.name} is the odd one out because its heat level is ${odd.heat}.`,
    };
  }

  if (currentTopic === "buildings") {
    const preferred = preferredPool(buildings, difficulty);
    const rules: {
      id: string;
      prompt: string;
      same: (building: Building) => boolean;
      odd: (building: Building) => boolean;
      reason: (odd: Building) => string;
      explanation: (odd: Building) => string;
      usesLocation?: boolean;
    }[] = [
      {
        id: "new-york-city",
        prompt: "Which building is not in New York City?",
        same: (building) => building.city === "New York City",
        odd: (building) => building.city !== "New York City",
        reason: (odd) => `${odd.name} is in ${odd.city}; the others are in New York City.`,
        explanation: (odd) => `The rule is location. ${odd.name} is the odd one out because it is in ${odd.city}, not New York City.`,
        usesLocation: true,
      },
      {
        id: "brooklyn",
        prompt: "Which building is not in Brooklyn?",
        same: buildingIsInBrooklyn,
        odd: (building) => !buildingIsInBrooklyn(building),
        reason: (odd) => `${odd.name} is not in Brooklyn; the others are Brooklyn buildings.`,
        explanation: (odd) => `The rule is borough. ${odd.name} is the odd one out because it is not one of the Brooklyn buildings.`,
        usesLocation: true,
      },
      {
        id: "asia",
        prompt: "Which building is not in Asia?",
        same: buildingIsInAsia,
        odd: (building) => !buildingIsInAsia(building),
        reason: (odd) => `${odd.name} is in ${odd.country}; the others are in Asia.`,
        explanation: (odd) => `The rule is region. ${odd.name} is the odd one out because it is not in Asia.`,
        usesLocation: true,
      },
      {
        id: "united-states",
        prompt: "Which building is not in the United States?",
        same: (building) => building.country === "United States",
        odd: (building) => building.country !== "United States",
        reason: (odd) => `${odd.name} is in ${odd.country}; the others are in the United States.`,
        explanation: (odd) => `The rule is country. ${odd.name} is the odd one out because it is in ${odd.country}.`,
        usesLocation: true,
      },
      {
        id: "china",
        prompt: "Which building is not in China?",
        same: (building) => building.country === "China",
        odd: (building) => building.country !== "China",
        reason: (odd) => `${odd.name} is in ${odd.country}; the others are in China.`,
        explanation: (odd) => `The rule is country. ${odd.name} is the odd one out because it is not in China.`,
        usesLocation: true,
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
        prompt: "Which building is not finished yet?",
        same: (building) => building.status === "finished",
        odd: (building) => building.status !== "finished",
        reason: (odd) => `${odd.name} is ${buildingStatusLabel(odd)}; the others are finished.`,
        explanation: (odd) => `The rule is building status. ${odd.name} is the odd one out because it is ${buildingStatusLabel(odd)}.`,
      },
    ];
    const preferredEligibleRules = rules.filter((rule) => preferred.filter(rule.same).length >= 3 && preferred.some(rule.odd));
    const pool = preferredEligibleRules.length ? preferred : buildings;
    const eligibleRules = rules.filter((rule) => pool.filter(rule.same).length >= 3 && pool.some(rule.odd));
    const rule = sampleSafe(eligibleRules, rules, seed + 5);
    const same = shuffle(pool.filter(rule.same), seed + 6).slice(0, 3);
    const odd = sampleSafe(pool.filter(rule.odd), pool.filter((building) => !same.some((card) => card.id === building.id)), seed + 7);
    const cards = shuffle([...same.map(buildingCard), buildingCard(odd)], seed + 8);
    return {
      id: `${seed}-odd-buildings-${rule.id}-${odd.id}`,
      topic: currentTopic,
      prompt: rule.prompt,
      cards,
      answerId: odd.id,
      reason: rule.reason(odd),
      explanation: rule.explanation(odd),
      locations: rule.usesLocation
        ? cards.flatMap((card) => card.metadata?.location ? [card.metadata.location] : [])
        : undefined,
    };
  }

  if (currentTopic === "space") {
    const preferred = preferredPool(spaceCards, difficulty);
    const allKinds = ["planet", "star", "concept"] as const;
    const preferredEligibleKinds = allKinds.filter((kind) => preferred.filter((space) => space.kind === kind).length >= 3 && preferred.some((space) => space.kind !== kind));
    const pool = preferredEligibleKinds.length ? preferred : spaceCards;
    const eligibleKinds = allKinds.filter((kind) => pool.filter((space) => space.kind === kind).length >= 3 && pool.some((space) => space.kind !== kind));
    const kind = sampleSafe(preferredEligibleKinds, eligibleKinds, seed + 8);
    const same = shuffle(pool.filter((space) => space.kind === kind), seed + 9).slice(0, 3);
    const odd = sampleSafe(pool.filter((space) => space.kind !== kind), pool, seed + 10);
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
    const preferred = preferredPool(jets, difficulty);
    const allCategories = ["stealth", "bomber", "trainer", "interceptor", "attack", "multirole", "dogfighter"] as JetCategory[];
    const preferredEligibleCategories = allCategories.filter((category) => preferred.filter((jet) => jet.category === category).length >= 3 && preferred.some((jet) => jet.category !== category));
    const pool = preferredEligibleCategories.length ? preferred : jets;
    const eligibleCategories = allCategories.filter((category) => pool.filter((jet) => jet.category === category).length >= 3 && pool.some((jet) => jet.category !== category));
    const category = sampleSafe(preferredEligibleCategories, eligibleCategories, seed + 12);
    const same = shuffle(pool.filter((jet) => jet.category === category), seed + 13).slice(0, 3);
    const odd = sampleSafe(pool.filter((jet) => jet.category !== category), pool, seed + 14);
    const cards = shuffle([...same.map((jet) => jetCard(jet)), jetCard(odd)], seed + 15);
    return {
      id: `${seed}-odd-jets-${category}-${odd.id}`,
      topic: currentTopic,
      prompt: "Which jet belongs to a different mission category from the other three?",
      cards,
      answerId: odd.id,
      reason: `${odd.name} is classified as ${jetCategoryWithArticle(odd.category)}, while the others are classified as ${jetCategoryWithArticle(category)}.`,
      explanation: `The rule is aircraft mission category. ${odd.name} is the odd one out because it is classified as ${jetCategoryWithArticle(odd.category)}.`,
    };
  }

  const preferred = preferredPool(sharks, difficulty);
  const preferredFamilies = Array.from(new Set(preferred.map((shark) => shark.family)));
  const preferredEligibleFamilies = preferredFamilies.filter((item) => preferred.filter((shark) => shark.family === item).length >= 3);
  const pool = preferredEligibleFamilies.length ? preferred : sharks;
  const families = Array.from(new Set(pool.map((shark) => shark.family)));
  const family = sampleSafe(preferredEligibleFamilies, families.filter((item) => pool.filter((shark) => shark.family === item).length >= 3), seed + 12);
  const same = shuffle(pool.filter((shark) => shark.family === family), seed + 13).slice(0, 3);
  const odd = sampleSafe(pool.filter((shark) => shark.family !== family), pool, seed + 14);
  const cards = shuffle([...same.map((shark) => sharkCard(shark)), sharkCard(odd)], seed + 15);
  return {
    id: `${seed}-odd-sharks-${family}-${odd.id}`,
    topic: currentTopic,
    prompt: "Which shark does not fit the family rule?",
    cards,
    answerId: odd.id,
    reason: `${odd.name} belongs to the ${odd.family} family, while the others belong to the ${family} family.`,
    explanation: `The rule is shark family. ${odd.name} is the odd one out because it belongs to the ${odd.family} family.`,
  };
};

export const buildSortRound = (topic: TopicScope, difficulty: Difficulty, seed: number): SortRound => {
  const currentTopic = topicOrder(topic, seed);
  const count = difficulty === 1 ? 3 : 4;

  if (currentTopic === "countries") {
    const metric: CountryMetric = seedRandom(seed + 1) > 0.48 ? "population" : "area";
    const cards = distinctStatCards(
      shuffle(preferredPool(countries, difficulty), seed + 2).map((country) => countryCard(country, metric)),
      seed + 3,
      count,
    );
    const sorted = [...cards].sort((first, second) => first.statValue - second.statValue);
    return {
      id: `${seed}-sort-countries-${metric}`,
      topic: currentTopic,
      prompt: metric === "population" ? "Tap the countries in order from the smallest population to the largest." : "Tap the countries in order from the smallest land area to the largest.",
      cards: shuffle(cards, seed + 4),
      answerIds: sorted.map((card) => card.id),
      explanation: sortOrderExplanation(sorted),
      statLabel: metric === "population" ? "Population" : "Land area",
    };
  }

  if (currentTopic === "peppers") {
    const cards = distinctStatCards(shuffle(preferredPool(pepperPlantPool().filter(hasScovilleMeasurement), difficulty), seed + 1).map(pepperCard), seed + 2, count);
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-peppers`,
      topic: currentTopic,
      prompt: "Tap the peppers in order from the mildest to the hottest.",
      cards: shuffle(cards, seed + 3),
      answerIds,
      explanation: sortOrderExplanation([...cards].sort((a, b) => a.statValue - b.statValue)),
      statLabel: "Scoville heat",
    };
  }

  if (currentTopic === "buildings") {
    const cards = distinctStatCards(shuffle(preferredPool(buildings, difficulty), seed + 3).map(buildingCard), seed + 4, count);
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-buildings`,
      topic: currentTopic,
      prompt: "Tap the buildings in order from the shortest to the tallest.",
      cards: shuffle(cards, seed + 5),
      answerIds,
      explanation: sortOrderExplanation([...cards].sort((a, b) => a.statValue - b.statValue)),
      statLabel: "Height",
    };
  }

  if (currentTopic === "space") {
    const metric = sample(["distance", "temperature", "size", "moons"] as const, seed + 5);
    const pool = spaceCards.filter((item) => {
      if (metric === "distance") return item.distanceFromSunMillionMiles !== undefined || item.distanceLightYears !== undefined;
      if (metric === "temperature") return item.surfaceTempK !== undefined || item.meanSurfaceTempF !== undefined;
      if (metric === "size") return item.radiusSolar !== undefined || item.diameterMiles !== undefined;
      return item.kind === "planet" && item.moons !== undefined;
    });
    const cards = distinctStatCards(shuffle(preferredPool(pool, difficulty), seed + 6).map((space) => spaceCard(space, metric)), seed + 7, count);
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-space-${metric}`,
      topic: currentTopic,
      prompt: metric === "distance" ? "Tap the space cards in order from the nearest to the farthest." : metric === "temperature" ? "Tap the space cards in order from the coolest to the hottest." : metric === "size" ? "Tap the space cards in order from the smallest to the largest." : "Tap the space cards in order from the fewest moons to the most.",
      cards: shuffle(cards, seed + 8),
      answerIds,
      explanation: sortOrderExplanation([...cards].sort((a, b) => a.statValue - b.statValue)),
      statLabel: metric === "distance" ? "Distance" : metric === "temperature" ? "Temperature" : metric === "size" ? "Size" : "Moons",
    };
  }

  if (currentTopic === "jets") {
    const metric = sample(["speed", "range", "firepower"] as const, seed + 5);
    const cards = distinctStatCards(shuffle(preferredPool(jets, difficulty), seed + 6).map((jet) => jetCard(jet, metric)), seed + 7, count);
    const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
    return {
      id: `${seed}-sort-jets-${metric}`,
      topic: currentTopic,
      prompt: metric === "speed" ? "Tap the jets in order from the slowest to the fastest." : metric === "range" ? "Tap the jets in order from the shortest range to the longest." : "Tap the jets in order from the lowest firepower rating to the highest.",
      cards: shuffle(cards, seed + 8),
      answerIds,
      explanation: sortOrderExplanation([...cards].sort((a, b) => a.statValue - b.statValue)),
      statLabel: metric === "speed" ? "Speed" : metric === "range" ? "Range" : "Firepower",
    };
  }

  const metric = sample(["length", "speed", "power"] as const, seed + 5);
  const cards = distinctStatCards(shuffle(preferredPool(sharks, difficulty), seed + 6).map((shark) => sharkCard(shark, metric)), seed + 7, count);
  const answerIds = [...cards].sort((a, b) => a.statValue - b.statValue).map((card) => card.id);
  return {
    id: `${seed}-sort-sharks-${metric}`,
    topic: currentTopic,
    prompt: metric === "length" ? "Tap the sharks in order from the shortest to the longest." : metric === "speed" ? "Tap the sharks in order from the slowest to the fastest." : "Tap the sharks in order from the lowest power rating to the highest.",
    cards: shuffle(cards, seed + 8),
    answerIds,
    explanation: sortOrderExplanation([...cards].sort((a, b) => a.statValue - b.statValue)),
    statLabel: metric === "length" ? "Size" : metric === "speed" ? "Speed" : "Power",
  };
};

export const buildFactRound = (topic: TopicScope, difficulty: Difficulty, seed: number, unlockedTitles: readonly string[] = []): FactRound => {
  const currentTopic = topicOrder(topic, seed);
  const truthful = seedRandom(seed + 11) > 0.46;

  if (currentTopic === "countries") {
    const pool = preferredPool(countries, difficulty);
    const country = discoveryShuffle(pool, seed + 12, unlockedTitles, (item) => cardDiscoveryIdentities({
      id: item.id,
      topic: "countries",
      title: item.name,
    }))[0];
    const factType = difficulty === 1
      ? sample(["capital", "continent"] as const, seed + 13)
      : difficulty === 2
        ? sample(["capital", "continent", "population", "area"] as const, seed + 13)
        : sample(["population", "area", "neighbors", "highest-point"] as const, seed + 13);
    const alternate = sample(pool.filter((item) => item.id !== country.id), seed + 14);
    const claimedCapital = truthful ? country.capital : alternate.capital;
    const falseContinents = (["Africa", "Asia", "Europe", "North America", "Oceania", "South America"] as WorldContinent[])
      .filter((continent) => !country.continents.includes(continent));
    const claimedContinent = truthful ? country.continents[0] : sample(falseContinents, seed + 15);
    const claimedPopulation = truthful ? country.population : alternate.population;
    const claimedArea = truthful ? country.areaKm2 : alternate.areaKm2;
    const claimedNeighbors = truthful ? country.landNeighborCount : alternate.landNeighborCount;
    const claimedHighestPoint = truthful ? country.highestPointName : alternate.highestPointName;
    const statement = factType === "capital"
      ? `${claimedCapital} is the capital of ${countryNameInProse(country)}.`
      : factType === "continent"
        ? `${sentenceStart(countryNameInProse(country))} is in ${claimedContinent}.`
        : factType === "population"
          ? `${sentenceStart(countryNameInProse(country))} has about ${formatNumber(claimedPopulation)} people.`
          : factType === "area"
            ? `${sentenceStart(countryNameInProse(country))} has about ${formatNumber(claimedArea)} square kilometers of land area.`
            : factType === "neighbors"
              ? `${sentenceStart(countryNameInProse(country))} has ${formatNumber(claimedNeighbors)} land ${claimedNeighbors === 1 ? "neighbor" : "neighbors"}.`
              : `${claimedHighestPoint} is the highest point in ${countryNameInProse(country)}.`;
    return {
      id: `${seed}-fact-country-${factType}-${country.id}`,
      topic: currentTopic,
      prompt: "True or false?",
      statement,
      image: country.image,
      imageAlt: `Flag of ${country.name}`,
      imageCredit: country.imageCredit,
      answer: truthful ? "True" : "False",
      explanation: `${countryFactSentence(country)} It has about ${formatNumber(country.population)} people and ${formatNumber(country.landNeighborCount)} land ${country.landNeighborCount === 1 ? "neighbor" : "neighbors"}. Its highest point is ${country.highestPointName}, at about ${formatNumber(country.highestPointM)} meters above sea level.`,
      locations: country.metadata.location ? [country.metadata.location] : undefined,
    };
  }

  if (currentTopic === "peppers") {
    const pool = preferredPool(peppers, difficulty);
    const pepper = discoveryShuffle(pool, seed + 12, unlockedTitles, (item) => cardDiscoveryIdentities({
      id: item.id,
      topic: "peppers",
      title: item.name,
    }))[0];
    const locationPool = pool.filter(hasLocationMetadata);
    const falseLocationPool = locationPool.filter((card) => separatedFactLocationPartners(card, locationPool).length > 0);
    const eligibleLocationPool = truthful ? locationPool : falseLocationPool;
    const useLocation = eligibleLocationPool.length > 0 && (difficulty === 1 ? seedRandom(seed + 15) > 0.35 : seedRandom(seed + 15) > 0.55);
    if (useLocation) {
      const locatedPepper = hasLocationMetadata(pepper) && eligibleLocationPool.some((item) => item.id === pepper.id)
        ? pepper
        : discoveryShuffle(eligibleLocationPool, seed + 16, unlockedTitles, (item) => cardDiscoveryIdentities({
          id: item.id,
          topic: "peppers",
          title: item.name,
        }))[0];
      const location = locatedPepper.metadata.location;
      const fakePepper = truthful ? locatedPepper : sample(separatedFactLocationPartners(locatedPepper, locationPool), seed + 17);
      const statement = truthful
        ? `${locatedPepper.name} is linked to ${location.label}.`
        : `${locatedPepper.name} is linked to ${fakePepper.metadata.location.label}.`;
      const claimedLocation = truthful ? location : fakePepper.metadata.location;

      return {
        id: `${seed}-fact-pepper-location-${locatedPepper.id}`,
        topic: currentTopic,
        prompt: "True or false?",
        statement,
        image: locatedPepper.image,
        imageAlt: locatedPepper.name,
        imageCredit: locatedPepper.imageCredit,
        answer: truthful ? "True" : "False",
        explanation: `${locatedPepper.name} is linked to ${location.label}. ${pepperHeatExplanation(locatedPepper)}`,
        locations: [location],
        map: {
          claimed: geoChoiceForLocation(claimedLocation),
          actual: geoChoiceForLocation(location),
        },
      };
    }

    const fakeHeat = sample(pool.filter((item) => item.id !== pepper.id && item.heat !== pepper.heat), seed + 13);
    const measuredPool = pool.filter(hasScovilleMeasurement);
    const measuredPepper = hasScovilleMeasurement(pepper) ? pepper : sample(measuredPool, seed + 18);
    const fakeShu = sampleSafe(measuredPool.filter((item) => item.id !== measuredPepper.id && item.shuMax !== measuredPepper.shuMax), measuredPool.filter((item) => item.id !== measuredPepper.id), seed + 14);
    const useMath = hasScovilleMeasurement(pepper) && difficulty > 1 && seedRandom(seed + 14) > 0.5;
    const statement = truthful
      ? useMath
        ? `${pepper.name} can reach about ${formatNumber(pepper.shuMax)} Scoville heat units.`
        : `${pepper.name}'s heat level is ${pepper.heat}.`
      : useMath
        ? `${pepper.name} can reach about ${formatNumber(fakeShu.shuMax)} Scoville heat units.`
        : `${pepper.name}'s heat level is ${fakeHeat.heat}.`;
    return {
      id: `${seed}-fact-pepper-${pepper.id}`,
      topic: currentTopic,
      prompt: "True or false?",
      statement,
      image: pepper.image,
      imageAlt: pepper.name,
      imageCredit: pepper.imageCredit,
      answer: truthful ? "True" : "False",
      explanation: pepperHeatExplanation(pepper),
    };
  }

  if (currentTopic === "buildings") {
    const pool = preferredPool(buildings, difficulty);
    const requestedFactType = difficulty === 1 ? sample(["city", "location"] as const, seed + 17) : sample(["city", "location", "height", "status"] as const, seed + 17);
    const locationLabel = (item: Building) => item.metadata.location?.label ?? `${item.city}, ${item.country}`;
    const falseLocationPartners = (item: Building) => pool.filter((candidate) =>
      candidate.id !== item.id
      && candidate.city !== item.city
      && hasLocationMetadata(item)
      && hasLocationMetadata(candidate)
      && geoLocationsAreSeparatedForFact(item.metadata.location, candidate.metadata.location));
    const falseLocationBuildings = pool.filter((item) => falseLocationPartners(item).length > 0);
    const locationFact = requestedFactType === "city" || requestedFactType === "location";
    const factType = !truthful && locationFact && !falseLocationBuildings.length ? "height" : requestedFactType;
    const building = sample(!truthful && locationFact && falseLocationBuildings.length ? falseLocationBuildings : pool, seed + 15);
    const buildingLocationLabel = locationLabel(building);
    const separatedLocationCandidates = falseLocationPartners(building);
    const fakeCity = factType === "city" && !truthful
      ? sample(separatedLocationCandidates, seed + 16)
      : sampleSafe(pool.filter((item) => item.id !== building.id && item.city !== building.city), pool.filter((item) => item.id !== building.id), seed + 16);
    const fakeLocation = factType === "location" && !truthful
      ? sample(separatedLocationCandidates.filter((item) => locationLabel(item) !== buildingLocationLabel), seed + 19)
      : sampleSafe(pool.filter((item) => item.id !== building.id && locationLabel(item) !== buildingLocationLabel), pool.filter((item) => item.id !== building.id), seed + 19);
    const fakeHeight = sampleSafe(pool.filter((item) => item.id !== building.id && item.heightFt !== building.heightFt), pool.filter((item) => item.id !== building.id), seed + 18);
    const statement = truthful
      ? factType === "height"
        ? `${buildingHeightSentence(building)}.`
        : factType === "status"
          ? `${building.name} is ${buildingStatusLabel(building)}.`
          : factType === "location"
            ? `${building.name} is in ${buildingLocationLabel}.`
          : `${building.name} is in ${building.city}.`
      : factType === "height"
        ? `${building.name} is ${feet(fakeHeight.heightFt)} tall.`
        : factType === "status"
          ? `${building.name} is ${buildingFalseStatusLabel(building)}.`
          : factType === "location"
            ? `${building.name} is in ${locationLabel(fakeLocation)}.`
          : `${building.name} is in ${fakeCity.city}.`;
    const claimedBuilding = truthful ? building : factType === "location" ? fakeLocation : fakeCity;
    const claimedLocation = claimedBuilding.metadata?.location;
    const actualLocation = building.metadata?.location;
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
      locations: actualLocation ? [actualLocation] : undefined,
      map: (factType === "city" || factType === "location") && claimedLocation && actualLocation
        ? {
            claimed: geoChoiceForLocation(claimedLocation),
            actual: geoChoiceForLocation(actualLocation),
          }
        : undefined,
    };
  }

  if (currentTopic === "space") {
    const pool = preferredPool(spaceCards, difficulty);
    const space = sample(pool, seed + 18);
    const factType = difficulty === 1 ? "group" : sample(["group", "fact", "temperature", "distance"] as const, seed + 20);
    const realTemperature = space.surfaceTempK ?? space.meanSurfaceTempF;
    const realDistance = space.distanceFromSunMillionMiles ?? space.distanceLightYears;
    const fakeGroup = sampleSafe(pool.filter((item) => item.id !== space.id && item.group !== space.group), pool.filter((item) => item.id !== space.id), seed + 19);
    const fakeFact = sample(pool.filter((item) => item.id !== space.id), seed + 21);
    const fakeTemperatureCard = sampleSafe(
      pool.filter((item) => {
        const value = item.surfaceTempK ?? item.meanSurfaceTempF;
        return item.id !== space.id && value !== undefined && value !== realTemperature;
      }),
      pool.filter((item) => item.id !== space.id),
      seed + 22,
    );
    const fakeDistanceCard = sampleSafe(
      pool.filter((item) => {
        const value = item.distanceFromSunMillionMiles ?? item.distanceLightYears;
        return item.id !== space.id && value !== undefined && value !== realDistance;
      }),
      pool.filter((item) => item.id !== space.id),
      seed + 23,
    );
    const fakeTemperature = fakeTemperatureCard.surfaceTempK ?? fakeTemperatureCard.meanSurfaceTempF;
    const fakeDistance = fakeDistanceCard.distanceFromSunMillionMiles ?? fakeDistanceCard.distanceLightYears;
    const statement = truthful
      ? factType === "temperature" && realTemperature !== undefined
        ? `${space.name} has a listed temperature of about ${spaceMetricProse(space, "temperature")}.`
        : factType === "distance" && realDistance !== undefined
          ? `${space.name} has a listed distance of about ${spaceMetricProse(space, "distance")}.`
          : factType === "fact"
            ? space.fact
            : `${space.name} belongs to the ${space.group} group.`
      : factType === "temperature" && fakeTemperature !== undefined
        ? `${space.name} has a listed temperature of about ${spaceMetricProse(fakeTemperatureCard, "temperature")}.`
        : factType === "distance" && fakeDistance !== undefined
          ? `${space.name} has a listed distance of about ${spaceMetricProse(fakeDistanceCard, "distance")}.`
          : factType === "fact"
            ? fakeFact.fact
            : `${space.name} belongs to the ${fakeGroup.group} group.`;
    return {
      id: `${seed}-fact-space-${space.id}`,
      topic: currentTopic,
      prompt: "True or false?",
      statement,
      image: space.image,
      imageAlt: space.name,
      imageCredit: space.imageCredit,
      answer: truthful ? "True" : "False",
      explanation: `${space.name} is the subject of the statement. ${space.fact}`,
    };
  }

  if (currentTopic === "jets") {
    const pool = preferredPool(jets, difficulty);
    const requestedFactType = difficulty === 1 ? "category" : sample(["category", "speed", "range", "country"] as const, seed + 20);
    const falseCountryPartners = (item: Jet) => pool.filter((candidate) =>
      candidate.id !== item.id
      && candidate.country !== item.country
      && geoLocationsAreSeparatedForFact(jetWorldLocation(item), jetWorldLocation(candidate)));
    const falseCountryJets = pool.filter((item) => falseCountryPartners(item).length > 0);
    const factType = !truthful && requestedFactType === "country" && !falseCountryJets.length ? "category" : requestedFactType;
    const jet = sample(!truthful && factType === "country" ? falseCountryJets : pool, seed + 18);
    const fakeCategory = sampleSafe(pool.filter((item) => item.id !== jet.id && item.category !== jet.category), pool.filter((item) => item.id !== jet.id), seed + 19);
    const fakeSpeed = sampleSafe(pool.filter((item) => item.id !== jet.id && item.maxSpeedMph !== jet.maxSpeedMph), pool.filter((item) => item.id !== jet.id), seed + 21);
    const fakeRange = sampleSafe(pool.filter((item) => item.id !== jet.id && item.rangeMiles !== jet.rangeMiles), pool.filter((item) => item.id !== jet.id), seed + 22);
    const fakeCountry = factType === "country" && !truthful
      ? sample(falseCountryPartners(jet), seed + 23)
      : sampleSafe(pool.filter((item) => item.id !== jet.id && item.country !== jet.country), pool.filter((item) => item.id !== jet.id), seed + 23);
    const actualLocation = jetWorldLocation(jet);
    const claimedLocation = truthful ? actualLocation : jetWorldLocation(fakeCountry);
    const statement = truthful
      ? factType === "speed"
        ? `${jet.name} can reach about ${formatNumber(jet.maxSpeedMph)} mph.`
        : factType === "range"
          ? `${jet.name} has a range of about ${formatNumber(jet.rangeMiles)} miles.`
          : factType === "country"
            ? `${jet.name} is from ${jetCountryInProse(jet.country)}.`
            : `${jet.name} is ${jetCategoryWithArticle(jet.category)}.`
      : factType === "speed"
        ? `${jet.name} can reach about ${formatNumber(fakeSpeed.maxSpeedMph)} mph.`
        : factType === "range"
          ? `${jet.name} has a range of about ${formatNumber(fakeRange.rangeMiles)} miles.`
          : factType === "country"
            ? `${jet.name} is from ${jetCountryInProse(fakeCountry.country)}.`
            : `${jet.name} is ${jetCategoryWithArticle(fakeCategory.category)}.`;
    return {
      id: `${seed}-fact-jet-${jet.id}`,
      topic: currentTopic,
      prompt: "True or false?",
      statement,
      image: jet.image,
      imageAlt: jet.name,
      imageCredit: jet.imageCredit,
      answer: truthful ? "True" : "False",
      explanation: `${jet.name} is ${jetCategoryWithArticle(jet.category)} from ${jetCountryInProse(jet.country)}. It reaches about ${formatNumber(jet.maxSpeedMph)} mph and has a range of about ${formatNumber(jet.rangeMiles)} miles.`,
      locations: factType === "country" ? [actualLocation] : undefined,
      map: factType === "country"
        ? {
            claimed: geoChoiceForLocation(claimedLocation),
            actual: geoChoiceForLocation(actualLocation),
          }
        : undefined,
    };
  }

  const pool = preferredPool(sharks, difficulty);
  const shark = sample(pool, seed + 18);
  const factType = difficulty === 1 ? "family" : sample(["family", "speed", "size", "diet"] as const, seed + 20);
  const fakeFamily = sampleSafe(pool.filter((item) => item.id !== shark.id && item.family !== shark.family), pool.filter((item) => item.id !== shark.id), seed + 19);
  const fakeSpeed = sampleSafe(pool.filter((item) => item.id !== shark.id && item.speedMph !== shark.speedMph), pool.filter((item) => item.id !== shark.id), seed + 21);
  const fakeSize = sampleSafe(pool.filter((item) => item.id !== shark.id && item.lengthFt !== shark.lengthFt), pool.filter((item) => item.id !== shark.id), seed + 22);
  const fakeDiet = sampleSafe(pool.filter((item) => item.id !== shark.id && item.diet !== shark.diet), pool.filter((item) => item.id !== shark.id), seed + 23);
  const statement = truthful
    ? factType === "speed"
      ? `${shark.name} can swim about ${formatNumber(shark.speedMph)} mph.`
      : factType === "size"
        ? `${shark.name} can grow to about ${feet(shark.lengthFt)}.`
        : factType === "diet"
          ? `${shark.name} eats ${shark.diet}.`
          : `${shark.name} belongs to the ${shark.family} family.`
    : factType === "speed"
      ? `${shark.name} can swim about ${formatNumber(fakeSpeed.speedMph)} mph.`
      : factType === "size"
        ? `${shark.name} can grow to about ${feet(fakeSize.lengthFt)}.`
        : factType === "diet"
          ? `${shark.name} eats ${fakeDiet.diet}.`
          : `${shark.name} belongs to the ${fakeFamily.family} family.`;
  return {
    id: `${seed}-fact-shark-${shark.id}`,
    topic: currentTopic,
    prompt: "True or false?",
    statement,
    image: shark.image,
    imageAlt: shark.name,
    imageCredit: shark.imageCredit,
    answer: truthful ? "True" : "False",
    explanation: `${shark.name} belongs to the ${shark.family} family, can grow to about ${feet(shark.lengthFt)}, and eats ${shark.diet}.`,
  };
};
