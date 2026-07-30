/**
 * Service Worker do ClashScout.
 *
 * Estrategia deliberadamente simples porque quase todo fetch de dado
 * acontece no servidor (Server Components / Server Actions) - o service
 * worker so ve navegacao e assets estaticos, nunca a API da Supercell/NestJS.
 *
 * - Navegacao: network-first, cai para /offline quando a rede falha.
 * - Assets estaticos (build do Next, icones, manifest): cache-first, porque
 *   os arquivos de /_next/static/ tem hash no nome - o conteudo nunca muda
 *   sob a mesma URL, entao cachear para sempre e seguro.
 * - Push e clique em notificacao: ver os listeners no fim do arquivo.
 *
 * Subir o numero da versao invalida os caches antigos no proximo `activate`.
 */
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `clashscout-static-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
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
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached ?? Response.error()),
      ),
    );
    return;
  }

  const isCacheableStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest';

  if (isCacheableStaticAsset) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }

        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      }),
    );
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  /** @type {{ title: string, body?: string, url?: string, tag?: string }} */
  const payload = event.data.json();

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: payload.tag,
      data: { url: payload.url ?? '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
          client.focus();
          return client.navigate ? client.navigate(targetUrl) : undefined;
        }
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});
