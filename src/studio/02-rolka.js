// ROLKA — nagrywanie gotowej rolki w studiu, bez montażu i bez zależności (getUserMedia + MediaRecorder).
// Scenariusz w jednym ujęciu (autor przełącza spacją / → / PageDown albo pilotem):
//   1. tytuł  — logo i tytuł ryciny (wyostrza się z rozmycia); przechodzi sam po „Tytuł, s” albo wcześniej
//   2. kotwica — zdjęcie albo krótkie wideo z wyprawy: pół ekranu z tytułem i podpisem albo pełny ekran;
//                zdjęcie przechodzi samo po „Zdjęcie, s”, wideo — po swoim końcu; pomijane, gdy brak pliku
//   3. twarz  — kamera na całym kadrze, aż autor przełączy; pomijane bez kamery
//   4. rycina — animacja z kółkiem kamery w prawym górnym rogu; każde „dalej” odtwarza następny kadr,
//               „dalej” po ostatnim kadrze kończy nagranie
// Plik (MP4, gdy przeglądarka umie; inaczej WebM) zapisuje się na dysk tego komputera. Nic nie jest wysyłane.
// Dźwięk: tylko mikrofon autora (wideo z wyprawy jest wyciszone). Esc przerywa bez zapisu.
// Bez nagrywania: klawisze 1–4 pokazują podgląd scen, 0 wraca do ryciny.
const ROLKA = {
  seg: null, t0: 0, rec: null, chunks: [], preview: false,
  stream: null, camEl: null,              // kamera + mikrofon
  media: null, mediaKind: null, mediaUrl: null, mediaName: '',
  opt: Object.assign({ caption: '', variant: 'half', durTitle: 3, durMedia: 5 }, store.get('hoebm-rolka', {})),
  saved: null,                            // ostatni zapisany plik { url, name }
};
const SEGS = ['title', 'media', 'face', 'fig'];

// Kadrowanie „cover”: źródło wypełnia prostokąt, nadmiar przycięty po środku
function drawCover(ctx, src, sw, sh, x, y, w, h) {
  if (!sw || !sh) return;
  const k = Math.max(w / sw, h / sh), cw = w / k, ch = h / k;
  ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, x, y, w, h);
}
const srcSize = el => el instanceof HTMLVideoElement ? [el.videoWidth, el.videoHeight] : [el.naturalWidth, el.naturalHeight];
const toReel = ctx => { const P = LAYOUTS.reel.place; ctx.setTransform(P.k, 0, 0, P.k, P.x, P.y); };   // współrzędne logiczne rolki
const toCanvas = ctx => ctx.setTransform(1, 0, 0, 1, 0, 0);

// Tytuł zawinięty po słowach (wspólne z ramą ryciny), z zakreślaczem pod wyróżnionym odcinkiem
function reelTitle(ctx, f, x, y, px, maxW, color, revealK, markerK) {
  const tf = font('display', 800, px), lh = Math.round(px * 1.12);
  const lines = wrapTitle(ctx, f.title, tf, maxW, f.highlight ?? -1);
  if (markerK > 0) lines.forEach((ln, i) => { if (ln.hl) marker(ctx, x + ln.hl[0] - 8, y + i * lh - px * 0.66, ln.hl[1] - ln.hl[0] + 16, px, markerK); });
  titleText(ctx, revealK, () => lines.forEach((ln, i) => txt(ctx, ln.s, x, y + i * lh, { font: tf, color })));
  return y + (lines.length - 1) * lh;   // linia bazowa ostatniego wiersza
}
const figLabel = f => `FIG. ${f.fig}  ·  ${SERIES_LABEL[f.series].toUpperCase()}`;

// 1. Karta tytułowa
function segTitle(ctx, f, el) {
  framePaper(ctx); toReel(ctx);
  const L = LAYOUTS.reel, lw = 460, lh = lw / LOGO_AR;
  if (_logo.complete && _logo.naturalWidth) ctx.drawImage(_logo, (L.W - lw) / 2, 70, lw, lh);
  txt(ctx, figLabel(f), L.L, 290, { font: font('mono', 600, 24), color: T.c.ink2, role: 'fig' });
  ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.line; ctx.beginPath(); ctx.moveTo(L.L, 308); ctx.lineTo(L.R, 308); ctx.stroke();
  reelTitle(ctx, f, L.L, 384, 60, L.R - L.L, T.c.ink, Math.min(1, el / T.revealMs), REDUCE ? 1 : smooth((el - T.revealMs) / 600));
}

// 2. Kotwica: zdjęcie / wideo z wyprawy
function segMedia(ctx, f, el) {
  const m = ROLKA.media, [sw, sh] = srcSize(m), L = LAYOUTS.reel, cap = ROLKA.opt.caption.trim();
  if (ROLKA.opt.variant === 'full') {
    toCanvas(ctx); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    drawCover(ctx, m, sw, sh, 0, 0, W, H);
    const g = ctx.createLinearGradient(0, SAFE.y0 + 300, 0, SAFE.y1 + 120);   // przyciemnienie pod tytułem
    g.addColorStop(0, 'rgba(27, 31, 48, 0)'); g.addColorStop(1, 'rgba(27, 31, 48, 0.78)');
    ctx.fillStyle = g; ctx.fillRect(0, SAFE.y0 + 300, W, H - SAFE.y0 - 300);
    toReel(ctx);
    const fs = 52, tf = font('display', 800, fs), n = wrapTitle(ctx, f.title, tf, L.R - L.L).length, y0 = L.H - 24 - (cap ? 40 : 0) - (n - 1) * Math.round(fs * 1.12);
    reelTitle(ctx, f, L.L, y0, fs, L.R - L.L, T.c.paper, 1, 0);
    if (cap) txt(ctx, cap, L.L, L.H - 14, { font: font('mono', 500, 24), color: T.c.paper, role: 'citation' });
  } else {
    framePaper(ctx); toReel(ctx);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, L.W, 420); ctx.clip(); drawCover(ctx, m, sw, sh, 0, 0, L.W, 420); ctx.restore();
    txt(ctx, figLabel(f), L.L, 478, { font: font('mono', 600, 24), color: T.c.ink2, role: 'fig' });
    const yl = reelTitle(ctx, f, L.L, 540, 50, L.R - L.L, T.c.ink, 1, REDUCE ? 1 : smooth(el / 600));
    if (cap) txt(ctx, cap, L.L, Math.min(L.H - 10, yl + 52), { font: font('mono', 500, 24), color: T.c.ink2, role: 'citation' });
  }
}

// 3. Twarz na całym kadrze (bez lustra — tak, jak zobaczą widzowie)
function segFace(ctx) {
  toCanvas(ctx); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const v = ROLKA.camEl; drawCover(ctx, v, v.videoWidth, v.videoHeight, 0, 0, W, H);
}

// 4. Kółko kamery na rycinie (układ reelCam, współrzędne logiczne)
function camCircle(ctx) {
  const c = LY.cam, v = ROLKA.camEl; if (!c || !v || !v.videoWidth) return;
  ctx.save(); ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.clip();
  drawCover(ctx, v, v.videoWidth, v.videoHeight, c.x - c.r, c.y - c.r, 2 * c.r, 2 * c.r); ctx.restore();
  ctx.strokeStyle = T.c.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.stroke();
}

function rolkaDraw(ctx, now) {
  const seg = ROLKA.seg, f = curFig();
  if (!seg || seg === 'fig' || !f) return false;
  const el = now - ROLKA.t0;
  if (seg === 'title') { segTitle(ctx, f, el); if (ROLKA.rec && el > ROLKA.opt.durTitle * 1000) next(); }
  else if (seg === 'media') {
    segMedia(ctx, f, el);
    const vid = ROLKA.mediaKind === 'video';
    if (ROLKA.rec && (vid ? ROLKA.media.ended : el > ROLKA.opt.durMedia * 1000)) next();
  } else if (seg === 'face') segFace(ctx);
  toCanvas(ctx);
  if (STATE.safe) frameSafeZone(ctx);
  return true;
}

// ── Przełączanie scen
const available = s => s === 'media' ? !!ROLKA.media : s === 'face' ? !!ROLKA.stream : true;
function enter(seg) {
  ROLKA.seg = seg; ROLKA.t0 = performance.now();
  if (ROLKA.mediaKind === 'video') { const v = ROLKA.media; if (seg === 'media') { v.currentTime = 0; v.play().catch(() => {}); } else v.pause(); }
  if (seg === 'fig') { mountFigure(); SCN.manual = false; playFrame(0); }
  rolkaHud();
}
function next() {
  if (ROLKA.seg === 'fig') {
    const F = frames(), i = frameIndex(Math.max(0, CLOCK.now()));
    if (i + 1 < F.length) return playFrame(i + 1);
    return ROLKA.rec ? stopRec(true) : null;
  }
  let k = SEGS.indexOf(ROLKA.seg) + 1;
  while (k < SEGS.length && !available(SEGS[k])) k++;
  enter(SEGS[Math.min(k, SEGS.length - 1)]);
}

// ── Kamera i mikrofon
async function startCam() {
  const vId = $('rkCam')?.value, aId = $('rkMic')?.value;
  stopCam();
  try {
    ROLKA.stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: vId ? { exact: vId } : undefined, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: { deviceId: aId ? { exact: aId } : undefined, echoCancellation: true, noiseSuppression: true },
    });
  } catch (e) { rolkaMsg('Brak dostępu do kamery / mikrofonu: ' + e.message); return; }
  const v = ROLKA.camEl || (ROLKA.camEl = Object.assign(document.createElement('video'), { muted: true, playsInline: true }));
  v.srcObject = ROLKA.stream; await v.play().catch(() => {});
  STUDIO_HOOK.cam = true; setView();
  await fillDevices();
  rolkaMsg('Kamera i mikrofon włączone.');
}
function stopCam() {
  ROLKA.stream?.getTracks().forEach(t => t.stop()); ROLKA.stream = null;
  STUDIO_HOOK.cam = false; setView();
}
async function fillDevices() {
  const ds = await navigator.mediaDevices.enumerateDevices().catch(() => []);
  const cur = ROLKA.stream?.getTracks().map(t => t.getSettings().deviceId) || [];
  for (const [id, kind] of [['rkCam', 'videoinput'], ['rkMic', 'audioinput']]) {
    const sel = $(id); sel.replaceChildren(...ds.filter(d => d.kind === kind).map((d, i) => {
      const o = el('option', { value: d.deviceId, text: d.label || `${kind === 'videoinput' ? 'Kamera' : 'Mikrofon'} ${i + 1}` });
      if (cur.includes(d.deviceId)) o.selected = true; return o;
    }));
  }
}

// ── Zdjęcie / wideo z wyprawy (tylko w pamięci tej karty)
function setMedia(file) {
  if (!file) return;
  const kind = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : null;
  if (!kind) return rolkaMsg('To nie jest zdjęcie ani wideo: ' + file.name);
  if (ROLKA.mediaUrl) URL.revokeObjectURL(ROLKA.mediaUrl);
  const url = URL.createObjectURL(file);
  const m = kind === 'video' ? Object.assign(document.createElement('video'), { muted: true, playsInline: true, preload: 'auto', src: url })
    : Object.assign(new Image(), { src: url });
  Object.assign(ROLKA, { media: m, mediaKind: kind, mediaUrl: url, mediaName: file.name });
  const ok = () => rolkaMsg(`${kind === 'video' ? 'Wideo' : 'Zdjęcie'}: ${file.name}${kind === 'video' ? ` (${Math.round(m.duration)} s, bez dźwięku)` : ''}`);
  kind === 'video' ? m.addEventListener('loadedmetadata', ok, { once: true }) : m.addEventListener('load', ok, { once: true });
  rolkaHud();
}
function clearMedia() {
  if (ROLKA.mediaUrl) URL.revokeObjectURL(ROLKA.mediaUrl);
  Object.assign(ROLKA, { media: null, mediaKind: null, mediaUrl: null, mediaName: '' });
  if (ROLKA.seg === 'media') enter('title');
  rolkaHud();
}

// ── Nagrywanie
const MIME = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a', 'video/mp4',
  'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
function startRec() {
  if (!curFig()) return rolkaMsg('Najpierw wybierz rycinę (← →).');
  if (!window.MediaRecorder) return rolkaMsg('Ta przeglądarka nie nagrywa (MediaRecorder). Użyj Chrome.');
  $('rkPanel').hidden = true; $('rkCount').hidden = false;
  enter('title'); ROLKA.t0 = performance.now() + 1e9;   // karta tytułowa stoi rozmyta w czasie odliczania
  let n = 3; $('rkCount').textContent = n;
  const tick = setInterval(() => {
    n--; if (n > 0) { $('rkCount').textContent = n; return; }
    clearInterval(tick); $('rkCount').hidden = true;
    const type = MIME.find(t => MediaRecorder.isTypeSupported(t)) || '';
    const tracks = [...$('stage').captureStream(30).getVideoTracks(), ...(ROLKA.stream?.getAudioTracks() || [])];
    const rec = new MediaRecorder(new MediaStream(tracks), { mimeType: type || undefined, videoBitsPerSecond: 10e6, audioBitsPerSecond: 160e3 });
    ROLKA.chunks = []; ROLKA.rec = rec;
    rec.ondataavailable = e => { if (e.data.size) ROLKA.chunks.push(e.data); };
    rec.onstop = () => saveRec(rec);
    rec.start(1000); enter('title');
  }, 1000);
  ROLKA.countdown = tick;
}
function stopRec(keep) {
  clearInterval(ROLKA.countdown); $('rkCount').hidden = true;
  const rec = ROLKA.rec; ROLKA.rec = null;
  if (rec) { rec.keep = keep; rec.state !== 'inactive' && rec.stop(); }
  ROLKA.seg = null; if (ROLKA.mediaKind === 'video') ROLKA.media.pause();
  $('rkPanel').hidden = false; rolkaHud();
  if (!keep) rolkaMsg('Nagranie przerwane, nic nie zapisano.');
}
function saveRec(rec) {
  if (!rec.keep || !ROLKA.chunks.length) return;
  const type = rec.mimeType || 'video/webm', ext = type.includes('mp4') ? 'mp4' : 'webm';
  const f = curFig(), d = new Date(), p = n => String(n).padStart(2, '0');
  const name = `hoebm-fig${f.fig}-${f.id}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.${ext}`;
  if (ROLKA.saved) URL.revokeObjectURL(ROLKA.saved.url);
  ROLKA.saved = { url: URL.createObjectURL(new Blob(ROLKA.chunks, { type })), name };
  const a = el('a', { href: ROLKA.saved.url, download: name }); document.body.append(a); a.click(); a.remove();
  rolkaMsg(`Zapisano: ${name}${ext === 'webm' ? ' (WebM — ta przeglądarka nie nagrywa MP4)' : ''}`, true);
}

// ── Panel ustawień rolki (poza płótnem — nie trafia do nagrania)
function rolkaMsg(s, link) {
  const m = $('rkMsg'); m.textContent = s;
  if (link && ROLKA.saved) m.append(' · ', el('a', { href: ROLKA.saved.url, download: ROLKA.saved.name, text: 'pobierz ponownie' }));
}
function rolkaHud() {
  const o = ROLKA.opt, has = !!ROLKA.media;
  $('rkMedia').textContent = has ? ROLKA.mediaName : 'brak (scena 2 pominięta)';
  $('rkClear').hidden = !has;
  $('rkCamBtn').textContent = ROLKA.stream ? 'Wyłącz kamerę' : 'Włącz kamerę i mikrofon';
  $('rkDev').hidden = !ROLKA.stream;
  $('rkSeg').textContent = ROLKA.seg ? `${ROLKA.rec ? '● REC · ' : 'podgląd · '}${SEGS.indexOf(ROLKA.seg) + 1}/4 ${ROLKA.seg}` : '';
  store.set('hoebm-rolka', { caption: o.caption, variant: o.variant, durTitle: o.durTitle, durMedia: o.durMedia });
}
function initRolka() {
  const o = ROLKA.opt;
  const panel = el('div', { id: 'rkPanel', class: 'rolka' });
  panel.innerHTML = `<b>ROLKA</b> · nagranie z kamerą <button type="button" id="rkHide" aria-label="Zwiń">–</button>
    <div class="rk-body">
    <p><button type="button" id="rkCamBtn"></button></p>
    <p id="rkDev" hidden><select id="rkCam" aria-label="Kamera"></select><select id="rkMic" aria-label="Mikrofon"></select></p>
    <p>Zdjęcie lub wideo z wyprawy (przeciągnij tutaj):<br><input type="file" id="rkFile" accept="image/*,video/*">
       <br><span id="rkMedia"></span> <button type="button" id="rkClear">usuń</button></p>
    <p><label>Podpis <input type="text" id="rkCap" placeholder="np. Aconcagua, 2024" maxlength="60"></label></p>
    <p>Układ: <label><input type="radio" name="rkVar" value="half"> pół ekranu</label> <label><input type="radio" name="rkVar" value="full"> pełny ekran</label></p>
    <p><label>Tytuł, s <input type="number" id="rkDurT" min="1" max="10" step="0.5"></label>
       <label>Zdjęcie, s <input type="number" id="rkDurM" min="1" max="20" step="0.5"></label></p>
    <p><button type="button" id="rkRec" class="rk-rec">● Nagraj rolkę (N)</button></p>
    <p class="rk-help">Nagranie: spacja / → / pilot — dalej (na rycinie: następny kadr; po ostatnim — koniec) · Esc — przerwij bez zapisu<br>
       Podgląd: 1 tytuł · 2 zdjęcie · 3 twarz · 4 rycina · 0 wyłącz</p>
    <p id="rkMsg" role="status"></p></div>`;
  document.body.append(panel, el('div', { id: 'rkCount', class: 'rk-count', hidden: '' }), el('div', { id: 'rkSeg', class: 'rk-seg' }));
  $('rkHide').onclick = () => panel.classList.toggle('min');
  $('rkCamBtn').onclick = () => ROLKA.stream ? (stopCam(), rolkaHud()) : startCam().then(rolkaHud);
  $('rkCam').onchange = $('rkMic').onchange = () => startCam().then(rolkaHud);
  $('rkFile').onchange = e => setMedia(e.target.files[0]);
  $('rkClear').onclick = () => { $('rkFile').value = ''; clearMedia(); };
  $('rkCap').value = o.caption; $('rkCap').oninput = e => { o.caption = e.target.value; rolkaHud(); };
  panel.querySelector(`input[name=rkVar][value=${o.variant === 'full' ? 'full' : 'half'}]`).checked = true;
  panel.querySelectorAll('input[name=rkVar]').forEach(r => r.onchange = () => { o.variant = r.value; rolkaHud(); });
  $('rkDurT').value = o.durTitle; $('rkDurT').onchange = e => { o.durTitle = +e.target.value || 3; rolkaHud(); };
  $('rkDurM').value = o.durMedia; $('rkDurM').onchange = e => { o.durMedia = +e.target.value || 5; rolkaHud(); };
  $('rkRec').onclick = startRec;
  addEventListener('dragover', e => e.preventDefault());
  addEventListener('drop', e => { e.preventDefault(); setMedia(e.dataTransfer.files[0]); });
  // Skróty rolki mają pierwszeństwo przed skrótami studia (faza przechwytywania)
  addEventListener('keydown', e => {
    if (e.target instanceof Element && e.target.matches('input[type=text], input[type=number], select, textarea')) {   // w polu: Enter / Esc oddaje klawisze rolce
      if ((e.key === 'Enter' || e.key === 'Escape') && e.target.type !== 'file') { e.target.blur(); e.preventDefault(); e.stopImmediatePropagation(); }
      return;
    }
    const k = e.key, nextKey = [' ', 'ArrowRight', 'PageDown', 'ArrowDown', 'Enter'].includes(k);
    let done = true;
    if (ROLKA.rec || $('rkCount').hidden === false) { if (k === 'Escape') stopRec(false); else if (nextKey) next(); else done = false; }
    else if (k === 'n' || k === 'N') startRec();
    else if (/^[1-4]$/.test(k)) { if (available(SEGS[k - 1])) enter(SEGS[k - 1]); else rolkaMsg(k === '2' ? 'Najpierw dodaj zdjęcie lub wideo.' : 'Najpierw włącz kamerę.'); }
    else if (k === '0' || (k === 'Escape' && ROLKA.seg)) { ROLKA.seg = null; if (ROLKA.mediaKind === 'video') ROLKA.media.pause(); rolkaHud(); }
    else if (ROLKA.seg && ROLKA.seg !== 'fig' && nextKey) next();
    else done = false;
    if (done) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  STUDIO_HOOK.draw = rolkaDraw;
  STUDIO_HOOK.after = ctx => { if (STUDIO_HOOK.cam) camCircle(ctx); };
  rolkaHud();
}
