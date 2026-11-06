import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = resolve(process.argv[2] || 'dist-firebase');
const routes = readFileSync(resolve(root, '../../src/routes.js'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(outDir, '.vite/manifest.json'), 'utf8'));
const sw = readFileSync(resolve(outDir, 'sw.js'), 'utf8');
const views = [...routes.matchAll(/import\(["'](\.\/views\/[^"']+)["']\)/g)].map((m) => `../../src/${m[1].slice(2)}`);
assert.ok(views.length, 'Journal route registry must contain views');
for (const view of views) {
  // Rollup can merge a facade into a named chunk shared by lazy entries.
  const name = basename(view, '.jsx');
  const entry = manifest[view] || Object.values(manifest).find((chunk) => chunk.isDynamicEntry && chunk.name === name);
  assert.ok(entry, `Journal view missing from build: ${view}`);
  for (const asset of [entry.file, ...(entry.css || [])]) {
    assert.ok(sw.includes(asset), `Journal asset missing from offline cache: ${asset}`);
  }
  console.log(`Journal built and precached: ${basename(view)}`);
}
// Shared helpers and nested lazy subviews must also be available offline.
for (const entry of Object.values(manifest)) {
  for (const asset of [entry.file, ...(entry.css || [])]) {
    assert.ok(sw.includes(asset), `Build asset missing from offline cache: ${asset}`);
  }
}
