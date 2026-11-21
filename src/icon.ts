// The mark and the small glyphs. Everything is inline SVG: the package never
// loads a font or an icon CDN, and the rail icon is a clean silhouette in icon.svg.

/** The leaf on its brand tile. Used for the panel header. */
export const iconTile = (size = 26): string => `
<svg class="x5-icon" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="x5-tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5e0917"/>
      <stop offset=".55" stop-color="#b3122f"/>
      <stop offset="1" stop-color="#e8b95a"/>
    </linearGradient>
    <radialGradient id="x5-glow" cx=".25" cy=".1" r=".85">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".3"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#x5-tile)"/>
  <rect width="64" height="64" rx="16" fill="url(#x5-glow)"/>
  <path d="M50 10C29 10 17 21 17 36c0 9 6 14 15 14 14 0 18-16 18-40Z" fill="#fff"/>
  <path d="M20 53C26 41 34 32 45 25" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3" stroke-linecap="round"/>
  <path d="M16 12l2.1 4.9 4.9 2.1-4.9 2.1-2.1 4.9-2.1-4.9-4.9-2.1 4.9-2.1Z" fill="#ffd98a"/>
</svg>`;

/** A white leaf for the hero header. */
export const heroMark = (size = 20): string => `
<svg class="x5-icon" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <path d="M28 4C14.5 4 7.5 10.5 7.5 19.5c0 5 3.4 8 8.2 8C24.3 27.5 28 18.5 28 4Z" fill="currentColor"/>
  <path d="M9.8 28.6C12.8 21.4 18 15.6 24.4 12" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;

export const refreshGlyph = (): string => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M19 8.5A7.5 7.5 0 1 0 20.4 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M19.6 3.8v5.1h-5.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const settingsGlyph = (): string => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
  <circle cx="9" cy="7" r="2.3" fill="currentColor"/>
  <circle cx="15" cy="12" r="2.3" fill="currentColor"/>
  <circle cx="10" cy="17" r="2.3" fill="currentColor"/>
</svg>`;

export const imageGlyph = (): string => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <rect x="3" y="4.5" width="18" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <circle cx="9" cy="10" r="1.6" fill="currentColor"/>
  <path d="M4.5 17.5l5.2-5 4 3.4 3-2.6 2.8 2.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const gifGlyph = (): string => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <rect x="3" y="4.5" width="18" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <path d="M10 9l5 3-5 3V9Z" fill="currentColor"/>
  <path d="M6.5 4.5v15M17.5 4.5v15" stroke="currentColor" stroke-width="1.2" opacity=".35"/>
</svg>`;
