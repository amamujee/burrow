export type TopicPerformance = { correct: number; answered: number };

export const adaptiveTopicWeight = (stats: TopicPerformance = { correct: 0, answered: 0 }) => {
  const accuracy = stats.answered ? stats.correct / stats.answered : 0;
  return stats.answered < 3 ? 2 : accuracy < 0.62 ? 3 : accuracy < 0.78 ? 2 : 1;
};

export const weightTopicsForAccuracy = (
  topics: readonly string[],
  topicStats: Readonly<Record<string, TopicPerformance>>,
) => topics.flatMap((topic) => Array.from(
  { length: adaptiveTopicWeight(topicStats[topic]) },
  () => topic,
));
