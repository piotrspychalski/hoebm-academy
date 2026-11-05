// Sports Academy — (c) 2026 Piotr Spychalski, MD, PhD · MIT License (code)
// Składanie: data/ → rejestr, src/core/* + src/app/* (+ src/studio/* w studiu) → src/shell.html → dist/index.html i studio/index.html
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
const favicon = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(R, 'assets/favicon.svg')).toString('base64');   // sam sygnet, kwadrat
const version = require('./package.json').version;
const shell = fs.readFileSync(path.join(R, 'src/shell.html'), 'utf8');
// Dwa wyniki z jednego źródła:
//  dist/index.html   — publiczny (komputer + telefon); tylko ten katalog publikuje pages.yml
//  studio/index.html — prywatne studio do nagrywania (telefon 9:16 na komputerze); lokalnie, katalog w .gitignore
//  dist/<STUDIO_PATH>/index.html — to samo studio online pod adresem znanym tylko autorowi: ścieżka z sekretu GitHuba
//    STUDIO_PATH (CI), nigdy w kodzie; strona z noindex, bez linków z wersji publicznej. Szkice i tak są widoczne tylko lokalnie.
const studioJs = rd('src/studio');
const make = studio => shell
  .replace('/*REG*/', () => 'const REG = ' + JSON.stringify(reg) + ';')
  .replace('/*CORE*/', () => core)
  .replace('/*APP*/', () => app + (studio ? '\n' + studioJs : ''))
  .replaceAll('%STUDIO%', () => String(studio))
  .replace('<!--ROBOTS-->', () => studio ? '<meta name="robots" content="noindex, nofollow">' : '')
  .replaceAll('%FAVICON%', () => favicon)
  .replaceAll('%LOGO%', () => logo)
  .replaceAll('%VERSION%', () => version);

fs.mkdirSync(path.join(R, 'dist'), { recursive: true });
fs.mkdirSync(path.join(R, 'studio'), { recursive: true });
fs.writeFileSync(path.join(R, 'dist/core.js'), core);
fs.writeFileSync(path.join(R, 'dist/app.js'), app);
const html = make(false);
fs.writeFileSync(path.join(R, 'dist/index.html'), html);
fs.writeFileSync(path.join(R, 'studio/index.html'), make(true));
const SP = process.env.STUDIO_PATH;
if (SP) {
  if (!/^[A-Za-z0-9_-]{16,}$/.test(SP)) { console.error('STUDIO_PATH: min. 16 znaków [A-Za-z0-9_-]'); process.exit(1); }
  fs.mkdirSync(path.join(R, 'dist', SP), { recursive: true });
  fs.writeFileSync(path.join(R, 'dist', SP, 'index.html'), make(true));
  console.log('studio online: dist/<STUDIO_PATH>/index.html');   // ścieżki nie wypisujemy
}
const pub = reg.figures.filter(f => f.status === 'published').length;
console.log(`dist/index.html ${Math.round(html.length / 1024)} KB · studio/index.html (lokalnie) · rycin: ${reg.figures.length} (opublikowanych: ${pub})`);
