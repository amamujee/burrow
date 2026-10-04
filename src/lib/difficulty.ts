import type { Difficulty } from "./game-data";

// A selected difficulty is a ceiling, not an exclusive question tier. The
// calibrated mix keeps some retrieval practice while making advanced prompts
// more common: Medium is 20/80 Easy/Medium, and Hard is 8/20/72. Hard now has
// 20% more advanced prompts than its previous 60% share.
export const questionDepthForSelection = (selected: Difficulty, seed: number): Difficulty => {
  if (selected === 1) return 1;
  const normalizedSeed = Math.abs(Math.trunc(seed));
  if (selected === 2) return normalizedSeed % 10 < 2 ? 1 : 2;
  // Spread the two Easy and five Medium slots through each 25-seed cycle.
  const slot = ((normalizedSeed % 25) * 7) % 25;
  if (slot < 2) return 1;
  if (slot < 7) return 2;
  return 3;
};

const peekRevealProfiles: Record<Difficulty, { totalTiles: number; startReveal: number; intervalMs: number }> = {
  1: { totalTiles: 16, startReveal: 4, intervalMs: 850 },
  2: { totalTiles: 20, startReveal: 2, intervalMs: 1050 },
  3: { totalTiles: 20, startReveal: 1, intervalMs: 1250 },
};

export const peekRevealSettings = (difficulty: Difficulty) => peekRevealProfiles[difficulty];
