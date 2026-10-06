"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profilesKey, type ProfilesState } from "@/lib/profile-save";
import { readProfileDatabase, updateProfileDatabase } from "@/lib/profile-persistence";

type Update = (state: ProfilesState) => ProfilesState;
export { profilesBackupKey } from "@/lib/profile-persistence";

// Apply operations to the latest save under a cross-tab lock. Persisting a
// render's whole snapshot would lose answers from another open tab.
export function useProfileStore(initial: () => ProfilesState, read: (stored?: ProfilesState) => ProfilesState) {
  const [state, render] = useState(initial);
  const [issue, setIssue] = useState<string | null>(null);
  const current = useRef(state);
  const pending = useRef<Update[]>([]);
  const ready = useRef(false);
  const flushing = useRef(false);
  const migration = useRef<ProfilesState | null>(null);

  const publish = useCallback((next: ProfilesState) => {
    current.current = next;
    render(next);
  }, []);

  const flush = useCallback(async () => {
    if (!ready.current || flushing.current) return;
    flushing.current = true;
    const write = async () => {
      let batchLength = 0;
      const next = await updateProfileDatabase((stored) => {
        const latest = stored ? read(stored) : (migration.current ??= read());
        const batch = [...pending.current];
        batchLength = batch.length;
        return batch.reduce((value, update) => update(value), latest);
      });
      pending.current.splice(0, batchLength);
      // Keep this tab's selected player; other tabs can play a different one.
      const activeProfileId = next.profiles.some((profile) => profile.id === current.current.activeProfileId)
        ? current.current.activeProfileId : next.activeProfileId;
      publish(pending.current.reduce((value, update) => update(value), { ...next, activeProfileId }));
      setIssue(null);
    };
    try {
      do {
        if (navigator.locks) await navigator.locks.request(profilesKey, write);
        else await write(); // IndexedDB still serializes writes without Web Locks.
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
    const write = async () => {
      await updateProfileDatabase(() => restored);
      pending.current = [];
      publish(restored);
      setIssue(null);
    };
    if (navigator.locks) await navigator.locks.request(profilesKey, write);
    else await write();
  }, [publish]);

  useEffect(() => {
    const refresh = async () => {
      if (!ready.current) return;
      try {
        const latest = read(await readProfileDatabase());
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
    const onStorage = (event: StorageEvent) => { if (event.key === profilesKey) void refresh(); };
    const onVisibility = () => { if (document.visibilityState === "visible") { void refresh(); void flush(); } };
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
