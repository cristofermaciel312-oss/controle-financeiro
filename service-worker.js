const CACHE_NAME = 'controle-financeiro-v2';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/historico.html',
  '/manifest.json',
  '/js/script.js',
  '/js/historico.js'
];

// 🔹 INSTALAÇÃO
self.addEventListener('install', event => {
  self.skipWaiting(); // força instalar a nova versão
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 🔹 ATIVAÇÃO
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // força usar a versão nova
  );
});

// 🔹 FETCH
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Atualiza o cache com a versão mais recente
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

