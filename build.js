// Sports Academy — (c) 2026 Piotr Spychalski, MD, PhD · MIT License (code)
// Użycie: node build.js   (bez zależności)
// Wyniki:
//  dist/index.html            — Akademia publiczna = szkic wzorcowy (reference/energy-map.html); tylko dist/ publikuje pages.yml
//  studio/index.html          — studio nagrań (lokalnie; katalog w .gitignore): src/studio.html + src/core/* + src/studio/*
//  studio/sketch/…            — odtwarzacz sekwencji slajdów i kopia szkicu dla ramki studia (tools/sketch-slides.js)
//  dist/studio/…              — to samo studio online, strony studia ZASZYFROWANE hasłem z sekretu STUDIO_PASSWORD
//                               (tools/zamek.js); adres jest jawny, tajne jest tylko hasło. Bez hasła studio online nie powstaje.
const fs = require('fs'), path = require('path');
const R = __dirname;
const rd = d => fs.readdirSync(path.join(R, d)).filter(f => f.endsWith('.js')).sort()
  .map(f => `// ── ${d}/${f}\n` + fs.readFileSync(path.join(R, d, f), 'utf8')).join('\n');
const read = f => fs.readFileSync(path.join(R, f), 'utf8');
const b64 = f => 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(R, f)).toString('base64');
// Podmiana, która musi trafić: brak dopasowania = błąd budowy (zmiana szablonu nie przejdzie po cichu)
const must = (s, from, to, what) => { if (!(typeof from === 'string' ? s.includes(from) : from.test(s))) { console.error(`build: brak „${what}”`); process.exit(1); } return s.replace(from, to); };

const version = require('./package.json').version;
const logo = b64('assets/logo.svg'), favicon = b64('assets/favicon.svg');   // favicon: sam sygnet, kwadrat
const slides = require('./tools/sketch-slides.js');
const seqs = slides.compile(R);
if (seqs.errors.length) { console.error('Slajdy szkicu — błędy:\n- ' + seqs.errors.join('\n- ')); process.exit(1); }
const nav = read('src/studio-nav.js');   // pasek widoków prywatnych (tylko studio)

// 1. Akademia publiczna: szkic + tytuł strony, favicon, logo na stronę główną
let pub = read('reference/energy-map.html');
pub = pub.replace(/<link rel="icon"[^>]*>\n?/g, '');   // własna ikona szkicu = ściśnięty logotyp
pub = must(pub, '<a class="brand" href="../"', '<a class="brand" href="./"', 'logo szkicu (href="../")');
pub = must(pub, /<title>[^<]*<\/title>/, () => `<title>Sports Academy · House of EBM</title>\n<link rel="icon" type="image/svg+xml" href="${favicon}">`, '<title> szkicu');
fs.mkdirSync(path.join(R, 'dist'), { recursive: true });
fs.writeFileSync(path.join(R, 'dist/index.html'), pub);

// 2. Studio nagrań
let studio = read('src/studio.html');
studio = must(studio, '/*CORE*/', () => rd('src/core'), '/*CORE*/');
studio = must(studio, '/*STUDIO*/', () => rd('src/studio'), '/*STUDIO*/');
studio = must(studio, '%SEQS%', () => JSON.stringify(seqs.seqs), '%SEQS%');
studio = must(studio, '%VERSION%', () => version, '%VERSION%');
studio = must(studio, '%LOGO%', () => logo, '%LOGO%');
studio = must(studio, '%FAVICON%', () => favicon, '%FAVICON%');
studio = must(studio, '</body>', () => `<script>\n${nav}</script>\n</body>`, '</body>');
fs.mkdirSync(path.join(R, 'studio'), { recursive: true });
fs.writeFileSync(path.join(R, 'studio/index.html'), studio);
slides.build(R, nav, favicon);   // studio/sketch/index.html (odtwarzacz) + studio/sketch/energy-map.html (ramka studia)

// 3. Studio online, zaszyfrowane
const PASS = process.env.STUDIO_PASSWORD;
if (PASS) {
  if (PASS.length < 12) { console.error('STUDIO_PASSWORD: min. 12 znaków'); process.exit(1); }
  const { lock } = require('./tools/zamek.js');
  for (const [src, dst, title] of [['studio/index.html', 'dist/studio/index.html', 'Studio nagrań'], ['studio/sketch/index.html', 'dist/studio/sketch/index.html', 'Slajdy'], ['studio/sketch/energy-map.html', 'dist/studio/sketch/energy-map.html']]) {
    fs.mkdirSync(path.dirname(path.join(R, dst)), { recursive: true });
    const h = read(src);
    fs.writeFileSync(path.join(R, dst), title ? lock(h, PASS, title, favicon) : h);   // kopia szkicu: publiczna treść, jawna
  }
}
console.log(`dist/index.html (Akademia) ${Math.round(pub.length / 1024)} KB · studio/index.html ${Math.round(studio.length / 1024)} KB · sekwencji slajdów: ${seqs.seqs.length}${PASS ? ' · studio online: dist/studio/ (zaszyfrowane)' : ''}`);
