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

export const sample = <T,>(items: readonly T[], seed: number) => items[Math.floor(seedRandom(seed) * items.length) % items.length];

export const sampleSafe = <T,>(items: readonly T[], fallback: readonly T[], seed: number) => sample(items.length ? items : fallback, seed);
