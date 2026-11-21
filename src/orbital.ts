// The crimson-and-gold orbital skin: concentric rings, rays, stars and a warm
// gold accent, drawn on canvas for the PNG posters and the GIF.
export const SKIN_LIGHT = {
  bg: '#faf1f3',
  card: '#ffffff',
  line: '#e8d2d6',
  ink: '#240f13',
  muted: '#7c5d63',
  faint: '#a5878d',
  surface2: '#fdf7f8',
  surface3: '#f5e6e8',
  paper: '#fffafa',
  paperLine: '#e8d4d8',
  orange: '#c99a3e',
  hero: ['#3d0712', '#9d1130', '#d6a648'] as [string, string, string],
  glow: 'rgba(198, 40, 40, .18)',
};

export const SKIN_DARK = {
  bg: '#080407',
  card: '#190b10',
  line: '#45222c',
  ink: '#fbf0f2',
  muted: '#c7a7ae',
  faint: '#9e7d85',
  surface2: '#241118',
  surface3: '#311720',
  paper: '#1d0c12',
  paperLine: '#3d2029',
  orange: '#f0c15a',
  hero: ['#1a0409', '#760d24', '#d2a34a'] as [string, string, string],
  glow: 'rgba(255, 92, 118, .15)',
};

/** Concentric gold orbital crest with rays and a four-point star. */
export const drawOrbits = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
): void => {
  ctx.save();
  ctx.translate(x + size * 0.56, y + size * 0.44);
  const s = size / 170;
  ctx.scale(s, s);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  const sun = ctx.createRadialGradient(0, 0, 2, 0, 0, 95);
  sun.addColorStop(0, color);
  sun.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(0, 0, 95, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (const [r, dash, op] of [
    [28, [], 1.15],
    [54, [3, 4], 0.95],
    [82, [], 0.72],
    [112, [], 0.45],
  ] as Array<[number, number[], number]>) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha * op);
    ctx.lineWidth = 1.1;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = alpha * 0.62;
  ctx.lineWidth = 0.85;
  for (let i = 0; i < 4; i += 1) {
    const a = (i * Math.PI) / 4;
    const dx = Math.cos(a) * 116;
    const dy = Math.sin(a) * 116;
    ctx.beginPath();
    ctx.moveTo(-dx, -dy);
    ctx.lineTo(dx, dy);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha * 1.6);
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(2.2, -2.2);
  ctx.lineTo(8, 0);
  ctx.lineTo(2.2, 2.2);
  ctx.lineTo(0, 8);
  ctx.lineTo(-2.2, 2.2);
  ctx.lineTo(-8, 0);
  ctx.lineTo(-2.2, -2.2);
  ctx.closePath();
  ctx.fill();

  for (const [ox, oy, r] of [[-54, 0, 2.1], [0, 54, 1.9], [-58, 56, 1.6]] as Array<[number, number, number]>) {
    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
};

/** Four-point diamond star with a soft orbital ring. */
export const drawStar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
): void => {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const r = size * 0.24;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.quadraticCurveTo(0, 0, 0, r);
  ctx.quadraticCurveTo(0, 0, -r, 0);
  ctx.quadraticCurveTo(0, 0, 0, -r);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = alpha * 0.45;
  ctx.lineWidth = Math.max(0.75, size / 28);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

/** Faceted diamond node accent. */
export const drawNode = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number,
): void => {
  ctx.save();
  ctx.translate(x + size * 0.5, y + size * 0.45);
  const r = size * 0.34;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-r, 0);
  ctx.closePath();
  ctx.stroke();

  ctx.globalAlpha = alpha * 0.55;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** Small SVG star mark for the hero. */
export const starMark = (): string => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M12 3.5 13.9 10.1 20.5 12 13.9 13.9 12 20.5 10.1 13.9 3.5 12 10.1 10.1Z" fill="currentColor"/>
  <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
</svg>`;

/** Orbital sunburst SVG for the hero. */
export const orbitMark = (): string => `
<svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">
  <g fill="none" stroke="currentColor">
    <circle cx="96" cy="64" r="24" stroke-width="1.1" opacity=".65"/>
    <circle cx="96" cy="64" r="46" stroke-width="1.1" stroke-dasharray="3 4" opacity=".55"/>
    <circle cx="96" cy="64" r="70" stroke-width="1" opacity=".38"/>
    <circle cx="96" cy="64" r="96" stroke-width=".9" opacity=".24"/>
    <path d="M96 0v136M28 64h136M48 16l96 96M144 16l-96 96" stroke-width=".8" opacity=".28"/>
    <path d="M4 134C48 76 92 48 158 78" stroke-width="1.3" opacity=".48"/>
  </g>
  <g fill="currentColor">
    <path d="M96 55l2.2 6.8 6.8 2.2-6.8 2.2L96 73l-2.2-6.8L87 64l6.8-2.2Z" opacity=".9"/>
    <circle cx="50" cy="64" r="2" opacity=".75"/>
    <circle cx="96" cy="110" r="1.8" opacity=".7"/>
  </g>
</svg>`;

/** Small diamond node accent for the hero. */
export const nodeMark = (): string => `
<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
  <path d="M24 8 38 24 24 40 10 24Z" fill="none" stroke="currentColor" stroke-width="1.8" opacity=".7"/>
  <path d="M24 15 31 24 24 33 17 24Z" fill="currentColor" opacity=".35"/>
  <circle cx="24" cy="24" r="2.6" fill="currentColor"/>
</svg>`;
