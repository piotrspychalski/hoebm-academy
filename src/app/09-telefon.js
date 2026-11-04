// Widok telefonu (jak 10-tryb-mobilny.js w SURGITOME): menu z seriami i rycinami, dolny dok ‹ › z kropkami,
// przesunięcie palcem po scenie lub doku, opis jako wysuwany arkusz (przycisk „i”)
function updateMobile() {
  if (!MOBILE) return;
  const f = figById(STATE.figure), list = filtered();
  $('mFig').textContent = f ? `FIG. ${f.fig} · ${SERIES_LABEL[f.series].toUpperCase()}` : 'HoEBM · ACADEMY';
  const F = frames(), fi = frameIndex(Math.max(0, CLOCK.now()));
  $('mStep').textContent = f ? (F.length ? `${fi + 1} / ${F.length}  ${F[fi].label}` : f.title.join(' ')) : (list.length ? 'Choose a figure ›' : S.noFigures);
  // kropki = kadry ryciny (jak w SURGITOME); bez ryciny — ryciny z listy
  const dots = $('mDots'), n = f && F.length ? F.length : Math.min(12, list.length), cur = f && F.length ? fi : list.findIndex(x => x.id === STATE.figure);
  if (dots.children.length !== n) { dots.replaceChildren(); for (let k = 0; k < n; k++) dots.append(document.createElement('i')); }
  [...dots.children].forEach((d, k) => { d.className = k === cur ? 'on' : k < cur ? 'done' : ''; });
  $('mPrev').disabled = !canStepAny(-1); $('mNext').disabled = !canStepAny(1);
}
function mPanel(on) { $('panel').classList.toggle('open', on); $('mInfo').setAttribute('aria-expanded', String(on)); }
function renderMobileMenu() {
  const box = $('mMenuBody'); box.replaceChildren();
  const sec = title => { box.append(el('h4', { text: title })); const r = el('div', { class: 'mrow' }); box.append(r); return r; };
  const chip = (row, text, on, fn) => { const b = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(on), text }); b.onclick = fn; row.append(b); return b; };
  const present = new Set(visibleFigures().map(f => f.series));
  const rs = sec('Series');
  [['all', S.all], ['favs', '★ ' + S.favs], ...SERIES_ORDER.filter(s => present.has(s)).map(s => [s, SERIES_LABEL[s]])]
    .forEach(([id, label]) => chip(rs, label, STATE.series === id, () => { STATE.series = id; renderNav(); renderMobileMenu(); updateMobile(); }));
  const rf = sec('Figures'), list = filtered();
  if (!list.length) rf.append(el('p', { class: 'empty', text: visibleFigures().length ? S.noMatch : S.noFigures }));
  for (const f of list) {
    chip(rf, `FIG. ${f.fig} ${f.title.join(' ')}`, f.id === STATE.figure, () => { openFigure(f.id); mMenu(false); });
    chip(rf, STATE.favs.has(f.id) ? '★' : '☆', false, () => { toggleFav(f.id); renderMobileMenu(); renderList(); })
      .setAttribute('aria-label', STATE.favs.has(f.id) ? 'Remove from favourites' : 'Add to favourites');
  }
  const ro = sec('More');
  chip(ro, S.srcTitle, false, () => { mMenu(false); showSources(); });
  chip(ro, S.citeTitle, false, () => { mMenu(false); showCite(); });
  chip(ro, S.startTitle, false, () => { mMenu(false); showStart(); });
}
function mMenu(on) {
  $('mMenu').hidden = !on; $('mMenuBtn').setAttribute('aria-expanded', String(on));
  if (on) { mPanel(false); $('mq').value = STATE.query; renderMobileMenu(); }
}
function initMobile() {
  const root = document.documentElement;
  const onMQ = () => { MOBILE = mobMQ.matches; root.classList.toggle('mobile', MOBILE); if (!MOBILE) { mMenu(false); mPanel(false); } setView(); updateMobile(); };
  mobMQ.addEventListener ? mobMQ.addEventListener('change', onMQ) : mobMQ.addListener(onMQ);
  onMQ();
  $('mMenuBtn').onclick = () => mMenu($('mMenu').hidden);
  $('mMenuClose').onclick = () => mMenu(false);
  $('mMenu').addEventListener('click', e => { if (e.target === $('mMenu')) mMenu(false); });
  $('mq').addEventListener('input', e => { STATE.query = e.target.value; renderList(); renderMobileMenu(); updateMobile(); });
  $('mPrev').onclick = () => step(-1);
  $('mNext').onclick = () => step(1);
  $('mInfo').onclick = () => mPanel(!$('panel').classList.contains('open'));
  let x0 = null;
  for (const id of ['mDock', 'stage']) {
    $(id).addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    $(id).addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1); });
  }
}
