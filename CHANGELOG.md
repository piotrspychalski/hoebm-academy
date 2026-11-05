# Changelog

## [0.7.0] — 2026-11-05 (nagrywanie rolki w studiu)

### Dodane
- Studio: panel ROLKA — gotowa rolka w jednym ujęciu, bez montażu i bez zależności: kamera i mikrofon (wybór urządzeń), zdjęcie albo krótkie wideo z wyprawy (przeciągnij i upuść; wideo wyciszone), podpis, układ pół ekranu / pełny ekran, czasy sceny tytułowej i zdjęcia.
- Scenariusz: karta tytułowa (logo, tytuł wyostrza się z rozmycia) → zdjęcie / wideo z wyprawy → twarz na całym kadrze → rycina z kółkiem kamery. Autor przełącza spacją, strzałką albo pilotem; na rycinie każde „dalej” odtwarza następny kadr, a po ostatnim nagranie kończy się i zapisuje jako MP4 (Chrome) na tym komputerze. Esc przerywa bez zapisu; 1–4 to podgląd scen.
- Układ `reelCam`: rolka z kółkiem kamery w prawym górnym rogu, tytuł zawijany po słowach obok kółka.

### Testy
- `liczby_strefa`: cztery układy; żaden tekst nie wchodzi na kółko kamery.

## [0.6.0] — 2026-11-05 (czytelność rolki)

### Zmienione
- Rolka w studiu: nowy układ `reel` (logicznie 720 × 742) rysowany ze skalą ok. 1,32 dokładnie w strefie bezpiecznej Reels kadru 1080 × 1920. Wszystkie napisy w rolce są ok. 1,3 raza większe (legenda 20 → ok. 26 px w kadrze 1080).
- Rolka pokazuje sceny: najpierw panele A + B (kadry Rest → Hard or long), potem sam panel C (kadry Carbs), z przenikaniem przy starcie kadru „Carbs: ~1 h”. Legenda każdej sceny podaje tylko jej źródła. Trzy panele naraz nie mieściły się w strefie z większymi napisami. Strona publiczna bez zmian (wszystkie panele naraz).
- Papier i ziarno zawsze na całym płótnie, niezależnie od skali układu; `marker` i `hatchBox` mnożą przezroczystość (przenikanie scen).

### Usunięte
- Układ `portrait` (1080 × 1920 bez skalowania), zastąpiony przez `reel`.

### Testy
- `liczby_strefa`: prostokąty paneli ze wszystkich scen w granicach; granice rolki po skalowaniu muszą leżeć w strefie Reels.

## [0.5.0] — 2026-11-05 (czytelność na telefonie)

### Dodane
- Układ `phone` (720 × 1100) dla telefonu trzymanego pionowo: węższe płótno, więc te same czcionki są na ekranie ok. 1,5 raza większe (390 px: skala 0,35 → 0,53; legenda ok. 7 → 11 px). Studio / rolka bez zmian (1080 × 1920).
- Legenda zawija się między słowami, gdy linia nie mieści się w szerokości układu (słowa zachowują rolę i claim — test liczb działa dalej).
- Test liczb i strefy obejmuje trzy układy (432 klatki dla FIG. 1).

## [0.4.2] — 2026-11-05 (kontrola wszystkich widoków)

### Zmienione
- Logo usunięte z ramki ryciny na stronie (zostaje w studiu / rolce); logo w nagłówku strony wyostrza się z rozmycia przy wejściu (motyw „Science made clear”, bez animacji przy prefers-reduced-motion).
- Telefon trzymany poziomo: układ poziomy ryciny (16:9), niższy nagłówek i dok — rycina nie jest już zasłaniana przez dok (skala 0,27 → 0,36).
- Studio na telefonie / tablecie: dotknięcie ryciny = restart nagrania (jak R).

### Naprawione
- Krok „Next / ›” zatrzymywał się na granicy kadrów, więc dok pokazywał następny kadr, a kolejny krok jeden pomijał.
- Rycina na ekranie 1280 × 800 wystawała 12 px poza okno.
- Okno „Before you start” mogło wrócić po szybkim przeładowaniu (zapis dopiero w kolejkowanym zdarzeniu close).
- Obsługa klawiszy odporna na zdarzenia spoza elementów strony.

## [0.4.1] — 2026-11-05 (testy liczb i strefy w CI)

### Dodane
- `tests/liczby_strefa.js` w CI: liczby bez źródła (claims, cytowania, numer FIG), granice układu / strefa bezpieczna Reels, nakładanie się tekstu — dla każdej ryciny, obu układów, całej sekwencji, kadrów i siatki suwaków (FIG. 1: 288 klatek). Sprawdzone na podłożonych błędach (liczba bez claimu, tekst poza strefą, nakładanie).
- `tests/szerokosci.json` + `tools/szerokosci.js`: szerokości znaków zmierzone w Chrome (zgodność z przeglądarką ~0,1%).

## [0.4.0] — 2026-11-05 (układ poziomy na komputer)

### Dodane
- Układy ryciny w rdzeniu (`LAYOUTS`, bieżący `LY`): `portrait` 1080 × 1920 (studio, telefon) i `landscape` 1440 × 810 (komputer). Rama, odczyty i legenda zależą od układu; panele rysują się w prostokątach `LY.boxes`.
- Komputer: tytuł w jednej linii, odczyty na całą szerokość, panele A | B | C obok siebie, rycina na pełną szerokość (do 1400 px), opis pod nią w dwóch kolumnach. Na ekranie 1440 × 900 skala ok. 0,85 (wcześniej ok. 0,35).
- FIG. 1: wysokie panele w układzie poziomym (większe serce i narządy, wyższy wykres B, wyższe słupki C, opis progu Costa nad słupkami).

### Bez zmian
- Studio (rolka) i telefon: ten sam układ pionowy co w 0.3.1.

## [0.3.1] — 2026-11-04 (czytelność)

### Zmienione
- Widoki publiczne pokazują tylko obszar treści ryciny (1080 × 1030 zamiast pełnego 9:16 z pasami pod interfejs Reels); na komputerze scena do 880 px szerokości (wcześniej ok. 360 px). Pełne 9:16 tylko w studiu.
- FIG. 1: najmniejsze napisy powiększone (osie, podpisy, legenda 20 px, opisy panelu C); bez nakładania się tekstu i bez wyjścia poza strefę bezpieczną (sprawdzone na logu tekstu).
- Telefon: zamknięty arkusz opisu ukryty niezależnie od animacji (wcześniej mógł zostać widoczny).

## [0.3.0] — 2026-11-04 (FIG. 1 opublikowana)

### Zmienione
- Costa 2017 (`gi-threshold`): cytat sprawdzony w pełnym tekście (PDF, abstrakt, s. 246) — brzmienie identyczne, zapis VO2max z indeksem dolnym. Claim `verified`, FIG. 1 · GUT `published`.
- Sprawdzenie ręczne przed publikacją (log tekstu, cała sekwencja): każda liczba ma claim albo rolę strukturalną (FIG, oś, cytowanie); żaden tekst poza strefą bezpieczną. Automatyczny test tego samego — do zrobienia.

## [0.2.0] — 2026-11-04 (trzy widoki, FIG. 1 jako szkic)

### Dodane
- Trzy widoki z jednego źródła: komputer i telefon (publiczne, telefon jak w SURGITOME: menu, dok z kadrami, gesty, arkusz opisu) oraz prywatne studio do nagrywania (telefon 9:16 na komputerze; lokalnie `studio/index.html`, online pod ścieżką z sekretu `STUDIO_PATH`, `noindex`).
- Zegar sekwencji z kadrami, krok „Next” (kadry → następna rycina), pilot do prezentacji (PageUp/PageDown), suwaki z modułu ryciny.
- FIG. 1 · GUT (szkic): port wzorca (panele A, B) + panel C (węglowodany wg czasu wysiłku, Jeukendrup 2014; próg Costa 2017). Źródła i claims w rejestrze; `gi-threshold` = `to_verify` (zapis VO2max do sprawdzenia w pełnym tekście), więc rycina nie jest publikowana.
- Znak wodny „DRAFT · NOT FOR PUBLICATION” na szkicach.

### NIE zrobione
- Testy „liczby bez źródła” i „strefa bezpieczna” na logu tekstu (log już działa), zrzuty i determinizm w `lab-tools`, samouczek, QR, `CITATION.cff`/Zenodo.
- Weryfikacja Costa 2017 w pełnym tekście → publikacja FIG. 1.

## [0.1.0] — 2026-11-04 (M0b, szkielet)

### Dodane
- `build.js`: składanie `data/` + `src/core` + `src/app` do jednego `dist/index.html` (bez zależności, jak SURGITOME).
- Rejestr: `data/sources.json` + `data/figures/<id>.json` (jedna rycina na plik), walidacja w `tools/registry.js`; build przerywa się przy błędach.
- Tokeny marki House of EBM w `src/shell.html` (jedno źródło), odczyt w `src/core/01-tokeny.js`.
- Rdzeń: seeded RNG, ziarno papieru, log tekstu (dla testów), zakreślacz, rama ryciny (FIG. n · SERIA, logo, tytuł z motywem „Science made clear”, legenda), nakładka strefy bezpiecznej Reels (klawisz S).
- Aplikacja: serie, lista rycin, wyszukiwarka, ulubione, panel opisu z piśmiennictwem według ról, okna „Before you start”, „Sources”, „How to cite”, wersja na telefon, podgląd szkiców `?preview` tylko lokalnie.
- Testy szybkie w CI: budowa, rejestr i claims, zakazane treści (dawki, nazwy handlowe), kontrast tokenów (granat 6,35:1, fiolet 10,54:1, krew 5,18:1).
- Licencje: MIT (kod), CC BY 4.0 (treść), logo i nazwa: all rights reserved.

### NIE zrobione (następne kamienie)
- M1: zegar sekwencji, kadry, suwaki z rejestru, tryb `#record`, prymitywy (osie, krzywe, przepływ, słupki, kreskowanie), FIG. 1 GUT z panelami A/B/C.
- M1: testy „liczby bez źródła” i „strefa bezpieczna” (wymagają pierwszej ryciny); samouczek; kod QR.
- Zrzuty Playwright 1080×1920 i telefon, determinizm, reduced motion: w prywatnym `lab-tools/hoebm-academy`.
- `CITATION.cff`, `.zenodo.json`, DOI z Zenodo (przy wydaniu v1.0.0).
