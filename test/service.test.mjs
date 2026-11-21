// Fixture-based tests for the local service: auth, range parsing, SQL
// projection, totals and the first upload validation step. The service is
// started from the built service/main.js, exactly as OpenChamber starts it.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';

const root = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const service = path.join(root, 'service', 'main.js');
const token = 'test-token';

const freePort = async () => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    server.close(() => resolve(port));
  });
});

const waitForHealth = async (port) => {
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (response.ok) return;
    } catch {
      // The service may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('service did not become healthy');
};

test('service auth, projected usage and upload validation', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'x5-service-test-'));
  const dbFile = path.join(dir, 'opencode.db');
  const db = new DatabaseSync(dbFile);
  db.exec(`
    create table session_message (
      id text primary key,
      session_id text not null,
      type text not null,
      time_created integer not null,
      data text not null
    );
    create table session_v2 (
      id text primary key,
      title text,
      parent_id text
    );
    create index session_message_time on session_message(type, time_created);
  `);
  db.prepare('insert into session_v2 (id, title, parent_id) values (?, ?, ?)').run('ses_a', 'Session A', null);
  const insert = db.prepare('insert into session_message (id, session_id, type, time_created, data) values (?, ?, ?, ?, ?)');
  const day = Date.UTC(2026, 10, 9, 12, 0, 0);
  insert.run('m1', 'ses_a', 'assistant', day, JSON.stringify({
    tokens: { input: 100, output: 20, reasoning: 30, cache: { read: 1_000, write: 5 } },
    cost: 0.01,
    model: { id: 'fixture/model' },
  }));
  insert.run('m2', 'ses_a', 'assistant', day + 1, JSON.stringify({
    tokens: { input: 200, output: 40, reasoning: 60, cache: { read: 2_000, write: 10 } },
    cost: 0.02,
    model: { id: 'fixture/model' },
  }));
  insert.run('m3', 'ses_a', 'user', day + 2, JSON.stringify({ tokens: { input: 999 } }));
  insert.run('m4', 'ses_a', 'assistant', day + 3, '{not json');
  db.close();

  const port = await freePort();
  const child = spawn(process.execPath, [service], {
    cwd: root,
    env: {
      ...process.env,
      OPENCODE_DB: dbFile,
      OPENCHAMBER_SERVICE_PORT: String(port),
      OPENCHAMBER_SERVICE_TOKEN: token,
    },
    stdio: 'ignore',
    windowsHide: true,
  });

  try {
    await waitForHealth(port);
    const unauthorized = await fetch(`http://127.0.0.1:${port}/usage?from=${day - 10_000}&to=${day + 10_000}`);
    assert.equal(unauthorized.status, 401);

    const authorized = await fetch(
      `http://127.0.0.1:${port}/usage?from=${day - 10_000}&to=${day + 10_000}&day=2026-11-09&tzOffset=0`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    assert.equal(authorized.status, 200);
    const answer = await authorized.json();
    assert.equal(answer.totals.eaten, 465);
    assert.equal(answer.totals.input, 300);
    assert.equal(answer.totals.output, 60);
    assert.equal(answer.totals.reasoning, 90);
    assert.equal(answer.totals.cacheWrite, 15);
    assert.equal(answer.totals.cacheRead, 3_000);
    assert.equal(answer.sessions[0].title, 'Session A');
    assert.equal(answer.sessions[0].model, 'fixture/model');

    const badChunk = await fetch(`http://127.0.0.1:${port}/clipboard/begin`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'bad-id' }),
    });
    assert.equal(badChunk.status, 400);
  } finally {
    child.kill();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
