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
}

function initNav() {
  $('search').addEventListener('input', e => { STATE.query = e.target.value; renderList(); });
  $('favBtn').onclick = () => { STATE.series = STATE.series === 'favs' ? 'all' : 'favs'; renderNav(); };
  renderNav();
}
