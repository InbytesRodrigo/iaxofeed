const CACHE_NAME = 'iaxo-ads-v2';
const ASSETS = [
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
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

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

self.addEventListener('fetch', function(e) {
    e.respondWith(
        fetch(e.request)
            .then(function(response) {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
                return response;
            })
            .catch(function() {
                return caches.match(e.request);
            })
    );
});
