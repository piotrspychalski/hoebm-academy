# HoEBM Academy — kod źródłowy

Interaktywne, schematyczne ryciny o fizjologii sportów wytrzymałościowych (House of EBM).
Autor: Piotr Spychalski, MD, PhD · wersja online: https://piotrspychalski.github.io/hoebm-academy/

## Budowa
Wynikiem jest **jeden samodzielny plik HTML** (Canvas 2D, bez bibliotek; fonty z Google Fonts, fallback systemowy).

    node build.js        → dist/index.html (+ dist/core.js, dist/app.js)

Skrypt wczytuje i waliduje rejestr (`tools/registry.js`; przy błędach przerywa), skleja pliki z `src/core/` i `src/app/` w kolejności nazw
i wstawia je w `src/shell.html` (`/*REG*/`, `/*CORE*/`, `/*APP*/`, `%LOGO%`, `%VERSION%`). Nie ma bundlera ani transpilacji; kod to jeden wspólny zakres (IIFE), a podział na pliki służy czytelności. Plik działa też z `file://`.

## Tokeny
Kolory, kroje, grubości linii i czasy animacji są **tylko** w `:root` w `src/shell.html`. `src/core/01-tokeny.js` czyta je do obiektu `T`
(`T.c.ink`, `T.f.mono`, `T.revealMs`…); `font(rodzina, waga, px)` składa font canvasu. Serie danych rozróżniamy kształtem linii i podpisem, nie kolorem. `--blood` tylko dla krwi.

## Moduły
**src/core — rdzeń rysowania**
- `01-tokeny.js`: `T`, `font()`, scena `W×H` = 1080×1920, strefa bezpieczna `SAFE` (x 65–1015, y 269–1248), marginesy `L`/`R`, `REDUCE` (prefers-reduced-motion), `smooth()`
- `02-rng-ziarno.js`: `rng(seed)` (mulberry32), `grain()` (ziarno papieru, liczone raz)
- `03-tekst.js`: `txt(ctx, s, x, y, {font, color, align, role, claim})` to jedyna droga rysowania tekstu; log klatki `window.__hoebmText()` (tekst, bbox, rola, claim) dla testów; `beginFrame()`
- `04-prymitywy.js`: `marker()` (zakreślacz); w M1 osie, krzywe z playheadem, przepływ cząstek po Bézierze, słupki i zakresy, kreskowanie, etykiety paneli
- `05-rama.js`: `framePaper`, `frameHeader` (FIG. n · SERIA, logo, linia, tytuł z wyostrzeniem, zakreślacz), `frameLegend` (od dołu strefy bezpiecznej), `frameSafeZone`

**src/app — aplikacja**
- `01` słownik tekstów (EN) i serie · `02` stan, `store` (localStorage w try/catch), `PREVIEW` · `05` nawigacja: serie, lista, wyszukiwarka, ulubione, `?f=<id>`
- `06` panel opisu: cel, wnioski, czego nie wiemy, piśmiennictwo według ról (kolejność: rola, rok), linki PubMed/DOI, COI · `07` okna: start, źródła, cytowanie
- `08` scena i pętla rysowania (w M1: zegar sekwencji, kadry, suwaki, `#record`) · `13` start po załadowaniu krojów

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

Zrzuty w przeglądarce (1080×1920 i telefon), determinizm sekwencji i reduced motion są w prywatnym `lab-tools/hoebm-academy`.
