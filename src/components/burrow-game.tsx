"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { heatBands, heatProfiles, topicCatalog, topicIds, topicPacks, type Difficulty, type HeatBand, type TopicId } from "@/lib/game-data";
import {
  buildBuildFactRound,
  buildFactRound,
  buildNumberRound,
  buildOddRound,
  buildRevealRound,
  buildSortRound,
  collectionCards,
  modeOptions,
  type BuildFactRound,
  type FactRound,
  type GameMode,
  type KnowledgeCard,
  type KnowledgeTopic,
  type NumberRound,
  type OddRound,
  type RevealRound,
  type SortRound,
  type TopicScope,
} from "@/lib/game-modes";
import { buildSession, type ComparisonCard, type Question } from "@/lib/questions";

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
  modeWins: { mix: 0, quiz: 0, versus: 0, sort: 0, fact: 0, peek: 0, build: 0, number: 0, odd: 0 },
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
const allChallengeModes: ChallengeMode[] = ["quiz", "versus", "sort", "fact", "peek", "build", "number", "odd"];
const defaultMixPattern: ChallengeMode[] = ["quiz", "peek", "versus", "number", "build", "odd", "sort", "fact"];

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
  const cleaned = (interests ?? allKnowledgeTopics).filter((topic): topic is KnowledgeTopic => allKnowledgeTopics.includes(topic as KnowledgeTopic));
  return cleaned.length ? Array.from(new Set(cleaned)) : [...allKnowledgeTopics];
};

const defaultProfiles = (legacyProgress?: Partial<Progress>): ProfilesState => ({
  activeProfileId: "kal",
  profiles: [
    { id: "kal", name: "Kal", interests: [...allKnowledgeTopics], progress: normalizeProgress(legacyProgress) },
    { id: "remy", name: "Remy", interests: [...allKnowledgeTopics], progress: freshProgress() },
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

  if (mode !== "versus") {
    return buildSession(topic, difficulty, sessionSeed, seenIds);
  }

  const picked: Question[] = [];
  let pass = 0;
  while (picked.length < 16 && pass < 8) {
    const candidates = buildSession(topic, difficulty, sessionSeed + pass * 997, seenIds).filter((question) => question.comparison);
    candidates.forEach((question) => {
      if (picked.length < 16 && !picked.some((item) => item.id === question.id)) {
        picked.push(question);
      }
    });
    pass += 1;
  }
  return picked.length ? picked : buildSession(topic, difficulty, sessionSeed, seenIds);
};

const difficultyLabel = (difficulty: Difficulty) => difficultyOptions.find((item) => item.id === difficulty)?.label ?? "Easy";
const isQuestionAnswerCorrect = (question: Question, choice: string) => {
  if (!question.estimate) return choice === question.answer;
  const value = Number(choice);
  return Number.isFinite(value) && value >= question.estimate.correctMin && value <= question.estimate.correctMax;
};
const comparisonLabelRank = (value: string) => (value.startsWith("A") ? 0 : value.startsWith("B") ? 1 : 2);
const orderedComparisonCards = (cards: ComparisonCard[]) => [...cards].sort((a, b) => comparisonLabelRank(a.label) - comparisonLabelRank(b.label));
const orderedComparisonChoices = (choices: string[]) => [...choices].sort((a, b) => comparisonLabelRank(a) - comparisonLabelRank(b));

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
  const [buildRound, setBuildRound] = useState<BuildFactRound>(() => buildBuildFactRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [buildPicked, setBuildPicked] = useState<string[]>([]);
  const [buildChecked, setBuildChecked] = useState(false);
  const [numberRound, setNumberRound] = useState<NumberRound>(() => buildNumberRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [numberSelected, setNumberSelected] = useState<number | null>(null);
  const [oddRound, setOddRound] = useState<OddRound>(() => buildOddRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [oddSelected, setOddSelected] = useState<string | null>(null);
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
  const nextLevelXp = progress.level * 120;
  const levelProgress = Math.min(100, Math.round(((progress.xp % 120) / 120) * 100));
  const activeChallengeAnswered =
    activeChallengeMode === "sort"
      ? sortChecked
      : activeChallengeMode === "fact"
        ? factSelected !== null
        : activeChallengeMode === "peek"
          ? revealSelected !== null
          : activeChallengeMode === "build"
            ? buildChecked
            : activeChallengeMode === "number"
              ? numberSelected !== null
              : activeChallengeMode === "odd"
                ? oddSelected !== null
                : answered;
  const sessionAnswered = mode === "mix" ? questionIndex + (activeChallengeAnswered ? 1 : 0) : questionIndex + (answered ? 1 : 0);
  const unlockedCount = allCards.filter((card) => progress.unlockedCards.includes(card.title)).length;
  const currentTopicScope = adaptiveTopicScopeFor(topic, activeInterests, progress);
  const accuracy = progress.answered ? Math.round((progress.correct / progress.answered) * 100) : 0;

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
      setBuildRound(buildBuildFactRound(loadedScope, loadedProfile.progress.difficulty, 20260503));
      setNumberRound(buildNumberRound(loadedScope, loadedProfile.progress.difficulty, 20260513));
      setOddRound(buildOddRound(loadedScope, loadedProfile.progress.difficulty, 20260523));
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
    if (activeChallengeMode === "build") return { mode: activeChallengeMode, topic: buildRound.topic, itemId: buildRound.id, title: buildRound.card.title, prompt: buildRound.prompt, image: buildRound.card.image };
    if (activeChallengeMode === "number") return { mode: activeChallengeMode, topic: numberRound.topic, itemId: numberRound.id, title: numberRound.biggerLabel, prompt: numberRound.prompt, image: numberRound.cards[0]?.image };
    if (activeChallengeMode === "odd") return { mode: activeChallengeMode, topic: oddRound.topic, itemId: oddRound.id, title: "Odd one round", prompt: oddRound.prompt, image: oddRound.cards[0]?.image };

    return {
      mode: activeChallengeMode,
      topic: question?.topic ?? topic,
      itemId: question?.id ?? "unknown",
      title: question?.imageAlt ?? "Question",
      prompt: question?.prompt ?? "Question issue",
      image: question?.image,
    };
  };

  const flagCurrentIssue = () => {
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
    setCelebration("Flagged for content review.");
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
    setBuildPicked([]);
    setBuildChecked(false);
    setNumberSelected(null);
    setOddSelected(null);
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
    setBuildRound(buildBuildFactRound(scope, nextProfile.progress.difficulty, seed + 73));
    setNumberRound(buildNumberRound(scope, nextProfile.progress.difficulty, seed + 89));
    setOddRound(buildOddRound(scope, nextProfile.progress.difficulty, seed + 97));
  };

  const startMode = (nextMode: GameMode) => {
    const seed = freshSeed(nextMode.length);
    setShowCollection(false);
    setMode(nextMode);
    resetRunState();
    setQuestions(buildQuestionRun(currentTopicScope, nextMode, progress.difficulty, seed, progress.seenIds, selectedMixModes));
    setSortRound(buildSortRound(currentTopicScope, progress.difficulty, seed + 59));
    setFactRound(buildFactRound(currentTopicScope, progress.difficulty, seed + 71));
    setRevealRound(buildRevealRound(currentTopicScope, progress.difficulty, seed + 83));
    setBuildRound(buildBuildFactRound(currentTopicScope, progress.difficulty, seed + 91));
    setNumberRound(buildNumberRound(currentTopicScope, progress.difficulty, seed + 103));
    setOddRound(buildOddRound(currentTopicScope, progress.difficulty, seed + 109));
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
    setBuildRound(buildBuildFactRound(currentTopicScope, nextDifficulty, seed + 59));
    setNumberRound(buildNumberRound(currentTopicScope, nextDifficulty, seed + 67));
    setOddRound(buildOddRound(currentTopicScope, nextDifficulty, seed + 71));
    setCelebration(`${difficultyLabel(nextDifficulty)} questions.`);
  };

  const openCollection = () => {
    setShowCollection(true);
    setLastResult(null);
    setCelebration("Collection opened.");
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
      interests: [...allKnowledgeTopics],
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

  const toggleInterest = (interest: KnowledgeTopic) => {
    const nextInterests = activeInterests.includes(interest)
      ? activeInterests.length === 1
        ? activeInterests
        : activeInterests.filter((item) => item !== interest)
      : [...activeInterests, interest];
    const nextProfile = { ...activeProfile, interests: nextInterests };
    const nextTopic = playableTopic(topic, nextInterests);
    const seed = freshSeed(interest.length + nextInterests.length * 41);

    setProfilesState((current) => ({
      ...current,
      profiles: current.profiles.map((profile) => (profile.id === activeProfile.id ? nextProfile : profile)),
    }));
    restartPlay(nextTopic, mode, nextProfile, seed);
    setCelebration(`${activeProfile.name}'s mix updated.`);
  };

  const toggleMixMode = (challengeMode: ChallengeMode) => {
    const currentModes = selectedMixModes;
    const nextModes = currentModes.includes(challengeMode)
      ? currentModes.length === 1
        ? currentModes
        : currentModes.filter((item) => item !== challengeMode)
      : defaultMixPattern.filter((item) => currentModes.includes(item) || item === challengeMode);
    const seed = freshSeed(challengeMode.length + nextModes.length * 31);

    setMixModes(nextModes);
    if (mode === "mix") {
      resetRunState();
      setQuestions(buildQuestionRun(currentTopicScope, "mix", progress.difficulty, seed, progress.seenIds, nextModes));
      setSortRound(buildSortRound(currentTopicScope, progress.difficulty, seed + 29));
      setFactRound(buildFactRound(currentTopicScope, progress.difficulty, seed + 37));
      setRevealRound(buildRevealRound(currentTopicScope, progress.difficulty, seed + 43));
      setBuildRound(buildBuildFactRound(currentTopicScope, progress.difficulty, seed + 49));
      setNumberRound(buildNumberRound(currentTopicScope, progress.difficulty, seed + 53));
      setOddRound(buildOddRound(currentTopicScope, progress.difficulty, seed + 59));
    }
    setCelebration(`${nextModes.length} games in Mix.`);
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
    setBuildPicked([]);
    setBuildChecked(false);
    setNumberSelected(null);
    setOddSelected(null);
    setSortRound(buildSortRound(currentTopicScope, progress.difficulty, seed + 29));
    setFactRound(buildFactRound(currentTopicScope, progress.difficulty, seed + 37));
    setRevealRound(buildRevealRound(currentTopicScope, progress.difficulty, seed + 43));
    setBuildRound(buildBuildFactRound(currentTopicScope, progress.difficulty, seed + 49));
    setNumberRound(buildNumberRound(currentTopicScope, progress.difficulty, seed + 53));
    setOddRound(buildOddRound(currentTopicScope, progress.difficulty, seed + 59));
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
    const correct = sortPicked.every((id, index) => id === sortRound.answerIds[index]);
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

  const checkBuild = () => {
    if (buildChecked || buildPicked.length !== buildRound.answerIds.length) return;
    const correct = buildPicked.every((id, index) => id === buildRound.answerIds[index]);
    const xpGain = correct ? 24 + progress.difficulty * 6 : 7;
    const result = reward({
      correct,
      xpGain,
      topicName: buildRound.topic,
      modeName: mode === "mix" ? "mix" : "build",
      seenId: buildRound.id,
      unlockTitles: [buildRound.card.title],
    });
    setBuildChecked(true);
    setMiniRunAnswered((value) => value + 1);
    setMiniRunCorrect((value) => value + (correct ? 1 : 0));
    if (mode === "mix") setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? "Sentence builder!" : "Good try. Read it in order.");
    setLastResult(result);
  };

  const nextBuildRound = () => {
    const seed = freshSeed(miniRunAnswered * 29);
    setBuildRound(buildBuildFactRound(currentTopicScope, progress.difficulty, seed));
    setBuildPicked([]);
    setBuildChecked(false);
    setLastResult(null);
    setCelebration("New fact build.");
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

  const resetProgress = () => {
    const seed = freshSeed(211);
    const reset = freshProgress();
    setProgress(reset);
    setShowCollection(false);
    setQuestions(buildQuestionRun(currentTopicScope, mode, reset.difficulty, seed, reset.seenIds, selectedMixModes));
    setSortRound(buildSortRound(currentTopicScope, reset.difficulty, seed + 29));
    setFactRound(buildFactRound(currentTopicScope, reset.difficulty, seed + 37));
    setRevealRound(buildRevealRound(currentTopicScope, reset.difficulty, seed + 43));
    setBuildRound(buildBuildFactRound(currentTopicScope, reset.difficulty, seed + 49));
    setNumberRound(buildNumberRound(currentTopicScope, reset.difficulty, seed + 53));
    setOddRound(buildOddRound(currentTopicScope, reset.difficulty, seed + 59));
    resetRunState();
    setCelebration("Progress reset. Fresh start.");
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#0f2e35] text-[#1d2528] lg:h-dvh lg:overflow-hidden">
      <section className="flex min-h-dvh flex-col gap-1.5 bg-[linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:32px_32px] p-1.5 md:p-2 lg:h-full lg:min-h-0">
        <header className="w-full max-w-full min-w-0 shrink-0 rounded-xl border-2 border-[#082329] bg-[#fff2d7] p-2 shadow-[3px_3px_0_#082329]">
          <div className="grid w-full max-w-full min-w-0 gap-2 lg:grid-cols-[minmax(240px,.72fr)_minmax(360px,1.08fr)_minmax(260px,.8fr)] lg:items-center">
            <div className="grid min-w-0 gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <Image
                  src="/icons/burrow-icon-64.png"
                  alt=""
                  aria-hidden="true"
                  width={64}
                  height={64}
                  className="h-12 w-12 shrink-0 rounded-2xl border-2 border-[#082329] bg-[#f5d39c] shadow-[2px_2px_0_#082329]"
                />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#81533b]">Let your Kid go deep</p>
                  <h1 className="text-2xl font-black leading-none text-[#321e16] md:text-3xl">Burrow</h1>
                </div>
              </div>
              <ProfilePicker profiles={profilesState.profiles} activeProfileId={activeProfile.id} onChange={switchProfile} onCreate={createProfile} />
            </div>

            <div className="min-w-0 rounded-lg border-2 border-[#cfbfae] bg-[#fffaf4] p-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#7a5d4b]">Level {progress.level}</p>
                  <p className="text-sm font-black leading-tight text-[#102f36]">{Math.max(0, nextLevelXp - progress.xp)} XP to next level</p>
                </div>
                <p className="rounded-full border-2 border-[#082329] bg-[#f3c647] px-2.5 py-1 text-sm font-black text-[#102f36]">
                  {progress.xp} XP
                </p>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full border-2 border-[#082329] bg-white">
                <div className="h-full bg-[#4fb286] transition-[width] duration-500 ease-out" style={{ width: `${levelProgress}%` }} />
              </div>
              <div className="mt-2 grid min-w-0 grid-cols-2 gap-1.5 md:grid-cols-3">
                <CollectionAction active={showCollection} value={`${unlockedCount}/${allCards.length}`} onClick={openCollection} />
                <MiniStat label="Streak" value={progress.streak.toString()} />
                <MiniStat label="Hit" value={`${accuracy}%`} />
              </div>
            </div>

            <div className="grid min-w-0 gap-2 sm:grid-cols-[1fr_auto] lg:grid-cols-1">
              <TopicMixMenu activeInterests={activeInterests} onToggle={toggleInterest} />
              <DifficultySelector difficulty={progress.difficulty} onChange={setQuestionDifficulty} />
            </div>
          </div>

          <div className="mt-2 grid w-full max-w-full min-w-0 gap-2 md:grid-cols-[minmax(180px,.7fr)_minmax(220px,.9fr)_auto] md:items-center">
            <PlayModePicker mode={mode} onChange={startMode} />
            <MixModeMenu activeModes={selectedMixModes} onToggle={toggleMixMode} />
            <div className="grid gap-1.5 sm:grid-cols-2 md:grid-cols-1">
              <button onClick={flagCurrentIssue} className="min-h-10 rounded-lg border-2 border-[#082329] bg-[#fff8ec] px-3 py-2 text-sm font-black text-[#102f36] transition hover:bg-[#fff0c2] active:translate-y-0.5">
                {issueFlash ? "Flagged" : "Flag issue"}{issueCount ? ` (${issueCount})` : ""}
              </button>
              <button onClick={resetProgress} className="min-h-10 rounded-lg border-2 border-[#082329] bg-white px-3 py-2 text-sm font-black text-[#102f36] transition hover:bg-[#ffd7ce] active:translate-y-0.5">
                Reset
              </button>
            </div>
          </div>
        </header>

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
            onAnswer={answer}
            onNext={advance}
            onSkip={advance}
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
            onAnswer={answerFact}
            onNext={mode === "mix" ? advanceMix : nextFactRound}
            onSkip={mode === "mix" ? advanceMix : nextFactRound}
          />
        )}

        {!showCollection && activeChallengeMode === "peek" && (
          <RevealMode
            round={revealRound}
            selected={revealSelected}
            result={lastResult}
            miniRunAnswered={miniRunAnswered}
            miniRunCorrect={miniRunCorrect}
            celebration={celebration}
            difficulty={progress.difficulty}
            onAnswer={answerReveal}
            onNext={mode === "mix" ? advanceMix : nextRevealRound}
            onSkip={mode === "mix" ? advanceMix : nextRevealRound}
          />
        )}

        {!showCollection && activeChallengeMode === "build" && (
          <BuildFactMode
            round={buildRound}
            picked={buildPicked}
            checked={buildChecked}
            result={lastResult}
            miniRunAnswered={miniRunAnswered}
            miniRunCorrect={miniRunCorrect}
            celebration={celebration}
            difficulty={progress.difficulty}
            onPick={(id) => {
              if (buildChecked || buildPicked.includes(id)) return;
              setBuildPicked((value) => [...value, id]);
            }}
            onUndo={() => {
              if (!buildChecked) setBuildPicked((value) => value.slice(0, -1));
            }}
            onCheck={checkBuild}
            onNext={mode === "mix" ? advanceMix : nextBuildRound}
            onSkip={mode === "mix" ? advanceMix : nextBuildRound}
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
            onAnswer={answerNumber}
            onNext={mode === "mix" ? advanceMix : nextNumberRound}
            onSkip={mode === "mix" ? advanceMix : nextNumberRound}
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
            onAnswer={answerOdd}
            onNext={mode === "mix" ? advanceMix : nextOddRound}
            onSkip={mode === "mix" ? advanceMix : nextOddRound}
          />
        )}
      </section>
    </main>
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
  onAnswer,
  onNext,
  onSkip,
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
  onAnswer: (choice: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const isDifferenceQuestion = question.kind === "building-difference" || question.kind === "shark-difference";
  const showNumberLine = Boolean(question.numberLine) && (answered || (Boolean(question.comparison) && !isDifferenceQuestion));
  const showComparisonTable = Boolean(question.comparison) && (answered || !isDifferenceQuestion);
  const choices = question.comparison ? orderedComparisonChoices(question.choices) : question.choices;
  const stageHint = question.comparison
    ? isDifferenceQuestion
      ? "Use the numbers in the question. Subtract smaller from bigger."
      : "Look at both cards. Bigger number wins."
    : `Image: ${question.imageCredit}`;

  return (
    <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <article className="relative min-h-[34dvh] overflow-hidden rounded-xl border-2 border-[#082329] bg-[#d8e8e5] shadow-[4px_4px_0_#082329] md:min-h-0">
        {question.comparison ? <ComparisonStage cards={question.comparison} /> : <QuestionImage question={question} />}
        <div className="absolute left-2 top-2 rounded-lg border-2 border-[#082329] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36] shadow-[2px_2px_0_#082329]">
          {topicCatalog[question.topic].roundLabel}
        </div>
        <div className="absolute bottom-2 left-2 right-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-semibold text-white">
            {stageHint}
          </div>
          <div className="rounded-lg border-2 border-[#082329] bg-[#f3c647] px-3 py-1.5 text-center text-sm font-black text-[#102f36] shadow-[2px_2px_0_#082329]">
            {sessionCorrect}/{sessionAnswered} this run
          </div>
        </div>
      </article>

      <article className="flex min-h-[42dvh] flex-col overflow-hidden rounded-xl border-2 border-[#082329] bg-white p-3 shadow-[3px_3px_0_#082329] md:min-h-0">
        <div className="shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <DifficultyPill difficulty={difficulty} />
              <ProgressDots questions={questions} questionIndex={questionIndex} />
            </div>
            <p className="rounded-lg bg-[#eaf3f0] px-2.5 py-1 text-xs font-black">
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

        {question.estimate ? (
          <EstimateSlider key={question.id} question={question} selected={selected} answered={answered} isCorrect={isCorrect} onAnswer={onAnswer} />
        ) : (
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
                      ? "border-[#082329] bg-[#78d99a] shadow-[3px_3px_0_#082329]"
                      : chosen
                        ? "border-[#082329] bg-[#ff9f8d] shadow-[3px_3px_0_#082329]"
                        : "border-[#cfbfae] bg-[#fffaf4] hover:border-[#082329] hover:bg-[#fff0c2] hover:shadow-[2px_2px_0_#082329]"
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
        )}

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
  onPick: (id: string) => void;
  onUndo: () => void;
  onCheck: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const answerTitles = round.answerIds.map((id) => round.cards.find((card) => card.id === id)?.title).filter(Boolean).join(" -> ");
  const pickedSet = new Set(picked);

  return (
    <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <article className="overflow-hidden rounded-xl border-2 border-[#082329] bg-[#102f36] p-2 shadow-[4px_4px_0_#082329]">
        <div className="grid h-full min-h-[390px] grid-cols-2 gap-2 md:grid-cols-4 lg:min-h-0">
          {round.cards.map((card) => (
            <button
              key={card.id}
              onClick={() => onPick(card.id)}
              className={`relative min-h-[185px] overflow-hidden rounded-lg border-2 text-left transition active:translate-y-0.5 ${
                pickedSet.has(card.id) ? "border-[#f3c647] bg-[#f3c647] opacity-55" : "border-[#082329] bg-white hover:border-[#f3c647]"
              }`}
            >
              <MediaImage image={card.image} imageAlt={card.imageAlt} topic={card.topic} />
              <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#082329] bg-white/95 p-2 shadow-[2px_2px_0_#082329]">
                <p className="text-base font-black leading-tight text-[#102f36]">{card.title}</p>
                <p className="mt-1 text-lg font-black leading-none text-[#b5412b]">{card.statDisplay}</p>
                <p className="mt-1 text-[11px] font-bold leading-tight text-[#405257]">{card.subStat}</p>
              </div>
            </button>
          ))}
        </div>
      </article>

      <article className="flex min-h-[380px] flex-col rounded-xl border-2 border-[#082329] bg-white p-3 shadow-[3px_3px_0_#082329] lg:min-h-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <p className="rounded-lg border-2 border-[#082329] bg-[#f3c647] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36]">
              Sort board
            </p>
          </div>
          <p className="rounded-lg bg-[#eaf3f0] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} solved</p>
        </div>
        <h2 className="mt-2 text-[clamp(1.35rem,3vw,2.45rem)] font-black leading-[1.04] text-[#102f36]">{round.prompt}</h2>

        <div className="mt-3 grid gap-2">
          {round.answerIds.map((id, index) => {
            const pickedId = picked[index];
            const card = round.cards.find((item) => item.id === pickedId);
            const correctCard = round.cards.find((item) => item.id === id);
            const good = checked && pickedId === id;
            const bad = checked && pickedId && pickedId !== id;
            return (
              <div
                key={`${round.id}-slot-${id}`}
                className={`grid min-h-14 grid-cols-[44px_1fr] items-center gap-2 rounded-lg border-2 p-2 ${
                  good ? "border-[#28764a] bg-[#e9ffe9]" : bad ? "border-[#b5412b] bg-[#fff0ea]" : "border-[#cfbfae] bg-[#fff8ec]"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#082329] bg-white text-xl font-black">{index + 1}</div>
                <div>
                  <p className="text-base font-black leading-tight text-[#102f36]">{card ? card.title : "Tap a card"}</p>
                  <p className="text-xs font-bold text-[#59686b]">{checked && correctCard ? `Correct: ${correctCard.title} (${correctCard.statDisplay})` : round.statLabel}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={onUndo} className="rounded-lg border-2 border-[#082329] bg-white px-3 py-3 text-base font-black hover:bg-[#fff0c2]">
            Undo
          </button>
          <button
            onClick={onCheck}
            disabled={picked.length !== round.answerIds.length || checked}
            className="rounded-lg border-2 border-[#082329] bg-[#102f36] px-3 py-3 text-base font-black text-white shadow-[3px_3px_0_#082329] disabled:opacity-45"
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
  onAnswer: (choice: "True" | "False") => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const answered = selected !== null;

  return (
    <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <article className="relative min-h-[320px] overflow-hidden rounded-xl border-2 border-[#082329] bg-[#d8e8e5] shadow-[4px_4px_0_#082329] md:min-h-0">
        <MediaImage image={round.image} imageAlt={round.imageAlt} topic={round.topic} />
        <div className="absolute left-2 top-2 rounded-lg border-2 border-[#082329] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36] shadow-[2px_2px_0_#082329]">
          Fact card
        </div>
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-semibold text-white">
          Image: {round.imageCredit}
        </div>
      </article>

      <article className="flex min-h-[380px] flex-col rounded-xl border-2 border-[#082329] bg-white p-3 shadow-[3px_3px_0_#082329] md:min-h-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <p className="rounded-lg border-2 border-[#082329] bg-[#78d99a] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36]">
              Read and decide
            </p>
          </div>
          <p className="rounded-lg bg-[#eaf3f0] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} caught</p>
        </div>

        <h2 className="mt-2 text-[clamp(1.35rem,3vw,2.5rem)] font-black leading-[1.04] text-[#102f36]">{round.prompt}</h2>
        <div className="mt-3 rounded-lg border-2 border-[#082329] bg-[#fff8ec] p-3 shadow-[3px_3px_0_#082329]">
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
                    ? "border-[#082329] bg-[#78d99a] shadow-[3px_3px_0_#082329]"
                    : chosenWrong
                      ? "border-[#082329] bg-[#ff9f8d] shadow-[3px_3px_0_#082329]"
                      : "border-[#cfbfae] bg-[#fffaf4] hover:border-[#082329] hover:bg-[#fff0c2]"
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
    <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <article className="relative min-h-[34dvh] overflow-hidden rounded-xl border-2 border-[#082329] bg-[#102f36] shadow-[4px_4px_0_#082329] md:min-h-0">
        <div className="h-full transition-[filter] duration-500 ease-out" style={{ filter: `blur(${blurPx}px)` }}>
          <MediaImage image={round.card.image} imageAlt={round.card.imageAlt} topic={round.topic} />
        </div>
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gridTemplateRows: `repeat(${totalTiles / 4}, minmax(0, 1fr))` }}>
          {Array.from({ length: totalTiles }, (_, index) => (
            <div
              key={`${round.id}-tile-${index}`}
              className={`border border-[#f3c647]/20 bg-[#102f36] transition duration-500 ${revealedTiles.has(index) ? "opacity-0" : "opacity-95"}`}
            />
          ))}
        </div>
        <div className="absolute left-2 top-2 rounded-lg border-2 border-[#082329] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36] shadow-[2px_2px_0_#082329]">
          Peek round
        </div>
        <div className="absolute bottom-2 left-2 right-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-semibold text-white">
            {answered ? `Image: ${round.card.imageCredit}` : "The picture reveals itself. Guess early for style points."}
          </div>
          <div className="rounded-lg border-2 border-[#082329] bg-[#f3c647] px-3 py-1.5 text-center text-sm font-black text-[#102f36] shadow-[2px_2px_0_#082329]">
            {visibleCount}/{totalTiles} open
          </div>
        </div>
      </article>

      <article className="flex min-h-[42dvh] flex-col overflow-hidden rounded-xl border-2 border-[#082329] bg-white p-3 shadow-[3px_3px_0_#082329] md:min-h-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <p className="rounded-lg border-2 border-[#082329] bg-[#78d99a] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36]">
              Picture clue
            </p>
          </div>
          <p className="rounded-lg bg-[#eaf3f0] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} solved</p>
        </div>

        <h2 className="mt-2 text-[clamp(1.35rem,3vw,2.5rem)] font-black leading-[1.04] text-[#102f36]">{round.prompt}</h2>
        <div className="mt-2 rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2">
          <div className="flex items-center justify-between gap-3 text-xs font-black md:text-sm">
            <span>Picture reveal</span>
            <span>{Math.round((visibleCount / totalTiles) * 100)}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#eadfce]">
            <div className="h-full bg-[#b5412b] transition-[width] duration-500 ease-out" style={{ width: `${Math.round((visibleCount / totalTiles) * 100)}%` }} />
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
                    ? "border-[#082329] bg-[#78d99a] shadow-[3px_3px_0_#082329]"
                    : chosenWrong
                      ? "border-[#082329] bg-[#ff9f8d] shadow-[3px_3px_0_#082329]"
                      : "border-[#cfbfae] bg-[#fffaf4] hover:border-[#082329] hover:bg-[#fff0c2] hover:shadow-[2px_2px_0_#082329]"
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

function BuildFactMode({
  round,
  picked,
  checked,
  result,
  miniRunAnswered,
  miniRunCorrect,
  celebration,
  difficulty,
  onPick,
  onUndo,
  onCheck,
  onNext,
  onSkip,
}: {
  round: BuildFactRound;
  picked: string[];
  checked: boolean;
  result: ResultState | null;
  miniRunAnswered: number;
  miniRunCorrect: number;
  celebration: string;
  difficulty: Difficulty;
  onPick: (id: string) => void;
  onUndo: () => void;
  onCheck: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const pickedSet = new Set(picked);
  const pickedTokens = picked.map((id) => round.tokens.find((token) => token.id === id)).filter(Boolean) as BuildFactRound["tokens"];

  return (
    <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <article className="relative min-h-[34dvh] overflow-hidden rounded-xl border-2 border-[#082329] bg-[#d8e8e5] shadow-[4px_4px_0_#082329] md:min-h-0">
        <MediaImage image={round.card.image} imageAlt={round.card.imageAlt} topic={round.topic} />
        <div className="absolute left-2 top-2 rounded-lg border-2 border-[#082329] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36] shadow-[2px_2px_0_#082329]">
          Build round
        </div>
        <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#082329] bg-white/95 p-2 shadow-[2px_2px_0_#082329]">
          <p className="text-lg font-black leading-tight text-[#102f36]">{round.card.title}</p>
          <p className="text-sm font-bold text-[#59686b]">{round.card.subStat}</p>
        </div>
      </article>

      <article className="flex min-h-[42dvh] flex-col rounded-xl border-2 border-[#082329] bg-white p-3 shadow-[3px_3px_0_#082329] md:min-h-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <p className="rounded-lg border-2 border-[#082329] bg-[#78d99a] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36]">
              Make a fact
            </p>
          </div>
          <p className="rounded-lg bg-[#eaf3f0] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} built</p>
        </div>

        <h2 className="mt-2 text-[clamp(1.35rem,3vw,2.5rem)] font-black leading-[1.04] text-[#102f36]">{round.prompt}</h2>

        <div className="mt-3 grid gap-2 rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2">
          {round.answerIds.map((id, index) => {
            const token = pickedTokens[index];
            const good = checked && token?.id === id;
            const bad = checked && token && token.id !== id;
            return (
              <div
                key={`${round.id}-slot-${id}`}
                className={`min-h-11 rounded-lg border-2 px-3 py-2 text-lg font-black ${
                  good ? "border-[#28764a] bg-[#e9ffe9]" : bad ? "border-[#b5412b] bg-[#fff0ea]" : "border-[#cfbfae] bg-white"
                }`}
              >
                {token?.text ?? "Tap a word chunk"}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {round.tokens.map((token) => (
            <button
              key={token.id}
              onClick={() => onPick(token.id)}
              disabled={pickedSet.has(token.id) || checked}
              className="min-h-11 rounded-lg border-2 border-[#082329] bg-[#fffaf4] px-3 py-2 text-base font-black transition hover:bg-[#fff0c2] active:translate-y-0.5 disabled:opacity-35"
            >
              {token.text}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={onUndo} className="rounded-lg border-2 border-[#082329] bg-white px-3 py-3 text-base font-black hover:bg-[#fff0c2]">
            Undo
          </button>
          <button
            onClick={onCheck}
            disabled={picked.length !== round.answerIds.length || checked}
            className="rounded-lg border-2 border-[#082329] bg-[#102f36] px-3 py-3 text-base font-black text-white shadow-[3px_3px_0_#082329] disabled:opacity-45"
          >
            Check fact
          </button>
        </div>

        {checked && result && (
          <FeedbackPanel
            isCorrect={result.correct}
            xpGain={result.xpGain}
            leveledUp={result.leveledUp}
            celebration={celebration}
            correctAnswer={round.answerText}
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

function NumberMode({
  round,
  selected,
  result,
  miniRunAnswered,
  miniRunCorrect,
  celebration,
  difficulty,
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
  onAnswer: (choice: number) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const answered = selected !== null;
  const answerLabel = `${round.answer.toLocaleString("en-US")} ${round.unit}`;

  return (
    <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <KnowledgeCardsStage cards={round.cards} badge="Number case" footer={`${round.biggerLabel} minus ${round.smallerLabel}`} />

      <article className="flex min-h-[42dvh] flex-col rounded-xl border-2 border-[#082329] bg-white p-3 shadow-[3px_3px_0_#082329] md:min-h-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <p className="rounded-lg border-2 border-[#082329] bg-[#f3c647] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36]">
              Math clue
            </p>
          </div>
          <p className="rounded-lg bg-[#eaf3f0] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} solved</p>
        </div>

        <h2 className="mt-2 text-[clamp(1.2rem,2.6vw,2.25rem)] font-black leading-[1.06] text-[#102f36]">{round.prompt}</h2>

        <div className="mt-3 rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7a5d4b]">{round.statLabel}</p>
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
                    ? "border-[#082329] bg-[#78d99a] shadow-[3px_3px_0_#082329]"
                    : chosenWrong
                      ? "border-[#082329] bg-[#ff9f8d] shadow-[3px_3px_0_#082329]"
                      : "border-[#cfbfae] bg-[#fffaf4] hover:border-[#082329] hover:bg-[#fff0c2]"
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

function OddOneMode({
  round,
  selected,
  result,
  miniRunAnswered,
  miniRunCorrect,
  celebration,
  difficulty,
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
  onAnswer: (cardId: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const answered = selected !== null;
  const answer = round.cards.find((card) => card.id === round.answerId);

  return (
    <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
      <KnowledgeCardsStage cards={round.cards} badge="Logic set" footer="Find the card that breaks the rule." />

      <article className="flex min-h-[42dvh] flex-col rounded-xl border-2 border-[#082329] bg-white p-3 shadow-[3px_3px_0_#082329] md:min-h-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <DifficultyPill difficulty={difficulty} />
            <p className="rounded-lg border-2 border-[#082329] bg-[#78d99a] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36]">
              Spot the rule
            </p>
          </div>
          <p className="rounded-lg bg-[#eaf3f0] px-2.5 py-1 text-xs font-black">{miniRunCorrect}/{miniRunAnswered} found</p>
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
                    ? "border-[#082329] bg-[#78d99a] shadow-[3px_3px_0_#082329]"
                    : chosenWrong
                      ? "border-[#082329] bg-[#ff9f8d] shadow-[3px_3px_0_#082329]"
                      : "border-[#cfbfae] bg-[#fffaf4] hover:border-[#082329] hover:bg-[#fff0c2]"
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
    <section className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-lg border-2 border-[#082329] bg-white p-3 shadow-[4px_4px_0_#082329]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b5412b]">Collection</p>
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
          <HudStat label="Sort" value={modeWins.sort.toString()} />
          <HudStat label="Fact" value={modeWins.fact.toString()} />
          <HudStat label="Peek" value={modeWins.peek.toString()} />
          <HudStat label="Build" value={modeWins.build.toString()} />
          <HudStat label="Numbers" value={modeWins.number.toString()} />
          <HudStat label="Odd" value={modeWins.odd.toString()} />
        </div>
        <div className="mt-4 rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#7a5d4b]">Research library</p>
          <p className="mt-1 text-xl font-black leading-none text-[#102f36]">{totalResearchRecords.toLocaleString("en-US")} records</p>
          <div className="mt-2 grid gap-1.5">
            {allKnowledgeTopics.flatMap((item) => topicPacks[item].sources.map((source) => ({ ...source, key: `${item}-${source.label}` }))).map((source) => (
              <a key={source.key} href={source.url} target="_blank" rel="noreferrer" className="rounded-md bg-white px-2 py-1.5 text-xs font-bold leading-tight text-[#405257] underline-offset-2 hover:underline">
                {source.label}
              </a>
            ))}
          </div>
        </div>
      </aside>

      <article className="min-h-0 overflow-auto rounded-lg border-2 border-[#082329] bg-[#102f36] p-2 shadow-[4px_4px_0_#082329]">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((card) => {
            const isUnlocked = unlockedCards.includes(card.title);
            return (
              <div key={`${card.topic}-${card.id}`} className="overflow-hidden rounded-lg border-2 border-[#082329] bg-white">
                <div className={`relative h-36 overflow-hidden bg-[#d8e8e5] ${isUnlocked ? "" : "grayscale"}`}>
                  {isUnlocked ? <MediaImage image={card.image} imageAlt={card.imageAlt} topic={card.topic} /> : <LockedCard topic={card.topic} />}
                </div>
                <div className="p-2">
                  <p className="text-base font-black leading-tight text-[#102f36]">{isUnlocked ? card.title : "Locked card"}</p>
                  <p className="mt-1 text-sm font-black text-[#b5412b]">{isUnlocked ? card.statDisplay : "Win a round"}</p>
                  {isUnlocked && (
                    <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.1em] ${card.qualityScore >= 85 ? "text-[#28764a]" : card.qualityScore >= 70 ? "text-[#a36b00]" : "text-[#b5412b]"}`}>
                      Quality {card.qualityScore}
                    </p>
                  )}
                  <p className="mt-1 min-h-8 text-xs font-semibold leading-tight text-[#59686b]">{isUnlocked ? card.fact : "Answer correctly to add it here."}</p>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}

function EstimateSlider({
  question,
  selected,
  answered,
  isCorrect,
  onAnswer,
}: {
  question: Question;
  selected: string | null;
  answered: boolean;
  isCorrect: boolean;
  onAnswer: (choice: string) => void;
}) {
  const estimate = question.estimate;
  const [value, setValue] = useState(estimate?.start ?? 0);

  if (!estimate) return null;

  const displayValue = selected !== null ? Number(selected) : value;
  const isScoville = estimate.unit === "SHU" && estimate.max >= 1000000;
  const scalePercent = (item: number) => {
    if (!isScoville) {
      const span = estimate.max - estimate.min;
      return Math.max(0, Math.min(100, ((item - estimate.min) / span) * 100));
    }
    const maxLog = Math.log10(estimate.max + 1);
    return Math.max(0, Math.min(100, (Math.log10(item + 1) / maxLog) * 100));
  };
  const pct = (item: number) => `${scalePercent(item)}%`;
  const sliderValue = isScoville ? Math.round(scalePercent(displayValue) * 10) : displayValue;
  const sliderMin = isScoville ? 0 : estimate.min;
  const sliderMax = isScoville ? 1000 : estimate.max;
  const sliderStep = isScoville ? 1 : estimate.step;
  const valueFromSlider = (nextValue: number) => {
    if (!isScoville) return nextValue;
    const rawValue = Math.pow(estimate.max + 1, nextValue / 1000) - 1;
    return clampToStep(rawValue, estimate.min, estimate.max, estimate.step);
  };
  const valueLabel = `${displayValue.toLocaleString("en-US")} ${estimate.unit}`;
  const rangeLabel =
    estimate.correctMin === estimate.correctMax
      ? `${estimate.correctMax.toLocaleString("en-US")} ${estimate.unit}`
      : `${estimate.correctMin.toLocaleString("en-US")}-${estimate.correctMax.toLocaleString("en-US")} ${estimate.unit}`;

  return (
    <div className="mt-3 rounded-xl border-2 border-[#cfbfae] bg-[#fff8ec] p-3 shadow-[2px_2px_0_#cfbfae]">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7a5d4b]">{answered ? "Your guess" : estimate.label}</p>
          <p className="text-[clamp(1.65rem,4vw,2.35rem)] font-black leading-none text-[#102f36]">{valueLabel}</p>
        </div>
        <button
          onClick={() => onAnswer(String(value))}
          disabled={answered}
          className="min-h-11 rounded-full border-2 border-[#082329] bg-[#f3c647] px-4 py-2 text-sm font-black uppercase tracking-[0.08em] text-[#102f36] shadow-[2px_2px_0_#082329] transition hover:bg-[#ffd86b] active:translate-y-0.5 disabled:bg-[#d7ddd9] disabled:text-[#59686b] disabled:shadow-none"
        >
          Lock it in
        </button>
      </div>

      {isScoville && <HeatZoneGuide />}

      <div className="mt-3 rounded-xl border-2 border-[#cfbfae] bg-white p-3">
        <div className="relative px-1 pb-8 pt-4">
          <div className="absolute left-1 right-1 top-[27px] h-4 rounded-full bg-[#e9dfcf]" />
          <div className="absolute left-1 right-1 top-[28px] h-2 rounded-full bg-gradient-to-r from-[#78d99a] via-[#f3c647] to-[#b5412b]" />
          {answered && (
            <div
              className={`absolute top-[20px] h-7 rounded-full border-2 border-[#082329] ${isCorrect ? "bg-[#78d99a]" : "bg-[#ffe0d8]"}`}
              style={{
                left: pct(estimate.correctMin),
                width: `max(28px, calc(${pct(estimate.correctMax)} - ${pct(estimate.correctMin)}))`,
              }}
              aria-hidden="true"
            />
          )}
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            value={sliderValue}
            disabled={answered}
            onChange={(event) => setValue(valueFromSlider(Number(event.target.value)))}
            className="relative z-10 h-10 w-full cursor-pointer appearance-none bg-transparent disabled:cursor-default [&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:h-9 [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#082329] [&::-webkit-slider-thumb]:bg-[#f3c647] [&::-webkit-slider-thumb]:shadow-[2px_2px_0_#082329]"
            aria-label={estimate.label}
          />
          <div className="absolute inset-x-1 bottom-0 flex justify-between gap-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#7a5d4b]">
            <span>{estimate.marks[0]?.label}</span>
            <span>{estimate.marks[estimate.marks.length - 1]?.label}</span>
          </div>
          {!isScoville && (
            <div className="absolute inset-x-1 bottom-4 flex justify-between gap-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#7a5d4b]">
              {estimate.marks.slice(1, -1).map((mark) => (
                <span key={`${question.id}-${mark.label}`} className="text-center leading-tight">
                  {mark.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 rounded-lg border-2 border-[#cfbfae] bg-white px-3 py-2">
        <p className="text-sm font-black leading-snug text-[#405257]">
          {answered ? `Target zone: ${rangeLabel}` : estimate.helper}
        </p>
      </div>
    </div>
  );
}

function HeatZoneGuide() {
  const colors: Record<HeatBand, string> = {
    "not spicy": "bg-[#f4f1e8]",
    mild: "bg-[#dff5d9]",
    warm: "bg-[#fff0b8]",
    hot: "bg-[#ffd09b]",
    "very hot": "bg-[#ffb0a0]",
    insane: "bg-[#ff8f7f]",
  };

  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
      {heatBands.map((heat) => (
        <div key={heat} className={`rounded-lg border-2 border-[#cfbfae] px-2 py-1.5 text-center ${colors[heat]}`}>
          <p className="truncate text-[11px] font-black leading-tight text-[#102f36]">{heatProfiles[heat].label}</p>
          <p className="mt-0.5 min-h-5 text-sm leading-none">{heatProfiles[heat].icons ? heatProfiles[heat].emoji : "0"}</p>
        </div>
      ))}
    </div>
  );
}

function clampToStep(value: number, min: number, max: number, step: number) {
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(clamped / step) * step;
}

function ProgressDots({ questions, questionIndex }: { questions: Question[]; questionIndex: number }) {
  return (
    <div className="flex flex-wrap gap-0.5">
      {questions.map((item, index) => (
        <span
          key={item.id}
          className={`h-2.5 w-2.5 rounded-sm border-2 border-[#082329] ${
            index < questionIndex ? "bg-[#4fb286]" : index === questionIndex ? "bg-[#f3c647]" : "bg-[#eadfce]"
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
        className="h-10 max-w-32 rounded-lg border-2 border-[#082329] bg-white px-2 text-sm font-black text-[#102f36] shadow-[2px_2px_0_#082329] transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#f3c647]"
      >
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>
      <button
        onClick={onCreate}
        className="h-10 rounded-lg border-2 border-[#082329] bg-white px-3 text-sm font-black text-[#102f36] transition hover:bg-[#fff0c2] active:translate-y-0.5"
      >
        +
      </button>
    </div>
  );
}

function TopicMixMenu({ activeInterests, onToggle }: { activeInterests: KnowledgeTopic[]; onToggle: (topic: KnowledgeTopic) => void }) {
  const activeLabels = activeInterests.map((item) => topicCatalog[item].label);

  return (
    <details className="group relative min-w-0">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 rounded-lg border-2 border-[#082329] bg-white px-3 py-2 text-left shadow-[2px_2px_0_#082329] transition hover:bg-[#fff0c2] group-open:bg-[#fff0c2] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-[#7a5d4b]">Topics</span>
          <span className="block truncate text-sm font-black leading-tight text-[#102f36]">
            <span className="sm:hidden">{activeInterests.length} topics in mix</span>
            <span className="hidden sm:inline">{activeLabels.join(", ")}</span>
          </span>
        </span>
        <span className="shrink-0 text-lg font-black leading-none text-[#102f36]">⌄</span>
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-full min-w-64 rounded-lg border-2 border-[#082329] bg-[#fffaf4] p-2 shadow-[4px_4px_0_#082329]">
        <div className="grid gap-1.5">
          {allKnowledgeTopics.map((item) => {
            const details = topicCatalog[item];
            const enabled = activeInterests.includes(item);
            return (
              <button
                key={item}
                onClick={() => onToggle(item)}
                className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border-2 px-3 py-2 text-left transition active:translate-y-0.5 ${
                  enabled ? "border-[#082329] bg-[#78d99a] shadow-[2px_2px_0_#082329]" : "border-[#cfbfae] bg-white hover:border-[#082329]"
                }`}
              >
                <span>
                  <span className="block text-sm font-black leading-tight text-[#102f36]">{details.label}</span>
                  <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#7a5d4b]">{enabled ? "in mix" : "tap to add"}</span>
                </span>
                <span className="text-xl font-black text-[#102f36]">{enabled ? "✓" : "+"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function PlayModePicker({ mode, onChange }: { mode: GameMode; onChange: (mode: GameMode) => void }) {
  const active = modeOptions.find((item) => item.id === mode) ?? modeOptions[0];

  return (
    <details className="group relative min-w-0">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-lg border-2 border-[#082329] bg-[#78d99a] px-3 py-2 text-left shadow-[2px_2px_0_#082329] transition hover:bg-[#91e0a9] group-open:bg-[#91e0a9] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-[#315a40]">Play mode</span>
          <span className="block truncate text-base font-black leading-tight text-[#102f36]">{active.label}</span>
        </span>
        <span className="shrink-0 text-lg font-black leading-none text-[#102f36]">⌄</span>
      </summary>
      <div className="absolute left-0 z-30 mt-2 w-full min-w-64 rounded-lg border-2 border-[#082329] bg-[#fffaf4] p-2 shadow-[4px_4px_0_#082329]">
        <div className="grid gap-1.5">
          {modeOptions.map((item) => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border-2 px-3 py-2 text-left transition active:translate-y-0.5 ${
                mode === item.id ? "border-[#082329] bg-[#78d99a] shadow-[2px_2px_0_#082329]" : "border-[#cfbfae] bg-white hover:border-[#082329] hover:bg-[#fff0c2]"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-black leading-tight text-[#102f36]">{item.label}</span>
                <span className="block truncate text-[10px] font-black uppercase tracking-[0.12em] text-[#7a5d4b]">{item.eyebrow}</span>
              </span>
              <span className="shrink-0 text-xl font-black text-[#102f36]">{mode === item.id ? "✓" : "+"}</span>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}

function MixModeMenu({ activeModes, onToggle }: { activeModes: ChallengeMode[]; onToggle: (mode: ChallengeMode) => void }) {
  const activeSet = new Set(activeModes);
  const label = activeModes.length === allChallengeModes.length ? "All games" : `${activeModes.length} games`;

  return (
    <details className="group relative min-w-0">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-lg border-2 border-[#082329] bg-white px-3 py-2 text-left shadow-[2px_2px_0_#082329] transition hover:bg-[#fff0c2] group-open:bg-[#fff0c2] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-[#7a5d4b]">Mix includes</span>
          <span className="block truncate text-base font-black leading-tight text-[#102f36]">{label}</span>
        </span>
        <span className="shrink-0 text-lg font-black leading-none text-[#102f36]">⌄</span>
      </summary>
      <div className="absolute left-0 z-30 mt-2 w-full min-w-72 rounded-lg border-2 border-[#082329] bg-[#fffaf4] p-2 shadow-[4px_4px_0_#082329]">
        <div className="grid gap-1.5 sm:grid-cols-2">
          {allChallengeModes.map((challengeMode) => {
            const item = modeOptions.find((option) => option.id === challengeMode) ?? modeOptions[0];
            return (
            <button
              key={challengeMode}
              onClick={() => onToggle(challengeMode)}
              className={`min-h-11 rounded-lg border-2 px-3 py-2 text-left transition active:translate-y-0.5 ${
                activeSet.has(challengeMode) ? "border-[#082329] bg-[#78d99a] shadow-[2px_2px_0_#082329]" : "border-[#cfbfae] bg-white hover:border-[#082329]"
              }`}
            >
              <span className="block text-sm font-black leading-tight text-[#102f36]">{item.label}</span>
              <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#7a5d4b]">{activeSet.has(challengeMode) ? "in mix" : "tap to add"}</span>
            </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function DifficultySelector({ difficulty, onChange }: { difficulty: Difficulty; onChange: (difficulty: Difficulty) => void }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-1 rounded-lg border-2 border-[#cfbfae] bg-[#fffaf4] p-1 min-[520px]:grid-cols-3">
      {difficultyOptions.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`min-h-10 min-w-0 rounded-md border-2 px-2 py-1 text-center transition active:translate-y-0.5 ${
            difficulty === item.id
              ? "border-[#082329] bg-[#f3c647] shadow-[2px_2px_0_#082329]"
              : "border-transparent bg-transparent hover:border-[#cfbfae] hover:bg-white"
          }`}
        >
          <span className="block truncate text-[8px] font-black uppercase tracking-[0.08em] text-[#7a5d4b]">Questions</span>
          <span className="block truncate text-base font-black leading-none text-[#102f36]">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-white px-2 py-1 text-center">
      <p className="truncate text-[8px] font-black uppercase tracking-[0.08em] text-[#7a5d4b]">{label}</p>
      <p className="truncate text-sm font-black leading-none text-[#102f36]">{value}</p>
    </div>
  );
}

function CollectionAction({ active, value, onClick }: { active: boolean; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`min-w-0 rounded-md border-2 px-2 py-1 text-center transition active:translate-y-0.5 ${
        active ? "border-[#082329] bg-[#f3c647] shadow-[2px_2px_0_#082329]" : "border-transparent bg-white hover:border-[#cfbfae] hover:bg-[#fff0c2]"
      }`}
    >
      <span className="block truncate text-[8px] font-black uppercase tracking-[0.08em] text-[#7a5d4b]">Collection</span>
      <span className="block truncate text-sm font-black leading-none text-[#102f36]">{value}</span>
    </button>
  );
}

function ReadingClue({ text }: { text: string }) {
  return (
    <div className="mt-2 rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#7a5d4b]">Read this</p>
      <p className="mt-1 text-base font-black leading-snug text-[#102f36] md:text-lg">“{text}”</p>
    </div>
  );
}

function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-auto pt-3">
      <button
        onClick={onClick}
        className="w-full rounded-lg border-2 border-[#cfbfae] bg-white px-4 py-2 text-sm font-black text-[#59686b] transition hover:border-[#082329] hover:bg-[#fff8ec] active:translate-y-0.5"
      >
        Skip question
      </button>
    </div>
  );
}

function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  const label = difficultyLabel(difficulty);
  return (
    <span className="shrink-0 rounded-lg border-2 border-[#082329] bg-[#f3c647] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#102f36] shadow-[2px_2px_0_#082329]">
      {label}
    </span>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border-2 border-[#cfbfae] bg-white px-1.5 py-1 text-center">
      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-[#7a5d4b]">{label}</p>
      <p className="text-lg font-black leading-none text-[#102f36] md:text-xl">{value}</p>
    </div>
  );
}

function CollectionStat({ label, value, libraryValue, wins, samples }: { label: string; value: string; libraryValue: string; wins: number; samples: readonly string[] }) {
  return (
    <div className="rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-black text-[#102f36]">{label}</p>
        <p className="text-sm font-black text-[#b5412b]">{value}</p>
      </div>
      <p className="mt-1 text-xs font-bold text-[#59686b]">{wins} correct answers · {libraryValue} research records</p>
      <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-tight text-[#59686b]">{samples.join(" | ")}</p>
    </div>
  );
}

function KnowledgeCardsStage({ cards, badge, footer }: { cards: KnowledgeCard[]; badge: string; footer: string }) {
  return (
    <article className="overflow-hidden rounded-xl border-2 border-[#082329] bg-[#102f36] p-2 shadow-[4px_4px_0_#082329]">
      <div className="grid h-full min-h-[390px] grid-cols-2 gap-2 lg:min-h-0">
        {cards.map((card, index) => (
          <div key={`${badge}-${card.topic}-${card.id}`} className="relative overflow-hidden rounded-lg border-2 border-[#082329] bg-[#fff8ec]">
            <div className="absolute left-2 top-2 z-10 rounded-lg border-2 border-[#082329] bg-[#f3c647] px-2 py-1 text-sm font-black shadow-[2px_2px_0_#082329]">
              {String.fromCharCode(65 + index)}
            </div>
            <MediaImage image={card.image} imageAlt={card.imageAlt} topic={card.topic} />
            <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#082329] bg-white/95 p-1.5 shadow-[2px_2px_0_#082329]">
              <p className="text-base font-black leading-tight text-[#102f36]">{card.title}</p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <p className="text-lg font-black leading-none text-[#b5412b]">{card.statDisplay}</p>
                <p className="text-right text-[11px] font-bold leading-tight text-[#405257]">{card.subStat}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="rounded-lg border-2 border-[#082329] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36]">
          {badge}
        </div>
        <p className="rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-semibold text-white">{footer}</p>
      </div>
    </article>
  );
}

function ComparisonStage({ cards }: { cards: ComparisonCard[] }) {
  const displayCards = orderedComparisonCards(cards);
  return (
    <div className="grid h-full min-h-[260px] grid-cols-2 gap-1.5 bg-[#102f36] p-1.5">
      {displayCards.map((card) => (
        <div key={`${card.label}-${card.title}`} className="relative overflow-hidden rounded-lg border-2 border-[#082329] bg-[#fff8ec]">
          <div className="absolute left-2 top-2 z-10 rounded-lg border-2 border-[#082329] bg-[#f3c647] px-2 py-1 text-sm font-black shadow-[2px_2px_0_#082329]">
            {card.label}
          </div>
          <MediaImage image={card.image} imageAlt={card.imageAlt} topic={card.topic} />
          <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#082329] bg-white/95 p-1.5 shadow-[2px_2px_0_#082329]">
            <p className="text-base font-black leading-tight text-[#102f36]">{card.title}</p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#7a5d4b]">{card.statLabel}</p>
                <p className="text-lg font-black leading-none text-[#b5412b]">{card.statValue}</p>
              </div>
              <p className="text-right text-[11px] font-bold leading-tight text-[#405257]">{card.subStat}</p>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#eadfce]">
              <div className="h-full bg-[#b5412b]" style={{ width: `${Math.max(2, Math.min(100, (card.meterValue / card.meterMax) * 100))}%` }} />
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
    <div className="mt-2 grid gap-2 rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2 sm:grid-cols-2">
      {displayCards.map((card) => (
        <div key={`${card.label}-table-${card.title}`} className="rounded-md bg-white px-2 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-black text-[#102f36]">{card.label}: {card.title}</p>
            <p className="text-sm font-black text-[#b5412b]">{card.statValue}</p>
          </div>
          <p className="text-xs font-semibold text-[#59686b]">{card.subStat}</p>
        </div>
      ))}
    </div>
  );
}

function PepperHeatMeter({ meter }: { meter: NonNullable<Question["heatMeter"]> }) {
  return (
    <div className="mt-2 rounded-lg border-2 border-[#cfbfae] bg-[#fff0c2] p-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7a5d4b]">Pepper meter</p>
          <p className="text-lg font-black leading-none text-[#102f36]">{meter.label}</p>
        </div>
        <div className="text-2xl leading-none" aria-label={`${meter.icons} pepper heat`}>
          {meter.emoji}
        </div>
      </div>
      <p className="mt-1 text-xs font-bold text-[#405257]">{meter.line}</p>
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
    <div className="mt-2 rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2">
      <div className="flex justify-between gap-3 text-xs font-black md:text-sm">
        <span>{line.label}</span>
        <span>{line.value.toLocaleString("en-US")} {line.unit}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#eadfce]">
        <div className="h-full bg-[#b5412b]" style={{ width: `${Math.max(2, Math.min(100, (line.value / line.max) * 100))}%` }} />
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
  return (
    <div className="mt-auto pt-3">
      <div className={`rounded-lg border-2 p-3 ${isCorrect ? "border-[#28764a] bg-[#e9ffe9]" : "border-[#b5412b] bg-[#fff0ea]"}`}>
        <div className="grid gap-3 md:grid-cols-[auto_1fr] md:items-start">
          <div className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 border-[#082329] text-3xl font-black shadow-[2px_2px_0_#082329] ${isCorrect ? "bg-[#78d99a]" : "bg-[#ff9f8d]"}`}>
            {isCorrect ? "+" : "!"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-black leading-tight text-[#102f36] md:text-2xl">
                {isCorrect ? celebration : note}
              </p>
              <span className="rounded-full border-2 border-[#082329] bg-[#f3c647] px-2 py-0.5 text-sm font-black text-[#102f36]">
                +{xpGain} XP
              </span>
              {leveledUp && (
                <span className="rounded-full border-2 border-[#082329] bg-[#78d99a] px-2 py-0.5 text-sm font-black text-[#102f36]">
                  Level up
                </span>
              )}
            </div>
            {!isCorrect && (
              <p className="mt-1 text-base font-black text-[#b5412b]">
                Answer: {correctAnswer}
              </p>
            )}
            <p className="mt-1 text-sm font-semibold leading-5 text-[#24373b] md:text-base md:leading-6">
              {explanation}
            </p>
          </div>
        </div>
        <button onClick={onNext} className="mt-3 w-full rounded-lg border-2 border-[#082329] bg-[#102f36] px-4 py-3 text-lg font-black text-white shadow-[3px_3px_0_#082329] hover:bg-[#23515a]">
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
      <div className={`flex h-full min-h-[260px] w-full items-center justify-center p-6 ${topic === "peppers" ? "bg-[#f7d8d0]" : topic === "sharks" ? "bg-[#cfe9ee]" : topic === "space" ? "bg-[#d9ddff]" : "bg-[#d8e8e5]"}`}>
        <div className="w-full max-w-sm rounded-lg border-2 border-[#20383d] bg-white p-5 text-center shadow-[4px_4px_0_#20383d]">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#20383d] bg-[#f3c647] text-5xl">
            {topic === "peppers" ? "!" : topic === "sharks" ? "~" : topic === "space" ? "*" : "^"}
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-[#b5412b]">Picture clue</p>
          <p className="mt-1 text-3xl font-black leading-tight text-[#192f35]">{imageAlt}</p>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt={imageAlt} onError={() => setFailedImage(image)} className="h-full min-h-[260px] w-full object-cover" />
  );
}

function LockedCard({ topic }: { topic: KnowledgeTopic }) {
  return (
    <div className={`flex h-full min-h-36 items-center justify-center ${topic === "peppers" ? "bg-[#f7d8d0]" : topic === "sharks" ? "bg-[#cfe9ee]" : topic === "space" ? "bg-[#d9ddff]" : "bg-[#d8e8e5]"}`}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#082329] bg-[#f3c647] text-4xl font-black">?</div>
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
