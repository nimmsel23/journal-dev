#!/usr/bin/env bash
# deploy.sh — Versioned deployment for Journal (local channel → Desktop Prod)
set -euo pipefail

DEST="/opt/journal"
BACKUP_DIR="/opt/journal_backups"
SERVICE="journal.service"
SOURCE="$(cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")" && pwd)"

msg() { printf '\033[1;32m%s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m%s\033[0m\n' "$*" >&2; }
die() { printf '\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }

msg "🚀 Starting Journal Deployment (local channel)"

# 1. Versioned Backup
timestamp=$(date +%Y%m%d_%H%M%S)
backup_path="$BACKUP_DIR/journal_$timestamp"

if [[ -d "$DEST" ]]; then
  msg "📦 Creating versioned backup: $backup_path"
  sudo mkdir -p "$BACKUP_DIR"
  sudo cp -a "$DEST" "$backup_path"
fi

# 2. Sync to /opt/fuel
if [[ ! -d "$DEST" ]]; then
  msg "📂 Creating target directory $DEST"
  sudo mkdir -p "$DEST"
  sudo chown "$(id -u):$(id -g)" "$DEST"
fi

msg "📦 Syncing files from $SOURCE → $DEST"
sudo rsync -av --delete \
  --exclude ".git" \
  --exclude ".env" \
  --exclude ".env.*" \
  --exclude "node_modules" \
  --exclude "data" \
  --exclude "dist" \
  --exclude "dev-dist" \
  --exclude ".firebase" \
  --exclude ".archiv" \
  --exclude "*.bak" \
  --exclude ".claude" \
  --exclude "*.log" \
  "$SOURCE/" "$DEST/"

# 3. Finalize Prod Environment
msg "📦 Installing dependencies and building UI"
sudo chown -R "$(id -u):$(id -g)" "$DEST"
(
  cd "$DEST"
  npm ci --silent --include=dev
  npm run build > /dev/null
)

# 4. Restart Service
if systemctl list-unit-files "$SERVICE" >/dev/null 2>&1; then
  msg "🔄 Restarting $SERVICE"
  sudo systemctl restart "$SERVICE"
else
  warn "⚠️ $SERVICE not found. Skipping restart."
fi

msg "✅ Journal deployed to $DEST complete."
