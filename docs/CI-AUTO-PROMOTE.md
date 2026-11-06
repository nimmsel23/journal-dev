# Auto-Promote dev -> master

Pushes auf `dev` bleiben nicht liegen: nach grünem `Check (Journal)` zieht `.github/workflows/automerge.yml` `master` per Fast-Forward auf `dev` und startet den Live-Deploy per Dispatch. Ist `dev` hinter `master`, wird `dev` nachgezogen; haben beide eigene Commits, wird `master` in `dev` gemergt und der Check neu gestartet. Rot bleibt liegen. Vorlage und Logik: `vitalos-prod/docs/product-dev/ci-auto-promote/`.
