// Sends dev/poster-last.png to the running extension service in chunks, then
// checks the Windows clipboard. Run: node dev/clip-test.mjs [port] [token]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const port = process.argv[2] ?? '4319';
const token = process.argv[3] ?? 'test-token';
const file = path.join(here, 'poster-last.png');
const png = fs.readFileSync(file).toString('base64');
const id = Math.random().toString(16).slice(2, 18).padEnd(8, '0');

const call = async (route, body) => {
  const response = await fetch(`http://127.0.0.1:${port}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return { status: response.status, text: await response.text() };
};

console.log('begin', await call('/clipboard/begin', { id }));
const CHUNK = 40_000;
for (let index = 0; index * CHUNK < png.length; index += 1) {
  const answer = await call('/clipboard/chunk', { id, index, data: png.slice(index * CHUNK, (index + 1) * CHUNK) });
  if (answer.status !== 200) {
    console.log('chunk failed', index, answer);
    process.exit(1);
  }
}
console.log('chunks', Math.ceil(png.length / CHUNK));
console.log('finish', await call('/clipboard/finish', { id }));

const check = spawnSync('powershell.exe', [
  '-STA', '-NoProfile', '-ExecutionPolicy', 'Bypass',
  '-Command',
  "Add-Type -AssemblyName System.Windows.Forms; if ([System.Windows.Forms.Clipboard]::ContainsImage()) { $i=[System.Windows.Forms.Clipboard]::GetImage(); 'CLIPBOARD_IMAGE ' + $i.Width + 'x' + $i.Height } else { 'CLIPBOARD_EMPTY' }",
], { encoding: 'utf8' });
console.log(String(check.stdout).trim(), String(check.stderr).trim());
