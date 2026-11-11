#!/usr/bin/env node
/**
 * Solo-App-Icons auf DERSELBEN Origin wie vos-journal:
 *   vos-journal.web.app/mini/<id>/
 * (door|voice|game|tent|habits) — gleiche Auth/IndexedDB, keine Extra-OAuth-URI.
 *
 * Game-Maps analog darunter: /mini/game/<frame|freedom|focus|fire>/
 *
 * Läuft NACH dem Root-Build von dist-v2 (der dist-v2 leert).
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { apps } = JSON.parse(readFileSync(resolve(root, 'scripts/miniapps.json'), 'utf8'))

const MINIS = [
  {
    id: 'door',
    env: {
      VITE_APP_FLAVOR: 'door',
      VITE_DEFAULT_TAB: 'door-v2',
      VITE_SOLO_TABS: 'door-v2',
    },
  },
  {
    id: 'voice',
    env: {
      VITE_APP_FLAVOR: 'voice',
      VITE_DEFAULT_TAB: 'voice-v2',
      VITE_SOLO_TABS: 'voice-v2',
    },
  },
  {
    id: 'game',
    env: {
      VITE_APP_FLAVOR: 'game',
      VITE_DEFAULT_TAB: 'game-v2',
      VITE_SOLO_TABS: 'game-v2',
    },
  },
  {
    id: 'tent',
    env: {
      VITE_APP_FLAVOR: 'tent',
      VITE_DEFAULT_TAB: 'tent-v2',
      VITE_SOLO_TABS: 'tent-v2',
    },
  },
  {
    id: 'habits',
    env: {
      VITE_APP_FLAVOR: 'habits',
      VITE_DEFAULT_TAB: 'journal-v2',
      VITE_DEFAULT_MODE: 'habits',
      VITE_SOLO_TABS: 'journal-v2',
    },
  },
]

function runVite(outDir, base, extraEnv) {
  const cmd = `vite build --mode firebase --config vite.config.cjs --outDir ${outDir}`
  console.log(`\n▶ ${outDir} (base ${base})`)
  const r = spawnSync(cmd, {
    cwd: root,
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_APP_MODE: 'client',
      VITE_BASE_PATH: base,
      ...extraEnv,
    },
  })
  if (r.status !== 0) {
    console.error(`❌ ${outDir} fehlgeschlagen`)
    process.exit(r.status || 1)
  }
  const fix = spawnSync('node', ['scripts/fix-vite-preload-markers.mjs', outDir], {
    cwd: root,
    stdio: 'inherit',
  })
  if (fix.status !== 0) process.exit(fix.status || 1)
}

for (const m of MINIS) {
  runVite(`dist-v2/mini/${m.id}`, `/mini/${m.id}/`, m.env)
}

const maps = apps.filter((a) => a.gameMap)
for (const a of maps) {
  runVite(`dist-v2/mini/game/${a.gameMap}`, `/mini/game/${a.gameMap}/`, {
    VITE_APP_FLAVOR: 'game',
    VITE_DEFAULT_TAB: 'game-v2',
    VITE_SOLO_TABS: 'game-v2',
    VITE_DEFAULT_GAME_MODE: a.gameMap,
    VITE_GAME_SOLO: a.gameMap,
  })
}

console.log(
  `\n✅ vos-journal minis: ${MINIS.map((m) => m.id).join(', ')} + game maps ${maps.map((a) => a.gameMap).join(', ')}`,
)
