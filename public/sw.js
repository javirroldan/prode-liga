const CACHE_NAME = "prode-liga-v2";
const ASSETS = ["/", "/manifest.webmanifest", "/icon-192x192.png", "/icon-512x512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isCacheable(response) {
  return (
    response &&
    response.status === 200 &&
    response.type === "basic" &&
    !response.redirected
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // POST/PUT/etc (Server Actions: pronósticos, resultados): pasan nativos,
  // sin pasar por el handler de caché.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Nunca cachear ni servir desde caché: APIs, cross-origin (Supabase) y
  // páginas de auth (el callback intercambia códigos y el login no debe
  // salir nunca de una copia cacheada).
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/")
  ) {
    return;
  }

  // Navegaciones (HTML): network-first. Caché solo como fallback offline.
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (isCacheable(response)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  // Resto (CSS/JS/imágenes/fuentes): cache-first + runtime caching.
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).then((response) => {
        if (isCacheable(response)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      });
    })
  );
});
