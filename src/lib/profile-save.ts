import type { Difficulty } from "./game-data";
import type { GameMode, KnowledgeTopic, RoundTopic } from "./game-modes";
import type { LearningExposure } from "./learning-variety";

export type Progress = {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  sessions: number;
  correct: number;
  answered: number;
  challengeMilestone: number;
  difficulty: Difficulty;
  seenIds: string[];
  learningHistory: LearningExposure[];
  unlockedCards: string[];
  topicWins: Record<KnowledgeTopic, number>;
  topicStats: Record<string, { correct: number; answered: number }>;
  modeWins: Record<GameMode, number>;
  modeStats: Record<Exclude<GameMode, "mix">, { correct: number; answered: number; collected: number }>;
};

export type LearnerProfile = {
  id: string;
  name: string;
  interests: RoundTopic[];
  progress: Progress;
};

export type ProfilesState = {
  activeProfileId: string;
  profiles: LearnerProfile[];
  knownTopics: RoundTopic[];
};

export type ProfileSave = {
  format: "burrow-save";
  version: 1;
  exportedAt: string;
  profilesState: ProfilesState;
};

export const profilesKey = "burrow-profiles-v1";
export const maxSaveBytes = 5 * 1024 * 1024;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isTextList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isText);
const isCountMap = (value: unknown) => isRecord(value) && Object.values(value).every(isCount);
const isStatsMap = (value: unknown, collected: boolean) => isRecord(value) && Object.values(value).every((stats) =>
  isRecord(stats) && isCount(stats.correct) && isCount(stats.answered) && stats.correct <= stats.answered
  && (!collected || isCount(stats.collected)),
);
const isExposure = (value: unknown) => isRecord(value)
  && [value.exactKey, value.conceptKey, value.mode, value.topic].every(isText)
  && isTextList(value.subjectKeys)
  && typeof value.sequence === "number" && Number.isSafeInteger(value.sequence)
  && ["correct", "incorrect", "skip", "tie", "scheduled"].includes(value.outcome as string);

const isProgress = (value: unknown): value is Progress => isRecord(value)
  && ["xp", "level", "streak", "bestStreak", "sessions", "correct", "answered", "challengeMilestone"].every((key) => isCount(value[key]))
  && (value.level as number) >= 1
  && (value.correct as number) <= (value.answered as number)
  && [1, 2, 3].includes(value.difficulty as number)
  && isTextList(value.seenIds) && isTextList(value.unlockedCards)
  && Array.isArray(value.learningHistory) && value.learningHistory.every(isExposure)
  && isCountMap(value.topicWins) && isCountMap(value.modeWins)
  && isStatsMap(value.topicStats, false) && isStatsMap(value.modeStats, true);

const isProfile = (value: unknown): value is LearnerProfile => isRecord(value)
  && isText(value.id) && isText(value.name) && value.name.length <= 18
  && isTextList(value.interests) && value.interests.length > 0
  && isProgress(value.progress);

export function parseProfileSave(contents: string): ProfileSave {
  if (new Blob([contents]).size > maxSaveBytes) throw new Error("This file is too large. Choose a Burrow save smaller than 5 MB.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents, (key, value: unknown) => {
      if (["__proto__", "constructor", "prototype"].includes(key)) throw new Error("Unsafe key");
      return value;
    });
  } catch {
    throw new Error("This file could not be read. Choose a save exported from Burrow.");
  }
  if (!isRecord(parsed) || parsed.format !== "burrow-save") throw new Error("This is not a Burrow save. Choose a file made with Export save.");
  if (parsed.version !== 1) throw new Error("This save format is not supported. Update Burrow on this device and try again.");
  const state = parsed.profilesState;
  if (
    !isText(parsed.exportedAt) || !Number.isFinite(Date.parse(parsed.exportedAt))
    || !isRecord(state) || !isText(state.activeProfileId) || !isTextList(state.knownTopics)
    || !Array.isArray(state.profiles) || !state.profiles.length || !state.profiles.every(isProfile)
    || new Set(state.profiles.map((profile) => profile.id)).size !== state.profiles.length
    || !state.profiles.some((profile) => profile.id === state.activeProfileId)
  ) throw new Error("This save is incomplete or damaged. Export it again from the original device.");
  return parsed as ProfileSave;
}

export function createProfileSave(profilesState: ProfilesState): File {
  const exportedAt = new Date().toISOString();
  const contents = JSON.stringify({ format: "burrow-save", version: 1, exportedAt, profilesState });
  // Only offer files that this importer can restore without dropping progress.
  parseProfileSave(contents);
  return new File([contents], `burrow-save-${exportedAt.replace(/[:.]/g, "-")}.json`, { type: "application/json" });
}
