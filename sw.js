
const CACHE_NAME = 'bf-app-v5.0';
const urlsToCache = ['./', './index.html?v=5.0', './style.css?v=5.0', './app.js?v=5.0', './data.js?v=5.0'];

self.addEventListener('install', e => { 
    self.skipWaiting(); 
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))); 
});

self.addEventListener('activate', e => { 
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })
        )).then(() => self.clients.claim())
    ); 
});

self.addEventListener('fetch', e => { 
    e.respondWith(
        caches.match(e.request).then(res => {
            if (res) return res;
            return fetch(e.request).then(newRes => {
                if(!newRes || newRes.status !== 200 || newRes.type !== 'basic') return newRes;
                const resToCache = newRes.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, resToCache));
                return newRes;
            });
        }).catch(() => fetch(e.request))
    ); 
});
