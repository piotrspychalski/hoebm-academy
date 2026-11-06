#!/usr/bin/env bash
# Szybkie testy Sports Academy (bez zależności). Te same kroki uruchamia .github/workflows/pages.yml przed publikacją.
# Każdy test uruchamiany raz; wynik = kod wyjścia testu (ostatnia linia „errors [...]” to podsumowanie).
set -u; cd "$(dirname "$0")/.."
for t in budowa akademia slajdy; do
  echo "── $t"
  if ! out=$(node "tests/$t.js" 2>&1); then echo "$out" | tail -8; echo "BŁĄD: tests/$t.js"; exit 1; fi
done
echo "wszystkie testy: OK"
