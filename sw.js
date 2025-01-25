// sw.js (service worker)
// job    : handles offline features
// git    : https://github.com/motetpaper/pwa-motet-hexrgb
// lic    : MIT

const cacheName = 'hexrgb-v0-5-2';
const swfiles = [
  './hexrgb/',
  './hexrgb/index.html',
  './hexrgb/app.js',
  './hexrgb/style.css',
  './hexrgb/favicon.ico',
  './hexrgb/icon/icon512.png',
];

const contentToCache = [];
contentToCache.concat(swfiles);

self.addEventListener('install', (evt) => {
  console.log('[sw.js] Install');
  evt.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      console.log('[sw.js] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })(),
  );
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    (async () => {
      const r = await caches.match(evt.request);
      console.log(`[sw.js] Fetching resource: ${evt.request.url}`);
      console.log(evt);
      if (r) {
        return r;
      }
      const response = await fetch(evt.request);
      const cache = await caches.open(cacheName);
      console.log(`[sw.js] Caching new resource: ${evt.request.url}`);
      cache.put(evt.request, response.clone());
      return response;
    })(),
  );
});
