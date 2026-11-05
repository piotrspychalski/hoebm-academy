#!/usr/bin/env bash
# Szybkie testy Sports Academy (bez zależności). Te same kroki uruchamia .github/workflows/pages.yml przed publikacją.
set -e; cd "$(dirname "$0")/.."
for t in budowa rejestr zakazane kontrast liczby_strefa; do
  echo "── $t"; node "tests/$t.js" | tail -1 | grep -q 'errors \[\]' || { echo "BŁĄD: tests/$t.js"; node "tests/$t.js" | tail -5; exit 1; }
done
echo "wszystkie testy: OK"
