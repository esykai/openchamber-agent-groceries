// Sends a GIF to the running extension service and checks the clipboard.
// Run: node dev/gif-test.mjs [port] [token]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const port = process.argv[2] ?? '4319';
const token = process.argv[3] ?? 'test-token';
const file = path.join(here, 'poster-last.gif');
const gif = fs.readFileSync(file).toString('base64');
const id = Math.random().toString(16).slice(2, 18).padEnd(8, '0');

const call = async (route, body) => {
  const response = await fetch(`http://127.0.0.1:${port}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return { status: response.status, text: await response.text() };
};

console.log('begin', await call('/clipboard/begin', { id, kind: 'gif' }));
const CHUNK = 40_000;
for (let index = 0; index * CHUNK < gif.length; index += 1) {
  const answer = await call('/clipboard/chunk', { id, index, data: gif.slice(index * CHUNK, (index + 1) * CHUNK) });
  if (answer.status !== 200) {
    console.log('chunk failed', index, answer);
    process.exit(1);
  }
}
console.log('chunks', Math.ceil(gif.length / CHUNK));
console.log('finish', await call('/clipboard/finish', { id, kind: 'gif' }));

const check = spawnSync('powershell.exe', [
  '-STA', '-NoProfile', '-ExecutionPolicy', 'Bypass',
  '-Command',
  "Add-Type -AssemblyName System.Windows.Forms; if ([System.Windows.Forms.Clipboard]::ContainsFileDropList()) { 'CLIPBOARD_FILE ' + [System.Windows.Forms.Clipboard]::GetFileDropList()[0] } else { 'CLIPBOARD_EMPTY' }",
], { encoding: 'utf8' });
console.log(String(check.stdout).trim(), String(check.stderr).trim());
