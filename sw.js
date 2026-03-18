const CACHE_VERSION = 'v3';
const STATIC_CACHE = `shirqat-static-${CACHE_VERSION}`;
const API_CACHE    = `shirqat-api-${CACHE_VERSION}`;

const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

// ── التثبيت ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── التفعيل: حذف الكاش القديم ────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== API_CACHE)
            .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── اعتراض الطلبات ───────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API مواقيت الصلاة والطقس → Network First مع Fallback
  if (url.hostname.includes('aladhan.com') || url.hostname.includes('open-meteo.com')) {
    event.respondWith(networkFirst(event.request, API_CACHE));
    return;
  }
  // الصور الخارجية → Cache First
  if (url.hostname.includes('picsum.photos') || event.request.destination === 'image') {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }
  // ملفات JS/CSS/HTML → Stale While Revalidate
  if (['script','style','document'].includes(event.request.destination)) {
    event.respondWith(staleWhileRevalidate(event.request, STATIC_CACHE));
    return;
  }
  // الباقي → Network First
  event.respondWith(networkFirst(event.request, STATIC_CACHE));
});

// ── الاستراتيجيات ────────────────────────────────────────────
async function networkFirst(request, cacheName) {
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.url.includes('aladhan.com') || request.url.includes('open-meteo.com'))
      return new Response(JSON.stringify({ offline: true }), { headers: { 'Content-Type': 'application/json' } });
    return new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && res.ok) { const c = await caches.open(cacheName); c.put(request, res.clone()); }
    return res;
  } catch { return new Response('', { status: 408 }); }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchP = fetch(request).then(res => {
    if (res && res.ok) {
      cache.put(request, res.clone());
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'CACHE_UPDATED' }))
      );
    }
    return res;
  }).catch(() => null);
  return cached || fetchP;
}

// ── Background Sync ───────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SYNC_COMPLETE' }))
      )
    );
  }
});

// ── رسائل من التطبيق ──────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CACHE_URLS') {
    caches.open(STATIC_CACHE).then(c => c.addAll(event.data.urls || []));
  }
});
