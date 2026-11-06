// Akademia publiczna (dist/index.html = szkic wzorcowy): kontrast kolorów tekstu, nazwy handlowe i dawki w treści,
// źródła i lista tego, co ilustracyjne, brak śladów studia. Strona publiczna jest jedynym produktem dla czytelników,
// więc testy sprawdzają właśnie ją (nie studio).
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(R, 'dist/index.html'), 'utf8'), errors = [];
// 1. Kontrast (WCAG AA ≥ 4,5:1) kolorów tekstu z palety szkicu wobec papieru
const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pal = html.match(/const C = \{([^}]*)\}/);
if (!pal) errors.push('brak palety C w szkicu');
else {
  const C = Object.fromEntries([...pal[1].matchAll(/(\w+): '(#[0-9A-Fa-f]{6})'/g)].map(m => [m[1], m[2]]));
  for (const k of ['ink', 'ink2', 'blood', 'grey']) {
    if (!C[k]) { errors.push(`paleta: brak ${k}`); continue; }
    const r = ratio(C[k], C.paper); console.log(`${k} ${C[k]} vs paper: ${r.toFixed(2)}:1`);
    if (r < 4.5) errors.push(`kontrast ${k} ${C[k]}: ${r.toFixed(2)}:1 < 4,5:1`);
  }
}
for (const m of html.matchAll(/color:\s*(#[0-9A-Fa-f]{6})/g)) if (ratio(m[1], '#F2F0F1') < 4.5 && !/D9C0CF|F2F0F1|EDE8EC|fff/i.test(m[1])) errors.push(`kolor tekstu ${m[1]}: ${ratio(m[1], '#F2F0F1').toFixed(2)}:1 < 4,5:1`);
// 2. Treść: bez nazw handlowych i dawek leków / suplementów (mmol w opisie glikogenu i mleczanu jest dozwolony)
const z = JSON.parse(fs.readFileSync(path.join(R, 'tests/zakazane.json'), 'utf8'));
const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/data:[^"')\s]+/g, '');
for (const b of z.brands) if (new RegExp(`\\b${b}\\b`).test(text)) errors.push(`nazwa handlowa: ${b}`);
const dose = /\b\d+([.,]\d+)?\s?(mg|µg|mcg|IU)(\/kg)?\b(?!\s*(FFM|\/\s*min|per kg lean|per min))/;   // pomiar (mg/kg FFM/min) to nie dawka
const dm = text.match(dose); if (dm) errors.push(`dawka w treści: „${dm[0]}”`);
// 3. Źródła i przejrzystość: okno źródeł i lista tego, co ilustracyjne
if (!/Sources, and what is illustrative/.test(html)) errors.push('brak okna „Sources, and what is illustrative”');
if (!/Education, not medical advice/.test(html)) errors.push('brak zastrzeżenia „Education, not medical advice”');
// 4. Bez studia na stronie publicznej
for (const w of ['initStudio', 'ROLKA', 'studio-nav', "className = 'vnav'", 'STUDIO_PASSWORD']) if (html.includes(w)) errors.push(`ślad studia: ${w}`);
console.log('errors', JSON.stringify(errors));
process.exit(errors.length ? 1 : 0);
