// Serie (jak kategorie w SURGITOME), lista rycin, wyszukiwarka, ulubione, link ?f=<id>
const $ = id => document.getElementById(id);
const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) k === 'text' ? (e.textContent = v) : e.setAttribute(k, v); e.append(...kids); return e; };

function filtered() {
  const q = STATE.query.trim().toLowerCase();
  return visibleFigures().filter(f =>
    (STATE.series === 'all' || (STATE.series === 'favs' ? STATE.favs.has(f.id) : f.series === STATE.series)) &&
    (!q || [f.title.join(' '), f.aim, SERIES_LABEL[f.series], `fig ${f.fig}`].join(' ').toLowerCase().includes(q)));
}

function renderSeries() {
  const nav = $('series'); nav.replaceChildren();
  const present = new Set(visibleFigures().map(f => f.series));
  const items = [['all', S.all], ...SERIES_ORDER.filter(s => present.has(s)).map(s => [s, SERIES_LABEL[s]])];
  for (const [id, label] of items) {
    const b = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(STATE.series === id), text: label });
    b.onclick = () => { STATE.series = id; renderNav(); };
    nav.append(b);
  }
  $('favBtn').setAttribute('aria-pressed', String(STATE.series === 'favs'));
}

function renderList() {
  const nav = $('figlist'); nav.replaceChildren();
  const list = filtered();
  if (!list.length) { nav.append(el('p', { class: 'empty', text: visibleFigures().length ? S.noMatch : S.noFigures })); return; }
  for (const f of list) {
    const b = el('button', { class: 'figbtn', type: 'button', 'aria-current': String(STATE.figure === f.id) },
      el('small', { text: `FIG. ${f.fig} · ${SERIES_LABEL[f.series].toUpperCase()}${STATE.favs.has(f.id) ? ' ★' : ''}${f.status !== 'published' ? ' · DRAFT' : ''}` }),
      f.title.join(' '));
    b.onclick = () => openFigure(f.id);
    nav.append(b);
  }
}

function renderNav() { renderSeries(); renderList(); }

function openFigure(id) {
  STATE.figure = figById(id) ? id : null;
  const u = new URL(location.href);
  STATE.figure ? u.searchParams.set('f', STATE.figure) : u.searchParams.delete('f');
  history.replaceState(null, '', u);
  renderList(); renderPanel(); mountFigure();
  if (typeof updateMobile === 'function') updateMobile();
}

// Krok w przód / w tył: w M1 najpierw kadry ryciny, potem następna rycina (jak „Dalej” w SURGITOME); dziś — ryciny z bieżącej listy
function stepFigure(d) {
  const list = filtered(); if (!list.length) return;
  const i = list.findIndex(f => f.id === STATE.figure);
  const j = i < 0 ? (d > 0 ? 0 : list.length - 1) : i + d;
  if (j >= 0 && j < list.length) openFigure(list[j].id);
}
function canStep(d) {
  const list = filtered(), i = list.findIndex(f => f.id === STATE.figure);
  return list.length > 0 && (i < 0 || (i + d >= 0 && i + d < list.length));
}

function initNav() {
  $('search').addEventListener('input', e => { STATE.query = e.target.value; renderList(); });
  $('favBtn').onclick = () => { STATE.series = STATE.series === 'favs' ? 'all' : 'favs'; renderNav(); };
  renderNav();
}
