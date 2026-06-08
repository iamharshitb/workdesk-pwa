// Service worker v10 — unregister old caches and pass through all requests
const CACHE = 'workdesk-v10';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Pass ALL requests directly to network — no caching
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
