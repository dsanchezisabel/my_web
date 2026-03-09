const CACHE_NAME = 'dblog-v2'; // Cambiamos el nombre para forzar actualización
const assets = [
  'index.html',
  'style.css',
  'script.js',
  'lang.js',
  'proyectos.json',
  'noticias.json',
  'img/logo.png',
  'img/foto_orla.png'
];

// Instalación: Guardamos archivos base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cacheando archivos base...');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); // Fuerza a que el nuevo SW tome el control
});

// Activación: Limpiamos cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Estrategia: "Cache First, falling back to Network"
self.addEventListener('fetch', event => {
  // Omitir peticiones que no sean de nuestra propia web (como extensiones de Chrome)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      // Si está en caché, lo devolvemos; si no, vamos a la red
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          // Guardamos dinámicamente lo que el usuario vaya visitando
          cache.put(event.request.url, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
        // Si no hay red ni caché para un HTML, podrías devolver index.html
        if (event.request.mode === 'navigate') {
            return caches.match('index.html');
        }
    })
  );
});
