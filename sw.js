// Offline support. This caches only the app's own files (page, icons, libraries).
// Chats are never fetched or cached: files you open are read inside the page. The one exception is a file shared
// to the app from Android's Share menu: it is held in memory for a moment, handed to the page, and then dropped.
const VERSION = '__VERSION__';
const CACHE = 'chat-reader-' + VERSION;
const FILES = [
  './', './index.html', './manifest.webmanifest', './sample.md', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png',
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

// Files shared to the app (Android Share menu -> Chat Reader) wait here, in memory only, until the page collects them.
let shared = [];
let sharedAt = 0;

self.addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'take-shared' || !e.source) return;
  const files = Date.now() - sharedAt < 60000 ? shared : [];
  shared = [];
  e.source.postMessage({ type: 'shared', files });
});

async function receiveShare(req) {
  try {
    const form = await req.formData();
    shared = form.getAll('files').filter((f) => typeof f !== 'string');
    sharedAt = Date.now();
  } catch (err) {
    shared = [];
  }
  return Response.redirect(new URL('./?shared=1', self.registration.scope).href, 303);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method === 'POST' && new URL(req.url).pathname.endsWith('/share-target')) {
    e.respondWith(receiveShare(req));
    return;
  }
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;

  const guide = new URL(req.url).pathname.endsWith('/sample.md');
  if (req.mode === 'navigate' || guide) {
    // The page and the guide chat: online, always get the newest copy. Offline or slow (4 s): use the saved copy.
    // no-cache: always check with the server, so GitHub Pages' short HTTP cache cannot serve an old one.
    const key = guide ? req : './index.html';
    const net = fetch(req, { cache: 'no-cache' }).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); }
      return res;
    });
    const timeout = new Promise((_, reject) => setTimeout(reject, 4000));
    e.respondWith(
      Promise.race([net, timeout]).catch(() =>
        caches.match(key).then((r) => r || (guide ? null : caches.match('./'))).then((r) => r || net)
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
