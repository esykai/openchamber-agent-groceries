// Product art, drawn as inline SVG so the package stays a folder of files and
// the card keeps its shape on any theme, scale and zoom. Each drawing shares a
// soft top-left light, a warm shadow and a 48×48 box; ids are prefixed per
// product so several of them can live in one page.
import type { ProductId } from './core';

const BOX = '0 0 48 48';

const shadow = `<ellipse cx="24" cy="45" rx="12" ry="1.9" fill="#2a160c" opacity=".16"/>`;

const grechka = `
<defs>
  <linearGradient id="g-gr-paper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fbf0d8"/><stop offset=".5" stop-color="#edd9b6"/><stop offset="1" stop-color="#d9bd93"/>
  </linearGradient>
  <linearGradient id="g-gr-label" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#a9632f"/><stop offset="1" stop-color="#6f3a17"/>
  </linearGradient>
  <linearGradient id="g-gr-grain" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f0c47c"/><stop offset="1" stop-color="#c98a3d"/>
  </linearGradient>
</defs>
${shadow}
<path d="M13 13.5h22l1.4 27.2c.1 2-1.2 3.3-3.2 3.3H14.8c-2 0-3.3-1.3-3.2-3.3L13 13.5Z" fill="url(#g-gr-paper)"/>
<path d="M13.2 13.5h21.6l.2 4.6H13l.2-4.6Z" fill="#d3b384"/>
<path d="M13.5 12.9l1.5-3.3 2.2 3.2 2.3-3.2 2.2 3.2 2.3-3.2 2.2 3.2 2.3-3.2 2.2 3.2 2.3-3.2 1.5 3.3" fill="none" stroke="#b58f5c" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M14.6 18.4c4.4 1.4 14.4 1.4 18.8 0" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".38"/>
<rect x="17.4" y="22.8" width="13.2" height="14.6" rx="4.6" fill="url(#g-gr-label)"/>
<rect x="18.6" y="24" width="10.8" height="12.2" rx="3.4" fill="none" stroke="#e8b96b" stroke-width=".7" opacity=".65"/>
<path d="M24 35.4V25.6" stroke="#e8b96b" stroke-width="1.1" stroke-linecap="round"/>
<g fill="#f0c47c">
  <ellipse cx="21.8" cy="27.6" rx="1.6" ry=".9" transform="rotate(-38 21.8 27.6)"/>
  <ellipse cx="26.2" cy="27.6" rx="1.6" ry=".9" transform="rotate(38 26.2 27.6)"/>
  <ellipse cx="21.8" cy="30.6" rx="1.6" ry=".9" transform="rotate(-38 21.8 30.6)"/>
  <ellipse cx="26.2" cy="30.6" rx="1.6" ry=".9" transform="rotate(38 26.2 30.6)"/>
  <ellipse cx="24" cy="24.6" rx="1.1" ry="1.5"/>
</g>
<path d="M16.1 17.5v21.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".42"/>
<path d="M31.8 17.5c.2 6.6.3 13.6.2 21" stroke="#8a5a2c" stroke-width="1.1" stroke-linecap="round" opacity=".18"/>
`;

const pelmeni = `
<defs>
  <linearGradient id="g-pl-dough" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff8e6"/><stop offset=".55" stop-color="#f5e3bd"/><stop offset="1" stop-color="#e3c58f"/>
  </linearGradient>
  <linearGradient id="g-pl-back" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f8e9c8"/><stop offset="1" stop-color="#dcc08a"/>
  </linearGradient>
</defs>
${shadow}
<ellipse cx="16.4" cy="29.4" rx="9.2" ry="7" fill="url(#g-pl-back)" opacity=".8"/>
<ellipse cx="32.2" cy="30.2" rx="8.6" ry="6.6" fill="url(#g-pl-back)" opacity=".72"/>
<path d="M24 18.6c7.7 0 13.4 5 13.4 11.2S31.7 40.4 24 40.4 10.6 36 10.6 29.8 16.3 18.6 24 18.6Z" fill="url(#g-pl-dough)" stroke="#c9a46b" stroke-width="1.2"/>
<path d="M12.2 29.3c1.4-2 3.5-3.4 6-4.1M19.2 22.4c1-1.6 2.7-2.8 4.8-3.4M27.6 18.7c1.6-.8 3.5-1.1 5.4-.9M33.4 21.1c1.9 1.2 3.2 2.9 4 4.9" fill="none" stroke="#c9a46b" stroke-width="1.35" stroke-linecap="round"/>
<path d="M13 30.1c-.6 4.6 4.2 8.1 11 8.1s11.6-3.5 11-8.1" fill="none" stroke="#b98f55" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
<ellipse cx="19.4" cy="27.8" rx="4.6" ry="2.1" fill="#fff" opacity=".5"/>
<ellipse cx="28.6" cy="29.4" rx="1.4" ry="1" fill="#fff" opacity=".32"/>
<circle cx="22.6" cy="33.6" r=".7" fill="#a97c42" opacity=".45"/>
<circle cx="25.8" cy="35" r=".6" fill="#a97c42" opacity=".38"/>
<circle cx="28.6" cy="33.2" r=".55" fill="#a97c42" opacity=".35"/>
`;

const baton = `
<defs>
  <linearGradient id="g-bt-crust" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f9dda3"/><stop offset=".45" stop-color="#efc079"/><stop offset="1" stop-color="#cf8f3e"/>
  </linearGradient>
  <linearGradient id="g-bt-top" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff1cc"/><stop offset="1" stop-color="#e9b164" stop-opacity="0"/>
  </linearGradient>
</defs>
${shadow}
<g transform="rotate(-17 24 26)">
  <rect x="5.5" y="19.4" width="37" height="13.2" rx="6.6" fill="url(#g-bt-crust)"/>
  <rect x="5.5" y="19.4" width="37" height="6.2" rx="3.1" fill="url(#g-bt-top)" opacity=".9"/>
  <path d="M11.2 25.2l4.6 5.4M17.6 22.8l4.8 6M24.2 21.8l4.6 6.2M30.6 22.4l4.2 5.6M35.8 24.4l3 3.8" fill="none" stroke="#b26f2b" stroke-width="1.7" stroke-linecap="round" opacity=".8"/>
  <path d="M11.2 24.8l4.6 5.4M17.6 22.4l4.8 6M24.2 21.4l4.6 6.2M30.6 22l4.2 5.6M35.8 24l3 3.8" fill="none" stroke="#ffe9bb" stroke-width=".7" stroke-linecap="round" opacity=".65"/>
  <ellipse cx="14.4" cy="21.8" rx="1" ry=".55" fill="#fdf2d6" opacity=".8"/>
  <ellipse cx="22.2" cy="20.9" rx=".9" ry=".5" fill="#fdf2d6" opacity=".7"/>
  <ellipse cx="31.6" cy="21.4" rx=".95" ry=".52" fill="#fdf2d6" opacity=".75"/>
  <path d="M9 21.2c5.2-1.7 20.8-1.9 27 .2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".38"/>
</g>
<ellipse cx="24" cy="42.2" rx="16" ry="1.6" fill="#2a160c" opacity=".07"/>
`;

const moloko = `
<defs>
  <linearGradient id="g-ml-carton" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1f7fc"/><stop offset="1" stop-color="#dbe7f2"/>
  </linearGradient>
  <linearGradient id="g-ml-blue" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#8fc6ec"/><stop offset="1" stop-color="#4e93c8"/>
  </linearGradient>
  <linearGradient id="g-ml-cap" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6fa9d2"/><stop offset="1" stop-color="#3f7fae"/>
  </linearGradient>
</defs>
${shadow}
<path d="M15.4 18.2h17.2v24.1c0 1.5-1.1 2.6-2.6 2.6H18c-1.5 0-2.6-1.1-2.6-2.6V18.2Z" fill="url(#g-ml-carton)"/>
<path d="M15.4 18.2 24 10.4l8.6 7.8H15.4Z" fill="#e7f0f8"/>
<path d="M15.4 18.2 24 10.4l8.6 7.8" fill="none" stroke="#c9d9e8" stroke-width="1.1" stroke-linejoin="round"/>
<path d="M24 10.4v7.8" stroke="#c9d9e8" stroke-width="1"/>
<rect x="28.4" y="12.6" width="4.4" height="6.2" rx="1.4" fill="url(#g-ml-cap)" transform="rotate(37 30.6 15.7)"/>
<rect x="17.2" y="24.4" width="13.6" height="12.4" rx="3.4" fill="url(#g-ml-blue)"/>
<path d="M20 31.4c0-3.5 3.4-4.6 4.1-1.1 1.2-3.5 4.6-2.4 4.6 1.1" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
<path d="M18.1 35.6h11.8" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".55"/>
<path d="M16.6 18.9v22.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>
<path d="M31.5 18.9v22.4" stroke="#9db8cf" stroke-width="1" stroke-linecap="round" opacity=".35"/>
`;

const banany = `
<defs>
  <linearGradient id="g-bn-back" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f7d05a"/><stop offset="1" stop-color="#d9a62c"/>
  </linearGradient>
  <linearGradient id="g-bn-front" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffe680"/><stop offset=".5" stop-color="#f6c93f"/><stop offset="1" stop-color="#d7a124"/>
  </linearGradient>
</defs>
${shadow}
<path d="M12.8 11.8c-3.1 8.5-.7 17.3 6.8 21.9 4.1 2.5 8.4 2.4 11.5.1-6.8-.9-12.7-8.3-13.2-19.9-.1-2.4-2.8-3.8-5.1-2.1Z" fill="url(#g-bn-back)" opacity=".75" transform="translate(3 2)"/>
<path d="M13.8 11.4c-3.4 8.7-.9 17.8 6.9 22.4 4.2 2.5 8.6 2.4 11.7.1-6.9-.9-13-8.4-13.5-20.4-.1-2.5-2.9-3.9-5.1-2.1Z" fill="url(#g-bn-front)"/>
<path d="M19.4 15.2c.9 9 6.4 16 14 18.2" fill="none" stroke="#c1871d" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>
<path d="M22.6 21.8c1.4 5.6 4.6 9.7 8.5 11.5" fill="none" stroke="#fff3b8" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>
<path d="M17.4 11.2c-2.1-.5-3.9.4-4.3 2.3" fill="none" stroke="#7d5a1d" stroke-width="2.3" stroke-linecap="round"/>
<path d="M31.4 34.2c2.9 1 5.6.4 6.9-1.6" fill="none" stroke="#7d5a1d" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>
<ellipse cx="24.2" cy="19.3" rx="3.4" ry="1.2" fill="#fff8d0" opacity=".55" transform="rotate(61 24.2 19.3)"/>
`;

const tykva = `
<defs>
  <linearGradient id="g-tk-body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffb35c"/><stop offset=".5" stop-color="#f08a24"/><stop offset="1" stop-color="#c9610f"/>
  </linearGradient>
  <linearGradient id="g-tk-lobe" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ed8620"/><stop offset="1" stop-color="#b9550b"/>
  </linearGradient>
  <linearGradient id="g-tk-stem" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#9c7a3d"/><stop offset="1" stop-color="#5f4420"/>
  </linearGradient>
</defs>
${shadow}
<path d="M24 12.2c-1.3-3.2 1.1-5.4 4.4-5.1-1 2.6-.2 4.4 1 5.6" fill="none" stroke="url(#g-tk-stem)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M23.8 14.6c-8.4-2.4-14.6 3-14.6 12 0 7.7 5.2 12.8 14.8 12.8s14.8-5.1 14.8-12.8c0-9-6.2-14.4-14.6-12Z" fill="url(#g-tk-body)"/>
<path d="M16 15.8c-4.7 2.4-6.8 8-5.4 14 .9 4 3.5 6.8 7.2 7.8-3-3.6-4.4-8.2-3.9-13.4.4-3.6 1.6-6.6 2.1-8.4Z" fill="url(#g-tk-lobe)" opacity=".85"/>
<path d="M32 15.8c4.7 2.4 6.8 8 5.4 14-.9 4-3.5 6.8-7.2 7.8 3-3.6 4.4-8.2 3.9-13.4-.4-3.6-1.6-6.6-2.1-8.4Z" fill="url(#g-tk-lobe)" opacity=".85"/>
<path d="M19.4 19.6c-1.3 5.4-1.1 12.2 1.2 17.6M28.6 19.6c1.3 5.4 1.1 12.2-1.2 17.6" fill="none" stroke="#a94c08" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>
<path d="M24 16.2c-.9 6.2-.9 14.8 0 21.6" fill="none" stroke="#a94c08" stroke-width=".9" stroke-linecap="round" opacity=".32"/>
<path d="M17.2 19.4c1.8-2.1 4.2-3.3 6.8-3.6" fill="none" stroke="#ffd39a" stroke-width="1.7" stroke-linecap="round" opacity=".65"/>
<path d="M35.2 12.4c1.9 1 3.1 2.6 3.5 4.7" fill="none" stroke="#6d8f34" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>
<path d="M35.2 12.4c-2.6-.6-4.7.2-5.9 2.2 2.3 1.5 4.5 1.3 6.4-.4" fill="#7da63a" opacity=".9"/>
`;

const konfety = `
<defs>
  <linearGradient id="g-kf-body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ff8f7a"/><stop offset=".45" stop-color="#e2413f"/><stop offset="1" stop-color="#9d0f24"/>
  </linearGradient>
  <linearGradient id="g-kf-wrap" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffc97d"/><stop offset="1" stop-color="#dd6f1c"/>
  </linearGradient>
</defs>
${shadow}
<path d="M5.5 24c2.2-2.6 4.7-4.7 7.6-6.1 1 1.9 1.5 4 1.5 6.1s-.5 4.2-1.5 6.1c-2.9-1.4-5.4-3.5-7.6-6.1Z" fill="url(#g-kf-wrap)"/>
<path d="M42.5 24c-2.2-2.6-4.7-4.7-7.6-6.1-1 1.9-1.5 4-1.5 6.1s.5 4.2 1.5 6.1c2.9-1.4 5.4-3.5 7.6-6.1Z" fill="url(#g-kf-wrap)"/>
<path d="M7.4 24c1.5-1.5 3.2-2.9 5-4M7.4 24c1.5 1.5 3.2 2.9 5 4M40.6 24c-1.5-1.5-3.2-2.9-5-4M40.6 24c-1.5 1.5-3.2 2.9-5 4" fill="none" stroke="#b9560f" stroke-width=".9" stroke-linecap="round" opacity=".55"/>
<path d="M14.8 24c0-5 4.1-8.6 9.2-8.6s9.2 3.6 9.2 8.6-4.1 8.6-9.2 8.6-9.2-3.6-9.2-8.6Z" fill="url(#g-kf-body)"/>
<path d="M17 22.3c1.9-3.2 5.5-5 9-4.6 2.6.3 4.8 1.6 6.2 3.6-3-1.6-6.7-1.8-10-.4-1.9.8-3.7 2.1-5.2 3.8l-.6-1.2.6-1.2Z" fill="#ffd9c2" opacity=".32"/>
<path d="M18.6 27.4c3.3-1.4 6.8-1.4 10.1 0" fill="none" stroke="#ffb09e" stroke-width="1.1" stroke-linecap="round" opacity=".55"/>
<path d="M18.4 20.1c2.7-2 6.7-2.4 9.6-.9" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".45"/>
<ellipse cx="14.9" cy="24" rx="1.3" ry="2.7" fill="#b9560f" opacity=".55"/>
<ellipse cx="33.1" cy="24" rx="1.3" ry="2.7" fill="#b9560f" opacity=".55"/>
<circle cx="21" cy="26.4" r="1" fill="#fff" opacity=".5"/>
<circle cx="26.2" cy="28.2" r=".8" fill="#fff" opacity=".36"/>
`;

const ART: Record<ProductId, string> = { grechka, pelmeni, baton, moloko, banany, tykva, konfety };

/** One product, 48×48, full colour. */
export const productArt = (id: ProductId): string =>
  `<svg class="x5-art-svg" viewBox="${BOX}" aria-hidden="true" focusable="false">${ART[id]}</svg>`;
