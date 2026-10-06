const CACHE_NAME = 'app-mantenimiento-v1';
const urlsToCache = [
  'index.html',
  'manifest.json'
];

// Instalar service worker
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando archivos');
      return cache.addAll(urlsToCache).catch(err => {
        console.log('[SW] Error al cachear:', err);
        // Continuar aunque falle el cache
      });
    }).catch(err => {
      console.log('[SW] Error en instalación:', err);
    })
  );
  self.skipWaiting();
});

// Activar service worker
self.addEventListener('activate', event => {
  console.log('[SW] Activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Limpiando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: Network First, fallback to Cache
self.addEventListener('fetch', event => {
  // No cachear requests de POST, PUT, DELETE
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si es válido, guardar en cache
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache).catch(() => {
            // Ignorar errores de cache
          });
        });

        return response;
      })
      .catch(() => {
        // Sin conexión: devolver del cache
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          // Si no está en cache, devolver el HTML (para que la app se abra)
          return caches.match('index.html');
        }).catch(() => {
          return new Response('Sin conexión a internet', { status: 503 });
        });
      })
  );
});
