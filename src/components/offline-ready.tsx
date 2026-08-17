"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type OfflineAsset = {
  bytes: number;
  revision: string;
};

type OfflineAssetManifest = {
  schemaVersion: number;
  version: string;
  assetCount: number;
  totalBytes: number;
  assets: Record<string, OfflineAsset>;
};

type OfflineCacheEntry = OfflineAsset & {
  url: string;
};

type OfflineWorkerMessage = {
  type: "OFFLINE_CACHE_PROGRESS" | "OFFLINE_CACHE_COMPLETE" | "OFFLINE_STATUS";
  requestId?: string;
  completed?: number;
  total?: number;
  cached?: number;
  downloaded?: number;
  failed?: number;
  cachedBytes?: number;
  downloadedBytes?: number;
  shellReady?: boolean;
};

type OfflineProgress = {
  completed: number;
  total: number;
  cached: number;
  downloaded: number;
  failed: number;
};

const emptyProgress = (total: number): OfflineProgress => ({ completed: 0, total, cached: 0, downloaded: 0, failed: 0 });

const uniqueLocalUrls = (urls: readonly string[]) => Array.from(new Set(urls.filter((url) => url.startsWith("/"))));

const entriesForUrls = (urls: readonly string[], manifest: OfflineAssetManifest): OfflineCacheEntry[] => uniqueLocalUrls(urls).map((url) => {
  const asset = manifest.assets[url];
  return {
    url,
    bytes: asset?.bytes ?? 0,
    revision: asset?.revision ?? `manifest-${manifest.version}`,
  };
});

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
  return `${Math.ceil(bytes / (1024 * 1024))} MB`;
};

const isOfflineManifest = (value: unknown): value is OfflineAssetManifest => {
  if (!value || typeof value !== "object") return false;
  const manifest = value as Partial<OfflineAssetManifest>;
  return manifest.schemaVersion === 1
    && typeof manifest.version === "string"
    && typeof manifest.assetCount === "number"
    && typeof manifest.totalBytes === "number"
    && Boolean(manifest.assets && typeof manifest.assets === "object");
};

const waitForActivation = (worker: ServiceWorker) => {
  if (worker.state === "activated") return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const handleStateChange = () => {
      if (worker.state === "activated") {
        worker.removeEventListener("statechange", handleStateChange);
        resolve();
      } else if (worker.state === "redundant") {
        worker.removeEventListener("statechange", handleStateChange);
        reject(new Error("The offline worker could not activate."));
      }
    };
    worker.addEventListener("statechange", handleStateChange);
  });
};

export function OfflineReady({ selectedImageUrls, warmImageUrls, compact = false }: { selectedImageUrls: readonly string[]; warmImageUrls: readonly string[]; compact?: boolean }) {
  const selectedUrls = useMemo(() => uniqueLocalUrls(selectedImageUrls), [selectedImageUrls]);
  const [manifest, setManifest] = useState<OfflineAssetManifest | null>(null);
  const [manifestFailed, setManifestFailed] = useState(false);
  const selectedEntries = useMemo(() => manifest ? entriesForUrls(selectedUrls, manifest) : [], [manifest, selectedUrls]);
  const warmEntries = useMemo(() => manifest ? entriesForUrls(warmImageUrls, manifest).slice(0, 4) : [], [manifest, warmImageUrls]);
  const estimatedBytes = useMemo(() => selectedEntries.reduce((total, entry) => total + entry.bytes, 0), [selectedEntries]);
  const [supported, setSupported] = useState(true);
  const [online, setOnline] = useState(true);
  const [workerReady, setWorkerReady] = useState(false);
  const [shellReady, setShellReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const [progress, setProgress] = useState<OfflineProgress>(() => emptyProgress(selectedUrls.length));
  const requestIdRef = useRef("");
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/offline-assets.json", { cache: "no-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Offline manifest failed with ${response.status}`);
        const parsed: unknown = await response.json();
        if (!isOfflineManifest(parsed)) throw new Error("Offline manifest is invalid");
        if (!cancelled) setManifest(parsed);
      })
      .catch(() => {
        if (!cancelled) setManifestFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!manifest) return;
    if (!("serviceWorker" in navigator)) {
      queueMicrotask(() => setSupported(false));
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setWorkerReady(false);
      setReady(false);
      setFailureCount(0);
      setProgress(emptyProgress(selectedEntries.length));
    });

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleMessage = (event: MessageEvent<OfflineWorkerMessage>) => {
      const message = event.data;
      if (!message || typeof message !== "object") return;
      if (message.type === "OFFLINE_STATUS") {
        const total = message.total ?? selectedEntries.length;
        const cached = message.cached ?? 0;
        setShellReady(Boolean(message.shellReady));
        setReady(Boolean(message.shellReady) && total > 0 && cached === total);
        setProgress({ completed: cached, total, cached, downloaded: 0, failed: 0 });
        return;
      }
      if (message.requestId !== requestIdRef.current) return;
      if (message.type === "OFFLINE_CACHE_PROGRESS") {
        setProgress({
          completed: message.completed ?? 0,
          total: message.total ?? selectedEntries.length,
          cached: message.cached ?? 0,
          downloaded: message.downloaded ?? 0,
          failed: message.failed ?? 0,
        });
      }
      if (message.type === "OFFLINE_CACHE_COMPLETE") {
        const total = message.total ?? selectedEntries.length;
        const failed = message.failed ?? 0;
        setSaving(false);
        setReady(total > 0 && failed === 0 && (message.completed ?? 0) === total);
        setShellReady(true);
        setFailureCount(failed);
        setProgress({
          completed: message.completed ?? total,
          total,
          cached: message.cached ?? 0,
          downloaded: message.downloaded ?? 0,
          failed,
        });
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker.addEventListener("message", handleMessage);
    queueMicrotask(() => setOnline(navigator.onLine));

    void (async () => {
      try {
        const registration = await navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(manifest.version)}`, { scope: "/", updateViaCache: "none" });
        const pendingWorker = registration.installing ?? registration.waiting;
        if (pendingWorker) await waitForActivation(pendingWorker);
        const readyRegistration = await navigator.serviceWorker.ready;
        if (cancelled) return;
        registrationRef.current = readyRegistration;
        setWorkerReady(true);
        readyRegistration.active?.postMessage({ type: "CHECK_OFFLINE_STATUS", entries: selectedEntries });
      } catch {
        if (!cancelled) setSupported(false);
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [manifest, selectedEntries]);

  useEffect(() => {
    if (!workerReady || !online || !warmEntries.length) return;
    const timer = window.setTimeout(() => {
      registrationRef.current?.active?.postMessage({
        type: "CACHE_URLS",
        requestId: `warm-${Date.now()}`,
        entries: warmEntries,
        quiet: true,
      });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [online, warmEntries, workerReady]);

  const saveOffline = async () => {
    if (!online || saving || !workerReady || !selectedEntries.length) return;
    setSaving(true);
    setReady(false);
    setFailureCount(0);
    setProgress(emptyProgress(selectedEntries.length));
    requestIdRef.current = `offline-${Date.now()}`;

    try {
      if ("storage" in navigator && "persist" in navigator.storage) await navigator.storage.persist();
      const registration = registrationRef.current ?? await navigator.serviceWorker.ready;
      if (!registration.active) throw new Error("Offline worker is not active");
      registration.active.postMessage({ type: "CACHE_URLS", requestId: requestIdRef.current, entries: selectedEntries });
    } catch {
      setSaving(false);
      setFailureCount(selectedEntries.length);
    }
  };

  const headline = manifestFailed
    ? "Offline details could not be loaded"
    : !manifest
      ? "Checking offline storage"
      : !supported
        ? "Offline saving is not supported here"
        : !online
          ? shellReady
            ? `Offline mode is active · ${progress.cached}/${progress.total} cards ready`
            : "Connect once to prepare offline mode"
          : saving
            ? `Saving ${progress.completed} of ${progress.total} · ${progress.cached} already saved`
            : failureCount > 0
              ? `${failureCount} cards need another try`
              : ready
                ? `Saved offline · ${selectedEntries.length} cards`
                : `Save ${selectedEntries.length} selected cards · up to ${formatBytes(estimatedBytes)}`;
  const buttonLabel = saving ? `${Math.round((progress.completed / Math.max(1, progress.total)) * 100)}%` : ready ? "Saved" : failureCount > 0 ? "Try again" : "Save offline";
  const disabled = !manifest || !supported || !online || !workerReady || saving || ready || !selectedEntries.length;

  if (compact) {
    return (
      <div className="flex min-h-11 min-w-0 flex-[1_1_300px] items-center gap-3 rounded-lg border-2 border-[#1c4941] bg-[#0d332f] px-3 py-1.5" data-offline-ready={ready ? "true" : "false"}>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#75d5c0]">Offline</p>
          <p className="truncate text-xs font-black leading-tight text-[#fffdf6]">{headline}</p>
        </div>
        <button
          type="button"
          onClick={saveOffline}
          disabled={disabled}
          className="min-h-9 shrink-0 rounded-lg border-2 border-[#092421] bg-[#f0c84b] px-3 py-1.5 text-xs font-black text-[#102f36] shadow-[2px_2px_0_#092421] transition enabled:hover:bg-[#ffd96a] enabled:active:translate-y-0.5 disabled:cursor-default disabled:opacity-60"
        >
          {buttonLabel}
        </button>
        {(saving || failureCount > 0) && <span className="sr-only" aria-live="polite">{progress.completed} of {progress.total} offline cards checked. {progress.failed} failed.</span>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-[#092421] bg-[#e5f6e9] p-2.5" data-offline-ready={ready ? "true" : "false"}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#45705b]">Offline</p>
          <p className="truncate text-sm font-black leading-tight text-[#102f36]">{headline}</p>
          <p className="mt-0.5 text-[10px] font-bold leading-snug text-[#5f6b5d]">
            The app and next four full-quality cards cache automatically. Saving reuses cards already on this device.
          </p>
        </div>
        <button
          type="button"
          onClick={saveOffline}
          disabled={disabled}
          className="min-h-10 shrink-0 rounded-lg border-2 border-[#092421] bg-[#f3c647] px-3 py-2 text-xs font-black text-[#102f36] shadow-[2px_2px_0_#092421] transition enabled:hover:bg-[#ffd96a] enabled:active:translate-y-0.5 disabled:cursor-default disabled:opacity-60"
        >
          {buttonLabel}
        </button>
      </div>
      {saving && (
        <div className="mt-2 h-2 overflow-hidden rounded-full border border-[#092421] bg-white" aria-label={`${progress.completed} of ${progress.total} offline cards checked`}>
          <div className="h-full bg-[#70d392] transition-[width]" style={{ width: `${(progress.completed / Math.max(1, progress.total)) * 100}%` }} />
        </div>
      )}
    </div>
  );
}
