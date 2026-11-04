// Rama ryciny: „FIG. n · SERIA”, logo w prawym górnym rogu, linia, tytuł z motywem „Science made clear”
// (wyostrzenie z rozmycia w T.revealMs; przy prefers-reduced-motion bez rozmycia), legenda na dole strefy bezpiecznej.
const _logo = new Image(); _logo.src = LOGO_SRC;
const LOGO_AR = 425.4677 / 98.7696;

function frameHeader(ctx, { label, title, highlight = -1, revealK = 1, markerK = 0 }) {
  txt(ctx, label, L, 312, { font: font('mono', 600, 24), color: T.c.ink2, role: 'fig' });
  if (_logo.complete && _logo.naturalWidth) { const lh = 46; ctx.drawImage(_logo, R - lh * LOGO_AR, 278, lh * LOGO_AR, lh); }
  ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.line;
  ctx.beginPath(); ctx.moveTo(L, 330); ctx.lineTo(R, 330); ctx.stroke();
  const tf = font('display', 800, 64), y0 = 410, lh = 78;
  if (highlight >= 0 && markerK > 0) {
    ctx.font = tf; const w = ctx.measureText(title[highlight]).width;
    marker(ctx, L - 8, y0 + highlight * lh - 42, w + 16, 64, markerK);
  }
  const blur = REDUCE ? 0 : 14 * (1 - smooth(revealK));
  ctx.save();
  if (blur > 0.3) { if ('filter' in ctx) ctx.filter = `blur(${blur.toFixed(1)}px)`; else ctx.globalAlpha = 0.3 + 0.7 * revealK; }
  title.forEach((s, i) => txt(ctx, s, L, y0 + i * lh, { font: tf, color: T.c.ink }));
  ctx.restore();
  return y0 + (title.length - 1) * lh;       // linia bazowa ostatniej linii tytułu
}

// Legenda: linie od dołu strefy bezpiecznej w górę (ostatnia linia kończy się nad SAFE.y1 łącznie z wydłużeniami liter)
function frameLegend(ctx, lines, px = 21) {
  const f = font('mono', 400, px), lh = Math.round(px * 1.25), yLast = SAFE.y1 - 10;
  lines.forEach((ln, i) => {
    const y = yLast - (lines.length - 1 - i) * lh;
    const parts = Array.isArray(ln) ? ln : [{ s: ln }];
    let x = L;
    for (const p of parts) x += txt(ctx, p.s, x, y, { font: f, color: T.c.ink2, role: p.role || 'content', claim: p.claim });
  });
}

function framePaper(ctx) {
  ctx.fillStyle = T.c.paper; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(grain(), 0, 0);
}

function frameSafeZone(ctx) {
  ctx.fillStyle = 'rgba(217,192,207,0.55)';
  ctx.fillRect(0, 0, W, SAFE.y0); ctx.fillRect(0, SAFE.y1, W, H - SAFE.y1);
  ctx.fillRect(0, SAFE.y0, SAFE.x0, SAFE.y1 - SAFE.y0); ctx.fillRect(SAFE.x1, SAFE.y0, W - SAFE.x1, SAFE.y1 - SAFE.y0);
  ctx.font = font('sans', 600, 30); ctx.fillStyle = T.c.ink; ctx.textAlign = 'center';
  ctx.fillText('Reels UI covers this area', W / 2, SAFE.y1 + 80);   // poza logiem tekstu: to nakładka, nie treść
}
