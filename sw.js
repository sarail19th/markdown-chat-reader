// Offline support. This caches only the app's own files (page, icons, libraries).
// Chats never pass through here: files you open are read inside the page and are never fetched or cached.
const VERSION = '__VERSION__';
const CACHE = 'chat-reader-' + VERSION;
const FILES = [
  './', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './vendor/marked.min.js', './vendor/purify.min.js',
  './fonts/figtree-latin-wght-normal.woff2', './fonts/jetbrains-mono-latin-wght-normal.woff2'
];

self.addEventListener('install', (e) => {
  // cache: 'reload' skips the host's HTTP cache so a new version never saves stale copies of its own files.
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(FILES.map((u) => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('chat-reader-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate') {
    // Online: always get the newest page. Offline or slow (4 s): use the saved copy.
    // no-cache: always check with the server, so GitHub Pages' short HTTP cache cannot serve an old page.
    const net = fetch(req, { cache: 'no-cache' }).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); }
      return res;
    });
    const timeout = new Promise((_, reject) => setTimeout(reject, 4000));
    e.respondWith(
      Promise.race([net, timeout]).catch(() =>
        caches.match('./index.html').then((r) => r || caches.match('./')).then((r) => r || net)
      )
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
