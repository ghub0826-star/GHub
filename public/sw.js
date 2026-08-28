/* GHub Service Worker (CRA-native) */
const CACHE_NAME = 'ghub-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/assets/site-bg.svg',
  '/assets/site-bg.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Sensitive paths that must NEVER be cached.
const SENSITIVE_PATHS = [
  '/checkout',
  '/payment',
  '/wallet',
  '/order',
  '/admin',
  '/buyer',
  '/seller',
  '/chat',
  '/notifications',
  '/messages',
  '/settings',
  '/login',
  '/register'
];

function isSensitive(url) {
  const path = new URL(url).pathname;
  return SENSITIVE_PATHS.some((p) => path.startsWith(p));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache sensitive routes, or if not a GET.
  if (request.method !== 'GET' || isSensitive(request.url)) return;

  // API product requests: Network First, fallback to cache.
  if (url.pathname.startsWith('/api/products')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Navigation requests: network-first, fallback to offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Icons / static images: cache-first.
  if (/\.(png|jpg|jpeg|webp|avif|svg|gif|ico)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  // CSS/JS build assets: stale-while-revalidate.
  if (/\.(css|js)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Default: network-first.
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
