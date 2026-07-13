"use client";

import Image from "next/image";
import { useState } from "react";
import { EqualGroupsBoard, type EqualGroupsVisual } from "@/components/equal-groups-board";
import { GameAnswerFeedback, GameChoiceButton, GameChoiceGrid } from "@/components/game-question-ui";
import { WorldMapSurface } from "@/components/world-map-surface";

export type ConceptVisual = "pepper-anatomy" | "flavor-and-heat" | "heat-signal" | "genes-and-growing";

type ChallengeStepBase = {
  id: string;
  icon: string;
  title: string;
  clue: string;
  question: string;
  choices: string[];
  answer: string;
  summary: string;
};

export type ChallengeStep =
  | (ChallengeStepBase & { skill: "Reading"; evidence: string })
  | (ChallengeStepBase & { skill: "Geography"; map: { hint: string; choices: { label: string; x: number; y: number }[] } })
  | (ChallengeStepBase & { skill: "Math"; math: { groups: number; each: number; visual: EqualGroupsVisual } })
  | (ChallengeStepBase & { skill: "Science"; conceptVisual: ConceptVisual })
  | (ChallengeStepBase & { skill: "Words" });

export const challengeConceptVisualLabels: Record<ConceptVisual, string> = {
  "pepper-anatomy": "Labeled pepper anatomy diagram",
  "flavor-and-heat": "Diagram showing aroma and heat caused by different pepper chemicals",
  "heat-signal": "Diagram showing capsaicin sending a heat warning through a nerve to the brain",
  "genes-and-growing": "Diagram showing genes and growing conditions shaping a pepper's heat",
};

export type ChallengeCampaign = {
  id: string;
  topicId: string;
  topicLabel: string;
  name: string;
  completionTitle: string;
  image: string;
  imageAlt: string;
  steps: ChallengeStep[];
};

export const pepperChallengeCampaigns: ChallengeCampaign[] = [
  {
    id: "jalapeno-fieldwork",
    topicId: "peppers",
    topicLabel: "Spicy Peppers",
    name: "Jalapeño fieldwork",
    completionTitle: "Jalapeño field journal",
    image: "/burrow-assets/peppers/jalapeno.jpg",
    imageAlt: "Green jalapeño peppers",
    steps: [
      { id: "jalapeno-reading", skill: "Reading", icon: "🏷️", title: "Read the seed packet", clue: "Jalapeño roots need both moisture and air. Keep the soil evenly damp, but never waterlogged, because flooded soil leaves too little air around the roots.", question: "Which watering plan follows the packet?", choices: ["Water until the soil is damp, then stop", "Keep pouring until water covers the soil", "Let the soil stay completely dry"], answer: "Water until the soil is damp, then stop", summary: "The packet recommends damp soil, not flooded or dry soil, so roots receive moisture and air.", evidence: "Keep the soil evenly damp, but never waterlogged" },
      { id: "jalapeno-geography", skill: "Geography", icon: "🌎", title: "Map the pepper homeland", clue: "Jalapeños are named for Xalapa, a city in Mexico.", question: "Which pin marks Mexico?", choices: ["Mexico", "Chile", "Spain"], answer: "Mexico", summary: "Mexico is in the southern part of North America, between the United States and Central America.", map: { hint: "Look in the southern part of North America.", choices: [{ label: "Mexico", x: 22, y: 38 }, { label: "Chile", x: 30, y: 69 }, { label: "Spain", x: 49, y: 28 }] } },
      { id: "jalapeno-math", skill: "Math", icon: "🧺", title: "Count the harvest", clue: "7 plants grow 8 peppers each.", question: "7 × 8 = ?", choices: ["48 peppers", "54 peppers", "56 peppers"], answer: "56 peppers", summary: "Seven equal groups of eight make 56 peppers.", math: { groups: 7, each: 8, visual: { ariaLabel: "Math picture: 7 equal plant groups of 8 peppers", groupSingular: "plant", groupPlural: "plants", groupEmoji: "🌱", itemSingular: "pepper", itemPlural: "peppers", itemEmoji: "🌶️" } } },
      { id: "jalapeno-science", skill: "Science", icon: "🧪", title: "Find the pepper's heat factory", clue: "The pale middle is called the placenta. It makes most of the spicy capsaicin, which can rub onto the seeds.", question: "Which part makes most of a pepper's heat?", choices: ["The pale placenta", "The green stem", "The seeds by themselves"], answer: "The pale placenta", summary: "The pale placenta is the heat factory: it makes most of the pepper's capsaicin.", conceptVisual: "pepper-anatomy" },
      { id: "jalapeno-words", skill: "Words", icon: "📖", title: "Unlock a science word", clue: "Capsaicin is concentrated in the placenta.", question: "What does concentrated mean?", choices: ["Gathered in a larger amount", "Spread perfectly evenly", "Changed into another chemical"], answer: "Gathered in a larger amount", summary: "Concentrated means more of something is gathered in one place." },
    ],
  },
  {
    id: "caribbean-pepper-quest",
    topicId: "peppers",
    topicLabel: "Spicy Peppers",
    name: "Caribbean pepper quest",
    completionTitle: "Caribbean pepper field journal",
    image: "/burrow-assets/peppers/scotch-bonnet.jpg",
    imageAlt: "Yellow Scotch bonnet peppers",
    steps: [
      { id: "bonnet-reading", skill: "Reading", icon: "🏷️", title: "Read the tasting note", clue: "A Scotch bonnet can taste fruity and fiercely hot at the same time. Its fruit-like flavor does not make its heat milder.", question: "Which statement matches the tasting note?", choices: ["It can taste fruity and very hot together", "It tastes fruity only when it is mild", "Its strong heat means it has no flavor"], answer: "It can taste fruity and very hot together", summary: "The note describes fruit-like flavor and fierce heat happening in the same pepper.", evidence: "fruity and fiercely hot at the same time" },
      { id: "bonnet-geography", skill: "Geography", icon: "🌎", title: "Cross the Caribbean", clue: "Scotch bonnets are important in Jamaica, an island in the Caribbean Sea.", question: "Which pin marks Jamaica?", choices: ["Jamaica", "Sweden", "Oman"], answer: "Jamaica", summary: "Jamaica is a Caribbean island south of Cuba and east of Central America.", map: { hint: "Look between North and South America.", choices: [{ label: "Jamaica", x: 29, y: 40 }, { label: "Sweden", x: 54, y: 17 }, { label: "Oman", x: 66, y: 38 }] } },
      { id: "bonnet-math", skill: "Math", icon: "🧺", title: "Pack the market crates", clue: "9 crates hold 12 peppers each.", question: "9 × 12 = ?", choices: ["96 peppers", "108 peppers", "118 peppers"], answer: "108 peppers", summary: "Nine equal groups of 12 make 108 peppers.", math: { groups: 9, each: 12, visual: { ariaLabel: "Math picture: 9 equal crate groups of 12 peppers", groupSingular: "crate", groupPlural: "crates", groupEmoji: "📦", itemSingular: "pepper", itemPlural: "peppers", itemEmoji: "🌶️" } } },
      { id: "bonnet-science", skill: "Science", icon: "🧪", title: "Meet the smell team and heat team", clue: "Aroma chemicals make the fruity smell. Capsaicin makes nerves send a hot signal. One pepper can do both.", question: "How can one pepper smell fruity and feel hot?", choices: ["Different chemicals do different jobs", "Heat erases every smell", "The seeds make fruit juice"], answer: "Different chemicals do different jobs", summary: "Different chemicals do different jobs: aroma chemicals create smell, while capsaicin creates the hot signal.", conceptVisual: "flavor-and-heat" },
      { id: "bonnet-words", skill: "Words", icon: "📖", title: "Name the aroma", clue: "The field note calls the Scotch bonnet aromatic.", question: "What does aromatic mean?", choices: ["Having a noticeable smell", "Having no seeds", "Growing without light"], answer: "Having a noticeable smell", summary: "Aromatic means having a strong or noticeable smell." },
    ],
  },
  {
    id: "ghost-pepper-mission",
    topicId: "peppers",
    topicLabel: "Spicy Peppers",
    name: "Ghost pepper mission",
    completionTitle: "Ghost pepper field journal",
    image: "/burrow-assets/peppers/ghost-pepper.jpg",
    imageAlt: "Red ghost peppers",
    steps: [
      { id: "ghost-reading", skill: "Reading", icon: "🏷️", title: "Read the weather log", clue: "Monsoon rains arrive seasonally. Heavy rain returns during certain parts of the year instead of falling equally all year.", question: "Which rain pattern matches the weather log?", choices: ["Heavy rain returns during certain seasons", "The same amount of rain falls every day", "Rain happened once and never returns"], answer: "Heavy rain returns during certain seasons", summary: "The log says heavy rain returns during particular parts of the year.", evidence: "Heavy rain returns during certain parts of the year" },
      { id: "ghost-geography", skill: "Geography", icon: "🌎", title: "Find northeast India", clue: "Ghost peppers are associated with northeast India, near Bangladesh and Bhutan.", question: "Which pin marks northeast India?", choices: ["Northeast India", "Brazil", "France"], answer: "Northeast India", summary: "Northeast India lies in South Asia beside Bangladesh, Bhutan, China, and Myanmar.", map: { hint: "Look in South Asia, north of the equator.", choices: [{ label: "Northeast India", x: 76, y: 36 }, { label: "Brazil", x: 35, y: 56 }, { label: "France", x: 51, y: 24 }] } },
      { id: "ghost-math", skill: "Math", icon: "🧺", title: "Count the greenhouse rows", clue: "11 rows hold 9 plants each.", question: "11 × 9 = ?", choices: ["90 plants", "99 plants", "109 plants"], answer: "99 plants", summary: "Eleven groups of nine make 99 plants.", math: { groups: 11, each: 9, visual: { ariaLabel: "Math picture: 11 equal row groups of 9 plants", groupSingular: "row", groupPlural: "rows", groupEmoji: "🪴", itemSingular: "plant", itemPlural: "plants", itemEmoji: "🌱" } } },
      { id: "ghost-science", skill: "Science", icon: "🧪", title: "Follow the fake fire alarm", clue: "Capsaicin taps a heat sensor on a nerve. The nerve sends 'Hot!' to the brain, even though there is no fire.", question: "Why does your mouth feel hot?", choices: ["A nerve sends a hot signal", "The pepper is actually on fire", "The pepper reaches boiling temperature"], answer: "A nerve sends a hot signal", summary: "Capsaicin sets off a harmless heat alarm: the nerve sends a hot signal to the brain.", conceptVisual: "heat-signal" },
      { id: "ghost-words", skill: "Words", icon: "📖", title: "Name the signal catcher", clue: "A receptor receives a signal and helps a cell respond.", question: "Which object works most like a receptor?", choices: ["An antenna receiving a message", "A sealed rock", "A shadow on a wall"], answer: "An antenna receiving a message", summary: "A receptor detects a signal, a little like an antenna." },
    ],
  },
  {
    id: "pepper-x-research-lab",
    topicId: "peppers",
    topicLabel: "Spicy Peppers",
    name: "Pepper X research lab",
    completionTitle: "Pepper X research journal",
    image: "/burrow-assets/peppers/pepper-x.png",
    imageAlt: "Pepper X",
    steps: [
      { id: "pepper-x-reading", skill: "Reading", icon: "🏷️", title: "Read the record card", clue: "Pepper X averages 2,693,000 Scoville Heat Units. Individual peppers can measure above or below that number.", question: "Which statement is supported by the record card?", choices: ["Different fruits can measure above or below 2,693,000 SHU", "Every fruit measures exactly 2,693,000 SHU", "Only one Pepper X fruit was measured"], answer: "Different fruits can measure above or below 2,693,000 SHU", summary: "The average summarizes multiple measurements, while individual peppers can be higher or lower.", evidence: "Individual peppers can measure above or below that number" },
      { id: "pepper-x-geography", skill: "Geography", icon: "🌎", title: "Locate the pepper lab", clue: "Pepper X was developed in Fort Mill, South Carolina, in the southeastern United States.", question: "Which pin marks South Carolina?", choices: ["South Carolina", "California", "Alaska"], answer: "South Carolina", summary: "South Carolina is in the southeastern United States near the Atlantic coast.", map: { hint: "Look on the eastern side of the United States.", choices: [{ label: "South Carolina", x: 28, y: 31 }, { label: "California", x: 17, y: 29 }, { label: "Alaska", x: 8, y: 14 }] } },
      { id: "pepper-x-math", skill: "Math", icon: "🧺", title: "Fill the seed grid", clue: "12 trays hold 12 seeds each.", question: "12 × 12 = ?", choices: ["132 seeds", "140 seeds", "144 seeds"], answer: "144 seeds", summary: "Twelve equal groups of 12 make 144 seeds.", math: { groups: 12, each: 12, visual: { ariaLabel: "Math picture: 12 equal tray groups of 12 seeds", groupSingular: "tray", groupPlural: "trays", groupEmoji: "🧺", itemSingular: "seed", itemPlural: "seeds", itemEmoji: "•" } } },
      { id: "pepper-x-science", skill: "Science", icon: "🧪", title: "Mix the recipe and the weather", clue: "Genes give a pepper its recipe. Sun, water, and temperature can change how the fruit grows.", question: "Why can two Pepper X fruits have different heat?", choices: ["They grew in different conditions", "Measuring changes their species", "Scoville units only measure color"], answer: "They grew in different conditions", summary: "The fruits share a genetic recipe, but different growing conditions can change their final heat.", conceptVisual: "genes-and-growing" },
      { id: "pepper-x-words", skill: "Words", icon: "📖", title: "Unlock a plant word", clue: "Pepper X is a cultivar selected for particular traits.", question: "What is a cultivar?", choices: ["A cultivated plant variety", "A map of a continent", "A tool for measuring rain"], answer: "A cultivated plant variety", summary: "A cultivar is a plant variety people maintain for chosen traits." },
    ],
  },
];

export function pepperChallengeCampaignForMilestone(milestone: number) {
  const campaignIndex = Math.max(0, Math.floor(milestone / 20) - 1) % pepperChallengeCampaigns.length;
  return pepperChallengeCampaigns[campaignIndex];
}

export function ChallengeMode({ campaign, milestone, onComplete }: { campaign: ChallengeCampaign; milestone: number; onComplete: (correct: number) => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [complete, setComplete] = useState(false);
  const steps = campaign.steps;
  const step = steps[stepIndex];
  const correct = selected === step.answer;

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
            <h2 className="mt-1 text-3xl font-black sm:text-5xl">{campaign.completionTitle}</h2>
            <p className="mt-2 text-base font-bold text-[#5f6b5d]">{correctCount}/{steps.length} discoveries solved · all five notes collected</p>
            <p className="mt-1 text-sm font-black text-[#2f6547]">Your next regular question is ready.</p>
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
            <button autoFocus onClick={() => onComplete(correctCount)} className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-6 py-3 text-lg font-black shadow-[3px_3px_0_#092421]">Back to the game</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg border-2 border-[#092421] bg-[#fffdf6] p-2 shadow-[4px_4px_0_#092421] min-[900px]:min-h-0 min-[900px]:overflow-hidden" aria-label={`Challenge Mode stop ${stepIndex + 1} of ${steps.length}`}>
      <ChallengeModeBanner campaign={campaign} milestone={milestone} stepIndex={stepIndex} />
      <div className="grid flex-1 gap-2 min-[900px]:min-h-0 min-[900px]:grid-cols-[minmax(0,1.34fr)_minmax(340px,.66fr)]">
        <ChallengeStoryStage campaign={campaign} step={step} selected={selected} onSelect={setSelected} />

        <article key={step.id} className="flex min-w-0 flex-col rounded-lg border-2 border-[#092421] bg-white p-3 shadow-[3px_3px_0_#092421] min-[900px]:min-h-0 min-[900px]:overflow-y-auto">
          <div className="flex items-center justify-between gap-3"><p className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1 text-xs font-black uppercase tracking-[0.12em]">{step.icon} {step.skill}</p><p className="text-xs font-black text-[#72543e]">Question {stepIndex + 1}/{steps.length}</p></div>
          <h2 className="mt-3 text-[clamp(1.55rem,2.8vw,2.65rem)] font-black leading-[1.02] text-[#102f36]">{step.title}</h2>
          <p className="mt-3 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-3 text-base font-black leading-snug text-[#4f5e57]">{step.clue}</p>
          <h3 className={`mt-4 font-black leading-tight text-[#102f36] ${step.skill === "Math" ? "text-[clamp(2.75rem,6vw,5rem)] tracking-[-0.04em] text-[#9f3f2b]" : "text-[clamp(1.35rem,2.2vw,2rem)]"}`}>{step.question}</h3>
          <GameChoiceGrid>
          {step.choices.map((choice) => {
            const answerChoice = selected !== null && choice === step.answer;
            const chosenWrong = selected === choice && choice !== step.answer;
            const choiceIndex = step.choices.indexOf(choice);
            return <GameChoiceButton key={choice} disabled={selected !== null} onClick={() => setSelected(choice)} chosen={chosenWrong} correct={answerChoice}>{step.skill === "Geography" && <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-md border-2 border-[#092421] bg-[#f0c84b] text-xs">{String.fromCharCode(65 + choiceIndex)}</span>}{choice}</GameChoiceButton>;
          })}
          </GameChoiceGrid>
          {selected && <GameAnswerFeedback isCorrect={correct} celebration="Correct!" correctAnswer={step.answer} explanation={step.summary} evidence={step.skill === "Reading" ? step.evidence : undefined} note="Good try." nextLabel={stepIndex === steps.length - 1 ? "View challenge summary" : "Next question"} onNext={next} />}
        </article>
      </div>
    </section>
  );
}

function ChallengeModeBanner({ campaign, milestone, stepIndex }: { campaign: ChallengeCampaign; milestone: number; stepIndex: number }) {
  const steps = campaign.steps;
  return (
    <header aria-label="Challenge Mode" className="rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 text-white shadow-[3px_3px_0_#092421]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="rounded-md border-2 border-[#092421] bg-[#f0c84b] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#102f36]">⚡ Challenge Mode</p>
          <p className="text-sm font-black">Deep dive: {campaign.name}</p>
        </div>
        <p className="text-xs font-bold text-[#b8e4d8]">Unlocked after {milestone} regular questions · Stop {stepIndex + 1} of {steps.length}</p>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1">
        {steps.map((item, index) => <div key={item.id} className={`rounded-md border px-1 py-1.5 text-center ${index < stepIndex ? "border-[#70d392] bg-[#70d392] text-[#092421]" : index === stepIndex ? "border-[#f0c84b] bg-[#f0c84b] text-[#092421]" : "border-white/25 bg-white/10"}`}><span className="mr-1" aria-hidden="true">{index < stepIndex ? "✓" : item.icon}</span><span className="text-[9px] font-black uppercase tracking-[0.08em]">{item.skill}</span></div>)}
      </div>
    </header>
  );
}

function ChallengeStoryStage({ campaign, step, selected, onSelect }: { campaign: ChallengeCampaign; step: ChallengeStep; selected: string | null; onSelect: (choice: string) => void }) {
  if (step.skill === "Geography") {
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

  if (step.skill === "Math") {
    return (
      <aside aria-label="Challenge math story" className="flex min-h-[520px] flex-col gap-2 rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 shadow-[4px_4px_0_#092421] min-[900px]:min-h-0">
        <div className="relative min-h-[130px] max-h-[190px] flex-[.3] overflow-hidden rounded-lg border-2 border-[#092421] bg-[#fff9ec]">
          <Image src={campaign.image} alt={campaign.imageAlt} fill sizes="(max-width: 900px) 100vw, 58vw" className="object-cover" priority />
          <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-2 text-[#102f36] shadow-[2px_2px_0_#092421]"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9f3f2b]">Picture the harvest</p><p className="text-base font-black">{step.clue}</p></div>
        </div>
        <div className="min-h-[300px] flex-1"><EqualGroupsBoard id={step.id} groups={step.math.groups} each={step.math.each} visual={step.math.visual} /></div>
      </aside>
    );
  }

  if (step.skill === "Science") {
    return <aside aria-label="Challenge science story" className="min-h-[480px] overflow-hidden rounded-lg border-2 border-[#092421] bg-[#102f36] p-2 shadow-[4px_4px_0_#092421] min-[900px]:min-h-0"><MiniConceptDiagram kind={step.conceptVisual} /></aside>;
  }

  return (
    <aside aria-label="Challenge picture story" className="relative min-h-[380px] overflow-hidden rounded-lg border-2 border-[#092421] bg-[#fff9ec] shadow-[4px_4px_0_#092421] min-[900px]:min-h-0">
      <Image src={campaign.image} alt={campaign.imageAlt} fill sizes="(max-width: 900px) 100vw, 58vw" className="object-cover" priority />
      <div className="absolute left-2 top-2 rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#102f36] shadow-[2px_2px_0_#092421]">{step.icon} {step.skill} story</div>
      <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-3 text-[#102f36] shadow-[2px_2px_0_#092421]"><p className="text-xl font-black">{campaign.name}</p><p className="mt-1 text-sm font-bold text-[#5f6b5d]">{step.title}</p></div>
    </aside>
  );
}

function MiniConceptDiagram({ kind }: { kind: ConceptVisual }) {
  if (kind === "pepper-anatomy") return (
    <div className="grid h-full min-h-[470px] grid-rows-[1fr_auto] rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-3" aria-label={challengeConceptVisualLabels[kind]}>
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
      <p className="rounded-lg border-2 border-[#092421] bg-white p-3 text-center text-base font-black text-[#102f36]">Heat factory: the pale placenta makes most capsaicin.</p>
    </div>
  );

  const diagrams: Record<Exclude<ConceptVisual, "pepper-anatomy">, { title: string; items: { icon: string; title: string; text: string }[] }> = {
    "flavor-and-heat": { title: "One pepper, two teams", items: [{ icon: "🍍", title: "Smell team", text: "makes the fruity aroma" }, { icon: "🌶️", title: "Heat team", text: "sends the hot signal" }] },
    "heat-signal": { title: "The fake fire alarm", items: [{ icon: "🌶️", title: "Capsaicin", text: "taps a heat sensor" }, { icon: "〰️", title: "Nerve", text: "shouts 'Hot!'" }, { icon: "🧠", title: "Brain", text: "feels the alarm" }] },
    "genes-and-growing": { title: "What shapes each pepper", items: [{ icon: "🧬", title: "Recipe", text: "genes set possibilities" }, { icon: "☀️💧", title: "Growing day", text: "sun, water, temperature" }, { icon: "🌶️", title: "Pepper", text: "ends up milder or hotter" }] },
  };
  const diagram = diagrams[kind];
  return <div className="flex h-full min-h-[470px] flex-col justify-center rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-5" aria-label={challengeConceptVisualLabels[kind]}><p className="text-center text-3xl font-black text-[#102f36]">{diagram.title}</p><div className={`mt-6 grid items-stretch gap-3 ${diagram.items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>{diagram.items.map((item, index) => <div key={item.title} className="relative rounded-xl border-2 border-[#092421] bg-white p-4 text-center shadow-[3px_3px_0_#092421]"><p className="text-5xl" aria-hidden="true">{item.icon}</p><p className="mt-3 text-lg font-black text-[#102f36]">{item.title}</p><p className="mt-1 text-sm font-bold text-[#5f6b5d]">{item.text}</p>{index < diagram.items.length - 1 && <span className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 text-3xl font-black text-[#9f3f2b] sm:block">→</span>}</div>)}</div></div>;
}
