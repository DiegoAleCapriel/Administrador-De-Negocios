self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        "/",
        "../index.html",
        "../styles/styles.css",
        "./script.js",
        "./almacenamientoInterno.js",
        "./configuracionDeSistema.js",
        "../image/icono-192x192.png",
        "../image/icono-512x512.png",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
