const CACHE = 'workdesk-v7';
const STATIC = [
  '/workdesk-pwa/css/style.css',
  '/workdesk-pwa/css/themes.css',
  '/workdesk-pwa/js/firebase.js',
  '/workdesk-pwa/js/theme.js',
  '/workdesk-pwa/js/sounds.js',
  '/workdesk-pwa/manifest.json',
  '/workdesk-pwa/icons/icon-192.png',
  '/workdesk-pwa/icons/icon-512.png',
  '/workdesk-pwa/icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // External — always network
  if (url.includes('googleapis.com') || url.includes('firebase') || url.includes('gstatic') || url.includes('corsproxy')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // HTML — NEVER cache, always fetch fresh from network
  // This ensures navigating back always gets the latest version
  if (url.endsWith('.html') || url.endsWith('/workdesk-pwa/') || url.endsWith('/workdesk-pwa')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request)) // offline only fallback
    );
    return;
  }

  // CSS / JS / images — cache first for speed
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
