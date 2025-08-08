self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch; placeholder for future caching strategy
self.addEventListener('fetch', () => {
  // No-op
});
