export type DiscoverableCard = {
  id: string;
  topic: string;
  title: string;
  imageAlt?: string;
};

export const cardUnlockKey = (topic: string, id: string) => `${topic}:${id}`;

const legacyCardTitles: Record<string, readonly string[]> = {
  "sharks:sawshark": ["Sawshark"],
  "sharks:zambezi-shark": ["Zambezi Shark"],
  "tall-trees:betws-y-coed-douglas-fir": ["Betws-y-Coed Douglas Fir"],
  "tall-trees:hyperion": ["Hyperion"],
  "tall-trees:ravens-tower-sitka-spruce": ["Raven's Tower Sitka Spruce"],
  "tall-trees:menara-yellow-meranti": ["Menara Yellow Meranti"],
};

export const cardDiscoveryIdentities = (card: DiscoverableCard) => [
  cardUnlockKey(card.topic, card.id),
  card.title,
  ...(legacyCardTitles[cardUnlockKey(card.topic, card.id)] ?? []),
];

export const isCardUnlocked = (unlockedCards: readonly string[] | ReadonlySet<string>, card: DiscoverableCard) => {
  const unlocked = unlockedCards instanceof Set ? unlockedCards : new Set(unlockedCards);
  return cardDiscoveryIdentities(card).some((identity) => unlocked.has(identity));
};

export const cardUnlockKeysForSubjects = (
  cards: readonly DiscoverableCard[],
  topic: string,
  subjects: readonly string[],
) => {
  const subjectSet = new Set(subjects);
  return cards
    .filter((card) => card.topic === topic && (subjectSet.has(card.title) || Boolean(card.imageAlt && subjectSet.has(card.imageAlt))))
    .map((card) => cardUnlockKey(card.topic, card.id));
};
