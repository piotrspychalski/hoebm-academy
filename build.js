// HoEBM Academy — (c) 2026 Piotr Spychalski, MD, PhD · MIT License (code)
// Składanie: data/ → rejestr, src/core/* → dist/core.js, src/app/* → dist/app.js, wstawienie do src/shell.html → dist/index.html
// Użycie: node build.js   (bez zależności; wynik to jeden samodzielny plik HTML, działa też z file://)
const fs = require('fs'), path = require('path');
const { load, validate } = require('./tools/registry.js');
const R = __dirname;
const rd = d => fs.readdirSync(path.join(R, d)).filter(f => f.endsWith('.js')).sort()
  .map(f => `// ── ${d}/${f}\n` + fs.readFileSync(path.join(R, d, f), 'utf8')).join('\n');

const reg = load(R);
const errors = validate(reg);
if (errors.length) { console.error('Rejestr — błędy:\n- ' + errors.join('\n- ')); process.exit(1); }

const core = rd('src/core'), app = rd('src/app');
const logo = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(R, 'assets/logo.svg')).toString('base64');
const version = require('./package.json').version;
const shell = fs.readFileSync(path.join(R, 'src/shell.html'), 'utf8');
const html = shell
  .replace('/*REG*/', () => 'const REG = ' + JSON.stringify(reg) + ';')
  .replace('/*CORE*/', () => core)
  .replace('/*APP*/', () => app)
  .replaceAll('%LOGO%', () => logo)
  .replaceAll('%VERSION%', () => version);

fs.mkdirSync(path.join(R, 'dist'), { recursive: true });
fs.writeFileSync(path.join(R, 'dist/core.js'), core);
fs.writeFileSync(path.join(R, 'dist/app.js'), app);
fs.writeFileSync(path.join(R, 'dist/index.html'), html);
const pub = reg.figures.filter(f => f.status === 'published').length;
console.log(`dist/index.html ${Math.round(html.length / 1024)} KB · rycin: ${reg.figures.length} (opublikowanych: ${pub})`);
