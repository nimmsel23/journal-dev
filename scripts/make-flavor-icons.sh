#!/usr/bin/env bash
# Erzeugt die App-Icon-Pakete public/icons-{voice,game,tent} im Raster-Stil (Papier #f6f6f2, Tinte #0d0d0d, Signalblau #1738ff).
# Braucht rsvg-convert + ImageMagick. Aufruf: scripts/make-flavor-icons.sh
set -euo pipefail
cd "$(dirname "$0")/../public"

glyph() {
  case "$1" in
    voice) cat <<'S'
  <rect x="108" y="280" width="56" height="120" fill="#0d0d0d"/>
  <rect x="188" y="180" width="56" height="220" fill="#0d0d0d"/>
  <rect x="268" y="80" width="56" height="320" fill="#0d0d0d"/>
  <rect x="348" y="200" width="56" height="200" fill="#1738ff"/>
  <rect x="64" y="412" width="384" height="24" fill="#0d0d0d"/>
S
    ;;
    game) cat <<'S'
  <rect x="84" y="84" width="160" height="160" fill="#0d0d0d"/><rect x="112" y="112" width="104" height="104" fill="#f6f6f2"/>
  <rect x="268" y="84" width="160" height="160" fill="#0d0d0d"/><rect x="296" y="112" width="104" height="104" fill="#f6f6f2"/>
  <rect x="84" y="268" width="160" height="160" fill="#0d0d0d"/><rect x="112" y="296" width="104" height="104" fill="#f6f6f2"/>
  <rect x="268" y="268" width="160" height="160" fill="#1738ff"/><rect x="296" y="296" width="104" height="104" fill="#0d0d0d"/>
S
    ;;
    tent) cat <<'S'
  <polygon points="256,72 448,420 64,420" fill="#0d0d0d"/>
  <polygon points="256,236 328,420 184,420" fill="#1738ff"/>
  <rect x="48" y="420" width="416" height="24" fill="#0d0d0d"/>
S
    ;;
  esac
}

for f in voice game tent; do
  d="icons-$f"; mkdir -p "$d"
  { echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'; echo '  <rect width="512" height="512" fill="#f6f6f2"/>'; glyph "$f"; echo '</svg>'; } >"$d/icon.svg"
  { echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'; echo '  <rect width="512" height="512" fill="#f6f6f2"/>'; echo '  <g transform="translate(64 64) scale(.75)">'; glyph "$f"; echo '  </g>'; echo '</svg>'; } >"$d/maskable.svg"
  rsvg-convert -w 192 -h 192 "$d/icon.svg" -o "$d/icon-192.png"
  rsvg-convert -w 512 -h 512 "$d/icon.svg" -o "$d/icon-512.png"
  rsvg-convert -w 512 -h 512 "$d/maskable.svg" -o "$d/icon-maskable-512.png"
  rsvg-convert -w 180 -h 180 "$d/icon.svg" -o "$d/apple-touch-icon.png"
  rsvg-convert -w 32 -h 32 "$d/icon.svg" -o "$d/favicon-32.png"
  magick "$d/favicon-32.png" -define icon:auto-resize=32,16 "$d/favicon.ico"
done
