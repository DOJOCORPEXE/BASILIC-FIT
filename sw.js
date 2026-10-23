// Service worker minimal — rend l'app "installable" (PWA) et permet un
// usage basique hors-ligne (dernière version chargée reste accessible).
// Stratégie network-first : toujours la version la plus fraîche en ligne,
// fallback sur le cache uniquement si le réseau est indisponible — pour
// éviter de servir une version périmée pendant qu'on développe encore.
// Sécurité (23/10/2026) : seuls les fichiers de l'app elle-même (même
// origine, GET, réponse OK) sont mis en cache. Avant, TOUTES les réponses
// l'étaient, y compris celles de l'API Supabase (repas, poids, séances…),
// qui restaient sur le téléphone après déconnexion. Le changement de nom
// du cache efface l'ancien cache au prochain chargement.
const CACHE_NAME = 'npng-v2';

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
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
