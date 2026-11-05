// Odtworzenie tests/szerokosci.json: wklej w konsoli strony Sports Academy (po załadowaniu krojów) i zapisz wynik.
(async () => {
  const fam = { display: '"Montserrat", "Helvetica Neue", Arial, sans-serif', sans: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif', mono: '"IBM Plex Mono", ui-monospace, Menlo, monospace' };
  const specs = [['display', 800], ['sans', 400], ['sans', 500], ['sans', 600], ['mono', 400], ['mono', 600]];
  await Promise.all(specs.map(([f, w]) => document.fonts.load(`${w} 100px ${fam[f]}`)));
  let chars = ''; for (let i = 32; i < 127; i++) chars += String.fromCharCode(i);
  chars += '↓↑≥≤–—~·→×…’“”µ°±';
  const c = document.createElement('canvas').getContext('2d'), out = {};
  for (const [f, w] of specs) { c.font = `${w} 100px ${fam[f]}`; const m = {}; for (const ch of chars) m[ch] = +(c.measureText(ch).width / 100).toFixed(4); out[f + '|' + w] = m; }
  console.log(JSON.stringify(out));
})();
