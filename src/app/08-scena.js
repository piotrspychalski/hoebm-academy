// Scena: deterministyczny zegar sekwencji, kadry (jak oś czasu w SURGITOME), suwaki z modułu ryciny, pętla rysowania.
// Tryb sekwencji: stan = keyAt(klatki, czas). Tryb ręczny (ruszony suwak): stan = wartości suwaków.
const cv = () => $('stage');
let ctx = null, lastNow = performance.now();
// Kadr widoku: studio — płótno 9:16 (1080 × 1920) z układem rolki skalowanym do strefy Reels; telefon pionowo — 720 × 1100;
// komputer i telefon poziomo — 1440 × 810 (panele obok siebie). setView() przy starcie i przy zmianie orientacji.
let VIEW = null;
const landMQ = matchMedia('(orientation: landscape)');
function setView() {
  // telefon trzymany poziomo dostaje układ poziomy (jak komputer) — w pionowym kadrze rycina byłaby za mała
  const wide = !STUDIO && (!MOBILE || landMQ.matches);
  LY = STUDIO ? LAYOUTS.reel : wide ? LAYOUTS.landscape : LAYOUTS.phone;   // telefon pionowo: osobny, węższy układ
  VIEW = STUDIO ? { w: W, h: H } : { w: LY.W, h: LY.H };   // studio: płótno 9:16, treść rolki skalowana do strefy Reels
  const c = cv(); if (c.width !== VIEW.w) c.width = VIEW.w; if (c.height !== VIEW.h) c.height = VIEW.h;
  document.documentElement.classList.toggle('wide', LY.id === 'landscape');
}
const CLOCK = {
  start: performance.now(), paused: false, pausedAt: 0, hold: 0, stopAt: null,
  now() { return (this.paused ? this.pausedAt : performance.now()) - this.start - this.hold; },   // ms sekwencji (< 0 = czysta klatka)
  restart(hold = 0) { this.start = performance.now(); this.hold = hold; this.paused = false; this.stopAt = null; },
  seek(ms, stopAt = null) { this.hold = 0; this.start = performance.now() - ms; this.paused = false; this.stopAt = stopAt; },
  pause(ms) { this.paused = true; this.pausedAt = this.start + this.hold + ms; },
  toggle() { if (this.paused) { this.start += performance.now() - this.pausedAt; this.paused = false; } else { this.paused = true; this.pausedAt = performance.now(); } },
};
const SCN = { mod: null, manual: false, p: {} };
const curFig = () => figById(STATE.figure);
const frames = () => (SCN.mod?.frames || []).filter(f => f.label);
const frameEnd = () => (SCN.mod?.frames || []).find(f => f.end != null)?.end ?? 0;
// Kadr i obejmuje [t_i, t_{i+1}); granica należy do następnego kadru, dlatego krok zatrzymuje się 1 ms przed nią
function frameIndex(ms) { const F = frames(); let i = 0; F.forEach((f, k) => { if (ms >= f.t) i = k; }); return i; }

// Kadr i: odtwarzamy jego odcinek sekwencji i zatrzymujemy na końcu (krok „Dalej”)
function playFrame(i) {
  const F = frames(); if (!F.length) return;
  SCN.manual = false;
  const end = i + 1 < F.length ? F[i + 1].t - 1 : frameEnd();
  CLOCK.seek(F[i].t, end);
  syncUi();
}
// Krok d = ±1: najpierw kadry ryciny, na końcach — sąsiednia rycina (jak „Dalej” w SURGITOME)
function step(d) {
  const F = frames();
  if (F.length) {
    const i = SCN.manual ? (d > 0 ? -1 : F.length) : frameIndex(Math.max(0, CLOCK.now()));
    if (i + d >= 0 && i + d < F.length) return playFrame(i + d);
  }
  stepFigure(d);
}
function canStepAny(d) {
  const F = frames(), i = frameIndex(Math.max(0, CLOCK.now()));
  return (F.length && i + d >= 0 && i + d < F.length) || canStep(d);
}

function mountFigure() {
  const f = curFig();
  SCN.mod = f ? FIGMOD[f.id] || null : null; SCN.manual = false; SCN.p = {};
  cv().setAttribute('aria-label', f ? `FIG. ${f.fig}: ${f.title.join(' ')}. ${f.aim}` : 'HoEBM Academy');
  buildControls();
  if (STUDIO || !SCN.mod) CLOCK.restart(STUDIO ? T.cleanMs : 0);
  else playFrame(0);
}

function buildControls() {
  const box = $('controls'); box.replaceChildren();
  if (!SCN.mod) return;
  for (const p of SCN.mod.params) {
    const r = el('input', { type: 'range', min: '0', max: '1000', value: '0', id: 'p_' + p.id, 'aria-describedby': 'o_' + p.id });
    const o = el('output', { id: 'o_' + p.id });
    r.addEventListener('input', () => { SCN.manual = true; CLOCK.stopAt = null; for (const q of SCN.mod.params) SCN.p[q.id] = $('p_' + q.id).value / 1000; syncUi(); });
    box.append(el('div', { class: 'row' }, el('label', { for: 'p_' + p.id, text: p.label }), r, o));
  }
  const prev = el('button', { class: 'btn', type: 'button', id: 'stPrev', text: '‹ Back' });
  const next = el('button', { class: 'btn', type: 'button', id: 'stNext', text: 'Next ›' });
  const all = el('button', { class: 'btn', type: 'button', text: '▶ Play all' });
  const lbl = el('output', { id: 'stLbl' });
  prev.onclick = () => step(-1); next.onclick = () => step(1);
  all.onclick = () => { SCN.manual = false; CLOCK.restart(0); };
  box.append(el('div', { class: 'row donly' }, prev, next, all, lbl));
}
// Suwaki i opis kadru nadążają za sekwencją
function syncUi(st) {
  if (!SCN.mod) return;
  st = st || stateAt(Math.max(0, CLOCK.now()));
  for (const p of SCN.mod.params) {
    const r = $('p_' + p.id); if (!r) continue;
    if (!SCN.manual) r.value = Math.round(st[p.id] * 1000);
    $('o_' + p.id).textContent = p.fmt(st[p.id]);
  }
  const F = frames(), i = frameIndex(Math.max(0, CLOCK.now()));
  if ($('stLbl')) $('stLbl').textContent = SCN.manual ? 'manual' : `${i + 1} / ${F.length} · ${F[i].label}`;
  if (typeof updateMobile === 'function') updateMobile();
}
const stateAt = ms => SCN.manual ? { ...SCN.p } : keyAt(SCN.mod.keys, ms);

function drawEmpty(ms) {
  framePaper(ctx);
  const k = Math.max(0, ms) / T.revealMs;
  frameHeader(ctx, { label: S.emptyLabel, title: S.emptyTitle, highlight: 1, revealK: Math.min(1, k), markerK: REDUCE ? 1 : smooth((ms - T.revealMs) / 600) });
  frameLegend(ctx, [S.disclaimer]);
}
function drawFigure(f, ms, dt) {
  const st = stateAt(Math.max(0, ms));
  framePaper(ctx);
  frameHeader(ctx, {
    label: `FIG. ${f.fig}  ·  ${SERIES_LABEL[f.series].toUpperCase()}`, title: f.title, highlight: f.highlight ?? -1,
    revealK: Math.min(1, Math.max(0, ms) / T.revealMs) || (STUDIO ? 0 : 1), markerK: SCN.mod.markerK ? SCN.mod.markerK(st) : 0,
  });
  SCN.mod.draw(ctx, st, Math.max(0, ms), CLOCK.paused || ms < 0 ? 0 : dt, !SCN.manual);
  return st;
}
// Szkic (status draft) — znak wodny w strefie bezpiecznej, żeby niezweryfikowana rycina nie trafiła do nagrania
function drawDraftMark() {
  ctx.save(); ctx.translate((LY.bounds.x0 + LY.bounds.x1) / 2, (LY.bounds.y0 + LY.bounds.y1) / 2); ctx.rotate(-Math.PI / 9);
  ctx.globalAlpha = 0.14; ctx.font = font('display', 800, 150); ctx.fillStyle = T.c.blood; ctx.textAlign = 'center';
  ctx.fillText('DRAFT', 0, 0); ctx.font = font('mono', 600, 34); ctx.fillText('NOT FOR PUBLICATION', 0, 60); ctx.restore();
}
let lastFrameIdx = -1;
function loop(now) {
  const dt = Math.min(50, now - lastNow); lastNow = now;
  beginFrame();
  const P = LY.place;   // rolka: układ logiczny skalowany do strefy bezpiecznej; pozostałe układy 1 : 1
  ctx.setTransform(P ? P.k : 1, 0, 0, P ? P.k : 1, P ? P.x : 0, P ? P.y : 0);
  let ms = CLOCK.now();
  if (CLOCK.stopAt != null && ms >= CLOCK.stopAt) { CLOCK.pause(CLOCK.stopAt); ms = CLOCK.stopAt; CLOCK.stopAt = null; }
  if (SCN.mod && !SCN.manual && ms > frameEnd() && !CLOCK.paused) { CLOCK.pause(frameEnd()); ms = frameEnd(); }
  const f = curFig();
  if (f && SCN.mod) {
    const st = drawFigure(f, ms, dt);
    const fi = frameIndex(Math.max(0, ms));
    if (!SCN.manual && (!CLOCK.paused || fi !== lastFrameIdx)) syncUi(st);
    lastFrameIdx = fi;
  } else drawEmpty(ms);
  if (f && f.status !== 'published') drawDraftMark();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (STATE.safe) frameSafeZone(ctx);   // nakładka w pikselach płótna 1080 × 1920
  requestAnimationFrame(loop);
}
function initStage() {
  setView();
  ctx = cv().getContext('2d');
  mountFigure();
  if (!STUDIO) addEventListener('keydown', e => {
    if ((e.target instanceof Element && e.target.matches('input, textarea, select')) || document.querySelector('dialog[open]')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); step(1); }        // pilot do prezentacji: PageDown / PageUp
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); step(-1); }
    else if (e.key === 'f' || e.key === 'F') { if (STATE.figure) { toggleFav(STATE.figure); renderPanel(); renderList(); } }
  });
  requestAnimationFrame(loop);
}
