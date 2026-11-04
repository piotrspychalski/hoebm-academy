# Changelog

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
