const CACHE = 'transfer-v1';
const SHELL = ['/', '/manifest.json'];

// Install: cache the app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for shell
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go network for API/upload/download routes
  if (['/upload', '/file/', '/info/', '/api/'].some(p => url.pathname.startsWith(p))) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first for shell assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
