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
//  dist/studio/… — to samo studio online, ZASZYFROWANE hasłem z sekretu STUDIO_PASSWORD (tools/zamek.js). Adres jest jawny,
//    tajne jest tylko hasło; bez hasła (lokalnie, PR) studio online nie powstaje. Od 0.11.0 zamiast tajnej ścieżki STUDIO_PATH,
//    bo katalog z tajną ścieżką trafiał do publicznego artefaktu GitHub Pages.
const studioJs = rd('src/studio');
const slides = require('./tools/sketch-slides.js').compile(R);   // sekwencje slajdów dla studia nagrań
const studioNav = fs.readFileSync(path.join(R, 'src/studio-nav.js'), 'utf8');   // pasek widoków prywatnych (tylko studio)
const make = studio => shell
  .replace('/*REG*/', () => 'const REG = ' + JSON.stringify(reg) + ';')
  .replace('/*CORE*/', () => core)
  .replace('/*APP*/', () => app + (studio ? '\n' + studioJs : ''))
  .replaceAll('%STUDIO%', () => String(studio))
  .replace('%SEQS%', () => JSON.stringify(slides.seqs))
  .replace('<!--ROBOTS-->', () => studio ? '<meta name="robots" content="noindex, nofollow">' : '')
  .replaceAll('%FAVICON%', () => favicon)
  .replaceAll('%LOGO%', () => logo)
  .replaceAll('%VERSION%', () => version)
  .replace('</body>', () => studio ? `<script>\n${studioNav}</script>\n</body>` : '</body>');

fs.mkdirSync(path.join(R, 'dist'), { recursive: true });
fs.mkdirSync(path.join(R, 'studio'), { recursive: true });
fs.writeFileSync(path.join(R, 'studio/core.js'), core);   // dla testów (tests/liczby_strefa.js); nie publikujemy
// Akademia publiczna = szkic wzorcowy (reference/energy-map.html) — duża interaktywna animacja (od 0.10.0).
// Logo w nagłówku prowadzi na stronę główną; favicon jak w studiu.
const html = fs.readFileSync(path.join(R, 'reference/energy-map.html'), 'utf8')
  .replace(/<link rel="icon"[^>]*>\n?/g, '')   // własna ikona szkicu = ściśnięty logotyp; zastępujemy kwadratowym sygnetem
  .replace('<a class="brand" href="../"', '<a class="brand" href="./"')
    .replace(/<title>[^<]*<\/title>/, () => `<title>Sports Academy · House of EBM</title>\n<link rel="icon" type="image/svg+xml" href="${favicon}">`);
fs.writeFileSync(path.join(R, 'dist/index.html'), html);
fs.writeFileSync(path.join(R, 'studio/index.html'), make(true));
const pub = reg.figures.filter(f => f.status === 'published').length;
console.log(`dist/index.html (Akademia = szkic) ${Math.round(html.length / 1024)} KB · studio/index.html (lokalnie) · rycin kanwy: ${reg.figures.length} (opublikowanych: ${pub})`);
// Slajdy szkicu wzorcowego: data/slides/*.json → studio/sketch/index.html (lokalnie; tylko do nagrań, nie do dist/)
require('./tools/sketch-slides.js').build(R, studioNav, favicon);
// Studio online: studio/ → dist/studio/; strony HTML studia zaszyfrowane, kopia szkicu (publiczna treść) jawna, z noindex
const PASS = process.env.STUDIO_PASSWORD;
if (PASS) {
  if (PASS.length < 12) { console.error('STUDIO_PASSWORD: min. 12 znaków'); process.exit(1); }
  const { lock } = require('./tools/zamek.js');
  for (const [src, dst, title] of [['studio/index.html', 'dist/studio/index.html', 'Studio nagrań'], ['studio/sketch/index.html', 'dist/studio/sketch/index.html', 'Slajdy'], ['studio/sketch/energy-map.html', 'dist/studio/sketch/energy-map.html']]) {
    fs.mkdirSync(path.dirname(path.join(R, dst)), { recursive: true });
    const h = fs.readFileSync(path.join(R, src), 'utf8');
    fs.writeFileSync(path.join(R, dst), title ? lock(h, PASS, title) : h);
  }
  console.log('studio online: dist/studio/ (zaszyfrowane hasłem)');
}
