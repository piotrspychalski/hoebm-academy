// Sports Academy — rejestr rycin: wczytanie i walidacja (bez zależności; używane przez build.js i tests/)
// data/sources.json — wspólne źródła (klucz → opis); data/figures/<id>.json — jedna rycina na plik (bez konfliktów przy pracy równoległej)
const fs = require('fs'), path = require('path');

const SERIES = ['gut', 'heat', 'altitude', 'training', 'nutrition', 'masters', 'own-data'];
const ROLES = ['guideline', 'systematic review', 'review', 'RCT', 'observational', 'mechanism', 'own data'];
const STATUS = ['draft', 'published'];
const PMID = /^\d{1,8}$/, DOI = /^10\.\d{4,9}\/\S+$/;

function load(root) {
  const d = path.join(root, 'data');
  const sources = JSON.parse(fs.readFileSync(path.join(d, 'sources.json'), 'utf8'));
  const fd = path.join(d, 'figures');
  const figures = fs.readdirSync(fd).filter(f => f.endsWith('.json')).sort()
    .map(f => ({ ...JSON.parse(fs.readFileSync(path.join(fd, f), 'utf8')), _file: f }))
    .sort((a, b) => a.fig - b.fig);
  return { sources, figures };
}

function validate(reg) {
  const E = [];
  for (const [k, s] of Object.entries(reg.sources)) {
    if (!s.vancouver) E.push(`źródło ${k}: brak opisu "vancouver"`);
    if (!s.pmid && !s.doi && !s.url) E.push(`źródło ${k}: brak PMID, DOI i URL`);
    if (s.pmid && !PMID.test(s.pmid)) E.push(`źródło ${k}: zły PMID "${s.pmid}"`);
    if (s.doi && !DOI.test(s.doi)) E.push(`źródło ${k}: zły DOI "${s.doi}"`);
  }
  const ids = new Set(), figs = new Set();
  for (const f of reg.figures) {
    const at = `rycina ${f.id || f._file}`;
    if (!f.id || f._file !== f.id + '.json') E.push(`${at}: id musi zgadzać się z nazwą pliku`);
    if (ids.has(f.id)) E.push(`${at}: powtórzone id`); ids.add(f.id);
    if (!Number.isInteger(f.fig) || f.fig < 1) E.push(`${at}: zły numer FIG`);
    if (figs.has(f.fig)) E.push(`${at}: powtórzony numer FIG ${f.fig}`); figs.add(f.fig);
    if (!SERIES.includes(f.series)) E.push(`${at}: nieznana seria "${f.series}"`);
    if (!STATUS.includes(f.status)) E.push(`${at}: status musi być draft albo published`);
    if (!Array.isArray(f.title) || !f.title.length) E.push(`${at}: brak tytułu`);
    if (!f.aim) E.push(`${at}: brak celu dydaktycznego (aim)`);
    for (const r of f.refs || []) {
      if (!reg.sources[r[0]]) E.push(`${at}: odwołanie do nieznanego źródła ${r[0]}`);
      if (!ROLES.includes(r[1])) E.push(`${at}: nieznana rola źródła "${r[1]}"`);
    }
    for (const c of f.claims || []) {
      const cat = `${at}, claim ${c.id}`;
      if (!c.id || !Array.isArray(c.display) || !c.display.length) E.push(`${cat}: brak id lub display`);
      if (!c.quote) E.push(`${cat}: brak dosłownego cytatu`);
      if (!reg.sources[c.source]) E.push(`${cat}: nieznane źródło ${c.source}`);
      if (!['verified', 'to_verify'].includes(c.status)) E.push(`${cat}: status verified albo to_verify`);
      if (f.status === 'published' && c.status !== 'verified') E.push(`${cat}: rycina opublikowana z niezweryfikowanym claimem`);
    }
  }
  return E;
}

module.exports = { load, validate, SERIES, ROLES };
