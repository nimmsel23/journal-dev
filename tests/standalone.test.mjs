import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, lstatSync, realpathSync, existsSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const packages = new Set(Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }));
const aliases = {
  '@journal-db': 'src/db/index.js',
  '@journal': 'src',
  '@db': 'src/db/index.js',
  '@utils': 'src/lib/db/core.js',
};

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = resolve(dir, name);
    assert.ok(!lstatSync(path).isSymbolicLink(), `Source must be checked in, not linked: ${path}`);
    if (lstatSync(path).isDirectory()) yield* files(path);
    else yield path;
  }
}

test('every source import resolves inside Journal or to a declared package', () => {
  for (const file of files(resolve(root, 'src'))) {
    if (!/\.(?:js|jsx|mjs|css)$/.test(file)) continue;
    const source = readFileSync(file, 'utf8');
    const imports = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)["']([^"']+)["']/g;
    for (const [, specifier] of source.matchAll(imports)) {
      if (specifier === 'virtual:pwa-register/react' && packages.has('vite-plugin-pwa')) continue;
      const alias = Object.keys(aliases).find(key => specifier === key || specifier.startsWith(`${key}/`));
      if (!specifier.startsWith('.') && !alias) {
        const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
        assert.ok(packages.has(packageName), `${file}: undeclared external import ${specifier}`);
        continue;
      }
      const target = alias ? resolve(root, aliases[alias] + specifier.slice(alias.length)) : resolve(dirname(file), specifier);
      const found = ['', '.js', '.jsx', '.mjs', '/index.js', '/index.jsx'].map(ext => target + ext).find(path => existsSync(path) && !lstatSync(path).isDirectory());
      assert.ok(found, `${file}: unresolved import ${specifier}`);
      assert.ok(realpathSync(found).startsWith(root.endsWith(sep) ? root : root + sep), `${file}: import escapes Journal: ${specifier}`);
    }
  }
  for (const [name, version] of Object.entries(manifest.dependencies)) {
    assert.ok(!/^(?:link:|file:|workspace:)/.test(version), `Standalone install requires an external checkout: ${name}`);
  }
});
