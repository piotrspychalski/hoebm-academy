// Rama rolki: logo, tytuł wyostrzający się z rozmycia („Science made clear”), papier z ziarnem, strefa bezpieczna Reels.
const _logo = new Image(); _logo.src = LOGO_SRC;
const LOGO_AR = 425.4677 / 98.7696;

// Tytuł wyostrza się z rozmycia (motyw „Science made clear”); przy prefers-reduced-motion bez rozmycia
function titleText(ctx, revealK, draw) {
  const blur = REDUCE ? 0 : 14 * (1 - smooth(revealK));
  ctx.save();
  if (blur > 0.3) { if ('filter' in ctx) ctx.filter = `blur(${blur.toFixed(1)}px)`; else ctx.globalAlpha *= 0.3 + 0.7 * revealK; }
  draw();
  ctx.restore();
}
// Zawijanie tytułu po słowach do szerokości maxW. Zwraca linie { s, hl: [x0, x1] | null } — hl to zakres słów
// z odcinka `highlight` (do zakreślacza). Używa go karta tytułowa i scena zdjęcia w studiu.
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
