"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Challenge = {
  id: string;
  category: string;
  eyebrow: string;
  title: string;
  prompt: string;
  equation: string;
  choices: number[];
  answer: number;
  explanation: string;
  visual: "baskets" | "groups" | "combine" | "take-away";
  scene?: {
    images: { name: string; image: string }[];
    emoji: string;
    groupCount?: number;
    each?: number;
    left?: number;
    right?: number;
    start?: number;
    removed?: number;
    itemLabel: string;
  };
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

export const mathTrailChallenges: Challenge[] = [
  {
    id: "market-baskets",
    category: "Spicy Peppers",
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
    id: "mako-teeth",
    category: "Shark Tank",
    eyebrow: "Large multiplication",
    title: "Each shark model has 50 paper teeth.",
    prompt: "How many paper teeth do four shark models need?",
    equation: "4 × 50 = ?",
    choices: [100, 150, 200, 250],
    answer: 200,
    explanation: "Four groups of 50 make 200 paper teeth.",
    visual: "groups",
    scene: { images: [{ name: "Longfin mako", image: "/burrow-assets/sharks/longfin-mako.jpg" }, { name: "Lemon shark", image: "/burrow-assets/sharks/lemon-shark.jpg" }, { name: "Goblin shark", image: "/burrow-assets/sharks/goblin-shark.jpg" }, { name: "Zebra shark", image: "/burrow-assets/sharks/zebra-shark.jpg" }], emoji: "🦷", groupCount: 4, each: 50, itemLabel: "paper teeth" },
  },
  {
    id: "tower-windows",
    category: "Sky Scrapers",
    eyebrow: "Addition",
    title: "One tower has 12 glowing windows. Another has nine.",
    prompt: "How many glowing windows can you see?",
    equation: "12 + 9 = ?",
    choices: [19, 20, 21, 22],
    answer: 21,
    explanation: "Twelve windows plus nine windows make 21.",
    visual: "combine",
    scene: { images: [{ name: "China Zun", image: "/burrow-assets/buildings/china-zun.jpg" }, { name: "Ping An", image: "/burrow-assets/buildings/ping-an.jpg" }], emoji: "🪟", left: 12, right: 9, itemLabel: "windows" },
  },
  {
    id: "moon-rocks",
    category: "Space Universe",
    eyebrow: "Subtraction",
    title: "A mission collects 15 rocks and sends six to the lab.",
    prompt: "How many rocks stay in the sample box?",
    equation: "15 − 6 = ?",
    choices: [8, 9, 10, 11],
    answer: 9,
    explanation: "Take six rocks away from 15. Nine remain.",
    visual: "take-away",
    scene: { images: [{ name: "Moon", image: "/burrow-assets/space/moon.jpg" }, { name: "Mars", image: "/burrow-assets/space/mars.jpg" }, { name: "Triton", image: "/burrow-assets/space/triton.jpg" }], emoji: "🪨", start: 15, removed: 6, itemLabel: "rocks" },
  },
  {
    id: "air-show-teams",
    category: "Jet Hangar",
    eyebrow: "Equal groups",
    title: "Three air-show teams fly four jets each.",
    prompt: "How many jets fly altogether?",
    equation: "3 × 4 = ?",
    choices: [7, 10, 12, 14],
    answer: 12,
    explanation: "Three teams of four make 12 jets.",
    visual: "groups",
    scene: { images: [{ name: "F-16", image: "/burrow-assets/jets/f-16-fighting-falcon.jpg" }, { name: "Su-57", image: "/burrow-assets/jets/su-57.jpg" }, { name: "J-10", image: "/burrow-assets/jets/j-10.jpg" }], emoji: "✈️", groupCount: 3, each: 4, itemLabel: "jets" },
  },
  {
    id: "dinosaur-eggs",
    category: "Dinosaur Lab",
    eyebrow: "Addition",
    title: "One dinosaur nest has five eggs. Another has seven.",
    prompt: "How many eggs are in both nests?",
    equation: "5 + 7 = ?",
    choices: [10, 11, 12, 13],
    answer: 12,
    explanation: "Five eggs plus seven eggs make 12.",
    visual: "combine",
    scene: { images: [{ name: "Iguanodon", image: "/burrow-assets/dinosaurs/iguanodon.png" }, { name: "Stegosaurus", image: "/burrow-assets/dinosaurs/stegosaurus.png" }], emoji: "🥚", left: 5, right: 7, itemLabel: "eggs" },
  },
  {
    id: "climbing-teams",
    category: "Tallest Mountains",
    eyebrow: "Equal groups",
    title: "Four climbing teams have three climbers each.",
    prompt: "How many climbers are on the mountain?",
    equation: "4 × 3 = ?",
    choices: [7, 10, 12, 16],
    answer: 12,
    explanation: "Four teams of three make 12 climbers.",
    visual: "groups",
    scene: { images: [{ name: "Mount Kenya", image: "/burrow-assets/tallest-mountains/mount-kenya.jpg" }, { name: "Himalchuli", image: "/burrow-assets/tallest-mountains/himalchuli.jpg" }, { name: "Gasherbrum I", image: "/burrow-assets/tallest-mountains/gasherbrum-i.jpg" }, { name: "Gyachung Kang", image: "/burrow-assets/tallest-mountains/gyachung-kang.jpg" }], emoji: "🧗", groupCount: 4, each: 3, itemLabel: "climbers" },
  },
  {
    id: "tree-birds",
    category: "Tall Trees",
    eyebrow: "Subtraction",
    title: "Eleven birds rest in a giant tree. Four fly away.",
    prompt: "How many birds remain?",
    equation: "11 − 4 = ?",
    choices: [6, 7, 8, 15],
    answer: 7,
    explanation: "Take four birds away from 11. Seven remain.",
    visual: "take-away",
    scene: { images: [{ name: "Centurion", image: "/burrow-assets/tall-trees/centurion.jpg" }, { name: "Giant sequoia", image: "/burrow-assets/tall-trees/giant-sequoia.jpg" }, { name: "Douglas fir", image: "/burrow-assets/tall-trees/douglas-fir.jpg" }], emoji: "🐦", start: 11, removed: 4, itemLabel: "birds" },
  },
  {
    id: "bridge-lights",
    category: "Bridges & Tunnels",
    eyebrow: "Addition",
    title: "Tower Bridge has eight blue lights and six gold lights.",
    prompt: "How many lights glow altogether?",
    equation: "8 + 6 = ?",
    choices: [12, 13, 14, 16],
    answer: 14,
    explanation: "Eight lights plus six lights make 14.",
    visual: "combine",
    scene: { images: [{ name: "Tower Bridge", image: "/burrow-assets/bridges-and-tunnels/tower-bridge.jpg" }, { name: "Manhattan Bridge", image: "/burrow-assets/bridges-and-tunnels/manhattan-bridge.jpg" }], emoji: "💡", left: 8, right: 6, itemLabel: "lights" },
  },
  {
    id: "twelve-times-twelve",
    category: "Spicy Peppers",
    eyebrow: "12 × 12 mastery",
    title: "Twelve pepper seed trays hold 12 seeds each.",
    prompt: "How many seeds are ready to grow?",
    equation: "12 × 12 = ?",
    choices: [120, 132, 144, 156],
    answer: 144,
    explanation: "Twelve groups of 12 make 144 seeds.",
    visual: "groups",
    scene: { images: peppers, emoji: "🌱", groupCount: 12, each: 12, itemLabel: "seeds" },
  },
];

export function MathLenses() {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [complete, setComplete] = useState(false);
  const challenge = mathTrailChallenges[challengeIndex];
  const correct = selected === challenge.answer;

  const next = () => {
    if (selected === null) return;
    setResults((current) => [...current, correct]);
    if (challengeIndex === mathTrailChallenges.length - 1) setComplete(true);
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
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#2f6547]">World math trail complete</p>
          <h2 className="mt-1 text-3xl font-black">Nine worlds of numbers—and 12 × 12</h2>
          <p className="mt-2 font-bold text-[#5f6b5d]">{correctCount}/{mathTrailChallenges.length} solved · every answer explored</p>
          <div className="mt-4 grid gap-2 text-left sm:grid-cols-3 lg:grid-cols-5">
            {mathTrailChallenges.map((item, index) => <div key={item.id} className="rounded-lg border-2 border-[#b8d7b8] bg-white p-3"><p className="text-xl">{results[index] ? "✓" : "●"}</p><p className="mt-1 text-[10px] font-black uppercase text-[#9f3f2b]">{item.eyebrow}</p><p className="mt-1 text-lg font-black">{item.equation.replace("?", String(item.answer))}</p></div>)}
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
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9f3f2b]">World Math Trail · challenge {challengeIndex + 1}/{mathTrailChallenges.length}</p>
          <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-[#2f6547]">{challenge.category} · {challenge.eyebrow}</p>
        </div>
        <p className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-4 py-2 text-2xl font-black shadow-[2px_2px_0_#092421]">{challenge.equation}</p>
      </div>

      <h2 className="mt-3 text-[clamp(1.7rem,4vw,3rem)] font-black leading-tight">{challenge.title}</h2>
      <p className="mt-1 text-lg font-bold text-[#5f6b5d]">{challenge.prompt}</p>

      <div className="mt-3 flex min-h-[280px] items-center justify-center rounded-xl border-2 border-[#092421] bg-[#fff9ec] p-3 shadow-[3px_3px_0_#092421]">
        <ChallengeVisual challenge={challenge} />
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
          <button onClick={next} className="mt-3 rounded-lg border-2 border-[#092421] bg-[#102f36] px-4 py-2 font-black text-white shadow-[2px_2px_0_#092421]">{challengeIndex === mathTrailChallenges.length - 1 ? "View math summary" : "Next question"}</button>
        </div>
      )}
    </article>
  );
}

function ChallengeVisual({ challenge }: { challenge: Challenge }) {
  if (challenge.visual === "baskets") return <MixedBaskets />;
  if (!challenge.scene) return null;
  if (challenge.visual === "groups") return <TopicGroups scene={challenge.scene} />;
  if (challenge.visual === "combine") return <TopicCombine scene={challenge.scene} />;
  return <TopicTakeAway scene={challenge.scene} />;
}

function PepperTile({ pepper, crossed = false }: { pepper: (typeof peppers)[number]; crossed?: boolean }) {
  return <div className={`relative overflow-hidden rounded-lg border-2 border-[#092421] bg-white ${crossed ? "opacity-45" : ""}`}><div className="relative h-16 sm:h-20"><Image src={pepper.image} alt={pepper.name} fill sizes="100px" className="object-cover" /></div><p className="truncate px-1 py-1 text-center text-[9px] font-black">{pepper.name}</p>{crossed && <span className="absolute inset-0 grid place-items-center text-5xl font-black text-[#9f3f2b]" aria-label="used">×</span>}</div>;
}

function MixedBaskets() {
  return <div className="grid w-full gap-3 lg:grid-cols-3" aria-label="Three mixed pepper baskets with four peppers each">{Array.from({ length: 3 }, (_, basket) => <div key={basket} className="rounded-xl border-2 border-[#092421] bg-[#f5d58a] p-2 shadow-[2px_2px_0_#092421]"><p className="mb-2 text-center text-xs font-black uppercase">Basket {basket + 1} · 4 peppers</p><div className="grid grid-cols-4 gap-1">{peppers.slice(basket * 4, basket * 4 + 4).map((pepper) => <PepperTile key={pepper.name} pepper={pepper} />)}</div></div>)}</div>;
}

function SceneCard({ item, quantity, label }: { item: { name: string; image: string }; quantity: number; label: string }) {
  return <div className="overflow-hidden rounded-xl border-2 border-[#092421] bg-white shadow-[2px_2px_0_#092421]"><div className="relative h-24 sm:h-32"><Image src={item.image} alt={item.name} fill sizes="220px" className="object-cover" /></div><div className="p-2 text-center"><p className="truncate text-xs font-black">{item.name}</p><p className="mt-1 text-lg font-black text-[#9f3f2b]">{quantity} {label}</p></div></div>;
}

function TopicGroups({ scene }: { scene: NonNullable<Challenge["scene"]> }) {
  const count = scene.groupCount ?? 0;
  return <div className="w-full" aria-label={`${count} groups with ${scene.each} ${scene.itemLabel} each`}><p className="mb-3 text-center text-sm font-black text-[#72543e]">Every card is one equal group</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: count }, (_, index) => <SceneCard key={`${scene.images[index % scene.images.length].name}-${index}`} item={scene.images[index % scene.images.length]} quantity={scene.each ?? 0} label={scene.itemLabel} />)}</div></div>;
}

function TopicCombine({ scene }: { scene: NonNullable<Challenge["scene"]> }) {
  return <div className="grid w-full max-w-4xl items-center gap-3 sm:grid-cols-[1fr_auto_1fr]" aria-label={`${scene.left} plus ${scene.right} ${scene.itemLabel}`}><SceneCard item={scene.images[0]} quantity={scene.left ?? 0} label={scene.itemLabel} /><span className="text-center text-5xl font-black">+</span><SceneCard item={scene.images[1] ?? scene.images[0]} quantity={scene.right ?? 0} label={scene.itemLabel} /></div>;
}

function TopicTakeAway({ scene }: { scene: NonNullable<Challenge["scene"]> }) {
  const start = scene.start ?? 0;
  const removed = scene.removed ?? 0;
  return <div className="w-full max-w-5xl" aria-label={`${start} ${scene.itemLabel} with ${removed} taken away`}><div className="grid gap-3 sm:grid-cols-3">{scene.images.map((item, index) => <SceneCard key={item.name} item={item} quantity={index === 0 ? start : index === 1 ? removed : start - removed} label={index === 0 ? `${scene.itemLabel} at first` : index === 1 ? `${scene.itemLabel} leave` : `${scene.itemLabel} remain`} />)}</div><div className="mt-4 flex flex-wrap justify-center gap-2" aria-hidden="true">{Array.from({ length: start }, (_, index) => <span key={index} className={`grid h-9 w-9 place-items-center rounded-full border-2 border-[#092421] bg-white text-lg ${index < removed ? "opacity-30 line-through" : ""}`}>{scene.emoji}</span>)}</div></div>;
}
