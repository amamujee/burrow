"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MathLenses } from "./math-lenses";
import { PepperExpedition } from "./pepper-expedition";
import { WordExplorer } from "./word-explorer";

type LabId = "expedition" | "words" | "math";

const labs: { id: LabId; label: string; eyebrow: string; icon: string; description: string }[] = [
  { id: "expedition", label: "Pepper Expedition", eyebrow: "cross-subject journey", icon: "🧭", description: "A five-stop adventure through reading, geography, science, and math." },
  { id: "words", label: "Word Explorer", eyebrow: "reading that grows", icon: "📖", description: "Move from matching a word to finding evidence in a short field note." },
  { id: "math", label: "Math Lenses", eyebrow: "one idea, four views", icon: "🔎", description: "Switch between groups, arrays, addition, and a number line." },
];

export function LearningLabs() {
  const [activeLab, setActiveLab] = useState<LabId>("expedition");
  const current = labs.find((lab) => lab.id === activeLab) ?? labs[0];

  return (
    <main className="min-h-dvh bg-[#0d332f] p-2 text-[#102f36] sm:p-4">
      <div className="mx-auto flex min-h-[calc(100dvh-1rem)] max-w-7xl flex-col rounded-xl border-2 border-[#092421] bg-[#f7f0df] p-2 shadow-[6px_6px_0_#092421] sm:min-h-[calc(100dvh-2rem)] sm:p-3">
        <header className="grid gap-3 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-3 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <Image src="/icons/burrow-icon-64.png" alt="" width={48} height={48} className="rounded-lg border-2 border-[#092421] bg-[#f5d39c]" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9f3f2b]">Burrow prototype branch</p>
              <h1 className="text-2xl font-black leading-none sm:text-3xl">Learning Labs</h1>
            </div>
          </div>
          <div className="rounded-lg border-2 border-dashed border-[#c8b38f] bg-white/60 px-3 py-2 text-xs font-bold text-[#5f6b5d]">
            Experimental · progress is not saved · each lab is isolated from the main game
          </div>
          <Link href="/play" className="rounded-lg border-2 border-[#092421] bg-white px-4 py-2 text-center text-sm font-black shadow-[2px_2px_0_#092421] hover:bg-[#fff1bf]">
            Back to Burrow
          </Link>
        </header>

        <nav className="mt-2 grid gap-2 md:grid-cols-3" aria-label="Experimental learning modes">
          {labs.map((lab) => {
            const selected = lab.id === activeLab;
            return (
              <button
                key={lab.id}
                onClick={() => setActiveLab(lab.id)}
                aria-pressed={selected}
                className={`grid min-h-24 grid-cols-[auto_1fr] gap-3 rounded-lg border-2 p-3 text-left transition active:translate-y-0.5 ${selected ? "border-[#092421] bg-[#f0c84b] shadow-[3px_3px_0_#092421]" : "border-[#d9c7a7] bg-white hover:border-[#092421]"}`}
              >
                <span className="grid h-12 w-12 place-items-center rounded-lg border-2 border-[#092421] bg-[#fff9ec] text-2xl" aria-hidden="true">{lab.icon}</span>
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#72543e]">{lab.eyebrow}</span>
                  <span className="mt-0.5 block text-lg font-black leading-tight">{lab.label}</span>
                  <span className="mt-1 block text-xs font-bold leading-snug text-[#5f6b5d]">{lab.description}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <section className="mt-2 flex min-w-0 flex-1 flex-col rounded-lg border-2 border-[#092421] bg-[#fffdf6] p-2 shadow-[3px_3px_0_#092421]" aria-label={current.label}>
          {activeLab === "expedition" && <PepperExpedition onComplete={() => setActiveLab("words")} />}
          {activeLab === "words" && <WordExplorer />}
          {activeLab === "math" && <MathLenses />}
        </section>

      </div>
    </main>
  );
}
