const topicsAvailableBeforeAutomaticSelection = [
  "peppers",
  "buildings",
  "sharks",
  "space",
  "jets",
  "dinosaurs",
  "tallest-mountains",
  "tall-trees",
  "bridges-and-tunnels",
] as const;

const uniqueAvailableTopics = (topics: readonly string[] | undefined, availableTopics: readonly string[]) => {
  const available = new Set(availableTopics);
  return Array.from(new Set((topics ?? []).filter((topic) => available.has(topic))));
};

export const migrateTopicSelection = ({
  interests,
  knownTopics,
  availableTopics,
}: {
  interests?: readonly string[];
  knownTopics?: readonly string[];
  availableTopics: readonly string[];
}) => {
  const available = Array.from(new Set(availableTopics));
  const selected = uniqueAvailableTopics(interests ?? available, available);
  const selectedWithFallback = selected.length ? selected : available;
  const legacyKnownTopics = topicsAvailableBeforeAutomaticSelection.filter((topic) => available.includes(topic));
  const known = new Set(uniqueAvailableTopics(knownTopics ?? legacyKnownTopics, available));
  const newlyAvailable = available.filter((topic) => !known.has(topic));

  return {
    interests: Array.from(new Set([...selectedWithFallback, ...newlyAvailable])),
    knownTopics: available,
  };
};
