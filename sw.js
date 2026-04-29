/* ══ Service Worker — Network First ══
   Toujours récupérer la dernière version du réseau.
   Mise en cache uniquement en fallback (hors ligne).
*/
const CACHE = 'pdla-v1';

self.addEventListener('install', e => {
  self.skipWaiting(); // Active immédiatement sans attendre
});

self.addEventListener('activate', e => {
  // Supprime les anciens caches à chaque nouvelle version du SW
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // Prend le contrôle immédiatement
  );
});

self.addEventListener('fetch', e => {
  // Ne traite que les requêtes GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Requête réseau réussie → met en cache + retourne
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() =>
        // Réseau indisponible → fallback cache (mode hors ligne)
        caches.match(e.request)
      )
  );
});
