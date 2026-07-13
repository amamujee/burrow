"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Challenge = {
  id: string;
  eyebrow: string;
  title: string;
  prompt: string;
  equation: string;
  choices: number[];
  answer: number;
  explanation: string;
  visual: "baskets" | "addition" | "subtraction" | "array" | "trail";
};

const peppers = [
  { name: "Pepper X", image: "/burrow-assets/peppers/pepper-x.png" },
  { name: "Bell pepper", image: "/burrow-assets/peppers/bell-pepper.jpg" },
  { name: "Jalapeño", image: "/burrow-assets/peppers/jalapeno.jpg" },
  { name: "Purple Beauty", image: "/burrow-assets/peppers/purple-beauty.jpg" },
  { name: "Banana pepper", image: "/burrow-assets/peppers/banana-pepper.jpg" },
  { name: "Habanero", image: "/burrow-assets/peppers/habanero.jpg" },
  { name: "Cherry pepper", image: "/burrow-assets/peppers/cherry-pepper.jpg" },
  { name: "Shishito", image: "/burrow-assets/peppers/shishito.jpg" },
  { name: "Poblano", image: "/burrow-assets/peppers/poblano.jpg" },
  { name: "Lemon Drop", image: "/burrow-assets/peppers/lemon-drop.jpg" },
  { name: "Scotch bonnet", image: "/burrow-assets/peppers/scotch-bonnet.jpg" },
  { name: "Cayenne", image: "/burrow-assets/peppers/cayenne.jpg" },
];

const challenges: Challenge[] = [
  {
    id: "market-baskets",
    eyebrow: "Equal groups",
    title: "Three market baskets hold four peppers each.",
    prompt: "How many peppers are in all three baskets?",
    equation: "3 × 4 = ?",
    choices: [7, 10, 12, 16],
    answer: 12,
    explanation: "Three groups of four make 12 peppers.",
    visual: "baskets",
  },
  {
    id: "color-crates",
    eyebrow: "Addition",
    title: "The farmer packs two red peppers and five green peppers.",
    prompt: "How many peppers did the farmer pack?",
    equation: "2 + 5 = ?",
    choices: [5, 6, 7, 8],
    answer: 7,
    explanation: "Two red peppers plus five green peppers make seven peppers.",
    visual: "addition",
  },
  {
    id: "salsa-pot",
    eyebrow: "Subtraction",
    title: "A cook has eight peppers and uses three for salsa.",
    prompt: "How many peppers are left?",
    equation: "8 − 3 = ?",
    choices: [3, 5, 6, 11],
    answer: 5,
    explanation: "Cross out the three used peppers. Five peppers remain.",
    visual: "subtraction",
  },
  {
    id: "festival-array",
    eyebrow: "Rows and columns",
    title: "Four festival rows each display three pepper varieties.",
    prompt: "How many peppers are in the display?",
    equation: "4 × 3 = ?",
    choices: [7, 10, 12, 14],
    answer: 12,
    explanation: "Four rows of three make an array of 12 peppers.",
    visual: "array",
  },
  {
    id: "pepper-trail",
    eyebrow: "Skip counting",
    title: "A pepper explorer makes four jumps of five.",
    prompt: "Where does the explorer land?",
    equation: "5 + 5 + 5 + 5 = ?",
    choices: [15, 20, 24, 25],
    answer: 20,
    explanation: "Four jumps of five land on 20. That is also 4 × 5.",
    visual: "trail",
  },
];

export function MathLenses() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [complete, setComplete] = useState(false);
  const challenge = challenges[challengeIndex];
  const correct = selected === challenge.answer;

  const next = () => {
    if (selected === null) return;
    setResults((current) => [...current, correct]);
    if (challengeIndex === challenges.length - 1) setComplete(true);
    else {
      setChallengeIndex((value) => value + 1);
      setSelected(null);
    }
  };

  if (complete) {
    const correctCount = results.filter(Boolean).length;
    return (
      <div className="grid flex-1 place-items-center p-3">
        <div className="w-full max-w-4xl rounded-xl border-2 border-[#092421] bg-[#e9ffe9] p-5 text-center shadow-[5px_5px_0_#092421]">
          <p className="text-5xl" aria-hidden="true">🌶️</p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#2f6547]">Math trail complete</p>
          <h2 className="mt-1 text-3xl font-black">Five ways to think with numbers</h2>
          <p className="mt-2 font-bold text-[#5f6b5d]">{correctCount}/{challenges.length} solved · every answer explored</p>
          <div className="mt-4 grid gap-2 text-left sm:grid-cols-2 lg:grid-cols-5">
            {challenges.map((item, index) => <div key={item.id} className="rounded-lg border-2 border-[#b8d7b8] bg-white p-3"><p className="text-xl">{results[index] ? "✓" : "●"}</p><p className="mt-1 text-[10px] font-black uppercase text-[#9f3f2b]">{item.eyebrow}</p><p className="mt-1 text-lg font-black">{item.equation.replace("?", String(item.answer))}</p></div>)}
          </div>
          <Link href="/play" className="mt-5 inline-block rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-5 py-3 font-black shadow-[3px_3px_0_#092421]">Continue to Burrow</Link>
        </div>
      </div>
    );
  }

  return (
    <article className="flex min-w-0 flex-1 flex-col rounded-lg border-2 border-[#d9c7a7] bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9f3f2b]">Pepper Math Trail · challenge {challengeIndex + 1}/{challenges.length}</p>
          <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-[#2f6547]">{challenge.eyebrow}</p>
        </div>
        <p className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-4 py-2 text-2xl font-black shadow-[2px_2px_0_#092421]">{challenge.equation}</p>
      </div>

      <h2 className="mt-3 text-[clamp(1.7rem,4vw,3rem)] font-black leading-tight">{challenge.title}</h2>
      <p className="mt-1 text-lg font-bold text-[#5f6b5d]">{challenge.prompt}</p>

      <div className="mt-3 flex min-h-[280px] items-center justify-center rounded-xl border-2 border-[#092421] bg-[#fff9ec] p-3 shadow-[3px_3px_0_#092421]">
        <ChallengeVisual kind={challenge.visual} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {challenge.choices.map((choice) => {
          const good = selected !== null && choice === challenge.answer;
          const bad = selected === choice && choice !== challenge.answer;
          return <button key={choice} disabled={selected !== null} onClick={() => setSelected(choice)} className={`min-h-14 rounded-lg border-2 p-2 text-xl font-black ${good ? "border-[#092421] bg-[#70d392] shadow-[2px_2px_0_#092421]" : bad ? "border-[#092421] bg-[#f59a7d]" : "border-[#d9c7a7] bg-white hover:border-[#092421] hover:bg-[#fff1bf] disabled:opacity-70"}`}>{choice}</button>;
        })}
      </div>

      {selected !== null && (
        <div className={`mt-3 rounded-lg border-2 p-3 ${correct ? "border-[#2f7d4f] bg-[#e9ffe9]" : "border-[#9f3f2b] bg-[#fff0ea]"}`}>
          <p className="text-lg font-black">{correct ? "Correct!" : `Answer: ${challenge.answer}`}</p>
          <p className="mt-1 text-sm font-bold text-[#5f6b5d]">{challenge.explanation}</p>
          <button onClick={next} className="mt-3 rounded-lg border-2 border-[#092421] bg-[#102f36] px-4 py-2 font-black text-white shadow-[2px_2px_0_#092421]">{challengeIndex === challenges.length - 1 ? "View math summary" : "Next question"}</button>
        </div>
      )}
    </article>
  );
}

function ChallengeVisual({ kind }: { kind: Challenge["visual"] }) {
  if (kind === "baskets") return <MixedBaskets />;
  if (kind === "addition") return <ColorAddition />;
  if (kind === "subtraction") return <SalsaSubtraction />;
  if (kind === "array") return <FestivalArray />;
  return <PepperTrail />;
}

function PepperTile({ pepper, crossed = false }: { pepper: (typeof peppers)[number]; crossed?: boolean }) {
  return <div className={`relative overflow-hidden rounded-lg border-2 border-[#092421] bg-white ${crossed ? "opacity-45" : ""}`}><div className="relative h-16 sm:h-20"><Image src={pepper.image} alt={pepper.name} fill sizes="100px" className="object-cover" /></div><p className="truncate px-1 py-1 text-center text-[9px] font-black">{pepper.name}</p>{crossed && <span className="absolute inset-0 grid place-items-center text-5xl font-black text-[#9f3f2b]" aria-label="used">×</span>}</div>;
}

function MixedBaskets() {
  return <div className="grid w-full gap-3 lg:grid-cols-3" aria-label="Three mixed pepper baskets with four peppers each">{Array.from({ length: 3 }, (_, basket) => <div key={basket} className="rounded-xl border-2 border-[#092421] bg-[#f5d58a] p-2 shadow-[2px_2px_0_#092421]"><p className="mb-2 text-center text-xs font-black uppercase">Basket {basket + 1} · 4 peppers</p><div className="grid grid-cols-4 gap-1">{peppers.slice(basket * 4, basket * 4 + 4).map((pepper) => <PepperTile key={pepper.name} pepper={pepper} />)}</div></div>)}</div>;
}

function ColorAddition() {
  return <div className="grid w-full max-w-3xl items-center gap-3 sm:grid-cols-[1fr_auto_1fr]" aria-label="Two red peppers plus five green peppers"><PepperSet label="2 red peppers" count={2} start={6} /><span className="text-center text-5xl font-black">+</span><PepperSet label="5 green peppers" count={5} start={2} /></div>;
}

function PepperSet({ label, count, start }: { label: string; count: number; start: number }) {
  return <div className="rounded-xl border-2 border-[#092421] bg-white p-3"><p className="mb-2 text-center text-sm font-black">{label}</p><div className="grid grid-cols-2 gap-2">{Array.from({ length: count }, (_, index) => <PepperTile key={`${label}-${index}`} pepper={peppers[(start + index) % peppers.length]} />)}</div></div>;
}

function SalsaSubtraction() {
  return <div className="w-full max-w-4xl" aria-label="Eight peppers with three crossed out"><p className="mb-3 text-center text-sm font-black text-[#72543e]">The crossed-out peppers went into the salsa</p><div className="grid grid-cols-4 gap-2 sm:grid-cols-8">{peppers.slice(0, 8).map((pepper, index) => <PepperTile key={pepper.name} pepper={pepper} crossed={index < 3} />)}</div></div>;
}

function FestivalArray() {
  return <div className="text-center" aria-label="Four rows of three different pepper varieties"><p className="mb-3 text-sm font-black text-[#72543e]">4 colorful rows × 3 peppers</p><div className="grid grid-cols-3 gap-2 rounded-xl border-2 border-[#092421] bg-white p-3">{peppers.map((pepper) => <PepperTile key={pepper.name} pepper={pepper} />)}</div></div>;
}

function PepperTrail() {
  const stops = [0, 5, 10, 15, 20];
  return <div className="w-full max-w-5xl overflow-x-auto" aria-label="Number trail with four jumps of five"><div className="flex min-w-[620px] items-center justify-between">{stops.map((stop, index) => <div key={stop} className="contents"><div className="w-20 text-center"><div className="mx-auto h-16 overflow-hidden rounded-full border-2 border-[#092421] bg-white"><Image src={peppers[index * 2].image} alt={peppers[index * 2].name} width={80} height={64} className="h-full w-full object-cover" /></div><p className="mt-1 text-xl font-black">{stop}</p></div>{index < stops.length - 1 && <div className="flex-1 text-center"><p className="text-xs font-black text-[#9f3f2b]">jump +5</p><p className="text-3xl" aria-hidden="true">→</p></div>}</div>)}</div></div>;
}
