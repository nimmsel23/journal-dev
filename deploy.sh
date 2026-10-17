#!/usr/bin/env bash
# deploy.sh — Journal (local channel → Desktop Prod /opt/journal)
#
# Gebaut wird IM Repo (nicht in /opt): nur dort liegen fitness/fuel/relax als
# Nachbarn, die vite.config.cjs per Alias in den Build zieht. Nach /opt/journal
# geht ausschließlich der Build-Output (dist-firebase/). Keine Backups.
#
#   ./deploy.sh              bauen + nach /opt/journal kopieren + Dienst neu starten
#   ./deploy.sh --pull       vorher saubere Nachbar-Repos per ff-only aktualisieren
#   ./deploy.sh --dry-run    bauen, aber nichts nach /opt schreiben, kein Restart
set -euo pipefail

DEST="/opt/journal"
SERVICE="journal.service"
SOURCE="$(cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")" && pwd)"
PARENT="$(dirname "$SOURCE")"
PULL=0
DRY=0

msg() { printf '\033[1;32m%s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m%s\033[0m\n' "$*" >&2; }
die() { printf '\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }

for arg in "$@"; do
  case "$arg" in
    --pull) PULL=1 ;;
    --dry-run) DRY=1 ;;
    *) die "Unbekannte Option: $arg (erlaubt: --pull, --dry-run)" ;;
  esac
done

[[ $EUID -ne 0 ]] || die "Nicht als root starten (kein pkexec/sudo davor) — das Skript ruft sudo selbst nur für /opt auf."

# 1. Nachbar-Repos finden (gleiche Kandidaten wie vite.config.cjs: *-app vor *-dev)
msg "🔗 Nachbar-Repos für den Build"
for name in fitness fuel relax; do
  dir=""
  for cand in "$PARENT/$name-app" "$PARENT/$name-dev"; do
    [[ -d "$cand" ]] && { dir="$cand"; break; }
  done
  [[ -n "$dir" ]] || die "Nachbar-Repo '$name' nicht gefunden (erwartet: $PARENT/$name-app oder $PARENT/$name-dev)"
  [[ -d "$dir/node_modules" ]] || warn "⚠️  $dir hat kein node_modules — Imports daraus können beim Build fehlschlagen (dort 'pnpm install' ausführen)"

  if git -C "$dir" rev-parse --git-dir >/dev/null 2>&1; then
    dirty=$(git -C "$dir" status --short | wc -l)
    if (( PULL )); then
      if (( dirty )); then
        warn "⏭  $name: $dirty uncommittete Änderung(en), kein Pull"
      else
        git -C "$dir" pull --ff-only --quiet || warn "⚠️  $name: Pull fehlgeschlagen, baue mit vorhandenem Stand"
      fi
    fi
    printf '   %-8s %s @ %s%s\n' "$name" "$(basename "$dir")" "$(git -C "$dir" rev-parse --short HEAD)" \
      "$( (( dirty )) && echo " (+$dirty uncommittet)" || true)"
  else
    printf '   %-8s %s (kein git)\n' "$name" "$(basename "$dir")"
  fi
done

# 2. Bauen — im Repo, nicht in /opt
msg "📦 Dependencies + Build"
(
  cd "$SOURCE"
  pnpm install --frozen-lockfile --silent
  pnpm run build > /dev/null
)
[[ -f "$SOURCE/dist-firebase/index.html" ]] || die "Build-Output $SOURCE/dist-firebase/index.html fehlt"

# 3. Nur den Build-Output ausliefern
if (( DRY )); then
  msg "🧪 Dry-Run: Build ok, nichts nach $DEST geschrieben."
  exit 0
fi

msg "🚚 $SOURCE/dist-firebase → $DEST/dist-firebase"
sudo mkdir -p "$DEST/dist-firebase"
sudo rsync -a --delete "$SOURCE/dist-firebase/" "$DEST/dist-firebase/"

# 4. Dienst neu starten
if systemctl list-unit-files "$SERVICE" 2>/dev/null | grep -q "^$SERVICE"; then
  msg "🔄 Restarting $SERVICE"
  sudo systemctl restart "$SERVICE"
else
  warn "⚠️  $SERVICE nicht gefunden — Restart übersprungen."
fi

msg "✅ Journal deployed → $DEST"
