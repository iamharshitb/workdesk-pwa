const CACHE = 'workdesk-v5';
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

// Activate: clear old caches immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - HTML pages: network-first (always get latest, fall back to cache offline)
// - CSS/JS/images: cache-first (fast, update on next cache version bump)
// - Firebase/external: network-only with cache fallback
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // External APIs — always network, cache as fallback
  const isExternal =
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    url.includes('corsproxy.io');

  if (isExternal) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // HTML pages — network-first so updates are always picked up
  const isHTML = e.request.headers.get('accept')?.includes('text/html') ||
                 url.endsWith('.html') || url.endsWith('/');

  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // Update cache with fresh version
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request)) // offline fallback
    );
    return;
  }

  // CSS/JS/images — cache-first for speed
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
