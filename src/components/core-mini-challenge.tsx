"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

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
  math?: { groups: number; each: number };
};

export const coreMiniExpeditions: { name: string; image: string; imageAlt: string; steps: MiniStep[] }[] = [
  {
    name: "Jalapeño fieldwork",
    image: "/burrow-assets/peppers/jalapeno.jpg",
    imageAlt: "Green jalapeño peppers",
    steps: [
      { id: "jalapeno-reading", skill: "Reading", icon: "🏷️", title: "Read the seed packet", clue: "Keep the soil evenly damp, but never waterlogged.", question: "Why avoid waterlogged soil?", choices: ["Roots still need air", "Seeds grow underwater", "Water freezes the roots"], answer: "Roots still need air", summary: "Damp soil holds both moisture and air for roots." },
      { id: "jalapeno-geography", skill: "Geography", icon: "🌎", title: "Map the pepper homeland", clue: "Jalapeños are named for Xalapa, Mexico.", question: "Which two countries border southern Mexico?", choices: ["Guatemala and Belize", "Chile and Peru", "Spain and Portugal"], answer: "Guatemala and Belize", summary: "Mexico borders Guatemala and Belize in the south." },
      { id: "jalapeno-math", skill: "Math", icon: "🧺", title: "Count the harvest", clue: "7 plants grow 8 peppers each.", question: "7 × 8 = ?", choices: ["48 peppers", "54 peppers", "56 peppers"], answer: "56 peppers", summary: "Seven equal groups of eight make 56 peppers.", math: { groups: 7, each: 8 } },
      { id: "jalapeno-science", skill: "Science", icon: "🧪", title: "Investigate the heat", clue: "Most capsaicin forms in the pale placenta around the seeds, not inside the seeds.", question: "Why can a seed still taste hot?", choices: ["Capsaicin coats its surface", "The seed makes fire", "Every seed is spicy"], answer: "Capsaicin coats its surface", summary: "Capsaicin from nearby tissue can coat a seed." },
      { id: "jalapeno-words", skill: "Words", icon: "📖", title: "Unlock a science word", clue: "Capsaicin is concentrated in the placenta.", question: "What does concentrated mean?", choices: ["Gathered in a larger amount", "Spread perfectly evenly", "Changed into another chemical"], answer: "Gathered in a larger amount", summary: "Concentrated means more of something is gathered in one place." },
    ],
  },
  {
    name: "Caribbean pepper quest",
    image: "/burrow-assets/peppers/scotch-bonnet.jpg",
    imageAlt: "Yellow Scotch bonnet peppers",
    steps: [
      { id: "bonnet-reading", skill: "Reading", icon: "🏷️", title: "Read the tasting note", clue: "A Scotch bonnet can taste fruity and fiercely hot at the same time.", question: "What does the word and tell us?", choices: ["Both descriptions can be true", "Only one can be true", "The pepper has no flavor"], answer: "Both descriptions can be true", summary: "And joins two ideas that are both true." },
      { id: "bonnet-geography", skill: "Geography", icon: "🌎", title: "Cross the Caribbean", clue: "Scotch bonnets are important in Jamaica and Trinidad and Tobago.", question: "Which sea are these island countries beside?", choices: ["Caribbean Sea", "Baltic Sea", "Arabian Sea"], answer: "Caribbean Sea", summary: "Jamaica and Trinidad and Tobago are Caribbean island countries." },
      { id: "bonnet-math", skill: "Math", icon: "🧺", title: "Pack the market crates", clue: "9 crates hold 12 peppers each.", question: "9 × 12 = ?", choices: ["96 peppers", "108 peppers", "118 peppers"], answer: "108 peppers", summary: "Nine equal groups of 12 make 108 peppers.", math: { groups: 9, each: 12 } },
      { id: "bonnet-science", skill: "Science", icon: "🧪", title: "Compare flavor and heat", clue: "Sweet-smelling fruit chemicals and hot capsaicin are different substances.", question: "Can a pepper be fruity and hot?", choices: ["Yes, different chemicals cause each", "No, heat removes every aroma", "Only if it is frozen"], answer: "Yes, different chemicals cause each", summary: "Aroma and heat can come from different chemicals in the same pepper." },
      { id: "bonnet-words", skill: "Words", icon: "📖", title: "Name the aroma", clue: "The field note calls the Scotch bonnet aromatic.", question: "What does aromatic mean?", choices: ["Having a noticeable smell", "Having no seeds", "Growing without light"], answer: "Having a noticeable smell", summary: "Aromatic means having a strong or noticeable smell." },
    ],
  },
  {
    name: "Ghost pepper mission",
    image: "/burrow-assets/peppers/ghost-pepper.jpg",
    imageAlt: "Red ghost peppers",
    steps: [
      { id: "ghost-reading", skill: "Reading", icon: "🏷️", title: "Read the weather log", clue: "Monsoon rains arrive seasonally rather than falling equally all year.", question: "What does seasonally mean?", choices: ["At certain times of year", "Every single hour", "Only once in history"], answer: "At certain times of year", summary: "Seasonal events return during particular parts of the year." },
      { id: "ghost-geography", skill: "Geography", icon: "🌎", title: "Find northeast India", clue: "Ghost peppers are associated with northeast India.", question: "Which pair of countries borders that region?", choices: ["Bangladesh and Bhutan", "Brazil and Argentina", "France and Spain"], answer: "Bangladesh and Bhutan", summary: "Northeast India lies beside Bangladesh, Bhutan, China, and Myanmar." },
      { id: "ghost-math", skill: "Math", icon: "🧺", title: "Count the greenhouse rows", clue: "11 rows hold 9 plants each.", question: "11 × 9 = ?", choices: ["90 plants", "99 plants", "109 plants"], answer: "99 plants", summary: "Eleven groups of nine make 99 plants.", math: { groups: 11, each: 9 } },
      { id: "ghost-science", skill: "Science", icon: "🧪", title: "Trace the heat signal", clue: "Capsaicin activates some of the same nerve receptors that warn your brain about heat.", question: "Why can a pepper feel burning without a flame?", choices: ["It triggers heat-sensing nerves", "It raises every bite to boiling", "It contains a tiny fire"], answer: "It triggers heat-sensing nerves", summary: "Capsaicin can trigger a heat warning signal without an actual flame." },
      { id: "ghost-words", skill: "Words", icon: "📖", title: "Name the signal catcher", clue: "A receptor receives a signal and helps a cell respond.", question: "Which object works most like a receptor?", choices: ["An antenna receiving a message", "A sealed rock", "A shadow on a wall"], answer: "An antenna receiving a message", summary: "A receptor detects a signal, a little like an antenna." },
    ],
  },
  {
    name: "Pepper X research lab",
    image: "/burrow-assets/peppers/pepper-x.png",
    imageAlt: "Pepper X",
    steps: [
      { id: "pepper-x-reading", skill: "Reading", icon: "🏷️", title: "Read the record card", clue: "Pepper X averages 2,693,000 Scoville Heat Units. Individual peppers can measure above or below that number.", question: "What does averages tell us?", choices: ["It is a typical value, not every exact result", "Every pepper is exactly identical", "No pepper was measured"], answer: "It is a typical value, not every exact result", summary: "An average summarizes several measurements; individuals can vary." },
      { id: "pepper-x-geography", skill: "Geography", icon: "🌎", title: "Locate the pepper lab", clue: "Pepper X was developed in Fort Mill, South Carolina.", question: "South Carolina is on which U.S. coast?", choices: ["Atlantic coast", "Pacific coast", "Arctic coast"], answer: "Atlantic coast", summary: "South Carolina is in the southeastern United States on the Atlantic coast." },
      { id: "pepper-x-math", skill: "Math", icon: "🧺", title: "Fill the seed grid", clue: "12 trays hold 12 seeds each.", question: "12 × 12 = ?", choices: ["132 seeds", "140 seeds", "144 seeds"], answer: "144 seeds", summary: "Twelve groups of 12 make 144 seeds.", math: { groups: 12, each: 12 } },
      { id: "pepper-x-science", skill: "Science", icon: "🧪", title: "Explain the range", clue: "Genes affect a pepper's possible heat, while sunlight, water, and temperature can affect how it grows.", question: "Why might two peppers from one cultivar measure differently?", choices: ["Growing conditions can differ", "Numbers change the pepper's species", "Scoville units measure color only"], answer: "Growing conditions can differ", summary: "Genes and growing conditions both contribute to the final pepper." },
      { id: "pepper-x-words", skill: "Words", icon: "📖", title: "Unlock a plant word", clue: "Pepper X is a cultivar selected for particular traits.", question: "What is a cultivar?", choices: ["A cultivated plant variety", "A map of a continent", "A tool for measuring rain"], answer: "A cultivated plant variety", summary: "A cultivar is a plant variety people maintain for chosen traits." },
    ],
  },
];

export function CoreMiniChallenge({ milestone, onComplete }: { milestone: number; onComplete: (correct: number) => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [complete, setComplete] = useState(false);
  const expeditionIndex = Math.max(0, Math.floor(milestone / 10) - 1) % coreMiniExpeditions.length;
  const expedition = coreMiniExpeditions[expeditionIndex];
  const steps = expedition.steps;
  const step = steps[stepIndex];
  const correct = selected === step.answer;
  const mathView = useMemo<MathView>(() => (["groups", "array", "addition", "line"] as MathView[])[Math.max(0, Math.floor(milestone / 10) - 1) % 4], [milestone]);

  const next = () => {
    if (!selected) return;
    setResults((current) => [...current, selected === step.answer]);
    if (stepIndex === steps.length - 1) setComplete(true);
    else {
      setStepIndex((value) => value + 1);
      setSelected(null);
    }
  };

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
          <Image src={expedition.image} alt={expedition.imageAlt} fill sizes="(max-width: 900px) 100vw, 36vw" className="object-cover" priority />
          <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-2 text-[#102f36]"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9f3f2b]">{milestone} questions complete · Pepper mini challenge</p><p className="mt-1 text-lg font-black">{expedition.name}</p></div>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1">
          {steps.map((item, index) => <div key={item.id} className={`rounded-md border-2 px-1 py-2 text-center ${index < stepIndex ? "border-[#70d392] bg-[#70d392] text-[#092421]" : index === stepIndex ? "border-[#f0c84b] bg-[#f0c84b] text-[#092421]" : "border-white/25 bg-white/10"}`}><span className="block text-lg" aria-hidden="true">{index < stepIndex ? "✓" : item.icon}</span><span className="mt-1 block truncate text-[8px] font-black uppercase">{item.skill}</span></div>)}
        </div>
      </aside>

      <article className="flex min-w-0 flex-col rounded-lg border-2 border-[#d9c7a7] bg-white p-3">
        <div className="flex items-center justify-between gap-3"><p className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1 text-xs font-black uppercase tracking-[0.12em]">{step.icon} {step.skill}</p><p className="text-xs font-black text-[#72543e]">Stop {stepIndex + 1}/{steps.length}</p></div>
        <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.5rem)] font-black leading-[0.95]">{step.title}</h2>
        <p className={`mt-3 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-3 font-black leading-snug text-[#4f5e57] ${step.skill === "Math" ? "text-2xl" : "text-lg"}`}>{step.clue}</p>
        {step.skill === "Math" && step.math && <MiniMathView view={mathView} groups={step.math.groups} each={step.math.each} />}
        <h3 className="mt-4 text-xl font-black leading-tight">{step.question}</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {step.choices.map((choice) => {
            const answerChoice = selected !== null && choice === step.answer;
            const chosenWrong = selected === choice && choice !== step.answer;
            return <button key={choice} disabled={selected !== null} onClick={() => setSelected(choice)} className={`min-h-16 rounded-lg border-2 p-3 text-left text-base font-black transition ${answerChoice ? "border-[#092421] bg-[#70d392] shadow-[2px_2px_0_#092421]" : chosenWrong ? "border-[#092421] bg-[#f59a7d]" : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf] disabled:opacity-70"}`}>{choice}</button>;
          })}
        </div>
        {selected && <div className={`mt-3 rounded-lg border-2 p-3 ${correct ? "border-[#2f7d4f] bg-[#e9ffe9]" : "border-[#9f3f2b] bg-[#fff0ea]"}`}><p className="text-lg font-black">{correct ? "Correct!" : `Answer: ${step.answer}`}</p><button onClick={next} className="mt-3 rounded-lg border-2 border-[#092421] bg-[#102f36] px-4 py-2 font-black text-white shadow-[2px_2px_0_#092421]">{stepIndex === steps.length - 1 ? "View challenge summary" : "Next question"}</button></div>}
      </article>
    </section>
  );
}

function MiniMathView({ view, groups, each }: { view: MathView; groups: number; each: number }) {
  if (view === "array") return <div className="mt-3 text-center" aria-label={`${groups} row by ${each} column pepper array`}><p className="mb-2 text-xs font-black uppercase text-[#72543e]">{groups} rows × {each} columns</p><div className="inline-grid gap-1 rounded-lg border-2 border-[#092421] bg-white p-2" style={{ gridTemplateColumns: `repeat(${each}, minmax(0, 1fr))` }}>{Array.from({ length: groups * each }, (_, index) => <span key={index} className="h-2 w-2 rounded-full bg-[#d74631] sm:h-3 sm:w-3" aria-hidden="true" />)}</div></div>;
  if (view === "addition") return <div className="mt-3 flex flex-wrap items-center justify-center gap-2 rounded-lg border-2 border-[#092421] bg-white p-3 text-lg font-black" aria-label="Repeated addition">{Array.from({ length: groups }, (_, index) => <span key={index} className="contents"><span>{each}</span>{index < groups - 1 && <span>+</span>}</span>)}<span>= ?</span></div>;
  if (view === "line") return <div className="mt-3 overflow-x-auto rounded-lg border-2 border-[#092421] bg-white p-3" aria-label="Number line"><div className="flex min-w-max items-center justify-between gap-2">{Array.from({ length: groups + 1 }, (_, index) => index * each).map((value, index) => <span key={value} className="contents"><span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#092421] bg-[#fff9ec] text-xs font-black">{value}</span>{index < groups && <span className="font-black text-[#9f3f2b]">+{each} →</span>}</span>)}</div></div>;
  return <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6" aria-label={`${groups} equal pepper groups of ${each}`}>{Array.from({ length: groups }, (_, index) => <div key={index} className="rounded-lg border-2 border-[#092421] bg-[#e9ffe9] p-2 text-center"><p className="text-[10px] font-black uppercase">Group {index + 1}</p><p className="mt-1 text-lg font-black" aria-hidden="true">🌶️ × {each}</p></div>)}</div>;
}
