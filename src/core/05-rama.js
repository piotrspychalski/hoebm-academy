// Rama ryciny: „FIG. n · SERIA”, logo w prawym górnym rogu, linia, tytuł z motywem „Science made clear”
// (wyostrzenie z rozmycia w T.revealMs; przy prefers-reduced-motion bez rozmycia), legenda na dole strefy bezpiecznej.
const _logo = new Image(); _logo.src = LOGO_SRC;
const LOGO_AR = 425.4677 / 98.7696;

function frameHeader(ctx, { label, title, highlight = -1, revealK = 1, markerK = 0 }) {
  txt(ctx, label, LY.L, LY.labelY, { font: font('mono', 600, 24), color: T.c.ink2, role: 'fig' });
  // Logo w ramce tylko w studiu (rolka nie ma nagłówka strony); na stronie logo jest w nagłówku (decyzja 2026-11-05)
  if (STUDIO && _logo.complete && _logo.naturalWidth) ctx.drawImage(_logo, LY.R - LY.logoH * LOGO_AR, LY.logoY, LY.logoH * LOGO_AR, LY.logoH);
  ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.line;
  ctx.beginPath(); ctx.moveTo(LY.L, LY.ruleY); ctx.lineTo(LY.R, LY.ruleY); ctx.stroke();
  const tf = font('display', 800, LY.titlePx), px = LY.titlePx;
  const lines = LY.titleW ? wrapTitle(ctx, title, tf, LY.titleW, highlight) : null;
  if (lines) {   // tytuł zawijany po słowach (rolka z kółkiem kamery); zakreślacz pod słowami wyróżnionego odcinka
    const ys = lines.map((_, i) => LY.titleY + i * LY.titleLh);
    if (markerK > 0) lines.forEach((ln, i) => { if (ln.hl) marker(ctx, LY.L + ln.hl[0] - 8, ys[i] - px * 0.66, ln.hl[1] - ln.hl[0] + 16, px, markerK); });
    titleText(ctx, revealK, () => lines.forEach((ln, i) => txt(ctx, ln.s, LY.L, ys[i], { font: tf, color: T.c.ink })));
    return;
  }
  // pozycje linii / odcinków tytułu: pionowo albo w jednej linii (landscape)
  ctx.font = tf;
  const sp = ctx.measureText(' ').width;
  let x = LY.L;
  const pos = title.map((s, i) => {
    const w = ctx.measureText(s).width;
    const p = LY.inline ? { x, y: LY.titleY, w } : { x: LY.L, y: LY.titleY + i * LY.titleLh, w };
    x += w + sp; return p;
  });
  if (highlight >= 0 && markerK > 0) { const p = pos[highlight]; marker(ctx, p.x - 8, p.y - px * 0.66, p.w + 16, px, markerK); }
  titleText(ctx, revealK, () => title.forEach((s, i) => txt(ctx, s, pos[i].x, pos[i].y, { font: tf, color: T.c.ink })));
}
// Tytuł wyostrza się z rozmycia (motyw „Science made clear”); przy prefers-reduced-motion bez rozmycia
function titleText(ctx, revealK, draw) {
  const blur = REDUCE ? 0 : 14 * (1 - smooth(revealK));
  ctx.save();
  if (blur > 0.3) { if ('filter' in ctx) ctx.filter = `blur(${blur.toFixed(1)}px)`; else ctx.globalAlpha *= 0.3 + 0.7 * revealK; }
  draw();
  ctx.restore();
}
// Zawijanie tytułu po słowach do szerokości maxW. Zwraca linie { s, hl: [x0, x1] | null } — hl to zakres słów
// z odcinka `highlight` (do zakreślacza). Używa go rama rolki z kamerą i karta tytułowa w studiu.
function wrapTitle(ctx, title, f, maxW, highlight = -1) {
  ctx.font = f;
  const words = title.flatMap((seg, i) => seg.split(/\s+/).filter(Boolean).map(w => ({ w, i })));
  const lines = []; let cur = [];
  const width = ws => ctx.measureText(ws.map(x => x.w).join(' ')).width;
  for (const wd of words) { if (cur.length && width([...cur, wd]) > maxW) { lines.push(cur); cur = []; } cur.push(wd); }
  if (cur.length) lines.push(cur);
  return lines.map(ws => {
    const k0 = ws.findIndex(x => x.i === highlight), k1 = ws.map(x => x.i).lastIndexOf(highlight);
    const hl = k0 < 0 ? null : [k0 ? width(ws.slice(0, k0)) + ctx.measureText(' ').width : 0, width(ws.slice(0, k1 + 1))];
    return { s: ws.map(x => x.w).join(' '), hl };
  });
}

// Legenda: linie od dołu strefy bezpiecznej w górę (ostatnia linia kończy się nad SAFE.y1 łącznie z wydłużeniami liter)
// Legenda: od dołu w górę (ostatnia linia nad LY.legendBottom). Linie dłuższe niż szerokość układu zawijają się
// między słowami; każde słowo zachowuje rolę i claim swojej części (cytowania, liczby).
function legendRows(ctx, lines, px = LY.legendPx) {
  ctx.font = font('mono', 400, px);
  const maxW = LY.R - LY.L, rows = [];
  for (const ln of lines) {
    const parts = Array.isArray(ln) ? ln : [{ s: ln }];
    const toks = parts.flatMap(p => p.s.split(/(?<= )/).filter(Boolean).map(s => ({ ...p, s })));
    let row = [], w = 0;
    for (let t of toks) {
      const tw = ctx.measureText(t.s.trimEnd()).width;
      if (row.length && w + tw > maxW) { rows.push(row); row = []; w = 0; }
      row.push(t); w += ctx.measureText(t.s).width;
    }
    if (row.length) rows.push(row);
  }
  return rows;
}
function frameLegend(ctx, lines, px = LY.legendPx) {
  const f = font('mono', 400, px), lh = Math.round(px * 1.25), rows = legendRows(ctx, lines, px);
  rows.forEach((row, i) => {
    const y = LY.legendBottom - (rows.length - 1 - i) * lh;
    let x = LY.L;
    row.forEach((p, k) => { const s = k === row.length - 1 ? p.s.trimEnd() : p.s; x += txt(ctx, s, x, y, { font: f, color: T.c.ink2, role: p.role || 'content', claim: p.claim }); });
  });
}

// Papier na całym płótnie, niezależnie od skali układu (rolka rysuje treść przeskalowaną, tło zostaje w pikselach płótna)
function framePaper(ctx) {
  const c = ctx.canvas; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = T.c.paper; ctx.fillRect(0, 0, c.width, c.height);
  for (let x = 0; x < c.width; x += W) ctx.drawImage(grain(), x, 0);   // ziarno 1080 × 1920, kafelkowane w poziomie
  ctx.restore();
}

function frameSafeZone(ctx) {
  ctx.fillStyle = 'rgba(217,192,207,0.55)';
  ctx.fillRect(0, 0, W, SAFE.y0); ctx.fillRect(0, SAFE.y1, W, H - SAFE.y1);
  ctx.fillRect(0, SAFE.y0, SAFE.x0, SAFE.y1 - SAFE.y0); ctx.fillRect(SAFE.x1, SAFE.y0, W - SAFE.x1, SAFE.y1 - SAFE.y0);
  ctx.font = font('sans', 600, 30); ctx.fillStyle = T.c.ink; ctx.textAlign = 'center';
  ctx.fillText('Reels UI covers this area', W / 2, SAFE.y1 + 80);   // poza logiem tekstu: to nakładka, nie treść
}
