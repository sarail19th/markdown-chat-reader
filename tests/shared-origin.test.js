// Apps on the same github.io address share one Cache Storage. This test makes sure an update of this app never
// touches a cache that belongs to another app, and that its own old cache is still cleaned up.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { ROOT } = require('./helpers');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.md': 'text/markdown', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

test('updating the service worker leaves other apps\' caches alone and removes only its own old one', async () => {
  let version = 'v1';
  const server = http.createServer((req, res) => {
    let file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (file.endsWith(path.sep)) file = path.join(file, 'index.html');
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    let body = fs.readFileSync(file);
    if (/\.(js|html)$/.test(file)) body = Buffer.from(body.toString().replace(/__VERSION__/g, version));
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();
  try {
    const page = await (await browser.newContext()).newPage();
    await page.goto(url);
    await page.evaluate(() => navigator.serviceWorker.ready);
    const names = () => page.evaluate(() => caches.keys().then((k) => k.sort()));
    assert.deepEqual(await names(), ['chat-reader-v1']);

    // Another app on the same address saves its own offline copy.
    await page.evaluate(() => caches.open('other-app-1').then((c) => c.put('/other/', new Response('x'))));

    // Ship "version 2" and let the browser find it.
    version = 'v2';
    await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg.update();
      await new Promise((res) => {
        const w = reg.installing || reg.waiting;
        if (!w || w.state === 'activated') return res();
        w.addEventListener('statechange', () => { if (w.state === 'activated') res(); });
      });
    });
    await page.waitForFunction(() => caches.keys().then((k) => k.includes('chat-reader-v2') && !k.includes('chat-reader-v1')));
    assert.deepEqual(await names(), ['chat-reader-v2', 'other-app-1'], 'the other app\'s cache must survive, our old one must go');
  } finally { await browser.close(); server.close(); }
});
