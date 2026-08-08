"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

type GameRoundLayoutProps = ComponentPropsWithoutRef<"section"> & {
  as?: "section" | "div";
};

export function GameRoundLayout({ as = "section", className = "", ...props }: GameRoundLayoutProps) {
  const Element = as;
  return (
    <Element
      {...props}
      className={`burrow-round-layout grid gap-3 min-[760px]:min-h-[460px] min-[760px]:flex-1 min-[760px]:grid-cols-2 ${className}`}
    />
  );
}

export function GameQuestionCard({
  className = "",
  desktopOverflow = "auto",
  desktopPadding = "default",
  ...props
}: ComponentPropsWithoutRef<"article"> & {
  desktopOverflow?: "auto" | "hidden";
  desktopPadding?: "default" | "compact" | "tight";
}) {
  const overflowClass = desktopOverflow === "hidden" ? "min-[760px]:overflow-hidden" : "min-[760px]:overflow-y-auto";
  const paddingClass = desktopPadding === "compact" ? "min-[760px]:p-3" : desktopPadding === "tight" ? "min-[760px]:p-2.5" : "";
  return (
    <article
      data-question-card
      {...props}
      className={`flex min-h-0 flex-col rounded-xl border-2 border-[#092421] bg-[#fffdf6] p-4 shadow-[3px_3px_0_#092421] ${overflowClass} ${paddingClass} ${className}`}
    />
  );
}

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
      className={`min-h-11 rounded-lg border-2 px-3 py-4 text-left text-base font-black leading-snug shadow-[3px_3px_0_#092421] transition duration-150 ease-out active:translate-y-0.5 min-[760px]:min-h-14 min-[760px]:py-2 min-[760px]:text-lg ${
        correct
          ? "border-[#092421] bg-[#70d392] shadow-[3px_3px_0_#092421]"
          : chosen
            ? "border-[#092421] bg-[#f59a7d] shadow-[3px_3px_0_#092421]"
            : "border-[#092421] bg-[#fffdf6] shadow-[3px_3px_0_#092421] hover:bg-[#fff1bf]"
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
  compactOnDesktop = false,
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
  compactOnDesktop?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 759px)").matches) {
      panelRef.current?.scrollIntoView({ block: "end" });
    }
  }, [correctAnswer, explanation, isCorrect]);

  return (
    <div
      ref={panelRef}
      aria-label="Answer feedback"
      className={`mt-auto pb-20 pt-3 ${compactOnDesktop ? "min-[760px]:pt-2" : ""}`}
    >
      <div className={`rounded-xl border-2 p-3 shadow-[3px_3px_0_#092421] ${compactOnDesktop ? "min-[760px]:p-2" : ""} ${isCorrect ? "border-[#2f8158] bg-[#e9ffe9]" : "border-[#9f3f2b] bg-[#fff0ea]"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <p className={`text-lg font-black leading-tight text-[#102f36] ${compactOnDesktop ? "min-[760px]:text-base" : "min-[760px]:text-xl"}`}>{isCorrect ? celebration : note}</p>
          {reward && (
            <span className="rounded-full border-2 border-[#092421] bg-[#f0c84b] px-2 py-0.5 text-sm font-black text-[#102f36] shadow-[2px_2px_0_#092421]">
              +{reward.xpGain} XP
            </span>
          )}
        </div>
        <p className={`mt-1 text-sm font-semibold leading-5 text-[#24373b] ${compactOnDesktop ? "min-[760px]:text-xs min-[760px]:leading-4" : ""}`}>
          {!isCorrect && <span className="font-black text-[#9f3f2b]">Answer: {correctAnswer}. </span>}
          {evidence && <span><span className="font-black">Evidence:</span> “{evidence}” </span>}
          {explanation}
        </p>
        {children}
      </div>
      <div
        data-sticky-next
        className={`burrow-next-dock fixed bottom-[calc(env(safe-area-inset-bottom)+8px)] left-6 right-6 z-30 bg-[#fffdf6]/95 px-1 pt-3 backdrop-blur ${compactOnDesktop ? "min-[760px]:pt-2" : ""}`}
      >
        <button type="button" onClick={() => onNext()} className={`min-h-12 w-full rounded-lg border-2 border-[#092421] bg-[#102f36] px-4 py-2.5 text-base font-black text-white shadow-[3px_3px_0_#092421] hover:bg-[#23564f] ${compactOnDesktop ? "min-[760px]:min-h-11 min-[760px]:py-2 min-[760px]:text-sm" : ""}`}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
