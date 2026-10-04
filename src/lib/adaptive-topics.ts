import type { LearningExposure } from "./learning-variety";

export type TopicPerformance = { correct: number; answered: number };

export const recentTopicStats = (history: readonly LearningExposure[], window = 20) => {
  const stats: Record<string, TopicPerformance> = {};
  for (const exposure of history) {
    if (exposure.outcome !== "correct" && exposure.outcome !== "incorrect") continue;
    const topic = stats[exposure.topic] ??= { correct: 0, answered: 0 };
    if (topic.answered >= window) continue;
    topic.answered += 1;
    topic.correct += exposure.outcome === "correct" ? 1 : 0;
  }
  return stats;
};

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
