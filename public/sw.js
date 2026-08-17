const CACHE='mi-carril-v1'; const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => { if(event.request.method==='GET') event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./')))); });
