"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ReadingLevel = "match" | "sentence" | "evidence";

const levels: { id: ReadingLevel; label: string; eyebrow: string }[] = [
  { id: "match", label: "Word Match", eyebrow: "word + picture" },
  { id: "sentence", label: "Sentence Builder", eyebrow: "meaning in context" },
  { id: "evidence", label: "Evidence Hunt", eyebrow: "read and prove it" },
];

const activities = {
  match: {
    word: "wrinkled",
    syllables: "wrin-kled",
    prompt: "Which pepper best matches the word wrinkled?",
    choices: [
      { id: "bell", label: "Smooth Bell Pepper", image: "/burrow-assets/peppers/bell-pepper.jpg" },
      { id: "habanero", label: "Wrinkled Carolina Reaper", image: "/burrow-assets/peppers/carolina-reaper.jpg" },
      { id: "poblano", label: "Long Poblano", image: "/burrow-assets/peppers/poblano.jpg" },
    ],
    answer: "habanero",
    explanation: "Wrinkled means covered with little folds or creases. The habanero’s skin has visible folds.",
  },
  sentence: {
    sentenceStart: "The gardener wore gloves because the habanero was very",
    prompt: "Choose the word that completes the idea.",
    choices: ["spicy", "silent", "square"],
    answer: "spicy",
    explanation: "The clue “wore gloves” tells us the pepper’s heat matters, so spicy completes the meaning.",
  },
  evidence: {
    passage: "A jalapeño begins green. If it stays on the plant longer, it can ripen to red. A red jalapeño is not a different species—it is a more mature fruit from the same kind of plant.",
    prompt: "Which sentence proves that green and red jalapeños can be the same kind?",
    choices: [
      "A jalapeño begins green.",
      "If it stays on the plant longer, it can ripen to red.",
      "A red jalapeño is not a different species.",
    ],
    answer: "A red jalapeño is not a different species.",
    explanation: "That sentence directly says the color change does not make it a different species. That is evidence.",
  },
} as const;

export function WordExplorer() {
  const [level, setLevel] = useState<ReadingLevel>("match");
  const [selected, setSelected] = useState<string | null>(null);
  const [mastered, setMastered] = useState<ReadingLevel[]>([]);
  const [complete, setComplete] = useState(false);
  const activity = activities[level];
  const answer = activity.answer;
  const correct = selected === answer;
  const levelIndex = levels.findIndex((item) => item.id === level);
  const nextLevel = levels[levelIndex + 1]?.id;

  const heardText = useMemo(() => {
    if (level === "match") return `${activities.match.word}. ${activities.match.word}. ${activities.match.explanation}`;
    if (level === "sentence") return `${activities.sentence.sentenceStart} ${activities.sentence.answer}.`;
    return activities.evidence.passage;
  }, [level]);

  const choose = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    if (choice === answer) setMastered((current) => current.includes(level) ? current : [...current, level]);
  };

  const changeLevel = (next: ReadingLevel) => {
    setLevel(next);
    setSelected(null);
  };

  const restart = () => {
    setLevel("match");
    setSelected(null);
    setMastered([]);
    setComplete(false);
  };

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(heardText));
  };

  if (complete) {
    return (
      <div className="grid flex-1 place-items-center p-3">
        <div className="w-full max-w-3xl rounded-xl border-2 border-[#092421] bg-[#e9ffe9] p-5 text-center shadow-[5px_5px_0_#092421]">
          <p className="text-5xl" aria-hidden="true">📚</p>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[#2f6547]">Reading trail complete</p>
          <h2 className="mt-1 text-3xl font-black">Pepper word journal</h2>
          <div className="mt-4 grid gap-2 text-left sm:grid-cols-3">
            <div className="rounded-lg border-2 border-[#b8d7b8] bg-white p-3"><p className="text-[10px] font-black uppercase text-[#9f3f2b]">Word match</p><p className="mt-1 font-black">wrinkled</p><p className="mt-1 text-xs font-bold text-[#5f6b5d]">Used a picture to learn a describing word.</p></div>
            <div className="rounded-lg border-2 border-[#b8d7b8] bg-white p-3"><p className="text-[10px] font-black uppercase text-[#9f3f2b]">Sentence clue</p><p className="mt-1 font-black">spicy</p><p className="mt-1 text-xs font-bold text-[#5f6b5d]">Used context to complete an idea.</p></div>
            <div className="rounded-lg border-2 border-[#b8d7b8] bg-white p-3"><p className="text-[10px] font-black uppercase text-[#9f3f2b]">Evidence</p><p className="mt-1 font-black">same species</p><p className="mt-1 text-xs font-bold text-[#5f6b5d]">Found a sentence that proves an answer.</p></div>
          </div>
          <button onClick={restart} className="mt-5 rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-5 py-3 font-black shadow-[3px_3px_0_#092421]">Read the trail again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid flex-1 gap-2 min-[900px]:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-lg border-2 border-[#092421] bg-[#102f36] p-3 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a8ead4]">Reading that grows</p>
        <h2 className="mt-1 text-3xl font-black leading-none">Word Explorer</h2>
        <p className="mt-2 text-sm font-bold leading-snug text-white/75">The same topic supports decoding, vocabulary, sentence meaning, and evidence.</p>

        <div className="mt-4 grid gap-2">
          {levels.map((item, index) => {
            const active = level === item.id;
            const done = mastered.includes(item.id);
            return (
              <button key={item.id} onClick={() => changeLevel(item.id)} aria-pressed={active} className={`grid grid-cols-[2.25rem_1fr_auto] items-center gap-2 rounded-lg border-2 p-2 text-left ${active ? "border-[#f0c84b] bg-[#f0c84b] text-[#102f36]" : "border-white/25 bg-white/10 hover:border-white/60"}`}>
                <span className="grid h-9 w-9 place-items-center rounded-md border-2 border-current font-black">{index + 1}</span>
                <span><span className="block text-[9px] font-black uppercase tracking-[0.1em] opacity-70">{item.eyebrow}</span><span className="block font-black">{item.label}</span></span>
                <span className="text-lg" aria-label={done ? "completed" : "not completed"}>{done ? "✓" : "○"}</span>
              </button>
            );
          })}
        </div>

        <button onClick={speak} className="mt-4 w-full rounded-lg border-2 border-white bg-white px-3 py-2 font-black text-[#102f36] hover:bg-[#fff1bf]">🔊 Hear this reading</button>
        <p className="mt-2 text-center text-[10px] font-bold text-white/60">Uses the device voice. No recording is saved.</p>
      </aside>

      <article className="flex flex-col rounded-lg border-2 border-[#d9c7a7] bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9f3f2b]">Level {levelIndex + 1} · {levels[levelIndex].eyebrow}</p>
            <h3 className="mt-1 text-2xl font-black sm:text-3xl">{levels[levelIndex].label}</h3>
          </div>
          <p className="rounded-lg bg-[#ece5d5] px-3 py-1 text-xs font-black">{mastered.length}/3 explored</p>
        </div>

        {level === "match" && (
          <>
            <div className="mt-3 rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-3">
              <div className="flex items-center justify-between gap-3"><p className="text-3xl font-black">{activities.match.word}</p><button onClick={speak} className="rounded-lg border-2 border-[#092421] bg-white px-3 py-2 text-sm font-black">🔊 {activities.match.syllables}</button></div>
              <p className="mt-2 text-lg font-bold text-[#5f6b5d]">{activities.match.prompt}</p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {activities.match.choices.map((choice) => <PictureChoice key={choice.id} choice={choice} selected={selected} answer={answer} onChoose={choose} />)}
            </div>
          </>
        )}

        {level === "sentence" && (
          <>
            <p className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-[#72543e]">{activities.sentence.prompt}</p>
            <div className="mt-3 rounded-lg border-2 border-[#092421] bg-[#fff9ec] p-4 text-[clamp(1.45rem,4vw,2.6rem)] font-black leading-tight shadow-[3px_3px_0_#092421]">
              {activities.sentence.sentenceStart} <span className="inline-block min-w-28 border-b-4 border-[#9f3f2b] text-center text-[#9f3f2b]">{correct ? answer : "?"}</span>.
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">{activities.sentence.choices.map((choice) => <TextChoice key={choice} choice={choice} selected={selected} answer={answer} onChoose={choose} />)}</div>
          </>
        )}

        {level === "evidence" && (
          <>
            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,.7fr)_1.3fr]">
              <div className="relative min-h-56 overflow-hidden rounded-lg border-2 border-[#092421]"><Image src="/burrow-assets/peppers/jalapeno.jpg" alt="Jalapeños ripening on a plant" fill sizes="(max-width: 900px) 100vw, 30vw" className="object-cover" /></div>
              <div className="rounded-lg border-2 border-[#d9c7a7] bg-[#fff9ec] p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9f3f2b]">Field note</p><p className="mt-2 text-xl font-bold leading-relaxed">{activities.evidence.passage}</p></div>
            </div>
            <h4 className="mt-4 text-xl font-black">{activities.evidence.prompt}</h4>
            <div className="mt-3 grid gap-2">{activities.evidence.choices.map((choice) => <TextChoice key={choice} choice={choice} selected={selected} answer={answer} onChoose={choose} />)}</div>
          </>
        )}

        {selected && (
          <div className={`mt-4 rounded-lg border-2 p-3 ${correct ? "border-[#2f7d4f] bg-[#e9ffe9]" : "border-[#9f3f2b] bg-[#fff0ea]"}`}>
            <p className="text-lg font-black">{correct ? "You found the clue!" : `Answer: ${answer}`}</p>
            <p className="mt-1 text-sm font-bold text-[#5f6b5d]">{activity.explanation}</p>
            <button onClick={() => nextLevel ? changeLevel(nextLevel) : setComplete(true)} className="mt-3 rounded-lg border-2 border-[#092421] bg-[#102f36] px-4 py-2 font-black text-white shadow-[2px_2px_0_#092421]">{nextLevel ? "Next question" : "View reading summary"}</button>
          </div>
        )}
      </article>
    </div>
  );
}

function PictureChoice({ choice, selected, answer, onChoose }: { choice: { id: string; label: string; image: string }; selected: string | null; answer: string; onChoose: (id: string) => void }) {
  const correct = selected && choice.id === answer;
  const wrong = selected === choice.id && choice.id !== answer;
  return <button onClick={() => onChoose(choice.id)} className={`overflow-hidden rounded-lg border-2 text-left ${correct ? "border-[#092421] bg-[#70d392] shadow-[3px_3px_0_#092421]" : wrong ? "border-[#092421] bg-[#f59a7d]" : "border-[#d9c7a7] bg-white hover:border-[#092421]"}`}><span className="relative block h-40"><Image src={choice.image} alt="" fill sizes="(max-width: 640px) 100vw, 30vw" className="object-cover" /></span><span className="block p-3 font-black">{choice.label}</span></button>;
}

function TextChoice({ choice, selected, answer, onChoose }: { choice: string; selected: string | null; answer: string; onChoose: (choice: string) => void }) {
  const correct = selected && choice === answer;
  const wrong = selected === choice && choice !== answer;
  return <button onClick={() => onChoose(choice)} className={`min-h-14 rounded-lg border-2 p-3 text-left text-base font-black ${correct ? "border-[#092421] bg-[#70d392] shadow-[2px_2px_0_#092421]" : wrong ? "border-[#092421] bg-[#f59a7d]" : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf]"}`}>{choice}</button>;
}
