"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function GameChoiceGrid({ children }: { children: ReactNode }) {
  return <div aria-label="Answer choices" className="mt-2 grid shrink-0 gap-2 xl:grid-cols-2">{children}</div>;
}

export function GameChoiceButton({
  children,
  chosen,
  correct,
  disabled = false,
  onClick,
  className = "",
}: {
  children: ReactNode;
  chosen: boolean;
  correct: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-12 rounded-lg border-2 px-3 py-2 text-left text-base font-black leading-snug transition duration-150 ease-out active:translate-y-0.5 md:min-h-14 md:text-lg ${
        correct
          ? "border-[#092421] bg-[#70d392] shadow-[3px_3px_0_#092421]"
          : chosen
            ? "border-[#092421] bg-[#f59a7d] shadow-[3px_3px_0_#092421]"
            : "border-[#d9c7a7] bg-[#fffdf6] hover:border-[#092421] hover:bg-[#fff1bf] hover:shadow-[2px_2px_0_#092421]"
      } disabled:cursor-default ${className}`}
    >
      {children}
    </button>
  );
}

export function GameAnswerFeedback({
  isCorrect,
  celebration,
  correctAnswer,
  explanation,
  note,
  nextLabel,
  onNext,
  reward,
  evidence,
  children,
}: {
  isCorrect: boolean;
  celebration: string;
  correctAnswer: string;
  explanation: string;
  note: string;
  nextLabel: string;
  onNext: () => void;
  reward?: { xpGain: number; leveledUp: boolean };
  evidence?: string;
  children?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ block: "end" });
  }, [correctAnswer, explanation, isCorrect]);

  return (
    <div ref={panelRef} aria-label="Answer feedback" className="sticky bottom-0 z-20 mt-auto bg-[#fffdf6]/95 pt-2 backdrop-blur">
      <div className={`rounded-lg border-2 p-2.5 ${isCorrect ? "border-[#2f7d4f] bg-[#e9ffe9]" : "border-[#9f3f2b] bg-[#fff0ea]"}`}>
        <div className="grid gap-2 md:grid-cols-[auto_1fr] md:items-start">
          <div className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border-2 border-[#092421] text-2xl font-black shadow-[2px_2px_0_#092421] ${isCorrect ? "bg-[#70d392]" : "bg-[#f59a7d]"}`}>
            {isCorrect ? (
              <>
                <span className="absolute left-1.5 top-1 h-2 w-2 rounded-sm bg-[#fff9ec]" />
                <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-sm bg-[#f0c84b]" />
                <span>+</span>
              </>
            ) : (
              "!"
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-black leading-tight text-[#102f36] md:text-xl">{isCorrect ? celebration : note}</p>
              {reward && (
                <span className="rounded-full border-2 border-[#092421] bg-[#f0c84b] px-2 py-0.5 text-sm font-black text-[#102f36]">
                  +{reward.xpGain} glow
                </span>
              )}
              {reward?.leveledUp && (
                <span className="rounded-full border-2 border-[#092421] bg-[#70d392] px-2 py-0.5 text-sm font-black text-[#102f36]">Glow up</span>
              )}
            </div>
            {!isCorrect && <p className="mt-1 text-base font-black text-[#9f3f2b]">Answer: {correctAnswer}</p>}
            {evidence && <p className="mt-1 text-sm font-semibold leading-5 text-[#72543e]"><span className="font-black">Evidence:</span> “{evidence}”</p>}
            <p className="mt-1 text-sm font-semibold leading-5 text-[#24373b]">{explanation}</p>
            {children}
          </div>
        </div>
        <button type="button" onClick={onNext} className="mt-2 w-full rounded-lg border-2 border-[#092421] bg-[#102f36] px-4 py-2.5 text-base font-black text-white shadow-[3px_3px_0_#092421] hover:bg-[#23564f]">
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
