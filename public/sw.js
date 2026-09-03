const CACHE_VERSION = "burrow-flight-v2";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const CONTENT_CACHE = `${CACHE_VERSION}-content`;
const CONTENT_INDEX_URL = new URL("/__burrow/offline-content-index", self.location.origin).href;
const CACHE_BATCH_SIZE = 3;
const CORE_URLS = [
  "/",
  "/play",
  "/manifest.json",
  "/offline-assets.json",
  "/world-map-land.svg",
  "/icons/burrow-icon-32.png",
  "/icons/burrow-icon-64.png",
  "/icons/burrow-icon-180.png",
];

let contentQueue = Promise.resolve();

const sameOriginUrl = (value) => {
  try {
    const url = new URL(value, self.location.origin);
    return url.origin === self.location.origin ? url : null;
  } catch {
    return null;
  }
};

const normalizedRevision = (value) => typeof value === "string" && /^[a-z0-9-]{1,80}$/i.test(value) ? value : "unversioned";

const normalizeEntries = (values) => {
  const entries = new Map();
  for (const value of values ?? []) {
    const rawUrl = typeof value === "string" ? value : value?.url;
    const url = sameOriginUrl(rawUrl);
    if (!url || url.pathname.startsWith("/api/") || url.pathname.startsWith("/__burrow/")) continue;
    entries.set(url.href, {
      url: url.href,
      revision: normalizedRevision(typeof value === "string" ? "legacy" : value.revision),
      bytes: typeof value === "object" && Number.isFinite(value?.bytes) ? Math.max(0, value.bytes) : 0,
    });
  }
  return Array.from(entries.values());
};

const fetchAndCacheShell = async (cache, value) => {
  const url = sameOriginUrl(value);
  if (!url || url.pathname.startsWith("/api/")) return false;
  try {
    const response = await fetch(new Request(url.href, { cache: "reload" }));
    if (!response.ok) return false;
    await cache.put(url.href, response.clone());
    return true;
  } catch {
    return false;
  }
};

const pageAssets = (html) => Array.from(html.matchAll(/(?:src|href)=["']([^"']+)["']/g), (match) => match[1])
  .filter((value) => value.startsWith("/_next/static/"));

const cacheShell = async () => {
  const cache = await caches.open(SHELL_CACHE);
  for (const value of CORE_URLS) await fetchAndCacheShell(cache, value);

  for (const page of ["/", "/play"]) {
    const response = await cache.match(page, { ignoreSearch: true });
    if (!response) continue;
    const html = await response.text();
    for (const asset of pageAssets(html)) await fetchAndCacheShell(cache, asset);
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(cacheShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("burrow-flight-") && name !== SHELL_CACHE && name !== CONTENT_CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

const cacheFirst = async (request) => {
  const cached = await caches.match(request, { ignoreVary: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(request.url.includes("/_next/static/") ? SHELL_CACHE : CONTENT_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
};

const optimizedImageResponse = async (request) => {
  try {
    return await cacheFirst(request);
  } catch {
    const optimizedUrl = new URL(request.url);
    const originalPath = optimizedUrl.searchParams.get("url");
    const originalUrl = originalPath ? sameOriginUrl(originalPath) : null;
    if (!originalUrl) return Response.error();
    return (await caches.match(originalUrl.href, { ignoreVary: true })) ?? Response.error();
  }
};

const networkFirst = async (request, cacheName) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request, { ignoreSearch: true })) ?? Response.error();
  }
};

const navigationResponse = async (request) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request, { ignoreSearch: true }))
      ?? (await caches.match("/play", { ignoreSearch: true }))
      ?? (await caches.match("/", { ignoreSearch: true }))
      ?? Response.error();
  }
};

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = sameOriginUrl(request.url);
  if (!url || url.pathname.startsWith("/api/") || url.pathname.startsWith("/__burrow/")) return;

  if (request.mode === "navigate") {
    event.respondWith(navigationResponse(request));
    return;
  }

  if (url.pathname === "/offline-assets.json") {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(optimizedImageResponse(request));
    return;
  }

  const cacheable = url.pathname.startsWith("/_next/static/")
    || url.pathname.startsWith("/burrow-assets/")
    || url.pathname.startsWith("/icons/")
    || url.pathname === "/world-map-land.svg"
    || url.pathname === "/manifest.json"
    || /\.(?:png|jpe?g|webp|gif|svg|ico|css|js|woff2?)$/i.test(url.pathname);
  if (cacheable) event.respondWith(cacheFirst(request));
});

const sendToSource = (source, message) => {
  if (source && "postMessage" in source) source.postMessage(message);
};

const readContentIndex = async (cache) => {
  try {
    const response = await cache.match(CONTENT_INDEX_URL);
    const parsed = response ? await response.json() : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeContentIndex = async (cache, index) => {
  await cache.put(CONTENT_INDEX_URL, new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  }));
};

const fetchAndCacheContent = async (cache, index, entry) => {
  const cached = await cache.match(entry.url, { ignoreVary: true });
  if (cached && index[entry.url] === entry.revision) return { ok: true, cached: true, bytes: entry.bytes };

  // A current page image can reach the content cache just before the warm-up message.
  // The v2 activation removes legacy caches, so an unindexed response is safe to adopt.
  if (cached && !index[entry.url]) {
    index[entry.url] = entry.revision;
    return { ok: true, cached: true, bytes: entry.bytes };
  }

  try {
    const response = await fetch(new Request(entry.url, { cache: "reload" }));
    if (!response.ok) return { ok: false, cached: false, bytes: 0 };
    await cache.put(entry.url, response.clone());
    index[entry.url] = entry.revision;
    return { ok: true, cached: false, bytes: entry.bytes };
  } catch {
    return { ok: false, cached: false, bytes: 0 };
  }
};

const currentContentStatus = async (entries) => {
  const cache = await caches.open(CONTENT_CACHE);
  const index = await readContentIndex(cache);
  let cached = 0;
  let cachedBytes = 0;

  for (let offset = 0; offset < entries.length; offset += 30) {
    const batch = entries.slice(offset, offset + 30);
    const matches = await Promise.all(batch.map(async (entry) => (
      index[entry.url] === entry.revision && Boolean(await cache.match(entry.url, { ignoreVary: true }))
    )));
    matches.forEach((matchesRevision, itemIndex) => {
      if (!matchesRevision) return;
      cached += 1;
      cachedBytes += batch[itemIndex].bytes;
    });
  }

  return { cached, cachedBytes, total: entries.length };
};

const cacheContentEntries = async (message, source) => {
  const requestId = String(message.requestId ?? "cache");
  const entries = normalizeEntries(Array.isArray(message.entries) ? message.entries : message.urls);
  const cache = await caches.open(CONTENT_CACHE);
  const index = await readContentIndex(cache);
  let completed = 0;
  let cached = 0;
  let downloaded = 0;
  let failed = 0;
  let cachedBytes = 0;
  let downloadedBytes = 0;

  for (let offset = 0; offset < entries.length; offset += CACHE_BATCH_SIZE) {
    const batch = entries.slice(offset, offset + CACHE_BATCH_SIZE);
    const results = await Promise.all(batch.map((entry) => fetchAndCacheContent(cache, index, entry)));
    results.forEach((result) => {
      completed += 1;
      if (!result.ok) failed += 1;
      else if (result.cached) {
        cached += 1;
        cachedBytes += result.bytes;
      } else {
        downloaded += 1;
        downloadedBytes += result.bytes;
      }
    });
    await writeContentIndex(cache, index);
    if (!message.quiet) sendToSource(source, {
      type: "OFFLINE_CACHE_PROGRESS",
      requestId,
      completed,
      total: entries.length,
      cached,
      downloaded,
      failed,
      cachedBytes,
      downloadedBytes,
    });
  }

  if (!message.quiet) sendToSource(source, {
    type: "OFFLINE_CACHE_COMPLETE",
    requestId,
    completed,
    total: entries.length,
    cached,
    downloaded,
    failed,
    cachedBytes,
    downloadedBytes,
  });
};

const queueContentTask = (task) => {
  const nextTask = contentQueue.then(task, task);
  contentQueue = nextTask.catch(() => undefined);
  return nextTask;
};

self.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message !== "object") return;

  if (message.type === "CHECK_OFFLINE_STATUS") {
    event.waitUntil(queueContentTask(async () => {
      const shellCache = await caches.open(SHELL_CACHE);
      const shellReady = Boolean(await shellCache.match("/play", { ignoreSearch: true }));
      const entries = normalizeEntries(Array.isArray(message.entries) ? message.entries : message.urls);
      const status = await currentContentStatus(entries);
      sendToSource(event.source, { type: "OFFLINE_STATUS", shellReady, ...status });
    }));
    return;
  }

  if (message.type !== "CACHE_URLS" || (!Array.isArray(message.entries) && !Array.isArray(message.urls))) return;
  event.waitUntil(queueContentTask(() => cacheContentEntries(message, event.source)));
});
