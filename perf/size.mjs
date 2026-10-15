// Fails when the production bundle grows past its budget. Run after `npm run build`.
// Usage: node perf/size.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

// Budgets in kilobytes of gzipped output, with headroom over today's size (JS 90.0 kB, CSS 5.0 kB).
const BUDGETS = { '.js': 100, '.css': 6 };

const dir = new URL('../dist/assets/', import.meta.url);
let failed = false;
for (const [ext, budget] of Object.entries(BUDGETS)) {
  const files = readdirSync(dir).filter((f) => f.endsWith(ext));
  const kb = files.reduce((sum, f) => sum + gzipSync(readFileSync(new URL(f, dir))).length, 0) / 1000;
  const ok = kb <= budget;
  failed ||= !ok;
  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${ext.slice(1).toUpperCase().padEnd(3)} ${kb.toFixed(1)} kB gzipped (budget ${budget} kB)`,
  );
}
process.exit(failed ? 1 : 0);
