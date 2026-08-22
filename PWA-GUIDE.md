# Guía PWA — Cómo replicar la app instalable/offline en otro proyecto

Guía autocontenida basada en lo implementado en este repo (Buscador SKU). Sirve para cualquier
app web, sea monolítica o multi-archivo, con o sin build.

Una PWA son solo **4 piezas**:

1. `manifest.json` — identidad de la app
2. Meta tags en el `<head>` — soporte iOS
3. Registro del service worker — 3 líneas de JS
4. `service-worker.js` — la lógica de caché offline

---

## 1. manifest.json

Metadatos para que el navegador la trate como instalable: nombre, íconos, colores,
modo standalone (sin barra del navegador) y qué URL abre al tocarla.

```json
{
  "name": "Mi App",
  "short_name": "MiApp",
  "description": "Descripción corta",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f14",
  "theme_color": "#0f0f14",
  "orientation": "portrait-primary",
  "lang": "es",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

Notas:
- `start_url`: usar `"./index.html"` si es un sitio plano; `"/"` si es SPA con rutas.
- `short_name` es lo que se ve bajo el ícono en el home screen (ideal ≤ 12 caracteres).
- Los íconos deben ser PNG reales de 192×192 y 512×512. `"purpose": "any maskable"`
  permite que Android recorte el ícono en círculo sin perder contenido.
- Colores en hex **sin** transparencia.

---

## 2. Meta tags del `<head>`

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0f0f14">
<link rel="manifest" href="/manifest.json">

<!-- Solo necesarios para iPhone/Safari (Android usa el manifest) -->
<link rel="apple-touch-icon" href="/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="MiApp">
```

---

## 3. Registro del service worker

En el JS principal de la app (una sola vez):

```js
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}
```

Requisito duro: el service worker debe servirse por **HTTPS** o `localhost`.

---

## 4. service-worker.js

Este SW funciona para apps multi-archivo **sin necesidad de listar todos los archivos**:
precachea lo mínimo indispensable en `install`, y todo lo demás que la página pida
(CSS, JS, imágenes, fuentes) queda cacheado automáticamente al primer uso (*runtime caching*).

```js
const CACHE_NAME = 'mi-app-v1';
const ASSETS = [
  '/',              // o './index.html' según el caso
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Navegaciones (HTML): network-first.
  // Con internet siempre baja la versión nueva; la caché es solo fallback offline.
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      }).catch(() =>
        caches.match(req).then(cached => cached || caches.match(ASSETS[0]))
      )
    );
    return;
  }

  // Resto (CSS/JS/imágenes): cache-first + runtime caching.
  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      });
    })
  );
});
```

### Las tres estrategias, explicadas

| Evento | Qué hace | Por qué |
|---|---|---|
| `install` | Precachea `ASSETS` y llama `skipWaiting()` | La primera visita ya queda usable offline. `skipWaiting` activa el SW nuevo sin esperar que cierren todas las pestañas. |
| `activate` | Borra toda caché cuyo nombre ≠ `CACHE_NAME` | Invalida versiones viejas. |
| `fetch` | HTML: red primero. Resto: caché primero. | El HTML siempre fresco cuando hay internet; los estáticos responden al instante desde caché. |

---

## Adaptación a apps multi-archivo

- **Lista `ASSETS` mínima:** solo `index.html` (o `/`), manifest e íconos. Todo lo demás
  lo agarra el runtime cache a medida que se usa. No hace falta mantener una lista
  gigante de archivos.
- **Cuándo subir `CACHE_NAME`:** SIEMPRE que cambies algo visible del HTML/CSS/JS
  (ej: `v1` → `v2`). Sin esto los celulares siguen mostrando la versión vieja cacheada
  indefinidamente. Es el paso que más se olvida.
  - Excepción: si tu deploy genera nombres de archivo con hash (`app-a1b2c3.js`),
    cada deploy produce URLs nuevas → el runtime cache las baja solas y no hace falta
    bump manual (solo conviene subirlo igual de vez en cuando para purgar basura).
- **Apps con build (Vite / React / Vue):** los hashes cambian en cada build, así que
  mantener listas manuales no escala. Ahí conviene `vite-plugin-pwa` (Workbox), que
  genera un service worker con precache automático de todos los assets hasheados.
  Para sitios sin build (como este repo), el SW de arriba es suficiente.
- **APIs / Supabase:** este SW no cachea respuestas cross-origin (`type === 'basic'`
  filtra las opacas/CORS). Si querés cachear datos, guardalos aparte en localStorage
  como hace esta app.

---

## Checklist de verificación

1. Servir por HTTPS (o localhost) — sin esto nada funciona.
2. DevTools → Application → Manifest: sin errores, íconos visibles.
3. DevTools → Application → Service Workers: estado *activated and running*.
4. Probar offline: DevTools → Network → Offline → recargar → la app abre igual.
5. Instalar en Android: menú Chrome → "Instalar app" / "Agregar a pantalla principal".
6. En iOS: Safari → Compartir → "Agregar a pantalla principal".
7. Tras cambiar código: subir `CACHE_NAME`, deployar, abrir la app con internet y
   verificar en Application → Cache Storage que quedó la versión nueva.
