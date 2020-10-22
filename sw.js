self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open('3e-countdown').then(function(cache) {
            return cache.addAll([
                "favicon.ico",
                "android-chrome-192x192.png",
                "android-chrome-512x512.png",
                "index.html",
                "main.js",
                "ecountdown.js",
                "manifest.json",
                "dateutils.js",
                "sakuracss/sakura-dark-solarized.css",
                "styles.css",
                "sw.js"
            ]);
        })
    );
});

self.addEventListener('fetch', function(e) {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});