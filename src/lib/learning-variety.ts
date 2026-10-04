export type LearningOutcome = "correct" | "incorrect" | "skip" | "tie" | "scheduled";

export type LearningIdentity = {
  exactKey: string;
  conceptKey: string;
  subjectKeys: string[];
};

export type LearningExposure = LearningIdentity & {
  mode: string;
  topic: string;
  outcome: LearningOutcome;
  sequence: number;
};

export type LearningSummary = {
  practicedConcepts: number;
  strongConcepts: number;
  reviewConcepts: number;
};

const compact = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

export const learningSubjectKey = (topic: string, title: string) => `${compact(topic)}:${compact(title)}`;

export const learningIdentity = ({
  exactKey,
  conceptKey,
  topic,
  subjects,
}: {
  exactKey: string;
  conceptKey: string;
  topic: string;
  subjects: readonly string[];
}): LearningIdentity => ({
  exactKey,
  conceptKey: `${compact(topic)}:${compact(conceptKey)}`,
  subjectKeys: Array.from(new Set(subjects.map((subject) => learningSubjectKey(topic, subject)))),
});

const firstIndex = (history: readonly LearningExposure[], matches: (entry: LearningExposure) => boolean) =>
  history.findIndex(matches);

export const learningVarietyScore = (identity: LearningIdentity, history: readonly LearningExposure[]) => {
  const exactGap = firstIndex(history, (entry) => entry.exactKey === identity.exactKey);
  const conceptGap = firstIndex(history, (entry) => entry.conceptKey === identity.conceptKey);
  const subjectGap = firstIndex(history, (entry) => entry.subjectKeys.some((key) => identity.subjectKeys.includes(key)));
  const latestConcept = conceptGap >= 0 ? history[conceptGap] : undefined;
  const latestSequence = history.find((entry) => entry.outcome !== "scheduled")?.sequence ?? 0;
  const scheduledCount = history.filter((entry) => entry.outcome === "scheduled").length;
  // Reserve one turn in five for due review. Repeated skips must not trap a
  // player in a small loop that prevents new subjects from appearing.
  const reviewTurn = (latestSequence + scheduledCount) % 5 === 3;
  const needsReview = reviewTurn && (latestConcept?.outcome === "incorrect" || latestConcept?.outcome === "skip");

  let score = 0;

  // Exact presentations should feel genuinely fresh, not merely reshuffled.
  if (exactGap < 0) score += 1600;
  else if (needsReview && exactGap >= 16) score += 2200;
  else if (exactGap < 80) score -= 12000 - exactGap * 80;
  else score += Math.min(500, exactGap * 3);

  // Keep the same picture or main subject from bouncing back immediately.
  if (subjectGap < 0) score += 650;
  else if (subjectGap < 4) score -= (5 - subjectGap) * 1300;
  else score += Math.min(420, subjectGap * 24);

  // Revisit concepts deliberately. Missed or skipped concepts become attractive
  // after a short gap, preferably through a different exact presentation.
  if (conceptGap < 0) {
    score += 850;
  } else if (conceptGap < 5) {
    score -= (6 - conceptGap) * 360;
  } else if (needsReview) {
    score += 1600 - Math.min(200, Math.abs(8 - conceptGap) * 60);
  } else {
    score += Math.min(360, conceptGap * 18);
  }

  return score;
};

export const chooseVariedCandidate = <T,>(
  candidates: readonly T[],
  identityFor: (candidate: T) => LearningIdentity,
  history: readonly LearningExposure[],
): T => {
  if (!candidates.length) throw new Error("Need at least one learning candidate");

  return candidates
    .map((candidate, index) => ({
      candidate,
      index,
      score: learningVarietyScore(identityFor(candidate), history),
    }))
    .sort((first, second) => second.score - first.score || first.index - second.index)[0].candidate;
};

export const scheduleVariedSequence = <T,>(
  candidateRuns: readonly (readonly T[])[],
  identityFor: (candidate: T) => LearningIdentity,
  history: readonly LearningExposure[],
): T[] => {
  const length = candidateRuns[0]?.length ?? 0;
  const virtualHistory = [...history];
  const scheduled: T[] = [];

  for (let index = 0; index < length; index += 1) {
    const candidates = candidateRuns.map((run) => run[index]).filter((candidate): candidate is T => candidate !== undefined);
    const candidate = chooseVariedCandidate(candidates, identityFor, virtualHistory);
    const identity = identityFor(candidate);
    scheduled.push(candidate);
    virtualHistory.unshift({
      ...identity,
      mode: "scheduled",
      topic: identity.conceptKey.split(":")[0] ?? "mixed",
      outcome: "scheduled",
      sequence: -(index + 1),
    });
  }

  return scheduled;
};

export const addLearningExposure = (
  history: readonly LearningExposure[],
  identity: LearningIdentity,
  details: { mode: string; topic: string; outcome: Exclude<LearningOutcome, "scheduled"> },
  limit = 240,
): LearningExposure[] => {
  const sequence = (history[0]?.sequence ?? 0) + 1;
  const next = [{ ...identity, ...details, sequence }, ...history];
  // Keep the recent presentation window, then two meaningful results per
  // concept. Misses and established strengths survive long play sessions.
  const keptByConcept = new Map<string, number>();
  return next.filter((entry, index) => {
    const meaningful = entry.outcome === "correct" || entry.outcome === "incorrect" || entry.outcome === "skip";
    const count = keptByConcept.get(entry.conceptKey) ?? 0;
    if (meaningful) keptByConcept.set(entry.conceptKey, count + 1);
    return index < limit || (meaningful && count < 2);
  });
};

export const summarizeLearningHistory = (history: readonly LearningExposure[]): LearningSummary => {
  const latestByConcept = new Map<string, LearningExposure>();
  const correctCounts = new Map<string, number>();

  for (const exposure of history) {
    if (exposure.outcome === "scheduled" || exposure.outcome === "tie") continue;
    if (!latestByConcept.has(exposure.conceptKey)) {
      latestByConcept.set(exposure.conceptKey, exposure);
    }
    if (exposure.outcome === "correct") {
      correctCounts.set(exposure.conceptKey, (correctCounts.get(exposure.conceptKey) ?? 0) + 1);
    }
  }

  let strongConcepts = 0;
  let reviewConcepts = 0;
  for (const [conceptKey, latest] of latestByConcept) {
    if (latest.outcome === "incorrect" || latest.outcome === "skip") reviewConcepts += 1;
    else if (latest.outcome === "correct" && (correctCounts.get(conceptKey) ?? 0) >= 2) strongConcepts += 1;
  }

  return {
    practicedConcepts: latestByConcept.size,
    strongConcepts,
    reviewConcepts,
  };
};
