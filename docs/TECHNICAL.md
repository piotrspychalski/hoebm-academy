# Sports Academy — kod źródłowy

Autor: Piotr Spychalski, MD, PhD · wersja online: https://piotrspychalski.github.io/sports-academy/
Bez zależności i frameworków: `node build.js` skleja pliki, testy to czysty Node.

## Widoki

| Widok | Plik wynikowy | Kto | Co |
|---|---|---|---|
| Akademia | `dist/index.html` | publiczny | szkic wzorcowy `reference/energy-map.html` — interaktywna mapa ciała: tematy, narządy, suwaki, wykresy, źródła |
| Studio nagrań | `studio/index.html` (lokalnie), `dist/studio/` (online, zaszyfrowane hasłem) | autor | rolka 9:16 z animacji Akademii: tytuł → zdjęcie / wideo z wyprawy → twarz → animacja z kółkiem kamery; MP4 lokalnie |
| Slajdy | `studio/sketch/` (online `dist/studio/sketch/`) | autor | odtwarzacz sekwencji slajdów szkicu 16:9 |

Widoki prywatne łączy pasek `src/studio-nav.js` (Akademia · Studio nagrań · Slajdy), wstawiany tylko do buildów studia;
chowa się po 2 s bez ruchu myszy i znika przy przechwytywaniu i nagrywaniu.

## Pliki

- `reference/energy-map.html` — Akademia (treść, modele, źródła). Treść medyczną prowadzi osobna sesja; zmiany techniczne
  (CSS telefonu, wydajność) są dopisywane w wydzielonych blokach. Interfejs dla studia: `window.HoEBMSketch.set/get/topics/organs`,
  `postMessage({ hoebm: 'slide' | 'hold' | 'get' })`, adres `#s=<JSON slajdu>`, klawisz C kopiuje stan jako slajd.
- `build.js` — Akademia (szkic + tytuł, favicon, logo na stronę główną), studio (`src/studio.html` + `src/core/*` + `src/studio/*`),
  slajdy (`tools/sketch-slides.js`), studio online zaszyfrowane (`tools/zamek.js`). Każda podmiana w szablonie musi trafić — inaczej błąd budowy.
- `src/studio.html` — szablon studia: tokeny marki w `:root`, style studia, płótno 1080 × 1920.
- `src/core/` — rdzeń kart rolki: `01-tokeny` (tokeny z CSS, scena 1080 × 1920, strefa Reels x 65–1015 / y 269–1248, układ `reel`
  720 × 742 skalowany ×1,32 do strefy), `02-rng-ziarno` (ziarno papieru), `03-tekst` (`txt`), `04-prymitywy` (zakreślacz),
  `05-rama` (logo, tytuł wyostrzający się z rozmycia, zawijanie tytułu, papier, nakładka strefy).
- `src/studio/` — `00-baza` (DOM, pamięć ustawień, pętla rysowania, start), `01-studio` (pomoc, skróty S/F/H),
  `02-rolka` (panel ROLKA, kamera, przechwycenie karty, sekwencje slajdów, sceny, MediaRecorder).
- `src/studio-sketch.html`, `tools/sketch-slides.js`, `data/slides/*.json` — sekwencje slajdów (walidacja, rozwinięcie, odtwarzacz);
  instrukcja: `.claude/skills/sketch-slides/SKILL.md`.
- `tools/zamek.js` — szyfrowanie stron studia: PBKDF2-SHA256 (310 000 iteracji) → AES-256-GCM przy budowie, WebCrypto w przeglądarce.

## Studio nagrań

Szkic Akademii w ramce (`./sketch/energy-map.html`, ten sam origin) ma stały rozmiar: 500 × 515 (kadr „strefa Reels”) albo 450 × 800
(„pełne 9:16”; na oknie niższym niż 824 px przełącza się na strefę Reels). Bez CSS zoom — z nim przechwycony obraz tracił dół szkicu.
Obraz ramki: `getDisplayMedia` (ta karta, `preferCurrentTab`) + Region Capture (`cropTo`), z zapasowym wycinaniem prostokąta ramki.
Pomoc i pasek widoków chowają się przy przechwytywaniu (`html.capturing`), bo leżałyby w kadrze. Nagrywanie: `canvas.captureStream(30)`
+ mikrofon → MediaRecorder (MP4 w Chrome, inaczej WebM). Klawisze rolki działają także z kursorem w szkicu (nasłuch w ramce).
Sekwencja slajdów: na scenie animacji spacja / → / pilot = następny slajd, po ostatnim — koniec i zapis.

## Bezpieczeństwo studia online

`dist/studio/` leży pod jawnym adresem; strony studia i slajdów są zaszyfrowane hasłem z sekretu `STUDIO_PASSWORD`
(hasło w prywatnym `lab-tools/hoebm-academy/notes/studio-online.md`). Do 0.10.0 studio leżało pod tajną ścieżką (`STUDIO_PATH`),
która trafiała do publicznego artefaktu GitHub Pages — dlatego zmiana modelu. Kopia szkicu dla ramki jest jawna (to publiczna treść), z `noindex`.

## Testy (`bash tests/uruchom_wszystkie.sh`, CI: `.github/workflows/pages.yml`)

- `budowa.js` — Akademia = szkic (tytuł, logo, bez noindex, bez kodu studia), studio i slajdy bez symboli zastępczych i błędów składni,
  `noindex`, studio online wyłącznie zaszyfrowane, brak katalogów dawnej tajnej ścieżki.
- `akademia.js` — strona publiczna: kontrast kolorów tekstu (WCAG AA), nazwy handlowe i dawki (`tests/zakazane.json`), okno źródeł
  i zastrzeżenie, brak śladów studia.
- `slajdy.js` — sekwencje slajdów: pola, zakresy, tematy i narządy ze szkicu, bez dawek i nazw handlowych.

Kontrola w prawdziwym Chrome (wszystkie widoki, zamek, nagranie z fałszywą kamerą) — prywatne `lab-tools/hoebm-academy/kontrola.py`.

## Historia

Silnik rycin kanwy (FIG. 1, rejestr rycin z claims, układy phone/landscape, test liczb i strefy) usunięto w 0.12.0;
ostatni stan jest pod tagiem `archiwum/silnik-kanwy`.
