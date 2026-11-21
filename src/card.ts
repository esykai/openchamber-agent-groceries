// The card: one green hero with today's number and a little shelf of food.
// The same markup runs in the Work Status section, the rail panel and the
// dev preview; only the numbers change after mount.
import { fmt, mood, productById, slotsFor, SLOTS, unitsLabel, type ProductId } from './core';
import { brand, t } from './i18n';
import { productArt } from './art';
import { heroMark, refreshGlyph } from './icon';
import { nodeMark, starMark, orbitMark } from './orbital';
import { BASE_CSS } from './theme';

export type CardVariant = 'status' | 'panel';

export type CardModel = {
  tokens: number;
  /** Tokens that went into the model today. */
  input: number;
  /** Tokens that came out, reasoning included. */
  output: number;
  productId: ProductId;
  budget: number;
  /** How many days the budget covers (1 for today, 7/30 for a period). */
  days: number;
  /** "токенов за сегодня" / "токенов за 7 дней". */
  unit: string;
  busy: boolean;
};

export type CardHandle = {
  element: HTMLElement;
  update: (model: CardModel) => void;
  /** Spins the refresh glyph while a request is in flight. */
  spin: (on: boolean) => void;
  dispose: () => void;
};

export const CARD_CSS = `
${BASE_CSS}
[hidden] { display: none !important; }

.x5-card {
  position: relative;
  border: 1px solid color-mix(in srgb, var(--x5-orange) 42%, var(--x5-line));
  border-radius: 20px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--x5-surface-2) 55%, var(--x5-surface)) 0%, var(--x5-surface) 100%);
  color: var(--x5-ink);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(240, 193, 90, .09), var(--x5-shadow);
  font-family: var(--oc-font, system-ui, sans-serif);
}

.x5-hero {
  position: relative;
  padding: 11px 13px 13px;
  color: var(--x5-hero-ink);
  background: var(--x5-hero);
  border-bottom: 1px solid rgba(240, 193, 90, .42);
  overflow: hidden;
}
.x5-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 1.5px 1.5px, rgba(255, 255, 255, .2) 1px, transparent 0),
    repeating-linear-gradient(125deg, rgba(240, 193, 90, .14) 0 1px, transparent 1px 18px);
  background-size: 13px 13px, auto;
  opacity: .58;
  pointer-events: none;
}
.x5-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(95% 95% at 88% 28%, rgba(255, 219, 138, .3), transparent 62%);
  pointer-events: none;
}
.x5-hero-leaf {
  position: absolute;
  top: -30px;
  right: -26px;
  width: 118px;
  height: 118px;
  color: #fff;
  opacity: .1;
  transform: rotate(10deg);
  pointer-events: none;
}
.x5-hero-leaf svg { display: block; width: 100%; height: 100%; }
.x5-hero-orbit {
  position: absolute;
  top: -18px;
  right: -12px;
  width: 152px;
  height: 152px;
  color: #ffe39f;
  opacity: .38;
  pointer-events: none;
}
.x5-hero-orbit svg { display: block; width: 100%; height: 100%; }
.x5-hero-star {
  position: absolute;
  color: rgba(255, 234, 179, .62);
  pointer-events: none;
}
.x5-hero-star svg { display: block; width: 100%; height: 100%; }
.x5-star-1 { top: 20px; right: 108px; width: 15px; height: 15px; }
.x5-star-2 { top: 68px; right: 34px; width: 11px; height: 11px; opacity: .72; }
.x5-star-3 { bottom: 14px; right: 138px; width: 9px; height: 9px; opacity: .52; }
.x5-hero-node {
  position: absolute;
  right: 22px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  color: rgba(255, 224, 150, .34);
  pointer-events: none;
}
.x5-hero-node svg { display: block; width: 100%; height: 100%; }
.x5-hero-top { position: relative; z-index: 1; display: flex; align-items: center; gap: 6px; min-height: 24px; }
.x5-hero-top .x5-icon { display: block; }
.x5-word { font-size: 8.5px; font-weight: 800; letter-spacing: .17em; color: #fff; }
.x5-refresh {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, .16);
  color: #fff;
  cursor: pointer;
  transition: background .15s ease, transform .15s ease;
}
.x5-refresh:hover { background: rgba(255, 255, 255, .27); }
.x5-refresh:active { transform: scale(.94); }
.x5-refresh:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.x5-refresh svg { width: 14px; height: 14px; }
.x5-refresh[data-spin="1"] svg { animation: x5spin .9s linear infinite; }
@keyframes x5spin { to { transform: rotate(360deg); } }

.x5-hero-title {
  position: relative;
  z-index: 1;
  margin-top: 7px;
  color: var(--x5-hero-muted);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: -.005em;
}
.x5-hero-tokens {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 7px;
  margin-top: 1px;
}
.x5-num {
  color: #fff;
  font-size: 33px;
  font-weight: 750;
  line-height: 1.04;
  letter-spacing: -.045em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.x5-num[data-long="1"] { font-size: 26px; }
.x5-hero-unit { color: var(--x5-hero-muted); font-size: 10px; font-weight: 600; letter-spacing: .01em; }
.x5-busy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 9px;
  font-weight: 650;
}
.x5-busy::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: x5pulse 1.2s ease-in-out infinite;
}
@keyframes x5pulse { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }

.x5-hero-split {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 3px 12px;
  margin-top: 5px;
  color: var(--x5-hero-muted);
  font-size: 9px;
  font-weight: 650;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.x5-hero-split span + span {
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, .22);
}
.x5-hero-split b {
  color: #fff;
  font-size: 10px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  letter-spacing: -.01em;
}
.x5-hero-split b[data-long="1"] { font-size: 9px; }

.x5-body { display: flex; flex-direction: column; gap: 12px; padding: 12px 13px 13px; }
.x5-label {
  font-size: 9px;
  font-weight: 750;
  line-height: 1.2;
  letter-spacing: .11em;
  text-transform: uppercase;
  color: var(--x5-muted);
}
.x5-conv-line { display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 6px; margin-top: 1px; }
.x5-count {
  font-size: 27px;
  font-weight: 750;
  line-height: 1.08;
  letter-spacing: -.04em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.x5-count[data-long="1"] { font-size: 22px; }
.x5-units { color: var(--x5-muted); font-size: 11px; font-weight: 500; }

.x5-shelf {
  display: flex;
  align-items: center;
  gap: 3px;
  min-height: 40px;
  margin-top: 6px;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--x5-orange) 24%, var(--x5-line));
  border-radius: 12px;
  background: linear-gradient(180deg, var(--x5-surface-2) 0%, color-mix(in srgb, var(--x5-surface-3) 45%, var(--x5-surface)) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 224, 166, .08);
}
.x5-art { display: flex; align-items: center; gap: 3px; }
.x5-art-svg { display: block; width: 26px; height: 26px; filter: drop-shadow(0 1px 1px rgba(0, 0, 0, .2)); }
.x5-slot[data-faded="1"] { opacity: .24; filter: grayscale(.45); }
.x5-badge {
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 7px;
  background: var(--x5-orange);
  color: #2b0610;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: -.01em;
  white-space: nowrap;
}

.x5-supply-head { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.x5-mood {
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.x5-percent { margin-left: auto; font-size: 12px; font-weight: 750; font-variant-numeric: tabular-nums; }
.x5-track {
  height: 8px;
  margin: 6px 0 4px;
  border-radius: 999px;
  background: var(--x5-surface-3);
  overflow: hidden;
}
.x5-bar {
  display: block;
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--x5-green-deep), var(--x5-green-bright));
  transition: width .4s cubic-bezier(.2, .8, .2, 1);
}
.x5-card[data-tone="high"] .x5-bar { background: linear-gradient(90deg, #ef8a2f, var(--x5-orange)); }
.x5-budget-note { font-size: 9px; letter-spacing: .01em; color: var(--x5-faint); }

/* The rail panel has room: bigger hero, larger food, quieter labels. */
.x5-card[data-variant="panel"] { border-radius: 22px; }
.x5-card[data-variant="panel"] .x5-hero { padding: 13px 15px 15px; }
.x5-card[data-variant="panel"] .x5-hero-title { margin-top: 9px; font-size: 12.5px; }
.x5-card[data-variant="panel"] .x5-num { font-size: 38px; }
.x5-card[data-variant="panel"] .x5-num[data-long="1"] { font-size: 30px; }
.x5-card[data-variant="panel"] .x5-hero-unit { font-size: 10.5px; }
.x5-card[data-variant="panel"] .x5-body { gap: 14px; padding: 14px 15px 15px; }
.x5-card[data-variant="panel"] .x5-count { font-size: 31px; }
.x5-card[data-variant="panel"] .x5-count[data-long="1"] { font-size: 25px; }
.x5-card[data-variant="panel"] .x5-units { font-size: 11.5px; }
.x5-card[data-variant="panel"] .x5-shelf { min-height: 46px; padding: 7px 9px; }
.x5-card[data-variant="panel"] .x5-art-svg { width: 30px; height: 30px; }
.x5-card[data-variant="panel"] .x5-track { height: 9px; }
.x5-card[data-variant="panel"] .x5-mood { font-size: 11px; }

@media (prefers-reduced-motion: reduce) {
  .x5-refresh[data-spin="1"] svg, .x5-busy::before { animation: none; }
  .x5-bar { transition: none; }
}
`;

const slotsMarkup = (productId: ProductId, count: number): string => {
  const { full, partial } = slotsFor(count);
  const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
  let out = '';
  for (let index = 0; index < visible; index += 1) {
    out += `<span class="x5-slot" data-faded="${index >= full ? '1' : '0'}">${productArt(productId)}</span>`;
  }
  return out;
};

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char] ?? char));

const TEMPLATE = (variant: CardVariant, refresh: boolean): string => `
<div class="x5-card" data-variant="${variant}" role="group">
  <div class="x5-hero">
    <span class="x5-hero-orbit">${orbitMark()}</span>
    <span class="x5-hero-star x5-star-1">${starMark()}</span>
    <span class="x5-hero-star x5-star-2">${starMark()}</span>
    <span class="x5-hero-star x5-star-3">${starMark()}</span>
    <span class="x5-hero-node">${nodeMark()}</span>
    <div class="x5-hero-top">
      <span class="x5-hero-mark">${heroMark(19)}</span>
      <span class="x5-word">${escapeHtml(brand().upper)}</span>
      ${refresh ? `<button class="x5-refresh" type="button" title="${t('refresh')}" aria-label="${t('refreshAria')}">${refreshGlyph()}</button>` : ''}
    </div>
    <div class="x5-hero-title">${t('title')}</div>
    <div class="x5-hero-tokens">
      <span class="x5-num">0</span>
      <span class="x5-hero-unit">${t('tokensToday')}</span>
      <span class="x5-busy" hidden>${t('busy')}…</span>
    </div>
    <div class="x5-hero-split">
      <span>${t('input')} <b class="x5-in">0</b></span>
      <span>${t('output')} <b class="x5-out">0</b></span>
    </div>
  </div>
  <div class="x5-body">
    <div class="x5-metric">
      <div class="x5-label">${t('thisIs')}</div>
      <div class="x5-conv-line">
        <span class="x5-count">0</span>
        <span class="x5-units">${unitsLabel(0, productById('grechka'))}</span>
      </div>
      <div class="x5-shelf">
        <span class="x5-art"></span>
        <span class="x5-badge" hidden></span>
      </div>
    </div>
    <div class="x5-supply">
      <div class="x5-supply-head">
        <span class="x5-label">${t('supply')}</span>
        <span class="x5-mood">${mood(0)}</span>
        <span class="x5-percent">0%</span>
      </div>
      <div class="x5-track"><i class="x5-bar"></i></div>
      <div class="x5-budget-note"></div>
    </div>
  </div>
</div>`;

export type CardOptions = {
  variant: CardVariant;
  onRefresh?: () => void;
};

export const mountCard = (root: HTMLElement, options: CardOptions): CardHandle => {
  root.innerHTML = TEMPLATE(options.variant, Boolean(options.onRefresh));
  const card = root.querySelector<HTMLElement>('.x5-card');
  if (!card) throw new Error('x5: card markup missing');

  const num = card.querySelector<HTMLElement>('.x5-num')!;
  const unitEl = card.querySelector<HTMLElement>('.x5-hero-unit')!;
  const inEl = card.querySelector<HTMLElement>('.x5-in')!;
  const outEl = card.querySelector<HTMLElement>('.x5-out')!;
  const count = card.querySelector<HTMLElement>('.x5-count')!;
  const art = card.querySelector<HTMLElement>('.x5-art')!;
  const badge = card.querySelector<HTMLElement>('.x5-badge')!;
  const units = card.querySelector<HTMLElement>('.x5-units')!;
  const moodEl = card.querySelector<HTMLElement>('.x5-mood')!;
  const percentEl = card.querySelector<HTMLElement>('.x5-percent')!;
  const bar = card.querySelector<HTMLElement>('.x5-bar')!;
  const budgetEl = card.querySelector<HTMLElement>('.x5-budget-note')!;
  const busy = card.querySelector<HTMLElement>('.x5-busy')!;
  const refresh = card.querySelector<HTMLButtonElement>('.x5-refresh');

  const onRefresh = () => options.onRefresh?.();
  refresh?.addEventListener('click', onRefresh);

  const update = (model: CardModel): void => {
    const product = productById(model.productId);
    const unitsCount = Math.floor(model.tokens / product.per);
    const percent = model.budget > 0 ? Math.round((model.tokens / model.budget) * 100) : 0;
    const clamped = Math.max(0, Math.min(100, percent));
    const tokensText = fmt(model.tokens);
    const countText = fmt(unitsCount);

    num.textContent = tokensText;
    num.dataset.long = tokensText.length >= 10 ? '1' : '0';
    unitEl.textContent = model.unit;
    const inputText = fmt(model.input);
    const outputText = fmt(model.output);
    inEl.textContent = inputText;
    inEl.dataset.long = inputText.length >= 9 ? '1' : '0';
    outEl.textContent = outputText;
    outEl.dataset.long = outputText.length >= 9 ? '1' : '0';
    count.textContent = countText;
    count.dataset.long = countText.length >= 10 ? '1' : '0';
    units.textContent = unitsLabel(unitsCount, product);
    art.innerHTML = slotsMarkup(product.id, unitsCount);

    const extra = Math.max(0, unitsCount - SLOTS);
    badge.hidden = extra === 0;
    badge.textContent = `+${fmt(extra)}`;

    moodEl.textContent = mood(percent);
    percentEl.textContent = `${percent}%`;
    bar.style.width = `${clamped}%`;
    card.dataset.tone = percent >= 75 ? 'high' : 'normal';
    budgetEl.textContent = model.days > 1
      ? `${t('supplyForDays', { days: model.days })} · ${fmt(model.budget)} ${t('tokens')}`
      : `${t('dailySupply')} · ${fmt(model.budget)} ${t('tokens')}`;
    busy.hidden = !model.busy;

    const supplies = percent >= 100 ? t('supplyGone') : t('supplyStatus', { percent });
    card.setAttribute(
      'aria-label',
      `${model.unit}: ${tokensText} ${t('tokens')}, ${t('input')} ${inputText}, ${t('output')} ${outputText} — ${t('thisIs')} ${countText} ${unitsLabel(unitsCount, product)}. ${supplies}.`,
    );
  };

  const spin = (on: boolean): void => {
    if (refresh) refresh.dataset.spin = on ? '1' : '0';
  };

  return {
    element: card,
    update,
    spin,
    dispose: () => {
      refresh?.removeEventListener('click', onRefresh);
      root.replaceChildren();
    },
  };
};
