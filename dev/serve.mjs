// Minimal static server for the preview harness: no dependencies, no caching.
// It also plays the extension service for the clipboard endpoints, so the
// "copy image" button can be tested end to end: the poster is saved to
// dev/poster-last.png and, on Windows, put on the real clipboard.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const port = Number(process.env.PORT ?? 4317);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
};

const uploads = new Map();

const json = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

const readJson = (req) => new Promise((resolve, reject) => {
  let size = 0;
  const parts = [];
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > 200_000) {
      reject(new Error('too large'));
      req.destroy();
      return;
    }
    parts.push(chunk);
  });
  req.on('end', () => {
    try {
      resolve(JSON.parse(Buffer.concat(parts).toString('utf8') || '{}'));
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});

const copyImageToClipboard = (file) => new Promise((resolve, reject) => {
  if (process.platform !== 'win32') {
    resolve();
    return;
  }
  const script = path.join(os.tmpdir(), `x5-dev-clip-${process.pid}.ps1`);
  const body = `param([Parameter(Mandatory=$true)][string]$Path)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Image]::FromFile($Path)
try { [System.Windows.Forms.Clipboard]::SetImage($image) } finally { $image.Dispose() }
`;
  fs.writeFileSync(script, body, 'utf8');
  const child = spawn('powershell.exe', ['-STA', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-Path', file], {
    windowsHide: true,
  });
  const timer = setTimeout(() => {
    child.kill();
    reject(new Error('clipboard timeout'));
  }, 15_000);
  child.on('error', (error) => {
    clearTimeout(timer);
    reject(error);
  });
  child.on('exit', (code) => {
    clearTimeout(timer);
    fs.rmSync(script, { force: true });
    if (code === 0) resolve();
    else reject(new Error(`powershell exited ${code}`));
  });
});

const copyGifToClipboard = (file) => new Promise((resolve, reject) => {
  if (process.platform !== 'win32') {
    resolve();
    return;
  }
  const script = path.join(os.tmpdir(), `x5-dev-gif-${process.pid}.ps1`);
  const body = `param([Parameter(Mandatory=$true)][string]$Path)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
$files = New-Object System.Collections.Specialized.StringCollection
[void]$files.Add($Path)
[System.Windows.Forms.Clipboard]::SetFileDropList($files)
if (-not [System.Windows.Forms.Clipboard]::ContainsFileDropList()) { throw 'clipboard-unavailable' }
`;
  fs.writeFileSync(script, body, 'utf8');
  const child = spawn('powershell.exe', ['-STA', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-Path', file], {
    windowsHide: true,
  });
  const timer = setTimeout(() => {
    child.kill();
    reject(new Error('clipboard timeout'));
  }, 15_000);
  child.on('error', (error) => {
    clearTimeout(timer);
    reject(error);
  });
  child.on('exit', (code) => {
    clearTimeout(timer);
    fs.rmSync(script, { force: true });
    if (code === 0) resolve();
    else reject(new Error(`powershell exited ${code}`));
  });
});

const handleClipboard = async (req, res, pathname) => {
  let body;
  try {
    body = await readJson(req);
  } catch {
    json(res, 400, { error: 'bad-request' });
    return;
  }

  if (pathname === '/dev/clipboard/begin') {
    if (typeof body.id !== 'string' || !/^[a-z0-9]{8,32}$/.test(body.id)) {
      json(res, 400, { error: 'bad-id' });
      return;
    }
    uploads.set(body.id, { chunks: new Map(), at: Date.now(), kind: body.kind === 'gif' ? 'gif' : 'png' });
    json(res, 200, { ok: true });
    return;
  }

  if (pathname === '/dev/clipboard/chunk') {
    const upload = uploads.get(body.id);
    if (!upload) {
      json(res, 404, { error: 'upload-missing' });
      return;
    }
    if (typeof body.index !== 'number' || typeof body.data !== 'string' || body.data.length > 42_000) {
      json(res, 400, { error: 'bad-chunk' });
      return;
    }
    upload.chunks.set(body.index, body.data);
    upload.at = Date.now();
    json(res, 200, { ok: true });
    return;
  }

  if (pathname === '/dev/clipboard/finish') {
    const upload = uploads.get(body.id);
    uploads.delete(body.id);
    if (!upload) {
      json(res, 404, { error: 'upload-missing' });
      return;
    }
    const ordered = [...upload.chunks.entries()].sort((a, b) => a[0] - b[0]);
    const base64 = ordered.map((entry) => entry[1]).join('');
    const bytes = Buffer.from(base64, 'base64');
    const kind = upload.kind === 'gif' ? 'gif' : 'png';
    const file = path.join(here, kind === 'gif' ? 'poster-last.gif' : 'poster-last.png');
    fs.writeFileSync(file, bytes);
    try {
      await (kind === 'gif' ? copyGifToClipboard(file) : copyImageToClipboard(file));
      json(res, 200, { ok: true, kind, bytes: bytes.length });
    } catch (error) {
      json(res, 500, { error: 'clipboard-failed', detail: String(error) });
    }
    return;
  }

  json(res, 404, { error: 'not-found' });
};

http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');

  if (req.method === 'POST' && url.pathname.startsWith('/dev/clipboard/')) {
    void handleClipboard(req, res, url.pathname);
    return;
  }

  let relative;
  try {
    relative = decodeURIComponent(url.pathname === '/' ? '/dev/preview.html' : url.pathname);
  } catch {
    res.writeHead(400).end('bad path');
    return;
  }
  const file = path.resolve(root, `.${relative}`);
  const withinRoot = path.relative(root, file);
  if (withinRoot.startsWith('..') || path.isAbsolute(withinRoot)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`preview: http://127.0.0.1:${port}/dev/preview.html`);
});
