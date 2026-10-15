// A stand-in for the countries GraphQL API with a fixed delay, so speed measurements are repeatable.
// Usage: node perf/mock-api.mjs [--port 4000] [--delay 150] [--multiply 1]
// --multiply N serves N copies of the countries (with unique codes) to test large datasets.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? Number(process.argv[i + 1]) : fallback;
};
const port = arg('port', 4000);
const delay = arg('delay', 150);
const multiply = arg('multiply', 1);
const source = JSON.parse(readFileSync(new URL('./countries.json', import.meta.url), 'utf8'));
const countries = Array.from({ length: multiply }, (_, k) =>
  source.data.countries.map((c) => (k === 0 ? c : { ...c, code: `${c.code}~${k}` })),
).flat();
const body = JSON.stringify({ data: { countries } });

createServer((req, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', '*');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  setTimeout(() => res.writeHead(200, { 'content-type': 'application/json' }).end(body), delay);
}).listen(port, () => console.log(`mock countries API on http://localhost:${port}/graphql (${countries.length} countries, ${delay} ms delay)`));
