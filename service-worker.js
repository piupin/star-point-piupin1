self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('star-cache-v2').then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './splash.html',
        './manifest.json',
        './icons/icon-192x192.png',
        './icons/icon-512x512.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== 'star-cache-v2') {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        // If offline and request is for an HTML page, return index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
