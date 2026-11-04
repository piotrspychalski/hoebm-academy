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

// Układy ryciny. Ryciny rysują panele w prostokątach z LY.boxes, więc ten sam kod daje oba układy.
//  portrait  — 1080 × 1920: studio / rolka i telefon (treść w strefie bezpiecznej Reels)
//  landscape — 1440 × 810: komputer (panele A | B | C obok siebie, tytuł w jednej linii)
const LAYOUTS = {
  portrait: {
    id: 'portrait', W: 1080, H: 1920, L, R,
    labelY: 312, logoY: 278, logoH: 46, ruleY: 330, titleY: 410, titleLh: 78, titlePx: 64, inline: false,
    readY: 515, readH: 82, legendBottom: SAFE.y1 - 10, legendPx: 20, legendCols: 1,
    boxes: { A: { x: L, y: 614, w: R - L, h: 186 }, B: { x: L, y: 830, w: R - L, h: 120 }, C: { x: L, y: 954, w: R - L, h: 177 } },
    bounds: { x0: SAFE.x0, x1: SAFE.x1, y0: SAFE.y0, y1: SAFE.y1 },
  },
  landscape: (() => {
    // 1440 × 810: na typowym laptopie skala ok. 0,8, więc napisy 22–24 px dają ok. 18–19 px na ekranie
    const L2 = 48, R2 = 1392, top = 300, h = 376, gap = 40, cw = (R2 - L2 - 2 * gap) / 3;
    return {
      id: 'landscape', W: 1440, H: 810, L: L2, R: R2,
      labelY: 56, logoY: 22, logoH: 42, ruleY: 76, titleY: 148, titleLh: 0, titlePx: 58, inline: true,
      readY: 182, readH: 84, legendBottom: 790, legendPx: 19, legendCols: 1,
      boxes: { A: { x: L2, y: top, w: cw, h }, B: { x: L2 + cw + gap, y: top, w: cw, h }, C: { x: L2 + 2 * (cw + gap), y: top, w: cw, h } },
      bounds: { x0: 24, x1: 1416, y0: 12, y1: 800 },
    };
  })(),
};
let LY = LAYOUTS.portrait;   // bieżący układ (ustawia scena)
