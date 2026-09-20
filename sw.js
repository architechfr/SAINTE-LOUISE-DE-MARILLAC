/* Sainte Louise de Marillac — service worker
   Stratégie : réseau d'abord, cache en secours.
   Le site reste donc toujours à jour quand il y a du réseau,
   et reste consultable hors ligne (utile dans l'église).
   Pour forcer le renouvellement du cache après une grosse mise à jour,
   incrémenter le numéro de version ci-dessous. */

const CACHE = 'louise-v1';
const SHELL = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(
        noms.filter((n) => n !== CACHE).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(req)
      .then((rep) => {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(req, copie)).catch(() => {});
        return rep;
      })
      .catch(() => caches.match(req).then((rep) => rep || caches.match('/')))
  );
});
