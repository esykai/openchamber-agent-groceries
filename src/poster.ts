// A shareable picture of the widget: the card and its shelf on one
// branded sheet. Drawn on a canvas so "copy image" works without a screenshot
// library and stays crisp at 2×.
import { compact, fmt, mood, productById, productForDay, PRODUCTS, slotsFor, SLOTS, unitsLabel, type ProductId } from './core';
import { productArt } from './art';
import { brand, t } from './i18n';
import { SKIN_DARK, SKIN_LIGHT, drawNode, drawStar, drawOrbits } from './orbital';

export type PosterTheme = 'light' | 'dark';

export type PosterInput = {
  tokens: number;
  input: number;
  output: number;
  productId: ProductId;
  budget: number;
  date: Date;
  locale: string;
  theme: PosterTheme;
};

type Palette = {
  bg: string;
  card: string;
  line: string;
  ink: string;
  muted: string;
  faint: string;
  surface2: string;
  surface3: string;
  paper: string;
  paperLine: string;
  orange: string;
  hero: [string, string, string];
  glow: string;
};

const SANS = '"Segoe UI", system-ui, -apple-system, sans-serif';
const MONO = '"Cascadia Mono", Consolas, ui-monospace, monospace';

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: [number, number, number, number],
): void => {
  // A radius larger than half the box turns arcTo into a huge, wrong path.
  const limit = Math.max(0, Math.min(w, h) / 2);
  const [tl, tr, br, bl] = radii.map((radius) => Math.max(0, Math.min(radius, limit))) as [number, number, number, number];
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
};

const fillRound = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rad: number | [number, number, number, number],
  color: string,
): void => {
  const radii: [number, number, number, number] = typeof rad === 'number' ? [rad, rad, rad, rad] : rad;
  roundRect(ctx, x, y, w, h, radii);
  ctx.fillStyle = color;
  ctx.fill();
};

const label = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  weight = 700,
  mono = false,
): void => {
  ctx.font = `${weight} ${size}px ${mono ? MONO : SANS}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, y);
};

/** Small caps with a little tracking, the way the card labels read. */
const caps = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string): void => {
  ctx.font = `750 9px ${SANS}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '1.2px';
  ctx.fillText(text, x, y);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
};

const loadImage = (svg: string): Promise<HTMLImageElement | null> => new Promise((resolve) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});

const drawHeroMark = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void => {
  const k = size / 32;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(28, 4);
  ctx.bezierCurveTo(14.5, 4, 7.5, 10.5, 7.5, 19.5);
  ctx.bezierCurveTo(7.5, 24.5, 10.9, 27.5, 15.7, 27.5);
  ctx.bezierCurveTo(24.3, 27.5, 28, 18.5, 28, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.2)';
  ctx.lineWidth = 1.7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(9.8, 28.6);
  ctx.bezierCurveTo(12.8, 21.4, 18, 15.6, 24.4, 12);
  ctx.stroke();
  ctx.restore();
};

export const renderPoster = async (input: PosterInput): Promise<Blob> => {
  const p = input.theme === 'dark' ? SKIN_DARK : SKIN_LIGHT;
  const product = productById(input.productId);
  const units = Math.floor(input.tokens / product.per);
  const percent = input.budget > 0 ? Math.round((input.tokens / input.budget) * 100) : 0;

  const SCALE = 2;
  const W = 400;
  const M = 18;
  const CW = W - M * 2;
  const heroH = 156;
  const bodyH = 172;
  const cardH = heroH + bodyH;
  const cardY = M;
  const cardBottom = cardY + cardH;
  const footerY = cardBottom + 20;
  const H = footerY + 12 + M;

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('x5: no 2d context');
  ctx.scale(SCALE, SCALE);

  // Backdrop with a green aura, so the sheet reads as a picture even on white.
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  const aura = ctx.createRadialGradient(W - 40, 30, 10, W - 40, 30, 300);
  aura.addColorStop(0, p.glow);
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, W, H);
  drawOrbits(ctx, W - 190, H - 240, 260, p.ink, input.theme === 'dark' ? 0.07 : 0.04);
  drawStar(ctx, W - 70, H - 170, 54, p.ink, 0.08);
  drawStar(ctx, W - 130, H - 92, 32, p.ink, 0.06);

  // Main card.
  ctx.save();
  ctx.shadowColor = input.theme === 'dark' ? 'rgba(0,0,0,.55)' : 'rgba(30,40,15,.16)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 12;
  fillRound(ctx, M, cardY, CW, cardH, 22, p.card);
  ctx.restore();
  fillRound(ctx, M + 1, cardY + 1, CW - 2, cardH - 2, 21, p.card);

  // Hero.
  ctx.save();
  roundRect(ctx, M, cardY, CW, heroH, [21, 21, 0, 0]);
  ctx.clip();
  const hero = ctx.createLinearGradient(M, cardY, M + CW, cardY + heroH);
  hero.addColorStop(0, p.hero[0]);
  hero.addColorStop(0.45, p.hero[1]);
  hero.addColorStop(1, p.hero[2]);
  ctx.fillStyle = hero;
  ctx.fillRect(M, cardY, CW, heroH);
  ctx.strokeStyle = 'rgba(255, 219, 138, .12)';
  ctx.lineWidth = 1;
  for (let x = M - heroH; x < M + CW + heroH; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, cardY);
    ctx.lineTo(x + heroH * 0.72, cardY + heroH);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,.1)';
  ctx.beginPath();
  ctx.arc(M + CW - 36, cardY + 18, 90, 0, Math.PI * 2);
  ctx.fill();
  drawOrbits(ctx, M + CW - 126, cardY - 24, 158, '#ffe39f', 0.25);
  drawStar(ctx, M + CW - 78, cardY + 22, 36, '#ffe39f', 0.34);
  drawStar(ctx, M + CW - 124, cardY + 66, 20, '#ffe39f', 0.26);
  drawNode(ctx, M + CW - 58, cardY + 92, 30, '#ffd27a', 0.32);
  ctx.restore();
  const goldLine = ctx.createLinearGradient(M, 0, M + CW, 0);
  goldLine.addColorStop(0, 'rgba(240, 193, 90, .55)');
  goldLine.addColorStop(0.55, 'rgba(240, 193, 90, .2)');
  goldLine.addColorStop(1, 'rgba(240, 193, 90, 0)');
  ctx.fillStyle = goldLine;
  ctx.fillRect(M, cardY + heroH - 1, CW, 1.5);

  drawHeroMark(ctx, M + 14, cardY + 12, 18);
  ctx.font = `800 8.5px ${SANS}`;
  ctx.fillStyle = 'rgba(255,255,255,.95)';
  ctx.textAlign = 'left';
  // Canvas letterSpacing is supported in Chromium; harmless where it is not.
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '1.5px';
  ctx.fillText(brand().upper, M + 38, cardY + 25);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';

  const dateText = new Intl.DateTimeFormat(input.locale || 'ru-RU', { day: 'numeric', month: 'long' }).format(input.date);
  ctx.font = `600 9px ${SANS}`;
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.textAlign = 'right';
  ctx.fillText(dateText, M + CW - 14, cardY + 25);

  ctx.textAlign = 'left';
  label(ctx, t('title'), M + 14, cardY + 50, 12.5, 'rgba(255,255,255,.76)', 600);

  ctx.font = `750 38px ${SANS}`;
  ctx.fillStyle = '#ffffff';
  const tokensText = fmt(input.tokens);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-1.4px';
  ctx.fillText(tokensText, M + 14, cardY + 93);
  const tokensWidth = ctx.measureText(tokensText).width;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  ctx.font = `600 10.5px ${SANS}`;
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.fillText(t('tokensToday'), M + 14 + tokensWidth + 9, cardY + 93);

  ctx.font = `600 9.5px ${SANS}`;
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.fillText(`${t('input')} ${fmt(input.input)} · ${t('output')} ${fmt(input.output)}`, M + 14, cardY + 112);

  // Body.
  const bodyTop = cardY + heroH;
  caps(ctx, t('thisIs'), M + 14, bodyTop + 21, p.muted);

  ctx.font = `750 30px ${SANS}`;
  ctx.fillStyle = p.ink;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-1px';
  const countText = fmt(units);
  ctx.fillText(countText, M + 14, bodyTop + 51);
  const countWidth = ctx.measureText(countText).width;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  ctx.font = `500 11.5px ${SANS}`;
  ctx.fillStyle = p.muted;
  ctx.fillText(unitsLabel(units, product), M + 14 + countWidth + 7, bodyTop + 51);

  // Shelf.
  const shelfX = M + 14;
  const shelfW = CW - 28;
  const shelfY = bodyTop + 61;
  const shelfH = 44;
  fillRound(ctx, shelfX, shelfY, shelfW, shelfH, 12, p.surface2);
  roundRect(ctx, shelfX + 0.5, shelfY + 0.5, shelfW - 1, shelfH - 1, [12, 12, 12, 12]);
  ctx.strokeStyle = p.line;
  ctx.lineWidth = 1;
  ctx.stroke();

  const { full, partial } = slotsFor(units);
  const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
  const artSize = 28;
  const artGap = 3;
  const artImages = await Promise.all(
    Array.from({ length: visible }, () => loadImage(
      productArt(product.id).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" '),
    )),
  );
  artImages.forEach((image, index) => {
    const x = shelfX + 8 + index * (artSize + artGap);
    const y = shelfY + (shelfH - artSize) / 2;
    ctx.save();
    if (index >= full) ctx.globalAlpha = 0.26;
    if (image) {
      ctx.drawImage(image, x, y, artSize, artSize);
    } else {
      ctx.fillStyle = p.muted;
      ctx.beginPath();
      ctx.arc(x + artSize / 2, y + artSize / 2, artSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  const extra = Math.max(0, units - SLOTS);
  if (extra > 0) {
    const text = `+${fmt(extra)}`;
    ctx.font = `800 9.5px ${SANS}`;
    const badgeW = ctx.measureText(text).width + 12;
    const badgeX = shelfX + shelfW - 8 - badgeW;
    ctx.save();
    ctx.translate(badgeX + badgeW / 2, shelfY + shelfH / 2);
    ctx.rotate(-0.07);
    fillRound(ctx, -badgeW / 2, -9, badgeW, 18, 7, p.orange);
    ctx.fillStyle = '#2b0610';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0.5);
    ctx.restore();
  }

  // Supplies.
  const supplyY = shelfY + shelfH + 22;
  caps(ctx, t('supply'), M + 14, supplyY, p.muted);

  ctx.font = `600 10.5px ${SANS}`;
  ctx.fillStyle = p.ink;
  ctx.fillText(mood(percent), M + 64, supplyY);

  ctx.font = `750 12px ${SANS}`;
  ctx.fillStyle = p.ink;
  ctx.textAlign = 'right';
  ctx.fillText(`${percent}%`, M + CW - 14, supplyY);
  ctx.textAlign = 'left';

  const trackY = supplyY + 11;
  const trackW = CW - 28;
  fillRound(ctx, M + 14, trackY, trackW, 8, 999, p.surface3);
  const fillW = Math.max(0, Math.min(1, percent / 100)) * trackW;
  if (fillW > 0) {
    const bar = ctx.createLinearGradient(M + 14, 0, M + 14 + trackW, 0);
    if (percent >= 75) {
      bar.addColorStop(0, '#a46a12');
      bar.addColorStop(1, '#ffd27a');
    } else {
      bar.addColorStop(0, '#8e0f24');
      bar.addColorStop(1, '#ff8a9a');
    }
    fillRound(ctx, M + 14, trackY, Math.max(8, fillW), 8, 999, '#000');
    ctx.fillStyle = bar;
    ctx.fill();
  }

  ctx.font = `500 9px ${SANS}`;
  ctx.fillStyle = p.faint;
  ctx.fillText(`${t('dailySupply')} · ${fmt(input.budget)} ${t('tokens')}`, M + 14, trackY + 21);

  const borderGrad = ctx.createLinearGradient(M, cardY, M + CW, cardY + cardH);
  borderGrad.addColorStop(0, 'rgba(246, 218, 160, .72)');
  borderGrad.addColorStop(0.5, 'rgba(165, 31, 56, .52)');
  borderGrad.addColorStop(1, 'rgba(240, 193, 90, .65)');
  roundRect(ctx, M, cardY, CW, cardH, [22, 22, 22, 22]);
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Footer.
  ctx.font = `600 9px ${SANS}`;
  ctx.fillStyle = p.muted;
  ctx.textAlign = 'left';
  ctx.fillText(brand().footer, M + 2, footerY);
  ctx.textAlign = 'right';
  ctx.fillStyle = p.faint;
  ctx.fillText(t('footerStats'), M + CW - 2, footerY);
  ctx.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('x5: poster export failed'));
    }, 'image/png');
  });
};

export type PeriodPosterInput = {
  tokens: number;
  input: number;
  output: number;
  /** Budget for the whole period: daily budget × days. */
  budget: number;
  days: number;
  periodLabel: string;
  dateLabel: string;
  selectedProduct: ProductId;
  locale: string;
  theme: PosterTheme;
  daily: Array<{ date: string; tokens: number; input: number; output: number }>;
};

/** The wide period sheet: one row per product, like a shelf of variants. */
const drawPeriodHeader = (
  ctx: CanvasRenderingContext2D,
  p: Palette,
  input: PeriodPosterInput,
  M: number,
  CW: number,
  headerH: number,
): void => {
  ctx.save();
  ctx.shadowColor = input.theme === 'dark' ? 'rgba(0,0,0,.5)' : 'rgba(30,40,15,.16)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  fillRound(ctx, M, M, CW, headerH, 22, p.card);
  ctx.restore();
  ctx.save();
  roundRect(ctx, M, M, CW, headerH, [22, 22, 22, 22]);
  ctx.clip();
  const hero = ctx.createLinearGradient(M, M, M + CW, M + headerH);
  hero.addColorStop(0, p.hero[0]);
  hero.addColorStop(0.45, p.hero[1]);
  hero.addColorStop(1, p.hero[2]);
  ctx.fillStyle = hero;
  ctx.fillRect(M, M, CW, headerH);
  ctx.strokeStyle = 'rgba(255, 219, 138, .11)';
  ctx.lineWidth = 1;
  for (let x = M - headerH; x < M + CW + headerH; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, M);
    ctx.lineTo(x + headerH * 0.72, M + headerH);
    ctx.stroke();
  }
  drawOrbits(ctx, M + CW - 196, M - 42, 220, '#ffe39f', 0.24);
  drawStar(ctx, M + CW - 102, M + 18, 54, '#ffe39f', 0.3);
  drawStar(ctx, M + CW - 152, M + 78, 26, '#ffe39f', 0.24);
  drawNode(ctx, M + CW - 64, M + 92, 34, '#ffd27a', 0.32);
  ctx.restore();
  roundRect(ctx, M, M, CW, headerH, [22, 22, 22, 22]);
  ctx.strokeStyle = 'rgba(240, 193, 90, .42)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  drawHeroMark(ctx, M + 16, M + 14, 20);
  ctx.font = `800 9px ${SANS}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '1.6px';
  ctx.fillText(brand().upper, M + 42, M + 28);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  ctx.font = `600 9px ${SANS}`;
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.textAlign = 'right';
  ctx.fillText(input.dateLabel, M + CW - 16, M + 28);
  ctx.textAlign = 'left';

  label(ctx, t('title'), M + 16, M + 52, 12.5, 'rgba(255,255,255,.78)', 600);
  label(ctx, input.periodLabel, M + 16, M + 68, 9.5, 'rgba(255,255,255,.6)', 600);

  ctx.font = `750 34px ${SANS}`;
  ctx.fillStyle = '#fff';
  const tokensText = fmt(input.tokens);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-1.2px';
  ctx.fillText(tokensText, M + 16, M + 104);
  const tokensWidth = ctx.measureText(tokensText).width;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  ctx.font = `600 10px ${SANS}`;
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.fillText(t('tokens'), M + 16 + tokensWidth + 8, M + 96);

  ctx.textAlign = 'right';
  ctx.font = `650 9px ${SANS}`;
  ctx.fillStyle = 'rgba(255,255,255,.65)';
  ctx.fillText(`${t('inputUpper')}  ${fmt(input.input)}`, M + CW - 16, M + 54);
  ctx.fillText(`${t('outputUpper')}  ${fmt(input.output)}`, M + CW - 16, M + 70);
  ctx.textAlign = 'left';
};

const renderWeekPoster = async (input: PeriodPosterInput): Promise<Blob> => {
  const p = input.theme === 'dark' ? SKIN_DARK : SKIN_LIGHT;
  const W = 760;
  const M = 18;
  const CW = W - M * 2;
  const headerH = 122;
  const rowH = 74;
  const gap = 8;
  const rows = Math.max(1, input.daily.length);
  const rowsTop = M + headerH + 16;
  const footerH = 78;
  const footerY = rowsTop + rows * rowH + (rows - 1) * gap + 16;
  const H = footerY + footerH + M;

  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('x5: no 2d context');
  ctx.scale(2, 2);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  const aura = ctx.createRadialGradient(W - 60, 20, 20, W - 60, 20, 420);
  aura.addColorStop(0, p.glow);
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, W, H);
  drawOrbits(ctx, W - 240, H - 270, 300, p.ink, input.theme === 'dark' ? 0.05 : 0.035);
  drawStar(ctx, W - 110, H - 190, 42, p.ink, 0.06);

  drawPeriodHeader(ctx, p, input, M, CW, headerH);

  const arts = new Map<ProductId, HTMLImageElement | null>();
  await Promise.all(PRODUCTS.map(async (item) => {
    arts.set(item.id, await loadImage(
      productArt(item.id).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" '),
    ));
  }));
  const total = input.tokens || input.daily.reduce((sum, day) => sum + day.tokens, 0);
  const max = Math.max(1, ...input.daily.map((day) => day.tokens));

  input.daily.forEach((day, index) => {
    const y = rowsTop + index * (rowH + gap);
    fillRound(ctx, M, y, CW, rowH, 13, p.card);
    roundRect(ctx, M + 0.5, y + 0.5, CW - 1, rowH - 1, [13, 13, 13, 13]);
    ctx.strokeStyle = day.tokens === max && max > 0 ? p.orange : p.line;
    ctx.lineWidth = day.tokens === max && max > 0 ? 1.6 : 1;
    ctx.stroke();

    const date = new Date(`${day.date}T12:00:00`);
    const dayProduct = productForDay(date);
    const art = arts.get(dayProduct.id) ?? null;
    let weekday = day.date;
    let dateText = '';
    try {
      weekday = new Intl.DateTimeFormat(input.locale || 'ru-RU', { weekday: 'short' }).format(date);
      dateText = new Intl.DateTimeFormat(input.locale || 'ru-RU', { day: 'numeric', month: 'short' }).format(date);
    } catch {
      dateText = day.date;
    }
    label(ctx, weekday, M + 16, y + 30, 13, p.ink, 750);
    label(ctx, dateText, M + 16, y + 50, 9, p.muted, 500);

    ctx.font = `750 21px ${SANS}`;
    ctx.fillStyle = p.ink;
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-.5px';
    const dayTokensText = fmt(day.tokens);
    ctx.fillText(dayTokensText, M + 130, y + 36);
    const dayTokensWidth = ctx.measureText(dayTokensText).width;
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
    ctx.font = `500 9px ${SANS}`;
    ctx.fillStyle = p.muted;
    ctx.fillText(t('tokens'), M + 130 + dayTokensWidth + 6, y + 36);

    const count = Math.floor(day.tokens / dayProduct.per);
    ctx.font = `650 9.5px ${SANS}`;
    ctx.fillStyle = p.muted;
    ctx.fillText(`${fmt(count)} ${unitsLabel(count, dayProduct)}`, M + 130, y + 57);

    const { full, partial } = slotsFor(count);
    const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
    for (let slot = 0; slot < visible; slot += 1) {
      ctx.save();
      if (slot >= full) ctx.globalAlpha = 0.24;
      if (art) ctx.drawImage(art, M + 330 + slot * 20, y + 26, 18, 18);
      ctx.restore();
    }
    const extra = Math.max(0, count - SLOTS);
    if (extra > 0) {
      const text = `+${fmt(extra)}`;
      ctx.font = `800 8.5px ${SANS}`;
      const badgeW = ctx.measureText(text).width + 9;
      fillRound(ctx, M + 330 + visible * 20 + 3, y + 28, badgeW, 15, 7, p.orange);
      ctx.fillStyle = '#2b0610';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, M + 330 + visible * 20 + 3 + badgeW / 2, y + 35.5);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    const rx = M + CW - 196;
    const share = total > 0 ? Math.round((day.tokens / total) * 100) : 0;
    label(ctx, t('shareOfWeek', { share }), rx, y + 27, 9, p.muted, 650);
    const trackW = 180;
    fillRound(ctx, rx, y + 37, trackW, 7, 999, p.surface3);
    const fillW = Math.max(0, Math.min(1, share / 100)) * trackW;
    if (fillW > 0) {
      const bar = ctx.createLinearGradient(rx, 0, rx + trackW, 0);
      bar.addColorStop(0, '#8e0f24');
      bar.addColorStop(1, '#ffd27a');
      fillRound(ctx, rx, y + 37, Math.max(7, fillW), 7, 999, '#000');
      ctx.fillStyle = bar;
      ctx.fill();
    }
    label(ctx, `${t('input')} ${compact(day.input)} · ${t('output')} ${compact(day.output)}`, rx, y + 60, 8, p.faint, 500);
  });

  fillRound(ctx, M, footerY, CW, footerH, 16, p.card);
  roundRect(ctx, M + 0.5, footerY + 0.5, CW - 1, footerH - 1, [16, 16, 16, 16]);
  ctx.strokeStyle = p.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  label(ctx, t('thanks'), M + 16, footerY + 30, 12, p.ink, 750);
  label(
    ctx,
    brand().footer,
    M + 16,
    footerY + 50,
    9,
    p.muted,
    500,
  );
  ctx.textAlign = 'right';
  ctx.font = `650 10px ${SANS}`;
  ctx.fillStyle = p.muted;
  ctx.fillText(t('averagePerDay', { value: fmt(Math.round(total / Math.max(1, rows))) }), M + CW - 16, footerY + 30);
  ctx.font = `800 9px ${SANS}`;
  ctx.fillStyle = p.faint;
  ctx.fillText(brand().upper, M + CW - 16, footerY + 52);
  ctx.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('x5: week poster export failed'));
    }, 'image/png');
  });
};

const renderMonthPoster = async (input: PeriodPosterInput): Promise<Blob> => {
  const p = input.theme === 'dark' ? SKIN_DARK : SKIN_LIGHT;
  const W = 760;
  const M = 18;
  const CW = W - M * 2;
  const headerH = 122;
  const cols = 7;
  const gap = 8;
  const cellW = (CW - gap * (cols - 1)) / cols;
  const cellH = 58;
  const headRow = 26;
  const first = input.daily[0]?.date;
  const start = first ? new Date(`${first}T12:00:00`) : new Date();
  const offset = (start.getDay() + 6) % 7;
  const rows = Math.max(1, Math.ceil((offset + input.daily.length) / cols));
  const gridTop = M + headerH + 16 + headRow;
  const footerH = 78;
  const footerY = gridTop + rows * cellH + (rows - 1) * gap + 16;
  const H = footerY + footerH + M;

  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('x5: no 2d context');
  ctx.scale(2, 2);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  const aura = ctx.createRadialGradient(W - 60, 20, 20, W - 60, 20, 420);
  aura.addColorStop(0, p.glow);
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, W, H);
  drawOrbits(ctx, W - 240, H - 270, 300, p.ink, input.theme === 'dark' ? 0.05 : 0.035);
  drawStar(ctx, W - 110, H - 190, 42, p.ink, 0.06);

  drawPeriodHeader(ctx, p, input, M, CW, headerH);

  const names = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2024, 0, 1 + index);
    try {
      return new Intl.DateTimeFormat(input.locale || 'en-US', { weekday: 'short' }).format(date);
    } catch {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]!;
    }
  });
  ctx.font = `700 8.5px ${SANS}`;
  ctx.fillStyle = p.muted;
  ctx.textAlign = 'center';
  names.forEach((name, index) => {
    ctx.fillText(name, M + index * (cellW + gap) + cellW / 2, M + headerH + 16 + 16);
  });
  ctx.textAlign = 'left';

  const max = Math.max(1, ...input.daily.map((day) => day.tokens));
  input.daily.forEach((day, index) => {
    const cellIndex = offset + index;
    const col = cellIndex % cols;
    const row = Math.floor(cellIndex / cols);
    const x = M + col * (cellW + gap);
    const y = gridTop + row * (cellH + gap);
    fillRound(ctx, x, y, cellW, cellH, 10, p.card);
    const ratio = day.tokens / max;
    ctx.save();
    ctx.globalAlpha = 0.05 + ratio * 0.4;
    fillRound(ctx, x, y, cellW, cellH, 10, p.orange);
    ctx.restore();
    const last = index === input.daily.length - 1;
    if (last || day.tokens === max) {
      roundRect(ctx, x + 0.75, y + 0.75, cellW - 1.5, cellH - 1.5, [10, 10, 10, 10]);
      ctx.strokeStyle = p.orange;
      ctx.lineWidth = last ? 2 : 1.2;
      ctx.stroke();
    }
    const date = new Date(`${day.date}T12:00:00`);
    label(ctx, String(date.getDate()), x + 10, y + 20, 11, p.ink, 750);
    label(ctx, compact(day.tokens), x + 10, y + 38, 8.5, p.ink, 600);
    const barW = Math.max(0, (cellW - 20) * ratio);
    if (barW > 0) fillRound(ctx, x + 10, y + cellH - 10, barW, 3, 2, p.orange);
  });

  fillRound(ctx, M, footerY, CW, footerH, 16, p.card);
  roundRect(ctx, M + 0.5, footerY + 0.5, CW - 1, footerH - 1, [16, 16, 16, 16]);
  ctx.strokeStyle = p.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  label(ctx, t('thanks'), M + 16, footerY + 30, 12, p.ink, 750);
  label(
    ctx,
    brand().footer,
    M + 16,
    footerY + 50,
    9,
    p.muted,
    500,
  );
  ctx.textAlign = 'right';
  ctx.font = `650 10px ${SANS}`;
  ctx.fillStyle = p.muted;
  ctx.fillText(
    `${t('total')} ${compact(input.tokens)} · ${t('averagePerDay', { value: compact(Math.round(input.tokens / Math.max(1, input.daily.length))) })}`,
    M + CW - 16,
    footerY + 30,
  );
  ctx.font = `800 9px ${SANS}`;
  ctx.fillStyle = p.faint;
  ctx.fillText(brand().upper, M + CW - 16, footerY + 52);
  ctx.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('x5: month poster export failed'));
    }, 'image/png');
  });
};

/** Day - the card, week - seven day rows, month - a calendar. */
export const renderPeriodPoster = async (input: PeriodPosterInput): Promise<Blob> => {
  if (input.days <= 1) {
    const day = input.daily[0];
    return renderPoster({
      tokens: input.tokens,
      input: input.input,
      output: input.output,
      productId: input.selectedProduct,
      budget: input.budget,
      date: day ? new Date(`${day.date}T12:00:00`) : new Date(),
      locale: input.locale,
      theme: input.theme,
    });
  }
  if (input.days <= 7) return renderWeekPoster(input);
  return renderMonthPoster(input);
};
