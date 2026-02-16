const CACHE_NAME = 'connect-clinic-v1';
const STATIC_ASSETS = [
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/pages/home.html',
  '/pages/adhd.html',
  '/pages/anxiety.html',
  '/pages/depression.html',
  '/pages/about.html',
  '/pages/book.html',
  '/pages/faq.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((err) => console.error('Cache install failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      });
    }).catch(() => {
      return new Response(
        `<!DOCTYPE html><html><head><title>Offline</title></head><body style="font-family:sans-serif;text-align:center;padding:40px;background:#F7F4F0;"><h1>You're offline</h1><p>Some pages may still be available.</p></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    })
  );
});