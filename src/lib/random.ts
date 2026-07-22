export const seedRandom = (seed: number) => {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
};

export const shuffle = <T,>(items: readonly T[], seed: number) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seedRandom(seed + i) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const discoveryShuffle = <T,>(
  items: readonly T[],
  seed: number,
  unlockedTitles: readonly string[] = [],
  titleFor: (item: T) => string,
) => {
  const shuffled = shuffle(items, seed);
  if (!unlockedTitles.length) return shuffled;

  const unlocked = new Set(unlockedTitles);
  const unseen = shuffled.filter((item) => !unlocked.has(titleFor(item)));
  if (!unseen.length || unseen.length === shuffled.length || seedRandom(seed + 7919) >= 0.7) return shuffled;

  const seen = shuffled.filter((item) => unlocked.has(titleFor(item)));
  return [...unseen, ...seen];
};

export const sample = <T,>(items: readonly T[], seed: number) => items[Math.floor(seedRandom(seed) * items.length) % items.length];

export const sampleSafe = <T,>(items: readonly T[], fallback: readonly T[], seed: number) => sample(items.length ? items : fallback, seed);
