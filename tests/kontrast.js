// Kontrast tokenów marki wobec tła (WCAG 2.x, AA: ≥ 4,5:1 dla tekstu)
const fs = require('fs'), path = require('path');
const css = fs.readFileSync(path.join(__dirname, '../src/shell.html'), 'utf8');
const tok = n => (css.match(new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`)) || [])[1];
const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const bg = tok('paper'), errors = [];
for (const n of ['ink', 'ink-2', 'blood']) {
  const r = ratio(tok(n), bg); console.log(`${n} ${tok(n)} vs paper ${bg}: ${r.toFixed(2)}:1`);
  if (r < 4.5) errors.push(`${n}: ${r.toFixed(2)}:1 < 4.5:1`);
}
console.log('errors', JSON.stringify(errors));
process.exit(errors.length ? 1 : 0);
