// Development harness, not part of the extension: mounts the real status and
// panel pages in iframes and plays the host side of the SDK bridge, so the
// card can be looked at in both themes without installing anything.
import { fixtureUsage } from './fixture';
import { CARD_CSS, mountCard } from '../src/card';
import { isProductId, periodUnit } from '../src/core';
import { setLang } from '../src/lang';

const CHANNEL = 'openchamber.sdk';
const VERSION = 1;

const cardStyle = document.createElement('style');
cardStyle.textContent = CARD_CSS;
document.head.append(cardStyle);

const LIGHT = {
  background: '#ffffff', elevated: '#ffffff', foreground: '#171717', muted: '#737373',
  subtle: '#f5f5f5', border: '#e5e5e5', hover: '#f5f5f5', selection: '#dbeafe',
  focus: '#3b82f6', primary: '#171717', mutedSurface: '#f5f5f5', elevatedForeground: '#171717',
  active: '#e5e5e5', selectionForeground: '#171717', primaryForeground: '#fafafa',
  primaryText: '#171717', successText: '#15803d', warningText: '#b45309',
  errorText: '#b91c1c', infoText: '#1d4ed8', success: '#16a34a', warning: '#d97706',
  error: '#dc2626', info: '#2563eb',
  font: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: 'ui-monospace, "Cascadia Code", Consolas, monospace',
  radius: '10px',
};

const DARK = {
  background: '#1a1a1a', elevated: '#242424', foreground: '#f5f5f5', muted: '#a3a3a3',
  subtle: '#2e2e2e', border: '#383838', hover: '#303030', selection: '#1e3a5f',
  focus: '#60a5fa', primary: '#fafafa', mutedSurface: '#2e2e2e', elevatedForeground: '#f5f5f5',
  active: '#3a3a3a', selectionForeground: '#f5f5f5', primaryForeground: '#171717',
  primaryText: '#f5f5f5', successText: '#4ade80', warningText: '#fbbf24',
  errorText: '#f87171', infoText: '#60a5fa', success: '#22c55e', warning: '#f59e0b',
  error: '#ef4444', info: '#3b82f6',
  font: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: 'ui-monospace, "Cascadia Code", Consolas, monospace',
  radius: '10px',
};

type Theme = 'light' | 'dark';
type Surface = 'status' | 'panel';
type Registry = {
  frame: HTMLIFrameElement;
  theme: Theme;
  surface: Surface;
  usage: ReturnType<typeof fixtureUsage>;
  storage: Map<string, unknown>;
  controls?: HTMLElement;
};

const registry: Registry[] = [];
const params = new URLSearchParams(location.search);
const requestedTheme = params.get('theme') as Theme | null;
const requestedSurface = params.get('surface') as Surface | null;

const tokensParam = params.get('tokens');
const tokensOverride = tokensParam === null ? Number.NaN : Number(tokensParam);
const langParam = params.get('lang');
const previewLang = langParam === 'en' ? 'en' : 'ru';
const usage = fixtureUsage(previewLang);
if (Number.isFinite(tokensOverride) && tokensOverride >= 0) usage.totals.eaten = tokensOverride;

const productParam = params.get('product');
const budgetParam = Number(params.get('budget'));
const periodParam = params.get('period');
const nameParam = params.get('name');
setLang(previewLang);
const seededPrefs = {
  productId: isProductId(productParam) ? productParam : ('grechka' as const),
  budget: Number.isFinite(budgetParam) && budgetParam > 0 ? budgetParam : 2_000_000,
  period: periodParam === 'week' || periodParam === 'month' ? periodParam : 'day',
  lang: previewLang,
  customName: nameParam ? nameParam.slice(0, 28) : '',
} as const;

const post = (entry: Registry, message: unknown): void => {
  entry.frame.contentWindow?.postMessage(message, '*');
};

/** The dev server implements the service's clipboard endpoints and saves the PNG. */
const forwardClipboard = async (payload: { path: string; body?: string }): Promise<{ status: number; body: string }> => {
  const response = await fetch(`/dev${payload.path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload.body ?? '{}',
  });
  return { status: response.status, body: await response.text() };
};

const reply = (entry: Registry, id: string | undefined, payload?: unknown): void => {
  if (!id) return;
  post(entry, { channel: CHANNEL, v: VERSION, type: 'result', id, ok: true, payload });
};

const showToast = (message: string, kind: 'info' | 'success' | 'error' = 'info'): void => {
  const host = document.querySelector('#toasts');
  if (!host) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.dataset.tone = kind;
  toast.textContent = message;
  host.append(toast);
  setTimeout(() => toast.remove(), 3200);
};

const showCompose = (text: string): void => {
  const box = document.querySelector<HTMLElement>('#composer');
  if (!box) return;
  box.textContent = text;
  box.hidden = false;
};

const renderControls = (entry: Registry, controls: Array<Record<string, unknown>>): void => {
  const bar = entry.controls;
  if (!bar) return;
  bar.replaceChildren();
  for (const control of controls) {
    if (control.kind === 'select') {
      const select = document.createElement('select');
      select.className = 'ctl';
      select.setAttribute('aria-label', String(control.label));
      for (const option of control.options as Array<{ value: string; label: string }>) {
        const el = document.createElement('option');
        el.value = option.value;
        el.textContent = option.label;
        select.append(el);
      }
      select.value = String(control.value);
      select.addEventListener('change', () => post(entry, {
        channel: CHANNEL, v: VERSION, type: 'status-control-event', payload: { id: control.id, value: select.value },
      }));
      bar.append(select);
    } else {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ctl';
      button.textContent = String(control.label);
      button.disabled = Boolean(control.disabled);
      button.addEventListener('click', () => post(entry, {
        channel: CHANNEL, v: VERSION, type: 'status-control-event', payload: { id: control.id },
      }));
      bar.append(button);
    }
  }
};

const readyPayload = (entry: Registry) => ({
  theme: { mode: entry.theme, tokens: entry.theme === 'dark' ? DARK : LIGHT },
  locale: 'ru-RU',
  directory: 'C:\\workspace\\openchamber',
  session: {
    id: 'ses_fixture_3',
    title: 'OpenChamber widget по образцу x5-club-widget',
    busy: false,
    model: 'deepseek-v4.1-flash',
    agent: 'build',
  },
  surface: entry.surface,
  connection: { connected: false, account: '' },
  settings: {},
  item: null,
  features: { deviceStorage: true, statusControls: true, popovers: true },
});

const log = (line: string): void => {
  const host = document.querySelector('#log');
  if (!host) return;
  const entry = document.createElement('div');
  entry.textContent = line;
  host.append(entry);
  if (host.childElementCount > 40) host.firstElementChild?.remove();
};

/** Period totals must be the sum of the days the panel asked for. */
const scopedUsage = (
  usage: Registry['usage'],
  query: Record<string, string> | undefined,
): Registry['usage'] => {
  const from = Number(query?.from);
  const to = Number(query?.to);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return usage;
  const days = usage.days ?? [];
  const span = Math.max(1, Math.round((to - from) / 86_400_000));
  const slice = days.slice(-span);
  if (slice.length === 0) return usage;
  const sum = (key: 'tokens' | 'input' | 'output' | 'turns'): number =>
    slice.reduce((total, day) => total + day[key], 0);
  const eaten = sum('tokens');
  const input = sum('input');
  const output = sum('output');
  const turns = sum('turns');
  const scale = (target: number, base: number): number => (base > 0 ? target / base : 1);
  const byTokens = scale(eaten, usage.totals.eaten);
  const byInput = scale(input, usage.totals.input);
  const byOutput = scale(output, usage.totals.output);
  const byTurns = scale(turns, usage.totals.turns);
  return {
    ...usage,
    days: slice,
    sessions: usage.sessions.map((session) => ({
      ...session,
      tokens: Math.round(session.tokens * byTokens),
      input: Math.round((session.input ?? 0) * byInput),
      output: Math.round((session.output ?? 0) * byOutput),
      turns: Math.max(1, Math.round(session.turns * byTurns)),
    })),
    totals: {
      ...usage.totals,
      eaten,
      input,
      output,
      reasoning: 0,
      cacheRead: 0,
      cacheWrite: 0,
      turns,
    },
  };
};

window.addEventListener('message', (event) => {
  const entry = registry.find((item) => item.frame.contentWindow === event.source);
  if (!entry) return;
  const message = event.data as Record<string, unknown> | null;
  if (!message || message.channel !== CHANNEL) return;
  const id = typeof message.id === 'string' ? message.id : undefined;
  log(`${entry.surface}/${entry.theme}: ${String(message.type)}`);

  switch (message.type) {
    case 'hello':
      post(entry, { channel: CHANNEL, v: VERSION, type: 'ready', payload: readyPayload(entry) });
      return;
    case 'service-request': {
      const payload = message.payload as {
        method: string;
        path: string;
        body?: string;
        query?: Record<string, string>;
      };
      if (payload.path?.startsWith('/clipboard/')) {
        void forwardClipboard(payload).then((answer) => reply(entry, id, answer), () => reply(entry, id, { status: 500, body: '{"error":"dev-failed"}' }));
        return;
      }
      reply(entry, id, { status: 200, body: JSON.stringify(scopedUsage(entry.usage, payload.query)) });
      return;
    }
    case 'storage': {
      const payload = message.payload as { op: string; key: string; value?: unknown };
      if (payload.op === 'get') {
        reply(entry, id, entry.storage.has(payload.key)
          ? { storage: true, op: 'get', found: true, value: entry.storage.get(payload.key) }
          : { storage: true, op: 'get', found: false });
      } else if (payload.op === 'set') {
        entry.storage.set(payload.key, payload.value);
        reply(entry, id, { storage: true, op: 'set' });
      } else if (payload.op === 'delete') {
        entry.storage.delete(payload.key);
        reply(entry, id, { storage: true, op: 'delete' });
      } else {
        reply(entry, id, { storage: true, op: 'keys', keys: [...entry.storage.keys()] });
      }
      return;
    }
    case 'status-controls':
      renderControls(entry, (message.payload as { controls: Array<Record<string, unknown>> }).controls);
      reply(entry, id);
      return;
    case 'resize': {
      const height = Number((message.payload as { height: number }).height);
      entry.frame.style.height = `${Math.min(Math.max(height, 40), 760)}px`;
      reply(entry, id);
      return;
    }
    case 'toast': {
      const payload = message.payload as { message: string; kind?: 'info' | 'success' | 'error' };
      log(`toast ${payload.kind ?? 'info'}: ${payload.message}`);
      showToast(payload.message, payload.kind ?? 'info');
      reply(entry, id);
      return;
    }
    case 'compose':
      showCompose(String((message.payload as { text: string }).text));
      reply(entry, id, { sent: 'skipped' });
      return;
    case 'clipboard-write':
      showToast('Чек скопирован', 'success');
      reply(entry, id);
      return;
    case 'open-url':
      showToast(`Открыть: ${(message.payload as { url: string }).url}`);
      reply(entry, id);
      return;
    default:
      reply(entry, id);
  }
});

const mountBare = (root: HTMLElement, theme: Theme): void => {
  const column = document.createElement('section');
  column.className = 'column';
  column.dataset.theme = theme;
  const label = document.createElement('div');
  label.className = 'column-label';
  label.textContent = `Карточка без iframe · ${theme === 'light' ? 'светлая' : 'тёмная'}`;
  const host = document.createElement('div');
  host.className = 'bare-card';
  host.dataset.ocTheme = theme;
  const card = mountCard(host, { variant: 'status' });
  card.update({
    tokens: usage.totals.eaten,
    input: usage.totals.input,
    output: usage.totals.output + usage.totals.reasoning,
    productId: seededPrefs.productId,
    budget: seededPrefs.budget,
    days: 1,
    unit: periodUnit('day'),
    busy: false,
  });
  column.append(label, host);
  root.append(column);
};

window.addEventListener('error', (event) => log(`window error: ${event.message}`));
window.addEventListener('unhandledrejection', (event) => log(`rejection: ${String(event.reason)}`));

const mount = (root: HTMLElement, surface: Surface, theme: Theme): void => {
  const column = document.createElement('section');
  column.className = 'column';
  column.dataset.theme = theme;

  const label = document.createElement('div');
  label.className = 'column-label';
  label.textContent = `${surface === 'status' ? 'Work Status' : 'Панель'} · ${theme === 'light' ? 'светлая' : 'тёмная'}`;

  const frame = document.createElement('iframe');
  frame.className = `frame frame-${surface}`;
  frame.title = label.textContent;
  // Mirror the host: an opaque origin without same-origin or clipboard access.
  if (params.get('sandbox') !== '0') frame.setAttribute('sandbox', 'allow-scripts');
  const anchor = params.get('scroll');
  frame.src = (surface === 'status' ? '../status/index.html' : '../panel/index.html') + (anchor ? `#${anchor}` : '');
  if (params.get('sandbox') === '0' && params.get('scrollY')) {
    const offset = Number(params.get('scrollY'));
    frame.addEventListener('load', () => {
      setTimeout(() => frame.contentWindow?.scrollTo(0, offset), 700);
    });
  }
  const autoClick = (selector: string, delay: number): void => {
    let fired = false;
    const click = (): void => {
      if (fired) return;
      const button = frame.contentDocument?.querySelector<HTMLButtonElement>(selector);
      if (!button || button.disabled) {
        setTimeout(click, 300);
        return;
      }
      fired = true;
      button.click();
    };
    frame.addEventListener('load', () => setTimeout(click, delay));
    setTimeout(click, delay + 400);
  };
  const copyDelay = Number(params.get('copyDelay'));
  if (params.get('sandbox') === '0' && params.get('autoCopy') === '1') {
    autoClick('[data-slot="copy-image"]', Number.isFinite(copyDelay) && copyDelay > 0 ? copyDelay : 1400);
  }
  if (params.get('sandbox') === '0' && params.get('autoGif') === '1') {
    autoClick('[data-slot="copy-gif"]', 1600);
  }
  if (params.get('sandbox') === '0' && params.get('settings') === '1') {
    autoClick('[data-slot="settings-open"]', 900);
  }
  const switchLang = params.get('switchLang');
  if (params.get('sandbox') === '0' && (switchLang === 'ru' || switchLang === 'en')) {
    autoClick('[data-slot="settings-open"]', 900);
    autoClick(`[data-lang="${switchLang}"]`, 1500);
  }
  frame.style.height = surface === 'status' ? '200px' : '1360px';

  const entry: Registry = { frame, theme, surface, usage, storage: new Map([['prefs', seededPrefs]]) };
  registry.push(entry);

  if (surface === 'status') {
    const chrome = document.createElement('div');
    chrome.className = 'panel-chrome';
    const head = document.createElement('div');
    head.className = 'panel-head';
    head.innerHTML = '<span class="panel-title">Work Status</span><span class="panel-dots">···</span>';
    const controls = document.createElement('div');
    controls.className = 'controls';
    head.append(controls);
    entry.controls = controls;
    chrome.append(head, frame);
    column.append(label, chrome);
  } else {
    column.append(label, frame);
  }

  root.append(column);
};

const root = document.querySelector<HTMLElement>('#canvas');
const logHost = document.querySelector<HTMLElement>('#log');
if (logHost && params.get('debug') === '1') logHost.hidden = false;
if (params.get('poster') === '1') document.body.classList.add('poster');
const zoom = Number(params.get('zoom'));
if (Number.isFinite(zoom) && zoom > 0 && zoom < 2) {
  // Scale the finished layout for a full-panel screenshot; zoom would reflow
  // the iframe and clip it instead.
  const canvas = document.querySelector<HTMLElement>('#canvas');
  if (canvas) {
    canvas.style.transform = `scale(${zoom})`;
    canvas.style.transformOrigin = 'top left';
  }
}
if (root) {
  const surfaces: Surface[] = params.get('surface') === 'none'
    ? []
    : requestedSurface === 'panel' || requestedSurface === 'status'
      ? [requestedSurface]
      : ['status', 'panel'];
  const themes: Theme[] = requestedTheme === 'light' || requestedTheme === 'dark'
    ? [requestedTheme]
    : ['light', 'dark'];
  for (const surface of surfaces) {
    for (const theme of themes) mount(root, surface, theme);
  }
  if (params.get('bare') === '1') {
    for (const theme of themes) mountBare(root, theme);
  }
}
