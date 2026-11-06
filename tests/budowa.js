// Budowa: Akademia publiczna (dist/index.html) i studio nagrań (studio/, online dist/studio/ zaszyfrowane) powstają
// poprawnie, bez symboli zastępczych, bez błędów składni; strona publiczna nie zawiera nic ze studia.
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), errors = [];
execFileSync('node', [path.join(R, 'build.js')], { stdio: 'inherit' });
const html = fs.readFileSync(path.join(R, 'dist/index.html'), 'utf8');
const studio = fs.readFileSync(path.join(R, 'studio/index.html'), 'utf8');
const player = fs.readFileSync(path.join(R, 'studio/sketch/index.html'), 'utf8');
const syntax = (h, at) => { for (const m of h.matchAll(/<script>([\s\S]*?)<\/script>/g)) try { new Function(m[1]); } catch (e) { errors.push(`${at}: błąd składni: ${e.message}`); } };

// Akademia publiczna = szkic wzorcowy
if (!html.includes('window.HoEBMSketch') || !html.includes('Sports Academy')) errors.push('dist: brak szkicu Akademii');
if (!/<title>Sports Academy/.test(html)) errors.push('dist: tytuł strony');
if (html.includes('href="../"')) errors.push('dist: logo prowadzi poza stronę (../)');
if (html.includes('noindex')) errors.push('dist: noindex w wersji publicznej');
if (html.includes("className = 'vnav'") || html.includes('initStudio')) errors.push('dist: kod studia w wersji publicznej');
syntax(html, 'dist');

// Studio nagrań (lokalnie)
for (const p of ['/*CORE*/', '/*STUDIO*/', '%SEQS%', '%VERSION%', '%LOGO%', '%FAVICON%', '/*SEQS*/']) {
  if (studio.includes(p)) errors.push(`studio: pozostał symbol ${p}`);
  if (player.includes(p)) errors.push(`slajdy: pozostał symbol ${p}`);
}
if (!studio.includes('function initStudio') || !studio.includes('function initRolka')) errors.push('studio: brak kodu studia');
if (!studio.includes('noindex')) errors.push('studio: brak noindex');
if (/Math\.random\(/.test(studio.replace(/\/\/.*$/gm, ''))) errors.push('studio: Math.random() — użyj rng(seed)');
syntax(studio, 'studio'); syntax(player, 'slajdy');
if (!fs.readFileSync(path.join(R, '.gitignore'), 'utf8').split('\n').includes('/studio/')) errors.push('.gitignore: brak /studio/ (tylko katalog główny, nie src/studio)');
if (!execFileSync('git', ['ls-files', 'src/studio'], { cwd: R, encoding: 'utf8' }).trim()) errors.push('src/studio nie jest w repozytorium');

// Studio online (dist/studio/, tylko z STUDIO_PASSWORD): strony studia wyłącznie zaszyfrowane
if (fs.existsSync(path.join(R, 'dist/studio'))) {
  for (const f of ['index.html', 'sketch/index.html']) {
    const h = fs.readFileSync(path.join(R, 'dist/studio', f), 'utf8');
    if (/initStudio|ROLKA|const SEQS/.test(h) || !h.includes('crypto.subtle.decrypt')) errors.push(`dist/studio/${f}: studio nie jest zaszyfrowane`);
    if (!h.includes('noindex')) errors.push(`dist/studio/${f}: brak noindex`);
  }
}
for (const d of fs.readdirSync(path.join(R, 'dist'))) if (/^studio-/.test(d)) errors.push('dist: katalog studia z dawną tajną ścieżką');
console.log('errors', JSON.stringify(errors));
process.exit(errors.length ? 1 : 0);
