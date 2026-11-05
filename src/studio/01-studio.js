// STUDIO NAGRAŃ — prywatny widok (studio/index.html lokalnie, online pod tajną ścieżką; nigdy linkowany ze strony publicznej).
// Od 0.10.0 nagrywa animację Akademii (szkic wzorcowy, reference/energy-map.html) osadzoną obok podglądu rolki 9:16.
// Autor steruje szkicem na żywo (tematy, narządy, suwaki) albo sekwencją slajdów z data/slides; nagrywanie: 02-rolka.js.
// Skróty: N — nagraj · 1–4 — podgląd scen · S — strefa bezpieczna Reels · F — pełny ekran · H — pomoc.
function initStudio() {
  const root = document.documentElement;
  root.classList.add('studio');
  const hud = el('div', { class: 'studiohud', role: 'note' });
  hud.innerHTML = '<b>STUDIO NAGRAŃ</b> · nie linkować<br>Po lewej: animacja Akademii — klikaj w niej tematy, narządy, suwaki.<br>'
    + 'Po prawej: panel ROLKA. N — nagraj · 1–4 podgląd scen<br>S strefa bezpieczna · F pełny ekran · H pomoc';
  document.body.append(hud);
  let idle = null;
  addEventListener('mousemove', () => { root.classList.remove('hidecursor'); clearTimeout(idle); idle = setTimeout(() => root.classList.add('hidecursor'), 1500); });
  addEventListener('keydown', e => {
    if (e.target instanceof Element && e.target.matches('input[type=text], input[type=number], select, textarea')) return;
    const k = e.key.toLowerCase();
    if (k === 's') STATE.safe = !STATE.safe;
    else if (k === 'f') { document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.().catch(() => {}); }
    else if (k === 'h') hud.hidden = !hud.hidden;
  });
  initRolka();
}
