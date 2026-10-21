#!/usr/bin/env bash
# Push dev, merge into journal-app/vitalos, then publish the VitalOS pointer for CI.
set -euo pipefail

if command -v vos-release >/dev/null 2>&1; then
  exec vos-release journal --yes "$@"
fi

REPO_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_SCRIPT="$REPO_DIR/../vitalos/bin/vos-release"
if [[ ! -x "$RELEASE_SCRIPT" ]]; then
  printf 'vos-release fehlt. VitalOS mit bin/vos-release neben journal-dev auschecken oder in PATH aufnehmen.\n' >&2
  exit 1
fi

exec "$RELEASE_SCRIPT" journal --yes "$@"
