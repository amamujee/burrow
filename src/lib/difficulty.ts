import type { Difficulty } from "./game-data";

// A selected difficulty is a ceiling, not an exclusive question tier. This
// keeps Hard varied and lets familiar recognition questions continue to appear
// alongside advanced prompts while the selected card pool remains unchanged.
export const questionDepthForSelection = (selected: Difficulty, seed: number): Difficulty => {
  if (selected === 1) return 1;
  const slot = Math.abs(Math.trunc(seed)) % 10;
  if (selected === 2) return slot < 3 ? 1 : 2;
  if (slot < 2) return 1;
  if (slot < 5) return 2;
  return 3;
};

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
