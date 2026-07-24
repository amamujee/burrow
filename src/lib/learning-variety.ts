export type LearningOutcome = "correct" | "incorrect" | "skip" | "scheduled";

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

  let score = 0;

  // Exact presentations should feel genuinely fresh, not merely reshuffled.
  if (exactGap < 0) score += 1600;
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
  } else if (latestConcept && latestConcept.outcome !== "correct" && latestConcept.outcome !== "scheduled" && conceptGap <= 12) {
    score += 1100 - Math.abs(8 - conceptGap) * 90;
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
  return [{ ...identity, ...details, sequence }, ...history].slice(0, limit);
};
