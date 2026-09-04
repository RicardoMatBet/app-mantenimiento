const CACHE_NAME = 'mantenimiento-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instalar el service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(() => {
        // Si algo falla, no hace nada
        console.log('Cache limitado');
      });
    })
  );
  self.skipWaiting();
});

// Activar el service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: primero red, si no funciona usa cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      if (!response || response.status !== 200) {
        return caches.match(event.request);
      }
      return response;
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});
