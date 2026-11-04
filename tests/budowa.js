// Budowa: dist/index.html powstaje, zawiera wszystkie znaczniki, a wynik nie ma pozostawionych symboli zastępczych
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..'), errors = [];
execFileSync('node', [path.join(R, 'build.js')], { stdio: 'inherit' });
const html = fs.readFileSync(path.join(R, 'dist/index.html'), 'utf8');
for (const p of ['/*REG*/', '/*CORE*/', '/*APP*/', '%LOGO%', '%VERSION%']) if (html.includes(p)) errors.push(`pozostał symbol ${p}`);
for (const id of ['stage', 'series', 'figlist', 'panel', 'startDlg', 'srcDlg', 'citeDlg']) if (!html.includes(`id="${id}"`)) errors.push(`brak #${id}`);
if (/Math\.random\(/.test(fs.readFileSync(path.join(R, 'dist/core.js'), 'utf8'))) errors.push('Math.random() w rdzeniu — użyj rng(seed)');
try { new Function(html.match(/<script>([\s\S]*)<\/script>/)[1]); } catch (e) { errors.push('błąd składni skryptu: ' + e.message); }
console.log('errors', JSON.stringify(errors));
process.exit(errors.length ? 1 : 0);
