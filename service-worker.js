/* Floradex — Service Worker v2 (Session 5 — Fiches Wikipedia enrichies)
   Stratégie :
   - cache-first + revalidation silencieuse (stale-while-revalidate) sur le shell
   - paca-genera.json + paca-flora.json précachés
   - network-only sur my-api.plantnet.org (toujours réseau, jamais en cache)
   - cross-origin Wikipedia / Wikidata / Wikimedia : laissé passer au réseau
     (le cache applicatif est géré côté JS via IndexedDB, TTL 30 jours)
   - Au update : skipWaiting + clients.claim pour propagation immédiate
   - Au activate : cleanup automatique de TOUS les anciens caches
   Bump CACHE_VERSION à chaque deploy pour invalider proprement.
*/
const CACHE_VERSION = 'floradex-v2-genus-2026-05-11-e';
const PRECACHE_URLS = [
  './',
  './index.html',
  './paca-flora.json',
  './paca-genera.json',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './floradex-logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] precache partial fail:', err);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Cleanup TOUS les caches qui ne sont pas la version courante,
    // y compris les anciens 'florescence-poc-v1' du POC S2.
    await Promise.all(
      keys.filter((k) => k !== CACHE_VERSION).map((k) => {
        console.log('[SW] cleanup ancien cache:', k);
        return caches.delete(k);
      })
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Pl@ntNet : toujours réseau direct, jamais cache
  if (url.hostname.endsWith('plantnet.org')) return;

  // Cross-origin autre : laisse passer
  if (url.origin !== self.location.origin) return;

  // Stale-while-revalidate
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(req);

    const networkPromise = fetch(req).then((resp) => {
      if (resp && resp.ok) {
        cache.put(req, resp.clone()).catch(() => {});
      }
      return resp;
    }).catch(() => null);

    if (cached) {
      // Sert le cache immédiatement, revalide en arrière-plan
      networkPromise.catch(() => {});
      return cached;
    }

    // Pas en cache : on attend le réseau
    const fresh = await networkPromise;
    if (fresh) return fresh;

    // Pas de réseau : fallback shell
    const fallback = await cache.match('./index.html');
    if (fallback) return fallback;
    return new Response('offline', { status: 503, statusText: 'Service Unavailable' });
  })());
});

// Permet à la page de demander un skipWaiting (déclenchable depuis l'app)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
