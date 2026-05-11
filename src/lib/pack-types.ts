import type { GameMode } from "./game-modes";

export type PackStat = {
  id: string;
  label: string;
  value: number;
  unit: string;
  direction?: "higher" | "lower";
  note?: string;
};

export type PackCard = {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  imageSourceUrl: string;
  fact: string;
  stats: PackStat[];
  categories: string[];
  readingPrompts?: string[];
};

export type PackSource = {
  label: string;
  url: string;
  note?: string;
};

export type Pack = {
  id: string;
  title: string;
  summary: string;
  status?: "draft" | "needs-review" | "playable";
  audience: {
    minAge: number;
    maxAge: number;
    readingLevel?: string;
  };
  recommendedModes?: Exclude<GameMode, "mix">[];
  sources: PackSource[];
  cards: PackCard[];
};
