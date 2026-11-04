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
  // pozycje linii / odcinków tytułu: pionowo (portrait) albo w jednej linii (landscape)
  ctx.font = tf;
  const sp = ctx.measureText(' ').width;
  let x = LY.L;
  const pos = title.map((s, i) => {
    const w = ctx.measureText(s).width;
    const p = LY.inline ? { x, y: LY.titleY, w } : { x: LY.L, y: LY.titleY + i * LY.titleLh, w };
    x += w + sp; return p;
  });
  if (highlight >= 0 && markerK > 0) { const p = pos[highlight]; marker(ctx, p.x - 8, p.y - px * 0.66, p.w + 16, px, markerK); }
  const blur = REDUCE ? 0 : 14 * (1 - smooth(revealK));
  ctx.save();
  if (blur > 0.3) { if ('filter' in ctx) ctx.filter = `blur(${blur.toFixed(1)}px)`; else ctx.globalAlpha = 0.3 + 0.7 * revealK; }
  title.forEach((s, i) => txt(ctx, s, pos[i].x, pos[i].y, { font: tf, color: T.c.ink }));
  ctx.restore();
}

// Legenda: linie od dołu strefy bezpiecznej w górę (ostatnia linia kończy się nad SAFE.y1 łącznie z wydłużeniami liter)
// Legenda: od dołu w górę (ostatnia linia nad LY.legendBottom). W układzie poziomym w dwóch kolumnach.
function frameLegend(ctx, lines, px = LY.legendPx) {
  const f = font('mono', 400, px), lh = Math.round(px * 1.25), cols = LY.legendCols;
  const per = Math.ceil(lines.length / cols), colW = (LY.R - LY.L) / cols;
  lines.forEach((ln, i) => {
    const c = Math.floor(i / per), k = i % per, nIn = Math.min(per, lines.length - c * per);
    const y = LY.legendBottom - (nIn - 1 - k) * lh;
    const parts = Array.isArray(ln) ? ln : [{ s: ln }];
    let x = LY.L + c * colW;
    for (const p of parts) x += txt(ctx, p.s, x, y, { font: f, color: T.c.ink2, role: p.role || 'content', claim: p.claim });
  });
}

function framePaper(ctx) {
  ctx.fillStyle = T.c.paper; ctx.fillRect(0, 0, LY.W, LY.H);
  for (let x = 0; x < LY.W; x += W) ctx.drawImage(grain(), x, 0);   // ziarno 1080 × 1920, kafelkowane w poziomie
}

function frameSafeZone(ctx) {
  ctx.fillStyle = 'rgba(217,192,207,0.55)';
  ctx.fillRect(0, 0, W, SAFE.y0); ctx.fillRect(0, SAFE.y1, W, H - SAFE.y1);
  ctx.fillRect(0, SAFE.y0, SAFE.x0, SAFE.y1 - SAFE.y0); ctx.fillRect(SAFE.x1, SAFE.y0, W - SAFE.x1, SAFE.y1 - SAFE.y0);
  ctx.font = font('sans', 600, 30); ctx.fillStyle = T.c.ink; ctx.textAlign = 'center';
  ctx.fillText('Reels UI covers this area', W / 2, SAFE.y1 + 80);   // poza logiem tekstu: to nakładka, nie treść
}
