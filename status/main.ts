// The Work Status section: the card that sits next to the chat and grows a
// little while the agent chews. The product and budget are configured in the
// rail panel; here is only the picture button.
import {
  connectHost,
  type GuestStatusControl,
} from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import { CARD_CSS, mountCard, type CardHandle } from '../src/card';
import {
  dateLabel,
  dayKey,
  todayRange,
} from '../src/core';
import { DEFAULT_PREFS, readPrefs, readPrefsOrNull, type Prefs } from '../src/prefs';
import { loadUsage, type Usage, type UsageProblem } from '../src/usage';
import { copyPosterImage } from '../src/copy-image';
import { getLang, isLang, localeFor, setLang, type Lang } from '../src/lang';
import { brand, setCustomBrandName, t } from '../src/i18n';

const host = connectHost();
const root = document.querySelector<HTMLElement>('#root');
if (!root) throw new Error('x5: missing #root');
const hashLang = new URLSearchParams(location.hash.slice(1)).get('lang');
const initialLang: Lang = isLang(hashLang) ? hashLang : 'ru';
setLang(initialLang);
document.documentElement.lang = initialLang;
document.title = t('title');

const STATUS_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { background: transparent; color: var(--x5-ink); font-family: var(--oc-font, system-ui, sans-serif); }
.x5-status { display: flex; flex-direction: column; gap: 7px; }
.x5-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid var(--x5-line);
  border-radius: 11px;
  background: var(--x5-surface);
  font-size: 10.5px;
  line-height: 1.4;
}
.x5-note[data-tone="error"] {
  border-color: color-mix(in srgb, var(--x5-orange) 42%, var(--x5-line));
  background: var(--x5-orange-soft);
}
.x5-note-body { min-width: 0; flex: 1; }
.x5-note strong { display: block; font-weight: 700; }
.x5-note span { display: block; margin-top: 1px; color: var(--x5-muted); }
.x5-retry {
  flex: none;
  padding: 3px 8px;
  border: 1px solid var(--x5-line);
  border-radius: 7px;
  background: var(--x5-surface);
  color: var(--x5-ink);
  font: inherit;
  font-size: 9.5px;
  font-weight: 650;
  cursor: pointer;
}
.x5-retry:hover { background: var(--x5-surface-2); }
`;

const style = document.createElement('style');
style.textContent = CARD_CSS + STATUS_CSS;
document.head.append(style);

const shell = document.createElement('div');
shell.className = 'x5-status';
const cardRoot = document.createElement('div');
const noteRoot = document.createElement('div');
shell.append(cardRoot, noteRoot);
root.append(shell);

let started = false;
let locale = localeFor(initialLang);
let themeMode: 'light' | 'dark' = 'light';
let directory: string | null = null;
let controlsSupported = false;
let deviceStorage = false;
let busy = false;
let copying = false;
let prefs: Prefs = DEFAULT_PREFS;
let usage: Usage | null = null;
let problem: UsageProblem | null = null;
let loading = false;
let generation = 0;
let publishedControls = '';
let card: CardHandle | null = null;

const renderNote = (): void => {
  noteRoot.replaceChildren();
  if (problem) {
    const note = document.createElement('div');
    note.className = 'x5-note';
    note.dataset.tone = 'error';
    note.setAttribute('role', 'status');
    const body = document.createElement('div');
    body.className = 'x5-note-body';
    const title = document.createElement('strong');
    title.textContent = problem.title;
    body.append(title);
    if (problem.body) {
      const hint = document.createElement('span');
      hint.textContent = problem.body;
      body.append(hint);
    }
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'x5-retry';
    retry.textContent = t('retry');
    retry.addEventListener('click', () => void refresh());
    note.append(body, retry);
    noteRoot.append(note);
    return;
  }
  if (loading && !usage) {
    const note = document.createElement('div');
    note.className = 'x5-note';
    note.setAttribute('role', 'status');
    const body = document.createElement('div');
    body.className = 'x5-note-body';
    const title = document.createElement('strong');
    title.textContent = t('calculating');
    const hint = document.createElement('span');
    hint.textContent = t('firstResponseHint');
    body.append(title, hint);
    note.append(body);
    noteRoot.append(note);
  }
};

const paintBrand = (): void => {
  const word = cardRoot.querySelector<HTMLElement>('.x5-word');
  if (word) word.textContent = brand().upper;
};

const render = (): void => {
  card?.update({
    tokens: usage?.totals.eaten ?? 0,
    input: usage?.totals.input ?? 0,
    output: (usage?.totals.output ?? 0) + (usage?.totals.reasoning ?? 0) + (usage?.totals.cacheWrite ?? 0),
    productId: prefs.productId,
    budget: prefs.budget,
    days: 1,
    unit: t('tokensToday'),
    busy,
  });
  renderNote();
  publishControls();
};

const publishControls = (): void => {
  if (!controlsSupported) return;
  const controls: GuestStatusControl[] = [
    {
      kind: 'button',
      id: 'x5-image',
      label: t('imageControl'),
      disabled: !usage || loading || copying,
    },
  ];
  const signature = JSON.stringify(controls);
  if (signature === publishedControls) return;
  publishedControls = signature;
  void host.setStatusControls(controls).catch(() => {
    publishedControls = '';
    controlsSupported = false;
    render();
  });
};

const refresh = async (): Promise<void> => {
  const current = ++generation;
  const range = todayRange();
  loading = true;
  card?.spin(true);
  renderNote();
  const result = await loadUsage(host, {
    from: range.from,
    to: range.to,
    day: dayKey(range.date),
    tzOffset: new Date().getTimezoneOffset(),
  });
  if (current !== generation) return;
  loading = false;
  card?.spin(false);
  if (result.ok) {
    usage = result.usage;
    problem = null;
  } else {
    problem = result.problem;
  }
  render();
};

const copyImage = async (): Promise<void> => {
  if (!usage || copying) return;
  copying = true;
  publishControls();
  try {
    const range = todayRange();
    const result = await copyPosterImage(host, {
      tokens: usage.totals.eaten,
      input: usage.totals.input,
      output: usage.totals.output + usage.totals.reasoning + usage.totals.cacheWrite,
      budget: prefs.budget,
      days: 1,
      periodLabel: t('periodDay'),
      dateLabel: dateLabel(range.date, locale),
      selectedProduct: prefs.productId,
      locale,
      theme: themeMode,
      daily: [{
        date: dayKey(range.date),
        tokens: usage.totals.eaten,
        input: usage.totals.input,
        output: usage.totals.output + usage.totals.reasoning + usage.totals.cacheWrite,
      }],
    });
    await host.toast({
      kind: result.ok ? 'success' : 'error',
      message: result.ok ? t('copyImageToast') : result.message,
    }).catch(() => undefined);
  } finally {
    copying = false;
    publishControls();
  }
};

host.onStatusControl((event) => {
  if (event.id === 'x5-image') void copyImage();
});

host.onSession((snapshot) => {
  const next = snapshot?.busy ?? false;
  if (next === busy) return;
  busy = next;
  render();
});

host.onSessionLifecycle((event) => {
  // The database is written as the turn streams; give it a moment to settle.
  if (event.phase === 'completed') setTimeout(() => void refresh(), 900);
});

host.onReady((ctx) => {
  applyHostReady(ctx, document.documentElement);
  themeMode = ctx.theme.mode;
  locale = localeFor(getLang());
  const nextControls = ctx.features?.statusControls === true;
  const nextDeviceStorage = ctx.features?.deviceStorage === true;
  const changed = nextControls !== controlsSupported || nextDeviceStorage !== deviceStorage;
  controlsSupported = nextControls;
  deviceStorage = nextDeviceStorage;

  if (started) {
    if (changed) {
      publishedControls = '';
      render();
    }
    return;
  }
  started = true;
  directory = ctx.directory;

  host.onDirectory((next) => {
    // Numbers are global, but a new project usually means the first turn of a new day.
    if (next === directory) return;
    directory = next;
    // The host clears status controls on a project change; publish them again.
    publishedControls = '';
    void refresh();
  });

  card = mountCard(cardRoot, { variant: 'status', onRefresh: () => void refresh() });
  render();
  void (async () => {
    prefs = await readPrefs(host, deviceStorage);
    setCustomBrandName(prefs.customName);
    document.title = t('title');
    if (prefs.lang !== getLang()) {
      location.hash = `lang=${prefs.lang}`;
      location.reload();
      return;
    }
    paintBrand();
    render();
    await refresh();
  })();
});

// The host sizes the frame to this, clamped to 24..320 px.
let reportedHeight = -1;
new ResizeObserver(() => {
  const height = Math.ceil(shell.getBoundingClientRect().height) + 2;
  if (height === reportedHeight) return;
  reportedHeight = height;
  void host.setHeight(height).catch(() => undefined);
}).observe(shell);

setInterval(() => {
  if (document.visibilityState === 'visible') void refresh();
}, 60_000);

// Language, club name, product and supply are changed in the rail panel.
// Reload for the first two; repaint the card for the other two.
setInterval(async () => {
  if (document.visibilityState !== 'visible') return;
  const next = await readPrefsOrNull(host, deviceStorage);
  if (!next) return;
  if (next.lang !== getLang() || next.customName !== prefs.customName) {
    location.hash = `lang=${next.lang}`;
    location.reload();
    return;
  }
  if (next.productId !== prefs.productId || next.budget !== prefs.budget) {
    prefs = next;
    render();
  }
}, 3_000);
