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
