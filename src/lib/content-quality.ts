export type ContentQuality = {
  score: number;
  flags: string[];
};

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export const scoreFeaturedContent = ({
  image,
  imageCredit,
  imageSourceUrl,
  fact,
  statValue,
  sourceCaution,
}: {
  image: string;
  imageCredit: string;
  imageSourceUrl?: string;
  fact: string;
  statValue?: number;
  sourceCaution?: string;
}): ContentQuality => {
  const flags: string[] = [];
  let score = 30;

  if (image) score += 25;
  else flags.push("missing image");

  if (imageCredit) score += 10;
  else flags.push("missing image credit");

  if (imageSourceUrl) score += 10;
  else flags.push("missing source URL");

  if (fact && fact.length >= 32) score += 15;
  else flags.push("thin fact");

  if (typeof statValue === "number" && Number.isFinite(statValue) && statValue > 0) score += 10;
  else flags.push("weak stat");

  if (sourceCaution) {
    score -= 5;
    flags.push(sourceCaution);
  }

  return {
    score: clampScore(score),
    flags,
  };
};
