const CACHE_NAME = "student-stars-shell-v1";
const OFFLINE_ASSETS = [
  "./",
  "./index.html",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png"
];

// Install: cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for app shell; network-first for others
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Cache-first for same-origin document & static assets
  const isSameOrigin = new URL(req.url).origin === self.location.origin;
  if (isSameOrigin) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
    return;
  }

  // For cross-origin (Google Sheets), just let page JS handle offline via localStorage
  // so we keep logic simple here (network attempt; failing is okay).
});
