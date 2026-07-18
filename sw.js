// Service worker v11 — unregister old caches, pass through all requests,
// handle taps on local task notifications (see maybeShowTaskNotification()
// in index.html — notifications are shown via this SW's showNotification(),
// not the plain Notification() constructor, which throws on nearly all
// mobile browsers including Android Chrome).
const CACHE = 'workdesk-v11';

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

// Tapping a task notification focuses an already-open WorkDesk tab if one
// exists, otherwise opens a new one at the dashboard.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/workdesk-pwa/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/workdesk-pwa/index.html');
      }
    })
  );
});
