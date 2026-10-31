// Shared by the tests: the app's parser on its own, and a small local web server for the browser tests.
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(__dirname, 'fixtures');

// The parser sits between //#parser-start and //#parser-end in index.html, so it can be tested without a browser.
function loadParser() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const code = html.slice(html.indexOf('//#parser-start'), html.indexOf('//#parser-end'));
  return new Function(code + '\nreturn { parseChat };')();
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.md': 'text/markdown',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

// Serves the repository folder on a free port, like GitHub Pages does.
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (file.endsWith(path.sep)) file = path.join(file, 'index.html');
      if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ url: 'http://127.0.0.1:' + server.address().port + '/', close: () => server.close() }));
  });
}

module.exports = { loadParser, startServer, ROOT, FIXTURES };
