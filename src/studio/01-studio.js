// STUDIO — prywatny widok do nagrywania (tylko studio/index.html, budowany lokalnie, nigdy publikowany).
// Telefon 9:16 na komputerze: sama scena na całą wysokość okna, bez interfejsu. Rycina: ?f=<id> albo ← →.
// Skróty: R — restart (1,5 s czystej klatki, potem sekwencja; chowa pomoc) · Space — pauza · S — strefa bezpieczna Reels
//         F — pełny ekran · ← → — poprzednia / następna rycina · H — pomoc
function initStudio() {
  const root = document.documentElement;
  root.classList.add('studio');
  const hud = el('div', { class: 'studiohud', role: 'note' });
  hud.innerHTML = '<b>STUDIO</b> · tylko lokalnie<br>R restart (czysta klatka 1,5 s) · Space pauza<br>S strefa bezpieczna · F pełny ekran<br>← → rycina · H pomoc<br><span id="hudFig"></span>';
  document.body.append(hud);
  const setHud = () => { const f = figById(STATE.figure); $('hudFig').textContent = f ? `FIG. ${f.fig} ${f.id}${f.status !== 'published' ? ' · DRAFT' : ''}` : 'brak ryciny (?f=<id>)'; };
  setHud();
  let idle = null;
  addEventListener('mousemove', () => { root.classList.remove('hidecursor'); clearTimeout(idle); idle = setTimeout(() => root.classList.add('hidecursor'), 1500); });
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (k === ' ') { e.preventDefault(); CLOCK.toggle(); }
    else if (k === 'r') { hud.hidden = true; CLOCK.restart(T.cleanMs); }
    else if (k === 's') STATE.safe = !STATE.safe;
    else if (k === 'f') { document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.().catch(() => {}); }
    else if (k === 'h') hud.hidden = !hud.hidden;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { stepFigure(e.key === 'ArrowRight' ? 1 : -1); setHud(); }
  });
}
