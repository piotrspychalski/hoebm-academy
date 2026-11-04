// Tokeny: odczyt z CSS custom properties (src/shell.html :root) — jedno źródło prawdy dla canvasu i HTML
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const T = {
  c: { paper: cssVar('--paper'), ink: cssVar('--ink'), ink2: cssVar('--ink-2'), marker: cssVar('--marker'), hair: cssVar('--hair'), blood: cssVar('--blood') },
  f: { display: cssVar('--display'), sans: cssVar('--sans'), mono: cssVar('--mono') },
  line: parseFloat(cssVar('--line')) || 2,
  lineBold: parseFloat(cssVar('--line-bold')) || 6,
  revealMs: parseFloat(cssVar('--reveal-ms')) || 1200,
  cleanMs: parseFloat(cssVar('--clean-ms')) || 1500,
};
// Font canvasu: font('mono', 600, 20) → '600 20px "IBM Plex Mono", …'
const font = (fam, w, px) => `${w} ${px}px ${T.f[fam]}`;

// Scena 9:16 i strefa bezpieczna Reels (Meta: 14% góra, 35% dół, 6% boki)
const W = 1080, H = 1920;
const SAFE = { x0: 65, x1: 1015, y0: 269, y1: 1248 };
const L = SAFE.x0 + 30, R = SAFE.x1 - 30;   // wewnętrzne marginesy treści
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
