# Sports Academy — kod źródłowy

Interaktywne, schematyczne ryciny o fizjologii sportów wytrzymałościowych (House of EBM).
Autor: Piotr Spychalski, MD, PhD · wersja online: https://piotrspychalski.github.io/sports-academy/

## Budowa
Wynikiem jest **jeden samodzielny plik HTML** (Canvas 2D, bez bibliotek; fonty z Google Fonts, fallback systemowy).

    node build.js        → dist/index.html (+ dist/core.js, dist/app.js)

Skrypt wczytuje i waliduje rejestr (`tools/registry.js`; przy błędach przerywa), skleja pliki z `src/core/` i `src/app/` w kolejności nazw
i wstawia je w `src/shell.html` (`/*REG*/`, `/*CORE*/`, `/*APP*/`, `%LOGO%`, `%VERSION%`). Nie ma bundlera ani transpilacji; kod to jeden wspólny zakres (IIFE), a podział na pliki służy czytelności. Plik działa też z `file://`.

## Trzy widoki
| Widok | Plik | Kto | Jak |
|---|---|---|---|
| Komputer | `dist/index.html` | publiczny | układ poziomy 1440 × 810 (`LAYOUTS.landscape`, panele obok siebie, opis pod ryciną); serie, lista, scena + suwaki + „‹ Back / Next ›”, panel opisu; ← → / PageUp PageDown (pilot), F — ulubione |
| Telefon | `dist/index.html` | publiczny | pionowo: układ `phone` 720 × 1100; poziomo: układ poziomy; `html.mobile` przy `(max-width: 760px), (pointer: coarse) and (max-height: 520px)` (jak SURGITOME): menu ☰, dok ‹ n / N kadr › z kropkami, przesunięcie palcem, opis w arkuszu „i” |
| Studio | `studio/index.html` (lokalnie) i `dist/<STUDIO_PATH>/` (online) | tylko autor | telefon 9:16 na komputerze, czarne tło, bez interfejsu i kursora; R — restart (1,5 s czystej klatki, potem cała sekwencja), Space — pauza, S — strefa bezpieczna, F — pełny ekran, ← → — rycina, H — pomoc, N — nagraj rolkę |

Studio budowane jest z tych samych plików + `src/studio/*` (`STUDIO = true`). Wersja publiczna nie zawiera kodu studia (test `budowa.js`).
Studio online: CI dokłada je pod `dist/<STUDIO_PATH>/`, gdzie `STUDIO_PATH` to **sekret repozytorium** (min. 16 znaków), więc ścieżki nie ma w kodzie ani w logach; strona ma `noindex` i nie ma do niej linków. To ochrona przez nieznany adres, nie hasło. Szkice (`draft`) są widoczne tylko lokalnie z `?preview`, także w studiu, i mają znak wodny „DRAFT · NOT FOR PUBLICATION”.

## Układy ryciny
`src/core/01-tokeny.js`: `LAYOUTS.reel` (logicznie 720 × 742, `place` = skala ok. 1,32 do strefy Reels kadru 1080 × 1920; studio / rolka; panele w scenach `scenes.AB` i `scenes.C` zamiast `boxes`), `LAYOUTS.reelCam` (jak `reel`, z kółkiem kamery `cam` w prawym górnym rogu; tytuł zawijany po słowach do `titleW`, do trzech linii), `LAYOUTS.phone` (720 × 1100; telefon pionowo) i `LAYOUTS.landscape` (1440 × 810; komputer i telefon poziomo). Bieżący układ to `LY` (ustawia `setView()` w scenie przy starcie i przy zmianie komputer ↔ telefon).
Układ ma: marginesy `L`/`R`, położenie nagłówka i tytułu (`inline` — tytuł w jednej linii), odczyty (`readY`, `readH`), legendę (`legendBottom`, `legendPx`, `legendCols`), prostokąty paneli `boxes.A/B/C` i granice treści `bounds`.
Moduł ryciny rysuje panele w `LY.boxes`; wysoki prostokąt (`h > 300`) = wariant poziomy (większe elementy, opisy nad wykresem).

## Tokeny
Kolory, kroje, grubości linii i czasy animacji są **tylko** w `:root` w `src/shell.html`. `src/core/01-tokeny.js` czyta je do obiektu `T`
(`T.c.ink`, `T.f.mono`, `T.revealMs`…); `font(rodzina, waga, px)` składa font canvasu. Serie danych rozróżniamy kształtem linii i podpisem, nie kolorem. `--blood` tylko dla krwi.

## Moduły
**src/core — rdzeń rysowania**
- `01-tokeny.js`: `T`, `font()`, scena `W×H` = 1080×1920, strefa bezpieczna `SAFE` (x 65–1015, y 269–1248), `REDUCE` (prefers-reduced-motion), `smooth()`
- `02-rng-ziarno.js`: `rng(seed)` (mulberry32), `grain()` (ziarno papieru, liczone raz)
- `03-tekst.js`: `txt(ctx, s, x, y, {font, color, align, role, claim})` to jedyna droga rysowania tekstu; log klatki `window.__hoebmText()` (tekst, bbox, rola, claim) dla testów; `beginFrame()`
- `04-prymitywy.js`: `marker()` (zakreślacz), `bezAt`/`vessel` (naczynia), `particles` (faza = f(czas sekwencji) → determinizm), `hatchBox` (kreskowanie do poziomu), `panelLabel`, `readouts` (pasek odczytów), `keyAt` (klatki kluczowe, smoothstep), rejestr modułów `FIGMOD`
- `10-gut-blood-flow.js`: FIG. 1 (port `reference/gut-blood-flow.html`: A — serce → jelito / mięśnie, B — przepływ trzewny % spoczynku; nowy C — węglowodany wg czasu wysiłku, próg Costa 2017). Moduł ryciny: `{ params, keys, frames, markerK(st), draw(ctx, st, ms, dt, seq) }`
- `05-rama.js`: `framePaper`, `frameHeader` (FIG. n · SERIA, logo, linia, tytuł z wyostrzeniem, zakreślacz), `frameLegend` (od dołu strefy bezpiecznej), `frameSafeZone`

**src/app — aplikacja**
- `01` słownik tekstów (EN) i serie · `02` stan, `store` (localStorage w try/catch), `PREVIEW` · `05` nawigacja: serie, lista, wyszukiwarka, ulubione, `?f=<id>`
- `06` panel opisu: cel, wnioski, czego nie wiemy, piśmiennictwo według ról (kolejność: rola, rok), linki PubMed/DOI, COI · `07` okna: start, źródła, cytowanie
- `08` scena: zegar `CLOCK` (restart z czystą klatką, seek, pauza, stop na końcu kadru), kadry (`step(±1)`: kadry ryciny, na końcach sąsiednia rycina), suwaki z `params` (ruszenie = tryb ręczny), znak wodny szkicu · `09` telefon · `13` start (widoki 1–2 albo studio)
- `src/studio/01-studio.js`: studio (tylko w buildzie studia)
- `src/studio/02-rolka.js`: nagrywanie gotowej rolki w przeglądarce (getUserMedia + `canvas.captureStream` + MediaRecorder; MP4 w Chrome, inaczej WebM), plik zapisywany lokalnie, nic nie jest wysyłane. Scenariusz w jednym ujęciu: 1 karta tytułowa → 2 zdjęcie albo krótkie wideo z wyprawy (pół ekranu z tytułem i podpisem albo pełny ekran; wideo wyciszone) → 3 twarz z kamery na całym kadrze → 4 rycina z kółkiem kamery (układ `reelCam`). Spacja / → / PageDown / pilot — dalej (na rycinie: następny kadr; po ostatnim — koniec i zapis), Esc — przerwij bez zapisu, 1–4 — podgląd scen, 0 — wyłącz. Zaczepy w scenie: `STUDIO_HOOK` (`cam`, `draw`, `after`).

## Rejestr (`data/`)
- `sources.json`: klucz → `{ vancouver, year, pmid?, doi?, url?, type, population, coi?, verified: {date, against} }`
- `figures/<id>.json`: jedna rycina na plik (praca równoległa bez konfliktów). Pola: `id` (= nazwa pliku), `fig`, `series`, `status` (`draft` | `published`), `title` (linie), `highlight`, `aim`, `takeaways`, `unknowns`, `frames`, `params`, `sequence`, `refs` (`[klucz, rola, co uzasadnia]`), `claims`, `shapes`.
- `claims`: każda liczba widoczna na ekranie: `{ id, display: [napisy], derived?: [{display, rule}], quote (dosłowny), source, location, status: verified | to_verify }`.
- Role źródeł: guideline, systematic review, review, RCT, observational, mechanism, own data.
- Rycina `published` z choć jednym claimem `to_verify` zatrzymuje build. Szkice są widoczne tylko lokalnie z `?preview`.

## Zasady treści
- Żadnej liczby na ekranie bez wpisu w `claims` (wyjątki tylko przez rolę tekstu: `fig`, `citation`, `axis`).
- Bez nazw handlowych, dawek leków i schematów. Nazwa międzynarodowa substancji tylko w kontekście mechanizmu.
- Krzywe schematyczne to funkcje parametryczne z komentarzem, skąd kształt (pole `shapes`).
- Stała legenda: „Schematic, not to scale.” + źródła + „Education, not medical advice.”

## Testy
    npm test             (lub: bash tests/uruchom_wszystkie.sh)

- `budowa.js`: build, brak symboli zastępczych, elementy interfejsu, składnia skryptu, brak losowania z przeglądarki w rdzeniu
- `rejestr.js`: schemat, PMID/DOI, cytaty w claims, brak `to_verify` w rycinach opublikowanych
- `zakazane.js` + `zakazane.json`: dawki i nazwy handlowe w treści rycin
- `kontrast.js`: tokeny wobec tła, WCAG AA
- `liczby_strefa.js`: rdzeń (`dist/core.js`) w Node na atrapie canvasu; każda rycina × wszystkie układy × cała sekwencja co 250 ms, każdy kadr i siatka suwaków (7 wartości na parametr). Sprawdza: (1) każda liczba w tekście o roli `content` ma claim tej ryciny i występuje w jego `display`/`derived`; `citation` = rok lub PMID źródła ryciny; `fig` = numer ryciny; (2) każdy tekst w `LY.bounds`, a granice rolki po skalowaniu `place` w strefie Reels; (3) brak nakładania się tekstów (2 px); (4) prostokąty paneli (także ze scen rolki) w granicach; (5) żaden tekst nie wchodzi na kółko kamery (`reelCam`). Szerokości tekstu z `tests/szerokosci.json` (zmierzone w Chrome; odtworzenie: `tools/szerokosci.js`).

Zrzuty w przeglądarce (1080×1920 i telefon), determinizm sekwencji i reduced motion są w prywatnym `lab-tools/hoebm-academy`.
