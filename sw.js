const CACHE = 'workdesk-v4';
const STATIC = [
  '/workdesk-pwa/',
  '/workdesk-pwa/index.html',
  '/workdesk-pwa/input.html',
  '/workdesk-pwa/report.html',
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

// Install: cache all static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for Firebase/Google, cache-first for everything else
self.addEventListener('fetch', e => {
  const url = e.request.url;
  const isExternal =
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    url.includes('corsproxy.io');

  if (isExternal) {
    // Always try network for external resources, fall back to cache
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first for local assets
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
