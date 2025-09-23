// Lightweight static server for local preview
const http = require('http');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 3000;
const root = __dirname;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURI(req.url.split('?')[0]);
  const safeSuffix = urlPath.replace(/\..\/|\/~|\/\//g, '');
  let filePath = path.join(root, safeSuffix);

  // Simple API endpoints for local/dev
  if (urlPath === '/api/waitlist' && req.method === 'GET') {
    fetch('https://join-waitlist-counter.vercel.app/api/waitlist', { method: 'GET' })
      .then((r) => r.json())
      .then((data) => {
        const body = JSON.stringify({ displayCount: data.displayCount, serverTs: data.serverTs });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(body);
      })
      .catch(() => {
        res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'upstream error' }));
      });
    return;
  }

  if (urlPath === '/api/join-success' && req.method === 'POST') {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'ADMIN_TOKEN missing' }));
      return;
    }
    const payload = JSON.stringify({ reason: 'join_waitlist_success' });
    fetch('https://join-waitlist-counter.vercel.app/api/waitlist/manual-increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
      body: payload
    })
      .then((r) => {
        if (!r.ok) throw new Error('upstream failed');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
      })
      .catch(() => {
        res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false }));
      });
    return;
  }

  if (urlPath === '/' || !path.extname(filePath)) {
    filePath = path.join(root, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Local preview on http://localhost:${port}`);
});


