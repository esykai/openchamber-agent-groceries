// service/main.ts
import { DatabaseSync } from "node:sqlite";
import { execFile } from "node:child_process";
import { randomUUID, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
var port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
var token = process.env.OPENCHAMBER_SERVICE_TOKEN ?? "";
if (!port || !token) {
  console.error("OPENCHAMBER_SERVICE_PORT and OPENCHAMBER_SERVICE_TOKEN are required");
  process.exit(1);
}
var DAY_MS = 864e5;
var MAX_SPAN_MS = 32 * DAY_MS;
var MIN_BOUND_MS = Date.UTC(2e3, 0, 1);
var SESSIONS_MAX = 8;
var BODY_MAX = 96 * 1024;
var UPLOAD_CHUNK_MAX = 42e3;
var UPLOAD_IMAGE_MAX = 48 * 1024 * 1024;
var UPLOAD_TTL_MS = 12e4;
var UPLOAD_MAX = 4;
var json = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
};
var num = (value) => typeof value === "number" && Number.isFinite(value) ? value : 0;
var candidates = () => {
  const list = [];
  const add = (value) => {
    if (!value) return;
    const resolved = path.resolve(value);
    if (!list.includes(resolved)) list.push(resolved);
  };
  const addDir = (dir) => {
    if (!dir) return;
    try {
      for (const name of fs.readdirSync(dir)) {
        if (/^opencode.*\.db$/.test(name)) add(path.join(dir, name));
      }
    } catch {
    }
  };
  add(process.env.OPENCODE_DB);
  const home = os.homedir();
  const xdg = process.env.XDG_DATA_HOME;
  if (xdg) add(path.join(xdg, "opencode", "opencode.db"));
  if (process.env.LOCALAPPDATA) add(path.join(process.env.LOCALAPPDATA, "opencode", "opencode.db"));
  add(path.join(home, ".local", "share", "opencode", "opencode.db"));
  if (process.env.APPDATA) add(path.join(process.env.APPDATA, "opencode", "opencode.db"));
  add(path.join(home, ".config", "opencode", "opencode.db"));
  add(path.join(home, "Library", "Application Support", "opencode", "opencode.db"));
  if (process.env.OPENCODE_DATA) add(process.env.OPENCODE_DATA);
  for (const dir of [
    xdg ? path.join(xdg, "opencode") : "",
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "opencode") : "",
    path.join(home, ".local", "share", "opencode"),
    process.env.APPDATA ? path.join(process.env.APPDATA, "opencode") : "",
    path.join(home, ".config", "opencode"),
    path.join(home, "Library", "Application Support", "opencode")
  ]) addDir(dir);
  return list;
};
var findDatabase = () => {
  const explicit = process.env.OPENCODE_DB;
  if (explicit) {
    try {
      const info = fs.statSync(explicit);
      if (info.isFile()) return path.resolve(explicit);
    } catch {
    }
  }
  const found = candidates().map((file) => {
    try {
      const info = fs.statSync(file);
      return info.isFile() ? { file, mtime: info.mtimeMs } : null;
    } catch {
      return null;
    }
  }).filter((entry) => entry !== null).sort((left, right) => right.mtime - left.mtime);
  return found[0]?.file ?? null;
};
var prettySource = (file) => {
  const home = os.homedir();
  return file.startsWith(home) ? `~${file.slice(home.length).replace(/\\/g, "/")}` : file;
};
var hasTable = (db, name) => {
  const row = db.prepare("select name from sqlite_master where type = 'table' and name = ?").get(name);
  return Boolean(row);
};
var readRange = (file, from, to, day, tzOffset) => {
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    try {
      db.exec("PRAGMA busy_timeout = 2500");
    } catch {
    }
    if (!hasTable(db, "session_message")) return { error: "unsupported-storage" };
    const withSessions = hasTable(db, "session_v2");
    const sql = withSessions ? `select m.session_id as sessionId,
                case when json_valid(m.data) then json_extract(m.data, '$.tokens') end as tokensJson,
                case when json_valid(m.data) then json_extract(m.data, '$.cost') end as cost,
                case when json_valid(m.data) then json_extract(m.data, '$.model.id') end as modelId,
                m.time_created as createdAt,
                s.title as title, s.parent_id as parentId
         from session_message m left join session_v2 s on s.id = m.session_id
         where m.type = 'assistant' and m.time_created >= ? and m.time_created < ?` : `select session_id as sessionId,
                case when json_valid(data) then json_extract(data, '$.tokens') end as tokensJson,
                case when json_valid(data) then json_extract(data, '$.cost') end as cost,
                case when json_valid(data) then json_extract(data, '$.model.id') end as modelId,
                time_created as createdAt,
                null as title, null as parentId
         from session_message
         where type = 'assistant' and time_created >= ? and time_created < ?`;
    const rows = db.prepare(sql).all(from, to);
    const totals = {
      eaten: 0,
      input: 0,
      output: 0,
      reasoning: 0,
      cacheRead: 0,
      cacheWrite: 0,
      cost: 0,
      turns: 0
    };
    const sessions = /* @__PURE__ */ new Map();
    const days = /* @__PURE__ */ new Map();
    const dayOf = (timestamp) => new Date(timestamp - tzOffset * 6e4).toISOString().slice(0, 10);
    let lastAt = null;
    for (const row of rows) {
      if (!row.tokensJson) continue;
      let usage;
      try {
        usage = JSON.parse(row.tokensJson);
      } catch {
        continue;
      }
      if (!usage || typeof usage !== "object") continue;
      const tokenValue = (value) => Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.trunc(num(value))));
      const input = tokenValue(usage.input);
      const output = tokenValue(usage.output);
      const reasoning = tokenValue(usage.reasoning);
      const cacheWrite = tokenValue(usage.cache?.write);
      const cacheRead = tokenValue(usage.cache?.read);
      const eaten = input + output + reasoning + cacheWrite;
      totals.input += input;
      totals.output += output;
      totals.reasoning += reasoning;
      totals.cacheWrite += cacheWrite;
      totals.cacheRead += cacheRead;
      totals.cost += num(row.cost);
      totals.turns += 1;
      const sessionId = row.sessionId;
      const current = sessions.get(sessionId) ?? {
        id: sessionId,
        title: row.title || sessionId,
        model: null,
        tokens: 0,
        input: 0,
        output: 0,
        turns: 0,
        updated: 0
      };
      current.tokens += eaten;
      current.input += input;
      current.output += output + reasoning + cacheWrite;
      current.turns += 1;
      current.updated = Math.max(current.updated, row.createdAt);
      if (row.modelId) current.model = row.modelId;
      if (row.title && current.title === sessionId) current.title = row.title;
      sessions.set(sessionId, current);
      const dateKey = dayOf(row.createdAt);
      const bucket = days.get(dateKey) ?? { date: dateKey, tokens: 0, input: 0, output: 0, turns: 0 };
      bucket.tokens += eaten;
      bucket.input += input;
      bucket.output += output + reasoning + cacheWrite;
      bucket.turns += 1;
      days.set(dateKey, bucket);
      if (lastAt === null || row.createdAt > lastAt) lastAt = row.createdAt;
    }
    totals.eaten = totals.input + totals.output + totals.reasoning + totals.cacheWrite;
    const startOfDay = new Date(from);
    const pad = (value) => String(value).padStart(2, "0");
    const fallback = `${startOfDay.getFullYear()}-${pad(startOfDay.getMonth() + 1)}-${pad(startOfDay.getDate())}`;
    return {
      date: day ?? fallback,
      source: prettySource(file),
      totals,
      sessions: [...sessions.values()].sort((left, right) => right.tokens - left.tokens).slice(0, SESSIONS_MAX),
      days: [...days.values()].sort((left, right) => left.date.localeCompare(right.date)),
      lastAt
    };
  } finally {
    db.close();
  }
};
var uploads = /* @__PURE__ */ new Map();
var pruneUploads = () => {
  const now = Date.now();
  for (const [id, upload] of uploads) {
    if (now - upload.at > UPLOAD_TTL_MS) uploads.delete(id);
  }
};
var readBody = (req) => new Promise((resolve, reject) => {
  let size = 0;
  const parts = [];
  req.on("data", (chunk) => {
    size += chunk.length;
    if (size > BODY_MAX) {
      reject(new Error("too-large"));
      req.destroy();
      return;
    }
    parts.push(chunk);
  });
  req.on("end", () => resolve(Buffer.concat(parts).toString("utf8")));
  req.on("error", reject);
});
var WINDOWS_SCRIPT = `param([Parameter(Mandatory=$true)][string]$Path)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Image]::FromFile($Path)
try {
  $copied = $false
  for ($attempt = 0; $attempt -lt 6 -and -not $copied; $attempt++) {
    try {
      [System.Windows.Forms.Clipboard]::SetImage($image)
      $copied = [System.Windows.Forms.Clipboard]::ContainsImage()
    } catch {
      Start-Sleep -Milliseconds 200
    }
  }
  if (-not $copied) { throw 'clipboard-unavailable' }
} finally {
  $image.Dispose()
}
`;
var run = (command, args, timeout = 2e4) => new Promise((resolve, reject) => {
  execFile(command, args, { timeout, windowsHide: true }, (error, _stdout, stderr) => {
    if (!error) {
      resolve();
      return;
    }
    const detail = String(stderr || "").trim();
    reject(new Error(detail || error.message));
  });
});
var powerShellCandidates = () => {
  const root = process.env.SystemRoot ?? process.env.windir ?? "C:\\Windows";
  return [
    path.join(root, "System32", "WindowsPowerShell", "v1.0", "powershell.exe"),
    "powershell.exe",
    "pwsh.exe"
  ];
};
var copyOnWindows = async (file) => {
  const script = path.join(os.tmpdir(), `x5-clip-${process.pid}-${randomUUID()}.ps1`);
  await fs.promises.writeFile(script, WINDOWS_SCRIPT, { encoding: "utf8", mode: 384 });
  const failures = [];
  try {
    for (const executable of powerShellCandidates()) {
      try {
        await run(executable, [
          "-STA",
          "-NoProfile",
          "-NonInteractive",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          script,
          "-Path",
          file
        ]);
        return;
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        failures.push(`${path.basename(executable)}: ${text}`);
      }
    }
  } finally {
    await fs.promises.rm(script, { force: true });
  }
  throw new Error(failures.join(" | ").slice(0, 300));
};
var copyImageToClipboard = async (file) => {
  if (process.platform === "win32") {
    await copyOnWindows(file);
    return;
  }
  if (process.platform === "darwin") {
    const escaped = file.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await run("osascript", ["-e", `set the clipboard to (read (POSIX file "${escaped}") as \xABclass PNGf\xBB)`]);
    return;
  }
  try {
    await run("sh", ["-c", 'wl-copy --type image/png < "$0"', file]);
    return;
  } catch {
    await run("xclip", ["-selection", "clipboard", "-t", "image/png", "-i", file]);
  }
};
var WINDOWS_GIF_SCRIPT = `param([string]$Path)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
$files = New-Object System.Collections.Specialized.StringCollection
[void]$files.Add($Path)
$copied = $false
for ($attempt = 0; $attempt -lt 6 -and -not $copied; $attempt++) {
  try {
    [System.Windows.Forms.Clipboard]::SetFileDropList($files)
    $copied = [System.Windows.Forms.Clipboard]::ContainsFileDropList()
  } catch {
    Start-Sleep -Milliseconds 200
  }
}
if (-not $copied) { throw 'clipboard-unavailable' }
`;
var copyGifToClipboard = async (file) => {
  if (process.platform === "win32") {
    const script = path.join(os.tmpdir(), `x5-gif-clip-${process.pid}-${randomUUID()}.ps1`);
    await fs.promises.writeFile(script, WINDOWS_GIF_SCRIPT, { encoding: "utf8", mode: 384 });
    const failures = [];
    try {
      for (const executable of powerShellCandidates()) {
        try {
          await run(executable, [
            "-STA",
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            script,
            "-Path",
            file
          ]);
          return;
        } catch (error) {
          const text = error instanceof Error ? error.message : String(error);
          failures.push(`${path.basename(executable)}: ${text}`);
        }
      }
    } finally {
      await fs.promises.rm(script, { force: true });
    }
    throw new Error(failures.join(" | ").slice(0, 300));
  }
  if (process.platform === "darwin") {
    const escaped = file.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await run("osascript", ["-e", `set the clipboard to (POSIX file "${escaped}")`]);
    return;
  }
  try {
    await run("xclip", ["-selection", "clipboard", "-t", "image/gif", "-i", file]);
    return;
  } catch {
    await run("sh", ["-c", 'printf "%s" "$1" | xclip -selection clipboard -t text/uri-list', "sh", pathToFileURL(file).toString()]);
  }
};
var finishUpload = async (id, kindHint) => {
  const upload = uploads.get(id);
  uploads.delete(id);
  if (!upload) return { error: "upload-missing" };
  const kind = upload.kind ?? kindHint;
  const ordered = [...upload.chunks.entries()].sort((left, right) => left[0] - right[0]);
  for (let index = 0; index < ordered.length; index += 1) {
    if (ordered[index]?.[0] !== index) return { error: "upload-gap" };
  }
  const encoded = ordered.map((entry) => entry[1]).join("");
  if (!encoded || !/^[A-Za-z0-9+/=]+$/.test(encoded)) return { error: "upload-bad" };
  let bytes;
  try {
    bytes = Buffer.from(encoded, "base64");
  } catch {
    return { error: "upload-bad" };
  }
  if (kind === "gif") {
    const header = bytes.subarray(0, 6).toString("ascii");
    if (bytes.length < 8 || header !== "GIF89a" && header !== "GIF87a") return { error: "not-an-image" };
    if (bytes.length > UPLOAD_IMAGE_MAX) return { error: "too-large" };
    const dir = path.join(os.tmpdir(), "openchamber-x5");
    await fs.promises.mkdir(dir, { recursive: true, mode: 448 });
    await fs.promises.chmod(dir, 448).catch(() => void 0);
    try {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1e3;
      const entries = await fs.promises.readdir(dir);
      await Promise.all(entries.filter((name) => name.endsWith(".gif")).map(async (name) => {
        const full = path.join(dir, name);
        const stat = await fs.promises.stat(full).catch(() => null);
        if (stat && stat.mtimeMs < cutoff) await fs.promises.rm(full, { force: true }).catch(() => void 0);
      }));
    } catch {
    }
    const file2 = path.join(dir, `x5-card-${process.pid}-${Date.now()}-${randomUUID()}.gif`);
    await fs.promises.writeFile(file2, bytes, { mode: 384 });
    try {
      await copyGifToClipboard(file2);
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const detail = /clipboard-unavailable/i.test(message) ? "clipboard-busy" : /ENOENT|not recognized|not found|не удается найти|не является/i.test(message) ? "no-powershell" : message.slice(0, 200);
      return { error: "clipboard-failed", detail };
    }
  }
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 8 || !bytes.subarray(0, 8).equals(signature)) return { error: "not-an-image" };
  if (bytes.length > UPLOAD_IMAGE_MAX) return { error: "too-large" };
  const file = path.join(os.tmpdir(), `x5-poster-${process.pid}-${Date.now()}-${randomUUID()}.png`);
  await fs.promises.writeFile(file, bytes, { mode: 384 });
  try {
    await copyImageToClipboard(file);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const detail = /clipboard-unavailable/i.test(message) ? "clipboard-busy" : /ENOENT|not recognized|not found|не удается найти|не является/i.test(message) ? "no-powershell" : message.slice(0, 200);
    return { error: "clipboard-failed", detail };
  } finally {
    await fs.promises.rm(file, { force: true });
  }
};
var handleClipboard = async (req, res, pathname) => {
  let body;
  try {
    const raw = await readBody(req);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("bad");
    body = parsed;
  } catch {
    json(res, 400, { error: "bad-request" });
    return;
  }
  if (pathname === "/clipboard/begin") {
    pruneUploads();
    const id = typeof body.id === "string" ? body.id : "";
    if (!/^[a-z0-9]{8,32}$/.test(id)) {
      json(res, 400, { error: "bad-id" });
      return;
    }
    if (uploads.size >= UPLOAD_MAX) {
      json(res, 429, { error: "busy" });
      return;
    }
    const kind = body.kind === "gif" ? "gif" : "png";
    uploads.set(id, { chunks: /* @__PURE__ */ new Map(), size: 0, at: Date.now(), kind });
    json(res, 200, { ok: true });
    return;
  }
  if (pathname === "/clipboard/chunk") {
    const id = typeof body.id === "string" ? body.id : "";
    const index = typeof body.index === "number" ? body.index : -1;
    const data = typeof body.data === "string" ? body.data : "";
    const upload = uploads.get(id);
    if (!upload) {
      json(res, 404, { error: "upload-missing" });
      return;
    }
    if (!Number.isInteger(index) || index < 0 || index > 2047 || !data || data.length > UPLOAD_CHUNK_MAX) {
      json(res, 400, { error: "bad-chunk" });
      return;
    }
    upload.size += data.length;
    upload.at = Date.now();
    if (upload.size > UPLOAD_IMAGE_MAX * 2) {
      uploads.delete(id);
      json(res, 413, { error: "too-large" });
      return;
    }
    upload.chunks.set(index, data);
    json(res, 200, { ok: true });
    return;
  }
  if (pathname === "/clipboard/finish") {
    const id = typeof body.id === "string" ? body.id : "";
    const kind = body.kind === "gif" ? "gif" : "png";
    const answer = await finishUpload(id, kind);
    if ("ok" in answer) json(res, 200, answer);
    else json(res, 422, answer);
    return;
  }
  json(res, 404, { error: "not-found" });
};
var parseBound = (value) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= MIN_BOUND_MS ? parsed : null;
};
var SERVICE_VERSION = "1.13.1";
var server = http.createServer((req, res) => {
  const expected = Buffer.from(`Bearer ${token}`);
  const actual = Buffer.from(req.headers.authorization ?? "");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    json(res, 401, { error: "unauthorized" });
    return;
  }
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (url.pathname === "/health") {
    json(res, 200, { ok: true, version: SERVICE_VERSION, clipboard: true });
    return;
  }
  if (req.method === "POST" && url.pathname.startsWith("/clipboard/")) {
    void handleClipboard(req, res, url.pathname).catch((error) => {
      if (!res.headersSent) {
        json(res, 500, { error: "clipboard-failed", detail: String(error).slice(0, 200) });
      } else {
        res.destroy();
      }
    });
    return;
  }
  if (req.method !== "GET" || url.pathname !== "/usage") {
    json(res, 404, { error: "not-found" });
    return;
  }
  const from = parseBound(url.searchParams.get("from"));
  const to = parseBound(url.searchParams.get("to"));
  if (from === null || to === null || to <= from || to - from > MAX_SPAN_MS) {
    json(res, 400, { error: "bad-request" });
    return;
  }
  const dayParam = url.searchParams.get("day");
  const day = dayParam && /^\d{4}-\d{2}-\d{2}$/.test(dayParam) ? dayParam : null;
  const tzRaw = Number(url.searchParams.get("tzOffset") ?? "0");
  const tzOffset = Number.isFinite(tzRaw) ? Math.max(-840, Math.min(840, Math.round(tzRaw))) : 0;
  const file = findDatabase();
  if (!file) {
    json(res, 422, { error: "no-db", detail: candidates().join("\n") });
    return;
  }
  try {
    const answer = readRange(file, from, to, day, tzOffset);
    if ("error" in answer) {
      json(res, 422, answer);
      return;
    }
    json(res, 200, answer);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    json(res, 500, { error: "db-failed", detail: message.slice(0, 300) });
  }
});
server.listen(port, "127.0.0.1");
