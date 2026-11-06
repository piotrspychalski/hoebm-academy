// ROLKA — nagrywanie gotowej rolki 9:16 z animacji Akademii, bez montażu i bez zależności.
// Animacja: szkic wzorcowy w ramce (#skFrame, ./sketch/energy-map.html) obok podglądu. Obraz ramki pobieramy z karty
// przeglądarki (getDisplayMedia „ta karta”, w Chrome przycięty do ramki przez Region Capture), a płótno #stage składa sceny:
//   1. tytuł   — logo i tytuł (temat szkicu albo własny), wyostrza się z rozmycia; przechodzi sam po „Tytuł, s”
//   2. kotwica — zdjęcie albo krótkie wideo z wyprawy: pół ekranu z tytułem i podpisem albo pełny ekran; pomijana bez pliku
//   3. twarz   — kamera na całym kadrze, aż autor przełączy; pomijana bez kamery
//   4. animacja — szkic na żywo (kadr: strefa Reels albo pełne 9:16) z kółkiem kamery; „dalej” = następny slajd
//                 wybranej sekwencji, a po ostatnim slajdzie (albo bez sekwencji) — koniec nagrania i zapis pliku
// Plik MP4 (Chrome; inaczej WebM) zapisuje się na tym komputerze. Nic nie jest wysyłane. Dźwięk: mikrofon autora.
// „Dalej”: spacja / → / PageDown / pilot (gdy kursor nie jest w ramce szkicu). Esc przerywa bez zapisu.
const ROLKA = {
  seg: null, t0: 0, rec: null, chunks: [], countdown: null,
  stream: null, camEl: null,                       // kamera + mikrofon
  cap: null, capEl: null, cropped: false,          // przechwycona karta (animacja)
  media: null, mediaKind: null, mediaUrl: null, mediaName: '',
  seq: null, slide: 0,
  opt: Object.assign({ title: '', caption: '', variant: 'half', durTitle: 3, durMedia: 5, frame: 'full', circle: 'br' }, store.get('sa-rolka-2', {})),
  saved: null,
};
const SEGS = ['title', 'media', 'face', 'anim'];
const SEG_PL = { title: 'tytuł', media: 'zdjęcie', face: 'twarz', anim: 'animacja' };
const FRAMES = { full: { w: 450, h: 800, label: 'pełne 9:16 (zalecane)' }, reel: { w: 500, h: 515, label: 'tylko strefa Reels' } };
const sketch = () => $('skFrame')?.contentWindow?.HoEBMSketch || null;

function drawCover(ctx, src, sw, sh, x, y, w, h) {
  if (!sw || !sh) return;
  const k = Math.max(w / sw, h / sh), cw = w / k, ch = h / k;
  ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, x, y, w, h);
}
const srcSize = m => m instanceof HTMLVideoElement ? [m.videoWidth, m.videoHeight] : [m.naturalWidth, m.naturalHeight];
const toReel = ctx => { const P = LAYOUTS.reel.place; ctx.setTransform(P.k, 0, 0, P.k, P.x, P.y); };   // współrzędne logiczne rolki 720 × 742
const toCanvas = ctx => ctx.setTransform(1, 0, 0, 1, 0, 0);

// Tytuł rolki: własny albo nazwa bieżącego tematu szkicu; etykieta: grupa tematu
function reelTitle() {
  if (ROLKA.frozen) return ROLKA.frozen;   // w trakcie nagrania tytuł i nazwa pliku się nie zmieniają
  if (!ROLKA.opt.title.trim() && ROLKA.seq) return { title: ROLKA.seq.title, label: 'SPORTS ACADEMY' };
  const own = ROLKA.opt.title.trim(); if (own) return { title: own, label: 'SPORTS ACADEMY' };
  const S = sketch(); if (!S) return { title: 'Science, made clear.', label: 'SPORTS ACADEMY' };
  const st = S.get(), t = S.topics().find(x => x.id === st.topic || x.num === st.topic) || {};
  return { title: t.name || 'Sports Academy', label: `SPORTS ACADEMY  ·  ${t.num || ''}`.trim() };
}
function titleBlock(ctx, x, y, px, maxW, color, revealK, markerK) {
  const { title } = reelTitle(), tf = font('display', 800, px), lh = Math.round(px * 1.12);
  const lines = wrapTitle(ctx, [title], tf, maxW, 0);
  if (markerK > 0) lines.forEach((ln, i) => marker(ctx, x + ln.hl[0] - 8, y + i * lh - px * 0.66, ln.hl[1] - ln.hl[0] + 16, px, markerK));
  titleText(ctx, revealK, () => lines.forEach((ln, i) => txt(ctx, ln.s, x, y + i * lh, { font: tf, color })));
  return y + (lines.length - 1) * lh;
}

// 1. Karta tytułowa
function segTitle(ctx, el) {
  framePaper(ctx); toReel(ctx);
  const L = LAYOUTS.reel, lw = 460, lh = lw / LOGO_AR;
  if (_logo.complete && _logo.naturalWidth) ctx.drawImage(_logo, (L.W - lw) / 2, 70, lw, lh);
  txt(ctx, reelTitle().label, L.L, 290, { font: font('mono', 600, 24), color: T.c.ink2, role: 'fig' });
  ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.line; ctx.beginPath(); ctx.moveTo(L.L, 308); ctx.lineTo(L.R, 308); ctx.stroke();
  titleBlock(ctx, L.L, 390, 64, L.R - L.L, T.c.ink, Math.min(1, el / T.revealMs), REDUCE ? 1 : smooth((el - T.revealMs) / 600));
}

// 2. Kotwica: zdjęcie / wideo z wyprawy
function segMedia(ctx, el) {
  const m = ROLKA.media, [sw, sh] = srcSize(m), L = LAYOUTS.reel, cap = ROLKA.opt.caption.trim();
  if (ROLKA.opt.variant === 'full') {
    toCanvas(ctx); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    drawCover(ctx, m, sw, sh, 0, 0, W, H);
    const g = ctx.createLinearGradient(0, SAFE.y0 + 300, 0, SAFE.y1 + 120);   // przyciemnienie pod tytułem
    g.addColorStop(0, 'rgba(27, 31, 48, 0)'); g.addColorStop(1, 'rgba(27, 31, 48, 0.78)');
    ctx.fillStyle = g; ctx.fillRect(0, SAFE.y0 + 300, W, H - SAFE.y0 - 300);
    toReel(ctx);
    const fs = 54, n = wrapTitle(ctx, [reelTitle().title], font('display', 800, fs), L.R - L.L).length;
    titleBlock(ctx, L.L, L.H - 24 - (cap ? 40 : 0) - (n - 1) * Math.round(fs * 1.12), fs, L.R - L.L, T.c.paper, 1, 0);
    if (cap) txt(ctx, cap, L.L, L.H - 14, { font: font('mono', 500, 24), color: T.c.paper, role: 'citation' });
  } else {
    framePaper(ctx); toReel(ctx);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, L.W, 420); ctx.clip(); drawCover(ctx, m, sw, sh, 0, 0, L.W, 420); ctx.restore();
    txt(ctx, reelTitle().label, L.L, 478, { font: font('mono', 600, 24), color: T.c.ink2, role: 'fig' });
    const yl = titleBlock(ctx, L.L, 545, 54, L.R - L.L, T.c.ink, 1, REDUCE ? 1 : smooth(el / 600));
    if (cap) txt(ctx, cap, L.L, Math.min(L.H - 10, yl + 54), { font: font('mono', 500, 24), color: T.c.ink2, role: 'citation' });
  }
}

// 3. Twarz na całym kadrze (bez lustra — tak, jak zobaczą widzowie)
function segFace(ctx) {
  toCanvas(ctx); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const v = ROLKA.camEl; drawCover(ctx, v, v.videoWidth, v.videoHeight, 0, 0, W, H);
}

// 4. Animacja: przechwycona ramka szkicu + kółko kamery
const animRect = () => ROLKA.opt.frame === 'full' ? { x: 0, y: 0, w: W, h: H } : { x: SAFE.x0, y: SAFE.y0, w: SAFE.x1 - SAFE.x0, h: SAFE.y1 - SAFE.y0 };
function segAnim(ctx) {
  framePaper(ctx); toCanvas(ctx);
  const r = animRect(), v = ROLKA.capEl;
  if (ROLKA.cap && v && v.videoWidth) {
    if (ROLKA.cropped) ctx.drawImage(v, r.x, r.y, r.w, r.h);
    else {   // bez Region Capture: wycinamy prostokąt ramki z obrazu całej karty
      const fr = $('skFrame').getBoundingClientRect(), k = v.videoWidth / innerWidth;
      ctx.drawImage(v, fr.left * k, fr.top * k, fr.width * k, fr.height * k, r.x, r.y, r.w, r.h);
    }
  } else {
    ctx.strokeStyle = T.c.hair; ctx.lineWidth = 3; ctx.setLineDash([12, 10]); ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4); ctx.setLineDash([]);
    txt(ctx, 'Animacja: „Przechwyć animację”', W / 2, r.y + r.h / 2, { font: font('sans', 600, 40), color: T.c.ink2, align: 'center' });
    txt(ctx, 'w panelu ROLKA (ta karta)', W / 2, r.y + r.h / 2 + 54, { font: font('sans', 500, 32), color: T.c.ink2, align: 'center' });
  }
  const c = ROLKA.camEl;
  if (ROLKA.stream && c && c.videoWidth) {
    const full = ROLKA.opt.frame === 'full', rad = full ? 150 : 120;
    const cx = full ? SAFE.x1 - rad - 10 : r.x + r.w - rad - 28;
    const cy = ROLKA.opt.circle === 'tr' ? (full ? SAFE.y0 + rad + 10 : r.y + rad + 28) : (full ? SAFE.y1 - rad - 10 : r.y + r.h - rad - 28);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.clip();
    drawCover(ctx, c, c.videoWidth, c.videoHeight, cx - rad, cy - rad, 2 * rad, 2 * rad); ctx.restore();
    ctx.strokeStyle = T.c.paper; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = T.c.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, rad + 3, 0, Math.PI * 2); ctx.stroke();
  }
}

// Zaczep sceny: studio zawsze rysuje rolkę (poza nagraniem — podgląd animacji)
function rolkaDraw(ctx, now) {
  const seg = ROLKA.seg || 'anim', el = now - ROLKA.t0;
  if (seg === 'title') { segTitle(ctx, el); if (ROLKA.rec && el > ROLKA.opt.durTitle * 1000) next(); }
  else if (seg === 'media') {
    segMedia(ctx, el);
    if (ROLKA.rec && (ROLKA.mediaKind === 'video' ? ROLKA.media.ended : el > ROLKA.opt.durMedia * 1000)) next();
  } else if (seg === 'face') segFace(ctx);
  else segAnim(ctx);
  toCanvas(ctx);
  if (STATE.safe && !ROLKA.rec) frameSafeZone(ctx);   // nakładka tylko w podglądzie, nigdy w pliku
  return true;
}

// ── Sceny i slajdy
const available = s => s === 'media' ? !!ROLKA.media : s === 'face' ? !!ROLKA.stream : true;
function applySlide(i, tween = true) {
  const q = ROLKA.seq, S = sketch(); if (!q || !S) return;
  ROLKA.slide = Math.max(0, Math.min(q.slides.length - 1, i));
  const s = q.slides[ROLKA.slide], warn = S.set(s.state, tween ? (s.tween ?? q.tween) : 0) || [];
  if (warn.length) rolkaMsg('Slajd: ' + warn.join('; '));
  rolkaHud();
}
function enter(seg) {
  ROLKA.seg = seg; ROLKA.t0 = performance.now();
  if (ROLKA.mediaKind === 'video') { const v = ROLKA.media; if (seg === 'media') { v.currentTime = 0; v.play().catch(() => {}); } else v.pause(); }
  if (seg === 'anim' && ROLKA.seq) applySlide(0, false);
  rolkaHud();
}
function next() {
  if (ROLKA.seg === 'anim' || !ROLKA.seg) {
    if (ROLKA.seq && ROLKA.slide + 1 < ROLKA.seq.slides.length) return applySlide(ROLKA.slide + 1);
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
  await fillDevices();
  rolkaMsg('Kamera i mikrofon włączone.');
}
function stopCam() { ROLKA.stream?.getTracks().forEach(t => t.stop()); ROLKA.stream = null; }
async function fillDevices() {
  const ds = await navigator.mediaDevices.enumerateDevices().catch(() => []);
  const cur = ROLKA.stream?.getTracks().map(t => t.getSettings().deviceId) || [];
  for (const [id, kind] of [['rkCam', 'videoinput'], ['rkMic', 'audioinput']]) {
    $(id).replaceChildren(...ds.filter(d => d.kind === kind).map((d, i) => {
      const o = el('option', { value: d.deviceId, text: d.label || `${kind === 'videoinput' ? 'Kamera' : 'Mikrofon'} ${i + 1}` });
      if (cur.includes(d.deviceId)) o.selected = true; return o;
    }));
  }
}

// ── Przechwycenie animacji: ta karta, przycięta do ramki szkicu
async function startCapture() {
  if (!navigator.mediaDevices?.getDisplayMedia) return rolkaMsg('Ta przeglądarka nie przechwytuje karty. Użyj Chrome.');
  stopCapture();
  try {
    ROLKA.cap = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'browser', frameRate: 30 }, audio: false, preferCurrentTab: true, selfBrowserSurface: 'include' });
  } catch (e) { rolkaMsg('Przechwytywanie anulowane: ' + e.message); return; }
  const [track] = ROLKA.cap.getVideoTracks();
  ROLKA.cropped = false;
  if (window.CropTarget && track.cropTo) { try { await track.cropTo(await CropTarget.fromElement($('skFrame'))); ROLKA.cropped = true; } catch { /* zwykła karta: wycinamy ręcznie */ } }
  track.addEventListener('ended', () => {
    ROLKA.cap = null; document.documentElement.classList.remove('capturing');
    if (ROLKA.rec) { stopRec(true); rolkaMsg('Przechwytywanie animacji zatrzymane w trakcie nagrania — zapisano nagranie do tej chwili.'); }
    else { rolkaHud(); rolkaMsg('Przechwytywanie animacji zatrzymane.'); }
  });
  const v = ROLKA.capEl || (ROLKA.capEl = Object.assign(document.createElement('video'), { muted: true, playsInline: true }));
  v.srcObject = ROLKA.cap; await v.play().catch(() => {});
  document.documentElement.classList.add('capturing');   // pomoc i pasek widoków chowają się (nie mogą wejść w kadr)
  rolkaMsg(ROLKA.cropped ? 'Animacja przechwycona (ramka szkicu).' : 'Animacja przechwycona. Nie zmieniaj rozmiaru okna w trakcie nagrania.');
  rolkaHud();
}
function stopCapture() { ROLKA.cap?.getTracks().forEach(t => t.stop()); ROLKA.cap = null; document.documentElement.classList.remove('capturing'); }

// ── Zdjęcie / wideo z wyprawy (tylko w pamięci tej karty)
function setMedia(file) {
  if (!file) return;
  const kind = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : null;
  if (!kind) return rolkaMsg('To nie jest zdjęcie ani wideo: ' + file.name);
  if (ROLKA.mediaUrl) URL.revokeObjectURL(ROLKA.mediaUrl);
  const url = URL.createObjectURL(file);
  const m = kind === 'video' ? Object.assign(document.createElement('video'), { muted: true, playsInline: true, preload: 'auto', src: url }) : Object.assign(new Image(), { src: url });
  Object.assign(ROLKA, { media: m, mediaKind: kind, mediaUrl: url, mediaName: file.name });
  const ok = () => rolkaMsg(`${kind === 'video' ? 'Wideo' : 'Zdjęcie'}: ${file.name}${kind === 'video' ? ` (${Math.round(m.duration)} s, bez dźwięku)` : ''}`);
  m.addEventListener(kind === 'video' ? 'loadedmetadata' : 'load', ok, { once: true });
  rolkaHud();
}
function clearMedia() {
  if (ROLKA.mediaUrl) URL.revokeObjectURL(ROLKA.mediaUrl);
  Object.assign(ROLKA, { media: null, mediaKind: null, mediaUrl: null, mediaName: '' });
  if (ROLKA.seg === 'media') enter('title');
  rolkaHud();
}

// ── Nagrywanie
const MIME = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
async function startRec() {
  if (!window.MediaRecorder) return rolkaMsg('Ta przeglądarka nie nagrywa (MediaRecorder). Użyj Chrome.');
  if (!ROLKA.cap) {   // jedno kliknięcie: najpierw przechwycenie animacji (Chrome pyta o tę kartę), potem nagranie
    rolkaMsg('Chrome zapyta o udostępnienie — wybierz „Ta karta” i „Udostępnij”.');
    await startCapture();
    if (!ROLKA.cap) return rolkaMsg('Bez przechwyconej animacji nie nagrywam (scena 4 byłaby pusta). Kliknij „Nagraj rolkę” i wybierz tę kartę.');
  }
  if (ROLKA.rec || !$('rkCount').hidden) return;
  ROLKA.frozen = null; ROLKA.frozen = reelTitle();
  $('rkPanel').hidden = true; $('rkCount').hidden = false;
  enter('title'); ROLKA.t0 = performance.now() + 1e9;   // karta tytułowa stoi rozmyta w czasie odliczania
  let n = 3; $('rkCount').textContent = n;
  ROLKA.countdown = setInterval(() => {
    n--; if (n > 0) { $('rkCount').textContent = n; return; }
    clearInterval(ROLKA.countdown); $('rkCount').hidden = true;
    const type = MIME.find(t => MediaRecorder.isTypeSupported(t)) || '';
    const canvasTracks = $('stage').captureStream(30).getVideoTracks();
    const tracks = [...canvasTracks, ...(ROLKA.stream?.getAudioTracks() || [])];
    const rec = new MediaRecorder(new MediaStream(tracks), { mimeType: type || undefined, videoBitsPerSecond: 10e6, audioBitsPerSecond: 160e3 });
    ROLKA.chunks = []; ROLKA.rec = rec;
    rec.ondataavailable = e => { if (e.data.size) ROLKA.chunks.push(e.data); };
    rec.onstop = () => { canvasTracks.forEach(t => t.stop()); saveRec(rec); ROLKA.chunks = []; };
    rec.start(1000); document.documentElement.classList.add('recording'); enter('title');
  }, 1000);
}
function stopRec(keep) {
  clearInterval(ROLKA.countdown); $('rkCount').hidden = true;
  const rec = ROLKA.rec; ROLKA.rec = null; document.documentElement.classList.remove('recording');
  if (rec) { rec.keep = keep; if (rec.state !== 'inactive') rec.stop(); }
  ROLKA.seg = null; if (ROLKA.mediaKind === 'video') ROLKA.media.pause();
  $('rkPanel').hidden = false; rolkaHud();
  if (!rec) ROLKA.frozen = null;   // odliczanie przerwane; po nagraniu tytuł zwalnia saveRec
  if (!keep) rolkaMsg('Nagranie przerwane, nic nie zapisano.');
}
function saveRec(rec) {
  const title = reelTitle().title; ROLKA.frozen = null;
  if (!rec.keep || !ROLKA.chunks.length) return;
  const type = rec.mimeType || 'video/webm', ext = type.includes('mp4') ? 'mp4' : 'webm';
  const slug = title.normalize('NFKD').replace(/\p{M}/gu, '').replace(/[łŁ]/g, 'l').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'rolka';
  const d = new Date(), p = n => String(n).padStart(2, '0');
  const name = `sports-academy-${slug}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.${ext}`;
  if (ROLKA.saved) URL.revokeObjectURL(ROLKA.saved.url);
  const blob = new Blob(ROLKA.chunks, { type });
  ROLKA.saved = { url: URL.createObjectURL(blob), name, blob, type, ext };
  showDone();
}
// Okno po nagraniu: podgląd i zapis. „Zapisz jako…” otwiera systemowe okno zapisu (File System Access API, Chrome/Edge;
// wymaga kliknięcia, dlatego nie zapisujemy automatycznie). Zapas: zwykłe pobranie do folderu „Pobrane”.
function showDone() {
  const S = ROLKA.saved, dlg = $('rkDone'), v = dlg.querySelector('video');
  v.src = S.url; v.load();
  $('rkDl').href = S.url; $('rkDl').download = S.name;
  $('rkInfo').textContent = `${S.name} · ${(S.blob.size / 1048576).toFixed(1)} MB${S.ext === 'webm' ? ' · WebM (ta przeglądarka nie nagrywa MP4)' : ''}`;
  $('rkSaveMsg').textContent = '';
  $('rkSave').hidden = !window.showSaveFilePicker;
  dlg.showModal();
  rolkaMsg(`Nagranie gotowe: ${S.name}`, true);
}
async function saveAs() {
  const S = ROLKA.saved; if (!S) return;
  try {
    const h = await window.showSaveFilePicker({ suggestedName: S.name, types: [{ description: 'Wideo', accept: { [S.type.split(';')[0]]: ['.' + S.ext] } }] });
    const w = await h.createWritable(); await w.write(S.blob); await w.close();
    $('rkSaveMsg').textContent = `Zapisano: ${h.name}`;
    rolkaMsg(`Zapisano: ${h.name}`, true);
  } catch (e) { if (e.name !== 'AbortError') $('rkSaveMsg').textContent = 'Nie udało się zapisać: ' + e.message + ' — użyj „Pobierz”.'; }
}

// ── Panel ROLKA (poza płótnem — nie trafia do nagrania)
function rolkaMsg(s, link) {
  const m = $('rkMsg'); m.textContent = s;
  if (link && ROLKA.saved) m.append(' · ', el('button', { type: 'button', class: 'rk-link', text: 'pokaż / zapisz' }));
  m.querySelector('.rk-link')?.addEventListener('click', showDone);
}
function rolkaHud() {
  const o = ROLKA.opt;
  $('rkMedia').textContent = ROLKA.media ? ROLKA.mediaName : 'brak (scena 2 pominięta)';
  $('rkClear').hidden = !ROLKA.media;
  $('rkCamBtn').textContent = ROLKA.stream ? 'Wyłącz kamerę' : 'Włącz kamerę i mikrofon';
  $('rkDev').hidden = !ROLKA.stream;
  $('rkCapBtn').textContent = ROLKA.cap ? 'Zatrzymaj przechwytywanie' : 'Przechwyć animację (ta karta)';
  const q = ROLKA.seq;
  $('rkSlide').textContent = q ? `slajd ${ROLKA.slide + 1} / ${q.slides.length}: ${q.slides[ROLKA.slide].label}` : 'bez sekwencji — sterujesz szkicem ręcznie';
  $('rkSeg').textContent = ROLKA.seg ? `${ROLKA.rec ? '● REC · ' : 'podgląd · '}${SEGS.indexOf(ROLKA.seg) + 1}/4 ${SEG_PL[ROLKA.seg]}` : '';
  store.set('sa-rolka-2', { title: o.title, caption: o.caption, variant: o.variant, durTitle: o.durTitle, durMedia: o.durMedia, frame: o.frame, circle: o.circle });
}
// Ramka ma stały rozmiar logiczny (szkic zawsze w tym samym układzie telefonu). Gdy nie mieści się w oknie, opakowanie
// #skWrap pomniejsza ją transformacją (scale) — przechwycony obraz bierze piksele ekranu, więc pełne 9:16 działa też na
// niskim oknie (np. MacBook z paskiem zakładek), kosztem rozdzielczości. Podgląd 9:16 dostaje resztę szerokości.
function setFrame() {
  const f = FRAMES[ROLKA.opt.frame] || FRAMES.reel, fr = $('skFrame'), wrap = $('skWrap'), panel = $('rkPanel');
  const side = panel && !panel.classList.contains('min') ? 284 : 60, minStage = 150;
  const k = Math.min(1, (innerHeight - 24) / f.h, (innerWidth - side - 12 - 18 - minStage) / f.w);
  fr.style.width = f.w + 'px'; fr.style.height = f.h + 'px'; fr.style.transform = k < 1 ? `scale(${k.toFixed(4)})` : '';
  wrap.style.width = f.w * k + 'px'; wrap.style.height = f.h * k + 'px';
  const stageW = Math.max(120, Math.min((innerHeight - 24) * 9 / 16, innerWidth - side - 12 - 18 - f.w * k));
  $('stage').closest('.stage-wrap').style.width = stageW + 'px';
  if (ROLKA.cap && ROLKA.lastFrame && ROLKA.lastFrame !== ROLKA.opt.frame && !ROLKA.cropped) rolkaMsg('Zmieniono kadr — przechwyć animację ponownie.');
  ROLKA.lastFrame = ROLKA.opt.frame;
}
function initRolka() {
  const o = ROLKA.opt;
  // Ramka ze szkicem (Akademia) obok podglądu rolki
  const fr = el('iframe', { id: 'skFrame', src: './sketch/energy-map.html', title: 'Animacja Akademii (szkic)' });
  const wrap = el('div', { id: 'skWrap' }); wrap.append(fr);
  $('stage').closest('.stage-wrap').before(wrap);
  const seqs = SEQS;   // studio prywatne (online za hasłem): wszystkie sekwencje, szkice z dopiskiem DRAFT
  const radio = (name, val, label) => `<label><input type="radio" name="${name}" value="${val}"> ${label}</label>`;
  const panel = el('div', { id: 'rkPanel', class: 'rolka' });
  panel.innerHTML = `<b>ROLKA</b> · nagranie z kamerą <button type="button" id="rkHide" aria-label="Zwiń">–</button>
    <div class="rk-body">
    <p><button type="button" id="rkRec" class="rk-rec">● Nagraj rolkę (N)</button></p>
    <p><button type="button" id="rkCapBtn"></button></p>
    <p>Kadr animacji: ${radio('rkFrame', 'full', FRAMES.full.label)}<br>${radio('rkFrame', 'reel', FRAMES.reel.label)}</p>
    <p><label>Sekwencja slajdów <select id="rkSeq"><option value="">— bez sekwencji (ręcznie) —</option>${seqs.map(q => `<option value="${q.id}">${q.title}${q.status !== 'published' ? ' · DRAFT' : ''}</option>`).join('')}</select></label>
       <span id="rkSlide"></span>${SEQS.length ? '' : '<br><i>Brak sekwencji — poproś Claude o slajdy (skill sketch-slides).</i>'}</p>
    <p><label>Tytuł rolki <input type="text" id="rkTitle" placeholder="puste = nazwa tematu" maxlength="70"></label></p>
    <p><button type="button" id="rkCamBtn"></button></p>
    <p id="rkDev" hidden><select id="rkCam" aria-label="Kamera"></select><select id="rkMic" aria-label="Mikrofon"></select></p>
    <p>Kółko kamery: ${radio('rkCircle', 'br', 'prawy dolny')} ${radio('rkCircle', 'tr', 'prawy górny')}</p>
    <p>Zdjęcie lub wideo z wyprawy (przeciągnij tutaj):<br><input type="file" id="rkFile" accept="image/*,video/*">
       <br><span id="rkMedia"></span> <button type="button" id="rkClear">usuń</button></p>
    <p><label>Podpis <input type="text" id="rkCap" placeholder="np. Aconcagua, 2024" maxlength="60"></label></p>
    <p>Układ zdjęcia: ${radio('rkVar', 'half', 'pół ekranu')} ${radio('rkVar', 'full', 'pełny ekran')}</p>
    <p><label>Tytuł, s <input type="number" id="rkDurT" min="1" max="10" step="0.5"></label>
       <label>Zdjęcie, s <input type="number" id="rkDurM" min="1" max="20" step="0.5"></label></p>
    <p class="rk-help">Kolejność: tytuł → zdjęcie → twarz → animacja. Dalej: spacja / → / pilot (na animacji: następny slajd; po ostatnim — koniec i zapis). Esc — przerwij bez zapisu. Podgląd: 1–4, 0 wyłącz. W trakcie nagrania klawisze działają także z kursorem w szkicu.</p>
    <p id="rkMsg" role="status"></p></div>`;
  const done = el('dialog', { id: 'rkDone', class: 'rk-done', 'aria-label': 'Nagranie gotowe' });
  done.innerHTML = `<b>Nagranie gotowe</b><video controls playsinline></video><p id="rkInfo"></p>
    <p class="rk-actions"><button type="button" id="rkSave" class="rk-rec">Zapisz jako…</button>
    <a id="rkDl" class="rk-btn">Pobierz do „Pobrane”</a><button type="button" id="rkClose" class="rk-btn">Zamknij</button></p><p id="rkSaveMsg" role="status"></p>`;
  document.body.append(panel, done, el('div', { id: 'rkCount', class: 'rk-count', hidden: '' }), el('div', { id: 'rkSeg', class: 'rk-seg' }));
  $('rkSave').onclick = saveAs;
  $('rkClose').onclick = () => { done.querySelector('video').pause(); done.close(); };
  done.addEventListener('close', () => done.querySelector('video').pause());
  const bindRadio = (name, key, after) => {
    panel.querySelector(`input[name=${name}][value=${o[key]}]`)?.setAttribute('checked', '');
    panel.querySelectorAll(`input[name=${name}]`).forEach(r => r.onchange = () => { o[key] = r.value; after?.(); rolkaHud(); });
  };
  bindRadio('rkFrame', 'frame', setFrame); bindRadio('rkCircle', 'circle'); bindRadio('rkVar', 'variant');
  $('rkHide').onclick = () => panel.classList.toggle('min');
  $('rkCapBtn').onclick = () => ROLKA.cap ? (stopCapture(), rolkaHud()) : startCapture();
  $('rkCamBtn').onclick = () => ROLKA.stream ? (stopCam(), rolkaHud()) : startCam().then(rolkaHud);
  $('rkCam').onchange = $('rkMic').onchange = () => startCam().then(rolkaHud);
  $('rkSeq').onchange = e => { ROLKA.seq = SEQS.find(q => q.id === e.target.value) || null; ROLKA.slide = 0; if (ROLKA.seq) applySlide(0, false); rolkaHud(); };
  $('rkFile').onchange = e => setMedia(e.target.files[0]);
  $('rkClear').onclick = () => { $('rkFile').value = ''; clearMedia(); };
  for (const [id, key, def] of [['rkTitle', 'title'], ['rkCap', 'caption'], ['rkDurT', 'durTitle', 3], ['rkDurM', 'durMedia', 5]]) {
    $(id).value = o[key];
    $(id).oninput = e => { o[key] = def ? (+e.target.value || def) : e.target.value; rolkaHud(); };
  }
  $('rkRec').onclick = startRec;
  addEventListener('dragover', e => e.preventDefault());
  addEventListener('drop', e => { e.preventDefault(); setMedia(e.dataTransfer.files[0]); });
  const onKey = e => {
    if ($('rkDone')?.open) return;   // okno nagrania: klawisze należą do niego (Esc zamyka)
    const inPanel = e.target instanceof Element && e.target.closest('#rkPanel');
    if (inPanel && !e.target.matches('input[type=text], input[type=number], select, textarea')) { if (e.key === 'Escape') e.target.blur(); return; }   // przyciski i radio w panelu działają normalnie
    if (e.target instanceof Element && e.target.matches('input[type=text], input[type=number], select, textarea')) {   // w polu: Enter / Esc oddaje klawisze rolce
      if (e.key === 'Enter' || e.key === 'Escape') { e.target.blur(); e.preventDefault(); e.stopImmediatePropagation(); }
      return;
    }
    const k = e.key, nextKey = [' ', 'ArrowRight', 'PageDown', 'ArrowDown', 'Enter'].includes(k), prevKey = ['ArrowLeft', 'PageUp', 'ArrowUp'].includes(k);
    let done = true;
    if (!$('rkCount').hidden) { if (k === 'Escape') stopRec(false); }   // w trakcie odliczania tylko Esc
    else if (ROLKA.rec) { if (k === 'Escape') stopRec(false); else if (nextKey) next(); else if (prevKey && ROLKA.seq && ROLKA.seg === 'anim') applySlide(ROLKA.slide - 1); else done = false; }
    else if (k === 'n' || k === 'N') startRec();
    else if (/^[1-4]$/.test(k)) { if (available(SEGS[k - 1])) enter(SEGS[k - 1]); else rolkaMsg(k === '2' ? 'Najpierw dodaj zdjęcie lub wideo.' : 'Najpierw włącz kamerę.'); }
    else if (k === '0' || (k === 'Escape' && ROLKA.seg)) { ROLKA.seg = null; if (ROLKA.mediaKind === 'video') ROLKA.media.pause(); rolkaHud(); }
    else if (nextKey) next();
    else if (prevKey && ROLKA.seq) applySlide(ROLKA.slide - 1);
    else done = false;
    if (done) { e.preventDefault(); e.stopImmediatePropagation(); }
  };
  addEventListener('keydown', onKey, true);
  // Kursor w ramce szkicu (ten sam origin): w trakcie nagrania klawisze rolki mają pierwszeństwo przed szkicem
  fr.addEventListener('load', () => {
    try { fr.contentWindow.addEventListener('keydown', e => { if (ROLKA.rec || !$('rkCount').hidden) onKey(e); }, true); } catch { /* inny origin */ }
  });
  addEventListener('resize', setFrame);
  $('rkHide').addEventListener('click', setFrame);
  STUDIO_HOOK.draw = rolkaDraw;
  setFrame(); rolkaHud();
}
