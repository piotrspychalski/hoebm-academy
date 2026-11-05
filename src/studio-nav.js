// Nawigacja główna prywatnych widoków (Akademia, studio nagrań, slajdy) — tylko w buildach studia, nigdy na stronie publicznej.
// Online: wszystkie widoki leżą pod tajną ścieżką (dist/<STUDIO_PATH>/…), Akademia to strona publiczna piętro wyżej.
// Lokalnie (localhost / file://): studio/ i studio/sketch/; Akademia — wersja na żywo.
// Pasek chowa się po 2 s bez ruchu myszy i znika całkiem w trakcie nagrywania (html.recording).
(() => {
  if (window.top !== window) return;   // szkic w ramce studia slajdów: bez paska
  const LIVE = 'https://piotrspychalski.github.io/sports-academy/';
  const here = location.pathname, inSketch = /\/sketch\/[^/]*$/.test(here);
  const base = inSketch ? '../' : './';                       // katalog studia rycin
  const local = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);
  const keep = new URLSearchParams(location.search).has('preview') ? '?preview' : '';
  const items = [
    ['academy', 'Akademia', local ? LIVE : base + '../', 'Strona publiczna: ryciny i animacje'],
    ['studio', 'Studio nagrań', base + keep, 'Rolka z animacji Akademii: kamera, zdjęcie, slajdy (N)'],
    ['slides', 'Slajdy', base + 'sketch/' + keep, 'Odtwarzacz sekwencji slajdów 16:9; nowe sekwencje: poproś Claude (skill sketch-slides)'],
  ];
  const cur = /energy-map\.html$/.test(here) ? 'academy' : inSketch ? 'slides' : 'studio';
  const css = `.vnav{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:70;display:flex;gap:2px;padding:3px;
    background:rgba(27,31,48,.88);border-radius:999px;font:600 12px/1 "IBM Plex Mono",ui-monospace,monospace;transition:opacity .3s}
    .vnav a{color:#F2F0F1;text-decoration:none;padding:7px 12px;border-radius:999px;white-space:nowrap}
    .vnav a:hover{background:rgba(242,240,241,.15)} .vnav a[aria-current]{background:#F2F0F1;color:#1B5996}
    .vnav.idle{opacity:0;pointer-events:none} html.recording .vnav{display:none}`;
  const mount = () => {
    const st = document.createElement('style'); st.textContent = css; document.head.append(st);
    const nav = document.createElement('nav'); nav.className = 'vnav'; nav.setAttribute('aria-label', 'Sports Academy — widoki');
    for (const [id, label, href, title] of items) {
      const a = document.createElement('a'); a.href = href; a.textContent = label; a.title = title;
      if (id === cur) a.setAttribute('aria-current', 'page');
      nav.append(a);
    }
    document.body.append(nav);
    let t = null;
    const wake = () => { nav.classList.remove('idle'); clearTimeout(t); t = setTimeout(() => nav.classList.add('idle'), 2000); };
    addEventListener('mousemove', wake); addEventListener('touchstart', wake, { passive: true }); wake();
  };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', mount) : mount();
})();
