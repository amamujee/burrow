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
  unlockedCards: readonly string[] = [],
  identitiesFor: (item: T) => string | readonly string[],
) => {
  const shuffled = shuffle(items, seed);
  if (!unlockedCards.length) return shuffled;

  const unlocked = new Set(unlockedCards);
  const isUnlocked = (item: T) => {
    const identities = identitiesFor(item);
    return (typeof identities === "string" ? [identities] : identities).some((identity) => unlocked.has(identity));
  };
  const unseen = shuffled.filter((item) => !isUnlocked(item));
  if (!unseen.length || unseen.length === shuffled.length || seedRandom(seed + 7919) >= 0.7) return shuffled;

  const seen = shuffled.filter(isUnlocked);
  return [...unseen, ...seen];
};

export const sample = <T,>(items: readonly T[], seed: number) => items[Math.floor(seedRandom(seed) * items.length) % items.length];

export const sampleSafe = <T,>(items: readonly T[], fallback: readonly T[], seed: number) => sample(items.length ? items : fallback, seed);
