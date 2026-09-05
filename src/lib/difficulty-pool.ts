import type { CardMetadata } from "./card-metadata";

export type DifficultyLevel = 1 | 2 | 3;

// The recalibrated pools expose about 22% more subjects at Easy and Medium.
// Hard continues to use the complete catalog so every card remains playable.
const poolExpansion = 1.22;

const familiarIds = new Set([
  "bell-pepper",
  "banana-pepper",
  "poblano",
  "jalapeno",
  "habanero",
  "ghost-pepper",
  "carolina-reaper",
  "chipotle",
  "pimento",
  "mini-sweet-pepper",
  "italian-long-hot",
  "sport-pepper",
  "sweet-piquante",
  "korean-gochu",
  "puya",
  "morita",
  "chile-japones",
  "burj-khalifa",
  "empire-state",
  "one-wtc",
  "willis-tower",
  "petronas-towers",
  "taipei-101",
  "385-atlantic-avenue",
  "1555-blanford-circle",
  "great-white",
  "whale-shark",
  "tiger-shark",
  "great-hammerhead",
  "shortfin-mako",
  "bull-shark",
  "hammerhead",
  "megalodon",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "sun",
  "moon",
  "black-hole",
  "f-35-lightning-ii",
  "f-22-raptor",
  "f-15-eagle",
  "f-16-fighting-falcon",
  "f-14-tomcat",
  "a-10-thunderbolt-ii",
  "b-2-spirit",
  "b-52-stratofortress",
  "tyrannosaurus-rex",
  "triceratops",
  "stegosaurus",
  "velociraptor",
  "spinosaurus",
  "brachiosaurus",
  "ankylosaurus",
  "brontosaurus",
  "apatosaurus",
  "pterodactylus",
  "pteranodon",
  "mosasaurus",
  "megalodon",
  "woolly-mammoth",
  "smilodon",
  "plesiosaurus",
  "dimetrodon",
  "quetzalcoatlus",
]);

const advancedIds = new Set([
  "the-noah",
  "pepper-y",
  "armageddon",
  "aji-charapita",
  "bishop-crown",
  "trinidad-perfume",
  "madame-jeanette",
  "bank-of-china",
  "lakhta-center",
  "wuhan-greenland-center",
  "porbeagle",
  "longfin-mako",
  "megamouth",
  "frilled-shark",
  "stethacanthus",
  "dunkleosteus",
  "haumea",
  "eris",
  "makemake",
  "valles-marineris",
  "english-electric-lightning",
  "f-ck-1",
  "iai-kfir",
  "hongdu-l-15",
  "deinonychus",
  "edmontosaurus",
  "maiasaura",
  "oviraptor",
  "protoceratops",
  "suchomimus",
  "ceratosaurus",
  "compsognathus",
  "corythosaurus",
  "hadrosaurus",
  "kentrosaurus",
  "lambeosaurus",
  "acrocanthosaurus",
  "albertosaurus",
  "amargasaurus",
]);

const targetCount = (length: number, difficulty: DifficultyLevel) => {
  if (difficulty === 3) return length;
  const ratioPercent = difficulty === 1 ? 55 : 88;
  const floor = difficulty === 1 ? 10 : 16;
  return Math.min(length, Math.max(floor, Math.ceil((length * ratioPercent) / 100)));
};

const bandScore = (metadata?: CardMetadata) => {
  if (metadata?.difficultyBand === "easy") return -1200;
  if (metadata?.difficultyBand === "hard") return 1200;
  return 0;
};

const recognitionScore = (metadata?: CardMetadata) => metadata?.recognition ? (5 - metadata.recognition) * 80 : 0;

const stableIdHash = (id: string) => {
  let hash = 2166136261;
  for (const character of `difficulty-pool:${id}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const sortByFamiliarity = <T extends { id: string; metadata?: CardMetadata; tags?: string[] }>(items: readonly T[]) =>
  [...items].sort((a, b) => {
    const aScore = bandScore(a.metadata) + recognitionScore(a.metadata) + (a.tags?.includes("popular") ? -500 : 0) + (familiarIds.has(a.id) ? -1000 : 0) + (advancedIds.has(a.id) ? 1000 : 0);
    const bScore = bandScore(b.metadata) + recognitionScore(b.metadata) + (b.tags?.includes("popular") ? -500 : 0) + (familiarIds.has(b.id) ? -1000 : 0) + (advancedIds.has(b.id) ? 1000 : 0);
    return aScore - bScore || stableIdHash(a.id) - stableIdHash(b.id) || a.id.localeCompare(b.id);
  });

export const poolForDifficulty = <T extends { id: string; metadata?: CardMetadata; tags?: string[] }>(items: readonly T[], difficulty: DifficultyLevel) => {
  if (difficulty === 3) return [...items];
  const sorted = sortByFamiliarity(items);
  const allowedBands = difficulty === 1 ? new Set(["easy"]) : new Set(["easy", "medium"]);
  const cumulative = sorted.filter((item) => item.metadata?.difficultyBand && allowedBands.has(item.metadata.difficultyBand));
  const minimum = Math.min(10, sorted.length);
  if (cumulative.length < minimum) {
    // A small familiar set may need medium cards for variety; it must not
    // silently pull explicitly hard cards into Easy to meet a numeric quota.
    const eligible = difficulty === 1 ? sorted.filter((item) => item.metadata?.difficultyBand !== "hard") : sorted;
    // An explicitly scoped/imported deck can contain only advanced subjects.
    // Preserve that deck's playability when it cannot supply four choices.
    const usable = eligible.length >= Math.min(4, sorted.length) ? eligible : sorted;
    return usable.slice(0, targetCount(sorted.length, difficulty));
  }

  const nextBand = difficulty === 1 ? "medium" : "hard";
  const target = Math.min(sorted.length, Math.ceil(cumulative.length * poolExpansion));
  const nextBandCards = sorted.filter((item) => item.metadata?.difficultyBand === nextBand);
  return [...cumulative, ...nextBandCards.slice(0, target - cumulative.length)];
};
