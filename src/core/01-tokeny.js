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
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

// Układy ryciny. Ryciny rysują panele w prostokątach z LY.boxes (albo LY.scenes w rolce), więc ten sam kod daje wszystkie.
//  landscape — 1440 × 810: komputer i telefon poziomo (panele A | B | C obok siebie, tytuł w jednej linii)
//  phone     — 720 × 1100: telefon pionowo
//  reel      — 720 × 742 skalowane ×1,32 do strefy bezpiecznej Reels w kadrze 1080 × 1920 (studio)
const LAYOUTS = {
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
// phone — 720 × 1100: telefon trzymany pionowo (strona publiczna). Węższe płótno niż rolka, więc te same rozmiary
// czcionek są na ekranie telefonu ok. 1,5 raza większe (legenda ok. 11 px zamiast 7 px przy szerokości 390 px).
LAYOUTS.phone = (() => {
  const L3 = 24, R3 = 696, w = R3 - L3;
  return {
    id: 'phone', W: 720, H: 1100, L: L3, R: R3,
    labelY: 44, logoY: 18, logoH: 34, ruleY: 60, titleY: 120, titleLh: 54, titlePx: 46, inline: false,
    readY: 200, readH: 76, legendBottom: 1080, legendPx: 20, legendCols: 1,
    boxes: { A: { x: L3, y: 300, w, h: 200 }, B: { x: L3, y: 516, w, h: 150 }, C: { x: L3, y: 682, w, h: 230 } },
    bounds: { x0: 12, x1: 708, y0: 8, y1: 1094 },
  };
})();
// reel — rolka 9:16 w studiu. Strefa bezpieczna Reels (950 × 979 px) jest prawie kwadratowa i nie mieści trzech paneli
// z większymi napisami naraz, więc rolka pokazuje sceny: najpierw A + B (wysiłek), potem sam C (węglowodany).
// Układ logiczny 720 × 742 jest rysowany ze skalą place.k = 950 / 720 ≈ 1,32 w miejscu strefy (place.x, place.y):
// wszystkie napisy są ok. 1,3 raza większe niż w dawnym układzie 1080 × 1920, a treść zostaje w strefie.
LAYOUTS.reel = (() => {
  const L4 = 16, R4 = 704, w = R4 - L4, k = (SAFE.x1 - SAFE.x0) / 720;
  return {
    id: 'reel', W: 720, H: 742, L: L4, R: R4, place: { x: SAFE.x0, y: SAFE.y0, k },
    labelY: 30, logoY: 6, logoH: 32, ruleY: 46, titleY: 104, titleLh: 54, titlePx: 46, inline: false,
    readY: 170, readH: 74, legendBottom: 734, legendPx: 20, legendCols: 1,
    scenes: {
      AB: { A: { x: L4, y: 262, w, h: 206 }, B: { x: L4, y: 484, w, h: 150 } },
      C: { C: { x: L4, y: 262, w, h: 360 } },   // > 300: wysoki wariant panelu (wyższe słupki)
    },
    bounds: { x0: 0, x1: 720, y0: 0, y1: 742 },
  };
})();
let LY = LAYOUTS.phone;   // bieżący układ (ustawia scena)
