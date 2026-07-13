"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { WorldMapSurface } from "@/components/world-map-surface";

type MathView = "groups" | "array" | "addition" | "line";
type ConceptVisual = "pepper-anatomy" | "flavor-and-heat" | "heat-signal" | "genes-and-growing";

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
  evidence?: string;
  math?: { groups: number; each: number };
  map?: { hint: string; choices: { label: string; x: number; y: number }[] };
  conceptVisual?: ConceptVisual;
};

export const coreMiniExpeditions: { name: string; image: string; imageAlt: string; steps: MiniStep[] }[] = [
  {
    name: "Jalapeño fieldwork",
    image: "/burrow-assets/peppers/jalapeno.jpg",
    imageAlt: "Green jalapeño peppers",
    steps: [
      { id: "jalapeno-reading", skill: "Reading", icon: "🏷️", title: "Read the seed packet", clue: "Jalapeño roots need both moisture and air. Keep the soil evenly damp, but never waterlogged, because flooded soil leaves too little air around the roots.", question: "Which watering plan follows the packet?", choices: ["Water until the soil is damp, then stop", "Keep pouring until water covers the soil", "Let the soil stay completely dry"], answer: "Water until the soil is damp, then stop", summary: "The packet recommends damp soil, not flooded or dry soil, so roots receive moisture and air.", evidence: "Keep the soil evenly damp, but never waterlogged" },
      { id: "jalapeno-geography", skill: "Geography", icon: "🌎", title: "Map the pepper homeland", clue: "Jalapeños are named for Xalapa, a city in Mexico.", question: "Which pin marks Mexico?", choices: ["Mexico", "Chile", "Spain"], answer: "Mexico", summary: "Mexico is in the southern part of North America, between the United States and Central America.", map: { hint: "Look in the southern part of North America.", choices: [{ label: "Mexico", x: 22, y: 38 }, { label: "Chile", x: 30, y: 69 }, { label: "Spain", x: 49, y: 28 }] } },
      { id: "jalapeno-math", skill: "Math", icon: "🧺", title: "Count the harvest", clue: "7 plants grow 8 peppers each.", question: "7 × 8 = ?", choices: ["48 peppers", "54 peppers", "56 peppers"], answer: "56 peppers", summary: "Seven equal groups of eight make 56 peppers.", math: { groups: 7, each: 8 } },
      { id: "jalapeno-science", skill: "Science", icon: "🧪", title: "See where pepper heat begins", clue: "The pale placenta is the tissue that holds the seeds. Most capsaicin forms there and can rub onto a nearby seed.", question: "Where does the capsaicin on a seed's surface come from?", choices: ["The nearby placenta", "Inside the seed", "The pepper's stem"], answer: "The nearby placenta", summary: "The placenta makes most of the capsaicin, which can coat nearby seeds.", conceptVisual: "pepper-anatomy" },
      { id: "jalapeno-words", skill: "Words", icon: "📖", title: "Unlock a science word", clue: "Capsaicin is concentrated in the placenta.", question: "What does concentrated mean?", choices: ["Gathered in a larger amount", "Spread perfectly evenly", "Changed into another chemical"], answer: "Gathered in a larger amount", summary: "Concentrated means more of something is gathered in one place." },
    ],
  },
  {
    name: "Caribbean pepper quest",
    image: "/burrow-assets/peppers/scotch-bonnet.jpg",
    imageAlt: "Yellow Scotch bonnet peppers",
    steps: [
      { id: "bonnet-reading", skill: "Reading", icon: "🏷️", title: "Read the tasting note", clue: "A Scotch bonnet can taste fruity and fiercely hot at the same time. Its fruit-like flavor does not make its heat milder.", question: "Which statement matches the tasting note?", choices: ["It can taste fruity and very hot together", "It tastes fruity only when it is mild", "Its strong heat means it has no flavor"], answer: "It can taste fruity and very hot together", summary: "The note describes fruit-like flavor and fierce heat happening in the same pepper.", evidence: "fruity and fiercely hot at the same time" },
      { id: "bonnet-geography", skill: "Geography", icon: "🌎", title: "Cross the Caribbean", clue: "Scotch bonnets are important in Jamaica, an island in the Caribbean Sea.", question: "Which pin marks Jamaica?", choices: ["Jamaica", "Sweden", "Oman"], answer: "Jamaica", summary: "Jamaica is a Caribbean island south of Cuba and east of Central America.", map: { hint: "Look between North and South America.", choices: [{ label: "Jamaica", x: 29, y: 40 }, { label: "Sweden", x: 54, y: 17 }, { label: "Oman", x: 66, y: 38 }] } },
      { id: "bonnet-math", skill: "Math", icon: "🧺", title: "Pack the market crates", clue: "9 crates hold 12 peppers each.", question: "9 × 12 = ?", choices: ["96 peppers", "108 peppers", "118 peppers"], answer: "108 peppers", summary: "Nine equal groups of 12 make 108 peppers.", math: { groups: 9, each: 12 } },
      { id: "bonnet-science", skill: "Science", icon: "🧪", title: "Compare flavor and heat", clue: "Aroma chemicals create a fruity smell. Capsaicin activates heat-sensing nerves. One pepper can contain both.", question: "Why can one pepper smell fruity and also feel hot?", choices: ["Different chemicals cause each sensation", "Heat removes every aroma", "Cold air creates both"], answer: "Different chemicals cause each sensation", summary: "Aroma chemicals and capsaicin can create different sensations in the same pepper.", conceptVisual: "flavor-and-heat" },
      { id: "bonnet-words", skill: "Words", icon: "📖", title: "Name the aroma", clue: "The field note calls the Scotch bonnet aromatic.", question: "What does aromatic mean?", choices: ["Having a noticeable smell", "Having no seeds", "Growing without light"], answer: "Having a noticeable smell", summary: "Aromatic means having a strong or noticeable smell." },
    ],
  },
  {
    name: "Ghost pepper mission",
    image: "/burrow-assets/peppers/ghost-pepper.jpg",
    imageAlt: "Red ghost peppers",
    steps: [
      { id: "ghost-reading", skill: "Reading", icon: "🏷️", title: "Read the weather log", clue: "Monsoon rains arrive seasonally. Heavy rain returns during certain parts of the year instead of falling equally all year.", question: "Which rain pattern matches the weather log?", choices: ["Heavy rain returns during certain seasons", "The same amount of rain falls every day", "Rain happened once and never returns"], answer: "Heavy rain returns during certain seasons", summary: "The log says heavy rain returns during particular parts of the year.", evidence: "Heavy rain returns during certain parts of the year" },
      { id: "ghost-geography", skill: "Geography", icon: "🌎", title: "Find northeast India", clue: "Ghost peppers are associated with northeast India, near Bangladesh and Bhutan.", question: "Which pin marks northeast India?", choices: ["Northeast India", "Brazil", "France"], answer: "Northeast India", summary: "Northeast India lies in South Asia beside Bangladesh, Bhutan, China, and Myanmar.", map: { hint: "Look in South Asia, north of the equator.", choices: [{ label: "Northeast India", x: 76, y: 36 }, { label: "Brazil", x: 35, y: 56 }, { label: "France", x: 51, y: 24 }] } },
      { id: "ghost-math", skill: "Math", icon: "🧺", title: "Count the greenhouse rows", clue: "11 rows hold 9 plants each.", question: "11 × 9 = ?", choices: ["90 plants", "99 plants", "109 plants"], answer: "99 plants", summary: "Eleven groups of nine make 99 plants.", math: { groups: 11, each: 9 } },
      { id: "ghost-science", skill: "Science", icon: "🧪", title: "Trace the heat signal", clue: "Capsaicin activates a heat-sensing receptor. The nerve then sends a warning signal to the brain even though there is no flame.", question: "What creates the burning feeling?", choices: ["A nerve sends a heat warning", "The pepper reaches boiling temperature", "A tiny flame burns inside it"], answer: "A nerve sends a heat warning", summary: "Capsaicin triggers a nerve signal that the brain interprets as heat.", conceptVisual: "heat-signal" },
      { id: "ghost-words", skill: "Words", icon: "📖", title: "Name the signal catcher", clue: "A receptor receives a signal and helps a cell respond.", question: "Which object works most like a receptor?", choices: ["An antenna receiving a message", "A sealed rock", "A shadow on a wall"], answer: "An antenna receiving a message", summary: "A receptor detects a signal, a little like an antenna." },
    ],
  },
  {
    name: "Pepper X research lab",
    image: "/burrow-assets/peppers/pepper-x.png",
    imageAlt: "Pepper X",
    steps: [
      { id: "pepper-x-reading", skill: "Reading", icon: "🏷️", title: "Read the record card", clue: "Pepper X averages 2,693,000 Scoville Heat Units. Individual peppers can measure above or below that number.", question: "Which statement is supported by the record card?", choices: ["Different fruits can measure above or below 2,693,000 SHU", "Every fruit measures exactly 2,693,000 SHU", "Only one Pepper X fruit was measured"], answer: "Different fruits can measure above or below 2,693,000 SHU", summary: "The average summarizes multiple measurements, while individual peppers can be higher or lower.", evidence: "Individual peppers can measure above or below that number" },
      { id: "pepper-x-geography", skill: "Geography", icon: "🌎", title: "Locate the pepper lab", clue: "Pepper X was developed in Fort Mill, South Carolina, in the southeastern United States.", question: "Which pin marks South Carolina?", choices: ["South Carolina", "California", "Alaska"], answer: "South Carolina", summary: "South Carolina is in the southeastern United States near the Atlantic coast.", map: { hint: "Look on the eastern side of the United States.", choices: [{ label: "South Carolina", x: 28, y: 31 }, { label: "California", x: 17, y: 29 }, { label: "Alaska", x: 8, y: 14 }] } },
      { id: "pepper-x-math", skill: "Math", icon: "🧺", title: "Fill the seed grid", clue: "12 trays hold 12 seeds each.", question: "12 × 12 = ?", choices: ["132 seeds", "140 seeds", "144 seeds"], answer: "144 seeds", summary: "Twelve groups of 12 make 144 seeds.", math: { groups: 12, each: 12 } },
      { id: "pepper-x-science", skill: "Science", icon: "🧪", title: "Explain the heat range", clue: "Genes set a pepper's possible traits. Sunlight, water, and temperature also affect how each fruit develops.", question: "Why can two fruits from one cultivar have different heat levels?", choices: ["Their growing conditions can differ", "A measurement changes their species", "Scoville units measure only color"], answer: "Their growing conditions can differ", summary: "Shared genes matter, but different growing conditions can change how each fruit develops.", conceptVisual: "genes-and-growing" },
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
            <p className="mx-auto mt-2 w-fit rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#102f36]">Challenge Mode complete</p>
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
    <section className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg border-2 border-[#092421] bg-[#fffdf6] p-2 shadow-[4px_4px_0_#092421] min-[900px]:min-h-0 min-[900px]:overflow-hidden" aria-label={`Challenge Mode stop ${stepIndex + 1} of ${steps.length}`}>
      <ChallengeModeBanner expeditionName={expedition.name} milestone={milestone} steps={steps} stepIndex={stepIndex} />
      <div className="grid flex-1 gap-2 min-[900px]:min-h-0 min-[900px]:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
        <MiniStoryStage expedition={expedition} step={step} selected={selected} onSelect={setSelected} mathView={mathView} />

        <article key={step.id} className="flex min-w-0 flex-col rounded-lg border-2 border-[#092421] bg-white p-3 shadow-[3px_3px_0_#092421] min-[900px]:min-h-0 min-[900px]:overflow-y-auto">
          <div className="flex items-center justify-between gap-3"><p className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1 text-xs font-black uppercase tracking-[0.12em]">{step.icon} {step.skill}</p><p className="text-xs font-black text-[#72543e]">Question {stepIndex + 1}/{steps.length}</p></div>
          <h2 className="mt-3 text-[clamp(1.55rem,2.8vw,2.65rem)] font-black leading-[1.02] text-[#102f36]">{step.title}</h2>
          <p className="mt-3 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-3 text-base font-black leading-snug text-[#4f5e57]">{step.clue}</p>
          <h3 className={`mt-4 font-black leading-tight text-[#102f36] ${step.skill === "Math" ? "text-[clamp(2.75rem,6vw,5rem)] tracking-[-0.04em] text-[#9f3f2b]" : "text-[clamp(1.35rem,2.2vw,2rem)]"}`}>{step.question}</h3>
          <div className="mt-3 grid gap-2">
          {step.choices.map((choice) => {
            const answerChoice = selected !== null && choice === step.answer;
            const chosenWrong = selected === choice && choice !== step.answer;
            const choiceIndex = step.choices.indexOf(choice);
            return <button key={choice} disabled={selected !== null} onClick={() => setSelected(choice)} className={`min-h-14 rounded-lg border-2 p-3 text-left text-base font-black transition ${answerChoice ? "border-[#092421] bg-[#70d392] shadow-[2px_2px_0_#092421]" : chosenWrong ? "border-[#092421] bg-[#f59a7d]" : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf] disabled:opacity-70"}`}>{step.map && <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-md border-2 border-[#092421] bg-[#f0c84b] text-xs">{String.fromCharCode(65 + choiceIndex)}</span>}{choice}</button>;
          })}
          </div>
          {selected && <div className={`mt-3 rounded-lg border-2 p-3 ${correct ? "border-[#2f7d4f] bg-[#e9ffe9]" : "border-[#9f3f2b] bg-[#fff0ea]"}`}><p className="text-lg font-black">{correct ? "Correct!" : `Answer: ${step.answer}`}</p>{step.evidence && <p className="mt-2 text-sm font-bold text-[#72543e]"><span className="font-black">Evidence:</span> “{step.evidence}”</p>}<p className="mt-1 text-sm font-bold text-[#5f6b5d]">{step.summary}</p><button onClick={next} className="mt-3 w-full rounded-lg border-2 border-[#092421] bg-[#102f36] px-4 py-2 font-black text-white shadow-[2px_2px_0_#092421]">{stepIndex === steps.length - 1 ? "View challenge summary" : "Next question"}</button></div>}
        </article>
      </div>
    </section>
  );
}

function ChallengeModeBanner({ expeditionName, milestone, steps, stepIndex }: { expeditionName: string; milestone: number; steps: MiniStep[]; stepIndex: number }) {
  return (
    <header aria-label="Challenge Mode" className="rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 text-white shadow-[3px_3px_0_#092421]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="rounded-md border-2 border-[#092421] bg-[#f0c84b] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#102f36]">⚡ Challenge Mode</p>
          <p className="text-sm font-black">Deep dive: {expeditionName}</p>
        </div>
        <p className="text-xs font-bold text-[#b8e4d8]">Unlocked after {milestone} regular questions · Stop {stepIndex + 1} of {steps.length}</p>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1">
        {steps.map((item, index) => <div key={item.id} className={`rounded-md border px-1 py-1.5 text-center ${index < stepIndex ? "border-[#70d392] bg-[#70d392] text-[#092421]" : index === stepIndex ? "border-[#f0c84b] bg-[#f0c84b] text-[#092421]" : "border-white/25 bg-white/10"}`}><span className="mr-1" aria-hidden="true">{index < stepIndex ? "✓" : item.icon}</span><span className="text-[9px] font-black uppercase tracking-[0.08em]">{item.skill}</span></div>)}
      </div>
    </header>
  );
}

function MiniStoryStage({ expedition, step, selected, onSelect, mathView }: { expedition: (typeof coreMiniExpeditions)[number]; step: MiniStep; selected: string | null; onSelect: (choice: string) => void; mathView: MathView }) {
  if (step.map) {
    return (
      <aside aria-label="Challenge map story" className="min-h-[430px] rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 shadow-[4px_4px_0_#092421] min-[900px]:min-h-0">
        <WorldMapSurface
          markers={step.map.choices.map((choice) => ({ id: choice.label, label: choice.label, x: choice.x, y: choice.y, tone: selected ? choice.label === step.answer ? "correct" as const : choice.label === selected ? "wrong" as const : "quiet" as const : "default" as const }))}
          footer={selected ? `Answer: ${step.answer}` : step.map.hint}
          onSelect={onSelect}
          disabled={selected !== null}
          className="h-full min-h-[420px]"
        />
      </aside>
    );
  }

  if (step.skill === "Math" && step.math) {
    return (
      <aside aria-label="Challenge math story" className="flex min-h-[520px] flex-col gap-2 rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 shadow-[4px_4px_0_#092421] min-[900px]:min-h-0">
        <div className="relative min-h-[130px] max-h-[190px] flex-[.3] overflow-hidden rounded-lg border-2 border-[#092421] bg-[#fff9ec]">
          <Image src={expedition.image} alt={expedition.imageAlt} fill sizes="(max-width: 900px) 100vw, 58vw" className="object-cover" priority />
          <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-2 text-[#102f36] shadow-[2px_2px_0_#092421]"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9f3f2b]">Picture the harvest</p><p className="text-base font-black">{step.clue}</p></div>
        </div>
        <div className="min-h-[300px] flex-1"><MiniMathView view={mathView} groups={step.math.groups} each={step.math.each} /></div>
      </aside>
    );
  }

  if (step.conceptVisual) {
    return <aside aria-label="Challenge science story" className="min-h-[480px] overflow-hidden rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 shadow-[4px_4px_0_#092421] min-[900px]:min-h-0"><MiniConceptDiagram kind={step.conceptVisual} /></aside>;
  }

  return (
    <aside aria-label="Challenge picture story" className="relative min-h-[380px] overflow-hidden rounded-lg border-2 border-[#092421] bg-[#fff9ec] shadow-[4px_4px_0_#092421] min-[900px]:min-h-0">
      <Image src={expedition.image} alt={expedition.imageAlt} fill sizes="(max-width: 900px) 100vw, 58vw" className="object-cover" priority />
      <div className="absolute left-2 top-2 rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#102f36] shadow-[2px_2px_0_#092421]">{step.icon} {step.skill} story</div>
      <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-3 text-[#102f36] shadow-[2px_2px_0_#092421]"><p className="text-xl font-black">{expedition.name}</p><p className="mt-1 text-sm font-bold text-[#5f6b5d]">{step.title}</p></div>
    </aside>
  );
}

function MiniMathView({ view, groups, each }: { view: MathView; groups: number; each: number }) {
  if (view === "array") return <div className="grid h-full min-h-[300px] place-items-center rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-4 text-center" aria-label={`${groups} row by ${each} column pepper array`}><div><p className="mb-3 text-4xl font-black text-[#9f3f2b]">{groups} × {each} = ?</p><p className="mb-3 text-xs font-black uppercase text-[#72543e]">{groups} rows × {each} columns</p><div className="inline-grid gap-2 rounded-lg border-2 border-[#092421] bg-white p-4 shadow-[3px_3px_0_#092421]" style={{ gridTemplateColumns: `repeat(${each}, minmax(0, 1fr))` }}>{Array.from({ length: groups * each }, (_, index) => <span key={index} className="h-3 w-3 rounded-full bg-[#d74631] sm:h-4 sm:w-4" aria-hidden="true" />)}</div></div></div>;
  if (view === "addition") return <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-4" aria-label="Repeated addition"><p className="text-4xl font-black text-[#9f3f2b]">{groups} × {each} = ?</p><div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-2xl font-black">{Array.from({ length: groups }, (_, index) => <span key={index} className="contents"><span className="rounded-md border-2 border-[#092421] bg-white px-3 py-2">{each}</span>{index < groups - 1 && <span>+</span>}</span>)}<span>= ?</span></div></div>;
  if (view === "line") return <div className="flex h-full min-h-[300px] flex-col justify-center overflow-x-auto rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-4" aria-label="Number line"><p className="mb-6 text-center text-4xl font-black text-[#9f3f2b]">{groups} jumps of {each}</p><div className="flex min-w-max items-center justify-between gap-2">{Array.from({ length: groups + 1 }, (_, index) => index * each).map((value, index) => <span key={value} className="contents"><span className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#092421] bg-white text-sm font-black">{value}</span>{index < groups && <span className="font-black text-[#9f3f2b]">+{each} →</span>}</span>)}</div></div>;
  return <div className="h-full min-h-[300px] overflow-y-auto rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-4" aria-label={`${groups} equal pepper groups of ${each}`}><p className="text-center text-4xl font-black text-[#9f3f2b]">{groups} × {each} = ?</p><p className="mt-1 text-center text-xs font-black uppercase tracking-[0.14em] text-[#72543e]">{groups} equal groups · {each} peppers in each group</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: groups }, (_, index) => <div key={index} className="rounded-lg border-2 border-[#092421] bg-[#e9ffe9] p-3 text-center shadow-[2px_2px_0_#092421]"><p className="text-[10px] font-black uppercase">Plant {index + 1}</p><p className="mt-1 text-xl font-black" aria-hidden="true">🌶️ × {each}</p></div>)}</div></div>;
}

function MiniConceptDiagram({ kind }: { kind: ConceptVisual }) {
  if (kind === "pepper-anatomy") return (
    <div className="grid h-full min-h-[470px] grid-rows-[1fr_auto] rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-3" aria-label="Labeled pepper anatomy diagram">
      <svg viewBox="0 0 720 470" className="h-full w-full" role="img" aria-label="Cut-open pepper showing the outer wall, pale placenta, seeds, and capsaicin">
        <path d="M265 56 C195 80 145 170 160 285 C174 393 262 424 360 405 C453 387 521 316 508 215 C496 120 419 64 333 60 Z" fill="#d74631" stroke="#092421" strokeWidth="8" />
        <path d="M285 92 C231 120 205 188 218 270 C230 342 287 371 353 359 C421 347 463 292 452 222 C442 153 390 105 329 96 Z" fill="#fff1bf" stroke="#092421" strokeWidth="6" />
        <path d="M326 110 C303 166 306 264 340 341 C365 306 383 211 370 121 Z" fill="#f5d783" stroke="#8a623a" strokeWidth="5" />
        {[{x:287,y:170},{x:399,y:174},{x:280,y:232},{x:410,y:239},{x:303,y:294},{x:393,y:302}].map((seed, index) => <ellipse key={index} cx={seed.x} cy={seed.y} rx="15" ry="9" fill="#fffdf6" stroke="#72543e" strokeWidth="4" />)}
        <circle cx="320" cy="180" r="8" fill="#f59a7d" /><circle cx="383" cy="220" r="8" fill="#f59a7d" /><circle cx="337" cy="286" r="8" fill="#f59a7d" />
        <path d="M255 104 L96 67" stroke="#092421" strokeWidth="4" /><text x="24" y="58" fontSize="24" fontWeight="900" fill="#102f36">PEPPER WALL</text>
        <path d="M347 180 L586 92" stroke="#092421" strokeWidth="4" /><text x="521" y="72" fontSize="24" fontWeight="900" fill="#102f36">PLACENTA</text><text x="520" y="100" fontSize="17" fontWeight="700" fill="#72543e">makes most capsaicin</text>
        <path d="M410 238 L604 235" stroke="#092421" strokeWidth="4" /><text x="610" y="242" fontSize="24" fontWeight="900" fill="#102f36">SEED</text>
        <path d="M383 220 L578 350" stroke="#f59a7d" strokeWidth="5" /><text x="504" y="385" fontSize="24" fontWeight="900" fill="#9f3f2b">CAPSAICIN</text><text x="504" y="412" fontSize="17" fontWeight="700" fill="#72543e">can rub onto seeds</text>
      </svg>
      <p className="rounded-lg border-2 border-[#092421] bg-white p-3 text-center text-base font-black text-[#102f36]">The pale placenta holds the seeds and makes most of the pepper&apos;s capsaicin.</p>
    </div>
  );

  const diagrams: Record<Exclude<ConceptVisual, "pepper-anatomy">, { label: string; title: string; items: { icon: string; title: string; text: string }[] }> = {
    "flavor-and-heat": { label: "Diagram showing aroma and heat caused by different pepper chemicals", title: "One pepper · two sensations", items: [{ icon: "🍍", title: "Aroma chemicals", text: "create a fruity smell" }, { icon: "🌶️", title: "Capsaicin", text: "activates heat-sensing nerves" }] },
    "heat-signal": { label: "Diagram showing capsaicin sending a heat warning through a nerve to the brain", title: "How the heat signal travels", items: [{ icon: "🌶️", title: "Capsaicin", text: "touches a receptor" }, { icon: "〰️", title: "Nerve", text: "sends a warning" }, { icon: "🧠", title: "Brain", text: "interprets heat" }] },
    "genes-and-growing": { label: "Diagram showing genes and growing conditions shaping a pepper's heat", title: "What shapes each pepper", items: [{ icon: "🧬", title: "Genes", text: "set possible traits" }, { icon: "☀️💧", title: "Growing conditions", text: "sun, water, temperature" }, { icon: "🌶️", title: "Fruit", text: "develops its final heat" }] },
  };
  const diagram = diagrams[kind];
  return <div className="flex h-full min-h-[470px] flex-col justify-center rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-5" aria-label={diagram.label}><p className="text-center text-3xl font-black text-[#102f36]">{diagram.title}</p><div className={`mt-6 grid items-stretch gap-3 ${diagram.items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>{diagram.items.map((item, index) => <div key={item.title} className="relative rounded-xl border-2 border-[#092421] bg-white p-4 text-center shadow-[3px_3px_0_#092421]"><p className="text-5xl" aria-hidden="true">{item.icon}</p><p className="mt-3 text-lg font-black text-[#102f36]">{item.title}</p><p className="mt-1 text-sm font-bold text-[#5f6b5d]">{item.text}</p>{index < diagram.items.length - 1 && <span className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 text-3xl font-black text-[#9f3f2b] sm:block">→</span>}</div>)}</div></div>;
}
