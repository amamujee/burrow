"use client";

import { useEffect, useMemo, useState } from "react";
import { buildings, peppers, sourceNotes, type Difficulty, type TopicId } from "@/lib/game-data";
import { buildSession } from "@/lib/questions";

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
  topicWins: Record<"peppers" | "buildings", number>;
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
  topicWins: { peppers: 0, buildings: 0 },
};

const progressKey = "rabbit-hole-progress-v1";
const topics: { id: TopicId; label: string; eyebrow: string }[] = [
  { id: "mixed", label: "Mix it up", eyebrow: "Peppers + towers" },
  { id: "peppers", label: "Spicy Peppers", eyebrow: `${peppers.length} peppers` },
  { id: "buildings", label: "Tall Buildings", eyebrow: `${buildings.length} towers` },
];

const levelFromXp = (xp: number) => Math.max(1, Math.floor(xp / 120) + 1);
const praise = ["Nice reading!", "Big brain move!", "You measured it!", "Hot answer!", "Sky-high thinking!"];

export function RabbitHoleGame() {
  const [progress, setProgress] = useState<Progress>(() => {
    if (typeof window === "undefined") return initialProgress;
    const saved = window.localStorage.getItem(progressKey);
    if (!saved) return initialProgress;
    try {
      return { ...initialProgress, ...JSON.parse(saved) };
    } catch {
      return initialProgress;
    }
  });
  const [topic, setTopic] = useState<TopicId>("mixed");
  const [sessionSeed, setSessionSeed] = useState(20260430);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [celebration, setCelebration] = useState("Ready for a 5-minute rabbit hole?");

  useEffect(() => {
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [progress]);

  const questions = useMemo(
    () => buildSession(topic, progress.difficulty, sessionSeed, progress.seenIds),
    [topic, progress.difficulty, progress.seenIds, sessionSeed],
  );
  const question = questions[questionIndex];
  const answered = selected !== null;
  const isCorrect = selected === question.answer;
  const accuracy = progress.answered ? Math.round((progress.correct / progress.answered) * 100) : 0;
  const nextLevelXp = progress.level * 120;
  const levelProgress = Math.min(100, Math.round(((progress.xp % 120) / 120) * 100));

  const answer = (choice: string) => {
    if (answered) return;
    const correct = choice === question.answer;
    const xpGain = correct ? 18 + progress.difficulty * 4 : 6;
    const nextXp = progress.xp + xpGain;
    const nextStreak = correct ? progress.streak + 1 : 0;
    const nextDifficulty = autoDifficulty(progress.difficulty, correct, nextStreak, progress.answered + 1, progress.correct + (correct ? 1 : 0));

    setSelected(choice);
    setSessionCorrect((value) => value + (correct ? 1 : 0));
    setCelebration(correct ? praise[(questionIndex + progress.streak) % praise.length] : "Good try. The clue below helps.");
    setProgress((current) => ({
      ...current,
      xp: nextXp,
      level: levelFromXp(nextXp),
      streak: nextStreak,
      bestStreak: Math.max(current.bestStreak, nextStreak),
      correct: current.correct + (correct ? 1 : 0),
      answered: current.answered + 1,
      difficulty: nextDifficulty,
      seenIds: [question.id, ...current.seenIds].slice(0, 60),
      topicWins: {
        peppers: current.topicWins.peppers + (correct && question.topic === "peppers" ? 1 : 0),
        buildings: current.topicWins.buildings + (correct && question.topic === "buildings" ? 1 : 0),
      },
    }));
  };

  const advance = () => {
    if (questionIndex === questions.length - 1) {
      setProgress((current) => ({ ...current, sessions: current.sessions + 1 }));
      setQuestionIndex(0);
      setSessionCorrect(0);
      setSelected(null);
      setSessionSeed(Date.now());
      setCelebration("New mini-session. Fresh questions.");
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
    setCelebration("Next bite.");
  };

  const resetProgress = () => {
    setProgress(initialProgress);
    setQuestionIndex(0);
    setSelected(null);
    setSessionCorrect(0);
    setSessionSeed(Date.now());
    setCelebration("Progress reset. Fresh start.");
  };

  return (
    <main className="min-h-screen bg-[#f7f1e6] text-[#1d2528]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="grid gap-3 py-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#b5412b]">Rabbit Hole</p>
            <h1 className="max-w-3xl text-4xl font-black leading-none text-[#192f35] sm:text-6xl">
              Tiny lessons for giant curiosity.
            </h1>
          </div>
          <div className="grid grid-cols-4 gap-2 rounded-lg border-2 border-[#20383d] bg-white p-2 shadow-[6px_6px_0_#20383d]">
            <Stat label="Level" value={progress.level.toString()} />
            <Stat label="XP" value={progress.xp.toString()} />
            <Stat label="Streak" value={progress.streak.toString()} />
            <Stat label="Best" value={progress.bestStreak.toString()} />
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-4 rounded-lg border-2 border-[#20383d] bg-[#fffaf0] p-4 shadow-[6px_6px_0_#20383d]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#3b6d62]">Pick a session</p>
              <div className="mt-3 grid gap-2">
                {topics.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTopic(item.id);
                      setQuestionIndex(0);
                      setSelected(null);
                      setSessionSeed(Date.now() + item.id.length);
                    }}
                    className={`rounded-md border-2 px-3 py-3 text-left transition active:translate-y-0.5 ${
                      topic === item.id
                        ? "border-[#20383d] bg-[#f3c647] shadow-[3px_3px_0_#20383d]"
                        : "border-[#b8aaa0] bg-white hover:border-[#20383d]"
                    }`}
                  >
                    <span className="block text-xs font-black uppercase tracking-[0.16em] text-[#7a5d4b]">{item.eyebrow}</span>
                    <span className="block text-lg font-black">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-[#20383d] p-3 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd76d]">Adaptive mode</p>
              <p className="mt-1 text-3xl font-black">Level {progress.difficulty}</p>
              <p className="text-sm leading-5 text-[#d8e8e5]">
                It adds harder reading, comparing, and rounding when answers come fast.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm font-bold">
                <span>Next level</span>
                <span>{nextLevelXp - progress.xp > 0 ? `${nextLevelXp - progress.xp} XP` : "Ready"}</span>
              </div>
              <div className="mt-2 h-4 overflow-hidden rounded-full border-2 border-[#20383d] bg-white">
                <div className="h-full bg-[#4fb286]" style={{ width: `${levelProgress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <MiniStat label="Accuracy" value={`${accuracy}%`} />
              <MiniStat label="Sessions" value={progress.sessions.toString()} />
              <MiniStat label="Pepper wins" value={progress.topicWins.peppers.toString()} />
              <MiniStat label="Tower wins" value={progress.topicWins.buildings.toString()} />
            </div>

            <button onClick={resetProgress} className="w-full rounded-md border-2 border-[#20383d] bg-white px-3 py-2 text-sm font-black hover:bg-[#f7d8d0]">
              Reset progress
            </button>
          </aside>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <article className="overflow-hidden rounded-lg border-2 border-[#20383d] bg-white shadow-[6px_6px_0_#20383d]">
              <div className="grid gap-0 xl:grid-cols-[minmax(330px,0.95fr)_1fr]">
                <div className="relative min-h-[340px] bg-[#d8e8e5]">
                  <QuestionImage question={question} />
                  <div className="absolute left-3 top-3 rounded-md bg-white/95 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#20383d]">
                    {question.topic === "peppers" ? "Pepper lab" : "Skyline lab"}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 rounded bg-black/65 px-2 py-1 text-[11px] font-semibold text-white">
                    Image: {question.imageCredit}
                  </div>
                </div>

                <div className="flex min-h-[520px] flex-col p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="rounded-full bg-[#eaf3f0] px-3 py-1 text-sm font-black">
                      Question {questionIndex + 1} of {questions.length}
                    </p>
                    <p className="rounded-full bg-[#fff0c2] px-3 py-1 text-sm font-black">
                      Session {sessionCorrect}/{questionIndex + (answered ? 1 : 0)}
                    </p>
                  </div>

                  <h2 className="mt-6 text-3xl font-black leading-tight text-[#192f35] sm:text-4xl">{question.prompt}</h2>

                  {question.numberLine && (
                    <div className="mt-5 rounded-md border-2 border-[#d6c8b8] bg-[#fffaf0] p-3">
                      <div className="flex justify-between text-sm font-black">
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

                  <div className="mt-6 grid gap-3">
                    {question.choices.map((choice) => {
                      const chosen = selected === choice;
                      const correctChoice = answered && choice === question.answer;
                      return (
                        <button
                          key={choice}
                          onClick={() => answer(choice)}
                          className={`min-h-16 rounded-lg border-2 px-4 py-3 text-left text-xl font-black leading-snug transition active:translate-y-0.5 ${
                            correctChoice
                              ? "border-[#20383d] bg-[#78d99a] shadow-[4px_4px_0_#20383d]"
                              : chosen
                                ? "border-[#20383d] bg-[#ff9f8d] shadow-[4px_4px_0_#20383d]"
                                : "border-[#b8aaa0] bg-white hover:border-[#20383d] hover:bg-[#f8f0df]"
                          }`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-5">
                    {answered ? (
                      <div className={`rounded-lg border-2 p-4 ${isCorrect ? "border-[#28764a] bg-[#e9ffe9]" : "border-[#b5412b] bg-[#fff0ea]"}`}>
                        <p className="text-2xl font-black">{isCorrect ? celebration : "Not quite yet."}</p>
                        <p className="mt-1 text-lg font-semibold leading-7">{question.explanation}</p>
                        <button onClick={advance} className="mt-4 w-full rounded-md border-2 border-[#20383d] bg-[#20383d] px-4 py-3 text-xl font-black text-white hover:bg-[#31555c]">
                          {questionIndex === questions.length - 1 ? "Start next mini-session" : "Next question"}
                        </button>
                      </div>
                    ) : (
                      <p className="rounded-lg bg-[#eaf3f0] p-3 text-lg font-black text-[#20383d]">{celebration}</p>
                    )}
                  </div>
                </div>
              </div>
            </article>

            <aside className="space-y-4">
              <div className="rounded-lg border-2 border-[#20383d] bg-[#20383d] p-4 text-white shadow-[6px_6px_0_#20383d]">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ffd76d]">5-10 minute loop</p>
                <h3 className="mt-2 text-2xl font-black">8 quick bites</h3>
                <p className="mt-2 text-sm leading-6 text-[#d8e8e5]">
                  Photos first, then reading, number sense, and comparisons. Correct answers earn more XP, but every try moves forward.
                </p>
              </div>

              <div className="rounded-lg border-2 border-[#20383d] bg-white p-4 shadow-[6px_6px_0_#20383d]">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#b5412b]">What he is learning</p>
                <div className="mt-3 space-y-3 text-sm font-semibold leading-5">
                  <p>Reading: short facts, heat words, city names, finished vs. under construction.</p>
                  <p>Math: bigger numbers, rounding to hundreds, Scoville scores, tower heights.</p>
                  <p>Memory: questions rotate and recent question IDs are saved locally.</p>
                </div>
              </div>

              <div className="rounded-lg border-2 border-[#20383d] bg-[#fffaf0] p-4 shadow-[6px_6px_0_#20383d]">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#3b6d62]">Seed sources</p>
                <ul className="mt-3 space-y-2 text-sm font-semibold leading-5">
                  {sourceNotes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-16 rounded bg-[#f8f0df] px-2 py-2 text-center">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7a5d4b]">{label}</p>
      <p className="text-2xl font-black leading-none">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border-2 border-[#d6c8b8] bg-white p-2">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7a5d4b]">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}

function QuestionImage({ question }: { question: { image: string; imageAlt: string; topic: "peppers" | "buildings" } }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const failed = failedImage === question.image;

  if (failed) {
    return (
      <div className={`flex h-full min-h-[340px] w-full items-center justify-center p-8 ${question.topic === "peppers" ? "bg-[#f7d8d0]" : "bg-[#d8e8e5]"}`}>
        <div className="w-full max-w-sm rounded-lg border-2 border-[#20383d] bg-white p-6 text-center shadow-[6px_6px_0_#20383d]">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#20383d] bg-[#f3c647] text-6xl">
            {question.topic === "peppers" ? "!" : "^"}
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#b5412b]">
            Picture clue
          </p>
          <p className="mt-1 text-4xl font-black leading-tight text-[#192f35]">{question.imageAlt}</p>
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
      className="h-full min-h-[340px] w-full object-cover"
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
