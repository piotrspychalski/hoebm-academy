// Prymitywy rysunkowe wspólne dla wszystkich rycin. (Osie, krzywe, przepływ, słupki, kreskowanie — M1.)

// Zakreślacz: pas z nierównymi brzegami i końcami (kształt stały dzięki seeded RNG)
const _mj = (() => { const r = rng(11); return Array.from({ length: 32 }, r); })();
function marker(ctx, x, y, w, h, k = 1) {
  if (k <= 0) return;
  w *= Math.min(1, k);
  ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = T.c.marker; ctx.beginPath();
  const n = 12, j = _mj;
  ctx.moveTo(x + j[0] * 10, y + (j[1] - 0.5) * 6);
  for (let i = 1; i <= n; i++) ctx.lineTo(x + w * i / n, y + (j[i + 1] - 0.5) * 6);
  ctx.lineTo(x + w + j[14] * 8, y + h * 0.5);
  for (let i = n; i >= 0; i--) ctx.lineTo(x + w * i / n, y + h + (j[i + 15] - 0.5) * 6);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

// Kwadratowy Bézier między punktami a i b z łukiem w dół o `sag` px (naczynia, ścieżki przepływu)
function bezAt(a, b, u, sag = 30) {
  const cx = (a.x + b.x) / 2, cy = Math.max(a.y, b.y) + sag;
  return [(1 - u) ** 2 * a.x + 2 * (1 - u) * u * cx + u * u * b.x, (1 - u) ** 2 * a.y + 2 * (1 - u) * u * cy + u * u * b.y];
}
function vessel(ctx, a, b, width, sag) {
  ctx.save(); ctx.strokeStyle = T.c.blood; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.beginPath();
  for (let u = 0; u <= 1.0001; u += 0.02) { const [x, y] = bezAt(a, b, u, sag); u === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke(); ctx.restore();
}
// Cząstki płynące po ścieżce: faza = f(czas sekwencji), więc ta sama klatka w tej samej chwili (determinizm).
// Gęstość: cząstka widoczna, gdy jej stały „los” < flow (0–1).
const _pr = (() => { const r = rng(23); return Array.from({ length: 64 }, () => [r(), r()]); })();
function particles(ctx, a, b, phase, flow, sag, n = 32) {
  if (REDUCE) return;
  ctx.fillStyle = T.c.paper;
  for (let i = 0; i < n; i++) {
    const [u0, on] = _pr[i]; if (on > flow) continue;
    const [x, y] = bezAt(a, b, (u0 + phase) % 1, sag);
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  }
}
// Prostokąt z kreskowaniem do poziomu `level` (0–1): „wypełnienie” narządu krwią
function hatchBox(ctx, x, y, w, h, level, color = T.c.blood) {
  ctx.save(); ctx.fillStyle = T.c.paper; ctx.strokeStyle = T.c.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke(); ctx.clip();
  level = Math.max(0, Math.min(1, level));
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.globalAlpha = 0.25 + 0.75 * level;
  const top = y + h - h * level;
  for (let xx = x - h - 10; xx < x + w; xx += 14) { ctx.beginPath(); ctx.moveTo(xx, y + h); ctx.lineTo(xx + h, top); ctx.stroke(); }
  ctx.restore();
}
// Etykieta panelu (A, B, C)
const panelLabel = (ctx, s, y) => txt(ctx, s, L, y, { font: font('display', 800, 36), role: 'fig' });
// Pasek odczytów w stylu licznika rowerowego: fields = [{label, value, color?, claim?}]
function readouts(ctx, y, fields, h = 82) {
  const fw = (R - L) / fields.length;
  ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.line; ctx.strokeRect(L, y, R - L, h);
  fields.forEach((f, i) => {
    const x = L + fw * i;
    if (i) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke(); }
    txt(ctx, f.label, x + 16, y + 27, { font: font('mono', 600, 18), color: T.c.ink2, role: 'fig' });
    txt(ctx, f.value, x + 16, y + 68, { font: font('mono', 600, 34), color: f.color || T.c.ink, claim: f.claim });
  });
}
// Interpolacja klatek kluczowych sekwencji: keys = [[ms, {param: value}], …] → stan w chwili ms (smoothstep)
function keyAt(keys, ms) {
  if (ms <= keys[0][0]) return { ...keys[0][1] };
  for (let i = 1; i < keys.length; i++) {
    const [t0, a] = keys[i - 1], [t1, b] = keys[i];
    if (ms <= t1) { const k = smooth((ms - t0) / (t1 - t0 || 1)), o = {}; for (const p in b) o[p] = a[p] + (b[p] - a[p]) * k; return o; }
  }
  return { ...keys[keys.length - 1][1] };
}
// Rejestr modułów rycin: FIGMOD[id] = { params, keys, frames, draw(ctx, st, ms) }
const FIGMOD = {};
