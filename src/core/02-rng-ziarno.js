// Deterministyczny PRNG (mulberry32): ziarno papieru, krawędzie zakreślacza, cząstki — identyczne w każdym nagraniu.
// W rycinach nie używamy losowania z przeglądarki (test budowa.js to sprawdza).
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Ziarno papieru liczone raz (cache)
let _grain = null;
function grain() {
  if (_grain) return _grain;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), img = g.createImageData(W, H), r = rng(7);
  for (let i = 0; i < img.data.length; i += 4) { const v = r() < 0.5 ? 0 : 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = r() * 14; }
  g.putImageData(img, 0, 0);
  return (_grain = c);
}
