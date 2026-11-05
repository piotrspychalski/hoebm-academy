// Panel „About this figure” (odpowiednik „Opis” w SURGITOME): cel, wnioski, czego nie wiemy, piśmiennictwo wg ról
const ROLE_ORDER = ['guideline', 'systematic review', 'review', 'RCT', 'observational', 'mechanism', 'own data'];
const srcLinks = s => {
  const out = [];
  if (s.pmid) out.push(el('a', { href: `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`, target: '_blank', rel: 'noopener', text: `PMID ${s.pmid}` }));
  if (s.doi) out.push(el('a', { href: `https://doi.org/${s.doi}`, target: '_blank', rel: 'noopener', text: 'DOI' }));
  if (s.url && !s.pmid && !s.doi) out.push(el('a', { href: s.url, target: '_blank', rel: 'noopener', text: 'link' }));
  return out.flatMap((a, i) => i ? [' · ', a] : [a]);
};
function refItem(key, role) {
  const s = REG.sources[key];
  const li = el('li', {}, s.vancouver, ' ', ...srcLinks(s));
  if (role) li.prepend(el('small', { text: role.toUpperCase() + ' · ' }));
  if (s.coi) li.append(el('br'), el('small', { text: s.coi }));
  return li;
}

function renderPanel() {
  const p = $('panel'); p.replaceChildren();
  const f = figById(STATE.figure);
  if (!f) {
    p.append(el('h2', { text: 'Sports Academy' }), el('p', { text: S.startBody[0] }), el('p', { text: S.startBody[1] }));
    return;
  }
  const star = el('button', { class: 'btn', type: 'button', 'aria-pressed': String(STATE.favs.has(f.id)), text: STATE.favs.has(f.id) ? '★ Saved' : '☆ Save' });
  star.onclick = () => { toggleFav(f.id); renderPanel(); renderList(); };
  p.append(el('small', { text: `FIG. ${f.fig} · ${SERIES_LABEL[f.series].toUpperCase()}` }), el('h2', { text: f.title.join(' ') }), star);
  if (f.status !== 'published') p.append(el('p', { class: 'empty', text: S.draft }));
  p.append(el('h3', { text: S.aim }), el('p', { text: f.aim }));
  if (f.takeaways?.length) p.append(el('h3', { text: S.takeaways }), el('ul', {}, ...f.takeaways.map(t => el('li', { text: t }))));
  if (f.unknowns?.length) p.append(el('h3', { text: S.unknowns }), el('ul', {}, ...f.unknowns.map(t => el('li', { text: t }))));
  const refs = (f.refs || []).slice().sort((a, b) => ROLE_ORDER.indexOf(a[1]) - ROLE_ORDER.indexOf(b[1]) || (REG.sources[a[0]].year || 0) - (REG.sources[b[0]].year || 0));
  if (refs.length) p.append(el('h3', { text: S.refs }), el('ol', {}, ...refs.map(r => refItem(r[0], r[1]))));
  p.append(el('p', { class: 'empty', text: S.disclaimer }));
}
