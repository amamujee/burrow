import type { CardMetadata } from "./card-metadata";

export type DifficultyLevel = 1 | 2 | 3;

const familiarIds = new Set([
  "bell-pepper",
  "banana-pepper",
  "poblano",
  "jalapeno",
  "habanero",
  "ghost-pepper",
  "carolina-reaper",
  "burj-khalifa",
  "empire-state",
  "one-wtc",
  "willis-tower",
  "petronas-towers",
  "taipei-101",
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
  const ratio = difficulty === 1 ? 0.45 : 0.72;
  const floor = difficulty === 1 ? 10 : 16;
  return Math.min(length, Math.max(floor, Math.ceil(length * ratio)));
};

const bandScore = (metadata?: CardMetadata) => {
  if (metadata?.difficultyBand === "easy") return -1200;
  if (metadata?.difficultyBand === "hard") return 1200;
  return 0;
};

const recognitionScore = (metadata?: CardMetadata) => metadata?.recognition ? (5 - metadata.recognition) * 80 : 0;

export const sortByFamiliarity = <T extends { id: string; metadata?: CardMetadata; tags?: string[] }>(items: readonly T[]) =>
  [...items].sort((a, b) => {
    const aScore = bandScore(a.metadata) + recognitionScore(a.metadata) + (a.tags?.includes("popular") ? -500 : 0) + (familiarIds.has(a.id) ? -1000 : 0) + (advancedIds.has(a.id) ? 1000 : 0);
    const bScore = bandScore(b.metadata) + recognitionScore(b.metadata) + (b.tags?.includes("popular") ? -500 : 0) + (familiarIds.has(b.id) ? -1000 : 0) + (advancedIds.has(b.id) ? 1000 : 0);
    return aScore - bScore;
  });

export const poolForDifficulty = <T extends { id: string; metadata?: CardMetadata; tags?: string[] }>(items: readonly T[], difficulty: DifficultyLevel) => {
  if (difficulty === 3) return [...items];
  const sorted = sortByFamiliarity(items);
  return sorted.slice(0, targetCount(sorted.length, difficulty));
};
