// Liczby bez źródła + strefa bezpieczna + nakładanie się tekstu.
// Uruchamia rdzeń (dist/core.js) w Node na atrapie canvasu: każda rycina z rejestru, oba układy (pionowy: studio/telefon,
// poziomy: komputer), cała sekwencja co 250 ms, każdy kadr i siatka położeń suwaków. Rdzeń loguje każdy tekst (03-tekst.js).
// Szerokość tekstu: tabela zmierzona w Chrome na tych samych krojach (tests/szerokosci.json, zgodność ~0,1%).
// Reguły:
//  - tekst z cyfrą i rolą 'content' musi mieć claim tej ryciny, a każda liczba w tekście musi występować w display/derived tego claimu
//  - rola 'citation': liczba = rok albo PMID źródła tej ryciny · 'fig': numer tej ryciny · 'axis': podziałka osi (dozwolona)
//  - każdy tekst w granicach układu (LY.bounds; w pionie = strefa bezpieczna Reels x 65–1015, y 269–1248)
//  - teksty nie nachodzą na siebie (tolerancja 2 px)
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, '..');
require('child_process').execFileSync('node', [path.join(R, 'build.js')], { stdio: 'ignore' });
const { load } = require('../tools/registry.js');
const reg = load(R);
const WID = JSON.parse(fs.readFileSync(path.join(__dirname, 'szerokosci.json'), 'utf8'));
const css = fs.readFileSync(path.join(R, 'src/shell.html'), 'utf8');
const cssVar = n => ((css.match(new RegExp(`${n}:\\s*([^;]+);`)) || [])[1] || '').trim();

// Atrapa canvasu: mierzy tekst z tabeli szerokości, resztę wywołań ignoruje
function measure(font, s) {
  const m = font.match(/(\d+)\s+(\d+(?:\.\d+)?)px\s+"([^"]+)"/);
  const w = +m[1], px = +m[2], fam = m[3].includes('Mono') ? 'mono' : m[3].includes('Montserrat') ? 'display' : 'sans';
  const tab = WID[`${fam}|${w}`] || WID[`${fam}|${w >= 600 ? 600 : 400}`];
  let em = 0; for (const ch of s) em += tab['*'] ?? tab[ch] ?? tab['M'] ?? 0.6;
  return { width: em * px, actualBoundingBoxAscent: px * 0.74, actualBoundingBoxDescent: /[gjpqy,(){}\[\]|]/.test(s) ? px * 0.24 : px * 0.02 };
}
function fakeCtx() {
  const ctx = { font: '400 10px "IBM Plex Sans"', filter: 'none' };
  for (const k of ['save', 'restore', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'rect', 'fill', 'stroke', 'clip', 'fillRect', 'strokeRect',
    'drawImage', 'translate', 'rotate', 'setTransform', 'setLineDash', 'fillText', 'putImageData']) ctx[k] = () => {};
  ctx.measureText = s => measure(ctx.font, s);
  ctx.createImageData = (w, h) => ({ data: new Uint8ClampedArray(4) });
  return ctx;
}
const sandbox = {
  document: { documentElement: {}, createElement: () => ({ getContext: fakeCtx, width: 0, height: 0 }) },
  getComputedStyle: () => ({ getPropertyValue: n => cssVar(n) }),
  matchMedia: () => ({ matches: false }),
  Image: class { constructor() { this.complete = false; this.naturalWidth = 0; } },
  console,
};
sandbox.window = sandbox;
vm.createContext(sandbox);
const core = fs.readFileSync(path.join(R, 'dist/core.js'), 'utf8');
vm.runInContext(`const REG = ${JSON.stringify(reg)}; const LOGO_SRC = ''; const STUDIO = false;\n${core}\n` +
  `this.__api = { FIGMOD, LAYOUTS, setLY: l => { LY = l; }, getLY: () => LY, TEXT_LOG, beginFrame, frameHeader, keyAt, smooth };`, sandbox);
const api = sandbox.__api;

const errors = [], seen = new Set();
const err = m => { if (!seen.has(m)) { seen.add(m); errors.push(m); } };
const nums = s => s.match(/\d+(?:[.,]\d+)?/g) || [];
let frames = 0;

for (const f of reg.figures) {
  const mod = api.FIGMOD[f.id];
  if (!mod) { err(`${f.id}: brak modułu ryciny w src/core`); continue; }
  const claims = Object.fromEntries((f.claims || []).map(c => [c.id, c]));
  const allowedCit = new Set((f.refs || []).flatMap(r => { const s = reg.sources[r[0]] || {}; return [String(s.year || ''), String(s.pmid || '')]; }).filter(Boolean));
  const end = (mod.frames.find(x => x.end != null) || {}).end || 0;
  const states = [];
  for (let ms = 0; ms <= end; ms += 250) states.push({ st: api.keyAt(mod.keys, ms), ms, seq: true, at: `t=${ms} ms` });
  for (const fr of mod.frames.filter(x => x.label)) states.push({ st: api.keyAt(mod.keys, fr.t), ms: fr.t, seq: true, at: `kadr „${fr.label}”` });
  const grid = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1];
  const ps = mod.params.map(p => p.id);
  const combos = ps.reduce((acc, p) => acc.flatMap(o => grid.map(v => ({ ...o, [p]: v }))), [{}]);
  for (const st of combos) states.push({ st, ms: 0, seq: false, at: 'suwaki ' + JSON.stringify(st) });

  for (const layout of Object.values(api.LAYOUTS)) {
    api.setLY(layout);
    const B = layout.bounds;
    for (const box of Object.values(layout.boxes)) if (box.x < B.x0 || box.x + box.w > B.x1 || box.y < B.y0 || box.y + box.h > B.y1) err(`${layout.id}: prostokąt panelu poza granicami ${JSON.stringify(box)}`);
    for (const s of states) {
      api.beginFrame(); frames++;
      const ctx = fakeCtx();
      api.frameHeader(ctx, { label: `FIG. ${f.fig}  ·  ${f.series.toUpperCase()}`, title: f.title, highlight: f.highlight ?? -1, revealK: 1, markerK: 1 });
      mod.draw(ctx, s.st, s.ms, 16, s.seq);
      const T = api.TEXT_LOG.slice(), where = `${f.id}, ${layout.id}, ${s.at}`;
      for (const t of T) {
        const n = nums(t.s);
        if (n.length) {
          if (t.role === 'content') {
            const c = claims[t.claim];
            if (!t.claim) err(`${f.id}: liczba bez źródła „${t.s}” (${layout.id})`);
            else if (!c) err(`${f.id}: „${t.s}” wskazuje nieistniejący claim ${t.claim}`);
            else {
              const ok = [...c.display, ...(c.derived || []).map(d => d.display)].join(' ');
              for (const x of n) if (!nums(ok).includes(x)) err(`${f.id}: „${t.s}” — liczby ${x} nie ma w claimie ${t.claim}`);
            }
          } else if (t.role === 'citation') { for (const x of n) if (!allowedCit.has(x)) err(`${f.id}: cytowanie „${t.s}” nie jest rokiem ani PMID źródła tej ryciny`); }
          else if (t.role === 'fig') { for (const x of n) if (x !== String(f.fig)) err(`${f.id}: numer „${t.s}” różny od FIG. ${f.fig}`); }
        }
        const [x0, y0, x1, y1] = t.box;
        if (x0 < B.x0 || x1 > B.x1 || y0 < B.y0 || y1 > B.y1) err(`${where}: tekst „${t.s}” poza granicami [${t.box.map(Math.round)}]`);
      }
      for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
        const a = T[i].box, b = T[j].box;
        if (a[0] < b[2] - 2 && b[0] < a[2] - 2 && a[1] < b[3] - 2 && b[1] < a[3] - 2) err(`${f.id}, ${layout.id}: nachodzą „${T[i].s}” × „${T[j].s}” (${s.at})`);
      }
    }
  }
}
console.log(`liczby i strefa: ${reg.figures.length} rycin × ${Object.keys(api.LAYOUTS).length} układy, ${frames} klatek`);
console.log('errors', JSON.stringify(errors.slice(0, 40)));
process.exit(errors.length ? 1 : 0);
