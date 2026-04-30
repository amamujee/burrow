"use client";

import { useEffect, useState } from "react";
import { topicCatalog, topicOptions, type Difficulty, type TopicId } from "@/lib/game-data";
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
  topicWins: Record<"peppers" | "buildings" | "sharks", number>;
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
  topicWins: { peppers: 0, buildings: 0, sharks: 0 },
};

const progressKey = "rabbit-hole-progress-v1";

const levelFromXp = (xp: number) => Math.max(1, Math.floor(xp / 120) + 1);
const praise = ["Nice reading!", "Big brain move!", "You measured it!", "Hot answer!", "Sky-high thinking!"];
const tryAgainNotes = ["Good try.", "Almost.", "Nice guess.", "Now you know."];

export function RabbitHoleGame() {
  const [progress, setProgress] = useState<Progress>(() => {
    if (typeof window === "undefined") return initialProgress;
    const saved = window.localStorage.getItem(progressKey);
    if (!saved) return initialProgress;
    try {
      const parsed = JSON.parse(saved) as Partial<Progress>;
      return {
        ...initialProgress,
        ...parsed,
        topicWins: { ...initialProgress.topicWins, ...parsed.topicWins },
      };
    } catch {
      return initialProgress;
    }
  });
  const [topic, setTopic] = useState<TopicId>("mixed");
  const [questions, setQuestions] = useState(() => buildSession("mixed", progress.difficulty, 20260430, progress.seenIds));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [celebration, setCelebration] = useState("Ready for a 5-minute rabbit hole?");
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    xpGain: number;
    leveledUp: boolean;
  } | null>(null);

  useEffect(() => {
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [progress]);

  const question = questions[questionIndex];
  const answered = selected !== null;
  const isCorrect = selected === question.answer;
  const accuracy = progress.answered ? Math.round((progress.correct / progress.answered) * 100) : 0;
  const nextLevelXp = progress.level * 120;
  const levelProgress = Math.min(100, Math.round(((progress.xp % 120) / 120) * 100));
  const sessionAnswered = questionIndex + (answered ? 1 : 0);

  const answer = (choice: string) => {
    if (answered) return;
    const correct = choice === question.answer;
    const xpGain = correct ? 18 + progress.difficulty * 4 : 6;
    const nextXp = progress.xp + xpGain;
    const nextStreak = correct ? progress.streak + 1 : 0;
    const nextDifficulty = autoDifficulty(progress.difficulty, correct, nextStreak, progress.answered + 1, progress.correct + (correct ? 1 : 0));
    const nextLevel = levelFromXp(nextXp);

    setSelected(choice);
    setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? praise[(questionIndex + progress.streak) % praise.length] : "Good try. The clue below helps.");
    setLastResult({
      correct,
      xpGain,
      leveledUp: nextLevel > progress.level,
    });
    setProgress((current) => ({
      ...current,
      xp: nextXp,
      level: nextLevel,
      streak: nextStreak,
      bestStreak: Math.max(current.bestStreak, nextStreak),
      correct: current.correct + (correct ? 1 : 0),
      answered: current.answered + 1,
      difficulty: nextDifficulty,
      seenIds: [question.id, ...current.seenIds].slice(0, 60),
      topicWins: {
        peppers: current.topicWins.peppers + (correct && question.topic === "peppers" ? 1 : 0),
        buildings: current.topicWins.buildings + (correct && question.topic === "buildings" ? 1 : 0),
        sharks: current.topicWins.sharks + (correct && question.topic === "sharks" ? 1 : 0),
      },
    }));
  };

  const advance = () => {
    if (questionIndex === questions.length - 1) {
      setProgress((current) => ({ ...current, sessions: current.sessions + 1 }));
      setQuestionIndex(0);
      setSessionCorrect(0);
      setSelected(null);
      setLastResult(null);
      setQuestions(buildSession(topic, progress.difficulty, Date.now(), progress.seenIds));
      setCelebration("New mini-session. Fresh questions.");
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
    setLastResult(null);
    setCelebration("Next bite.");
  };

  const resetProgress = () => {
    setProgress(initialProgress);
    setQuestionIndex(0);
    setSelected(null);
    setLastResult(null);
    setSessionCorrect(0);
    setQuestions(buildSession(topic, initialProgress.difficulty, Date.now(), initialProgress.seenIds));
    setCelebration("Progress reset. Fresh start.");
  };

  return (
    <main className="min-h-dvh bg-[#0f2e35] text-[#1d2528] lg:h-dvh lg:overflow-hidden">
      <section className="flex min-h-dvh flex-col gap-2 bg-[linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:32px_32px] p-2 md:p-3 lg:h-full lg:min-h-0">
        <header className="shrink-0 rounded-lg border-2 border-[#082329] bg-[#fff4df] p-2 shadow-[4px_4px_0_#082329] md:p-3">
          <div className="grid gap-2 lg:grid-cols-[140px_minmax(360px,1fr)_minmax(310px,.75fr)] lg:items-center">
            <div className="flex items-center justify-between gap-3 lg:block">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b5412b]">Rabbit Hole</p>
                <h1 className="text-2xl font-black leading-none text-[#102f36] md:text-3xl">Game Lab</h1>
              </div>
              <p className="rounded-full border-2 border-[#082329] bg-[#f3c647] px-3 py-1 text-sm font-black lg:hidden">
                Level {progress.level}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {topicOptions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTopic(item.id);
                    setQuestionIndex(0);
                    setSessionCorrect(0);
                    setSelected(null);
                    setLastResult(null);
                    setQuestions(buildSession(item.id, progress.difficulty, Date.now() + item.id.length, progress.seenIds));
                    setCelebration("Fresh round.");
                  }}
                  className={`min-h-12 rounded-lg border-2 px-2 py-1.5 text-center transition active:translate-y-0.5 ${
                    topic === item.id
                      ? "border-[#082329] bg-[#f3c647] shadow-[2px_2px_0_#082329]"
                      : "border-[#cfbfae] bg-white hover:border-[#082329]"
                  }`}
                >
                  <span className="block text-[9px] font-black uppercase tracking-[0.12em] text-[#7a5d4b]">{item.eyebrow}</span>
                  <span className="block text-sm font-black leading-tight">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              <HudStat label="Lvl" value={progress.level.toString()} />
              <HudStat label="XP" value={progress.xp.toString()} />
              <HudStat label="Streak" value={progress.streak.toString()} />
              <HudStat label="Best" value={progress.bestStreak.toString()} />
              <HudStat label="Hit" value={`${accuracy}%`} />
            </div>
          </div>

          <div className="mt-2 grid gap-2 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#6f5a4b]">
                <span>{Math.max(0, nextLevelXp - progress.xp)} XP to next level</span>
                <span>Difficulty {progress.difficulty}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border-2 border-[#082329] bg-white">
                <div className="h-full bg-[#4fb286]" style={{ width: `${levelProgress}%` }} />
              </div>
            </div>
            <button onClick={resetProgress} className="rounded-lg border-2 border-[#082329] bg-white px-3 py-1.5 text-sm font-black hover:bg-[#ffd7ce]">
              Reset
            </button>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1.08fr)_minmax(355px,.92fr)]">
          <article className="relative min-h-[34dvh] overflow-hidden rounded-lg border-2 border-[#082329] bg-[#d8e8e5] shadow-[4px_4px_0_#082329] lg:min-h-0">
            {question.comparison ? <ComparisonStage cards={question.comparison} /> : <QuestionImage question={question} />}
            <div className="absolute left-2 top-2 rounded-lg border-2 border-[#082329] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#102f36] shadow-[2px_2px_0_#082329]">
              {topicCatalog[question.topic].roundLabel}
            </div>
            <div className="absolute bottom-2 left-2 right-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-semibold text-white">
                {question.comparison ? "Look at both cards. Bigger number wins." : `Image: ${question.imageCredit}`}
              </div>
              <div className="rounded-lg border-2 border-[#082329] bg-[#f3c647] px-3 py-1.5 text-center text-sm font-black text-[#102f36] shadow-[2px_2px_0_#082329]">
                {sessionCorrect}/{sessionAnswered} this run
              </div>
            </div>
          </article>

          <article className="flex min-h-[48dvh] flex-col overflow-hidden rounded-lg border-2 border-[#082329] bg-white p-3 shadow-[4px_4px_0_#082329] md:p-4 lg:min-h-0">
            <div className="shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {questions.map((item, index) => (
                    <span
                      key={item.id}
                      className={`h-3 w-3 rounded-sm border-2 border-[#082329] ${
                        index < questionIndex
                          ? "bg-[#4fb286]"
                          : index === questionIndex
                            ? "bg-[#f3c647]"
                            : "bg-[#eadfce]"
                      }`}
                    />
                  ))}
                </div>
                <p className="rounded-lg bg-[#eaf3f0] px-2.5 py-1 text-xs font-black">
                  {questionIndex + 1}/{questions.length}
                </p>
              </div>

              <h2 className="mt-3 text-[clamp(1.45rem,3.6vw,3rem)] font-black leading-[1.05] text-[#102f36] lg:text-[clamp(1.55rem,3vw,3.2rem)]">
                {question.prompt}
              </h2>

              {question.numberLine && (
                <div className="mt-3 rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2.5">
                  <div className="flex justify-between gap-3 text-xs font-black md:text-sm">
                    <span>{question.numberLine.label}</span>
                    <span>{question.numberLine.value.toLocaleString("en-US")} {question.numberLine.unit}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#eadfce]">
                    <div
                      className="h-full bg-[#b5412b]"
                      style={{ width: `${Math.max(2, Math.min(100, (question.numberLine.value / question.numberLine.max) * 100))}%` }}
                    />
                  </div>
                </div>
              )}

              {question.heatMeter && <PepperHeatMeter meter={question.heatMeter} />}

              {question.comparison && <ComparisonTable cards={question.comparison} />}
            </div>

            <div className="mt-3 grid shrink-0 gap-2 sm:grid-cols-2">
              {question.choices.map((choice) => {
                const chosen = selected === choice;
                const correctChoice = answered && choice === question.answer;
                return (
                  <button
                    key={choice}
                    onClick={() => answer(choice)}
                    className={`min-h-14 rounded-lg border-2 px-3 py-2.5 text-left text-lg font-black leading-snug transition active:translate-y-0.5 md:min-h-16 md:text-xl ${
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
                note={tryAgainNotes[(questionIndex + progress.answered) % tryAgainNotes.length]}
                isLast={questionIndex === questions.length - 1}
                onNext={advance}
              />
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border-2 border-[#cfbfae] bg-white px-1.5 py-1 text-center">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#7a5d4b]">{label}</p>
      <p className="text-xl font-black leading-none text-[#102f36] md:text-2xl">{value}</p>
    </div>
  );
}

function ComparisonStage({ cards }: { cards: ComparisonCard[] }) {
  return (
    <div className="grid h-full min-h-[260px] grid-cols-2 gap-2 bg-[#102f36] p-2">
      {cards.map((card) => (
        <div key={`${card.label}-${card.title}`} className="relative overflow-hidden rounded-lg border-2 border-[#082329] bg-[#fff8ec]">
          <div className="absolute left-2 top-2 z-10 rounded-lg border-2 border-[#082329] bg-[#f3c647] px-2 py-1 text-sm font-black shadow-[2px_2px_0_#082329]">
            {card.label}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image} alt={card.imageAlt} className="h-full min-h-[260px] w-full object-cover" />
          <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#082329] bg-white/95 p-2 shadow-[2px_2px_0_#082329]">
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
    <div className="mt-3 grid gap-2 rounded-lg border-2 border-[#cfbfae] bg-[#fff8ec] p-2 sm:grid-cols-2">
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
    <div className="mt-3 rounded-lg border-2 border-[#cfbfae] bg-[#fff0c2] p-2.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7a5d4b]">Pepper meter</p>
          <p className="text-lg font-black leading-none text-[#102f36]">{meter.label}</p>
        </div>
        <div className="text-2xl leading-none" aria-label={`${meter.icons} pepper heat`}>
          {meter.icons === 0 ? "0" : "🌶️".repeat(meter.icons)}
        </div>
      </div>
      <p className="mt-1 text-xs font-bold text-[#405257]">{meter.line}</p>
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
          {isLast ? "Finish round" : "Next challenge"}
        </button>
      </div>
    </div>
  );
}

function QuestionImage({ question }: { question: Pick<Question, "image" | "imageAlt" | "topic"> }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const failed = failedImage === question.image;

  if (failed) {
    return (
      <div className={`flex h-full min-h-[260px] w-full items-center justify-center p-6 ${question.topic === "peppers" ? "bg-[#f7d8d0]" : "bg-[#d8e8e5]"}`}>
        <div className="w-full max-w-sm rounded-lg border-2 border-[#20383d] bg-white p-5 text-center shadow-[4px_4px_0_#20383d]">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#20383d] bg-[#f3c647] text-5xl">
            {question.topic === "peppers" ? "!" : "^"}
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-[#b5412b]">
            Picture clue
          </p>
          <p className="mt-1 text-3xl font-black leading-tight text-[#192f35]">{question.imageAlt}</p>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={question.image}
      alt={question.imageAlt}
      onError={() => setFailedImage(question.image)}
      className="h-full min-h-[260px] w-full object-cover"
    />
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
