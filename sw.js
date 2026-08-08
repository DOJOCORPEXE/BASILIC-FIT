// Service worker minimal — rend l'app "installable" (PWA) et permet un
// usage basique hors-ligne (dernière version chargée reste accessible).
// Stratégie network-first : toujours la version la plus fraîche en ligne,
// fallback sur le cache uniquement si le réseau est indisponible — pour
// éviter de servir une version périmée pendant qu'on développe encore.
const CACHE_NAME = 'npng-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
