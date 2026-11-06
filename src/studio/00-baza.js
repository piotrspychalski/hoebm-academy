// Baza studia nagrań: pomocnicze DOM, pamięć ustawień, stan, płótno podglądu rolki i pętla rysowania.
// Rysowanie należy do 02-rolka.js (STUDIO_HOOK.draw); tu tylko pętla requestAnimationFrame i start po wczytaniu krojów.
const $ = id => document.getElementById(id);
const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) k === 'text' ? (e.textContent = v) : e.setAttribute(k, v); e.append(...kids); return e; };
const store = {   // localStorage w try/catch — działa też bez pamięci przeglądarki
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* bez pamięci: tylko ta karta */ } },
};
const params = new URLSearchParams(location.search);
const LOCAL = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);   // '' = file://
const PREVIEW = LOCAL && params.has('preview');   // szkice sekwencji slajdów tylko lokalnie
const STATE = { safe: false };                    // S — nakładka strefy bezpiecznej (tylko podgląd)
const STUDIO_HOOK = { draw: null };               // 02-rolka.js: rysuje całą klatkę rolki

function initStage() {
  const ctx = $('stage').getContext('2d');
  const loop = now => { TEXT_LOG.length = 0; STUDIO_HOOK.draw?.(ctx, now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
// Start: czekamy na kroje (maks. 2,5 s), żeby pierwsza klatka nie mrugnęła fontem zastępczym
const fontsReady = document.fonts
  ? Promise.race([Promise.all([font('display', 800, 64), font('mono', 600, 24), font('sans', 400, 24)].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]).catch(() => {})
  : Promise.resolve();
fontsReady.then(() => { initStage(); initStudio(); });
