// Stan aplikacji, ulubione (localStorage w try/catch — działa też bez pamięci przeglądarki), podgląd szkiców.
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* brak pamięci: stan tylko w tej karcie */ } },
};
const params = new URLSearchParams(location.search);
const LOCAL = ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname);   // '' = file://
const PREVIEW = LOCAL && params.has('preview');
const STATE = {
  series: 'all',            // 'all' | 'favs' | id serii
  figure: null,             // id ryciny
  query: '',
  favs: new Set(store.get('hoebm-fav', [])),
  safe: false,
};
const visibleFigures = () => REG.figures.filter(f => f.status === 'published' || PREVIEW);
const figById = id => visibleFigures().find(f => f.id === id) || null;
function toggleFav(id) { STATE.favs.has(id) ? STATE.favs.delete(id) : STATE.favs.add(id); store.set('hoebm-fav', [...STATE.favs]); }
