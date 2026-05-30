/**
 * Service Worker — mesdonneeslocales.fr
 *
 * Stratégie :
 *  - Pages éditoriales principales + assets critiques : precache à l'install
 *  - HTML (autres pages) : network-first → fallback cache → fallback /404.html
 *  - Assets statiques (CSS, JS, fonts, images) : stale-while-revalidate
 *  - /mviewer/* : NE PAS intercepter (déployé séparément, gère son propre cache)
 *  - Cross-origin : NE PAS intercepter
 *
 * Auto-update silencieux : skipWaiting + clients.claim.
 * Pour forcer l'invalidation lors d'un déploiement, incrémenter CACHE_VERSION.
 */

const CACHE_VERSION = 'v1';
const RUNTIME_CACHE = `mdl-runtime-${CACHE_VERSION}`;
const STATIC_CACHE = `mdl-static-${CACHE_VERSION}`;
const KNOWN_CACHES = [RUNTIME_CACHE, STATIC_CACHE];

// Ressources critiques précachées au moment de l'install
// (le détail des CSS/JS/fonts hashés est ajouté à la volée en SWR)
const PRECACHE_URLS = [
  '/',
  '/cartographies/',
  '/a-propos/',
  '/methodologie/',
  '/faq/',
  '/je-participe/',
  '/contact/',
  '/404.html',
  '/fonts/open-sans.woff2',
  '/fonts/poppins-600.woff2',
  '/favicon.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !KNOWN_CACHES.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1. On ne touche qu'aux GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 2. Ignorer cross-origin (Google Fonts résiduels, MViewer tiles distantes, etc.)
  if (url.origin !== self.location.origin) return;

  // 3. Ne pas intercepter MViewer (app séparée, cache propre)
  if (url.pathname.startsWith('/mviewer/')) return;

  // 4. Ne pas intercepter les URL avec query params (sitemap dynamique, etc.)
  //    sauf si c'est une vraie page filtrée — mais on préfère re-fetch dans ce cas
  if (url.search && !url.pathname.endsWith('/cartographies/')) return;

  // 5. HTML (pages) → network-first
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(networkFirst(req));
    return;
  }

  // 6. Assets statiques → stale-while-revalidate
  if (
    req.destination === 'style' ||
    req.destination === 'script' ||
    req.destination === 'font' ||
    req.destination === 'image' ||
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/fonts/')
  ) {
    event.respondWith(staleWhileRevalidate(req));
  }
});

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(req, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    const fallback = await caches.match('/404.html');
    return fallback ?? new Response('Hors-ligne', { status: 503, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  const networkUpdate = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => undefined);
  return cached ?? networkUpdate ?? new Response('', { status: 504 });
}
