// An animated GIF of the widget: the card counts up, the shelf bobs, the
// supplies bar fills and a sheen sweeps across. Encoded with gifenc; one
// palette for all frames keeps it fast and consistent.
import { GIFEncoder, quantize } from './vendor/gifenc';
import { compact, fmt, mood, productById, productForDay, PRODUCTS, slotsFor, SLOTS, unitsLabel, type ProductId } from './core';
import { productArt } from './art';
import { brand, t } from './i18n';
import { SKIN_DARK, SKIN_LIGHT, drawNode, drawStar, drawOrbits } from './orbital';

export type GifInput = {
  tokens: number;
  input: number;
  output: number;
  productId: ProductId;
  budget: number;
  periodLabel: string;
  dateLabel: string;
  days: number;
  locale: string;
  theme: 'light' | 'dark';
  daily: Array<{ date: string; tokens: number; input: number; output: number }>;
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
  orange: string;
  hero: [string, string, string];
  glow: string;
};

const SANS = '"Segoe UI", system-ui, -apple-system, sans-serif';
const W = 600;
const H = 400;
const OUT_W = 1280;
const OUT_H = 720;
const SCENE_SCALE = OUT_H / H;
const SCENE_X = (OUT_W - W * SCENE_SCALE) / 2;
const SCENE_Y = 0;
const COLORS = 224;
const INTRO_FRAMES = 75;
const INTRO_DELAY = 40;
const INTRO_SECONDS = (INTRO_FRAMES * INTRO_DELAY) / 1000;
const HOLD_FRAMES = 300;
const HOLD_DELAY = 40;
const LOOP_FADE_OUT = 6;
const LOOP_FADE_PEAK = 2;
const LOOP_FADE_IN = 6;

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: [number, number, number, number],
): void => {
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
  value: string,
  x: number,
  y: number,
  size: number,
  color: string,
  weight = 600,
  align: CanvasTextAlign = 'left',
): void => {
  ctx.font = `${weight} ${size}px ${SANS}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const ease = (value: number): number => 1 - Math.pow(1 - value, 3);

const loadImage = (svg: string): Promise<HTMLImageElement | null> => new Promise((resolve) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});

const drawLeaf = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number): void => {
  const k = size / 32;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(28, 4);
  ctx.bezierCurveTo(14.5, 4, 7.5, 10.5, 7.5, 19.5);
  ctx.bezierCurveTo(7.5, 24.5, 10.9, 27.5, 15.7, 27.5);
  ctx.bezierCurveTo(24.3, 27.5, 28, 18.5, 28, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};


const drawSparkle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
): void => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x, y, x + size, y);
  ctx.quadraticCurveTo(x, y, x, y + size);
  ctx.quadraticCurveTo(x, y, x - size, y);
  ctx.quadraticCurveTo(x, y, x, y - size);
  ctx.fill();
  ctx.restore();
};

const drawCard = (
  ctx: CanvasRenderingContext2D,
  p: Palette,
  input: GifInput,
  images: Map<ProductId, HTMLImageElement | null>,
  progress: number,
  backdrop = true,
  time = progress * INTRO_SECONDS,
): void => {
  const M = 20;
  const CW = W - M * 2;
  const cardY = 20;
  const cardH = 340;
  const heroH = 112;
  const count = ease(clamp01((progress - 0.04) / 0.5));
  const bar = ease(clamp01((progress - 0.12) / 0.55));
  const phase = (time / 15) * Math.PI * 2;
  const bob = Math.sin(phase * 4);
  const shownTokens = Math.round(input.tokens * count);
  const product = productById(input.productId);
  const art = images.get(product.id);
  const percent = input.budget > 0 ? Math.round((shownTokens / input.budget) * 100) : 0;
  const unitCount = Math.floor(shownTokens / product.per);

  if (backdrop) {
    // Backdrop with a moving glow.
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(
      W - 70 + Math.sin(progress * Math.PI * 2) * 30,
      20,
      10,
      W - 70,
      20,
      360,
    );
    glow.addColorStop(0, p.glow);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Floating food in the backdrop.
    if (art) {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.drawImage(art, 30 + Math.sin(progress * Math.PI * 2) * 10, 300 + bob * 6, 120, 120);
      ctx.drawImage(art, 460 + Math.cos(progress * Math.PI * 2) * 8, 320 - bob * 5, 90, 90);
      ctx.restore();
    }
    drawOrbits(ctx, W - 210, H - 190, 240, p.ink, 0.05);
    drawStar(ctx, 82, 84 + bob * 8, 42, p.ink, 0.08);
    drawStar(ctx, 132, 52 - bob * 6, 24, p.ink, 0.06);
    drawNode(ctx, W - 96, H - 84, 34, p.orange, 0.06);
  }

  // Card.
  ctx.save();
  ctx.shadowColor = input.theme === 'dark' ? 'rgba(0,0,0,.55)' : 'rgba(30,40,15,.16)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 12;
  fillRound(ctx, M, cardY, CW, cardH, 24, p.card);
  ctx.restore();
  ctx.save();
  roundRect(ctx, M + 1, cardY + 1, CW - 2, cardH - 2, [23, 23, 23, 23]);
  ctx.clip();

  // Hero.
  const hero = ctx.createLinearGradient(M, cardY, M + CW, cardY + heroH);
  hero.addColorStop(0, p.hero[0]);
  hero.addColorStop(0.45, p.hero[1]);
  hero.addColorStop(1, p.hero[2]);
  ctx.fillStyle = hero;
  ctx.fillRect(M, cardY, CW, heroH);
  ctx.save();
  roundRect(ctx, M, cardY, CW, heroH, [23, 23, 0, 0]);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255, 219, 138, .12)';
  ctx.lineWidth = 1;
  for (let x = M - heroH; x < M + CW + heroH; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, cardY);
    ctx.lineTo(x + heroH * 0.72, cardY + heroH);
    ctx.stroke();
  }
  drawOrbits(ctx, M + CW - 150, cardY - 22, 170, '#ffe39f', 0.24);
  drawStar(ctx, M + CW - 90, cardY + 18, 44, '#ffe39f', 0.34);
  drawStar(ctx, M + CW - 136, cardY + 74, 22, '#ffe39f', 0.26);
  drawNode(ctx, M + CW - 66, cardY + 88, 30, '#ffd27a', 0.32);
  const heroTwinkle = (offset: number): number => 0.14 + 0.2 * (0.5 + 0.5 * Math.sin(phase * 8 + offset));
  drawSparkle(ctx, M + CW - 132, cardY + 38, 3, '#ffffff', heroTwinkle(0));
  drawSparkle(ctx, M + CW - 58, cardY + 92, 2, '#ffffff', heroTwinkle(1.9));
  ctx.restore();
  const goldLine = ctx.createLinearGradient(M, 0, M + CW, 0);
  goldLine.addColorStop(0, 'rgba(240, 193, 90, .55)');
  goldLine.addColorStop(0.55, 'rgba(240, 193, 90, .2)');
  goldLine.addColorStop(1, 'rgba(240, 193, 90, 0)');
  ctx.fillStyle = goldLine;
  ctx.fillRect(M, cardY + heroH - 1, CW, 1.5);

  drawLeaf(ctx, M + 16, cardY + 13, 21, '#ffffff', 1);
  ctx.font = `800 8.5px ${SANS}`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '1.5px';
  ctx.fillText(brand().upper, M + 43, cardY + 27);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  label(ctx, input.dateLabel, M + CW - 16, cardY + 27, 8.5, 'rgba(255,255,255,.72)', 600, 'right');
  label(ctx, t('title'), M + 16, cardY + 51, 12, 'rgba(255,255,255,.78)', 600);
  label(ctx, input.periodLabel, M + 16, cardY + 67, 9, 'rgba(255,255,255,.6)', 600);

  ctx.font = `750 34px ${SANS}`;
  ctx.fillStyle = '#fff';
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-1.2px';
  const tokensText = fmt(shownTokens);
  ctx.fillText(tokensText, M + 16, cardY + 99);
  const tokensWidth = ctx.measureText(tokensText).width;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  label(ctx, t('tokens'), M + 16 + tokensWidth + 8, cardY + 99, 9.5, 'rgba(255,255,255,.7)', 600);

  label(ctx, `${t('inputUpper')}  ${compact(input.input)}`, M + CW - 16, cardY + 52, 8.5, 'rgba(255,255,255,.66)', 650, 'right');
  label(ctx, `${t('outputUpper')}  ${compact(input.output)}`, M + CW - 16, cardY + 68, 8.5, 'rgba(255,255,255,.66)', 650, 'right');

  // Body: selected product and supplies.
  const bodyY = cardY + heroH;
  fillRound(ctx, M + 34, bodyY + 12, 82, 76, 18, p.surface2);
  roundRect(ctx, M + 34.5, bodyY + 12.5, 81, 75, [17, 17, 17, 17]);
  ctx.strokeStyle = p.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  const halo = ctx.createRadialGradient(M + 75, bodyY + 50, 4, M + 75, bodyY + 50, 38);
  halo.addColorStop(0, 'rgba(240, 193, 90, .22)');
  halo.addColorStop(1, 'rgba(240, 193, 90, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(M + 75, bodyY + 50, 38, 0, Math.PI * 2);
  ctx.fill();
  if (art) {
    const size = 62;
    ctx.save();
    ctx.translate(M + 44, bodyY + 19 + bob * 1.5);
    ctx.drawImage(art, 0, 0, size, size);
    ctx.restore();
  }

  label(ctx, t('thisIs'), M + 124, bodyY + 20, 8.5, p.muted, 700);
  ctx.font = `750 28px ${SANS}`;
  ctx.fillStyle = p.ink;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-.8px';
  const countText = fmt(unitCount);
  ctx.fillText(countText, M + 124, bodyY + 48);
  const countWidth = ctx.measureText(countText).width;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  label(ctx, unitsLabel(unitCount, product), M + 124 + countWidth + 6, bodyY + 48, 10.5, p.muted, 500);

  const { full, partial } = slotsFor(unitCount);
  const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
  for (let slot = 0; slot < visible; slot += 1) {
    const appear = ease(clamp01((progress - 0.1 - slot * 0.04) / 0.2));
    const slotBob = Math.sin(phase * 5 + slot * 0.8) * 1.5;
    const x = M + 124 + slot * 30;
    const y = bodyY + 62 + slotBob + (1 - appear) * 8;
    ctx.save();
    ctx.globalAlpha = (slot >= full ? 0.26 : 1) * appear;
    if (art) ctx.drawImage(art, x, y, 24, 24);
    ctx.restore();
  }
  const extra = Math.max(0, unitCount - SLOTS);
  if (extra > 0) {
    const text = `+${compact(extra)}`;
    ctx.font = `800 8.5px ${SANS}`;
    const badgeW = ctx.measureText(text).width + 9;
    const badgeX = Math.min(M + 124 + visible * 30 + 3, M + 330 - badgeW - 6);
    fillRound(ctx, badgeX, bodyY + 67, badgeW, 15, 7, p.orange);
    ctx.fillStyle = '#2b0610';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, badgeX + badgeW / 2, bodyY + 74.5);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // Divider.
  const divGrad = ctx.createLinearGradient(0, bodyY + 12, 0, bodyY + 80);
  divGrad.addColorStop(0, 'rgba(240, 193, 90, 0)');
  divGrad.addColorStop(0.5, 'rgba(240, 193, 90, .42)');
  divGrad.addColorStop(1, 'rgba(240, 193, 90, 0)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(M + 330, bodyY + 12);
  ctx.lineTo(M + 330, bodyY + 80);
  ctx.stroke();

  const sx = M + 350;
  label(ctx, t('supply'), sx, bodyY + 20, 8.5, p.muted, 700);
  label(ctx, mood(percent), sx + 58, bodyY + 20, 9.5, p.ink, 650);
  label(ctx, `${percent}%`, M + CW - 16, bodyY + 20, 14, p.ink, 750, 'right');

  const trackW = 180;
  fillRound(ctx, sx, bodyY + 32, trackW, 8, 999, p.surface3);
  const fillW = Math.max(0, Math.min(1, percent / 100)) * trackW * bar;
  if (fillW > 0) {
    const barGradient = ctx.createLinearGradient(sx, 0, sx + trackW, 0);
    if (percent >= 75) {
      barGradient.addColorStop(0, '#a46a12');
      barGradient.addColorStop(1, '#ffd27a');
    } else {
      barGradient.addColorStop(0, '#8e0f24');
      barGradient.addColorStop(1, '#ff8a9a');
    }
    fillRound(ctx, sx, bodyY + 32, Math.max(7, fillW), 8, 999, '#000');
    ctx.fillStyle = barGradient;
    ctx.fill();
    if (fillW > 10) {
      ctx.save();
      roundRect(ctx, sx, bodyY + 32, Math.max(7, fillW), 8, [999, 999, 999, 999]);
      ctx.clip();
      const shimmer = (((time / 5) % 1) * (trackW + 80)) - 40;
      const shine = ctx.createLinearGradient(sx + shimmer - 26, 0, sx + shimmer + 26, 0);
      shine.addColorStop(0, 'rgba(255,255,255,0)');
      shine.addColorStop(0.5, 'rgba(255,255,255,.35)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shine;
      ctx.fillRect(sx + shimmer - 26, bodyY + 32, 52, 8);
      ctx.restore();
    }
  }
  label(ctx, `${t('dailySupply')} · ${fmt(input.budget)}`, sx, bodyY + 56, 8.5, p.faint, 500);

  // A single day has no day strip: add a stats row and the full food shelf.
  if (input.days <= 1) {
    const statsY = bodyY + 92;
    const statGap = 10;
    const statW = (CW - 32 - statGap * 2) / 3;
    const stats = [
      { label: t('inputUpper'), value: compact(Math.round(input.input * count)) },
      { label: t('outputUpper'), value: compact(Math.round(input.output * count)) },
      { label: t('left'), value: compact(Math.max(0, input.budget - shownTokens)) },
    ];
    stats.forEach((stat, index) => {
      const x = M + 16 + index * (statW + statGap);
      fillRound(ctx, x, statsY, statW, 50, 10, p.surface2);
      roundRect(ctx, x + 0.5, statsY + 0.5, statW - 1, 49, [9, 9, 9, 9]);
      ctx.strokeStyle = p.line;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(240, 193, 90, .45)';
      ctx.fillRect(x + 12, statsY + 1, statW - 24, 1);
      ctx.beginPath();
      ctx.arc(x + statW - 12, statsY + 13, 2, 0, Math.PI * 2);
      ctx.fill();
      label(ctx, stat.label, x + 12, statsY + 15, 7.5, p.muted, 700);
      label(ctx, stat.value, x + 12, statsY + 34, 15, p.ink, 750);
      label(ctx, t('tokens'), x + 12, statsY + 45, 7, p.faint, 500);
    });

    const stripY = cardY + cardH - 56;
    fillRound(ctx, M + 16, stripY, CW - 32, 42, 12, p.surface2);
    roundRect(ctx, M + 16.5, stripY + 0.5, CW - 33, 41, [11, 11, 11, 11]);
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    const others = PRODUCTS.filter((item) => item.id !== product.id);
    const slotW = (CW - 32) / Math.max(1, others.length);
    others.forEach((item, index) => {
      const itemArt = images.get(item.id);
      const x = M + 28 + index * slotW;
      const stripCount = Math.floor(shownTokens / item.per);
      if (itemArt) ctx.drawImage(itemArt, x, stripY + 6, 18, 18);
      label(ctx, compact(stripCount), x + 23, stripY + 17, 9.5, p.ink, 750);
      label(ctx, unitsLabel(stripCount, item), x + 23, stripY + 31, 7.5, p.muted, 500);
    });
  }

  // Daily strip for week and month.
  if (input.days > 1 && input.daily.length > 0) {
    const max = Math.max(1, ...input.daily.map((day) => day.tokens));
    const bestIndex = input.daily.reduce(
      (best, day, index) => (day.tokens > (input.daily[best]?.tokens ?? -1) ? index : best),
      0,
    );
    const best = input.daily[bestIndex]!;
    const bestDate = new Date(`${best.date}T12:00:00`);
    const bestWeekday = new Intl.DateTimeFormat(input.locale || 'ru-RU', { weekday: 'short' }).format(bestDate);
    const bestDateText = new Intl.DateTimeFormat(input.locale || 'ru-RU', { day: 'numeric', month: 'short' }).format(bestDate);
    const average = Math.round(shownTokens / Math.max(1, input.daily.length));
    const stripLeft = M + 30;
    const stripW = CW - 60;

    if (input.days <= 7) {
      const stripH = 94;
      const stripY = cardY + cardH - stripH - 14;
      const summaryY = stripY - 20;
      label(ctx, t('bestDay'), M + 16, summaryY, 8, p.muted, 700);
      label(ctx, `${bestWeekday} · ${compact(Math.round(best.tokens * count))}`, M + 104, summaryY, 8.5, p.orange, 750);
      label(ctx, t('averagePerDay', { value: compact(average) }), M + CW - 16, summaryY, 8.5, p.faint, 500, 'right');

      fillRound(ctx, M + 16, stripY, CW - 32, stripH, 14, p.surface2);
      const slotW = (CW - 32) / input.daily.length;
      input.daily.forEach((day, index) => {
        const grow = ease(clamp01((progress - 0.2 - index * 0.035) / 0.35));
        const x = M + 16 + index * slotW + slotW / 2;
        const date = new Date(`${day.date}T12:00:00`);
        const dayProduct = productForDay(date);
        const dayArt = images.get(dayProduct.id);
        const isBest = index === bestIndex;
        let weekday = day.date;
        let dateText = '';
        try {
          weekday = new Intl.DateTimeFormat(input.locale || 'ru-RU', { weekday: 'short' }).format(date);
          dateText = new Intl.DateTimeFormat(input.locale || 'ru-RU', { day: 'numeric', month: 'short' }).format(date);
        } catch {
          dateText = day.date;
        }
        if (isBest) {
          roundRect(ctx, x - slotW / 2 + 4, stripY + 4, slotW - 8, stripH - 8, [11, 11, 11, 11]);
          ctx.strokeStyle = p.orange;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        label(ctx, weekday, x, stripY + 15, 9, isBest ? p.orange : p.ink, 750, 'center');
        label(ctx, dateText, x, stripY + 26, 7.5, p.muted, 500, 'center');
        if (dayArt) ctx.drawImage(dayArt, x - 10, stripY + 32, 20, 20);
        const dayShown = Math.round(day.tokens * count);
        label(ctx, compact(dayShown), x, stripY + 66, 8.5, isBest ? p.orange : p.ink, 700, 'center');
        const barH = Math.max(2, Math.round((day.tokens / max) * 15 * grow));
        fillRound(ctx, x - 12, stripY + stripH - 8 - barH, 24, barH, 2, p.orange);
      });
    } else {
      const stripH = 64;
      const stripY = cardY + cardH - stripH - 14;
      const summaryY = stripY - 16;
      label(ctx, t('bestDay'), M + 16, summaryY, 8, p.muted, 700);
      label(ctx, `${bestDateText} · ${compact(Math.round(best.tokens * count))}`, M + 104, summaryY, 8.5, p.orange, 750);
      label(ctx, t('averagePerDay', { value: compact(average) }), M + CW - 16, summaryY, 8.5, p.faint, 500, 'right');

      fillRound(ctx, M + 16, stripY, CW - 32, stripH, 12, p.surface2);
      const step = stripW / input.daily.length;
      input.daily.forEach((day, index) => {
        const grow = ease(clamp01((progress - 0.2 - index * 0.008) / 0.35));
        const x = stripLeft + index * step;
        const barH = Math.max(2, Math.round((day.tokens / max) * 34 * grow));
        fillRound(ctx, x, stripY + stripH - 8 - barH, Math.max(3, step - 2), barH, 2, p.orange);
      });
    }
  }

  // The sheen runs on the same five-second cycle through the intro and the
  // ambient passage, so the loop closes without a jump.
  // The first light sweep: one clean diagonal band during the three-second
  // intro only. Once the card has finished counting, the beam is gone.
  if (progress < 1) {
    const sheenX = -140 + progress * (CW + 280);
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = '#ffffff';
    ctx.translate(sheenX, cardY);
    ctx.rotate(-0.32);
    ctx.fillRect(0, -40, 80, cardH + 80);
    ctx.restore();
  }
  ctx.restore();

  // Double gold-crimson border + footer phrase.
  const borderGrad = ctx.createLinearGradient(M, cardY, M + CW, cardY + cardH);
  borderGrad.addColorStop(0, 'rgba(246, 218, 160, .75)');
  borderGrad.addColorStop(0.48, 'rgba(165, 31, 56, .55)');
  borderGrad.addColorStop(1, 'rgba(240, 193, 90, .68)');
  roundRect(ctx, M, cardY, CW, cardH, [24, 24, 24, 24]);
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  roundRect(ctx, M + 2.5, cardY + 2.5, CW - 5, cardH - 5, [22, 22, 22, 22]);
  ctx.strokeStyle = 'rgba(240, 193, 90, .09)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.globalAlpha = 1;
  label(ctx, t('thanks'), W / 2, 380, 12, p.ink, 750, 'center');
  label(
    ctx,
    brand().name,
    W / 2,
    395,
    8.5,
    p.muted,
    500,
    'center',
  );
  ctx.globalAlpha = 1;
};

const drawBackdrop = (
  ctx: CanvasRenderingContext2D,
  p: Palette,
  input: GifInput,
  images: Map<ProductId, HTMLImageElement | null>,
  time: number,
): void => {
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, OUT_W, OUT_H);

  const glow = ctx.createRadialGradient(OUT_W * 0.68, -160, 40, OUT_W * 0.68, -160, 1180);
  glow.addColorStop(0, p.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, OUT_W, OUT_H);

  const phase = (time / 15) * Math.PI * 2;
  const art = images.get(input.productId);
  if (art) {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.drawImage(
      art,
      24 + Math.sin(phase * 2 + 0.4) * 6,
      690 + Math.cos(phase * 3 + 0.8) * 5,
      360,
      360,
    );
    ctx.drawImage(
      art,
      OUT_W - 360 + Math.cos(phase * 3 + 0.2) * 5,
      120 + Math.sin(phase * 2 + 1.1) * 6,
      300,
      300,
    );
    ctx.restore();
  }
  drawOrbits(
    ctx,
    0 + Math.sin(phase + 0.3) * 4,
    720 + Math.cos(phase * 2 + 0.6) * 4,
    470,
    p.ink,
    0.06,
  );
  drawStar(
    ctx,
    OUT_W - 220 + Math.sin(phase * 2 + 0.5) * 8,
    180 + Math.cos(phase * 2) * 6,
    70,
    p.ink,
    0.14,
  );
  drawStar(
    ctx,
    120 + Math.cos(phase * 3 + 1.2) * 8,
    60 + Math.sin(phase * 4) * 5,
    38,
    p.ink,
    0.1,
  );
  drawNode(
    ctx,
    OUT_W - 330 + Math.sin(phase * 2 + 1.2) * 5,
    780 + Math.cos(phase * 3 + 1) * 4,
    64,
    p.orange,
    0.1,
  );

  const sparkleColor = input.theme === 'dark' ? '#ffe6a8' : '#c99a3e';
  const sparkles: Array<[number, number, number, number]> = [
    [82, 170, 3.6, 0],
    [150, 420, 2.4, 1.3],
    [118, 860, 3, 2.5],
    [1808, 220, 3.4, 0.8],
    [1758, 480, 2.4, 2.0],
    [1840, 760, 3, 3.0],
  ];
  for (const [x, y, size, offset] of sparkles) {
    const alpha = 0.08 + 0.2 * (0.5 + 0.5 * Math.sin(phase * 5 + offset));
    drawSparkle(
      ctx,
      x + Math.sin(phase * 3 + offset) * 6,
      y + Math.cos(phase * 2 + offset) * 5,
      size,
      sparkleColor,
      alpha,
    );
  }

  const vignette = ctx.createRadialGradient(
    OUT_W / 2,
    OUT_H / 2,
    OUT_H * 0.3,
    OUT_W / 2,
    OUT_H / 2,
    OUT_W * 0.72,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(
    1,
    input.theme === 'dark' ? 'rgba(0,0,0,.24)' : 'rgba(30,40,15,.10)',
  );
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, OUT_W, OUT_H);
};

export const renderGif = async (input: GifInput): Promise<Blob> => {
  const p = input.theme === 'dark' ? SKIN_DARK : SKIN_LIGHT;
  const images = new Map<ProductId, HTMLImageElement | null>();
  await Promise.all(PRODUCTS.map(async (product) => {
    images.set(product.id, await loadImage(
      productArt(product.id).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" '),
    ));
  }));

  const canvas = document.createElement('canvas');
  canvas.width = OUT_W;
  canvas.height = OUT_H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('x5: no 2d context');

  const draw = (progress: number, time: number, dip = 0): Uint8ClampedArray => {
    ctx.clearRect(0, 0, OUT_W, OUT_H);
    drawBackdrop(ctx, p, input, images, time);
    ctx.save();
    ctx.translate(SCENE_X, SCENE_Y);
    ctx.scale(SCENE_SCALE, SCENE_SCALE);
    drawCard(ctx, p, input, images, progress, false, time);
    ctx.restore();
    if (dip > 0) {
      // Erase the card content to its own paper colour, leaving the backdrop
      // and the footer untouched; the numbers can restart under a blank card.
      ctx.save();
      ctx.globalAlpha = Math.min(1, dip);
      ctx.translate(SCENE_X, SCENE_Y);
      ctx.scale(SCENE_SCALE, SCENE_SCALE);
      fillRound(ctx, 21, 21, 558, 338, 23, p.card);
      ctx.restore();
    }
    return ctx.getImageData(0, 0, OUT_W, OUT_H).data;
  };

  const finalData = draw(1, INTRO_SECONDS);
  const palette = quantize(finalData, COLORS);
  // Index 0 is reserved for transparency; content indices shift by one.
  const gifPalette: number[][] = [[0, 0, 0], ...palette];
  const transparentIndex = 0;
  const gif = GIFEncoder();

  // One RGB565 -> palette lookup table for the whole run. gifenc rebuilds its
  // cache per frame; at 25 fps that dominates, so keep it once.
  const toKey = (r: number, g: number, b: number): number => ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3);
  const lut = new Uint8Array(65536);
  for (let key = 0; key < 65536; key += 1) {
    const r5 = (key >> 11) & 0x1f;
    const g6 = (key >> 5) & 0x3f;
    const b5 = key & 0x1f;
    const r = (r5 << 3) | (r5 >> 2);
    const g = (g6 << 2) | (g6 >> 4);
    const b = (b5 << 3) | (b5 >> 2);
    let best = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < palette.length; index += 1) {
      const color = palette[index]!;
      const dr = r - (color[0] ?? 0);
      const dg = g - (color[1] ?? 0);
      const db = b - (color[2] ?? 0);
      const distance = dr * dr + dg * dg + db * db;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    }
    lut[key] = best;
  }

  const mapPalette = (rgba: Uint8ClampedArray): Uint8Array => {
    const length = rgba.length >> 2;
    const index = new Uint8Array(length);
    for (let pixel = 0; pixel < length; pixel += 1) {
      const offset = pixel * 4;
      index[pixel] = lut[toKey(rgba[offset] ?? 0, rgba[offset + 1] ?? 0, rgba[offset + 2] ?? 0)] ?? 0;
    }
    return index;
  };

  let previous: Uint8ClampedArray | null = null;

  const writeFrame = (data: Uint8ClampedArray, delay: number, _threshold = 0, full = false): void => {
    if (!previous || full) {
      const source = mapPalette(data);
      const index = new Uint8Array(source.length);
      for (let pixel = 0; pixel < source.length; pixel += 1) index[pixel] = (source[pixel] ?? 0) + 1;
      if (!previous) {
        gif.writeFrame(index, OUT_W, OUT_H, {
          palette: gifPalette,
          delay,
          repeat: 0,
          dispose: 1,
        });
      } else {
        gif.writeFrame(index, OUT_W, OUT_H, { delay, dispose: 1 });
      }
      previous = data;
      return;
    }

    // Only the changed rectangle is encoded. The rest of the poster stays on
    // screen from the previous frame, which keeps the 25 fps files small.
    const current32 = new Uint32Array(data.buffer, data.byteOffset, data.length >> 2);
    const previous32 = new Uint32Array(previous.buffer, previous.byteOffset, previous.length >> 2);
    let minX = OUT_W;
    let minY = OUT_H;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < OUT_H; y += 1) {
      const row = y * OUT_W;
      for (let x = 0; x < OUT_W; x += 1) {
        if (current32[row + x] !== previous32[row + x]) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < 0) {
      gif.writeFrame(new Uint8Array([transparentIndex]), 1, 1, {
        x: 0,
        y: 0,
        delay,
        transparent: true,
        transparentIndex,
        dispose: 1,
      });
      previous = data;
      return;
    }

    minX = Math.max(0, minX - 1);
    minY = Math.max(0, minY - 1);
    maxX = Math.min(OUT_W - 1, maxX + 1);
    maxY = Math.min(OUT_H - 1, maxY + 1);
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const sub = new Uint8ClampedArray(width * height * 4);
    for (let row = 0; row < height; row += 1) {
      const from = ((minY + row) * OUT_W + minX) * 4;
      sub.set(data.subarray(from, from + width * 4), row * width * 4);
    }
    const source = mapPalette(sub);
    const index = new Uint8Array(width * height);
    for (let row = 0; row < height; row += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixel = row * width + x;
        const fullPixel = (minY + row) * OUT_W + minX + x;
        index[pixel] = current32[fullPixel] === previous32[fullPixel]
          ? transparentIndex
          : (source[pixel] ?? 0) + 1;
      }
    }
    gif.writeFrame(index, width, height, {
      x: minX,
      y: minY,
      delay,
      transparent: true,
      transparentIndex,
      dispose: 1,
    });
    previous = data;
  };

  // The intro tells the whole story in under three seconds; the finished card
  // then keeps breathing for twelve seconds. At the end the card content sinks
  // into a blank card and reappears from zero, so the loop has no visible cut.
  for (let frame = 0; frame < INTRO_FRAMES; frame += 1) {
    const progress = frame / INTRO_FRAMES;
    writeFrame(draw(progress, progress * INTRO_SECONDS), INTRO_DELAY);
  }
  // The settled card starts as a full frame so the ambient passage is exactly
  // the finished picture, without a leftover intro sheen.
  previous = null;
  const transitionFrames = LOOP_FADE_OUT + LOOP_FADE_PEAK + LOOP_FADE_IN;
  const fadeStart = HOLD_FRAMES - transitionFrames;
  for (let hold = 0; hold < HOLD_FRAMES; hold += 1) {
    const time = INTRO_SECONDS + hold * (HOLD_DELAY / 1000);
    if (hold < fadeStart) {
      writeFrame(draw(1, time), HOLD_DELAY);
      continue;
    }
    const step = hold - fadeStart;
    if (step < LOOP_FADE_OUT) {
      writeFrame(draw(1, time, (step + 1) / LOOP_FADE_OUT), HOLD_DELAY);
    } else if (step < LOOP_FADE_OUT + LOOP_FADE_PEAK) {
      // Blank card colour hides the swap to the starting card.
      writeFrame(draw(step === LOOP_FADE_OUT ? 1 : 0, time, 1), HOLD_DELAY);
    } else if (hold === HOLD_FRAMES - 1) {
      // The last frame is the exact first picture, so the next cycle starts
      // on a frame the eye already sees.
      writeFrame(draw(0, 0, 0), HOLD_DELAY, 0, true);
    } else {
      const k = (step - LOOP_FADE_OUT - LOOP_FADE_PEAK + 1) / LOOP_FADE_IN;
      writeFrame(draw(0, time, 1 - k), HOLD_DELAY);
    }
  }

  gif.finish();
  return new Blob([gif.bytes().slice()], { type: 'image/gif' });
};
