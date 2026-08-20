/* Vehicle Dossier - service worker
   Caches only the static app shell (this HTML file, the manifest, the
   icons) so the app opens instantly and works offline after first load.

   It deliberately does NOT cache:
   - Any cross-origin request (Nominatim reverse-geocoding, Open-Meteo,
     OSM map tiles) - those are live location lookups and must always
     hit the network fresh, or fail cleanly when offline. Caching them
     would risk stamping yesterday's address on today's photo.
   - Anything the app writes itself (captured photos, form data) - that
     already lives in IndexedDB, which this file never touches.

   Bump CACHE_VERSION on every deploy so returning users pick up the
   new files instead of a stale cached copy. */

var CACHE_VERSION = "v2";
var CACHE_NAME = "vehicle-dossier-" + CACHE_VERSION;

var APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_SHELL);
      })
      .catch(function () {
        /* Even if pre-caching one file fails (e.g. offline on first
           install), don't block installation - the fetch handler below
           will still cache pages as they're successfully loaded. */
      }),
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key.indexOf("vehicle-dossier-") === 0 && key !== CACHE_NAME;
            })
            .map(function (key) {
              return caches.delete(key);
            }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

/* Lets the page force this new worker to take over immediately instead
   of waiting for every tab to close, so the "update available" prompt
   in the page can apply the update on a single tap. */
self.addEventListener("message", function (event) {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", function (event) {
  var req = event.request;

  // Only handle same-origin GET requests. Everything else (location
  // lookups, map tiles, cross-origin anything, non-GET) passes straight
  // through to the network untouched.
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(req).then(function (cached) {
        var network = fetch(req)
          .then(function (response) {
            if (response && response.ok) {
              cache.put(req, response.clone());
            }
            return response;
          })
          .catch(function () {
            return cached; // offline and nothing new - fall back below anyway
          });
        // Stale-while-revalidate: serve the cached shell instantly if we
        // have it, refresh the cache in the background either way.
        return cached || network;
      });
    }),
  );
});
