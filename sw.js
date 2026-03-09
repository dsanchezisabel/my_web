const CACHE_NAME = 'dblog-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './lang.js',
  './noticias.json',
  './proyectos.json',
  './img/logo.png'
];

// Instalamos el Service Worker y guardamos los archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Interceptamos las peticiones (Modo Offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si el archivo está en caché, lo devolvemos. Si no, lo descargamos de internet.
      return response || fetch(event.request);
    })
  );
});