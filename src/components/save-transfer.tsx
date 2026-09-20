"use client";

import { useRef, useState } from "react";
import { isCardUnlocked, type DiscoverableCard } from "@/lib/card-discovery";
import { createProfileSave, maxSaveBytes, parseProfileSave, type ProfileSave, type ProfilesState } from "@/lib/profile-save";

const buttonClass = "min-h-11 rounded-lg border-2 border-[#092421] bg-[#fffdf6] px-4 py-2 text-sm font-black text-[#102f36] shadow-[2px_2px_0_#092421] disabled:opacity-50";

export function SaveTransfer({ profilesState, cards, ready, onImport }: {
  profilesState: ProfilesState;
  cards: readonly DiscoverableCard[];
  ready: boolean;
  onImport: (state: ProfilesState) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [pendingSave, setPendingSave] = useState<ProfileSave | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const exportSave = async () => {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const file = createProfileSave(profilesState);
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Burrow save" });
          setMessage("Save shared. On the new device, open Burrow → Setup → Import save.");
          return;
        } catch (shareError) {
          if (shareError instanceof Error && shareError.name === "AbortError") return;
          // Browsers can advertise sharing but reject a file type. Keep downloading available.
        }
      }
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setMessage("Save download started. Keep the file in Files or Downloads, then choose Import save on the new device.");
    } catch {
      setError("The save could not be exported. Your progress is unchanged. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const readSave = async (file: File) => {
    setPendingSave(null);
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (file.size > maxSaveBytes) throw new Error("This file is too large. Choose a Burrow save smaller than 5 MB.");
      setPendingSave(parseProfileSave(await file.text()));
      window.requestAnimationFrame(() => previewRef.current?.focus());
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "The file could not be read. Try selecting it again.");
    } finally {
      setBusy(false);
    }
  };

  const importSave = () => {
    if (!pendingSave) return;
    try {
      onImport(pendingSave.profilesState);
      setPendingSave(null);
      setError("");
      setMessage("Save imported. Close Setup to play with your restored progress.");
      importButtonRef.current?.focus();
    } catch {
      setError("This device could not store the save. Your current progress is unchanged. Free some device storage and try again.");
    }
  };

  return (
    <section aria-label="Transfer saved progress" className="rounded-xl border-2 border-[#092421] bg-white p-3 shadow-[3px_3px_0_#092421]">
      <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#72543e]">Saved progress</h3>
      <p className="mt-2 text-sm text-[#425b52]">Keep every player&apos;s overall stats and collected items: level, XP, answers, streaks, and unlocked cards. Learning history, topics, and difficulty are included. Play resumes with a new round.</p>
      <p className="mt-2 text-sm text-[#425b52]">Export from the app or browser where you normally play. On iPad, choose AirDrop or Save to Files. Import inside the app or browser you will use on the new device.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!ready || busy} className={buttonClass} onClick={() => void exportSave()}>Export save</button>
        <button ref={importButtonRef} type="button" disabled={!ready || busy} className={buttonClass} onClick={() => inputRef.current?.click()}>Import save</button>
        <input ref={inputRef} type="file" accept=".json,application/json" aria-label="Choose Burrow save" className="hidden" onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) void readSave(file);
        }} />
      </div>
      {busy && <p role="status" className="mt-3 text-sm">Preparing save…</p>}
      {pendingSave && (
        <div ref={previewRef} tabIndex={-1} aria-label="Save preview" className="mt-3 rounded-lg border-2 border-[#092421] bg-[#f4e8c8] p-3">
          <p className="text-sm font-black">Save from {new Date(pendingSave.exportedAt).toLocaleString()}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {pendingSave.profilesState.profiles.map((profile) => {
              const unlocked = new Set(profile.progress.unlockedCards);
              const collected = cards.filter((card) => isCardUnlocked(unlocked, card)).length;
              return (
                <li key={profile.id} aria-label={`${profile.name}'s saved progress`} className="break-words">
                  <p><strong>{profile.name}</strong> · Level {profile.progress.level} · {profile.progress.xp} XP{profile.id === pendingSave.profilesState.activeProfileId ? " · Active player" : ""}</p>
                  <p>{profile.progress.answered} answered · {profile.progress.correct} correct · {collected} collected items</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm font-bold">This replaces all players and progress on this device. Export your current save first if you want to keep it.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={buttonClass} onClick={() => { setPendingSave(null); setError(""); importButtonRef.current?.focus(); }}>Cancel import</button>
            <button type="button" className={`${buttonClass} !bg-[#f0c84b]`} onClick={importSave}>Replace players and import</button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm font-bold text-[#9b3625]">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm font-bold text-[#285944]">{message}</p>}
    </section>
  );
}
