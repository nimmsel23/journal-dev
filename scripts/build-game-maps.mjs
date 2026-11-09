// Game-Maps als eigene Mini-Apps auf DERSELBEN Origin wie Game v2: vos-game.web.app/<map>/ (frame, freedom, focus, fire).
// Gleiche Origin = gleicher Login, gleiche IndexedDB/Cache, keine neue Site, keine neue autorisierte Domain.
//
//   node scripts/build-game-maps.mjs [map …]     ohne Angabe: alle aus scripts/miniapps.json mit "gameMap"
//
// Läuft NACH dem Root-Build von dist-game (der leert das Verzeichnis); jede Map landet in dist-game/<map>/ mit
// base/scope/start_url /<map>/ und eigenem Service Worker (Scope /<map>/). Die Hosting-Rewrites stehen in firebase.json.
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { apps } = JSON.parse(readFileSync(resolve(root, 'scripts/miniapps.json'), 'utf8'))
const maps = apps.filter((a) => a.gameMap)
const wanted = process.argv.slice(2)
const list = wanted.length ? maps.filter((a) => wanted.includes(a.gameMap)) : maps
if (!list.length) {
  console.error('keine Game-Map in scripts/miniapps.json')
  process.exit(1)
}

for (const a of list) {
  const cmd = `vite build --mode firebase --config vite.config.cjs --outDir dist-game/${a.gameMap}`
  console.log(`\n▶ [${a.gameMap}] ${cmd}`)
  const r = spawnSync(cmd, {
    cwd: root,
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_APP_MODE: 'client',
      VITE_APP_FLAVOR: 'game',
      VITE_DEFAULT_TAB: 'game-v2',
      VITE_DEFAULT_GAME_MODE: a.gameMap,
      VITE_GAME_SOLO: a.gameMap,
      VITE_BASE_PATH: `/${a.gameMap}/`,
    },
  })
  if (r.status !== 0) {
    console.error(`❌ ${a.gameMap} fehlgeschlagen`)
    process.exit(r.status || 1)
  }
}
console.log(`\n✅ dist-game/: ${list.map((a) => a.gameMap).join(', ')}`)
