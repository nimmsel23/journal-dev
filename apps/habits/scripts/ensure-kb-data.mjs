#!/usr/bin/env node
// Stellt die generierten KB-Dateien von fitness sicher (src/lib/db/firestore/{push,pull,legs}.generated.js u. a.).
// Diese Dateien sind gitignored und entstehen sonst nur im Prebuild von fitness selbst; Learn/Habits bauen
// fitness-Quellen mit (@fitness-db) und scheiterten ohne sie mit `Could not resolve "./push.generated.js"`.
// Fitness-Checkout: Nachbar neben diesem Repo (fitness-app im vitalos-Workspace, sonst ~/dev/fitness-dev).
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fitness = process.env.KB_FITNESS_DIR
  || ['fitness-app', 'fitness-dev'].map((n) => join(root, '../../..', n)).find(existsSync);
if (!fitness) {
  console.error('ensure-kb-data: kein fitness-app/fitness-dev neben diesem Repo gefunden.');
  process.exit(1);
}
const marker = join(fitness, 'src/lib/db/firestore/push.generated.js');
if (existsSync(marker)) process.exit(0);
console.log(`ensure-kb-data: ${marker} fehlt — pnpm run build:kb-data in ${fitness}`);
process.exit(spawnSync('pnpm', ['run', 'build:kb-data'], { cwd: fitness, stdio: 'inherit' }).status ?? 1);
