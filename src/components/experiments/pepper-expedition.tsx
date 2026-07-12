"use client";

import Image from "next/image";
import { useState } from "react";

type Stop = {
  id: string;
  skill: "Reading" | "Geography" | "Math" | "Science" | "Words";
  icon: string;
  title: string;
  story: string;
  question: string;
  choices: string[];
  answer: string;
  journal: string;
  deepFact: string;
};

const stops: Stop[] = [
  {
    id: "read-label",
    skill: "Reading",
    icon: "🏷️",
    title: "Read the seed packet",
    story: "Jalapeño seeds need warmth, water, and time. The packet says: Keep the soil damp, but not soggy.",
    question: "What does damp mean here?",
    choices: ["A little wet", "Completely dry", "Covered in ice"],
    answer: "A little wet",
    journal: "Damp soil is a little wet—not dry and not flooded.",
    deepFact: "A seed takes in water through its coat. That wakes up the tiny plant embryo inside.",
  },
  {
    id: "find-mexico",
    skill: "Geography",
    icon: "🌎",
    title: "Find a pepper homeland",
    story: "Jalapeños are named for Xalapa, a city in Mexico. Mexico is part of North America.",
    question: "Which clue points to Mexico?",
    choices: ["South of the United States", "Next to India", "At the South Pole"],
    answer: "South of the United States",
    journal: "Xalapa is in Mexico, south of the United States in North America.",
    deepFact: "The name jalapeño means “from Xalapa.” In Spanish, the letter ñ sounds a little like “ny.”",
  },
  {
    id: "count-harvest",
    skill: "Math",
    icon: "🧺",
    title: "Count the harvest",
    story: "Four jalapeño plants grow six ripe peppers each.",
    question: "How many peppers grow altogether?",
    choices: ["18 peppers", "24 peppers", "26 peppers"],
    answer: "24 peppers",
    journal: "Four equal groups of six make 24: 6 + 6 + 6 + 6 = 24.",
    deepFact: "The factors can trade places: 4 × 6 and 6 × 4 both equal 24. The array simply turns around.",
  },
  {
    id: "heat-science",
    skill: "Science",
    icon: "🧪",
    title: "Investigate the heat",
    story: "Capsaicin is the chemical that makes a pepper feel hot. Much of it forms in the pale tissue that holds the seeds.",
    question: "Which part is most connected to a pepper’s heat?",
    choices: ["The pale inner tissue", "The green stem", "The flower petals"],
    answer: "The pale inner tissue",
    journal: "Capsaicin is concentrated in the pale inner tissue, not inside the seeds themselves.",
    deepFact: "Birds do not react to capsaicin the way mammals do. That helps wild peppers spread their seeds.",
  },
  {
    id: "word-capsaicin",
    skill: "Words",
    icon: "🔤",
    title: "Name the discovery",
    story: "The scientist writes one new word in the field journal: capsaicin.",
    question: "What does capsaicin do?",
    choices: ["Makes peppers feel hot", "Makes roots grow wings", "Turns soil into sand"],
    answer: "Makes peppers feel hot",
    journal: "Capsaicin (cap-SAY-uh-sin) is the chemical behind a pepper’s heat.",
    deepFact: "Capsaicin does not raise your mouth’s temperature. It activates heat-sensing nerves, so your brain receives a hot signal.",
  },
];

export function PepperExpedition() {
  const [stopIndex, setStopIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [journal, setJournal] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const [showDeepFact, setShowDeepFact] = useState(false);
  const stop = stops[stopIndex];
  const correct = selected === stop.answer;

  const answer = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    if (choice === stop.answer) setJournal((current) => [...current, stop.journal]);
  };

  const next = () => {
    if (!correct) {
      setSelected(null);
      setShowDeepFact(false);
      return;
    }
    if (stopIndex === stops.length - 1) {
      setComplete(true);
      return;
    }
    setStopIndex((value) => value + 1);
    setSelected(null);
    setShowDeepFact(false);
  };

  const restart = () => {
    setStopIndex(0);
    setSelected(null);
    setJournal([]);
    setComplete(false);
    setShowDeepFact(false);
  };

  if (complete) {
    return (
      <div className="grid flex-1 place-items-center p-3">
        <div className="w-full max-w-3xl rounded-xl border-2 border-[#092421] bg-[#e9ffe9] p-5 text-center shadow-[5px_5px_0_#092421]">
          <p className="text-5xl" aria-hidden="true">🏅</p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#2f6547]">Expedition complete</p>
          <h2 className="mt-1 text-3xl font-black">Jalapeño field journal</h2>
          <div className="mt-4 grid gap-2 text-left sm:grid-cols-2">
            {journal.map((note, index) => <p key={note} className="rounded-lg border-2 border-[#b8d7b8] bg-white p-3 text-sm font-bold"><span className="mr-2 text-[#9f3f2b]">{index + 1}.</span>{note}</p>)}
          </div>
          <button onClick={restart} className="mt-5 rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-5 py-3 font-black shadow-[3px_3px_0_#092421]">Take expedition again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid flex-1 gap-2 min-[900px]:grid-cols-[minmax(300px,.85fr)_minmax(0,1.15fr)]">
      <aside className="flex flex-col overflow-hidden rounded-lg border-2 border-[#092421] bg-[#123d38] p-2 text-white">
        <div className="relative min-h-52 flex-1 overflow-hidden rounded-lg border-2 border-[#092421] bg-[#d9efe4]">
          <Image src="/burrow-assets/peppers/jalapeno.jpg" alt="Green jalapeño peppers" fill sizes="(max-width: 900px) 100vw, 40vw" className="object-cover" priority />
          <div className="absolute inset-x-2 bottom-2 rounded-lg border-2 border-[#092421] bg-white/95 p-3 text-[#102f36] shadow-[2px_2px_0_#092421]">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9f3f2b]">Jalapeño Journey</p>
            <p className="mt-1 text-xl font-black">From seed packet to field journal</p>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1" aria-label={`Expedition stop ${stopIndex + 1} of ${stops.length}`}>
          {stops.map((item, index) => (
            <div key={item.id} className={`rounded-md border-2 px-1 py-2 text-center ${index < stopIndex ? "border-[#70d392] bg-[#70d392] text-[#092421]" : index === stopIndex ? "border-[#f0c84b] bg-[#f0c84b] text-[#092421]" : "border-white/30 bg-white/10"}`}>
              <span className="block text-lg" aria-hidden="true">{index < stopIndex ? "✓" : item.icon}</span>
              <span className="mt-1 block truncate text-[9px] font-black uppercase">{item.skill}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg bg-black/25 p-2">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a8ead4]">Journal discoveries</p>
          <p className="mt-1 text-sm font-bold">{journal.length} of {stops.length} collected</p>
        </div>
      </aside>

      <article className="flex flex-col rounded-lg border-2 border-[#d9c7a7] bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1 text-xs font-black uppercase tracking-[0.12em]">{stop.icon} {stop.skill}</p>
          <p className="text-xs font-black text-[#72543e]">Stop {stopIndex + 1}/{stops.length}</p>
        </div>
        <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.5rem)] font-black leading-[0.95]">{stop.title}</h2>
        <p className="mt-3 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-3 text-lg font-bold leading-snug text-[#4f5e57]">{stop.story}</p>

        {stop.skill === "Math" && (
          <div className="mt-3 grid grid-cols-4 gap-2" aria-label="Four equal groups of six peppers">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-lg border-2 border-[#092421] bg-[#e9ffe9] p-2 text-center"><p className="text-[10px] font-black uppercase">Plant {index + 1}</p><p className="mt-1 text-xl leading-tight" aria-hidden="true">🌶️🌶️🌶️🌶️🌶️🌶️</p></div>)}
          </div>
        )}

        <h3 className="mt-4 text-xl font-black leading-tight">{stop.question}</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {stop.choices.map((choice) => {
            const isCorrect = selected && choice === stop.answer;
            const isWrong = selected === choice && choice !== stop.answer;
            return <button key={choice} onClick={() => answer(choice)} className={`min-h-16 rounded-lg border-2 p-3 text-left text-base font-black transition ${isCorrect ? "border-[#092421] bg-[#70d392] shadow-[2px_2px_0_#092421]" : isWrong ? "border-[#092421] bg-[#f59a7d]" : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf]"}`}>{choice}</button>;
          })}
        </div>

        {selected && (
          <div className={`mt-3 rounded-lg border-2 p-3 ${correct ? "border-[#2f7d4f] bg-[#e9ffe9]" : "border-[#9f3f2b] bg-[#fff0ea]"}`}>
            <p className="text-lg font-black">{correct ? "Discovery collected!" : "Good theory—look at the clue once more."}</p>
            <p className="mt-1 text-sm font-bold text-[#5f6b5d]">{correct ? stop.journal : `Try again. The field note helps you find “${stop.answer}.”`}</p>
            {correct && (
              <div className="mt-3">
                <button onClick={() => setShowDeepFact((value) => !value)} aria-expanded={showDeepFact} className="rounded-lg border-2 border-[#092421] bg-white px-3 py-2 text-sm font-black hover:bg-[#fff1bf]">🔎 {showDeepFact ? "Hide deep fact" : "Go deeper"}</button>
                {showDeepFact && <p className="mt-2 rounded-lg border-2 border-[#b8d7b8] bg-white p-3 text-sm font-bold leading-snug text-[#315847]">{stop.deepFact}</p>}
              </div>
            )}
            <button onClick={next} className="mt-3 rounded-lg border-2 border-[#092421] bg-[#102f36] px-4 py-2 font-black text-white shadow-[2px_2px_0_#092421]">{correct ? stopIndex === stops.length - 1 ? "Open journal" : "Next stop" : "Try again"}</button>
          </div>
        )}
      </article>
    </div>
  );
}
