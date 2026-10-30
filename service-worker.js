const CACHE = 'app-mant-v4';

// Siempre pide la versión más nueva a la red; el caché solo sirve si no hay internet
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(res => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(event.request, copia));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then(r => r || caches.match('index.html')))
  );
});
