"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { heatBands, heatProfiles, topicCatalog, topicIds, topicPacks, type Difficulty, type HeatBand, type TopicId } from "@/lib/game-data";
import {
  buildFactRound,
  buildNumberRound,
  buildOddRound,
  buildRevealRound,
  buildSortRound,
  buildTopTrumpRound,
  collectionCards,
  modeOptions,
  type FactRound,
  type GameMode,
  type KnowledgeCard,
  type KnowledgeTopic,
  type NumberRound,
  type OddRound,
  type RevealRound,
  type SortRound,
  type TopTrumpRound,
  type TopTrumpStat,
  type TopicScope,
} from "@/lib/game-modes";
import { buildHeadToHeadSession, buildSession, type ComparisonCard, type Question } from "@/lib/questions";

type Progress = {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  sessions: number;
  correct: number;
  answered: number;
  difficulty: Difficulty;
  seenIds: string[];
  unlockedCards: string[];
  topicWins: Record<KnowledgeTopic, number>;
  topicStats: Record<KnowledgeTopic, { correct: number; answered: number }>;
  modeWins: Record<GameMode, number>;
};

type LearnerProfile = {
  id: string;
  name: string;
  interests: KnowledgeTopic[];
  progress: Progress;
};

type ProfilesState = {
  activeProfileId: string;
  profiles: LearnerProfile[];
};

type ResultState = {
  correct: boolean;
  xpGain: number;
  leveledUp: boolean;
};

type ContentIssueReport = {
  id: string;
  createdAt: string;
  profileId: string;
  mode: string;
  topic: TopicId | KnowledgeTopic;
  itemId: string;
  questionId?: string;
  questionKind?: Question["kind"];
  title: string;
  prompt: string;
  image?: string;
};

const allKnowledgeTopics: KnowledgeTopic[] = [...topicIds];
const emptyTopicCounts = () => Object.fromEntries(allKnowledgeTopics.map((topic) => [topic, 0])) as Record<KnowledgeTopic, number>;
const emptyTopicStats = () => Object.fromEntries(allKnowledgeTopics.map((topic) => [topic, { correct: 0, answered: 0 }])) as Record<KnowledgeTopic, { correct: number; answered: number }>;

const initialProgress: Progress = {
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  sessions: 0,
  correct: 0,
  answered: 0,
  difficulty: 1,
  seenIds: [],
  unlockedCards: [],
  topicWins: emptyTopicCounts(),
  topicStats: emptyTopicStats(),
  modeWins: { mix: 0, quiz: 0, versus: 0, trumps: 0, sort: 0, fact: 0, peek: 0, number: 0, odd: 0 },
};

const profilesKey = "burrow-profiles-v1";
const legacyProfilesKey = "rabbit-hole-profiles-v1";
const legacyProgressKey = "rabbit-hole-progress-v1";
const contentIssuesKey = "burrow-content-issues-v1";
const difficultyOptions: { id: Difficulty; label: string }[] = [
  { id: 1, label: "Easy" },
  { id: 2, label: "Med" },
  { id: 3, label: "Hard" },
];
const levelFromXp = (xp: number) => Math.max(1, Math.floor(xp / 120) + 1);
const praise = ["Nice reading!", "Big brain move!", "You measured it!", "Hot answer!", "Sky-high thinking!", "Sharp thinking!"];
const tryAgainNotes = ["Good try.", "Almost.", "Nice guess.", "Now you know."];
type ChallengeMode = Exclude<GameMode, "mix">;
const defaultMixPattern: ChallengeMode[] = ["quiz", "peek", "versus", "trumps", "number", "odd", "sort", "fact"];
const selectableModeOptions = modeOptions.filter((item): item is (typeof modeOptions)[number] & { id: ChallengeMode } => item.id !== "mix");
const defaultStarterTopics: KnowledgeTopic[] = ["peppers", "sharks"];
const starterMixModes: ChallengeMode[] = ["quiz"];
const gameTypeLabel = (modeId: ChallengeMode) => modeOptions.find((item) => item.id === modeId)?.label ?? "Game";

const freshProgress = (): Progress => ({
  ...initialProgress,
  topicWins: emptyTopicCounts(),
  topicStats: emptyTopicStats(),
  modeWins: { ...initialProgress.modeWins },
  seenIds: [],
  unlockedCards: [],
});

const normalizeProgress = (progress?: Partial<Progress>): Progress => ({
  ...freshProgress(),
  ...progress,
  topicWins: { ...emptyTopicCounts(), ...progress?.topicWins },
  topicStats: Object.fromEntries(allKnowledgeTopics.map((topic) => [topic, { correct: 0, answered: 0, ...progress?.topicStats?.[topic] }])) as Progress["topicStats"],
  modeWins: { ...initialProgress.modeWins, ...progress?.modeWins },
  seenIds: progress?.seenIds ?? [],
  unlockedCards: progress?.unlockedCards ?? [],
});

const normalizeInterests = (interests?: KnowledgeTopic[]) => {
  const cleaned = (interests ?? defaultStarterTopics).filter((topic): topic is KnowledgeTopic => allKnowledgeTopics.includes(topic as KnowledgeTopic));
  return cleaned.length ? Array.from(new Set(cleaned)) : [...defaultStarterTopics];
};

const defaultProfiles = (legacyProgress?: Partial<Progress>): ProfilesState => ({
  activeProfileId: "player-1",
  profiles: [
    { id: "player-1", name: "Player 1", interests: [...defaultStarterTopics], progress: normalizeProgress(legacyProgress) },
    { id: "player-2", name: "Player 2", interests: [...defaultStarterTopics], progress: freshProgress() },
  ],
});

const loadProfiles = (): ProfilesState => {
  if (typeof window === "undefined") return defaultProfiles();

  const savedProfiles = window.localStorage.getItem(profilesKey) ?? window.localStorage.getItem(legacyProfilesKey);
  if (savedProfiles) {
    try {
      const parsed = JSON.parse(savedProfiles) as Partial<ProfilesState>;
      const profiles = (parsed.profiles ?? []).map((profile, index) => ({
        id: profile.id ?? `profile-${index}`,
        name: profile.name ?? `Player ${index + 1}`,
        interests: normalizeInterests(profile.interests),
        progress: normalizeProgress(profile.progress),
      }));
      if (profiles.length) {
        return {
          activeProfileId: profiles.some((profile) => profile.id === parsed.activeProfileId) ? parsed.activeProfileId ?? profiles[0].id : profiles[0].id,
          profiles,
        };
      }
    } catch {
      // Fall through to legacy progress migration.
    }
  }

  const savedProgress = window.localStorage.getItem(legacyProgressKey);
  if (!savedProgress) return defaultProfiles();
  try {
    return defaultProfiles(JSON.parse(savedProgress) as Partial<Progress>);
  } catch {
    return defaultProfiles();
  }
};

const loadContentIssues = (): ContentIssueReport[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(contentIssuesKey) ?? "[]") as ContentIssueReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const addUnique = (items: string[], additions: string[]) => {
  const next = [...additions.filter(Boolean), ...items];
  return Array.from(new Set(next)).slice(0, 120);
};

const isKnowledgeTopic = (topic: TopicId): topic is KnowledgeTopic => topic !== "mixed";

const playableTopic = (topic: TopicId, interests: KnowledgeTopic[]): TopicId => (isKnowledgeTopic(topic) && !interests.includes(topic) ? "mixed" : topic);

const topicScopeFor = (topic: TopicId, interests: KnowledgeTopic[]): TopicScope => {
  const activeInterests = normalizeInterests(interests);
  return topic === "mixed" ? activeInterests : topic;
};

const adaptiveTopicScopeFor = (topic: TopicId, interests: KnowledgeTopic[], progress: Progress): TopicScope => {
  const baseScope = topicScopeFor(topic, interests);
  if (topic !== "mixed" || typeof baseScope === "string") return baseScope;

  return baseScope.flatMap((item) => {
    const stats = progress.topicStats[item];
    const accuracy = stats.answered ? stats.correct / stats.answered : 0;
    const weight = stats.answered < 3 ? 2 : accuracy < 0.62 ? 3 : accuracy < 0.78 ? 2 : 1;
    return Array.from({ length: weight }, () => item);
  });
};

const buildQuestionRun = (topic: TopicScope, mode: GameMode, difficulty: Difficulty, sessionSeed: number, seenIds: string[], mixModes = defaultMixPattern): Question[] => {
  if (mode === "mix") {
    const pattern = mixModes.length ? mixModes : defaultMixPattern;
    const base = buildSession(topic, difficulty, sessionSeed, seenIds);
    const versusQuestions = buildQuestionRun(topic, "versus", difficulty, sessionSeed + 503, seenIds);
    let versusIndex = 0;
    return base.map((question, index) => {
      if (pattern[index % pattern.length] !== "versus") return question;
      const nextVersus = versusQuestions[versusIndex];
      versusIndex += 1;
      return nextVersus ?? question;
    });
  }

  if (mode === "versus") {
    return buildHeadToHeadSession(topic, difficulty, sessionSeed, seenIds);
  }

  return buildSession(topic, difficulty, sessionSeed, seenIds);
};

const difficultyLabel = (difficulty: Difficulty) => difficultyOptions.find((item) => item.id === difficulty)?.label ?? "Easy";
const isQuestionAnswerCorrect = (question: Question, choice: string) => choice === question.answer;
const comparisonLabelRank = (value: string) => (value.startsWith("A") ? 0 : value.startsWith("B") ? 1 : 2);
const orderedComparisonCards = (cards: ComparisonCard[]) => [...cards].sort((a, b) => comparisonLabelRank(a.label) - comparisonLabelRank(b.label));
const orderedComparisonChoices = (choices: string[]) => [...choices].sort((a, b) => comparisonLabelRank(a) - comparisonLabelRank(b));
const sortCardById = (round: SortRound, id?: string) => round.cards.find((card) => card.id === id);
const sortAnswerCardAt = (round: SortRound, index: number) => sortCardById(round, round.answerIds[index]);
const sortAcceptableCardsAt = (round: SortRound, index: number) => {
  const answerCard = sortAnswerCardAt(round, index);
  if (!answerCard) return [];
  return round.cards.filter((card) => card.statValue === answerCard.statValue || card.statDisplay === answerCard.statDisplay);
};
const isSortSlotCorrect = (round: SortRound, pickedId: string | undefined, index: number) => {
  const pickedCard = sortCardById(round, pickedId);
  return Boolean(pickedCard && sortAcceptableCardsAt(round, index).some((card) => card.id === pickedCard.id));
};
const isSortAnswerCorrect = (round: SortRound, picked: string[]) => round.answerIds.every((_, index) => isSortSlotCorrect(round, picked[index], index));

export function BurrowGame() {
  const [profilesState, setProfilesState] = useState<ProfilesState>(() => defaultProfiles());
  const [profilesReady, setProfilesReady] = useState(false);
  const activeProfile = profilesState.profiles.find((profile) => profile.id === profilesState.activeProfileId) ?? profilesState.profiles[0];
  const activeInterests = normalizeInterests(activeProfile.interests);
  const progress = activeProfile.progress;
  const [topic, setTopic] = useState<TopicId>("mixed");
  const [mode, setMode] = useState<GameMode>("mix");
  const [mixModes, setMixModes] = useState<ChallengeMode[]>(() => [...defaultMixPattern]);
  const [showCollection, setShowCollection] = useState(false);
  const [questions, setQuestions] = useState(() => buildQuestionRun(adaptiveTopicScopeFor("mixed", activeInterests, progress), "mix", progress.difficulty, 20260430, progress.seenIds));
  const [seedCounter, setSeedCounter] = useState(20260430);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [sortRound, setSortRound] = useState<SortRound>(() => buildSortRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [sortPicked, setSortPicked] = useState<string[]>([]);
  const [sortChecked, setSortChecked] = useState(false);
  const [factRound, setFactRound] = useState<FactRound>(() => buildFactRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [factSelected, setFactSelected] = useState<"True" | "False" | null>(null);
  const [revealRound, setRevealRound] = useState<RevealRound>(() => buildRevealRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [revealSelected, setRevealSelected] = useState<string | null>(null);
  const [numberRound, setNumberRound] = useState<NumberRound>(() => buildNumberRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [numberSelected, setNumberSelected] = useState<number | null>(null);
  const [oddRound, setOddRound] = useState<OddRound>(() => buildOddRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [oddSelected, setOddSelected] = useState<string | null>(null);
  const [topTrumpRound, setTopTrumpRound] = useState<TopTrumpRound>(() => buildTopTrumpRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [topTrumpSelected, setTopTrumpSelected] = useState<string | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [miniRunAnswered, setMiniRunAnswered] = useState(0);
  const [miniRunCorrect, setMiniRunCorrect] = useState(0);
  const [celebration, setCelebration] = useState("Pick a mode and jump in.");
  const [lastResult, setLastResult] = useState<ResultState | null>(null);
  const [issueCount, setIssueCount] = useState(0);
  const [issueFlash, setIssueFlash] = useState(false);

  const allCards = useMemo(() => collectionCards(), []);
  const question = questions[questionIndex];
  const selectedMixModes = mixModes.length ? mixModes : defaultMixPattern;
  const activeChallengeMode: ChallengeMode = mode === "mix" ? selectedMixModes[questionIndex % selectedMixModes.length] : mode;
  const isQuestionMode = !showCollection && (activeChallengeMode === "quiz" || activeChallengeMode === "versus");
  const answered = isQuestionMode && selected !== null;
  const isCorrect = isQuestionMode && question ? selected !== null && isQuestionAnswerCorrect(question, selected) : false;
  const levelProgress = Math.min(100, Math.round(((progress.xp % 120) / 120) * 100));
  const activeChallengeAnswered =
    activeChallengeMode === "sort"
      ? sortChecked
      : activeChallengeMode === "fact"
        ? factSelected !== null
        : activeChallengeMode === "peek"
          ? revealSelected !== null
          : activeChallengeMode === "number"
              ? numberSelected !== null
              : activeChallengeMode === "trumps"
                ? topTrumpSelected !== null
              : activeChallengeMode === "odd"
                ? oddSelected !== null
                : answered;
  const sessionAnswered = questionIndex + (activeChallengeAnswered ? 1 : 0);
  const unlockedCount = allCards.filter((card) => progress.unlockedCards.includes(card.title)).length;
  const currentTopicScope = adaptiveTopicScopeFor(topic, activeInterests, progress);
  const currentTopicLabel = isQuestionMode && question ? topicCatalog[question.topic].label : typeof currentTopicScope === "string" && isKnowledgeTopic(currentTopicScope) ? topicCatalog[currentTopicScope].label : "Mixed topics";
  const currentRoundContext = `${currentTopicLabel} · ${gameTypeLabel(activeChallengeMode)}`;
  const accuracy = progress.answered ? Math.round((progress.correct / progress.answered) * 100) : 0;

  useEffect(() => {
    document.documentElement.dataset.burrowHydrated = "true";
    return () => {
      delete document.documentElement.dataset.burrowHydrated;
    };
  }, []);

  useEffect(() => {
    const loadSavedProfiles = window.setTimeout(() => {
      const loadedProfiles = loadProfiles();
      const loadedProfile = loadedProfiles.profiles.find((profile) => profile.id === loadedProfiles.activeProfileId) ?? loadedProfiles.profiles[0];
      const loadedInterests = normalizeInterests(loadedProfile.interests);
      const loadedScope = adaptiveTopicScopeFor("mixed", loadedInterests, loadedProfile.progress);
      setProfilesState(loadedProfiles);
      setQuestions(buildQuestionRun(loadedScope, "mix", loadedProfile.progress.difficulty, 20260430, loadedProfile.progress.seenIds));
      setSortRound(buildSortRound(loadedScope, loadedProfile.progress.difficulty, 20260461));
      setFactRound(buildFactRound(loadedScope, loadedProfile.progress.difficulty, 20260477));
      setRevealRound(buildRevealRound(loadedScope, loadedProfile.progress.difficulty, 20260493));
      setNumberRound(buildNumberRound(loadedScope, loadedProfile.progress.difficulty, 20260513));
      setOddRound(buildOddRound(loadedScope, loadedProfile.progress.difficulty, 20260523));
      setTopTrumpRound(buildTopTrumpRound(loadedScope, loadedProfile.progress.difficulty, 20260531));
      setIssueCount(loadContentIssues().length);
      setProfilesReady(true);
    }, 0);

    return () => window.clearTimeout(loadSavedProfiles);
  }, []);

  useEffect(() => {
    if (!profilesReady) return;
    window.localStorage.setItem(profilesKey, JSON.stringify(profilesState));
  }, [profilesReady, profilesState]);

  const currentIssueTarget = (): Omit<ContentIssueReport, "id" | "createdAt" | "profileId"> => {
    if (showCollection) {
      return {
        mode: "collection",
        topic,
        itemId: "collection",
        title: "Collection",
        prompt: "Collection card or source issue",
      };
    }

    if (activeChallengeMode === "sort") return { mode: activeChallengeMode, topic: sortRound.topic, itemId: sortRound.id, title: "Sort round", prompt: sortRound.prompt, image: sortRound.cards[0]?.image };
    if (activeChallengeMode === "fact") return { mode: activeChallengeMode, topic: factRound.topic, itemId: factRound.id, title: factRound.imageAlt, prompt: factRound.statement, image: factRound.image };
    if (activeChallengeMode === "peek") return { mode: activeChallengeMode, topic: revealRound.topic, itemId: revealRound.id, title: revealRound.card.title, prompt: revealRound.prompt, image: revealRound.card.image };
    if (activeChallengeMode === "number") return { mode: activeChallengeMode, topic: numberRound.topic, itemId: numberRound.id, title: numberRound.biggerLabel, prompt: numberRound.prompt, image: numberRound.cards[0]?.image };
    if (activeChallengeMode === "odd") return { mode: activeChallengeMode, topic: oddRound.topic, itemId: oddRound.id, title: "Odd one round", prompt: oddRound.prompt, image: oddRound.cards[0]?.image };
    if (activeChallengeMode === "trumps") return { mode: activeChallengeMode, topic: topTrumpRound.topic, itemId: topTrumpRound.id, title: topTrumpRound.player.title, prompt: topTrumpRound.prompt, image: topTrumpRound.player.image };

    return {
      mode: activeChallengeMode,
      topic: question?.topic ?? topic,
      itemId: question?.id ?? "unknown",
      questionId: question?.id,
      questionKind: question?.kind,
      title: question?.imageAlt ?? "Question",
      prompt: question?.prompt ?? "Question issue",
      image: question?.image,
    };
  };

  const flagCurrentIssue = async () => {
    const report: ContentIssueReport = {
      id: `issue-${Date.now()}`,
      createdAt: new Date().toISOString(),
      profileId: activeProfile.id,
      ...currentIssueTarget(),
    };
    const nextReports = [report, ...loadContentIssues()].slice(0, 80);
    window.localStorage.setItem(contentIssuesKey, JSON.stringify(nextReports));
    setIssueCount(nextReports.length);
    setIssueFlash(true);
    window.setTimeout(() => setIssueFlash(false), 1800);
    setCelebration("Flagged for content review. Saving the note locally...");

    try {
      const response = await fetch("/api/content-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (!response.ok) throw new Error(`Issue log failed with ${response.status}`);
      setCelebration("Flagged for content review and logged locally.");
    } catch (error) {
      console.warn("Content issue was kept in browser storage but could not be written to the local log.", error);
      setCelebration("Flagged here. Local file logging was not available.");
    }
  };

  const setProgress = (update: Progress | ((current: Progress) => Progress)) => {
    const activeProfileId = activeProfile.id;
    setProfilesState((current) => ({
      ...current,
      profiles: current.profiles.map((profile) => {
        if (profile.id !== activeProfileId) return profile;
        const nextProgress = typeof update === "function" ? update(profile.progress) : update;
        return { ...profile, progress: normalizeProgress(nextProgress) };
      }),
    }));
  };

  const reward = ({
    correct,
    xpGain,
    topicName,
    modeName,
    seenId,
    unlockTitles = [],
  }: {
    correct: boolean;
    xpGain: number;
    topicName?: KnowledgeTopic;
    modeName?: GameMode;
    seenId: string;
    unlockTitles?: string[];
  }) => {
    const nextXp = progress.xp + xpGain;
    const nextLevel = levelFromXp(nextXp);

    setLastResult({ correct, xpGain, leveledUp: nextLevel > progress.level });
    setProgress((current) => ({
      ...current,
      xp: current.xp + xpGain,
      level: levelFromXp(current.xp + xpGain),
      streak: correct ? current.streak + 1 : 0,
      bestStreak: Math.max(current.bestStreak, correct ? current.streak + 1 : 0),
      correct: current.correct + (correct ? 1 : 0),
      answered: current.answered + 1,
      difficulty: autoDifficulty(current.difficulty, correct, correct ? current.streak + 1 : 0, current.answered + 1, current.correct + (correct ? 1 : 0)),
      seenIds: [seenId, ...current.seenIds].slice(0, 80),
      unlockedCards: correct ? addUnique(current.unlockedCards, unlockTitles) : current.unlockedCards,
      topicWins: topicName ? { ...current.topicWins, [topicName]: current.topicWins[topicName] + (correct ? 1 : 0) } : current.topicWins,
      topicStats: topicName
        ? {
            ...current.topicStats,
            [topicName]: {
              correct: current.topicStats[topicName].correct + (correct ? 1 : 0),
              answered: current.topicStats[topicName].answered + 1,
            },
          }
        : current.topicStats,
      modeWins: modeName
        ? {
            ...current.modeWins,
            [modeName]: current.modeWins[modeName] + (correct ? 1 : 0),
          }
        : current.modeWins,
    }));

    return { correct, xpGain, leveledUp: nextLevel > progress.level };
  };

  const resetRunState = () => {
    setQuestionIndex(0);
    setSelected(null);
    setSortPicked([]);
    setSortChecked(false);
    setFactSelected(null);
    setRevealSelected(null);
    setNumberSelected(null);
    setOddSelected(null);
    setTopTrumpSelected(null);
    setLastResult(null);
    setSessionCorrect(0);
    setMiniRunAnswered(0);
    setMiniRunCorrect(0);
    setCelebration("Fresh round.");
  };

  const freshSeed = (offset = 0) => {
    const seed = seedCounter + offset;
    setSeedCounter((value) => value + 137);
    return seed;
  };

  const restartPlay = (nextTopic: TopicId, nextMode: GameMode, nextProfile: LearnerProfile, seed: number) => {
    const nextInterests = normalizeInterests(nextProfile.interests);
    const safeTopic = playableTopic(nextTopic, nextInterests);
    const scope = adaptiveTopicScopeFor(safeTopic, nextInterests, nextProfile.progress);
    setTopic(safeTopic);
    resetRunState();
    setQuestions(buildQuestionRun(scope, nextMode, nextProfile.progress.difficulty, seed, nextProfile.progress.seenIds, selectedMixModes));
    setSortRound(buildSortRound(scope, nextProfile.progress.difficulty, seed + 31));
    setFactRound(buildFactRound(scope, nextProfile.progress.difficulty, seed + 47));
    setRevealRound(buildRevealRound(scope, nextProfile.progress.difficulty, seed + 61));
    setNumberRound(buildNumberRound(scope, nextProfile.progress.difficulty, seed + 89));
    setOddRound(buildOddRound(scope, nextProfile.progress.difficulty, seed + 97));
    setTopTrumpRound(buildTopTrumpRound(scope, nextProfile.progress.difficulty, seed + 113));
  };

  const setQuestionDifficulty = (nextDifficulty: Difficulty) => {
    if (nextDifficulty === progress.difficulty) return;
    const seed = freshSeed(nextDifficulty * 53);
    setProgress((current) => ({ ...current, difficulty: nextDifficulty }));
    resetRunState();
    setQuestions(buildQuestionRun(currentTopicScope, mode, nextDifficulty, seed, progress.seenIds, selectedMixModes));
    setSortRound(buildSortRound(currentTopicScope, nextDifficulty, seed + 41));
    setFactRound(buildFactRound(currentTopicScope, nextDifficulty, seed + 47));
    setRevealRound(buildRevealRound(currentTopicScope, nextDifficulty, seed + 53));
    setNumberRound(buildNumberRound(currentTopicScope, nextDifficulty, seed + 67));
    setOddRound(buildOddRound(currentTopicScope, nextDifficulty, seed + 71));
    setTopTrumpRound(buildTopTrumpRound(currentTopicScope, nextDifficulty, seed + 79));
    setCelebration(`${difficultyLabel(nextDifficulty)} questions.`);
  };

  const openCollection = () => {
    setShowCollection((value) => !value);
    setLastResult(null);
    setCelebration(showCollection ? "Back to the game." : "Collection opened.");
  };

  const switchProfile = (profileId: string) => {
    const nextProfile = profilesState.profiles.find((profile) => profile.id === profileId);
    if (!nextProfile || nextProfile.id === activeProfile.id) return;
    const seed = freshSeed(profileId.length + 17);
    setProfilesState((current) => ({ ...current, activeProfileId: profileId }));
    restartPlay(topic, mode, nextProfile, seed);
    setCelebration(`${nextProfile.name}'s turn.`);
  };

  const createProfile = () => {
    const name = window.prompt("Profile name");
    const cleanName = name?.trim();
    if (!cleanName) return;
    const newProfile: LearnerProfile = {
      id: `profile-${Date.now()}`,
      name: cleanName.slice(0, 18),
      interests: [...defaultStarterTopics],
      progress: freshProgress(),
    };
    const seed = freshSeed(cleanName.length + 29);
    setProfilesState((current) => ({
      activeProfileId: newProfile.id,
      profiles: [...current.profiles, newProfile],
    }));
    restartPlay("mixed", mode, newProfile, seed);
    setCelebration(`${newProfile.name} is ready.`);
  };

  const applyInterests = (nextInterests: KnowledgeTopic[], seedBasis: string, message: string) => {
    const safeInterests = normalizeInterests(nextInterests);
    const nextProfile = { ...activeProfile, interests: safeInterests };
    const nextTopic = playableTopic(topic, safeInterests);
    const seed = freshSeed(seedBasis.length + safeInterests.length * 41);

    setProfilesState((current) => ({
      ...current,
      profiles: current.profiles.map((profile) => (profile.id === activeProfile.id ? nextProfile : profile)),
    }));
    restartPlay(nextTopic, mode, nextProfile, seed);
    setCelebration(message);
  };

  const toggleInterest = (interest: KnowledgeTopic) => {
    const nextInterests = activeInterests.includes(interest)
      ? activeInterests.length === 1
        ? activeInterests
        : activeInterests.filter((item) => item !== interest)
      : [...activeInterests, interest];
    applyInterests(nextInterests, interest, `${activeProfile.name}'s topics updated.`);
  };

  const selectAllInterests = () => {
    applyInterests([...allKnowledgeTopics], "all-topics", "All topics selected.");
  };

  const clearInterests = () => {
    applyInterests([...defaultStarterTopics], "starter-topics", "Starter topics selected.");
  };

  const applyMixModes = (nextModes: ChallengeMode[], seedBasis: string, message: string) => {
    const safeModes = nextModes.length ? nextModes : starterMixModes;
    const seed = freshSeed(seedBasis.length + safeModes.length * 31);
    setMode("mix");
    setShowCollection(false);
    setMixModes(safeModes);
    resetRunState();
    setQuestions(buildQuestionRun(currentTopicScope, "mix", progress.difficulty, seed, progress.seenIds, safeModes));
    setSortRound(buildSortRound(currentTopicScope, progress.difficulty, seed + 29));
    setFactRound(buildFactRound(currentTopicScope, progress.difficulty, seed + 37));
    setRevealRound(buildRevealRound(currentTopicScope, progress.difficulty, seed + 43));
    setNumberRound(buildNumberRound(currentTopicScope, progress.difficulty, seed + 53));
    setOddRound(buildOddRound(currentTopicScope, progress.difficulty, seed + 59));
    setTopTrumpRound(buildTopTrumpRound(currentTopicScope, progress.difficulty, seed + 67));
    setCelebration(message);
  };

  const toggleMixMode = (challengeMode: ChallengeMode) => {
    const currentModes = selectedMixModes;
    const nextModes = currentModes.includes(challengeMode)
      ? currentModes.length === 1
        ? currentModes
        : currentModes.filter((item) => item !== challengeMode)
      : defaultMixPattern.filter((item) => currentModes.includes(item) || item === challengeMode);
    applyMixModes(nextModes, challengeMode, `${nextModes.length} game types selected.`);
  };

  const selectAllMixModes = () => {
    applyMixModes([...defaultMixPattern], "all-game-types", "All game types selected.");
  };

  const clearMixModes = () => {
    applyMixModes([...starterMixModes], "starter-game-types", "Starter game type selected.");
  };

  const answer = (choice: string) => {
    if (!question || selected !== null) return;
    const correct = isQuestionAnswerCorrect(question, choice);
    const xpGain = correct ? (activeChallengeMode === "versus" ? 24 : 18) + progress.difficulty * 4 : 6;
    const result = reward({
      correct,
      xpGain,
      topicName: question.topic,
      modeName: mode === "mix" ? "mix" : activeChallengeMode,
      seenId: question.id,
      unlockTitles: [question.imageAlt],
    });

    setSelected(choice);
    setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? praise[(questionIndex + progress.streak) % praise.length] : "Good try. The clue below helps.");
    setLastResult(result);
  };

  const advanceMix = () => {
    const seed = freshSeed(101 + questionIndex);
    if (questionIndex === questions.length - 1) {
      setProgress((current) => ({ ...current, sessions: current.sessions + 1 }));
      setQuestionIndex(0);
      setSessionCorrect(0);
      setQuestions(buildQuestionRun(currentTopicScope, mode, progress.difficulty, seed, progress.seenIds, selectedMixModes));
      setCelebration("New mixed run. Fresh shuffle.");
    } else {
      setQuestionIndex((value) => value + 1);
      setCelebration("Next shuffle.");
    }
    setSelected(null);
    setLastResult(null);
    setSortPicked([]);
    setSortChecked(false);
    setFactSelected(null);
    setRevealSelected(null);
    setNumberSelected(null);
    setOddSelected(null);
    setTopTrumpSelected(null);
    setSortRound(buildSortRound(currentTopicScope, progress.difficulty, seed + 29));
    setFactRound(buildFactRound(currentTopicScope, progress.difficulty, seed + 37));
    setRevealRound(buildRevealRound(currentTopicScope, progress.difficulty, seed + 43));
    setNumberRound(buildNumberRound(currentTopicScope, progress.difficulty, seed + 53));
    setOddRound(buildOddRound(currentTopicScope, progress.difficulty, seed + 59));
    setTopTrumpRound(buildTopTrumpRound(currentTopicScope, progress.difficulty, seed + 67));
  };

  const advance = () => {
    if (mode === "mix") {
      advanceMix();
      return;
    }

    if (questionIndex === questions.length - 1) {
      const seed = freshSeed(101);
      setProgress((current) => ({ ...current, sessions: current.sessions + 1 }));
      setQuestionIndex(0);
      setSessionCorrect(0);
      setSelected(null);
      setLastResult(null);
      setQuestions(buildQuestionRun(currentTopicScope, mode, progress.difficulty, seed, progress.seenIds, selectedMixModes));
      setCelebration("New mini-session. Fresh challenges.");
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
    setLastResult(null);
    setCelebration("Next bite.");
  };

  const checkSort = () => {
    if (sortChecked || sortPicked.length !== sortRound.answerIds.length) return;
    const correct = isSortAnswerCorrect(sortRound, sortPicked);
    const xpGain = correct ? 30 + progress.difficulty * 6 : 8;
    const unlocked = sortRound.cards.filter((card) => sortRound.answerIds.includes(card.id)).map((card) => card.title);
    const result = reward({
      correct,
      xpGain,
      topicName: sortRound.topic,
      modeName: mode === "mix" ? "mix" : "sort",
      seenId: sortRound.id,
      unlockTitles: unlocked,
    });
    setSortChecked(true);
    setMiniRunAnswered((value) => value + 1);
    setMiniRunCorrect((value) => value + (correct ? 1 : 0));
    if (mode === "mix") setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? "Perfect order!" : "Good try. Read the number path.");
    setLastResult(result);
  };

  const nextSortRound = () => {
    const seed = freshSeed(miniRunAnswered * 13);
    setSortRound(buildSortRound(currentTopicScope, progress.difficulty, seed));
    setSortPicked([]);
    setSortChecked(false);
    setLastResult(null);
    setCelebration("New sort board.");
  };

  const answerFact = (choice: "True" | "False") => {
    if (factSelected) return;
    const correct = choice === factRound.answer;
    const xpGain = correct ? 22 + progress.difficulty * 5 : 7;
    const result = reward({
      correct,
      xpGain,
      topicName: factRound.topic,
      modeName: mode === "mix" ? "mix" : "fact",
      seenId: factRound.id,
      unlockTitles: [factRound.imageAlt],
    });
    setFactSelected(choice);
    setMiniRunAnswered((value) => value + 1);
    setMiniRunCorrect((value) => value + (correct ? 1 : 0));
    if (mode === "mix") setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? "You caught it!" : "Good try. Check the fact.");
    setLastResult(result);
  };

  const nextFactRound = () => {
    const seed = freshSeed(miniRunAnswered * 19);
    setFactRound(buildFactRound(currentTopicScope, progress.difficulty, seed));
    setFactSelected(null);
    setLastResult(null);
    setCelebration("New fact card.");
  };

  const answerReveal = (choice: string, revealedCount: number) => {
    if (revealSelected) return;
    const correct = choice === revealRound.answer;
    const speedBonus = Math.max(0, 6 - Math.floor(revealedCount / 3));
    const xpGain = correct ? 24 + progress.difficulty * 5 + speedBonus : 7;
    const result = reward({
      correct,
      xpGain,
      topicName: revealRound.topic,
      modeName: mode === "mix" ? "mix" : "peek",
      seenId: revealRound.id,
      unlockTitles: [revealRound.card.title],
    });

    setRevealSelected(choice);
    setMiniRunAnswered((value) => value + 1);
    setMiniRunCorrect((value) => value + (correct ? 1 : 0));
    if (mode === "mix") setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? "Picture solved!" : "Good try. The full picture tells you.");
    setLastResult(result);
  };

  const nextRevealRound = () => {
    const seed = freshSeed(miniRunAnswered * 23);
    setRevealRound(buildRevealRound(currentTopicScope, progress.difficulty, seed));
    setRevealSelected(null);
    setLastResult(null);
    setCelebration("New picture peek.");
  };

  const answerNumber = (choice: number) => {
    if (numberSelected !== null) return;
    const correct = choice === numberRound.answer;
    const xpGain = correct ? 28 + progress.difficulty * 6 : 8;
    const result = reward({
      correct,
      xpGain,
      topicName: numberRound.topic,
      modeName: mode === "mix" ? "mix" : "number",
      seenId: numberRound.id,
      unlockTitles: numberRound.cards.map((card) => card.title),
    });
    setNumberSelected(choice);
    setMiniRunAnswered((value) => value + 1);
    setMiniRunCorrect((value) => value + (correct ? 1 : 0));
    if (mode === "mix") setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? "Number detective!" : "Good try. Check the subtraction.");
    setLastResult(result);
  };

  const nextNumberRound = () => {
    const seed = freshSeed(miniRunAnswered * 31);
    setNumberRound(buildNumberRound(currentTopicScope, progress.difficulty, seed));
    setNumberSelected(null);
    setLastResult(null);
    setCelebration("New number case.");
  };

  const answerOdd = (cardId: string) => {
    if (oddSelected !== null) return;
    const correct = cardId === oddRound.answerId;
    const xpGain = correct ? 26 + progress.difficulty * 5 : 7;
    const result = reward({
      correct,
      xpGain,
      topicName: oddRound.topic,
      modeName: mode === "mix" ? "mix" : "odd",
      seenId: oddRound.id,
      unlockTitles: oddRound.cards.map((card) => card.title),
    });
    setOddSelected(cardId);
    setMiniRunAnswered((value) => value + 1);
    setMiniRunCorrect((value) => value + (correct ? 1 : 0));
    if (mode === "mix") setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? "Rule spotted!" : "Good try. The rule is hiding in the cards.");
    setLastResult(result);
  };

  const nextOddRound = () => {
    const seed = freshSeed(miniRunAnswered * 37);
    setOddRound(buildOddRound(currentTopicScope, progress.difficulty, seed));
    setOddSelected(null);
    setLastResult(null);
    setCelebration("New logic set.");
  };

  const topTrumpStat = (round: TopTrumpRound, statId: string) => {
    const playerStat = round.player.stats.find((stat) => stat.id === statId);
    const computerStat = round.computer.stats.find((stat) => stat.id === statId);
    return playerStat && computerStat ? { playerStat, computerStat } : null;
  };

  const playerWinsTopTrump = (playerStat: TopTrumpStat, computerStat: TopTrumpStat) => {
    if (playerStat.value === computerStat.value) return true;
    return playerStat.direction === "lower" ? playerStat.value < computerStat.value : playerStat.value > computerStat.value;
  };

  const answerTopTrump = (statId: string) => {
    if (topTrumpSelected !== null) return;
    const stats = topTrumpStat(topTrumpRound, statId);
    if (!stats) return;
    const correct = playerWinsTopTrump(stats.playerStat, stats.computerStat);
    const xpGain = correct ? 30 + progress.difficulty * 6 : 8;
    const result = reward({
      correct,
      xpGain,
      topicName: topTrumpRound.topic,
      modeName: mode === "mix" ? "mix" : "trumps",
      seenId: topTrumpRound.id,
      unlockTitles: [topTrumpRound.player.title, topTrumpRound.computer.title],
    });
    setTopTrumpSelected(statId);
    setMiniRunAnswered((value) => value + 1);
    setMiniRunCorrect((value) => value + (correct ? 1 : 0));
    if (mode === "mix") setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? "Your card takes it!" : "Computer steals this one.");
    setLastResult(result);
  };

  const nextTopTrumpRound = () => {
    const seed = freshSeed(miniRunAnswered * 41);
    setTopTrumpRound(buildTopTrumpRound(currentTopicScope, progress.difficulty, seed));
    setTopTrumpSelected(null);
    setLastResult(null);
    setCelebration("New Top Trumps deal.");
  };

  const resetProgress = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset this player's progress?")) return;
    const seed = freshSeed(211);
    const reset = freshProgress();
    setProgress(reset);
    setShowCollection(false);
    setQuestions(buildQuestionRun(currentTopicScope, mode, reset.difficulty, seed, reset.seenIds, selectedMixModes));
    setSortRound(buildSortRound(currentTopicScope, reset.difficulty, seed + 29));
    setFactRound(buildFactRound(currentTopicScope, reset.difficulty, seed + 37));
    setRevealRound(buildRevealRound(currentTopicScope, reset.difficulty, seed + 43));
    setNumberRound(buildNumberRound(currentTopicScope, reset.difficulty, seed + 53));
    setOddRound(buildOddRound(currentTopicScope, reset.difficulty, seed + 59));
    setTopTrumpRound(buildTopTrumpRound(currentTopicScope, reset.difficulty, seed + 67));
    resetRunState();
    setCelebration("Progress reset. Fresh start.");
  };

  return (
    <main className="field-guide-skin min-h-dvh overflow-x-hidden bg-[#0d332f] text-[#1d2528]">
      <section className="burrow-game-shell field-guide-shell flex min-h-dvh flex-col gap-1.5 bg-[linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:32px_32px] p-1.5 md:p-2 min-[900px]:h-dvh min-[900px]:min-h-0 min-[900px]:overflow-hidden">
        <GameHud
          profiles={profilesState.profiles}
          activeProfileId={activeProfile.id}
          onProfileChange={switchProfile}
          onCreateProfile={createProfile}
          level={progress.level}
          levelProgress={levelProgress}
          streak={progress.streak}
          accuracy={accuracy}
          collectionValue={`${unlockedCount}/${allCards.length}`}
          showCollection={showCollection}
          onCollection={openCollection}
          difficulty={progress.difficulty}
          onDifficultyChange={setQuestionDifficulty}
          activeInterests={activeInterests}
          onToggleInterest={toggleInterest}
          onSelectAllInterests={selectAllInterests}
          onClearInterests={clearInterests}
          activeMixModes={selectedMixModes}
          onToggleMixMode={toggleMixMode}
          onSelectAllMixModes={selectAllMixModes}
          onClearMixModes={clearMixModes}
          issueFlash={issueFlash}
          issueCount={issueCount}
          onReset={resetProgress}
        />

        {showCollection && (
          <CollectionBook cards={allCards} unlockedCards={progress.unlockedCards} topic={topic} topicWins={progress.topicWins} modeWins={progress.modeWins} />
        )}

        {!showCollection && isQuestionMode && question && (
          <QuestionRun
            question={question}
            questions={questions}
            questionIndex={questionIndex}
            selected={selected}
            answered={answered}
            isCorrect={isCorrect}
            sessionCorrect={sessionCorrect}
            sessionAnswered={sessionAnswered}
            lastResult={lastResult}
            celebration={celebration}
            note={tryAgainNotes[(questionIndex + progress.answered) % tryAgainNotes.length]}
            difficulty={progress.difficulty}
            roundContext={currentRoundContext}
            onAnswer={answer}
            onNext={advance}
            onSkip={advance}
            issueFlash={issueFlash}
            onFlagIssue={flagCurrentIssue}
          />
        )}

        {!showCollection && activeChallengeMode === "sort" && (
          <SortMode
            round={sortRound}
            picked={sortPicked}
            checked={sortChecked}
            result={lastResult}
            miniRunAnswered={miniRunAnswered}
            miniRunCorrect={miniRunCorrect}
            celebration={celebration}
            difficulty={progress.difficulty}
            roundContext={`${topicCatalog[sortRound.topic].label} · ${gameTypeLabel("sort")}`}
            onPick={(id) => {
              if (sortChecked || sortPicked.includes(id)) return;
              setSortPicked((value) => [...value, id]);
            }}
            onUndo={() => {
              if (!sortChecked) setSortPicked((value) => value.slice(0, -1));
            }}
            onCheck={checkSort}
            onNext={mode === "mix" ? advanceMix : nextSortRound}
            onSkip={mode === "mix" ? advanceMix : nextSortRound}
          />
        )}

        {!showCollection && activeChallengeMode === "fact" && (
          <FactMode
            round={factRound}
            selected={factSelected}
            result={lastResult}
            miniRunAnswered={miniRunAnswered}
            miniRunCorrect={miniRunCorrect}
            celebration={celebration}
            difficulty={progress.difficulty}
            roundContext={`${topicCatalog[factRound.topic].label} · ${gameTypeLabel("fact")}`}
            onAnswer={answerFact}
            onNext={mode === "mix" ? advanceMix : nextFactRound}
            onSkip={mode === "mix" ? advanceMix : nextFactRound}
          />
        )}

        {!showCollection && activeChallengeMode === "peek" && (
          <RevealMode
            key={revealRound.id}
            round={revealRound}
            selected={revealSelected}
            result={lastResult}
            miniRunAnswered={miniRunAnswered}
            miniRunCorrect={miniRunCorrect}
            celebration={celebration}
            difficulty={progress.difficulty}
            roundContext={`${topicCatalog[revealRound.topic].label} · ${gameTypeLabel("peek")}`}
            onAnswer={answerReveal}
            onNext={mode === "mix" ? advanceMix : nextRevealRound}
            onSkip={mode === "mix" ? advanceMix : nextRevealRound}
          />
        )}

        {!showCollection && activeChallengeMode === "number" && (
          <NumberMode
            round={numberRound}
            selected={numberSelected}
            result={lastResult}
            miniRunAnswered={miniRunAnswered}
            miniRunCorrect={miniRunCorrect}
            celebration={celebration}
            difficulty={progress.difficulty}
            roundContext={`${topicCatalog[numberRound.topic].label} · ${gameTypeLabel("number")}`}
            onAnswer={answerNumber}
            onNext={mode === "mix" ? advanceMix : nextNumberRound}
            onSkip={mode === "mix" ? advanceMix : nextNumberRound}
          />
        )}

        {!showCollection && activeChallengeMode === "trumps" && (
          <TopTrumpsMode
            round={topTrumpRound}
            selected={topTrumpSelected}
            result={lastResult}
            miniRunAnswered={miniRunAnswered}
            miniRunCorrect={miniRunCorrect}
            celebration={celebration}
            difficulty={progress.difficulty}
            roundContext={`${topicCatalog[topTrumpRound.topic].label} · ${gameTypeLabel("trumps")}`}
            onAnswer={answerTopTrump}
            onNext={mode === "mix" ? advanceMix : nextTopTrumpRound}
            onSkip={mode === "mix" ? advanceMix : nextTopTrumpRound}
          />
        )}

        {!showCollection && activeChallengeMode === "odd" && (
          <OddOneMode
            round={oddRound}
            selected={oddSelected}
            result={lastResult}
            miniRunAnswered={miniRunAnswered}
            miniRunCorrect={miniRunCorrect}
            celebration={celebration}
            difficulty={progress.difficulty}
            roundContext={`${topicCatalog[oddRound.topic].label} · ${gameTypeLabel("odd")}`}
            onAnswer={answerOdd}
            onNext={mode === "mix" ? advanceMix : nextOddRound}
            onSkip={mode === "mix" ? advanceMix : nextOddRound}
          />
        )}
      </section>
    </main>
  );
}

function GameHud({
  profiles,
  activeProfileId,
  onProfileChange,
  onCreateProfile,
  level,
  levelProgress,
  streak,
  accuracy,
  collectionValue,
  showCollection,
  onCollection,
  difficulty,
  onDifficultyChange,
  activeInterests,
  onToggleInterest,
  onSelectAllInterests,
  onClearInterests,
  activeMixModes,
  onToggleMixMode,
  onSelectAllMixModes,
  onClearMixModes,
  issueFlash,
  issueCount,
  onReset,
}: {
  profiles: LearnerProfile[];
  activeProfileId: string;
  onProfileChange: (profileId: string) => void;
  onCreateProfile: () => void;
  level: number;
  levelProgress: number;
  streak: number;
  accuracy: number;
  collectionValue: string;
  showCollection: boolean;
  onCollection: () => void;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  activeInterests: KnowledgeTopic[];
  onToggleInterest: (topic: KnowledgeTopic) => void;
  onSelectAllInterests: () => void;
  onClearInterests: () => void;
  activeMixModes: ChallengeMode[];
  onToggleMixMode: (mode: ChallengeMode) => void;
  onSelectAllMixModes: () => void;
  onClearMixModes: () => void;
  issueFlash: boolean;
  issueCount: number;
  onReset: () => void;
}) {
  const setupSummary = `${activeMixModes.length} games · ${activeInterests.length} topics`;

  return (
    <header className="relative z-30 shrink-0 rounded-lg border-2 border-[#092421] bg-[#f7f0df] px-2 pb-1.5 pt-5 shadow-[3px_3px_0_#092421]">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-4 border-b-2 border-[#092421] bg-[#123d38] bg-[linear-gradient(90deg,rgba(255,253,246,.12)_1px,transparent_1px)] bg-[size:32px_32px]"
      />
      <div className="relative z-10 grid min-h-[68px] min-w-0 items-center gap-2 min-[900px]:grid-cols-[minmax(292px,.95fr)_minmax(200px,.85fr)_minmax(380px,1.3fr)_auto]">
        <div className="flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/burrow-icon-64.png"
            alt=""
            aria-hidden="true"
            className="h-11 w-11 shrink-0 rounded-lg border-2 border-[#092421] bg-[#eac57c] shadow-[2px_2px_0_#092421]"
          />
          <div className="min-w-0 shrink">
            <p className="hidden truncate text-[9px] font-black uppercase tracking-[0.18em] text-[#7d5a3f] min-[1240px]:block">Field notes for curious kids</p>
            <h1 className="truncate text-2xl font-black leading-none text-[#321e16]">Burrow</h1>
          </div>
          <ProfilePicker profiles={profiles} activeProfileId={activeProfileId} onChange={onProfileChange} onCreate={onCreateProfile} />
        </div>

        <HudProgress level={level} levelProgress={levelProgress} streak={streak} accuracy={accuracy} />

        <div className="grid min-w-0 grid-cols-[minmax(220px,1fr)_minmax(72px,.32fr)] gap-1.5">
          <DifficultySelector difficulty={difficulty} onChange={onDifficultyChange} />
          <CollectionAction active={showCollection} value={collectionValue} onClick={onCollection} />
        </div>

        <SetupMenu
          activeInterests={activeInterests}
          onToggleInterest={onToggleInterest}
          onSelectAllInterests={onSelectAllInterests}
          onClearInterests={onClearInterests}
          activeMixModes={activeMixModes}
          onToggleMixMode={onToggleMixMode}
          onSelectAllMixModes={onSelectAllMixModes}
          onClearMixModes={onClearMixModes}
          setupSummary={setupSummary}
          issueFlash={issueFlash}
          issueCount={issueCount}
          onReset={onReset}
        />
      </div>
    </header>
  );
}

function HudProgress({
  level,
  levelProgress,
  streak,
  accuracy,
}: {
  level: number;
  levelProgress: number;
  streak: number;
  accuracy: number;
}) {
  const sparkSlots = 6;
  const filledSparks = Math.min(sparkSlots, Math.max(0, Math.ceil((levelProgress / 100) * sparkSlots)));

  return (
    <div className="min-w-0 rounded-lg border-2 border-[#d9c7a7] bg-[#fffdf6] px-2 py-1.5">
      <div className="grid grid-cols-[auto_1fr] items-center gap-2">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border-2 border-[#092421] bg-[#f0c84b] text-center shadow-[2px_2px_0_#092421]">
          <span className="block text-[8px] font-black uppercase leading-none tracking-[0.1em] text-[#7d5a3f]">Level</span>
          <span className="block text-2xl font-black leading-none text-[#102f36]">{level}</span>
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <p className="truncate text-sm font-black leading-tight text-[#102f36]">Glow</p>
          </div>
          <div className="mt-1 grid grid-cols-6 gap-1" aria-label={`${levelProgress}% of this level filled`}>
            {Array.from({ length: sparkSlots }, (_, index) => {
              const filled = index < filledSparks;
              return (
                <span
                  key={`spark-${index}`}
                  className={`h-3 rounded-sm border-2 border-[#092421] transition-colors duration-300 ${
                    filled ? "bg-[#70d392] shadow-[1px_1px_0_#092421]" : "bg-white"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-1 flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#72543e]">
        <span className="truncate">{streak ? `${streak} in a row` : "Warm up"}</span>
        <span className="h-1 w-1 rounded-full bg-[#d9c7a7]" />
        <span className="truncate">{accuracy}% right</span>
      </div>
    </div>
  );
}

function SetupMenu({
  activeInterests,
  onToggleInterest,
  onSelectAllInterests,
  onClearInterests,
  activeMixModes,
  onToggleMixMode,
  onSelectAllMixModes,
  onClearMixModes,
  setupSummary,
  issueFlash,
  issueCount,
  onReset,
}: {
  activeInterests: KnowledgeTopic[];
  onToggleInterest: (topic: KnowledgeTopic) => void;
  onSelectAllInterests: () => void;
  onClearInterests: () => void;
  activeMixModes: ChallengeMode[];
  onToggleMixMode: (mode: ChallengeMode) => void;
  onSelectAllMixModes: () => void;
  onClearMixModes: () => void;
  setupSummary: string;
  issueFlash: boolean;
  issueCount: number;
  onReset: () => void;
}) {
  const activeModeSet = new Set(activeMixModes);

  return (
    <details className="group relative">
      <summary className="flex min-h-11 cursor-pointer list-none flex-col items-center justify-center rounded-lg border-2 border-[#092421] bg-white px-3 py-1 text-center text-sm font-black text-[#102f36] shadow-[2px_2px_0_#092421] transition hover:bg-[#fff1bf] group-open:bg-[#fff1bf] [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 leading-tight">
          Setup
          <span className="text-lg leading-none">⌄</span>
        </span>
        <span className="mt-0.5 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.1em] text-[#72543e]">{setupSummary}</span>
      </summary>
      <div className="absolute right-0 z-40 mt-2 max-h-[calc(100dvh-112px)] w-[min(720px,calc(100vw-24px))] overflow-auto rounded-lg border-2 border-[#092421] bg-[#fffdf6] p-3 shadow-[4px_4px_0_#092421]">
        <div className="grid gap-3 md:grid-cols-[1fr_1.05fr]">
          <div>
            <SectionHeader title="Game Types" onAll={onSelectAllMixModes} onClear={onClearMixModes} />
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {selectableModeOptions.map((item) => {
                const selected = activeModeSet.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggleMixMode(item.id)}
                    className={`min-h-10 rounded-lg border-2 px-3 py-2 text-left transition active:translate-y-0.5 ${
                      selected ? "border-[#092421] bg-[#70d392] shadow-[2px_2px_0_#092421]" : "border-[#d9c7a7] bg-white hover:border-[#092421] hover:bg-[#fff1bf]"
                    }`}
                  >
                    <span className="block truncate text-sm font-black leading-tight text-[#102f36]">{item.label}</span>
                    <span className="block truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#72543e]">{selected ? "selected" : "tap to add"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <SectionHeader title="Topics" onAll={onSelectAllInterests} onClear={onClearInterests} />
            <div className="mt-2 grid gap-1.5">
              {allKnowledgeTopics.map((item) => {
                const enabled = activeInterests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={enabled}
                    onClick={() => onToggleInterest(item)}
                    className={`min-h-10 rounded-lg border-2 px-3 py-2 text-left transition active:translate-y-0.5 ${
                      enabled ? "border-[#092421] bg-[#70d392] shadow-[2px_2px_0_#092421]" : "border-[#d9c7a7] bg-white hover:border-[#092421] hover:bg-[#fff1bf]"
                    }`}
                  >
                    <span className="block text-sm font-black leading-tight text-[#102f36]">{topicCatalog[item].label}</span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#72543e]">{enabled ? "selected" : "tap to add"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          <div className="min-h-11 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] px-3 py-2">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#72543e]">Image reports</p>
            <p className="text-sm font-black leading-tight text-[#102f36]">{issueFlash ? "Latest saved" : `${issueCount} logged`}</p>
          </div>
          <details>
            <summary className="cursor-pointer list-none rounded-lg border-2 border-[#d9c7a7] bg-white px-3 py-2 text-sm font-black text-[#102f36] transition hover:border-[#092421] hover:bg-[#fff1bf] [&::-webkit-details-marker]:hidden">
              Advanced
            </summary>
            <div className="mt-2 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-2">
              <button
                type="button"
                onClick={onReset}
                className="min-h-10 rounded-lg border-2 border-[#092421] bg-white px-3 py-2 text-sm font-black text-[#102f36] transition hover:bg-[#ffd7ce] active:translate-y-0.5"
              >
                Reset progress
              </button>
            </div>
          </details>
        </div>
      </div>
    </details>
  );
}

function SectionHeader({ title, onAll, onClear }: { title: string; onAll: () => void; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#72543e]">{title}</p>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={onAll}
          className="rounded-md border-2 border-[#d9c7a7] bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#102f36] transition hover:border-[#092421] hover:bg-[#fff1bf]"
        >
          All
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border-2 border-[#d9c7a7] bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#102f36] transition hover:border-[#092421] hover:bg-[#fff1bf]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function RoundContextPill({ label }: { label: string }) {
  return (
    <p className="max-w-[180px] truncate rounded-lg border-2 border-[#092421] bg-[#fff1bf] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#102f36]">
      {label}
    </p>
  );
}

function QuestionRun({
  question,
  questions,
  questionIndex,
  selected,
  answered,
  isCorrect,
  sessionCorrect,
  sessionAnswered,
  lastResult,
  celebration,
  note,
  difficulty,
  roundContext,
  onAnswer,
  onNext,
  onSkip,
  issueFlash,
  onFlagIssue,
}: {
  question: Question;
  questions: Question[];
  questionIndex: number;
  selected: string | null;
  answered: boolean;
  isCorrect: boolean;
  sessionCorrect: number;
  sessionAnswered: number;
  lastResult: ResultState | null;
  celebration: string;
  note: string;
  difficulty: Difficulty;
  roundContext: string;
  onAnswer: (choice: string) => void;
  onNext: () => void;
  onSkip: () => void;
  issueFlash: boolean;
  onFlagIssue: () => void;
}) {
  const isDifferenceQuestion = question.kind === "building-difference" || question.kind === "shark-difference" || question.kind === "jet-difference";
  const showNumberLine = Boolean(question.numberLine) && (answered || (Boolean(question.comparison) && !isDifferenceQuestion));
  const showComparisonTable = Boolean(question.comparison) && (answered || !isDifferenceQuestion);
  const choices = question.comparison ? orderedComparisonChoices(question.choices) : question.choices;
  const stageHint = question.comparison
    ? isDifferenceQuestion
      ? "Use the numbers in the question. Subtract smaller from bigger."
      : "Look at both cards. Bigger number wins."
    : `Image: ${question.imageCredit}`;

  return (
    <section className="grid flex-1 gap-2 min-[900px]:min-h-0 min-[900px]:overflow-hidden min-[900px]:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <article className="relative min-h-[34dvh] overflow-hidden rounded-lg border-2 border-[#092421] bg-[#e3efe4] shadow-[4px_4px_0_#092421] min-[900px]:min-h-0">
        {question.comparison ? <ComparisonStage cards={question.comparison} /> : <QuestionImage question={question} />}
        <div className="absolute left-2 top-2 rounded-lg border-2 border-[#092421] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36] shadow-[2px_2px_0_#092421]">
          {topicCatalog[question.topic].roundLabel}
        </div>
        <button
          type="button"
          onClick={onFlagIssue}
          className="absolute right-2 top-2 rounded-lg border-2 border-[#092421] bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#102f36] shadow-[2px_2px_0_#092421] transition hover:bg-[#fff1bf] active:translate-y-0.5"
          aria-label={`Flag an issue with this question image: ${question.imageAlt}`}
        >
          {issueFlash ? "Flagged" : "Flag image"}
        </button>
        <div className="absolute bottom-2 left-2 right-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-semibold text-white">
            {stageHint}
          </div>
          <div className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1.5 text-center text-sm font-black text-[#102f36] shadow-[2px_2px_0_#092421]">
            {sessionCorrect}/{sessionAnswered} this run
          </div>
        </div>
      </article>

      <article className="flex min-h-0 flex-col rounded-lg min-[900px]:overflow-y-auto border-2 border-[#092421] bg-white p-3 shadow-[3px_3px_0_#092421]">
        <div className="shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <DifficultyPill difficulty={difficulty} />
              <RoundContextPill label={roundContext} />
              <ProgressDots questions={questions} questionIndex={questionIndex} />
            </div>
            <p className="rounded-lg bg-[#ece5d5] px-2.5 py-1 text-xs font-black">
              {questionIndex + 1}/{questions.length}
            </p>
          </div>

          <h2 className="mt-2 text-[clamp(1.25rem,3vw,2.35rem)] font-black leading-[1.04] text-[#102f36] lg:text-[clamp(1.3rem,2.45vw,2.55rem)]">
            {question.prompt}
          </h2>

          {question.readingClue && <ReadingClue text={question.readingClue} />}

          {question.numberLine && showNumberLine && <NumberLine line={question.numberLine} />}
          {question.heatMeter && answered && <PepperHeatMeter meter={question.heatMeter} />}
          {question.comparison && showComparisonTable && <ComparisonTable cards={question.comparison} />}
        </div>

        <div className="mt-2 grid shrink-0 gap-2 xl:grid-cols-2">
          {choices.map((choice) => {
            const chosen = selected === choice;
            const correctChoice = answered && choice === question.answer;
            const heatChoice =
              (question.kind === "pepper-heat" || question.kind === "pepper-reading") && heatBands.includes(choice as HeatBand)
                ? (choice as HeatBand)
                : null;
            return (
              <button
                key={`${question.id}-${choice}`}
                onClick={() => onAnswer(choice)}
                className={`min-h-12 rounded-lg border-2 px-3 py-2 text-left text-base font-black leading-snug transition duration-150 ease-out active:translate-y-0.5 md:min-h-14 md:text-lg ${
                  correctChoice
                    ? "border-[#092421] bg-[#70d392] shadow-[3px_3px_0_#092421]"
                    : chosen
                      ? "border-[#092421] bg-[#f59a7d] shadow-[3px_3px_0_#092421]"
                      : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf] hover:shadow-[2px_2px_0_#092421]"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    <span>{choice}</span>
                    {heatChoice && <HeatChoiceEmoji heat={heatChoice} />}
                  </span>
                  {correctChoice && <span className="shrink-0 text-2xl leading-none">+</span>}
                  {chosen && !correctChoice && <span className="shrink-0 text-2xl leading-none">x</span>}
                </span>
              </button>
            );
          })}
        </div>

        {answered && lastResult && (
          <FeedbackPanel
            isCorrect={isCorrect}
            xpGain={lastResult.xpGain}
            leveledUp={lastResult.leveledUp}
            celebration={celebration}
            correctAnswer={question.answer}
            explanation={question.explanation}
            note={note}
            isLast={questionIndex === questions.length - 1}
            onNext={onNext}
          />
        )}

        {!answered && <SkipButton onClick={onSkip} />}
      </article>
    </section>
  );
}

function SortMode({
  round,
  picked,
  checked,
  result,
  miniRunAnswered,
  miniRunCorrect,
  celebration,
  difficulty,
  roundContext,
  onPick,
  onUndo,
  onCheck,
  onNext,
  onSkip,
}: {
  round: SortRound;
  picked: string[];
  checked: boolean;
  result: ResultState | null;
  miniRunAnswered: number;
  miniRunCorrect: number;
  celebration: string;
  difficulty: Difficulty;
  roundContext: string;
  onPick: (id: string) => void;
  onUndo: () => void;
  onCheck: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const answerTitles = round.answerIds
    .reduce<{ statValue: number; titles: string[] }[]>((groups, id) => {
      const card = sortCardById(round, id);
      if (!card) return groups;
      const lastGroup = groups.at(-1);
      if (lastGroup?.statValue === card.statValue) {
        lastGroup.titles.push(card.title);
        return groups;
      }
      return [...groups, { statValue: card.statValue, titles: [card.title] }];
    }, [])
    .map((group) => group.titles.join(" / "))
    .join(" -> ");
  const pickedSet = new Set(picked);

  return (
    <section className="grid flex-1 gap-2 min-[900px]:min-h-0 min-[900px]:overflow-hidden min-[900px]:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <article className="overflow-hidden rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 shadow-[4px_4px_0_#092421]">
        <div className="grid h-full min-h-[390px] grid-cols-2 gap-2 md:grid-cols-4 lg:min-h-0">
          {round.cards.map((card) => (
            <button
              key={card.id}
              onClick={() => onPick(card.id)}
              className={`relative min-h-[185px] overflow-hidden rounded-lg border-2 text-left transition active:translate-y-0.5 ${
                pickedSet.has(card.id) ? "border-[#f0c84b] bg-[#f0c84b] opacity-55" : "border-[#092421] bg-white hover:border-[#f0c84b]"
              }`}
            >
              <MediaImage image={card.image} imageAlt={card.imageAlt} topic={card.topic} />
              <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-2 shadow-[2px_2px_0_#092421]">
                <p className="text-base font-black leading-tight text-[#102f36]">{card.title}</p>
                <p className="mt-1 text-lg font-black leading-none text-[#9f3f2b]">{card.statDisplay}</p>
                <p className="mt-1 text-[11px] font-bold leading-tight text-[#5f6b5d]">{card.subStat}</p>
              </div>
            </button>
          ))}
        </div>
      </article>

      <article className="flex min-h-0 flex-col rounded-lg min-[900px]:overflow-y-auto border-2 border-[#092421] bg-white p-3 shadow-[3px_3px_0_#092421]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <RoundContextPill label={roundContext} />
          </div>
          <p className="rounded-lg bg-[#ece5d5] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} solved</p>
        </div>
        <h2 className="mt-2 text-[clamp(1.35rem,3vw,2.45rem)] font-black leading-[1.04] text-[#102f36]">{round.prompt}</h2>

        <div className="mt-3 grid gap-2">
          {round.answerIds.map((id, index) => {
            const pickedId = picked[index];
            const card = sortCardById(round, pickedId);
            const acceptableCards = sortAcceptableCardsAt(round, index);
            const correctCard = acceptableCards[0] ?? sortCardById(round, id);
            const correctLabel = acceptableCards.length > 1
              ? `${acceptableCards.map((item) => item.title).join(" / ")} (${correctCard?.statDisplay ?? round.statLabel})`
              : correctCard
                ? `${correctCard.title} (${correctCard.statDisplay})`
                : round.statLabel;
            const good = checked && isSortSlotCorrect(round, pickedId, index);
            const bad = checked && pickedId && !good;
            return (
              <div
                key={`${round.id}-slot-${id}`}
                className={`grid min-h-14 grid-cols-[44px_1fr] items-center gap-2 rounded-lg border-2 p-2 ${
                  good ? "border-[#2f7d4f] bg-[#e9ffe9]" : bad ? "border-[#9f3f2b] bg-[#fff0ea]" : "border-[#d9c7a7] bg-[#fff9ec]"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#092421] bg-white text-xl font-black">{index + 1}</div>
                <div>
                  <p className="text-base font-black leading-tight text-[#102f36]">{card ? card.title : "Tap a card"}</p>
                  <p className="text-xs font-bold text-[#5f6b5d]">
                    {checked && correctCard
                      ? good && card
                        ? `Correct: ${card.statDisplay}`
                        : `Correct: ${correctLabel}`
                      : round.statLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={onUndo} className="rounded-lg border-2 border-[#092421] bg-white px-3 py-3 text-base font-black hover:bg-[#fff1bf]">
            Undo
          </button>
          <button
            onClick={onCheck}
            disabled={picked.length !== round.answerIds.length || checked}
            className="rounded-lg border-2 border-[#092421] bg-[#102f36] px-3 py-3 text-base font-black text-white shadow-[3px_3px_0_#092421] disabled:opacity-45"
          >
            Check order
          </button>
        </div>

        {checked && result && (
          <FeedbackPanel
            isCorrect={result.correct}
            xpGain={result.xpGain}
            leveledUp={result.leveledUp}
            celebration={celebration}
            correctAnswer={answerTitles}
            explanation={round.explanation}
            note="Good try."
            isLast={false}
            onNext={onNext}
          />
        )}

        {!checked && <SkipButton onClick={onSkip} />}
      </article>
    </section>
  );
}

function FactMode({
  round,
  selected,
  result,
  miniRunAnswered,
  miniRunCorrect,
  celebration,
  difficulty,
  roundContext,
  onAnswer,
  onNext,
  onSkip,
}: {
  round: FactRound;
  selected: "True" | "False" | null;
  result: ResultState | null;
  miniRunAnswered: number;
  miniRunCorrect: number;
  celebration: string;
  difficulty: Difficulty;
  roundContext: string;
  onAnswer: (choice: "True" | "False") => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const answered = selected !== null;

  return (
    <section className="grid flex-1 gap-2 min-[900px]:min-h-0 min-[900px]:overflow-hidden min-[900px]:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <article className="relative min-h-[320px] overflow-hidden rounded-lg border-2 border-[#092421] bg-[#e3efe4] shadow-[4px_4px_0_#092421] min-[900px]:min-h-0">
        <MediaImage image={round.image} imageAlt={round.imageAlt} topic={round.topic} />
        <div className="absolute left-2 top-2 rounded-lg border-2 border-[#092421] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36] shadow-[2px_2px_0_#092421]">
          Fact card
        </div>
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-semibold text-white">
          Image: {round.imageCredit}
        </div>
      </article>

      <article className="flex min-h-0 flex-col rounded-lg min-[900px]:overflow-y-auto border-2 border-[#092421] bg-white p-3 shadow-[3px_3px_0_#092421]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <RoundContextPill label={roundContext} />
          </div>
          <p className="rounded-lg bg-[#ece5d5] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} caught</p>
        </div>

        <h2 className="mt-2 text-[clamp(1.35rem,3vw,2.5rem)] font-black leading-[1.04] text-[#102f36]">{round.prompt}</h2>
        <div className="mt-3 rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-3 shadow-[3px_3px_0_#092421]">
          <p className="text-[clamp(1.15rem,2.45vw,2rem)] font-black leading-tight text-[#102f36]">{round.statement}</p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["True", "False"] as const).map((choice) => {
            const correctChoice = answered && choice === round.answer;
            const chosenWrong = selected === choice && choice !== round.answer;
            return (
              <button
                key={choice}
                onClick={() => onAnswer(choice)}
                className={`min-h-18 rounded-lg border-2 px-3 py-3 text-center text-2xl font-black transition active:translate-y-0.5 ${
                  correctChoice
                    ? "border-[#092421] bg-[#70d392] shadow-[3px_3px_0_#092421]"
                    : chosenWrong
                      ? "border-[#092421] bg-[#f59a7d] shadow-[3px_3px_0_#092421]"
                      : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf]"
                }`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {answered && result && (
          <FeedbackPanel
            isCorrect={result.correct}
            xpGain={result.xpGain}
            leveledUp={result.leveledUp}
            celebration={celebration}
            correctAnswer={round.answer}
            explanation={round.explanation}
            note="Good try."
            isLast={false}
            onNext={onNext}
          />
        )}

        {!answered && <SkipButton onClick={onSkip} />}
      </article>
    </section>
  );
}

function RevealMode({
  round,
  selected,
  result,
  miniRunAnswered,
  miniRunCorrect,
  celebration,
  difficulty,
  roundContext,
  onAnswer,
  onNext,
  onSkip,
}: {
  round: RevealRound;
  selected: string | null;
  result: ResultState | null;
  miniRunAnswered: number;
  miniRunCorrect: number;
  celebration: string;
  difficulty: Difficulty;
  roundContext: string;
  onAnswer: (choice: string, revealedCount: number) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const totalTiles = difficulty === 1 ? 12 : 16;
  const startReveal = difficulty === 1 ? 4 : difficulty === 2 ? 2 : 1;
  const intervalMs = difficulty === 1 ? 850 : difficulty === 2 ? 1050 : 1250;
  const [revealed, setRevealed] = useState(startReveal);
  const answered = selected !== null;
  const visibleCount = answered ? totalTiles : revealed;
  const blurPx = answered ? 0 : Math.max(0, 18 - (visibleCount / totalTiles) * 18);
  const tileOrder = useMemo(() => {
    const seed = Array.from(round.id).reduce((total, char) => total + char.charCodeAt(0), 0);
    return Array.from({ length: totalTiles }, (_, index) => index).sort((a, b) => {
      const scoreA = Math.sin((seed + a * 17) * 99) * 10000;
      const scoreB = Math.sin((seed + b * 17) * 99) * 10000;
      return (scoreA - Math.floor(scoreA)) - (scoreB - Math.floor(scoreB));
    });
  }, [round.id, totalTiles]);
  const revealedTiles = new Set(tileOrder.slice(0, visibleCount));

  useEffect(() => {
    if (answered || revealed >= totalTiles) return;
    const timer = window.setTimeout(() => setRevealed((value) => Math.min(totalTiles, value + 1)), intervalMs);
    return () => window.clearTimeout(timer);
  }, [answered, intervalMs, revealed, totalTiles]);

  return (
    <section className="grid flex-1 gap-2 min-[900px]:min-h-0 min-[900px]:overflow-hidden min-[900px]:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <article className="relative min-h-[34dvh] overflow-hidden rounded-lg border-2 border-[#092421] bg-[#102f36] shadow-[4px_4px_0_#092421] min-[900px]:min-h-0">
        <div className="h-full transition-[filter] duration-500 ease-out" style={{ filter: `blur(${blurPx}px)` }}>
          <MediaImage image={round.card.image} imageAlt={round.card.imageAlt} topic={round.topic} />
        </div>
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gridTemplateRows: `repeat(${totalTiles / 4}, minmax(0, 1fr))` }}>
          {Array.from({ length: totalTiles }, (_, index) => (
            <div
              key={`${round.id}-tile-${index}`}
              className={`border border-[#f0c84b]/20 bg-[#102f36] transition duration-500 ${revealedTiles.has(index) ? "opacity-0" : "opacity-95"}`}
            />
          ))}
        </div>
        <div className="absolute left-2 top-2 rounded-lg border-2 border-[#092421] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36] shadow-[2px_2px_0_#092421]">
          Peek round
        </div>
        <div className="absolute bottom-2 left-2 right-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-semibold text-white">
            {answered ? `Image: ${round.card.imageCredit}` : "The picture reveals itself. Guess early for style points."}
          </div>
          <div className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1.5 text-center text-sm font-black text-[#102f36] shadow-[2px_2px_0_#092421]">
            {visibleCount}/{totalTiles} open
          </div>
        </div>
      </article>

      <article className="flex min-h-0 flex-col rounded-lg min-[900px]:overflow-y-auto border-2 border-[#092421] bg-white p-3 shadow-[3px_3px_0_#092421]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <RoundContextPill label={roundContext} />
          </div>
          <p className="rounded-lg bg-[#ece5d5] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} solved</p>
        </div>

        <h2 className="mt-2 text-[clamp(1.35rem,3vw,2.5rem)] font-black leading-[1.04] text-[#102f36]">{round.prompt}</h2>
        <div className="mt-2 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-2">
          <div className="flex items-center justify-between gap-3 text-xs font-black md:text-sm">
            <span>Picture reveal</span>
            <span>{Math.round((visibleCount / totalTiles) * 100)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e6d7bc]">
            <div className="h-full bg-[#9f3f2b] transition-[width] duration-500 ease-out" style={{ width: `${Math.round((visibleCount / totalTiles) * 100)}%` }} />
          </div>
        </div>

        <div className="mt-3 grid shrink-0 gap-2 xl:grid-cols-2">
          {round.choices.map((choice) => {
            const correctChoice = answered && choice === round.answer;
            const chosenWrong = selected === choice && choice !== round.answer;
            return (
              <button
                key={`${round.id}-${choice}`}
                onClick={() => onAnswer(choice, visibleCount)}
                className={`min-h-12 rounded-lg border-2 px-3 py-2 text-left text-base font-black leading-snug transition active:translate-y-0.5 md:min-h-14 md:text-lg ${
                  correctChoice
                    ? "border-[#092421] bg-[#70d392] shadow-[3px_3px_0_#092421]"
                    : chosenWrong
                      ? "border-[#092421] bg-[#f59a7d] shadow-[3px_3px_0_#092421]"
                      : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf] hover:shadow-[2px_2px_0_#092421]"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{choice}</span>
                  {correctChoice && <span className="shrink-0 text-2xl leading-none">+</span>}
                  {chosenWrong && <span className="shrink-0 text-2xl leading-none">x</span>}
                </span>
              </button>
            );
          })}
        </div>

        {answered && result && (
          <FeedbackPanel
            isCorrect={result.correct}
            xpGain={result.xpGain}
            leveledUp={result.leveledUp}
            celebration={celebration}
            correctAnswer={round.answer}
            explanation={round.explanation}
            note="Good try."
            isLast={false}
            onNext={onNext}
          />
        )}

        {!answered && <SkipButton onClick={onSkip} />}
      </article>
    </section>
  );
}

function NumberMode({
  round,
  selected,
  result,
  miniRunAnswered,
  miniRunCorrect,
  celebration,
  difficulty,
  roundContext,
  onAnswer,
  onNext,
  onSkip,
}: {
  round: NumberRound;
  selected: number | null;
  result: ResultState | null;
  miniRunAnswered: number;
  miniRunCorrect: number;
  celebration: string;
  difficulty: Difficulty;
  roundContext: string;
  onAnswer: (choice: number) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const answered = selected !== null;
  const answerLabel = `${round.answer.toLocaleString("en-US")} ${round.unit}`;

  return (
    <section className="grid flex-1 gap-2 min-[900px]:min-h-0 min-[900px]:overflow-hidden min-[900px]:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <KnowledgeCardsStage cards={round.cards} badge="Number case" footer={`${round.biggerLabel} minus ${round.smallerLabel}`} />

      <article className="flex min-h-0 flex-col rounded-lg min-[900px]:overflow-y-auto border-2 border-[#092421] bg-white p-3 shadow-[3px_3px_0_#092421]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <RoundContextPill label={roundContext} />
          </div>
          <p className="rounded-lg bg-[#ece5d5] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} solved</p>
        </div>

        <h2 className="mt-2 text-[clamp(1.2rem,2.6vw,2.25rem)] font-black leading-[1.06] text-[#102f36]">{round.prompt}</h2>

        <div className="mt-3 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#72543e]">{round.statLabel}</p>
          <p className="mt-1 text-3xl font-black leading-none text-[#102f36]">
            {round.biggerValue.toLocaleString("en-US")} - {round.smallerValue.toLocaleString("en-US")} = ?
          </p>
        </div>

        <div className="mt-3 grid shrink-0 gap-2 xl:grid-cols-2">
          {round.choices.map((choice) => {
            const correctChoice = answered && choice === round.answer;
            const chosenWrong = selected === choice && choice !== round.answer;
            return (
              <button
                key={`${round.id}-${choice}`}
                onClick={() => onAnswer(choice)}
                className={`min-h-14 rounded-lg border-2 px-3 py-2 text-left text-xl font-black leading-snug transition active:translate-y-0.5 ${
                  correctChoice
                    ? "border-[#092421] bg-[#70d392] shadow-[3px_3px_0_#092421]"
                    : chosenWrong
                      ? "border-[#092421] bg-[#f59a7d] shadow-[3px_3px_0_#092421]"
                      : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf]"
                }`}
              >
                {choice.toLocaleString("en-US")} {round.unit}
              </button>
            );
          })}
        </div>

        {answered && result && (
          <FeedbackPanel
            isCorrect={result.correct}
            xpGain={result.xpGain}
            leveledUp={result.leveledUp}
            celebration={celebration}
            correctAnswer={answerLabel}
            explanation={round.explanation}
            note="Good try."
            isLast={false}
            onNext={onNext}
          />
        )}

        {!answered && <SkipButton onClick={onSkip} />}
      </article>
    </section>
  );
}

function TopTrumpsMode({
  round,
  selected,
  result,
  miniRunAnswered,
  miniRunCorrect,
  celebration,
  difficulty,
  roundContext,
  onAnswer,
  onNext,
  onSkip,
}: {
  round: TopTrumpRound;
  selected: string | null;
  result: ResultState | null;
  miniRunAnswered: number;
  miniRunCorrect: number;
  celebration: string;
  difficulty: Difficulty;
  roundContext: string;
  onAnswer: (statId: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const answered = selected !== null;
  const selectedPlayerStat = selected ? round.player.stats.find((stat) => stat.id === selected) : null;
  const selectedComputerStat = selected ? round.computer.stats.find((stat) => stat.id === selected) : null;
  const playerWins = selectedPlayerStat && selectedComputerStat
    ? selectedPlayerStat.value === selectedComputerStat.value || (selectedPlayerStat.direction === "lower" ? selectedPlayerStat.value < selectedComputerStat.value : selectedPlayerStat.value > selectedComputerStat.value)
    : false;
  const answerLabel = selectedPlayerStat
    ? `${selectedPlayerStat.label}: ${round.player.title} ${selectedPlayerStat.display} vs ${round.computer.title} ${selectedComputerStat?.display ?? "?"}`
    : "Pick a category";
  const explanation = selectedPlayerStat && selectedComputerStat
    ? `${selectedPlayerStat.direction === "lower" ? "Lower wins here." : "Higher wins here."} ${answerLabel}. ${playerWins ? "Player wins the matchup." : "Computer wins the matchup."}`
    : round.player.fact;

  return (
    <section className="grid flex-1 gap-2 min-[900px]:min-h-0 min-[900px]:overflow-hidden min-[900px]:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <article className="overflow-hidden rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 shadow-[4px_4px_0_#092421]">
        <div className="grid h-full min-h-[420px] grid-cols-2 gap-2 lg:min-h-0">
          <TrumpCardView card={round.player} badge="Player" revealStats />
          <TrumpCardView card={round.computer} badge="Computer" revealStats={answered} />
        </div>
      </article>

      <article className="flex min-h-0 flex-col rounded-lg border-2 border-[#092421] bg-white p-3 shadow-[3px_3px_0_#092421] min-[900px]:overflow-y-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <RoundContextPill label={roundContext} />
          </div>
          <p className="rounded-lg bg-[#ece5d5] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} won</p>
        </div>

        <h2 className="mt-2 text-[clamp(1.35rem,3vw,2.5rem)] font-black leading-[1.04] text-[#102f36]">{round.prompt}</h2>
        <p className="mt-2 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] px-3 py-2 text-sm font-bold leading-snug text-[#5f6b5d]">
          Your card is face up. Pick the category you think beats the computer card.
        </p>

        <div className="mt-3 grid shrink-0 gap-2 xl:grid-cols-2">
          {round.player.stats.map((stat) => {
            const computerStat = round.computer.stats.find((item) => item.id === stat.id);
            const correctChoice = answered && selected === stat.id && playerWins;
            const chosenWrong = answered && selected === stat.id && !playerWins;
            return (
              <button
                key={`${round.id}-${stat.id}`}
                onClick={() => onAnswer(stat.id)}
                className={`min-h-16 rounded-lg border-2 px-3 py-2 text-left transition active:translate-y-0.5 ${
                  correctChoice
                    ? "border-[#092421] bg-[#70d392] shadow-[3px_3px_0_#092421]"
                    : chosenWrong
                      ? "border-[#092421] bg-[#f59a7d] shadow-[3px_3px_0_#092421]"
                      : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf]"
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-lg font-black leading-tight text-[#102f36]">{stat.label}</span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#72543e]">{stat.direction === "lower" ? "lower wins" : "higher wins"}</span>
                  </span>
                  <span className="text-right text-xl font-black leading-none text-[#9f3f2b]">
                    {stat.display}
                    {answered && computerStat && selected === stat.id && <span className="block text-xs text-[#5f6b5d]">CPU {computerStat.display}</span>}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {answered && result && (
          <FeedbackPanel
            isCorrect={result.correct}
            xpGain={result.xpGain}
            leveledUp={result.leveledUp}
            celebration={celebration}
            correctAnswer={answerLabel}
            explanation={explanation}
            note="Computer takes it."
            isLast={false}
            onNext={onNext}
          />
        )}

        {!answered && <SkipButton onClick={onSkip} />}
      </article>
    </section>
  );
}

function OddOneMode({
  round,
  selected,
  result,
  miniRunAnswered,
  miniRunCorrect,
  celebration,
  difficulty,
  roundContext,
  onAnswer,
  onNext,
  onSkip,
}: {
  round: OddRound;
  selected: string | null;
  result: ResultState | null;
  miniRunAnswered: number;
  miniRunCorrect: number;
  celebration: string;
  difficulty: Difficulty;
  roundContext: string;
  onAnswer: (cardId: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const answered = selected !== null;
  const answer = round.cards.find((card) => card.id === round.answerId);

  return (
    <section className="grid flex-1 gap-2 min-[900px]:min-h-0 min-[900px]:overflow-hidden min-[900px]:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <KnowledgeCardsStage cards={round.cards} badge="Logic set" footer="Find the card that breaks the rule." />

      <article className="flex min-h-0 flex-col rounded-lg min-[900px]:overflow-y-auto border-2 border-[#092421] bg-white p-3 shadow-[3px_3px_0_#092421]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <RoundContextPill label={roundContext} />
          </div>
          <p className="rounded-lg bg-[#ece5d5] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} found</p>
        </div>

        <h2 className="mt-2 text-[clamp(1.35rem,3vw,2.5rem)] font-black leading-[1.04] text-[#102f36]">{round.prompt}</h2>

        <div className="mt-3 grid shrink-0 gap-2 xl:grid-cols-2">
          {round.cards.map((card, index) => {
            const correctChoice = answered && card.id === round.answerId;
            const chosenWrong = selected === card.id && card.id !== round.answerId;
            return (
              <button
                key={`${round.id}-${card.id}`}
                onClick={() => onAnswer(card.id)}
                className={`min-h-14 rounded-lg border-2 px-3 py-2 text-left text-lg font-black leading-snug transition active:translate-y-0.5 ${
                  correctChoice
                    ? "border-[#092421] bg-[#70d392] shadow-[3px_3px_0_#092421]"
                    : chosenWrong
                      ? "border-[#092421] bg-[#f59a7d] shadow-[3px_3px_0_#092421]"
                      : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf]"
                }`}
              >
                {String.fromCharCode(65 + index)}: {card.title}
              </button>
            );
          })}
        </div>

        {answered && result && (
          <FeedbackPanel
            isCorrect={result.correct}
            xpGain={result.xpGain}
            leveledUp={result.leveledUp}
            celebration={celebration}
            correctAnswer={answer?.title ?? "Odd card"}
            explanation={`${round.reason} ${round.explanation}`}
            note="Good try."
            isLast={false}
            onNext={onNext}
          />
        )}

        {!answered && <SkipButton onClick={onSkip} />}
      </article>
    </section>
  );
}

function CollectionBook({
  cards,
  unlockedCards,
  topic,
  topicWins,
  modeWins,
}: {
  cards: KnowledgeCard[];
  unlockedCards: string[];
  topic: TopicId;
  topicWins: Progress["topicWins"];
  modeWins: Progress["modeWins"];
}) {
  const filtered = topic === "mixed" ? cards : cards.filter((card) => card.topic === topic);
  const unlocked = filtered.filter((card) => unlockedCards.includes(card.title));
  const topicCounts = Object.fromEntries(allKnowledgeTopics.map((item) => [
    item,
    cards.filter((card) => card.topic === item && unlockedCards.includes(card.title)).length,
  ])) as Record<KnowledgeTopic, number>;
  const totalResearchRecords = allKnowledgeTopics.reduce((total, item) => total + topicPacks[item].libraryCount, 0);

  return (
    <section className="grid flex-1 gap-2 min-[900px]:min-h-0 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-lg border-2 border-[#092421] bg-white p-3 shadow-[4px_4px_0_#092421]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9f3f2b]">Collection</p>
        <h2 className="mt-1 text-3xl font-black leading-none text-[#102f36]">{unlocked.length}/{filtered.length} cards</h2>
        <div className="mt-4 grid gap-2">
          {allKnowledgeTopics.map((item) => (
            <CollectionStat
              key={item}
              label={topicPacks[item].label}
              value={`${topicCounts[item]} / ${cards.filter((card) => card.topic === item).length}`}
              libraryValue={topicPacks[item].libraryCount.toString()}
              wins={topicWins[item]}
              samples={topicPacks[item].samples}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <HudStat label="Mix" value={modeWins.mix.toString()} />
          <HudStat label="Quiz" value={modeWins.quiz.toString()} />
          <HudStat label="Versus" value={modeWins.versus.toString()} />
          <HudStat label="Trumps" value={modeWins.trumps.toString()} />
          <HudStat label="Sort" value={modeWins.sort.toString()} />
          <HudStat label="Fact" value={modeWins.fact.toString()} />
          <HudStat label="Peek" value={modeWins.peek.toString()} />
          <HudStat label="Numbers" value={modeWins.number.toString()} />
          <HudStat label="Odd" value={modeWins.odd.toString()} />
        </div>
        <div className="mt-4 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-2">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#72543e]">Research library</p>
          <p className="mt-1 text-xl font-black leading-none text-[#102f36]">{totalResearchRecords.toLocaleString("en-US")} records</p>
          <div className="mt-2 grid gap-1.5">
            {allKnowledgeTopics.flatMap((item) => topicPacks[item].sources.map((source) => ({ ...source, key: `${item}-${source.label}` }))).map((source) => (
              <a key={source.key} href={source.url} target="_blank" rel="noreferrer" className="rounded-md bg-white px-2 py-1.5 text-xs font-bold leading-tight text-[#5f6b5d] underline-offset-2 hover:underline">
                {source.label}
              </a>
            ))}
          </div>
        </div>
      </aside>

      <article className="min-h-0 overflow-auto rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 shadow-[4px_4px_0_#092421]">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((card) => {
            const isUnlocked = unlockedCards.includes(card.title);
            return (
              <div key={`${card.topic}-${card.id}`} className="overflow-hidden rounded-lg border-2 border-[#092421] bg-white">
                <div className={`relative h-36 overflow-hidden bg-[#e3efe4] ${isUnlocked ? "" : "grayscale"}`}>
                  {isUnlocked ? <MediaImage image={card.image} imageAlt={card.imageAlt} topic={card.topic} /> : <LockedCard topic={card.topic} />}
                </div>
                <div className="p-2">
                  <p className="text-base font-black leading-tight text-[#102f36]">{isUnlocked ? card.title : "Locked card"}</p>
                  <p className="mt-1 text-sm font-black text-[#9f3f2b]">{isUnlocked ? card.statDisplay : "Win a round"}</p>
                  {isUnlocked && (
                    <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.1em] ${card.qualityScore >= 85 ? "text-[#2f7d4f]" : card.qualityScore >= 70 ? "text-[#a36b00]" : "text-[#9f3f2b]"}`}>
                      Quality {card.qualityScore}
                    </p>
                  )}
                  <p className="mt-1 min-h-8 text-xs font-semibold leading-tight text-[#5f6b5d]">{isUnlocked ? card.fact : "Answer correctly to add it here."}</p>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}

function ProgressDots({ questions, questionIndex }: { questions: Question[]; questionIndex: number }) {
  return (
    <div className="flex flex-wrap gap-0.5">
      {questions.map((item, index) => (
        <span
          key={item.id}
          className={`h-2.5 w-2.5 rounded-sm border-2 border-[#092421] ${
            index < questionIndex ? "bg-[#4fa775]" : index === questionIndex ? "bg-[#f0c84b]" : "bg-[#e6d7bc]"
          }`}
        />
      ))}
    </div>
  );
}

function ProfilePicker({
  profiles,
  activeProfileId,
  onChange,
  onCreate,
}: {
  profiles: LearnerProfile[];
  activeProfileId: string;
  onChange: (profileId: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-1.5">
      <label className="sr-only" htmlFor="profile-picker">Player</label>
      <select
        id="profile-picker"
        value={activeProfileId}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 max-w-32 rounded-lg border-2 border-[#092421] bg-white px-2 text-sm font-black text-[#102f36] shadow-[2px_2px_0_#092421] transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#f0c84b]"
      >
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>
      <button
        onClick={onCreate}
        className="h-10 rounded-lg border-2 border-[#092421] bg-white px-3 text-sm font-black text-[#102f36] transition hover:bg-[#fff1bf] active:translate-y-0.5"
      >
        +
      </button>
    </div>
  );
}

function DifficultySelector({ difficulty, onChange }: { difficulty: Difficulty; onChange: (difficulty: Difficulty) => void }) {
  return (
    <div className="grid min-w-0 grid-cols-3 gap-1 rounded-lg border-2 border-[#d9c7a7] bg-[#fffdf6] p-1">
      {difficultyOptions.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`min-h-11 min-w-0 rounded-md border-2 px-1 py-1 text-center transition active:translate-y-0.5 ${
            difficulty === item.id
              ? "border-[#092421] bg-[#f0c84b] shadow-[2px_2px_0_#092421]"
              : "border-transparent bg-transparent hover:border-[#d9c7a7] hover:bg-white"
          }`}
        >
          <span className="block truncate text-base font-black leading-none text-[#102f36]">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function CollectionAction({ active, value, onClick }: { active: boolean; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`min-w-0 rounded-md border-2 px-2 py-1 text-center transition active:translate-y-0.5 ${
        active ? "border-[#092421] bg-[#f0c84b] shadow-[2px_2px_0_#092421]" : "border-transparent bg-white hover:border-[#d9c7a7] hover:bg-[#fff1bf]"
      }`}
    >
      <span className="block truncate text-[8px] font-black uppercase tracking-[0.08em] text-[#72543e]">{active ? "Back" : "Cards"}</span>
      <span className="block truncate text-sm font-black leading-none text-[#102f36]">{active ? "Game" : value}</span>
    </button>
  );
}

function ReadingClue({ text }: { text: string }) {
  return (
    <div className="mt-2 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#72543e]">Read this</p>
      <p className="mt-1 text-base font-black leading-snug text-[#102f36] md:text-lg">“{text}”</p>
    </div>
  );
}

function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="sticky bottom-0 z-20 mt-auto bg-[#fffdf6]/95 pt-2 backdrop-blur">
      <button
        onClick={onClick}
        className="w-full rounded-lg border-2 border-[#d9c7a7] bg-white px-4 py-2 text-sm font-black text-[#5f6b5d] transition hover:border-[#092421] hover:bg-[#fff9ec] active:translate-y-0.5"
      >
        Skip question
      </button>
    </div>
  );
}

function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  const label = difficultyLabel(difficulty);
  return (
    <span className="shrink-0 rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#102f36] shadow-[2px_2px_0_#092421]">
      {label}
    </span>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border-2 border-[#d9c7a7] bg-white px-1.5 py-1 text-center">
      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-[#72543e]">{label}</p>
      <p className="text-lg font-black leading-none text-[#102f36] md:text-xl">{value}</p>
    </div>
  );
}

function CollectionStat({ label, value, libraryValue, wins, samples }: { label: string; value: string; libraryValue: string; wins: number; samples: readonly string[] }) {
  return (
    <div className="rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-black text-[#102f36]">{label}</p>
        <p className="text-sm font-black text-[#9f3f2b]">{value}</p>
      </div>
      <p className="mt-1 text-xs font-bold text-[#5f6b5d]">{wins} correct answers · {libraryValue} research records</p>
      <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-tight text-[#5f6b5d]">{samples.join(" | ")}</p>
    </div>
  );
}

function KnowledgeCardsStage({ cards, badge, footer }: { cards: KnowledgeCard[]; badge: string; footer: string }) {
  return (
    <article className="overflow-hidden rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 shadow-[4px_4px_0_#092421]">
      <div className="grid h-full min-h-[390px] grid-cols-2 gap-2 lg:min-h-0">
        {cards.map((card, index) => (
          <div key={`${badge}-${card.topic}-${card.id}`} className="relative overflow-hidden rounded-lg border-2 border-[#092421] bg-[#fff9ec]">
            <div className="absolute left-2 top-2 z-10 rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-2 py-1 text-sm font-black shadow-[2px_2px_0_#092421]">
              {String.fromCharCode(65 + index)}
            </div>
            <MediaImage image={card.image} imageAlt={card.imageAlt} topic={card.topic} />
            <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-1.5 shadow-[2px_2px_0_#092421]">
              <p className="text-base font-black leading-tight text-[#102f36]">{card.title}</p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <p className="text-lg font-black leading-none text-[#9f3f2b]">{card.statDisplay}</p>
                <p className="text-right text-[11px] font-bold leading-tight text-[#5f6b5d]">{card.subStat}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="rounded-lg border-2 border-[#092421] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36]">
          {badge}
        </div>
        <p className="rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-semibold text-white">{footer}</p>
      </div>
    </article>
  );
}

function TrumpCardView({ card, badge, revealStats }: { card: TopTrumpRound["player"]; badge: string; revealStats: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-[#092421] bg-[#fff9ec]">
      <div className="absolute left-2 top-2 z-10 rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-2 py-1 text-sm font-black shadow-[2px_2px_0_#092421]">
        {badge}
      </div>
      <div className={revealStats ? "" : "brightness-[.55] saturate-[.7]"}>
        <MediaImage image={card.image} imageAlt={card.imageAlt} topic={card.topic} />
      </div>
      {!revealStats && (
        <div className="absolute inset-0 grid place-items-center bg-[#102f36]/45 p-4">
          <div className="rounded-lg border-2 border-[#092421] bg-white px-4 py-3 text-center shadow-[3px_3px_0_#092421]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#72543e]">Face down</p>
            <p className="text-3xl font-black leading-none text-[#102f36]">?</p>
          </div>
        </div>
      )}
      <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-2 shadow-[2px_2px_0_#092421]">
        <p className="text-lg font-black leading-tight text-[#102f36]">{revealStats ? card.title : "Computer card"}</p>
        <p className="mt-0.5 text-[11px] font-bold leading-tight text-[#5f6b5d]">{revealStats ? card.subStat : "Stats reveal after your pick."}</p>
        {revealStats && (
          <div className="mt-2 grid gap-1">
            {card.stats.map((stat) => (
              <div key={`${card.id}-${stat.id}`} className="grid grid-cols-[1fr_auto] gap-2 rounded-md bg-[#fff9ec] px-2 py-1">
                <span className="truncate text-[11px] font-black uppercase tracking-[0.08em] text-[#72543e]">{stat.label}</span>
                <span className="text-sm font-black text-[#9f3f2b]">{stat.display}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonStage({ cards }: { cards: ComparisonCard[] }) {
  const displayCards = orderedComparisonCards(cards);
  return (
    <div className="grid h-full min-h-[260px] grid-cols-2 gap-1.5 bg-[#102f36] p-1.5">
      {displayCards.map((card) => (
        <div key={`${card.label}-${card.title}`} className="relative overflow-hidden rounded-lg border-2 border-[#092421] bg-[#fff9ec]">
          <div className="absolute left-2 top-2 z-10 rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-2 py-1 text-sm font-black shadow-[2px_2px_0_#092421]">
            {card.label}
          </div>
          <MediaImage image={card.image} imageAlt={card.imageAlt} topic={card.topic} />
          <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-1.5 shadow-[2px_2px_0_#092421]">
            <p className="text-base font-black leading-tight text-[#102f36]">{card.title}</p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#72543e]">{card.statLabel}</p>
                <p className="text-lg font-black leading-none text-[#9f3f2b]">{card.statValue}</p>
              </div>
              <p className="text-right text-[11px] font-bold leading-tight text-[#5f6b5d]">{card.subStat}</p>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e6d7bc]">
              <div className="h-full bg-[#9f3f2b]" style={{ width: `${Math.max(2, Math.min(100, (card.meterValue / card.meterMax) * 100))}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ComparisonTable({ cards }: { cards: ComparisonCard[] }) {
  const displayCards = orderedComparisonCards(cards);
  return (
    <div className="mt-2 grid gap-2 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-2 sm:grid-cols-2">
      {displayCards.map((card) => (
        <div key={`${card.label}-table-${card.title}`} className="rounded-md bg-white px-2 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-black text-[#102f36]">{card.label}: {card.title}</p>
            <p className="text-sm font-black text-[#9f3f2b]">{card.statValue}</p>
          </div>
          <p className="text-xs font-semibold text-[#5f6b5d]">{card.subStat}</p>
        </div>
      ))}
    </div>
  );
}

function PepperHeatMeter({ meter }: { meter: NonNullable<Question["heatMeter"]> }) {
  return (
    <div className="mt-2 rounded-lg border-2 border-[#d9c7a7] bg-[#fff1bf] p-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#72543e]">Pepper meter</p>
          <p className="text-lg font-black leading-none text-[#102f36]">{meter.label}</p>
        </div>
        <div className="text-2xl leading-none" aria-label={`${meter.icons} pepper heat`}>
          {meter.emoji}
        </div>
      </div>
      <p className="mt-1 text-xs font-bold text-[#5f6b5d]">{meter.line}</p>
    </div>
  );
}

function HeatChoiceEmoji({ heat }: { heat: HeatBand }) {
  const profile = heatProfiles[heat];
  if (profile.icons === 0) return null;

  return (
    <span className="shrink-0 whitespace-nowrap text-sm leading-none md:text-base" aria-label={`${profile.label} heat`}>
      {profile.emoji}
    </span>
  );
}

function NumberLine({ line }: { line: NonNullable<Question["numberLine"]> }) {
  return (
    <div className="mt-2 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-2">
      <div className="flex justify-between gap-3 text-xs font-black md:text-sm">
        <span>{line.label}</span>
        <span>{line.value.toLocaleString("en-US")} {line.unit}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e6d7bc]">
        <div className="h-full bg-[#9f3f2b]" style={{ width: `${Math.max(2, Math.min(100, (line.value / line.max) * 100))}%` }} />
      </div>
    </div>
  );
}

function FeedbackPanel({
  isCorrect,
  xpGain,
  leveledUp,
  celebration,
  correctAnswer,
  explanation,
  note,
  isLast,
  onNext,
}: {
  isCorrect: boolean;
  xpGain: number;
  leveledUp: boolean;
  celebration: string;
  correctAnswer: string;
  explanation: string;
  note: string;
  isLast: boolean;
  onNext: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ block: "end" });
  }, [correctAnswer, explanation, isCorrect]);

  return (
    <div ref={panelRef} className="sticky bottom-0 z-20 mt-auto bg-[#fffdf6]/95 pt-2 backdrop-blur">
      <div className={`rounded-lg border-2 p-2.5 ${isCorrect ? "border-[#2f7d4f] bg-[#e9ffe9]" : "border-[#9f3f2b] bg-[#fff0ea]"}`}>
        <div className="grid gap-2 md:grid-cols-[auto_1fr] md:items-start">
          <div className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border-2 border-[#092421] text-2xl font-black shadow-[2px_2px_0_#092421] ${isCorrect ? "bg-[#70d392]" : "bg-[#f59a7d]"}`}>
            {isCorrect ? (
              <>
                <span className="absolute left-1.5 top-1 h-2 w-2 rounded-sm bg-[#fff9ec]" />
                <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-sm bg-[#f0c84b]" />
                <span>+</span>
              </>
            ) : (
              "!"
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-black leading-tight text-[#102f36] md:text-xl">
                {isCorrect ? celebration : note}
              </p>
              <span className="rounded-full border-2 border-[#092421] bg-[#f0c84b] px-2 py-0.5 text-sm font-black text-[#102f36]">
                +{xpGain} glow
              </span>
              {leveledUp && (
                <span className="rounded-full border-2 border-[#092421] bg-[#70d392] px-2 py-0.5 text-sm font-black text-[#102f36]">
                  Glow up
                </span>
              )}
            </div>
            {!isCorrect && (
              <p className="mt-1 text-base font-black text-[#9f3f2b]">
                Answer: {correctAnswer}
              </p>
            )}
            <p className="mt-1 text-sm font-semibold leading-5 text-[#24373b]">
              {explanation}
            </p>
          </div>
        </div>
        <button onClick={onNext} className="mt-2 w-full rounded-lg border-2 border-[#092421] bg-[#102f36] px-4 py-2.5 text-base font-black text-white shadow-[3px_3px_0_#092421] hover:bg-[#23564f]">
          {isLast ? "Finish round" : "Next"}
        </button>
      </div>
    </div>
  );
}

function QuestionImage({ question }: { question: Pick<Question, "image" | "imageAlt" | "topic"> }) {
  return <MediaImage image={question.image} imageAlt={question.imageAlt} topic={question.topic} />;
}

function MediaImage({ image, imageAlt, topic }: { image: string; imageAlt: string; topic: KnowledgeTopic }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const failed = failedImage === image;

  if (failed) {
    return (
      <div className={`flex h-full min-h-[260px] w-full items-center justify-center p-6 ${topic === "peppers" ? "bg-[#f3d7c8]" : topic === "sharks" ? "bg-[#d6ece8]" : topic === "space" ? "bg-[#dfe4ef]" : "bg-[#e3efe4]"}`}>
        <div className="w-full max-w-sm rounded-lg border-2 border-[#20383d] bg-white p-5 text-center shadow-[4px_4px_0_#20383d]">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#20383d] bg-[#f0c84b] text-5xl">
            {topic === "peppers" ? "!" : topic === "sharks" ? "~" : topic === "space" ? "*" : "^"}
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-[#9f3f2b]">Picture clue</p>
          <p className="mt-1 text-3xl font-black leading-tight text-[#192f35]">{imageAlt}</p>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt={imageAlt} onError={() => setFailedImage(image)} className="field-guide-media h-full min-h-[260px] w-full object-cover" />
  );
}

function LockedCard({ topic }: { topic: KnowledgeTopic }) {
  return (
    <div className={`flex h-full min-h-36 items-center justify-center ${topic === "peppers" ? "bg-[#f3d7c8]" : topic === "sharks" ? "bg-[#d6ece8]" : topic === "space" ? "bg-[#dfe4ef]" : "bg-[#e3efe4]"}`}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#092421] bg-[#f0c84b] text-4xl font-black">?</div>
    </div>
  );
}

function autoDifficulty(current: Difficulty, correct: boolean, streak: number, answered: number, correctCount: number): Difficulty {
  const accuracy = correctCount / answered;
  if ((streak >= 5 || (answered >= 10 && accuracy >= 0.82)) && current < 3) {
    return (current + 1) as Difficulty;
  }
  if (!correct && answered >= 8 && accuracy < 0.45 && current > 1) {
    return (current - 1) as Difficulty;
  }
  return current;
}
