/* ============================================================
   LAOKA — sw.js
   Service worker minimal : mise en cache des fichiers principaux
   pour un fonctionnement hors-ligne basique, requis pour la
   validité PWA/TWA (Trusted Web Activity).
   ============================================================ */

const CACHE_NAME = "laoka-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./data.js",
  "./app.js",
  "./ui.js",
  "./ui-tsopitra.js",
  "./ui-courses.js",
  "./ui-profil.js",
  "./ui-admin.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Stratégie "network first, fallback to cache" pour rester à jour tout en marchant hors-ligne
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
