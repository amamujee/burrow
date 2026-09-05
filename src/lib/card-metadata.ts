export type CardDifficultyBand = "easy" | "medium" | "hard";

// Rarity is relative within each collectible topic. Familiar or widely available
// subjects should stay Common; higher tiers are reserved for increasingly
// distinctive, limited, record-setting, or otherwise exceptional cards. Heat,
// size, speed, or power alone does not determine rarity.
export const cardRarities = ["common", "uncommon", "rare", "epic"] as const;
export type CardRarity = (typeof cardRarities)[number];

export const cardRarityLabels: Record<CardRarity, "Common" | "Uncommon" | "Rare" | "Epic"> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
};

export const cardRarityTier = (rarity: CardRarity) => cardRarities.indexOf(rarity) + 1;

export type WorldContinent = "Africa" | "Antarctica" | "Asia" | "Europe" | "North America" | "South America" | "Oceania";

export type WorldLocation = {
  label: string;
  countries: string[];
  continents: WorldContinent[];
  coordinates?: readonly [latitude: number, longitude: number];
  states?: string[];
};

export type CardSource = {
  label: string;
  url: string;
  note?: string;
};

export type CardMetadata = {
  difficultyBand?: CardDifficultyBand;
  recognition?: 1 | 2 | 3 | 4 | 5;
  rarity?: CardRarity;
  flavorGrade?: "A" | "B" | "C" | "D";
  pepperTypes?: string[];
  taxonomyGroup?: string;
  accuracyNote?: string;
  // Factual references, separate from the photograph's license/source.
  sources?: CardSource[];
  imageDistinctGroup?: string;
  location?: WorldLocation;
};

export const worldLocationDisplay = (location: WorldLocation) =>
  `${location.label} · ${location.continents.join("/")}`;
