// Tokeny: odczyt z CSS custom properties (src/studio.html :root) — jedno źródło prawdy dla canvasu i HTML
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
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

// Rolka 9:16 w studiu: układ logiczny 720 × 742 rysowany ze skalą place.k = 950 / 720 ≈ 1,32 dokładnie w strefie
// bezpiecznej Reels (place.x, place.y). Karta tytułowa i zdjęcie z wyprawy rysują w tych współrzędnych.
const LAYOUTS = {
  reel: { id: 'reel', W: 720, H: 742, L: 16, R: 704, place: { x: SAFE.x0, y: SAFE.y0, k: (SAFE.x1 - SAFE.x0) / 720 } },
};
