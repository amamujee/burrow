"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type MathView = "groups" | "array" | "addition" | "line";

type MiniStep = {
  id: string;
  skill: "Reading" | "Geography" | "Math" | "Science" | "Words";
  icon: string;
  title: string;
  clue: string;
  question: string;
  choices: string[];
  answer: string;
  summary: string;
};

const steps: MiniStep[] = [
  {
    id: "damp",
    skill: "Reading",
    icon: "🏷️",
    title: "Read the seed packet",
    clue: "Keep the soil damp, but not soggy.",
    question: "What does damp mean?",
    choices: ["A little wet", "Completely dry", "Covered in ice"],
    answer: "A little wet",
    summary: "Damp soil is a little wet—not dry and not flooded.",
  },
  {
    id: "mexico",
    skill: "Geography",
    icon: "🌎",
    title: "Find the pepper homeland",
    clue: "Jalapeños are named for Xalapa, a city in Mexico.",
    question: "Where is Mexico?",
    choices: ["South of the United States", "Next to India", "At the South Pole"],
    answer: "South of the United States",
    summary: "Xalapa is in Mexico, south of the United States in North America.",
  },
  {
    id: "harvest",
    skill: "Math",
    icon: "🧺",
    title: "Count the harvest",
    clue: "4 plants grow 6 peppers each.",
    question: "4 × 6 = ?",
    choices: ["18 peppers", "24 peppers", "26 peppers"],
    answer: "24 peppers",
    summary: "Four equal groups of six make 24 peppers.",
  },
  {
    id: "capsaicin",
    skill: "Science",
    icon: "🧪",
    title: "Investigate the heat",
    clue: "Capsaicin makes a pepper feel hot. Much of it forms in the pale tissue that holds the seeds.",
    question: "Which part is most connected to the heat?",
    choices: ["The pale inner tissue", "The green stem", "The flower petals"],
    answer: "The pale inner tissue",
    summary: "Capsaicin is concentrated in the pale inner tissue, not inside the seeds themselves.",
  },
  {
    id: "evidence",
    skill: "Words",
    icon: "📖",
    title: "Find the evidence",
    clue: "A green jalapeño can ripen to red. It is still the same kind of pepper.",
    question: "Which words prove the pepper stays the same kind?",
    choices: ["ripen to red", "still the same kind", "a green jalapeño"],
    answer: "still the same kind",
    summary: "Evidence is the part of a text that directly proves an answer.",
  },
];

export function CoreMiniChallenge({ milestone, onComplete }: { milestone: number; onComplete: (correct: number) => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [complete, setComplete] = useState(false);
  const step = steps[stepIndex];
  const correct = selected === step.answer;
  const mathView = useMemo<MathView>(() => (["groups", "array", "addition", "line"] as MathView[])[Math.max(0, Math.floor(milestone / 10) - 1) % 4], [milestone]);

  useEffect(() => {
    if (!selected) return;
    const timer = window.setTimeout(() => {
      setResults((current) => [...current, selected === step.answer]);
      if (stepIndex === steps.length - 1) {
        setComplete(true);
      } else {
        setStepIndex((value) => value + 1);
        setSelected(null);
      }
    }, 1050);
    return () => window.clearTimeout(timer);
  }, [selected, step.answer, stepIndex]);

  if (complete) {
    const correctCount = results.filter(Boolean).length;
    return (
      <section className="grid flex-1 place-items-center overflow-y-auto rounded-lg border-2 border-[#092421] bg-[#fffdf6] p-3 shadow-[4px_4px_0_#092421]" aria-label="Mini challenge complete">
        <div className="w-full max-w-4xl rounded-xl border-2 border-[#092421] bg-[#e9ffe9] p-4 shadow-[5px_5px_0_#092421] sm:p-6">
          <div className="text-center">
            <p className="text-5xl" aria-hidden="true">🏅</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-[#2f6547]">Mini challenge complete</p>
            <h2 className="mt-1 text-3xl font-black sm:text-5xl">Pepper field journal</h2>
            <p className="mt-2 text-base font-bold text-[#5f6b5d]">{correctCount}/{steps.length} discoveries solved · all five notes collected</p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {steps.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[auto_1fr] gap-2 rounded-lg border-2 border-[#b8d7b8] bg-white p-3">
                <span className="text-xl" aria-label={results[index] ? "correct" : "answer learned"}>{results[index] ? "✓" : "●"}</span>
                <div><p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#9f3f2b]">{item.skill}</p><p className="mt-1 text-sm font-bold leading-snug">{item.summary}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-5 text-center">
            <button onClick={() => onComplete(correctCount)} className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-6 py-3 text-lg font-black shadow-[3px_3px_0_#092421]">Continue regular questions</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid flex-1 gap-2 overflow-y-auto rounded-lg border-2 border-[#092421] bg-[#fffdf6] p-2 shadow-[4px_4px_0_#092421] min-[900px]:min-h-0 min-[900px]:grid-cols-[minmax(280px,.75fr)_minmax(0,1.25fr)]" aria-label={`Mini challenge stop ${stepIndex + 1} of ${steps.length}`}>
      <aside className="flex min-h-64 flex-col overflow-hidden rounded-lg border-2 border-[#092421] bg-[#123d38] p-2 text-white">
        <div className="relative min-h-44 flex-1 overflow-hidden rounded-lg border-2 border-[#092421]">
          <Image src="/burrow-assets/peppers/jalapeno.jpg" alt="Green jalapeño peppers" fill sizes="(max-width: 900px) 100vw, 36vw" className="object-cover" priority />
          <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-2 text-[#102f36]"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9f3f2b]">10 questions complete</p><p className="mt-1 text-lg font-black">Pepper mini challenge</p></div>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1">
          {steps.map((item, index) => <div key={item.id} className={`rounded-md border-2 px-1 py-2 text-center ${index < stepIndex ? "border-[#70d392] bg-[#70d392] text-[#092421]" : index === stepIndex ? "border-[#f0c84b] bg-[#f0c84b] text-[#092421]" : "border-white/25 bg-white/10"}`}><span className="block text-lg" aria-hidden="true">{index < stepIndex ? "✓" : item.icon}</span><span className="mt-1 block truncate text-[8px] font-black uppercase">{item.skill}</span></div>)}
        </div>
      </aside>

      <article className="flex min-w-0 flex-col rounded-lg border-2 border-[#d9c7a7] bg-white p-3">
        <div className="flex items-center justify-between gap-3"><p className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1 text-xs font-black uppercase tracking-[0.12em]">{step.icon} {step.skill}</p><p className="text-xs font-black text-[#72543e]">Stop {stepIndex + 1}/{steps.length}</p></div>
        <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.5rem)] font-black leading-[0.95]">{step.title}</h2>
        <p className={`mt-3 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-3 font-black leading-snug text-[#4f5e57] ${step.skill === "Math" ? "text-2xl" : "text-lg"}`}>{step.clue}</p>
        {step.skill === "Math" && <MiniMathView view={mathView} />}
        <h3 className="mt-4 text-xl font-black leading-tight">{step.question}</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {step.choices.map((choice) => {
            const answerChoice = selected !== null && choice === step.answer;
            const chosenWrong = selected === choice && choice !== step.answer;
            return <button key={choice} disabled={selected !== null} onClick={() => setSelected(choice)} className={`min-h-16 rounded-lg border-2 p-3 text-left text-base font-black transition ${answerChoice ? "border-[#092421] bg-[#70d392] shadow-[2px_2px_0_#092421]" : chosenWrong ? "border-[#092421] bg-[#f59a7d]" : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf] disabled:opacity-70"}`}>{choice}</button>;
          })}
        </div>
        {selected && <div className={`mt-3 rounded-lg border-2 p-3 ${correct ? "border-[#2f7d4f] bg-[#e9ffe9]" : "border-[#9f3f2b] bg-[#fff0ea]"}`}><p className="text-lg font-black">{correct ? "Correct!" : `Answer: ${step.answer}`}</p><p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#72543e]">Moving to the next stop…</p></div>}
      </article>
    </section>
  );
}

function MiniMathView({ view }: { view: MathView }) {
  if (view === "array") return <div className="mt-3 text-center" aria-label="Pepper array"><p className="mb-2 text-xs font-black uppercase text-[#72543e]">4 rows × 6 columns</p><div className="inline-grid grid-cols-6 gap-1 rounded-lg border-2 border-[#092421] bg-white p-2">{Array.from({ length: 24 }, (_, index) => <span key={index} aria-hidden="true">🌶️</span>)}</div></div>;
  if (view === "addition") return <div className="mt-3 flex flex-wrap items-center justify-center gap-2 rounded-lg border-2 border-[#092421] bg-white p-3 text-xl font-black" aria-label="Repeated addition"><span>6</span><span>+</span><span>6</span><span>+</span><span>6</span><span>+</span><span>6</span><span>= ?</span></div>;
  if (view === "line") return <div className="mt-3 overflow-x-auto rounded-lg border-2 border-[#092421] bg-white p-3" aria-label="Number line"><div className="flex min-w-[440px] items-center justify-between">{[0, 6, 12, 18, 24].map((value, index) => <span key={value} className="contents"><span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#092421] bg-[#fff9ec] text-xs font-black">{value}</span>{index < 4 && <span className="font-black text-[#9f3f2b]">+6 →</span>}</span>)}</div></div>;
  return <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Equal pepper groups">{Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-lg border-2 border-[#092421] bg-[#e9ffe9] p-2 text-center"><p className="text-[10px] font-black uppercase">Plant {index + 1}</p><p className="mt-1 text-lg" aria-hidden="true">🌶️🌶️🌶️🌶️🌶️🌶️</p></div>)}</div>;
}
