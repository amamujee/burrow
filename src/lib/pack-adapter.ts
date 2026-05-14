import type { GenericKnowledgeCard, TopTrumpStat } from "./game-modes";
import type { Pack, PackStat } from "./pack-types";

export type PlayablePackDeck = {
  id: string;
  title: string;
  summary: string;
  eyebrow: string;
  roundLabel: string;
  recommendedModes: NonNullable<Pack["recommendedModes"]>;
  sources: Pack["sources"];
  samples: string[];
  cards: GenericKnowledgeCard[];
};

const formatNumber = (value: number) => value.toLocaleString("en-US");

const statDisplay = (stat: PackStat) => `${formatNumber(stat.value)}${stat.unit ? ` ${stat.unit}` : ""}`;

const toTopTrumpStat = (stat: PackStat): TopTrumpStat => ({
  id: stat.id,
  label: stat.label,
  value: stat.value,
  display: statDisplay(stat),
  direction: stat.direction ?? "higher",
});

export const packToPlayableDeck = (pack: Pack): PlayablePackDeck => {
  const cards = pack.cards
    .filter((card) => card.stats.length)
    .map((card) => {
      const primary = card.stats[0];
      const qualityScore = Math.max(65, Math.min(95, 72 + card.stats.length * 4 + card.categories.length * 2));
      return {
        id: card.id,
        topic: pack.id,
        title: card.name,
        image: card.image,
        imageAlt: card.imageAlt,
        imageCredit: card.imageCredit,
        statLabel: primary.label,
        statValue: primary.value,
        statDisplay: statDisplay(primary),
        subStat: card.categories[0] ?? pack.title,
        fact: card.fact,
        qualityScore,
        qualityFlags: [],
        categories: card.categories,
        tags: card.tags,
        metadata: card.metadata,
        stats: card.stats.map(toTopTrumpStat),
      } satisfies GenericKnowledgeCard;
    });

  return {
    id: pack.id,
    title: pack.title,
    summary: pack.summary,
    eyebrow: `${cards.length} cards`,
    roundLabel: `${pack.title} round`,
    recommendedModes: pack.recommendedModes ?? ["trumps", "sort", "fact", "peek", "number", "odd"],
    sources: pack.sources,
    samples: cards.slice(0, 4).map((card) => card.title),
    cards,
  };
};
