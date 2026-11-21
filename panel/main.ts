// The rail panel: a small dashboard for the day — the hero card, the product,
// the daily supply and the sessions that ate the most.
import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';
import { CARD_CSS, mountCard, type CardHandle } from '../src/card';
import {
  BUDGET_MIN,
  BUDGET_PRESETS,
  clampBudget,
  compactShort,
  dateLabel,
  dayKey,
  fmt,
  isPeriod,
  isProductId,
  periodRange,
  periodTitle,
  periodUnit,
  plural,
  productForDay,
  PRODUCTS,
  rangeDateLabel,
  timeLabel,
  type Period,
} from '../src/core';
import { clampCustomName, CUSTOM_NAME_MAX, DEFAULT_PREFS, readPrefs, writePrefs, type Prefs } from '../src/prefs';
import { loadUsage, type Usage, type UsageProblem } from '../src/usage';
import { gifGlyph, iconTile, imageGlyph, refreshGlyph, settingsGlyph } from '../src/icon';
import { getLang, isLang, localeFor, setLang, type Lang } from '../src/lang';
import { brand, defaultBrandName, presetLabel, setCustomBrandName, t } from '../src/i18n';
import { copyGif } from '../src/copy-gif';
import { copyPosterImage } from '../src/copy-image';
import { productArt } from '../src/art';
import { BASE_CSS } from '../src/theme';

const host = connectHost();
const root = document.querySelector<HTMLElement>('#root');
if (!root) throw new Error('x5: missing #root');

const PANEL_CSS = `
${BASE_CSS}
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; overflow-x: hidden; }
body {
  background: transparent;
  color: var(--x5-ink);
  font-family: var(--oc-font, system-ui, sans-serif);
  -webkit-font-smoothing: antialiased;
}
[hidden] { display: none !important; }

.x5-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
  margin: 0 auto;
  padding: 4px 4px 22px;
}
.x5-panel::before {
  content: "";
  position: absolute;
  inset: -70px -40px auto;
  height: 260px;
  background: radial-gradient(58% 100% at 50% 0, var(--x5-glow), transparent 72%);
  pointer-events: none;
  z-index: 0;
}
.x5-panel > * { position: relative; z-index: 1; }

.x5-top { display: flex; align-items: center; gap: 9px; min-height: 34px; }
.x5-top-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.x5-main-view { display: flex; flex-direction: column; gap: 14px; }
.x5-main-view[hidden] { display: none; }
.x5-settings { display: flex; flex-direction: column; gap: 18px; }
.x5-settings[hidden] { display: none; }
.x5-settings-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 2px; }
.x5-settings-head h2 { margin: 0; font-size: 12px; font-weight: 800; letter-spacing: .02em; color: var(--x5-ink); }
.x5-settings-done { width: auto; min-width: 0; padding: 6px 12px; font-size: 10px; }
.x5-langs { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.x5-lang { padding: 9px 12px; border: 1px solid var(--x5-line); border-radius: 10px; background: var(--x5-surface-2); color: var(--x5-ink); font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
.x5-lang[aria-pressed="true"] { border-color: var(--x5-green); background: var(--x5-surface-3); color: var(--x5-green); }
.x5-lang:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }
.x5-store { display: flex; gap: 6px; }
.x5-store-input {
  flex: 1;
  min-width: 0;
  padding: 9px 12px;
  border: 1px solid var(--x5-line);
  border-radius: 10px;
  background: var(--x5-surface-2);
  color: var(--x5-ink);
  font: inherit;
  font-size: 11px;
  font-weight: 650;
}
.x5-store-input::placeholder { color: var(--x5-faint); font-weight: 500; }
.x5-store-input:hover { border-color: var(--x5-line-strong); }
.x5-store-input:focus { outline: none; border-color: var(--x5-accent-line); box-shadow: 0 0 0 2px var(--x5-accent-soft); }
.x5-store-reset {
  flex: none;
  padding: 0 12px;
  border: 1px solid var(--x5-line);
  border-radius: 10px;
  background: var(--x5-surface);
  color: var(--x5-muted);
  font: inherit;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
}
.x5-store-reset:hover { background: var(--x5-surface-2); color: var(--x5-ink); }
.x5-store-reset[disabled] { opacity: .45; cursor: default; }
.x5-store-reset:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }
.x5-top-mark { display: grid; place-items: center; }
.x5-top-mark .x5-icon { display: block; }
.x5-top-text { display: flex; flex-direction: column; min-width: 0; }
.x5-top-eyebrow { font-size: 8.5px; font-weight: 800; letter-spacing: .18em; color: var(--x5-green); }
.x5-top-title { font-size: 13px; font-weight: 650; letter-spacing: -.02em; line-height: 1.3; }
.x5-iconbtn {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-left: auto;
  padding: 0;
  border: 1px solid var(--x5-line);
  border-radius: 10px;
  background: var(--x5-surface);
  color: var(--x5-muted);
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.x5-iconbtn:hover { background: var(--x5-surface-2); color: var(--x5-ink); }
.x5-iconbtn:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }
.x5-iconbtn svg { width: 15px; height: 15px; }
.x5-iconbtn[data-spin="1"] svg { animation: x5spin .9s linear infinite; }
@keyframes x5spin { to { transform: rotate(360deg); } }

.x5-periods {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 3px;
  border: 1px solid color-mix(in srgb, var(--x5-orange) 24%, var(--x5-line));
  border-radius: 12px;
  background: var(--x5-surface-2);
}
.x5-period {
  padding: 6px 8px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--x5-muted);
  font: inherit;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
  transition: background .14s ease, color .14s ease, box-shadow .14s ease;
}
.x5-period:hover { color: var(--x5-ink); }
.x5-period[aria-pressed="true"] {
  background: var(--x5-surface);
  color: var(--x5-ink);
  box-shadow: 0 1px 2px rgba(0, 0, 0, .08), inset 0 0 0 1px color-mix(in srgb, var(--x5-orange) 34%, transparent);
}
[data-oc-theme="dark"] .x5-period[aria-pressed="true"] {
  background: linear-gradient(180deg, var(--x5-surface-3) 0%, var(--x5-surface-2) 100%);
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(240, 193, 90, .34);
}
.x5-period:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 1px; }

.x5-chart {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 78px;
  padding: 9px 10px;
  border: 1px solid var(--x5-line);
  border-radius: 14px;
  background: var(--x5-surface);
}
.x5-chart-bar { flex: 1; height: 100%; display: flex; align-items: flex-end; min-width: 2px; }
.x5-chart-bar i {
  display: block;
  width: 100%;
  min-height: 2px;
  border-radius: 3px 3px 1px 1px;
  background: linear-gradient(180deg, var(--x5-green), var(--x5-green-deep));
}
.x5-chart-bar[data-empty="1"] i { opacity: .18; }

.x5-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.x5-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 3px 7px;
  border: 1px solid var(--x5-line);
  border-radius: 11px;
  background: var(--x5-surface);
}
.x5-day-name { font-size: 8.5px; color: var(--x5-muted); font-weight: 650; white-space: nowrap; }
.x5-day-art { display: inline-flex; width: 14px; height: 14px; margin-left: 3px; vertical-align: -2px; }
.x5-day-art svg { width: 14px; height: 14px; display: block; }
.x5-day-bar { display: flex; align-items: flex-end; width: 100%; height: 28px; padding: 0 6px; }
.x5-day-bar i {
  display: block;
  width: 100%;
  min-height: 2px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--x5-green), var(--x5-green-deep));
}
.x5-day-value { color: var(--x5-ink); font-size: 9px; line-height: 1.1; font-weight: 750; font-variant-numeric: tabular-nums; }

.x5-cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
.x5-cal-head { text-align: center; font-size: 8px; font-weight: 750; color: var(--x5-muted); }
.x5-cal-cell {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2px;
  min-height: 48px;
  padding: 7px 7px 6px;
  border: 1px solid var(--x5-line);
  border-radius: 9px;
  background: color-mix(in srgb, var(--x5-green) var(--heat, 8%), var(--x5-surface-2));
}
.x5-cal-cell b { color: var(--x5-ink); font-size: 9.5px; font-weight: 750; white-space: nowrap; }
.x5-cal-art { display: inline-flex; width: 12px; height: 12px; margin-left: 2px; vertical-align: -1px; }
.x5-cal-art svg { width: 12px; height: 12px; display: block; }
.x5-cal-cell span { font-size: 7.5px; color: var(--x5-ink); opacity: .62; font-variant-numeric: tabular-nums; }
.x5-cal-cell[data-today="1"] { border-color: var(--x5-green); }

.x5-sec { display: flex; flex-direction: column; gap: 8px; }
.x5-sec-head { display: flex; align-items: baseline; gap: 8px; padding: 0 2px; }
.x5-sec-head h2 {
  margin: 0;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--x5-muted);
}
.x5-sec-meta {
  margin-left: auto;
  font-size: 9.5px;
  font-weight: 600;
  color: var(--x5-faint);
  font-variant-numeric: tabular-nums;
}

.x5-products {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}
.x5-product {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 0;
  padding: 8px 2px 7px;
  border: 1px solid var(--x5-line);
  border-radius: 13px;
  background: var(--x5-surface);
  color: var(--x5-muted);
  font: inherit;
  cursor: pointer;
  transition: transform .14s ease, border-color .14s ease, background .14s ease, color .14s ease, box-shadow .14s ease;
}
.x5-product:hover { transform: translateY(-1px); border-color: var(--x5-line-strong); background: var(--x5-surface-2); }
.x5-product:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }
.x5-product[aria-pressed="true"] {
  border-color: var(--x5-accent-line);
  background: var(--x5-accent-soft);
  color: var(--x5-ink);
  box-shadow: inset 0 0 0 1px var(--x5-accent-line);
}
.x5-product-art { display: grid; place-items: center; width: 30px; height: 30px; }
.x5-product-art svg { width: 30px; height: 30px; display: block; filter: drop-shadow(0 1px 1px rgba(0,0,0,.18)); }
.x5-product[aria-pressed="true"] .x5-product-art svg { filter: none; }
.x5-product-label {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 650;
  letter-spacing: -.01em;
}

.x5-budget {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 13px;
  border: 1px solid var(--x5-line);
  border-radius: 14px;
  background: var(--x5-surface);
}
.x5-budget-edit { display: flex; align-items: baseline; gap: 7px; }
.x5-budget-input {
  width: 100%;
  min-width: 0;
  padding: 1px 0;
  border: 0;
  border-bottom: 1px dashed transparent;
  background: transparent;
  color: var(--x5-ink);
  font: inherit;
  font-size: 24px;
  font-weight: 750;
  letter-spacing: -.035em;
  font-variant-numeric: tabular-nums;
}
.x5-budget-input:hover { border-bottom-color: var(--x5-line-strong); }
.x5-budget-input:focus { outline: none; border-bottom-color: var(--x5-green); }
.x5-budget-unit { flex: none; color: var(--x5-muted); font-size: 10px; }
.x5-budget-error { color: var(--x5-orange); font-size: 9.5px; line-height: 1.3; }
.x5-range {
  --fill: 40%;
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 22px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}
.x5-range::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--x5-green) var(--fill), var(--x5-surface-3) var(--fill));
}
.x5-range::-moz-range-track { height: 8px; border-radius: 999px; background: var(--x5-surface-3); }
.x5-range::-moz-range-progress { height: 8px; border-radius: 999px; background: var(--x5-green); }
.x5-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  margin-top: -6px;
  border: 3px solid var(--x5-green);
  border-radius: 50%;
  background: var(--x5-surface);
  box-shadow: 0 2px 6px rgba(0, 0, 0, .2);
}
.x5-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 3px solid var(--x5-green);
  border-radius: 50%;
  background: var(--x5-surface);
}
.x5-range:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; border-radius: 999px; }
.x5-presets { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }
.x5-preset {
  width: 100%;
  padding: 3px 4px;
  border: 1px solid var(--x5-line);
  border-radius: 999px;
  background: transparent;
  color: var(--x5-muted);
  font: inherit;
  font-size: 9px;
  font-weight: 650;
  text-align: center;
  cursor: pointer;
}
.x5-preset:hover { background: var(--x5-surface-2); color: var(--x5-ink); }
.x5-preset[aria-pressed="true"] { background: var(--x5-accent-soft); border-color: var(--x5-accent-line); color: var(--x5-ink); }
.x5-preset:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }

.x5-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.x5-actions--single { grid-template-columns: 1fr; }
.x5-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--x5-line);
  border-radius: 10px;
  background: var(--x5-surface);
  color: var(--x5-ink);
  font: inherit;
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: -.005em;
  cursor: pointer;
  opacity: 1;
  transition: transform .14s ease, box-shadow .14s ease, background .14s ease, border-color .14s ease;
}
.x5-btn svg { width: 14px; height: 14px; flex: none; }
.x5-btn:hover { border-color: var(--x5-line-strong); background: var(--x5-surface-2); }
.x5-btn:active { transform: translateY(1px); }
.x5-btn:focus-visible { outline: 2px solid var(--x5-green); outline-offset: 2px; }
.x5-btn[disabled] { filter: grayscale(.45); cursor: default; transform: none; }
.x5-btn[data-variant="primary"] {
  border-color: color-mix(in srgb, var(--x5-green-deep) 78%, #000);
  background: linear-gradient(180deg, color-mix(in srgb, var(--x5-green) 82%, #fff) 0%, var(--x5-green-deep) 100%);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .28), 0 10px 20px -14px color-mix(in srgb, var(--x5-green-deep) 90%, transparent);
}
.x5-btn[data-variant="primary"]:hover {
  background: linear-gradient(180deg, color-mix(in srgb, var(--x5-green) 88%, #fff) 0%, color-mix(in srgb, var(--x5-green-deep) 88%, #000) 100%);
}
.x5-btn[data-variant="ghost"] { background: transparent; }

.x5-sessions {
  display: flex;
  flex-direction: column;
  border: 1px solid color-mix(in srgb, var(--x5-orange) 22%, var(--x5-line));
  border-radius: 14px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--x5-surface-2) 45%, var(--x5-surface)) 0%, var(--x5-surface) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 224, 166, .06);
  overflow: hidden;
}
.x5-srow {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 9px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--x5-line);
  color: var(--x5-ink);
}
.x5-srow:last-child { border-bottom: 0; }
.x5-rank {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--x5-surface-2);
  color: var(--x5-faint);
  font-size: 9.5px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}
.x5-srow:first-child .x5-rank { background: var(--x5-accent-soft); color: var(--x5-green); }
.x5-sinfo { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.x5-sline { display: flex; align-items: baseline; gap: 8px; }
.x5-stitle {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--x5-ink);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -.01em;
}
.x5-stokens { margin-left: auto; color: var(--x5-ink); font-size: 11px; font-weight: 750; font-variant-numeric: tabular-nums; white-space: nowrap; }
.x5-smeta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9px;
  color: var(--x5-faint);
}
.x5-sbar { height: 3px; border-radius: 999px; background: var(--x5-surface-3); overflow: hidden; }
.x5-sbar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--x5-green-deep), var(--x5-green-bright)); }
.x5-empty { padding: 14px 12px; font-size: 10.5px; color: var(--x5-muted); }

.x5-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 11px;
  border: 1px solid var(--x5-line);
  border-radius: 12px;
  background: var(--x5-surface);
  font-size: 10.5px;
  line-height: 1.4;
}
.x5-note[data-tone="error"] {
  border-color: color-mix(in srgb, var(--x5-orange) 42%, var(--x5-line));
  background: var(--x5-orange-soft);
}
.x5-note-body { flex: 1; min-width: 0; }
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

.x5-foot {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 2px 4px 0;
  font-size: 9px;
  line-height: 1.45;
  color: var(--x5-faint);
  word-break: break-word;
}
.x5-foot a { color: var(--x5-green); font-weight: 650; text-decoration: none; }
.x5-foot a:hover { text-decoration: underline; }
`;

const style = document.createElement('style');
style.textContent = CARD_CSS + PANEL_CSS;
document.head.append(style);

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const panel = el('div', 'x5-panel');
const hashLang = new URLSearchParams(location.hash.slice(1)).get('lang');
const initialLang: Lang = isLang(hashLang) ? hashLang : 'ru';
setLang(initialLang);
document.documentElement.lang = initialLang;
document.title = brand().name;
const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char] ?? char));
panel.innerHTML = `
  <header class="x5-top">
    <span class="x5-top-mark">${iconTile(30)}</span>
    <span class="x5-top-text">
      <span class="x5-top-eyebrow" data-slot="brand-word">${escapeHtml(brand().upper)}</span>
    </span>
    <span class="x5-top-actions">
      <button class="x5-iconbtn" type="button" data-slot="settings-open" title="${t('settings')}" aria-label="${t('settingsAria')}">${settingsGlyph()}</button>
      <button class="x5-iconbtn" type="button" data-slot="refresh" title="${t('refresh')}" aria-label="${t('refreshAria')}">${refreshGlyph()}</button>
    </span>
  </header>
  <div class="x5-main-view" data-slot="main-view">
    <div class="x5-periods" data-slot="periods" role="tablist" aria-label="${t('periodAria')}">
      <button class="x5-period" type="button" data-period="day" role="tab" aria-pressed="false">${t('tabDay')}</button>
      <button class="x5-period" type="button" data-period="week" role="tab" aria-pressed="false">${t('tabWeek')}</button>
      <button class="x5-period" type="button" data-period="month" role="tab" aria-pressed="false">${t('tabMonth')}</button>
    </div>
    <div data-slot="notice"></div>
    <div data-slot="card"></div>
    <section class="x5-sec" data-slot="chart-sec" aria-labelledby="x5-chart-title" hidden>
      <div class="x5-sec-head">
        <h2 id="x5-chart-title">${t('dynamics')}</h2>
        <span class="x5-sec-meta" data-slot="chart-meta"></span>
      </div>
      <div class="x5-chart" data-slot="chart"></div>
    </section>
    <section class="x5-sec" aria-labelledby="x5-sessions-title">
      <div class="x5-sec-head">
        <h2 id="x5-sessions-title">${t('whoAte')}</h2>
        <span class="x5-sec-meta" data-slot="steps"></span>
      </div>
      <div class="x5-sessions" data-slot="sessions"></div>
    </section>
    <section class="x5-sec" aria-label="${t('copyImage')}">
      <div class="x5-actions x5-actions--single">
        <button class="x5-btn" type="button" data-variant="primary" data-slot="copy-image">${imageGlyph()}<span data-slot="copy-image-label">${t('copyImage')}</span></button>
      </div>
      <div class="x5-actions x5-actions--single">
        <button class="x5-btn" type="button" data-variant="secondary" data-slot="copy-gif">${gifGlyph()}<span data-slot="copy-gif-label">${t('copyGif')}</span></button>
      </div>
    </section>
  </div>
  <section class="x5-settings" data-slot="settings" hidden aria-label="${t('settingsAria')}">
    <div class="x5-settings-head">
      <h2>${t('settings')}</h2>
      <button class="x5-btn x5-settings-done" type="button" data-variant="ghost" data-slot="settings-close">${t('done')}</button>
    </div>
    <section class="x5-sec" aria-labelledby="x5-language-title">
      <div class="x5-sec-head">
        <h2 id="x5-language-title">${t('language')}</h2>
        <span class="x5-sec-meta">RU · EN</span>
      </div>
      <div class="x5-langs" data-slot="langs" role="group" aria-label="${t('language')}">
        <button class="x5-lang" type="button" data-lang="ru">Русский</button>
        <button class="x5-lang" type="button" data-lang="en">English</button>
      </div>
    </section>
    <section class="x5-sec" aria-labelledby="x5-store-title">
      <div class="x5-sec-head">
        <h2 id="x5-store-title">${t('storeName')}</h2>
        <span class="x5-sec-meta" data-slot="store-meta"></span>
      </div>
      <div class="x5-store">
        <input class="x5-store-input" data-slot="store-input" type="text" maxlength="${CUSTOM_NAME_MAX}" spellcheck="false" autocomplete="off" aria-label="${t('storeNameAria')}">
        <button class="x5-store-reset" type="button" data-slot="store-reset">${t('storeNameReset')}</button>
      </div>
    </section>
    <section class="x5-sec" aria-labelledby="x5-product-title">
      <div class="x5-sec-head">
        <h2 id="x5-product-title">${t('countIn')}</h2>
        <span class="x5-sec-meta">${t('tokensToProduct')}</span>
      </div>
      <div class="x5-products" data-slot="products" role="group" aria-label="${t('productAria')}"></div>
    </section>
    <section class="x5-sec" aria-labelledby="x5-budget-title">
      <div class="x5-sec-head">
        <h2 id="x5-budget-title">${t('dailySupplyTitle')}</h2>
        <span class="x5-sec-meta">${t('upToBillion')}</span>
      </div>
      <div class="x5-budget">
        <div class="x5-budget-edit">
          <input class="x5-budget-input" data-slot="budget-input" type="text" inputmode="numeric" spellcheck="false" autocomplete="off" aria-label="${t('budgetAria')}">
          <span class="x5-budget-unit">${t('budgetUnit')}</span>
        </div>
        <input class="x5-range" data-slot="range" type="range" aria-label="${t('budgetAria')}">
        <div class="x5-presets" data-slot="presets"></div>
        <div class="x5-budget-error" data-slot="budget-error" hidden></div>
      </div>
    </section>
  </section>
`;
root.append(panel);

const slot = <T extends HTMLElement = HTMLElement>(name: string): T => {
  const node = panel.querySelector<T>(`[data-slot="${name}"]`);
  if (!node) throw new Error(`x5: missing slot ${name}`);
  return node;
};

let started = false;
let locale = localeFor(initialLang);
let themeMode: 'light' | 'dark' = 'light';
let deviceStorage = false;
let busy = false;
let prefs: Prefs = DEFAULT_PREFS;
let period: Period = DEFAULT_PREFS.period;
let usage: Usage | null = null;
let problem: UsageProblem | null = null;
let loading = false;
let copying = false;
let copyingGif = false;
let generation = 0;
let card: CardHandle | null = null;
let budgetDraft = DEFAULT_PREFS.budget;

const noticeRoot = slot('notice');
const cardRoot = slot('card');
const productsRoot = slot('products');
const periodsRoot = slot('periods');
const chartSec = slot('chart-sec');
const chartRoot = slot('chart');
const chartMeta = slot('chart-meta');
const range = slot<HTMLInputElement>('range');
const budgetInput = slot<HTMLInputElement>('budget-input');
const budgetError = slot<HTMLElement>('budget-error');
const presetsRoot = slot('presets');
const copyImageButton = slot<HTMLButtonElement>('copy-image');
const copyImageLabel = slot('copy-image-label');
const copyGifButton = slot<HTMLButtonElement>('copy-gif');
const copyGifLabel = slot('copy-gif-label');
const steps = slot('steps');
const sessionsRoot = slot('sessions');
const mainView = slot('main-view');
const settingsView = slot('settings');
const settingsOpenButton = slot<HTMLButtonElement>('settings-open');
const settingsCloseButton = slot<HTMLButtonElement>('settings-close');
const langButtons = [...panel.querySelectorAll<HTMLButtonElement>('.x5-lang')];
const paintLang = (): void => {
  for (const button of langButtons) {
    button.setAttribute('aria-pressed', button.dataset.lang === getLang() ? 'true' : 'false');
  }
};
for (const button of langButtons) {
  button.addEventListener('click', () => {
    const next = button.dataset.lang;
    if (!isLang(next) || next === getLang()) return;
    prefs = { ...prefs, lang: next };
    void savePrefs().then((ok) => {
      if (!ok) return;
      location.hash = `lang=${next}`;
      location.reload();
    });
  });
}
paintLang();
const refreshButton = slot<HTMLButtonElement>('refresh');
let settingsOpen = false;
const renderSettings = (): void => {
  mainView.hidden = settingsOpen;
  settingsView.hidden = !settingsOpen;
  settingsOpenButton.setAttribute('aria-pressed', settingsOpen ? 'true' : 'false');
};
settingsOpenButton.addEventListener('click', () => {
  settingsOpen = true;
  renderSettings();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
settingsCloseButton.addEventListener('click', () => {
  settingsOpen = false;
  renderSettings();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
renderSettings();

const BUDGET_MAX = 1_000_000_000;
const RANGE_MIN = 1_000_000;
const RANGE_MAX = 500_000_000;
const PRESETS = BUDGET_PRESETS;

const productTiles = new Map<string, HTMLButtonElement>();
for (const product of PRODUCTS) {
  const tile = el('button', 'x5-product');
  tile.type = 'button';
  tile.setAttribute('aria-pressed', 'false');
  tile.dataset.product = product.id;
  const art = el('span', 'x5-product-art');
  art.innerHTML = productArt(product.id);
  // Reuse the shared art markup by asking the core-backed helper below.
  tile.append(art, el('span', 'x5-product-label', product.label));
  tile.addEventListener('click', () => chooseProduct(product.id));
  productsRoot.append(tile);
  productTiles.set(product.id, tile);
}

const presetButtons = new Map<number, HTMLButtonElement>();
for (const value of PRESETS) {
  const preset = el('button', 'x5-preset');
  preset.type = 'button';
  preset.setAttribute('aria-pressed', 'false');
  preset.textContent = presetLabel(value);
  preset.addEventListener('click', () => applyBudget(value, true));
  presetsRoot.append(preset);
  presetButtons.set(value, preset);
}

const savePrefs = async (): Promise<boolean> => {
  try {
    await writePrefs(host, prefs, deviceStorage);
    return true;
  } catch {
    await host.toast({ kind: 'error', message: t('settingsError') }).catch(() => undefined);
    return false;
  }
};

const storeInput = slot<HTMLInputElement>('store-input');
const storeReset = slot<HTMLButtonElement>('store-reset');
const storeMeta = slot('store-meta');

const brandWord = (): void => {
  const eyebrow = panel.querySelector<HTMLElement>('[data-slot="brand-word"]');
  if (eyebrow) eyebrow.textContent = brand().upper;
  const cardWord = panel.querySelector<HTMLElement>('.x5-word');
  if (cardWord) cardWord.textContent = brand().upper;
};

const paintStore = (): void => {
  const fallback = defaultBrandName(getLang());
  storeInput.placeholder = t('storeNamePlaceholder', { default: fallback });
  storeMeta.textContent = t('storeNameMeta', { default: fallback });
  if (document.activeElement !== storeInput) storeInput.value = prefs.customName;
  storeReset.disabled = !prefs.customName;
};

const applyStore = (value: string, persist: boolean): void => {
  const next = clampCustomName(value);
  prefs = { ...prefs, customName: next };
  setCustomBrandName(next);
  brandWord();
  paintStore();
  if (persist) void savePrefs();
};

storeInput.addEventListener('input', () => applyStore(storeInput.value, false));
storeInput.addEventListener('change', () => applyStore(storeInput.value, true));
storeInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') storeInput.blur();
});
storeReset.addEventListener('click', () => {
  applyStore('', true);
  storeInput.focus();
});

const periodButtons = new Map<Period, HTMLButtonElement>();
for (const button of periodsRoot.querySelectorAll<HTMLButtonElement>('.x5-period')) {
  const value = button.dataset.period;
  if (!isPeriod(value)) continue;
  periodButtons.set(value, button);
  button.addEventListener('click', () => setPeriod(value));
}

const renderPeriods = (): void => {
  for (const [value, button] of periodButtons) {
    button.setAttribute('aria-pressed', value === period ? 'true' : 'false');
  }
};

const setPeriod = (next: Period): void => {
  if (next === period) return;
  period = next;
  prefs = { ...prefs, period: next };
  void savePrefs();
  renderPeriods();
  usage = null;
  render();
  void refresh();
};

const chooseProduct = (id: string): void => {
  if (!isProductId(id) || id === prefs.productId) return;
  prefs = { ...prefs, productId: id };
  void savePrefs();
  render();
};

const showBudgetError = (message: string): void => {
  budgetError.textContent = message;
  budgetError.hidden = message === '';
};

const commitBudget = (value: number): void => {
  if (!Number.isFinite(value) || value < BUDGET_MIN) {
    showBudgetError(t('budgetMin', { value: fmt(BUDGET_MIN) }));
    return;
  }
  let next = Math.round(value);
  if (next > BUDGET_MAX) {
    next = BUDGET_MAX;
    showBudgetError(t('budgetMax', { value: fmt(BUDGET_MAX) }));
  } else {
    showBudgetError('');
  }
  budgetDraft = next;
  budgetInput.value = fmt(budgetDraft);
  if (budgetDraft !== prefs.budget) {
    prefs = { ...prefs, budget: budgetDraft };
    void savePrefs();
  }
  render();
};

const cardModel = (): {
  tokens: number;
  input: number;
  output: number;
  productId: typeof prefs.productId;
  budget: number;
  days: number;
  unit: string;
  busy: boolean;
} => {
  const rangeNow = periodRange(period);
  return {
    tokens: usage?.totals.eaten ?? 0,
    input: usage?.totals.input ?? 0,
    output: (usage?.totals.output ?? 0) + (usage?.totals.reasoning ?? 0) + (usage?.totals.cacheWrite ?? 0),
    productId: prefs.productId,
    budget: prefs.budget * rangeNow.days,
    days: rangeNow.days,
    unit: periodUnit(period),
    busy,
  };
};

const applyBudget = (value: number, commit: boolean): void => {
  budgetDraft = clampBudget(value);
  if (commit) {
    commitBudget(value);
    return;
  }
  paintBudget();
  card?.update(cardModel());
};

const paintBudget = (): void => {
  const max = Math.max(RANGE_MAX, budgetDraft);
  range.min = String(RANGE_MIN);
  range.max = String(max);
  range.step = '1000000';
  range.value = String(Math.min(Math.max(budgetDraft, RANGE_MIN), max));
  const percent = ((Math.min(budgetDraft, max) - RANGE_MIN) / (max - RANGE_MIN)) * 100;
  range.style.setProperty('--fill', `${Math.max(0, Math.min(100, percent))}%`);
  if (document.activeElement !== budgetInput) budgetInput.value = fmt(budgetDraft);
  for (const [value, button] of presetButtons) button.setAttribute('aria-pressed', value === budgetDraft ? 'true' : 'false');
};

range.addEventListener('input', () => {
  applyBudget(Number(range.value), false);
});
range.addEventListener('change', () => {
  applyBudget(Number(range.value), true);
});

budgetInput.addEventListener('focus', () => budgetInput.select());
budgetInput.addEventListener('input', () => {
  showBudgetError('');
  const digits = budgetInput.value.replace(/\D/g, '');
  if (!digits) return;
  const parsed = Number(digits);
  if (!Number.isFinite(parsed)) return;
  budgetDraft = parsed;
  paintBudget();
  card?.update(cardModel());
});
budgetInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') budgetInput.blur();
});
budgetInput.addEventListener('blur', () => {
  const digits = budgetInput.value.replace(/\D/g, '');
  if (!digits) {
    budgetDraft = prefs.budget;
    budgetInput.value = fmt(budgetDraft);
    showBudgetError('');
    paintBudget();
    return;
  }
  commitBudget(Number(digits));
});

const refreshGlyphButton = (on: boolean): void => {
  refreshButton.dataset.spin = on ? '1' : '0';
};

const renderNotice = (): void => {
  noticeRoot.replaceChildren();
  if (problem) {
    const note = el('div', 'x5-note');
    note.dataset.tone = 'error';
    note.setAttribute('role', 'status');
    const body = el('div', 'x5-note-body');
    body.append(el('strong', '', problem.title));
    if (problem.body) body.append(el('span', '', problem.body));
    const retry = el('button', 'x5-retry', t('retry'));
    retry.type = 'button';
    retry.addEventListener('click', () => void refresh());
    note.append(body, retry);
    noticeRoot.append(note);
    return;
  }
  if (loading && !usage) {
    const note = el('div', 'x5-note');
    note.setAttribute('role', 'status');
    const body = el('div', 'x5-note-body');
    body.append(el('strong', '', t('calculating')));
    note.append(body);
    noticeRoot.append(note);
  }
};

const renderProducts = (): void => {
  for (const [id, tile] of productTiles) tile.setAttribute('aria-pressed', id === prefs.productId ? 'true' : 'false');
};

const renderSessions = (): void => {
  sessionsRoot.replaceChildren();
  const sessions = usage?.sessions ?? [];
  steps.textContent = usage && usage.totals.turns > 0
    ? getLang() === 'en'
      ? `${fmt(usage.totals.turns)} ${usage.totals.turns === 1 ? t('steps') : t('stepsMany')}`
      : `${fmt(usage.totals.turns)} ${plural(usage.totals.turns, ['шаг', 'шага', 'шагов'])}`
    : '';
  if (sessions.length === 0) {
    sessionsRoot.append(el(
      'div',
      'x5-empty',
      usage
        ? period === 'day' ? t('nothingToday') : t('nothingPeriod')
        : t('noData'),
    ));
    return;
  }
  const top = sessions[0]?.tokens || 1;
  sessions.forEach((session, index) => {
    const row = el('div', 'x5-srow');
    const rank = el('span', 'x5-rank', String(index + 1).padStart(2, '0'));
    const info = el('div', 'x5-sinfo');
    const line = el('div', 'x5-sline');
    const title = el('span', 'x5-stitle', session.title);
    title.title = session.title;
    const tokens = el('span', 'x5-stokens', fmt(session.tokens));
    line.append(title, tokens);
    const split = [
      typeof session.input === 'number' ? `${t('sessionIn')} ${fmt(session.input)}` : '',
      typeof session.output === 'number' ? `${t('sessionOut')} ${fmt(session.output)}` : '',
      session.model ?? t('unknownModel'),
      timeLabel(session.updated, locale),
    ].filter(Boolean);
    const meta = el('div', 'x5-smeta', split.join(' · '));
    const bar = el('div', 'x5-sbar');
    const fill = el('i');
    fill.style.width = `${Math.max(2, Math.round((session.tokens / top) * 100))}%`;
    bar.append(fill);
    info.append(line, meta, bar);
    row.append(rank, info);
    sessionsRoot.append(row);
  });
};

const renderActions = (): void => {
  copyImageButton.disabled = !usage || copying;
  copyGifButton.disabled = !usage || copyingGif;
  copyImageLabel.textContent = copying ? t('copyingImage') : t('copyImage');
  copyGifLabel.textContent = copyingGif ? t('copyingGif') : t('copyGif');
  refreshGlyphButton(loading);
  refreshButton.disabled = loading;
};

const dailyForPeriod = (): Array<{ date: string; tokens: number; input: number; output: number }> => {
  const rangeNow = periodRange(period);
  const byDay = new Map((usage?.days ?? []).map((day) => [day.date, day]));
  const values: Array<{ date: string; tokens: number; input: number; output: number }> = [];
  for (let index = 0; index < rangeNow.days; index += 1) {
    const date = new Date(rangeNow.start);
    date.setDate(date.getDate() + index);
    const key = dayKey(date);
    const day = byDay.get(key);
    values.push({ date: key, tokens: day?.tokens ?? 0, input: day?.input ?? 0, output: day?.output ?? 0 });
  }
  return values;
};

const renderChart = (): void => {
  const rangeNow = periodRange(period);
  chartSec.hidden = rangeNow.days === 1;
  if (rangeNow.days === 1) {
    chartRoot.replaceChildren();
    return;
  }
  const daily = dailyForPeriod();
  const total = usage?.totals.eaten ?? daily.reduce((sum, day) => sum + day.tokens, 0);
  const max = Math.max(1, ...daily.map((day) => day.tokens));

  if (rangeNow.days <= 7) {
    chartRoot.className = 'x5-days';
    chartRoot.replaceChildren(...daily.map((day) => {
      const cell = el('div', 'x5-day');
      const date = new Date(`${day.date}T12:00:00`);
      const product = productForDay(date);
      let name = day.date;
      try {
        name = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
      } catch {
        // Keep the date key.
      }
      cell.title = `${dateLabel(date, locale)} · ${fmt(day.tokens)} ${t('tokens')} · ${product.label}`;
      const nameEl = el('span', 'x5-day-name');
      nameEl.append(document.createTextNode(name));
      const artEl = el('span', 'x5-day-art');
      artEl.innerHTML = productArt(product.id);
      nameEl.append(artEl);
      const bar = el('div', 'x5-day-bar');
      const fill = el('i');
      fill.style.height = `${Math.max(2, Math.round((day.tokens / max) * 100))}%`;
      bar.append(fill);
      const value = el('span', 'x5-day-value', compactShort(day.tokens));
      cell.append(nameEl, bar, value);
      return cell;
    }));
  } else {
    chartRoot.className = 'x5-cal';
    const names = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(2024, 0, 1 + index);
      try {
        return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
      } catch {
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]!;
      }
    });
    const nodes: HTMLElement[] = names.map((name) => el('span', 'x5-cal-head', name));
    const first = new Date(`${daily[0]?.date}T12:00:00`);
    const offset = (first.getDay() + 6) % 7;
    for (let index = 0; index < offset; index += 1) nodes.push(el('span'));
    daily.forEach((day, index) => {
      const date = new Date(`${day.date}T12:00:00`);
      const product = productForDay(date);
      const cell = el('div', 'x5-cal-cell');
      const ratio = day.tokens / max;
      cell.style.setProperty('--heat', `${8 + Math.round(ratio * 42)}%`);
      if (index === daily.length - 1) cell.dataset.today = '1';
      cell.title = `${dateLabel(date, locale)} · ${fmt(day.tokens)} ${t('tokens')} · ${product.label}`;
      const dayEl = el('b');
      dayEl.append(document.createTextNode(String(date.getDate())));
      const artEl = el('span', 'x5-cal-art');
      artEl.innerHTML = productArt(product.id);
      dayEl.append(artEl);
      cell.append(dayEl, el('span', '', compactShort(day.tokens)));
      nodes.push(cell);
    });
    chartRoot.replaceChildren(...nodes);
  }

  const average = Math.round(total / rangeNow.days);
  chartMeta.textContent = `${periodTitle(period)} · ${t('averagePerDay', { value: fmt(average) })}`;
};

const render = (): void => {
  if (card) card.update(cardModel());
  paintStore();
  renderProducts();
  renderPeriods();
  paintBudget();
  renderNotice();
  renderChart();
  renderSessions();
  renderActions();
};

const refresh = async (): Promise<void> => {
  const current = ++generation;
  const rangeNow = periodRange(period);
  loading = true;
  card?.spin(true);
  renderNotice();
  renderActions();
  const result = await loadUsage(host, {
    from: rangeNow.from,
    to: rangeNow.to,
    day: rangeNow.dayKey,
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
  renderActions();
  try {
    const rangeNow = periodRange(period);
    const result = await copyPosterImage(host, {
      tokens: usage.totals.eaten,
      input: usage.totals.input,
      output: usage.totals.output + usage.totals.reasoning + usage.totals.cacheWrite,
      budget: prefs.budget * rangeNow.days,
      days: rangeNow.days,
      periodLabel: periodTitle(period),
      dateLabel: rangeDateLabel(rangeNow.start, rangeNow.end, locale),
      selectedProduct: prefs.productId,
      locale,
      theme: themeMode,
      daily: dailyForPeriod(),
    });
    await host.toast({
      kind: result.ok ? 'success' : 'error',
      message: result.ok ? t('copyImageToast') : result.message,
    }).catch(() => undefined);
  } finally {
    copying = false;
    renderActions();
  }
};

copyImageButton.addEventListener('click', () => void copyImage());

const copyGifAction = async (): Promise<void> => {
  if (!usage || copyingGif) return;
  copyingGif = true;
  renderActions();
  try {
    const rangeNow = periodRange(period);
    const result = await copyGif(host, {
      tokens: usage.totals.eaten,
      input: usage.totals.input,
      output: usage.totals.output + usage.totals.reasoning + usage.totals.cacheWrite,
      productId: prefs.productId,
      budget: prefs.budget * rangeNow.days,
      periodLabel: periodTitle(period),
      dateLabel: rangeDateLabel(rangeNow.start, rangeNow.end, locale),
      days: rangeNow.days,
      locale,
      theme: themeMode,
      daily: dailyForPeriod(),
    });
    await host.toast({
      kind: result.ok ? 'success' : 'error',
      message: result.ok ? t('copyGifToast') : result.message,
    }).catch(() => undefined);
  } finally {
    copyingGif = false;
    renderActions();
  }
};

copyGifButton.addEventListener('click', () => void copyGifAction());

refreshButton.addEventListener('click', () => void refresh());

host.onSession((snapshot) => {
  const next = snapshot?.busy ?? false;
  if (next === busy) return;
  busy = next;
  render();
});

host.onSessionLifecycle((event) => {
  if (event.phase === 'completed') setTimeout(() => void refresh(), 900);
});

let directory: string | null = null;
host.onReady((ctx) => {
  applyHostReady(ctx, document.documentElement);
  themeMode = ctx.theme.mode;
  locale = localeFor(getLang());
  deviceStorage = ctx.features?.deviceStorage === true;
  if (started) return;
  started = true;
  directory = ctx.directory;

  host.onDirectory((next) => {
    if (next === directory) return;
    directory = next;
    void refresh();
  });

  card = mountCard(cardRoot, { variant: 'panel', onRefresh: () => void refresh() });
  paintBudget();
  render();
  void (async () => {
    prefs = await readPrefs(host, deviceStorage);
    if (prefs.lang !== getLang()) {
      location.hash = `lang=${prefs.lang}`;
      location.reload();
      return;
    }
    locale = localeFor(prefs.lang);
    period = prefs.period;
    budgetDraft = prefs.budget;
    setCustomBrandName(prefs.customName);
    document.title = brand().name;
    brandWord();
    paintLang();
    renderPeriods();
    render();
    await refresh();
  })();
});

setInterval(() => {
  if (document.visibilityState === 'visible') void refresh();
}, 60_000);
