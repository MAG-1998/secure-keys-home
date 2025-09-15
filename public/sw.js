const CACHE_NAME = 'magit-cache-v1';
const IMAGE_CACHE_NAME = 'magit-images-v1';
const STATIC_CACHE_NAME = 'magit-static-v1';

// Cache static assets for 1 year
const STATIC_ASSETS = [
  '/placeholder.svg',
  '/icons/magit-favicon-light.png',
  '/icons/magit-favicon-dark.png',
  '/icons/magit-favicon-halal-light.png',
  '/icons/magit-favicon-halal-dark.png'
];

// Supabase storage URL pattern
const SUPABASE_IMAGE_PATTERN = /https:\/\/mvndmnkgtoygsvesktgw\.supabase\.co\/storage\/v1\/object\/public\//;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Clean up old caches
          if (cacheName !== CACHE_NAME && 
              cacheName !== IMAGE_CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle Supabase images with Cache First strategy
  if (SUPABASE_IMAGE_PATTERN.test(request.url) && request.method === 'GET') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        // Try cache first
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network and cache
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            // Clone for cache (can only use response once)
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // Return placeholder if both cache and network fail
          return new Response(
            '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#6b7280">Image unavailable</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      })
    );
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }

  // Default: Network first for other requests
  event.respondWith(fetch(request));
});