# Changelog

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
