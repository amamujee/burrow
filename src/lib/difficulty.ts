import type { Difficulty } from "./game-data";

// A selected difficulty is a ceiling, not an exclusive question tier. The
// calibrated mix keeps some retrieval practice while making advanced prompts
// more common: Medium is 20/80 Easy/Medium, and Hard is 10/30/60.
export const questionDepthForSelection = (selected: Difficulty, seed: number): Difficulty => {
  if (selected === 1) return 1;
  const slot = Math.abs(Math.trunc(seed)) % 10;
  if (selected === 2) return slot < 2 ? 1 : 2;
  if (slot < 1) return 1;
  if (slot < 4) return 2;
  return 3;
};

const peekRevealProfiles: Record<Difficulty, { totalTiles: number; startReveal: number; intervalMs: number }> = {
  1: { totalTiles: 16, startReveal: 4, intervalMs: 850 },
  2: { totalTiles: 20, startReveal: 2, intervalMs: 1050 },
  3: { totalTiles: 20, startReveal: 1, intervalMs: 1250 },
};

export const peekRevealSettings = (difficulty: Difficulty) => peekRevealProfiles[difficulty];

export const autoDifficulty = (
  current: Difficulty,
  correct: boolean,
  streak: number,
  answered: number,
  correctCount: number,
): Difficulty => {
  const accuracy = answered > 0 ? correctCount / answered : 0;

  if (current === 1 && answered >= 16 && streak >= 6 && accuracy >= 0.75) return 2;
  if (current === 2 && answered >= 45 && streak >= 8 && accuracy >= 0.8) return 3;
  if (!correct && answered >= 12 && accuracy < 0.45 && current > 1) return (current - 1) as Difficulty;
  return current;
};
