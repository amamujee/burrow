"use client";

import { useEffect, useMemo, useState } from "react";
import { heatBands, heatProfiles, topicCatalog, type Difficulty, type HeatBand, type TopicId } from "@/lib/game-data";
import {
  buildFactRound,
  buildSortRound,
  collectionCards,
  modeOptions,
  type FactRound,
  type GameMode,
  type KnowledgeCard,
  type KnowledgeTopic,
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
  modeWins: Record<Exclude<GameMode, "collection">, number>;
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
  topicWins: { peppers: 0, buildings: 0, sharks: 0 },
  topicStats: {
    peppers: { correct: 0, answered: 0 },
    buildings: { correct: 0, answered: 0 },
    sharks: { correct: 0, answered: 0 },
  },
  modeWins: { quiz: 0, versus: 0, sort: 0, fact: 0 },
};

const profilesKey = "rabbit-hole-profiles-v1";
const legacyProgressKey = "rabbit-hole-progress-v1";
const allKnowledgeTopics: KnowledgeTopic[] = ["peppers", "buildings", "sharks"];
const difficultyOptions: { id: Difficulty; label: string }[] = [
  { id: 1, label: "Easy" },
  { id: 2, label: "Med" },
  { id: 3, label: "Hard" },
];
const levelFromXp = (xp: number) => Math.max(1, Math.floor(xp / 120) + 1);
const praise = ["Nice reading!", "Big brain move!", "You measured it!", "Hot answer!", "Sky-high thinking!", "Sharp thinking!"];
const tryAgainNotes = ["Good try.", "Almost.", "Nice guess.", "Now you know."];

const freshProgress = (): Progress => ({
  ...initialProgress,
  topicWins: { ...initialProgress.topicWins },
  modeWins: { ...initialProgress.modeWins },
  seenIds: [],
  unlockedCards: [],
});

const normalizeProgress = (progress?: Partial<Progress>): Progress => ({
  ...freshProgress(),
  ...progress,
  topicWins: { ...initialProgress.topicWins, ...progress?.topicWins },
  topicStats: {
    peppers: { ...initialProgress.topicStats.peppers, ...progress?.topicStats?.peppers },
    buildings: { ...initialProgress.topicStats.buildings, ...progress?.topicStats?.buildings },
    sharks: { ...initialProgress.topicStats.sharks, ...progress?.topicStats?.sharks },
  },
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

  const savedProfiles = window.localStorage.getItem(profilesKey);
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

const buildQuestionRun = (topic: TopicScope, mode: GameMode, difficulty: Difficulty, sessionSeed: number, seenIds: string[]) => {
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

export function RabbitHoleGame() {
  const [profilesState, setProfilesState] = useState<ProfilesState>(loadProfiles);
  const activeProfile = profilesState.profiles.find((profile) => profile.id === profilesState.activeProfileId) ?? profilesState.profiles[0];
  const activeInterests = normalizeInterests(activeProfile.interests);
  const progress = activeProfile.progress;
  const [topic, setTopic] = useState<TopicId>("mixed");
  const [mode, setMode] = useState<GameMode>("quiz");
  const [questions, setQuestions] = useState(() => buildQuestionRun(adaptiveTopicScopeFor("mixed", activeInterests, progress), "quiz", progress.difficulty, 20260430, progress.seenIds));
  const [seedCounter, setSeedCounter] = useState(20260430);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [sortRound, setSortRound] = useState<SortRound>(() => buildSortRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [sortPicked, setSortPicked] = useState<string[]>([]);
  const [sortChecked, setSortChecked] = useState(false);
  const [factRound, setFactRound] = useState<FactRound>(() => buildFactRound(adaptiveTopicScopeFor("mixed", activeInterests, progress), progress.difficulty, 20260430));
  const [factSelected, setFactSelected] = useState<"Fact" | "Fake" | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [miniRunAnswered, setMiniRunAnswered] = useState(0);
  const [miniRunCorrect, setMiniRunCorrect] = useState(0);
  const [celebration, setCelebration] = useState("Pick a mode and jump in.");
  const [lastResult, setLastResult] = useState<ResultState | null>(null);

  const allCards = useMemo(() => collectionCards(), []);
  const question = questions[questionIndex];
  const isQuestionMode = mode === "quiz" || mode === "versus";
  const answered = isQuestionMode && selected !== null;
  const isCorrect = isQuestionMode && selected === question?.answer;
  const nextLevelXp = progress.level * 120;
  const levelProgress = Math.min(100, Math.round(((progress.xp % 120) / 120) * 100));
  const sessionAnswered = questionIndex + (answered ? 1 : 0);
  const unlockedCount = allCards.filter((card) => progress.unlockedCards.includes(card.title)).length;
  const currentTopicScope = adaptiveTopicScopeFor(topic, activeInterests, progress);

  useEffect(() => {
    window.localStorage.setItem(profilesKey, JSON.stringify(profilesState));
  }, [profilesState]);

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
    modeName?: Exclude<GameMode, "collection">;
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
      topicWins: {
        peppers: current.topicWins.peppers + (correct && topicName === "peppers" ? 1 : 0),
        buildings: current.topicWins.buildings + (correct && topicName === "buildings" ? 1 : 0),
        sharks: current.topicWins.sharks + (correct && topicName === "sharks" ? 1 : 0),
      },
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

  const resetRunState = (nextMode = mode) => {
    setQuestionIndex(0);
    setSelected(null);
    setSortPicked([]);
    setSortChecked(false);
    setFactSelected(null);
    setLastResult(null);
    setSessionCorrect(0);
    setMiniRunAnswered(0);
    setMiniRunCorrect(0);
    setCelebration(nextMode === "collection" ? "Collection opened." : "Fresh round.");
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
    resetRunState(nextMode);
    setQuestions(buildQuestionRun(scope, nextMode, nextProfile.progress.difficulty, seed, nextProfile.progress.seenIds));
    setSortRound(buildSortRound(scope, nextProfile.progress.difficulty, seed + 31));
    setFactRound(buildFactRound(scope, nextProfile.progress.difficulty, seed + 47));
  };

  const startMode = (nextMode: GameMode) => {
    const seed = freshSeed(nextMode.length);
    setMode(nextMode);
    resetRunState(nextMode);
    setQuestions(buildQuestionRun(currentTopicScope, nextMode, progress.difficulty, seed, progress.seenIds));
    setSortRound(buildSortRound(currentTopicScope, progress.difficulty, seed + 59));
    setFactRound(buildFactRound(currentTopicScope, progress.difficulty, seed + 71));
  };

  const setQuestionDifficulty = (nextDifficulty: Difficulty) => {
    if (nextDifficulty === progress.difficulty) return;
    const seed = freshSeed(nextDifficulty * 53);
    setProgress((current) => ({ ...current, difficulty: nextDifficulty }));
    resetRunState(mode);
    setQuestions(buildQuestionRun(currentTopicScope, mode, nextDifficulty, seed, progress.seenIds));
    setSortRound(buildSortRound(currentTopicScope, nextDifficulty, seed + 41));
    setFactRound(buildFactRound(currentTopicScope, nextDifficulty, seed + 47));
    setCelebration(`${difficultyLabel(nextDifficulty)} questions.`);
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

  const answer = (choice: string) => {
    if (!question || selected !== null) return;
    const correct = choice === question.answer;
    const xpGain = correct ? (mode === "versus" ? 24 : 18) + progress.difficulty * 4 : 6;
    const result = reward({
      correct,
      xpGain,
      topicName: question.topic,
      modeName: mode === "versus" ? "versus" : "quiz",
      seenId: question.id,
      unlockTitles: [question.imageAlt],
    });

    setSelected(choice);
    setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? praise[(questionIndex + progress.streak) % praise.length] : "Good try. The clue below helps.");
    setLastResult(result);
  };

  const advance = () => {
    if (questionIndex === questions.length - 1) {
      const seed = freshSeed(101);
      setProgress((current) => ({ ...current, sessions: current.sessions + 1 }));
      setQuestionIndex(0);
      setSessionCorrect(0);
      setSelected(null);
      setLastResult(null);
      setQuestions(buildQuestionRun(currentTopicScope, mode, progress.difficulty, seed, progress.seenIds));
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
      modeName: "sort",
      seenId: sortRound.id,
      unlockTitles: unlocked,
    });
    setSortChecked(true);
    setMiniRunAnswered((value) => value + 1);
    setMiniRunCorrect((value) => value + (correct ? 1 : 0));
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

  const answerFact = (choice: "Fact" | "Fake") => {
    if (factSelected) return;
    const correct = choice === factRound.answer;
    const xpGain = correct ? 22 + progress.difficulty * 5 : 7;
    const result = reward({
      correct,
      xpGain,
      topicName: factRound.topic,
      modeName: "fact",
      seenId: factRound.id,
      unlockTitles: [factRound.imageAlt],
    });
    setFactSelected(choice);
    setMiniRunAnswered((value) => value + 1);
    setMiniRunCorrect((value) => value + (correct ? 1 : 0));
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

  const resetProgress = () => {
    const seed = freshSeed(211);
    const reset = freshProgress();
    setProgress(reset);
    setQuestions(buildQuestionRun(currentTopicScope, mode, reset.difficulty, seed, reset.seenIds));
    setSortRound(buildSortRound(currentTopicScope, reset.difficulty, seed + 29));
    setFactRound(buildFactRound(currentTopicScope, reset.difficulty, seed + 37));
    resetRunState(mode);
    setCelebration("Progress reset. Fresh start.");
  };

  return (
    <main className="min-h-dvh bg-[#0f2e35] text-[#1d2528] lg:h-dvh lg:overflow-hidden">
      <section className="flex min-h-dvh flex-col gap-1.5 bg-[linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:32px_32px] p-1.5 md:p-2 lg:h-full lg:min-h-0">
        <header className="shrink-0 rounded-lg border-2 border-[#082329] bg-[#fff4df] p-1.5 shadow-[3px_3px_0_#082329] md:p-2">
          <div className="grid gap-1.5 lg:grid-cols-[minmax(210px,.72fr)_minmax(300px,1fr)_minmax(300px,.76fr)] lg:items-center">
            <div className="flex items-center justify-between gap-3 lg:block">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b5412b]">Rabbit Hole</p>
                <h1 className="text-2xl font-black leading-none text-[#102f36] md:text-3xl">{activeProfile.name}&apos;s Lab</h1>
              </div>
              <p className="rounded-full border-2 border-[#082329] bg-[#f3c647] px-3 py-1 text-sm font-black lg:hidden">
                {difficultyLabel(progress.difficulty)}
              </p>
              <div className="mt-1.5 hidden flex-wrap gap-1.5 lg:flex">
                {profilesState.profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => switchProfile(profile.id)}
                    className={`rounded-lg border-2 px-2.5 py-1 text-xs font-black transition active:translate-y-0.5 ${
                      profile.id === activeProfile.id ? "border-[#082329] bg-[#f3c647] shadow-[2px_2px_0_#082329]" : "border-[#cfbfae] bg-white hover:border-[#082329]"
                    }`}
                  >
                    {profile.name}
                  </button>
                ))}
                <button onClick={createProfile} className="rounded-lg border-2 border-[#082329] bg-white px-2.5 py-1 text-xs font-black hover:bg-[#eaf3f0]">
                  + Profile
                </button>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 lg:hidden">
                {profilesState.profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => switchProfile(profile.id)}
                    className={`rounded-lg border-2 px-2.5 py-1 text-xs font-black transition active:translate-y-0.5 ${
                      profile.id === activeProfile.id ? "border-[#082329] bg-[#f3c647] shadow-[2px_2px_0_#082329]" : "border-[#cfbfae] bg-white hover:border-[#082329]"
                    }`}
                  >
                    {profile.name}
                  </button>
                ))}
                <button onClick={createProfile} className="rounded-lg border-2 border-[#082329] bg-white px-2.5 py-1 text-xs font-black hover:bg-[#eaf3f0]">
                  + Profile
                </button>
              </div>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5 lg:mt-0">
                {allKnowledgeTopics.map((item) => {
                  const details = topicCatalog[item];
                  const enabled = activeInterests.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleInterest(item)}
                      className={`min-h-9 rounded-lg border-2 px-2 py-1 text-center transition active:translate-y-0.5 ${
                        enabled
                          ? "border-[#082329] bg-[#78d99a] shadow-[2px_2px_0_#082329]"
                          : "border-[#cfbfae] bg-white opacity-70 hover:border-[#082329]"
                      }`}
                    >
                      <span className="block text-[8px] font-black uppercase tracking-[0.12em] text-[#7a5d4b]">{enabled ? "in mix" : "off"}</span>
                      <span className="block text-[13px] font-black leading-tight md:text-sm">{details.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <DifficultySelector difficulty={progress.difficulty} onChange={setQuestionDifficulty} />
          </div>

          <div className="mt-1.5 grid gap-1.5 lg:grid-cols-[minmax(180px,.55fr)_minmax(390px,1fr)_auto] lg:items-center">
            <div>
              <div className="mb-0.5 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#6f5a4b]">
                <span>{Math.max(0, nextLevelXp - progress.xp)} XP to next level</span>
                <span>{unlockedCount}/{allCards.length} unlocked</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full border-2 border-[#082329] bg-white">
                <div className="h-full bg-[#4fb286]" style={{ width: `${levelProgress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {modeOptions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => startMode(item.id)}
                  className={`min-h-9 rounded-lg border-2 px-1.5 py-1 text-center transition active:translate-y-0.5 ${
                    mode === item.id
                      ? "border-[#082329] bg-[#78d99a] shadow-[2px_2px_0_#082329]"
                      : "border-[#cfbfae] bg-white hover:border-[#082329] hover:bg-[#eaf3f0]"
                  }`}
                >
                  <span className="block text-[8px] font-black uppercase tracking-[0.1em] text-[#7a5d4b]">{item.eyebrow}</span>
                  <span className="block text-[12px] font-black leading-tight md:text-[13px]">{item.label}</span>
                </button>
              ))}
            </div>

            <button onClick={resetProgress} className="rounded-lg border-2 border-[#082329] bg-white px-3 py-1.5 text-sm font-black hover:bg-[#ffd7ce]">
              Reset Profile
            </button>
          </div>
        </header>

        {isQuestionMode && question && (
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
          />
        )}

        {mode === "sort" && (
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
            onNext={nextSortRound}
          />
        )}

        {mode === "fact" && (
          <FactMode
            round={factRound}
            selected={factSelected}
            result={lastResult}
            miniRunAnswered={miniRunAnswered}
            miniRunCorrect={miniRunCorrect}
            celebration={celebration}
            difficulty={progress.difficulty}
            onAnswer={answerFact}
            onNext={nextFactRound}
          />
        )}

        {mode === "collection" && (
          <CollectionBook cards={allCards} unlockedCards={progress.unlockedCards} topic={topic} topicWins={progress.topicWins} modeWins={progress.modeWins} />
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
}) {
  const isDifferenceQuestion = question.kind === "building-difference" || question.kind === "shark-difference";
  const showNumberLine = Boolean(question.numberLine) && (answered || (Boolean(question.comparison) && !isDifferenceQuestion));
  const showComparisonTable = Boolean(question.comparison) && (answered || !isDifferenceQuestion);
  const stageHint = question.comparison
    ? isDifferenceQuestion
      ? "Use the numbers in the question. Subtract smaller from bigger."
      : "Look at both cards. Bigger number wins."
    : `Image: ${question.imageCredit}`;

  return (
    <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.28fr)_minmax(360px,.72fr)]">
      <article className="relative min-h-[30dvh] overflow-hidden rounded-lg border-2 border-[#082329] bg-[#d8e8e5] shadow-[4px_4px_0_#082329] md:min-h-0">
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

      <article className="flex min-h-[42dvh] flex-col overflow-hidden rounded-lg border-2 border-[#082329] bg-white p-2.5 shadow-[3px_3px_0_#082329] md:min-h-0 md:p-3">
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

          {question.numberLine && showNumberLine && <NumberLine line={question.numberLine} />}
          {question.heatMeter && answered && <PepperHeatMeter meter={question.heatMeter} />}
          {question.comparison && showComparisonTable && <ComparisonTable cards={question.comparison} />}
        </div>

        <div className="mt-2 grid shrink-0 gap-2 sm:grid-cols-2">
          {question.choices.map((choice) => {
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
                className={`min-h-12 rounded-lg border-2 px-3 py-2 text-left text-base font-black leading-snug transition active:translate-y-0.5 md:min-h-14 md:text-lg ${
                  correctChoice
                    ? "border-[#082329] bg-[#78d99a] shadow-[3px_3px_0_#082329]"
                    : chosen
                      ? "border-[#082329] bg-[#ff9f8d] shadow-[3px_3px_0_#082329]"
                      : "border-[#cfbfae] bg-[#fffaf4] hover:border-[#082329] hover:bg-[#fff0c2] hover:shadow-[2px_2px_0_#082329]"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{choice}</span>
                  {correctChoice && <span className="text-2xl leading-none">+</span>}
                  {chosen && !correctChoice && <span className="text-2xl leading-none">x</span>}
                </span>
                {heatChoice && <HeatChoiceEmoji heat={heatChoice} />}
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
}) {
  const answerTitles = round.answerIds.map((id) => round.cards.find((card) => card.id === id)?.title).filter(Boolean).join(" -> ");
  const pickedSet = new Set(picked);

  return (
    <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.28fr)_minmax(360px,.72fr)]">
      <article className="overflow-hidden rounded-lg border-2 border-[#082329] bg-[#102f36] p-2 shadow-[4px_4px_0_#082329]">
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

      <article className="flex min-h-[380px] flex-col rounded-lg border-2 border-[#082329] bg-white p-2.5 shadow-[3px_3px_0_#082329] md:p-3 lg:min-h-0">
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
}: {
  round: FactRound;
  selected: "Fact" | "Fake" | null;
  result: ResultState | null;
  miniRunAnswered: number;
  miniRunCorrect: number;
  celebration: string;
  difficulty: Difficulty;
  onAnswer: (choice: "Fact" | "Fake") => void;
  onNext: () => void;
}) {
  const answered = selected !== null;

  return (
    <section className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.28fr)_minmax(360px,.72fr)]">
      <article className="relative min-h-[320px] overflow-hidden rounded-lg border-2 border-[#082329] bg-[#d8e8e5] shadow-[4px_4px_0_#082329] md:min-h-0">
        <MediaImage image={round.image} imageAlt={round.imageAlt} topic={round.topic} />
        <div className="absolute left-2 top-2 rounded-lg border-2 border-[#082329] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36] shadow-[2px_2px_0_#082329]">
          Fact card
        </div>
        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-semibold text-white">
          Image: {round.imageCredit}
        </div>
      </article>

      <article className="flex min-h-[380px] flex-col rounded-lg border-2 border-[#082329] bg-white p-2.5 shadow-[3px_3px_0_#082329] md:min-h-0 md:p-3">
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
          {(["Fact", "Fake"] as const).map((choice) => {
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
  const topicCounts = {
    peppers: cards.filter((card) => card.topic === "peppers" && unlockedCards.includes(card.title)).length,
    buildings: cards.filter((card) => card.topic === "buildings" && unlockedCards.includes(card.title)).length,
    sharks: cards.filter((card) => card.topic === "sharks" && unlockedCards.includes(card.title)).length,
  };

  return (
    <section className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-lg border-2 border-[#082329] bg-white p-3 shadow-[4px_4px_0_#082329]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b5412b]">Collection</p>
        <h2 className="mt-1 text-3xl font-black leading-none text-[#102f36]">{unlocked.length}/{filtered.length} cards</h2>
        <div className="mt-4 grid gap-2">
          <CollectionStat label="Peppers" value={`${topicCounts.peppers} / ${cards.filter((card) => card.topic === "peppers").length}`} wins={topicWins.peppers} />
          <CollectionStat label="Buildings" value={`${topicCounts.buildings} / ${cards.filter((card) => card.topic === "buildings").length}`} wins={topicWins.buildings} />
          <CollectionStat label="Sharks" value={`${topicCounts.sharks} / ${cards.filter((card) => card.topic === "sharks").length}`} wins={topicWins.sharks} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <HudStat label="Quiz" value={modeWins.quiz.toString()} />
          <HudStat label="Versus" value={modeWins.versus.toString()} />
          <HudStat label="Sort" value={modeWins.sort.toString()} />
          <HudStat label="Fact" value={modeWins.fact.toString()} />
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

function DifficultySelector({ difficulty, onChange }: { difficulty: Difficulty; onChange: (difficulty: Difficulty) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {difficultyOptions.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`min-h-12 rounded-lg border-2 px-2 py-1 text-center transition active:translate-y-0.5 ${
            difficulty === item.id
              ? "border-[#082329] bg-[#f3c647] shadow-[2px_2px_0_#082329]"
              : "border-[#cfbfae] bg-white hover:border-[#082329] hover:bg-[#fff0c2]"
          }`}
        >
          <span className="block text-[8px] font-black uppercase tracking-[0.14em] text-[#7a5d4b]">Questions</span>
          <span className="block text-lg font-black leading-none text-[#102f36]">{item.label}</span>
        </button>
      ))}
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

function CollectionStat({ label, value, wins }: { label: string; value: string; wins: number }) {
  return (
    <div className="rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-black text-[#102f36]">{label}</p>
        <p className="text-sm font-black text-[#b5412b]">{value}</p>
      </div>
      <p className="mt-1 text-xs font-bold text-[#59686b]">{wins} correct answers</p>
    </div>
  );
}

function ComparisonStage({ cards }: { cards: ComparisonCard[] }) {
  return (
    <div className="grid h-full min-h-[260px] grid-cols-2 gap-1.5 bg-[#102f36] p-1.5">
      {cards.map((card) => (
        <div key={`${card.label}-${card.title}`} className="relative overflow-hidden rounded-lg border-2 border-[#082329] bg-[#fff8ec]">
          <div className="absolute left-2 top-2 z-10 rounded-lg border-2 border-[#082329] bg-[#f3c647] px-2 py-1 text-sm font-black shadow-[2px_2px_0_#082329]">
            {card.label}
          </div>
          <MediaImage image={card.image} imageAlt={card.imageAlt} topic={card.statLabel === "Scoville" ? "peppers" : card.statLabel === "Height" ? "buildings" : "sharks"} />
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
  return (
    <div className="mt-2 grid gap-2 rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2 sm:grid-cols-2">
      {cards.map((card) => (
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
  return (
    <div className="mt-2 min-h-9 rounded-md border-2 border-[#cfbfae] bg-white/75 px-2.5 py-1.5">
      <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-[#7a5d4b]">
        {profile.icons === 0 ? "no peppers" : `${profile.icons} pepper${profile.icons === 1 ? "" : "s"}`}
      </span>
      <span className="mt-1 block text-lg leading-none md:text-xl" aria-label={`${profile.icons} pepper heat`}>
        {profile.emoji}
      </span>
    </div>
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
      <div className={`flex h-full min-h-[260px] w-full items-center justify-center p-6 ${topic === "peppers" ? "bg-[#f7d8d0]" : topic === "sharks" ? "bg-[#cfe9ee]" : "bg-[#d8e8e5]"}`}>
        <div className="w-full max-w-sm rounded-lg border-2 border-[#20383d] bg-white p-5 text-center shadow-[4px_4px_0_#20383d]">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#20383d] bg-[#f3c647] text-5xl">
            {topic === "peppers" ? "!" : topic === "sharks" ? "~" : "^"}
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
    <div className={`flex h-full min-h-36 items-center justify-center ${topic === "peppers" ? "bg-[#f7d8d0]" : topic === "sharks" ? "bg-[#cfe9ee]" : "bg-[#d8e8e5]"}`}>
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
