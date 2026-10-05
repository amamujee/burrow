"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profilesKey, type ProfilesState } from "@/lib/profile-save";

type Update = (state: ProfilesState) => ProfilesState;
export const profilesBackupKey = `${profilesKey}-backup`;

// Apply operations to the latest save under a cross-tab lock. Persisting a
// render's whole snapshot would lose answers from another open tab.
export function useProfileStore(initial: () => ProfilesState, read: () => ProfilesState) {
  const [state, render] = useState(initial);
  const [issue, setIssue] = useState<string | null>(null);
  const current = useRef(state);
  const pending = useRef<Update[]>([]);
  const ready = useRef(false);
  const flushing = useRef(false);

  const publish = useCallback((next: ProfilesState) => {
    current.current = next;
    render(next);
  }, []);

  const flush = useCallback(async () => {
    if (!ready.current || flushing.current) return;
    flushing.current = true;
    const write = () => {
      const latest = read();
      const batch = [...pending.current];
      const next = batch.reduce((value, update) => update(value), latest);
      const contents = JSON.stringify(next);
      const previous = window.localStorage.getItem(profilesKey);
      // A backup is useful, but failing to make one must not block the save.
      if (previous && JSON.stringify(latest) === previous && previous !== contents) {
        try { window.localStorage.setItem(profilesBackupKey, previous); } catch { /* Primary write below reports failure. */ }
      }
      window.localStorage.setItem(profilesKey, contents);
      pending.current.splice(0, batch.length);
      // Keep this tab's selected player; other tabs can play a different one.
      const activeProfileId = next.profiles.some((profile) => profile.id === current.current.activeProfileId)
        ? current.current.activeProfileId : next.activeProfileId;
      publish(pending.current.reduce((value, update) => update(value), { ...next, activeProfileId }));
      setIssue(null);
    };
    try {
      do {
        if (navigator.locks) await navigator.locks.request(profilesKey, write);
        else write(); // The read/write pair is synchronous on older browsers.
        // Input can arrive after write() but before the lock promise settles.
        // Drain those operations too; their update() already saw a flush in flight.
      } while (pending.current.length);
    } catch {
      setIssue("Progress is only saved in this tab for now. Keep it open and retry, or export a save from Setup.");
    } finally {
      flushing.current = false;
    }
  }, [publish, read]);

  const initialize = useCallback((loaded: ProfilesState) => {
    ready.current = true;
    publish(loaded);
    void flush();
  }, [flush, publish]);

  const update = useCallback((change: ProfilesState | Update) => {
    const operation = typeof change === "function" ? change : () => change;
    pending.current.push(operation);
    publish(operation(current.current));
    void flush();
  }, [flush, publish]);

  const importState = useCallback(async (restored: ProfilesState) => {
    // Import is an explicit replacement. A failed write must leave the UI intact.
    const write = () => {
      window.localStorage.setItem(profilesKey, JSON.stringify(restored));
      pending.current = [];
      publish(restored);
      setIssue(null);
    };
    if (navigator.locks) await navigator.locks.request(profilesKey, write);
    else write();
  }, [publish]);

  useEffect(() => {
    const refresh = () => {
      if (!ready.current) return;
      try {
        const latest = read();
        // A replacement made in another tab should restart with that save.
        if (!latest.profiles.some((profile) => profile.id === current.current.activeProfileId)) {
          if (!pending.current.length) window.location.reload();
          else setIssue("Players changed in another tab. Export this tab's progress from Setup before reloading.");
          return;
        }
        publish(pending.current.reduce((value, change) => change(value), { ...latest, activeProfileId: current.current.activeProfileId }));
      } catch {
        setIssue("The saved progress could not be read. This tab still has your progress; export a save from Setup.");
      }
    };
    const onStorage = (event: StorageEvent) => { if (event.key === profilesKey) refresh(); };
    const onVisibility = () => { if (document.visibilityState === "visible") { refresh(); void flush(); } };
    const onUnload = (event: BeforeUnloadEvent) => {
      if (!pending.current.length) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [flush, publish, read]);

  return { state, update, initialize, importState, issue, retry: flush };
}
