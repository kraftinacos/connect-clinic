const CACHE_NAME = 'elixir-pwa-v2';
const DATA_CACHE_NAME = 'elixir-data-v2';
const STATIC_ASSETS = [
    '/connect-clinic/',
    '/connect-clinic/elixir_pwa_fixed.html'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => {
                    return name !== CACHE_NAME && name !== DATA_CACHE_NAME;
                }).map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // API requests - network first, then cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() => {
                return caches.match(request);
            })
        );
        return;
    }
    
    // Static assets - cache first, then network
    event.respondWith(
        caches.match(request).then(response => {
            if (response) {
                return response;
            }
            return fetch(request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }).catch(() => {
            return new Response('Offline - No cached data available');
        })
    );
});