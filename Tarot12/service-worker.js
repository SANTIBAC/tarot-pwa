const CACHE_NAME = 'tarot-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './images/fondo.jpg',
  './images/1.jpg',
  './images/2.jpg',
  './images/3.jpg',
  './images/4.jpg',
  './images/5.jpg',
  './images/6.jpg',
  './images/7.jpg',
  './images/8.jpg',
  './images/9.jpg',
  './images/10.jpg',
  './images/11.jpg',
  './images/12.jpg'
];

// INSTALACIÓN
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Precaching app shell...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Control inmediato
});

// ACTIVACIÓN
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activando...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log(`[ServiceWorker] Eliminando caché antigua: ${key}`);
          return caches.delete(key);
        })
      )
    )
  );
  return self.clients.claim();
});

// FETCH con estrategia diferenciada
self.addEventListener('fetch', event => {
  const req = event.request;

  // Estrategia: Red primero para HTML, Cache primero para el resto
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(req, res.clone());
            return res;
          });
        })
        .catch(() => caches.match(req))
    );
  } else {
    event.respondWith(
      caches.match(req).then(response => {
        return (
          response ||
          fetch(req).catch(() => {
            // Devuelve algo de fallback si quieres
            return new Response('⚠️ No se pudo cargar el recurso.', {
              status: 503,
              statusText: 'Offline'
            });
          })
        );
      })
    );
  }
});
