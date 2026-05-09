/* Florescence POC — service worker
   Stratégie :
   - cache-first sur le shell de l'app + paca-flora.json
   - network-only sur my-api.plantnet.org (jamais en cache, identification = en ligne)
   - le SW est silencieux pour tout le reste
*/
const CACHE = 'florescence-poc-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './paca-flora.json',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Pl@ntNet : on laisse passer (toujours réseau, jamais en cache)
  if (url.hostname.endsWith('plantnet.org')) return;

  // Cross-origin autre que notre origine : on laisse aussi
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if (cached) {
      // Cache-first ; on tente une revalidation silencieuse en arrière-plan
      fetch(req).then((resp) => {
        if (resp && resp.ok) cache.put(req, resp.clone());
      }).catch(() => {});
      return cached;
    }
    try {
      const resp = await fetch(req);
      if (resp && resp.ok) cache.put(req, resp.clone());
      return resp;
    } catch (e) {
      // Pas de réseau, pas en cache : fallback sur index.html (mode offline pur)
      const fallback = await cache.match('./index.html');
      if (fallback) return fallback;
      throw e;
    }
  })());
});
