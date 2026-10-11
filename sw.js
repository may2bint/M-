'use strict';
const PREFIX = 'mchart-app-';
const CACHE = PREFIX + 'v5-integral1';
const ROOT = new URL('./', self.location.href).href;
const SHELL = ['./','./index.html','./app.js','./manifest.webmanifest','./icon-192.png?v=4','./icon-512.png?v=4','./apple-touch-icon.png?v=4','./favicon.ico?v=4','./favicon-32x32.png?v=4','./favicon-48x48.png?v=4'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(path => new URL(path, ROOT).href))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const local = url.origin === self.location.origin && url.href.startsWith(ROOT);
  const mathjax = url.origin === 'https://cdn.jsdelivr.net' && url.pathname.startsWith('/npm/mathjax@3/');
  if (!local && !mathjax) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') await cache.put(request, response.clone()).catch(() => {});
      return response;
    } catch (error) {
      const saved = await cache.match(request, {ignoreSearch: local});
      if (saved) return saved;
      if (local && request.mode === 'navigate') {
        const home = await cache.match(ROOT);
        if (home) return home;
      }
      throw error;
    }
  })());
});





