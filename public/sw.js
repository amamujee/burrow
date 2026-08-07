const CACHE_VERSION = "burrow-flight-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const CONTENT_CACHE = `${CACHE_VERSION}-content`;
const CORE_URLS = [
  "/",
  "/play",
  "/manifest.json",
  "/world-map-land.svg",
  "/icons/burrow-icon-32.png",
  "/icons/burrow-icon-64.png",
  "/icons/burrow-icon-180.png",
];

const sameOriginUrl = (value) => {
  try {
    const url = new URL(value, self.location.origin);
    return url.origin === self.location.origin ? url : null;
  } catch {
    return null;
  }
};

const fetchAndCache = async (cache, value) => {
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
  for (const value of CORE_URLS) await fetchAndCache(cache, value);

  for (const page of ["/", "/play"]) {
    const response = await cache.match(page, { ignoreSearch: true });
    if (!response) continue;
    const html = await response.text();
    for (const asset of pageAssets(html)) await fetchAndCache(cache, asset);
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
  if (!url || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(navigationResponse(request));
    return;
  }

  const cacheable = url.pathname.startsWith("/_next/static/")
    || url.pathname.startsWith("/_next/image")
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

self.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message !== "object") return;

  if (message.type === "CHECK_OFFLINE_STATUS") {
    event.waitUntil((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const shellReady = Boolean(await cache.match("/play", { ignoreSearch: true }));
      sendToSource(event.source, { type: "OFFLINE_STATUS", shellReady });
    })());
    return;
  }

  if (message.type !== "CACHE_URLS" || !Array.isArray(message.urls)) return;
  event.waitUntil((async () => {
    const requestId = String(message.requestId ?? "cache");
    const urls = Array.from(new Set(message.urls)).filter((value) => typeof value === "string" && sameOriginUrl(value));
    const cache = await caches.open(CONTENT_CACHE);
    let completed = 0;

    for (let index = 0; index < urls.length; index += 6) {
      const batch = urls.slice(index, index + 6);
      await Promise.all(batch.map((url) => fetchAndCache(cache, url)));
      completed += batch.length;
      if (!message.quiet) sendToSource(event.source, { type: "OFFLINE_CACHE_PROGRESS", requestId, completed, total: urls.length });
    }

    if (!message.quiet) sendToSource(event.source, { type: "OFFLINE_CACHE_COMPLETE", requestId, total: urls.length });
  })());
});
