import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sw = resolve(root, 'public/sw.js');
const content = readFileSync(sw, 'utf8');
const match = content.match(/([a-zA-Z0-9_-]+-v)(\d+)/);
if (!match) { console.log('⚠️  CACHE pattern not found in sw.js'); process.exit(0); }
const next = parseInt(match[2]) + 1;
writeFileSync(sw, content.replace(`${match[1]}${match[2]}`, `${match[1]}${next}`));
console.log(`🔢 sw.js: ${match[1]}${match[2]} → ${match[1]}${next}`);
