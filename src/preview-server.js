import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, '..');
const previewRoot = path.join(root, 'preview');
const assetsRoot = path.join(root, 'assets');
const port = Number(process.env.PREVIEW_PORT || process.env.PORT || 3000);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function safePath(base, urlPath) {
  const cleaned = decodeURIComponent(urlPath).replace(/^\/+/, '');
  const full = path.resolve(base, cleaned);
  if (!full.startsWith(path.resolve(base))) return null;
  return full;
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/' || url.pathname === '/preview' || url.pathname === '/preview/') {
      const data = await fs.readFile(path.join(previewRoot, 'index.html'));
      res.writeHead(200, { 'content-type': types['.html'] });
      return res.end(data);
    }

    let base;
    let rel;
    if (url.pathname.startsWith('/preview/')) {
      base = previewRoot;
      rel = url.pathname.slice('/preview/'.length);
    } else if (url.pathname.startsWith('/assets/')) {
      base = assetsRoot;
      rel = url.pathname.slice('/assets/'.length);
    } else {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }

    const file = safePath(base, rel);
    if (!file) throw new Error('Invalid path');
    const data = await fs.readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  } catch (error) {
    res.writeHead(error?.code === 'ENOENT' ? 404 : 500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(error?.code === 'ENOENT' ? 'Not found' : 'Preview server error');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`[preview] Cage & Key disponible sur http://localhost:${port}/preview`);
});
