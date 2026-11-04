// Jedyna droga rysowania tekstu na canvasie. Każde wywołanie trafia do logu klatki (tekst, bbox, rola, claim),
// z którego korzystają testy: „liczby bez źródła” i „strefa bezpieczna”.
// role: 'content' (domyślnie; liczby muszą mieć claim), 'fig' (FIG. n), 'citation' (rok, PMID, strony), 'axis' (podziałki osi)
const TEXT_LOG = [];
function beginFrame() { TEXT_LOG.length = 0; }
function txt(ctx, s, x, y, o = {}) {
  s = String(s);
  ctx.font = o.font || font('sans', 400, 24);
  ctx.fillStyle = o.color || T.c.ink;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
  const m = ctx.measureText(s), w = m.width;
  const asc = m.actualBoundingBoxAscent || 0, desc = m.actualBoundingBoxDescent || 0;
  const x0 = ctx.textAlign === 'center' ? x - w / 2 : ctx.textAlign === 'right' ? x - w : x;
  TEXT_LOG.push({ s, role: o.role || 'content', claim: o.claim || null, box: [x0, y - asc, x0 + w, y + desc] });
  return w;
}
window.__hoebmText = () => TEXT_LOG.slice();
