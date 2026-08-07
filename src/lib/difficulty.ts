import type { Difficulty } from "./game-data";

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
