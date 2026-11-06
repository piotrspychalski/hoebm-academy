// Budowa: dist/index.html powstaje, zawiera wszystkie znaczniki, a wynik nie ma pozostawionych symboli zastępczych
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), errors = [];
execFileSync('node', [path.join(R, 'build.js')], { stdio: 'inherit' });
const html = fs.readFileSync(path.join(R, 'dist/index.html'), 'utf8');
const studio = fs.readFileSync(path.join(R, 'studio/index.html'), 'utf8');
for (const p of ['<!--ROBOTS-->', '/*REG*/', '/*CORE*/', '/*APP*/', '%LOGO%', '%VERSION%']) if (studio.includes(p)) errors.push(`pozostał symbol ${p}`);
// Akademia publiczna = szkic wzorcowy (reference/energy-map.html)
if (!html.includes('window.HoEBMSketch') || !html.includes('Sports Academy')) errors.push('dist: brak szkicu Akademii');
if (!/<title>Sports Academy/.test(html)) errors.push('dist: tytuł strony');
if (html.includes('href="../"')) errors.push('dist: logo prowadzi poza stronę (../)');
function studio_noindex() { return studio.includes('noindex'); }
// Trzy widoki: publiczny dist/ (komputer + telefon) nie może zawierać studia; studio/ tylko lokalnie
if (html.includes('function initStudio')) errors.push('dist: kod studia w wersji publicznej');
// Studio online (dist/studio/, tylko z STUDIO_PASSWORD): strony studia wyłącznie zaszyfrowane
if (fs.existsSync(path.join(R, 'dist/studio'))) {
  for (const f of ['index.html', 'sketch/index.html']) {
    const h = fs.readFileSync(path.join(R, 'dist/studio', f), 'utf8');
    if (/initStudio|ROLKA|const SEQS/.test(h) || !h.includes("crypto.subtle.decrypt")) errors.push(`dist/studio/${f}: studio nie jest zaszyfrowane`);
    if (!h.includes('noindex')) errors.push(`dist/studio/${f}: brak noindex`);
  }
}
for (const d of fs.readdirSync(path.join(R, 'dist'))) if (/^studio-/.test(d)) errors.push('dist: katalog studia z dawną tajną ścieżką');
if (html.includes('noindex')) errors.push('dist: noindex w wersji publicznej');
if (!studio_noindex()) errors.push('studio: brak noindex');

if (!studio.includes('const STUDIO = true') || !studio.includes('function initStudio')) errors.push('studio: brak trybu studio');
if (!fs.readFileSync(path.join(R, '.gitignore'), 'utf8').split('\n').includes('/studio/')) errors.push('.gitignore: brak /studio/ (tylko katalog główny, nie src/studio)');
if (!require('child_process').execFileSync('git', ['ls-files', 'src/studio'], { cwd: R, encoding: 'utf8' }).trim()) errors.push('src/studio nie jest w repozytorium');
for (const m of studio.matchAll(/<script>([\s\S]*?)<\/script>/g)) try { new Function(m[1]); } catch (e) { errors.push('studio: błąd składni: ' + e.message); }
if (html.includes("className = 'vnav'")) errors.push('nawigacja prywatnych widoków w wersji publicznej');
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) try { new Function(m[1]); } catch (e) { errors.push('dist: błąd składni skryptu: ' + e.message); }
console.log('errors', JSON.stringify(errors));
process.exit(errors.length ? 1 : 0);
