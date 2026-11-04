// Okna: „Before you start” (raz na urządzenie), „Sources” (całe piśmiennictwo), „How to cite”
function dlg(id, title, ...body) {
  const d = $(id); d.replaceChildren();
  const close = el('button', { class: 'btn', type: 'button', text: S.close }); close.onclick = () => d.close();
  d.append(el('h2', { id: id.replace('Dlg', 'T'), text: title }), ...body, el('div', { class: 'row' }, close));
  d.showModal();
  return d;
}
function showStart() {
  const d = dlg('startDlg', S.startTitle, ...S.startBody.map(t => el('p', { text: t })));
  const ok = d.querySelector('button'); ok.textContent = S.startOk;
  d.addEventListener('close', () => store.set('hoebm-start', 1), { once: true });
}
function showSources() {
  const keys = Object.keys(REG.sources).filter(k => visibleFigures().some(f => (f.refs || []).some(r => r[0] === k)));
  dlg('srcDlg', S.srcTitle, keys.length ? el('ol', {}, ...keys.map(k => refItem(k))) : el('p', { class: 'empty', text: S.noFigures }));
}
function showCite() {
  const t = S.cite(VERSION), b = el('button', { class: 'btn', type: 'button', text: S.copy });
  b.onclick = () => navigator.clipboard?.writeText(t).then(() => { b.textContent = S.copied; }).catch(() => {});
  dlg('citeDlg', S.citeTitle, el('p', { text: t }), b);
}
function initDialogs() {
  $('infoBtn').onclick = showStart; $('srcBtn').onclick = showSources; $('citeBtn').onclick = showCite;
  $('footer').textContent = S.footer(VERSION);
  if (!store.get('hoebm-start', 0)) showStart();
}
