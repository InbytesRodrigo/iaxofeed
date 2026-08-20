var CACHE_NAME = 'iaxo-ads-v3';
var ASSETS = [
    '/',
    '/index.html',
    '/pages/login.html',
    '/pages/cadastro.html',
    '/pages/admin.html',
    '/pages/usuario.html',
    '/css/landing.css',
    '/css/panel.css',
    '/css/user.css',
    '/js/landing.js',
    '/js/admin.js',
    '/js/user.js',
    '/js/firebase-config.js',
    '/js/firebase-services.js',
    '/manifest.json'
];

// Install - cache core assets
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; })
                    .map(function(k) { return caches.delete(k); })
            );
        })
    );
    self.clients.claim();
});

// Fetch - network first, cache fallback
self.addEventListener('fetch', function(e) {
    // Skip non-GET requests
    if (e.request.method !== 'GET') return;
    
    // Skip Firebase/API requests
    if (e.request.url.indexOf('firebaseio.com') !== -1 ||
        e.request.url.indexOf('googleapis.com') !== -1 ||
        e.request.url.indexOf('gstatic.com') !== -1) {
        return;
    }

    e.respondWith(
        fetch(e.request)
            .then(function(response) {
                // Only cache successful responses
                if (!response || response.status !== 200) return response;
                
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(e.request, clone);
                });
                return response;
            })
            .catch(function() {
                return caches.match(e.request).then(function(cached) {
                    return cached || new Response('Offline', { status: 503 });
                });
            })
    );
});
