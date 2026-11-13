const CACHE_NAME = 'conviva-per-screen-demo-v7';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icons/conviva.svg', './prototype-enhancements.js', './Conviva%20Simulador.html'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME), cached = await cache.match(request);
    if (cached) return cached;
    try { const response = await fetch(request); if (response.ok && response.type === 'basic') await cache.put(request, response.clone()); return response; }
    catch (_) { return request.mode === 'navigate' ? (await cache.match('./index.html')) || Response.error() : Response.error(); }
  })());
});
