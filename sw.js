// Minimal service worker. It exists only so Chrome offers "Install app".
// It caches nothing and stores nothing: every request goes straight to the network.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () {});
