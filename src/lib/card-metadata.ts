export type CardDifficultyBand = "easy" | "medium" | "hard";

export type WorldContinent = "Africa" | "Asia" | "Europe" | "North America" | "South America" | "Oceania";

export type WorldLocation = {
  label: string;
  countries: string[];
  continents: WorldContinent[];
};

export type CardMetadata = {
  difficultyBand?: CardDifficultyBand;
  recognition?: 1 | 2 | 3 | 4 | 5;
  taxonomyGroup?: string;
  accuracyNote?: string;
  imageDistinctGroup?: string;
  location?: WorldLocation;
};

export const worldLocationDisplay = (location: WorldLocation) =>
  `${location.label} · ${location.continents.join("/")}`;
