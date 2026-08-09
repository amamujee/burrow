import type { GameMode } from "./game-modes";
import type { CardMetadata } from "./card-metadata";

export type PackStat = {
  id: string;
  label: string;
  value: number;
  unit: string;
  display?: string;
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
  tags?: string[];
  metadata?: CardMetadata;
  readingPrompts?: string[];
};

export type PackSource = {
  label: string;
  url: string;
  note?: string;
};

export type PackLanding = {
  title?: string;
  detail: string;
  image: string;
  imageFit?: "cover" | "contain";
  order: number;
};

export type Pack = {
  id: string;
  title: string;
  summary: string;
  dataNote?: string;
  status?: "draft" | "needs-review" | "playable";
  audience: {
    minAge: number;
    maxAge: number;
    readingLevel?: string;
  };
  recommendedModes?: Exclude<GameMode, "mix">[];
  landing?: PackLanding;
  sources: PackSource[];
  cards: PackCard[];
};
