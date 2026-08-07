"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type OfflineWorkerMessage = {
  type: "OFFLINE_CACHE_PROGRESS" | "OFFLINE_CACHE_COMPLETE" | "OFFLINE_STATUS";
  requestId?: string;
  completed?: number;
  total?: number;
  shellReady?: boolean;
};

const savedSelectionKey = "burrow-offline-selection-v1";

const uniqueLocalUrls = (urls: readonly string[]) => Array.from(new Set(urls.filter((url) => url.startsWith("/"))));

const selectionSignature = (urls: readonly string[]) => {
  let hash = 2166136261;
  for (const url of [...urls].sort()) {
    for (let index = 0; index < url.length; index += 1) {
      hash ^= url.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
  }
  return `${urls.length}-${(hash >>> 0).toString(36)}`;
};

const savedSignature = () => {
  try {
    return window.localStorage.getItem(savedSelectionKey);
  } catch {
    return null;
  }
};

export function OfflineReady({ selectedImageUrls, warmImageUrls }: { selectedImageUrls: readonly string[]; warmImageUrls: readonly string[] }) {
  const selectedUrls = useMemo(() => uniqueLocalUrls(selectedImageUrls), [selectedImageUrls]);
  const warmUrls = useMemo(() => uniqueLocalUrls(warmImageUrls).slice(0, 12), [warmImageUrls]);
  const signature = useMemo(() => selectionSignature(selectedUrls), [selectedUrls]);
  const [supported, setSupported] = useState(true);
  const [online, setOnline] = useState(true);
  const [shellReady, setShellReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: selectedUrls.length });
  const requestIdRef = useRef("");

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      queueMicrotask(() => setSupported(false));
      return;
    }

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleMessage = (event: MessageEvent<OfflineWorkerMessage>) => {
      const message = event.data;
      if (!message || typeof message !== "object") return;
      if (message.type === "OFFLINE_STATUS") {
        setShellReady(Boolean(message.shellReady));
        setReady(Boolean(message.shellReady) && savedSignature() === signature);
        return;
      }
      if (message.requestId !== requestIdRef.current) return;
      if (message.type === "OFFLINE_CACHE_PROGRESS") {
        setProgress({ completed: message.completed ?? 0, total: message.total ?? selectedUrls.length });
      }
      if (message.type === "OFFLINE_CACHE_COMPLETE") {
        setSaving(false);
        setReady(true);
        setShellReady(true);
        setProgress({ completed: message.total ?? selectedUrls.length, total: message.total ?? selectedUrls.length });
        try {
          window.localStorage.setItem(savedSelectionKey, signature);
        } catch {
          // The cache still works when browser storage is private or full.
        }
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker.addEventListener("message", handleMessage);
    queueMicrotask(() => setOnline(navigator.onLine));

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(async (registration) => {
        const worker = registration.active ?? registration.waiting ?? registration.installing ?? (await navigator.serviceWorker.ready).active;
        worker?.postMessage({ type: "CHECK_OFFLINE_STATUS" });
        if (warmUrls.length) worker?.postMessage({ type: "CACHE_URLS", requestId: `warm-${Date.now()}`, urls: warmUrls, quiet: true });
      })
      .catch(() => setSupported(false));

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [selectedUrls.length, signature, warmUrls]);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !warmUrls.length) return;
    void navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: "CACHE_URLS", requestId: `warm-${Date.now()}`, urls: warmUrls, quiet: true });
    });
  }, [warmUrls]);

  const saveForFlight = async () => {
    if (!online || saving || !("serviceWorker" in navigator)) return;
    setSaving(true);
    setReady(false);
    setProgress({ completed: 0, total: selectedUrls.length });
    requestIdRef.current = `flight-${Date.now()}`;

    try {
      if ("storage" in navigator && "persist" in navigator.storage) await navigator.storage.persist();
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({ type: "CACHE_URLS", requestId: requestIdRef.current, urls: selectedUrls });
    } catch {
      setSaving(false);
    }
  };

  const headline = !supported
    ? "Offline saving is not supported here"
    : !online
      ? shellReady
        ? "Offline mode is active"
        : "Connect once to prepare flight mode"
      : saving
        ? `Saving ${progress.completed} of ${progress.total} cards`
        : ready
          ? `Ready for takeoff · ${selectedUrls.length} cards`
          : `Save ${selectedUrls.length} selected cards`;

  return (
    <div className="rounded-lg border-2 border-[#092421] bg-[#e5f6e9] p-2.5" data-offline-ready={ready ? "true" : "false"}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#45705b]">Flight mode</p>
          <p className="truncate text-sm font-black leading-tight text-[#102f36]">{headline}</p>
          <p className="mt-0.5 text-[10px] font-bold leading-snug text-[#5f6b5d]">
            The app and next cards cache automatically. Save the selected topics before leaving Wi-Fi for a full trip library.
          </p>
        </div>
        <button
          type="button"
          onClick={saveForFlight}
          disabled={!supported || !online || saving || ready}
          className="min-h-10 shrink-0 rounded-lg border-2 border-[#092421] bg-[#f3c647] px-3 py-2 text-xs font-black text-[#102f36] shadow-[2px_2px_0_#092421] transition enabled:hover:bg-[#ffd96a] enabled:active:translate-y-0.5 disabled:cursor-default disabled:opacity-60"
        >
          {saving ? `${Math.round((progress.completed / Math.max(1, progress.total)) * 100)}%` : ready ? "Saved" : "Save for flight"}
        </button>
      </div>
      {saving && (
        <div className="mt-2 h-2 overflow-hidden rounded-full border border-[#092421] bg-white" aria-label={`${progress.completed} of ${progress.total} offline cards saved`}>
          <div className="h-full bg-[#70d392] transition-[width]" style={{ width: `${(progress.completed / Math.max(1, progress.total)) * 100}%` }} />
        </div>
      )}
    </div>
  );
}
