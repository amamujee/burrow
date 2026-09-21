"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useModalFocus } from "@/components/use-modal-focus";
import type { KnowledgeCard } from "@/lib/game-modes";

export function CollectionPhotoDialog({ card, onClose }: { card: KnowledgeCard; onClose: () => void }) {
  const dialogRef = useModalFocus(true, onClose);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
  }, [zoomed]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#092421]/85 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-photo-title"
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border-2 border-[#092421] bg-[#fffdf6] shadow-[7px_7px_0_#092421] sm:max-h-[calc(100dvh-48px)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[#092421] bg-[#f4e8c8] p-3">
          <h2 id="collection-photo-title" className="text-xl font-black leading-tight text-[#102f36]">{card.title}</h2>
          <button type="button" onClick={onClose} aria-label="Close fruit photo" className="h-11 w-11 shrink-0 rounded-lg border-2 border-[#092421] bg-white text-2xl font-black text-[#102f36] focus-visible:outline-4 focus-visible:outline-[#9f3f2b]">×</button>
        </header>
        <div className="flex shrink-0 items-center gap-3 px-3 py-2">
          <button
            type="button"
            disabled={failed}
            aria-pressed={zoomed}
            onClick={() => setZoomed((value) => !value)}
            className="min-h-11 shrink-0 rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-4 text-sm font-black text-[#102f36] disabled:opacity-50"
          >{zoomed ? "Zoom out" : "Zoom in"}</button>
          <p className="text-xs font-bold text-[#5f6b5d]">{zoomed ? "Scroll or swipe to explore the photo." : "Look closely at the skin, flesh and seeds."}</p>
        </div>
        <div ref={viewportRef} aria-label="Fruit photo detail" tabIndex={zoomed ? 0 : undefined} className="h-[min(62dvh,640px)] min-h-0 overflow-auto overscroll-contain bg-[#f7f0df]">
          {failed ? (
            <p role="alert" className="p-6 font-bold text-[#102f36]">This photo could not load. Close it and try again.</p>
          ) : (
            <div className={`relative ${zoomed ? "h-[200%] w-[200%]" : "h-full w-full"}`}>
              <Image src={card.image} alt={card.imageAlt} fill sizes="(max-width: 768px) 200vw, 2048px" loading="eager" draggable={false} onError={() => setFailed(true)} data-original-src={card.image} className="object-contain" />
            </div>
          )}
        </div>
        <details className="shrink-0 border-t-2 border-[#d9c7a7] px-3 py-2 text-xs text-[#5f6b5d]">
          <summary tabIndex={0} className="cursor-pointer font-bold">Photo credit</summary>
          <p className="mt-1 max-h-20 overflow-auto break-words">{card.imageCredit}</p>
        </details>
      </section>
    </div>
  );
}
