export type CardDifficultyBand = "easy" | "medium" | "hard";

export type CardMetadata = {
  difficultyBand?: CardDifficultyBand;
  recognition?: 1 | 2 | 3 | 4 | 5;
  taxonomyGroup?: string;
  accuracyNote?: string;
  imageDistinctGroup?: string;
};
