// FIG. 1 · GUT — Where does your blood go on a hard effort?
// Port reference/gut-blood-flow.html (panele A, B) na rdzeń + nowy panel C (węglowodany w trakcie wysiłku).
// Liczby na ekranie: tylko z claims w data/figures/gut-blood-flow.json (sbf-80, cho-1h, cho-60, cho-90, gi-threshold).
(() => {
  // Kształty schematyczne (pole "shapes" w rejestrze):
  // gutFlow: smoothstep 100% (spoczynek) → 20% (spadek ≥80%, ter Steege 2012); źródło ma tylko punkt końcowy
  const gutFlow = e => 1 - 0.8 * smooth(e);
  // muscleFlow: tylko kierunek (bez liczb)
  const muscleFlow = e => 0.25 + 0.75 * e;
  const phase = e => e < 0.15 ? 'REST' : e < 0.6 ? 'EASY' : 'HARD/LONG';
  // Panel C: oś czasu wysiłku jako trzy przedziały z abstraktu Jeukendrup 2014 (bez wartości pośrednich — abstrakt ich nie podaje)
  const COLS = [
    { x: 1 / 6, tick: '~1 h', bar: 0.12, top: 'mouth rinse', claim: 'cho-1h', read: 'rinse' },
    { x: 1 / 2, tick: '2–3 h', bar: 60 / 90, top: '~60 g/h', claim: 'cho-60', read: '~60 g/h' },
    { x: 5 / 6, tick: 'ultra', bar: 1, top: '~90 g/h', claim: 'cho-90', read: '~90 g/h', note: '(multiple transportable)' },
  ];
  const colOf = d => d < 0.05 ? -1 : d < 1 / 3 ? 0 : d < 2 / 3 ? 1 : 2;

  const KEYS = [
    [0, { effort: 0, duration: 0 }], [1500, { effort: 0, duration: 0 }],
    [4000, { effort: 0.4, duration: 0 }], [6000, { effort: 0.4, duration: 0 }],
    [8500, { effort: 1, duration: 0 }], [10000, { effort: 1, duration: 0 }],
    [12000, { effort: 1, duration: 1 / 6 }], [13500, { effort: 1, duration: 1 / 6 }],
    [15500, { effort: 1, duration: 1 / 2 }], [17000, { effort: 1, duration: 1 / 2 }],
    [19000, { effort: 1, duration: 5 / 6 }], [22000, { effort: 1, duration: 5 / 6 }],
  ];
  // Fazy przepływu cząstek jako całka prędkości po czasie sekwencji (tablica co 20 ms) — determinizm nagrania
  const STEP = 20, END = KEYS[KEYS.length - 1][0];
  const speed = f => 0.00045 * (0.4 + f);
  const PH = (() => { const g = [0], m = [0]; for (let t = STEP; t <= END + STEP; t += STEP) { const s = keyAt(KEYS, t); g.push(g[g.length - 1] + STEP * speed(gutFlow(s.effort))); m.push(m[m.length - 1] + STEP * speed(muscleFlow(s.effort))); } return { g, m }; })();
  const phAt = (arr, ms) => arr[Math.max(0, Math.min(arr.length - 1, Math.round(ms / STEP)))];
  let acc = { g: 0, m: 0 };   // tryb ręczny (suwak): faza narasta z czasem rzeczywistym

  // Panele rysowane względem prostokąta b = {x, y, w, h} z bieżącego układu (LY.boxes) — ten sam kod dla pionu i poziomu
  const tall = b => b.h > 300;

  // A: serce → jelito / mięśnie pracujące; grubość naczyń i gęstość cząstek zależne od wysiłku
  function panelA(ctx, b, g, m) {
    panelLabel(ctx, 'A', b);
    const T2 = tall(b), r = T2 ? 46 : 32, ow = Math.min(210, b.w * 0.38), oh = T2 ? 70 : 48;
    const heart = { x: b.x + b.w / 2, y: b.y + (T2 ? 100 : 38) };
    const oy = T2 ? b.y + b.h * 0.58 : b.y + 98;
    const gut = { x: b.x + b.w * 0.23, y: oy }, mus = { x: b.x + b.w * 0.77, y: oy };
    const hb = { x: heart.x, y: heart.y + r }, sag = T2 ? 40 : 8, wv = T2 ? 22 : 16;
    vessel(ctx, hb, gut, 6 + wv * g, sag); vessel(ctx, hb, mus, 6 + wv * m, sag);
    particles(ctx, hb, gut, acc.g, g, sag); particles(ctx, hb, mus, acc.m, m, sag);
    ctx.fillStyle = T.c.paper; ctx.strokeStyle = T.c.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(heart.x, heart.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    txt(ctx, 'Heart', heart.x, heart.y + 8, { font: font('sans', 600, T2 ? 26 : 21), align: 'center' });
    hatchBox(ctx, gut.x - ow / 2, gut.y, ow, oh, g); hatchBox(ctx, mus.x - ow / 2, mus.y, ow, oh, m);
    const ly = gut.y + oh + 32;
    txt(ctx, 'Gut', gut.x, ly, { font: font('sans', 500, 26), align: 'center' });
    txt(ctx, 'Working muscles', mus.x, ly, { font: font('sans', 500, 26), align: 'center' });
    if (T2) txt(ctx, 'Blood flow from the heart', b.x + 50, b.y + 36, { font: font('sans', 500, 24), color: T.c.ink2 });
  }

  // B: przepływ trzewny w % spoczynku w funkcji wysiłku, rysowany do playheada
  function panelB(ctx, b, e, g) {
    panelLabel(ctx, 'B', b);
    const T2 = tall(b), bx0 = b.x + (T2 ? 96 : 110), bx1 = b.x + b.w - 10;
    const by1 = b.y + (T2 ? 90 : 22), by0 = b.y + b.h - 30, yOf = v => by0 - (by0 - by1) * v;
    const fs = T2 ? 24 : 22;
    ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.line;
    ctx.beginPath(); ctx.moveTo(bx0, by1 - 8); ctx.lineTo(bx0, by0); ctx.lineTo(bx1, by0); ctx.stroke();
    txt(ctx, '100%', bx0 - 12, yOf(1) + 7, { font: font('mono', 400, fs), color: T.c.ink2, align: 'right', role: 'axis' });
    txt(ctx, '20%', bx0 - 12, yOf(0.2) + 7, { font: font('mono', 400, fs), color: T.c.ink2, align: 'right', claim: 'sbf-80' });
    ctx.save(); ctx.strokeStyle = T.c.hair; ctx.setLineDash([4, 6]);
    [1, 0.2].forEach(v => { ctx.beginPath(); ctx.moveTo(bx0, yOf(v)); ctx.lineTo(bx1, yOf(v)); ctx.stroke(); });
    ctx.restore();
    if (T2) txt(ctx, 'Gut blood flow, % of rest', b.x + 50, b.y + 36, { font: font('sans', 500, 24), color: T.c.ink2 });
    else txt(ctx, 'Gut blood flow, % of rest', bx0 + 10, by1 - 12, { font: font('sans', 500, 23), color: T.c.ink2 });
    txt(ctx, 'rest → longer / harder', bx1, by0 + 26, { font: font('mono', 400, T2 ? 22 : 21), color: T.c.ink2, align: 'right' });
    ctx.strokeStyle = T.c.blood; ctx.lineWidth = T.lineBold; ctx.lineCap = 'round'; ctx.beginPath();
    const n = Math.max(1, Math.round(60 * e));
    for (let i = 0; i <= n; i++) { const ee = i / 60, x = bx0 + (bx1 - bx0) * ee, y = yOf(gutFlow(ee)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.fillStyle = T.c.blood; ctx.beginPath(); ctx.arc(bx0 + (bx1 - bx0) * e, yOf(g), T2 ? 10 : 8, 0, Math.PI * 2); ctx.fill();
  }

  // C: węglowodany w trakcie wysiłku wg czasu trwania (słupki w granacie — to nie dane o krwi) + próg Costa 2017
  function panelC(ctx, b, d, col) {
    panelLabel(ctx, 'C', b);
    const T2 = tall(b), fs = T2 ? 24 : 22, fsm = T2 ? 22 : 20;
    const narrow = b.w < 800;   // wąski prostokąt (telefon): opis „(multiple transportable)” w dwóch wierszach
    const cx0 = b.x + (T2 ? 20 : 110), cx1 = b.x + b.w - 10, yB = b.y + b.h - (T2 || narrow ? 70 : 46);
    const hMax = T2 ? Math.min(200, yB - b.y - 200) : 44, cw = (cx1 - cx0) / 3 - (T2 ? 24 : 40), xOf = u => cx0 + (cx1 - cx0) * u;
    txt(ctx, T2 ? 'Carbohydrate during exercise' : 'Carbohydrate during exercise, by duration', T2 ? b.x + 50 : cx0 + 10, b.y + (T2 ? 36 : 32), { font: font('sans', 500, T2 ? 24 : 23), color: T.c.ink2 });
    // Próg Costa 2017 na osi czasu: ≥2 h (granica przedziałów ~1 h | 2–3 h)
    const xT = xOf(1 / 3), top = b.y + (T2 ? 60 : 44);
    ctx.save(); ctx.strokeStyle = T.c.ink2; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(xT, top); ctx.lineTo(xT, yB); ctx.stroke(); ctx.restore();
    if (T2) {   // opis progu po prawej stronie linii, nad słupkami
      txt(ctx, 'GI threshold:', xT + 10, top + 22, { font: font('mono', 600, fsm), color: T.c.ink2 });
      const w1 = txt(ctx, '≥2 h at ', xT + 10, top + 48, { font: font('mono', 400, fsm), color: T.c.ink2, claim: 'gi-threshold' });
      txt(ctx, '60% VO2max', xT + 10 + w1, top + 48, { font: font('mono', 400, fsm), color: T.c.ink2, claim: 'gi-threshold' });
    } else {    // opis progu po lewej stronie linii (nad słupkiem ~1 h), w dwóch wierszach
      txt(ctx, 'GI threshold:', xT - 8, b.y + 62, { font: font('mono', 600, fsm), color: T.c.ink2, align: 'right' });
      const w60 = txt(ctx, '60% VO2max', xT - 8, b.y + 86, { font: font('mono', 400, fsm), color: T.c.ink2, align: 'right', claim: 'gi-threshold' });
      txt(ctx, '≥2 h at ', xT - 8 - w60, b.y + 86, { font: font('mono', 400, fsm), color: T.c.ink2, align: 'right', claim: 'gi-threshold' });
    }
    COLS.forEach((c, i) => {
      const x = xOf(c.x), h = Math.max(6, hMax * c.bar), on = i === col, seen = col >= i;
      ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = seen ? T.c.ink : T.c.hair; ctx.fillStyle = on ? T.c.ink : T.c.paper;
      ctx.beginPath(); ctx.rect(x - cw / 2, yB - h, cw, h); ctx.fill(); ctx.stroke(); ctx.restore();
      if (seen) {
        if (T2 && i === 0) { txt(ctx, 'mouth', x, yB - h - 36, { font: font('mono', 600, fs), align: 'center', claim: c.claim }); txt(ctx, 'rinse', x, yB - h - 10, { font: font('mono', 600, fs), align: 'center', claim: c.claim }); }
        else txt(ctx, c.top, x, yB - h - 10, { font: font('mono', 600, fs), color: T.c.ink, align: 'center', claim: c.claim });
      }
      txt(ctx, c.tick, x, yB + 28, { font: font('mono', 600, fs), color: T.c.ink2, align: 'center', claim: i === 0 ? 'cho-1h' : i === 1 ? 'cho-60' : null });
      if (c.note) {
        if (T2 || narrow) { txt(ctx, '(multiple', x, yB + 52, { font: font('mono', 400, 18), color: T.c.ink2, align: 'center' }); txt(ctx, 'transportable)', x, yB + 72, { font: font('mono', 400, 18), color: T.c.ink2, align: 'center' }); }
        else txt(ctx, c.note, x, yB + 51, { font: font('mono', 400, 19), color: T.c.ink2, align: 'center' });
      }
    });
    ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.line; ctx.beginPath(); ctx.moveTo(cx0, yB); ctx.lineTo(cx1, yB); ctx.stroke();
    if (col >= 0) { const px = xOf(Math.min(1, d)); ctx.fillStyle = T.c.blood; ctx.beginPath(); ctx.moveTo(px, yB - 2); ctx.lineTo(px - 8, yB - 15); ctx.lineTo(px + 8, yB - 15); ctx.fill(); }   // wskaźnik czasu nad osią
  }

  FIGMOD['gut-blood-flow'] = {
    params: [
      { id: 'effort', label: 'Effort', fmt: phase },
      { id: 'duration', label: 'Duration', fmt: d => colOf(d) < 0 ? '—' : COLS[colOf(d)].tick },
    ],
    keys: KEYS,
    markerK: st => smooth((st.effort - 0.6) / 0.25),   // zakreślacz pod „on a hard effort?” przy ciężkim wysiłku
    frames: [
      { label: 'Rest', t: 0 }, { label: 'Easy', t: 1500 }, { label: 'Hard or long', t: 6000 },
      { label: 'Carbs: ~1 h', t: 10000 }, { label: 'Carbs: 2–3 h', t: 13500 }, { label: 'Carbs: ultra', t: 17000 }, { end: END },
    ],
    draw(ctx, st, ms, dt, seq) {
      const e = st.effort, d = st.duration, g = gutFlow(e), m = muscleFlow(e), col = colOf(d);
      if (seq) acc = { g: phAt(PH.g, ms), m: phAt(PH.m, ms) };
      else { acc.g += dt * speed(g); acc.m += dt * speed(m); }
      readouts(ctx, [
        { label: 'EFFORT', value: phase(e) },
        { label: 'GUT BLOOD FLOW', value: e >= 0.85 ? '↓ ≥80%' : e >= 0.15 ? '↓' : '—', color: e >= 0.85 ? T.c.blood : T.c.ink, claim: e >= 0.85 ? 'sbf-80' : null },
        { label: 'CARBS', value: col < 0 ? '—' : COLS[col].read, claim: col < 0 ? null : COLS[col].claim },
      ]);
      panelA(ctx, LY.boxes.A, g, m);
      panelB(ctx, LY.boxes.B, e, g);
      panelC(ctx, LY.boxes.C, d, col);
      // Legenda (źródła; rola 'citation' zwalnia rok/PMID z claimów)
      frameLegend(ctx, [
        [{ s: 'Schematic, not to scale. A–B: ter Steege & Kolkman ' }, { s: '2012', role: 'citation' }, { s: ', PMID ' }, { s: '22229513', role: 'citation' }],
        [{ s: 'C: Jeukendrup ' }, { s: '2014', role: 'citation' }, { s: ' (GSSI), PMID ' }, { s: '24791914', role: 'citation' }, { s: '; Costa ' }, { s: '2017', role: 'citation' }, { s: ', PMID ' }, { s: '28589631', role: 'citation' }],
        'No data link g/h to heart-rate zones or gut blood flow.',
        'Education, not medical advice.',
      ]);
    },
  };
})();
