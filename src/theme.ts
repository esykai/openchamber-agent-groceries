// The widget's own little design system. It deliberately does not borrow the
// app's surface colours: the card is a piece of the club, not a settings pane,
// and dark mode looks like rich dark paper rather than grey chrome.
export const BASE_CSS = `
:root, [data-oc-theme="light"] {
  color-scheme: light;
  --x5-green: #c62828;
  --x5-green-deep: #8e0f24;
  --x5-green-bright: #ff9eaa;
  --x5-orange: #c99a3e;
  --x5-orange-soft: rgba(201, 154, 62, .14);
  --x5-surface: #ffffff;
  --x5-surface-2: #fdf7f8;
  --x5-surface-3: #f5e6e8;
  --x5-line: #e8d2d6;
  --x5-line-strong: #d6b6bc;
  --x5-ink: #240f13;
  --x5-muted: #7c5d63;
  --x5-faint: #a5878d;
  --x5-accent-soft: rgba(198, 40, 40, .1);
  --x5-accent-line: rgba(198, 40, 40, .38);
  --x5-hero: linear-gradient(128deg, #3d0712 0%, #9d1130 46%, #d6a648 100%);
  --x5-hero-ink: #ffffff;
  --x5-hero-muted: rgba(255, 255, 255, .76);
  --x5-paper: #fffafa;
  --x5-paper-line: #e8d4d8;
  --x5-shadow: 0 1px 2px rgba(36, 15, 19, .06), 0 22px 46px -32px rgba(36, 15, 19, .7);
  --x5-glow: rgba(198, 40, 40, .16);
}

[data-oc-theme="dark"] {
  color-scheme: dark;
  --x5-green: #ff6b7f;
  --x5-green-deep: #c62828;
  --x5-green-bright: #ffb3bd;
  --x5-orange: #f0c15a;
  --x5-orange-soft: rgba(240, 193, 90, .16);
  --x5-surface: #180b10;
  --x5-surface-2: #231018;
  --x5-surface-3: #301620;
  --x5-line: #44222c;
  --x5-line-strong: #5c2e3b;
  --x5-ink: #fbf0f2;
  --x5-muted: #c7a7ae;
  --x5-faint: #9e7d85;
  --x5-accent-soft: rgba(240, 193, 90, .14);
  --x5-accent-line: rgba(240, 193, 90, .48);
  --x5-hero: linear-gradient(128deg, #1a0409 0%, #760d24 44%, #d2a34a 100%);
  --x5-hero-ink: #ffffff;
  --x5-hero-muted: rgba(255, 255, 255, .75);
  --x5-paper: #1d0c12;
  --x5-paper-line: #3d2029;
  --x5-shadow: 0 1px 0 rgba(255, 224, 166, .08), 0 26px 52px -28px rgba(0, 0, 0, .9);
  --x5-glow: rgba(255, 92, 118, .15);
}
`;
