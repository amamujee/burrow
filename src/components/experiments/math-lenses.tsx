"use client";

import { useMemo, useState } from "react";

type Lens = "groups" | "array" | "addition" | "line";

const lenses: { id: Lens; label: string; icon: string; clue: string }[] = [
  { id: "groups", label: "Equal groups", icon: "🌱", clue: "Count the same amount on every plant." },
  { id: "array", label: "Pepper array", icon: "▦", clue: "See rows and columns at the same time." },
  { id: "addition", label: "Repeated addition", icon: "+", clue: "Add one plant’s peppers again and again." },
  { id: "line", label: "Number line", icon: "↦", clue: "Make equal jumps until you reach the total." },
];

const problems = [
  { plants: 3, peppers: 4 },
  { plants: 4, peppers: 6 },
  { plants: 5, peppers: 3 },
  { plants: 6, peppers: 5 },
];

export function MathLenses() {
  const [problemIndex, setProblemIndex] = useState(1);
  const [lens, setLens] = useState<Lens>("groups");
  const [selected, setSelected] = useState<number | null>(null);
  const [seenLenses, setSeenLenses] = useState<Lens[]>(["groups"]);
  const problem = problems[problemIndex];
  const total = problem.plants * problem.peppers;
  const correct = selected === total;
  const choices = useMemo(() => [total - 2, total, total + problem.plants, total + problem.peppers].filter((value, index, all) => value > 0 && all.indexOf(value) === index), [problem, total]);

  const next = () => {
    setProblemIndex((value) => (value + 1) % problems.length);
    setSelected(null);
    setLens("groups");
    setSeenLenses(["groups"]);
  };

  const changeLens = (nextLens: Lens) => {
    setLens(nextLens);
    setSeenLenses((current) => current.includes(nextLens) ? current : [...current, nextLens]);
  };

  return (
    <div className="grid min-w-0 flex-1 gap-2 min-[900px]:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="relative z-0 min-w-0 rounded-lg border-2 border-[#092421] bg-[#102f36] p-3 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a8ead4]">One idea · four views</p>
        <h2 className="mt-1 text-3xl font-black leading-none">Math Lenses</h2>
        <p className="mt-2 text-sm font-bold leading-snug text-white/75">The equation stays the same. Only the way we see it changes.</p>

        <div className="mt-4 grid gap-2" role="tablist" aria-label="Math representations">
          {lenses.map((item) => (
            <button key={item.id} role="tab" aria-selected={lens === item.id} onClick={() => changeLens(item.id)} className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 rounded-lg border-2 p-2 text-left ${lens === item.id ? "border-[#f0c84b] bg-[#f0c84b] text-[#102f36]" : "border-white/25 bg-white/10 hover:border-white/60"}`}>
              <span className="grid h-10 w-10 place-items-center rounded-md border-2 border-current text-xl font-black" aria-hidden="true">{item.icon}</span>
              <span><span className="block font-black">{item.label}</span><span className="mt-0.5 block text-[10px] font-bold leading-tight opacity-70">{item.clue}</span></span>
              <span className="text-sm font-black" aria-label={seenLenses.includes(item.id) ? "viewed" : "not viewed"}>{seenLenses.includes(item.id) ? "✓" : "○"}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-lg border-2 border-white/25 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a8ead4]">Parent observation</p>
          <p className="mt-1 text-xs font-bold leading-snug text-white/75">Ask which view makes the answer easiest to see. His choice can become the default learning aid later.</p>
        </div>
      </aside>

      <article className="relative z-10 flex min-w-0 flex-col rounded-lg border-2 border-[#d9c7a7] bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9f3f2b]">Pepper garden problem</p><h3 className="mt-1 text-2xl font-black sm:text-3xl">{problem.plants} plants grow {problem.peppers} peppers each.</h3></div>
          <div className="text-right"><p className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-2 text-2xl font-black">{problem.plants} × {problem.peppers} = ?</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#72543e]">{seenLenses.length}/4 views tried</p></div>
        </div>
        <p className="mt-2 text-base font-bold text-[#5f6b5d]">How many peppers are there altogether?</p>

        <div className="mt-3 flex min-h-[250px] items-center justify-center rounded-xl border-2 border-[#092421] bg-[#fff9ec] p-3 shadow-[3px_3px_0_#092421]" aria-label={`${lenses.find((item) => item.id === lens)?.label} representation`}>
          {lens === "groups" && <EqualGroups plants={problem.plants} peppers={problem.peppers} />}
          {lens === "array" && <PepperArray rows={problem.plants} columns={problem.peppers} />}
          {lens === "addition" && <RepeatedAddition plants={problem.plants} peppers={problem.peppers} />}
          {lens === "line" && <NumberLine jumps={problem.plants} jumpSize={problem.peppers} />}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {choices.map((choice) => {
            const good = selected !== null && choice === total;
            const bad = selected === choice && choice !== total;
            return <button key={choice} onClick={() => selected === null && setSelected(choice)} className={`min-h-14 rounded-lg border-2 p-2 text-xl font-black ${good ? "border-[#092421] bg-[#70d392] shadow-[2px_2px_0_#092421]" : bad ? "border-[#092421] bg-[#f59a7d]" : "border-[#d9c7a7] bg-white hover:border-[#092421] hover:bg-[#fff1bf]"}`}>{choice} peppers</button>;
          })}
        </div>

        {selected !== null && (
          <div className={`mt-3 rounded-lg border-2 p-3 ${correct ? "border-[#2f7d4f] bg-[#e9ffe9]" : "border-[#9f3f2b] bg-[#fff0ea]"}`}>
            <p className="text-lg font-black">{correct ? "All four lenses agree!" : "Keep the equation and try another lens."}</p>
            <p className="mt-1 text-sm font-bold text-[#5f6b5d]">{correct ? `${problem.plants} equal groups of ${problem.peppers} make ${total}. You explored ${seenLenses.length} of 4 math views.` : "Switch the picture above, then count again."}</p>
            <button onClick={correct ? next : () => setSelected(null)} className="mt-3 rounded-lg border-2 border-[#092421] bg-[#102f36] px-4 py-2 font-black text-white">{correct ? "New garden problem" : "Try again"}</button>
          </div>
        )}
      </article>
    </div>
  );
}

function EqualGroups({ plants, peppers }: { plants: number; peppers: number }) {
  return <div className="grid w-full gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">{Array.from({ length: plants }, (_, plant) => <div key={plant} className="rounded-lg border-2 border-[#092421] bg-[#e9ffe9] p-2 text-center shadow-[2px_2px_0_#092421]"><p className="text-[10px] font-black uppercase text-[#2f6547]">🌱 Plant {plant + 1}</p><p className="mt-2 text-2xl leading-tight" aria-hidden="true">{Array.from({ length: peppers }, () => "🌶️").join("")}</p><p className="mt-1 text-xs font-black text-[#9f3f2b]">{peppers} peppers</p></div>)}</div>;
}

function PepperArray({ rows, columns }: { rows: number; columns: number }) {
  return <div className="text-center"><p className="mb-3 text-sm font-black text-[#72543e]">{rows} rows × {columns} columns</p><div className="inline-grid gap-2 rounded-lg border-2 border-[#092421] bg-white p-4 shadow-[3px_3px_0_#092421]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: rows * columns }, (_, index) => <span key={index} className="text-2xl" aria-hidden="true">🌶️</span>)}</div></div>;
}

function RepeatedAddition({ plants, peppers }: { plants: number; peppers: number }) {
  return <div className="w-full max-w-3xl text-center"><p className="text-sm font-black uppercase tracking-[0.12em] text-[#72543e]">Add {peppers} once for every plant</p><div className="mt-4 flex flex-wrap items-center justify-center gap-2">{Array.from({ length: plants }, (_, index) => <span key={index} className="contents"><span className="rounded-lg border-2 border-[#092421] bg-[#e9ffe9] px-4 py-3 text-2xl font-black shadow-[2px_2px_0_#092421]">{peppers}</span>{index < plants - 1 && <span className="text-3xl font-black">+</span>}</span>)}</div><p className="mt-5 text-3xl font-black">= ?</p></div>;
}

function NumberLine({ jumps, jumpSize }: { jumps: number; jumpSize: number }) {
  const total = jumps * jumpSize;
  return (
    <div className="w-full max-w-full overflow-x-auto px-2 pb-3">
      <div className="mx-auto min-w-[520px] max-w-4xl">
        <p className="text-center text-sm font-black text-[#72543e]">Make {jumps} jumps of {jumpSize}</p>
        <div className="relative mt-16 h-16 border-t-4 border-[#092421]">
          {Array.from({ length: jumps }, (_, index) => (
            <span
              key={`jump-${index}`}
              className="absolute -top-12 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#092421] bg-[#f0c84b] px-2 py-1 text-xs font-black"
              style={{ left: `${((index + 0.5) / jumps) * 100}%` }}
            >
              +{jumpSize} ↗
            </span>
          ))}
          {Array.from({ length: jumps + 1 }, (_, index) => {
            const value = index * jumpSize;
            return (
              <div key={value} className="absolute top-[-10px] -translate-x-1/2 text-center" style={{ left: `${(value / total) * 100}%` }}>
                <span className="block h-4 w-1 bg-[#092421]" />
                <span className="mt-1 block text-sm font-black">{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
