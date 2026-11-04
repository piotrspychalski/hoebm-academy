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

  // Budżet strefy bezpiecznej (y 269–1248): nagłówek do ~500 · odczyty 515–597 · A 620–800 · B 826–944 · C 980–1131 · legenda 1166–1238
  const heart = { x: 540, y: 652 }, gut = { x: 300, y: 712 }, mus = { x: 780, y: 712 };

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

      // Odczyty
      readouts(ctx, 515, [
        { label: 'EFFORT', value: phase(e) },
        { label: 'GUT BLOOD FLOW', value: e >= 0.85 ? '↓ ≥80%' : e >= 0.15 ? '↓' : '—', color: e >= 0.85 ? T.c.blood : T.c.ink, claim: e >= 0.85 ? 'sbf-80' : null },
        { label: 'CARBS', value: col < 0 ? '—' : COLS[col].read, claim: col < 0 ? null : COLS[col].claim },
      ]);

      // A: serce → jelito / mięśnie pracujące
      panelLabel(ctx, 'A', 650);
      const hb = { x: heart.x, y: heart.y + 32 }, gt = { x: gut.x, y: gut.y }, mt = { x: mus.x, y: mus.y };
      vessel(ctx, hb, gt, 6 + 16 * g, 8); vessel(ctx, hb, mt, 6 + 16 * m, 8);
      particles(ctx, hb, gt, acc.g, g, 8); particles(ctx, hb, mt, acc.m, m, 8);
      ctx.fillStyle = T.c.paper; ctx.strokeStyle = T.c.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(heart.x, heart.y, 32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      txt(ctx, 'Heart', heart.x, heart.y + 8, { font: font('sans', 600, 21), align: 'center' });
      hatchBox(ctx, gut.x - 105, gut.y, 210, 48, g); hatchBox(ctx, mus.x - 105, mus.y, 210, 48, m);
      txt(ctx, 'Gut', gut.x, gut.y + 80, { font: font('sans', 500, 26), align: 'center' });
      txt(ctx, 'Working muscles', mus.x, mus.y + 80, { font: font('sans', 500, 26), align: 'center' });

      // B: przepływ trzewny, % spoczynku, rysowany do playheada
      const bx0 = L + 110, bx1 = R - 10, by1 = 852, by0 = 920, yOf = v => by0 - (by0 - by1) * v;
      panelLabel(ctx, 'B', 866);
      ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.line;
      ctx.beginPath(); ctx.moveTo(bx0, by1 - 8); ctx.lineTo(bx0, by0); ctx.lineTo(bx1, by0); ctx.stroke();
      txt(ctx, '100%', bx0 - 12, yOf(1) + 7, { font: font('mono', 400, 22), color: T.c.ink2, align: 'right', role: 'axis' });
      txt(ctx, '20%', bx0 - 12, yOf(0.2) + 7, { font: font('mono', 400, 22), color: T.c.ink2, align: 'right', claim: 'sbf-80' });
      ctx.save(); ctx.strokeStyle = T.c.hair; ctx.setLineDash([4, 6]);
      [1, 0.2].forEach(v => { ctx.beginPath(); ctx.moveTo(bx0, yOf(v)); ctx.lineTo(bx1, yOf(v)); ctx.stroke(); });
      ctx.restore();
      txt(ctx, 'Gut blood flow, % of rest', bx0 + 10, by1 - 12, { font: font('sans', 500, 23), color: T.c.ink2 });
      txt(ctx, 'rest → longer / harder', bx1, by0 + 26, { font: font('mono', 400, 21), color: T.c.ink2, align: 'right' });
      ctx.strokeStyle = T.c.blood; ctx.lineWidth = T.lineBold; ctx.lineCap = 'round'; ctx.beginPath();
      const n = Math.max(1, Math.round(60 * e));
      for (let i = 0; i <= n; i++) { const ee = i / 60, x = bx0 + (bx1 - bx0) * ee, y = yOf(gutFlow(ee)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      ctx.fillStyle = T.c.blood; ctx.beginPath(); ctx.arc(bx0 + (bx1 - bx0) * e, yOf(g), 8, 0, Math.PI * 2); ctx.fill();

      // C: węglowodany w trakcie wysiłku wg czasu trwania (słupki w granacie — to nie dane o krwi)
      const cx0 = L + 110, cx1 = R - 10, yB = 1085, hMax = 44, cw = (cx1 - cx0) / 3 - 40, xOf = u => cx0 + (cx1 - cx0) * u;
      panelLabel(ctx, 'C', 990);
      txt(ctx, 'Carbohydrate during exercise, by duration', cx0 + 10, 986, { font: font('sans', 500, 23), color: T.c.ink2 });
      // Próg Costa 2017 na osi czasu: ≥2 h (granica przedziałów 1 h | 2–3 h)
      const xT = xOf(1 / 3);
      ctx.save(); ctx.strokeStyle = T.c.ink2; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(xT, 998); ctx.lineTo(xT, yB); ctx.stroke(); ctx.restore();
      // opis progu po lewej stronie linii (nad słupkiem ~1 h), w dwóch wierszach
      txt(ctx, 'GI threshold:', xT - 8, 1016, { font: font('mono', 600, 20), color: T.c.ink2, align: 'right' });
      const w60 = txt(ctx, '60% VO2max', xT - 8, 1040, { font: font('mono', 400, 20), color: T.c.ink2, align: 'right', claim: 'gi-threshold' });
      txt(ctx, '≥2 h at ', xT - 8 - w60, 1040, { font: font('mono', 400, 20), color: T.c.ink2, align: 'right', claim: 'gi-threshold' });
      COLS.forEach((c, i) => {
        const x = xOf(c.x), h = Math.max(6, hMax * c.bar), on = i === col, seen = col >= i;
        ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = seen ? T.c.ink : T.c.hair; ctx.fillStyle = on ? T.c.ink : T.c.paper;
        ctx.beginPath(); ctx.rect(x - cw / 2, yB - h, cw, h); ctx.fill(); ctx.stroke(); ctx.restore();
        if (seen) txt(ctx, c.top, x, yB - h - 8, { font: font('mono', 600, 22), color: T.c.ink, align: 'center', claim: c.claim });
        txt(ctx, c.tick, x, yB + 27, { font: font('mono', 600, 22), color: T.c.ink2, align: 'center', claim: i === 0 ? 'cho-1h' : i === 1 ? 'cho-60' : null });
        if (c.note) txt(ctx, c.note, x, yB + 51, { font: font('mono', 400, 19), color: T.c.ink2, align: 'center' });
      });
      ctx.strokeStyle = T.c.ink; ctx.lineWidth = T.line; ctx.beginPath(); ctx.moveTo(cx0, yB); ctx.lineTo(cx1, yB); ctx.stroke();
      if (col >= 0) { const px = xOf(Math.min(1, d)); ctx.fillStyle = T.c.blood; ctx.beginPath(); ctx.moveTo(px, yB - 2); ctx.lineTo(px - 8, yB - 15); ctx.lineTo(px + 8, yB - 15); ctx.fill(); }   // wskaźnik czasu nad osią, nad podpisami

      // Legenda (źródła; rola 'citation' zwalnia rok/PMID z claimów)
      frameLegend(ctx, [
        [{ s: 'Schematic, not to scale. A–B: ter Steege & Kolkman ' }, { s: '2012', role: 'citation' }, { s: ', PMID ' }, { s: '22229513', role: 'citation' }],
        [{ s: 'C: Jeukendrup ' }, { s: '2014', role: 'citation' }, { s: ' (GSSI), PMID ' }, { s: '24791914', role: 'citation' }, { s: '; Costa ' }, { s: '2017', role: 'citation' }, { s: ', PMID ' }, { s: '28589631', role: 'citation' }],
        'No data link g/h to heart-rate zones or gut blood flow.',
        'Education, not medical advice.',
      ], 20);
    },
  };
})();
