// Scena: pętla rysowania. Bez wybranej ryciny — rama marki z motywem „Science made clear”.
// (Zegar sekwencji, kadry, suwaki z rejestru i #record — M1.)
const cv = () => $('stage');
let ctx = null, t0 = 0;
function mountFigure() {
  t0 = performance.now();
  const f = figById(STATE.figure);
  cv().setAttribute('aria-label', f ? `FIG. ${f.fig}: ${f.title.join(' ')}. ${f.aim}` : 'HoEBM Academy');
  $('controls').replaceChildren();
}
function drawEmpty(ms) {
  framePaper(ctx);
  const k = Math.min(1, ms / T.revealMs);
  frameHeader(ctx, { label: S.emptyLabel, title: S.emptyTitle, highlight: 1, revealK: k, markerK: REDUCE ? 1 : smooth((ms - T.revealMs) / 600) });
  frameLegend(ctx, [S.disclaimer]);
}
function loop(now) {
  beginFrame();
  const ms = now - t0;
  drawEmpty(ms);
  if (STATE.safe) frameSafeZone(ctx);
  requestAnimationFrame(loop);
}
function initStage() {
  ctx = cv().getContext('2d');
  addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 's' || e.key === 'S') STATE.safe = !STATE.safe;
  });
  mountFigure();
  requestAnimationFrame(loop);
}
