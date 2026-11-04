// Zakazane treści w rejestrze: dawki leków i nazwy handlowe (lista: tests/zakazane.json).
// Nazwy własne w opisach źródeł (np. afiliacja autora w polu coi) są dozwolone — sprawdzamy tylko treść rycin.
const fs = require('fs'), path = require('path'), { load } = require('../tools/registry.js');
const reg = load(path.join(__dirname, '..')), cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'zakazane.json'), 'utf8'));
const dose = new RegExp(cfg.dosePattern, 'i'), brands = cfg.brands.map(b => new RegExp(`\\b${b}\\b`, 'i'));
const errors = [];
for (const f of reg.figures) {
  const texts = [...f.title, f.aim, ...(f.takeaways || []), ...(f.unknowns || []), ...(f.claims || []).flatMap(c => c.display), ...(f.legend || []).flat().map(p => p.s || p)];
  for (const t of texts.filter(x => typeof x === 'string')) {
    if (dose.test(t)) errors.push(`${f.id}: dawka w „${t}”`);
    for (const b of brands) if (b.test(t)) errors.push(`${f.id}: nazwa handlowa ${b.source} w „${t}”`);
  }
}
console.log('errors', JSON.stringify(errors));
process.exit(errors.length ? 1 : 0);
