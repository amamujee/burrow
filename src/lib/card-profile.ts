export type CardProfileDetail = {
  label: string;
  value: string;
};

export type CardProfileSummary = {
  title: string;
  statLabel: string;
  statDisplay: string;
  subStat: string;
  details?: readonly CardProfileDetail[];
};

const normalizedProfileText = (value: string) => value
  .toLocaleLowerCase("en-US")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const containsWholePhrase = (whole: string, phrase: string) => phrase.length >= 4
  && ` ${whole} `.includes(` ${phrase} `);

const repeatsHeadline = (card: CardProfileSummary, detail: CardProfileDetail) => {
  const label = normalizedProfileText(detail.label);
  const value = normalizedProfileText(detail.value);
  const statLabel = normalizedProfileText(card.statLabel);
  const statDisplay = normalizedProfileText(card.statDisplay);
  const title = normalizedProfileText(card.title);
  const subStat = normalizedProfileText(card.subStat);

  if (label.includes("rarity") || label.includes("scoville")) return true;
  if (label === statLabel || value === statDisplay || value === title) return true;
  return containsWholePhrase(subStat, value);
};

export const collectionCardProfileDetails = (card: CardProfileSummary): CardProfileDetail[] => {
  const seen = new Set<string>();
  return (card.details ?? []).filter((detail) => {
    if (repeatsHeadline(card, detail)) return false;
    const signature = `${normalizedProfileText(detail.label)}:${normalizedProfileText(detail.value)}`;
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
};
