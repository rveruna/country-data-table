// Measures how long interactions take in real Chrome as the number of countries grows.
// The page only ever shows one page of rows, so this checks where the cost really is.
// Usage: node perf/scale.mjs [--cpu 4]
// Set CHROME_PATH if Chrome is not in the default location.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const flag = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const cpu = Number(flag('cpu', 4));
const API = 'http://localhost:4000/graphql';
const APP = 'http://localhost:4173';
const chrome =
  process.env.CHROME_PATH ??
  (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
const SIZES = [1, 10, 100]; // multiples of the 250 real countries
const SAMPLES = 9;
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

async function waitFor(url, method = 'GET') {
  for (let i = 0; i < 80; i++) {
    try {
      await fetch(url, { method });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

const build = spawnSync('npm', ['run', 'build'], { env: { ...process.env, VITE_GRAPHQL_ENDPOINT: API }, stdio: 'ignore' });
if (build.status !== 0) throw new Error('build failed');
const preview = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore' });
let mock;
const stop = () => {
  preview.kill();
  mock?.kill();
};
process.on('exit', stop);

// Runs in the page: performs an action and resolves when the next frame has been painted.
const pageHelpers = `
  window.__frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__setSelect = (label, value) => {
    const l = [...document.querySelectorAll('label')].find((x) => x.textContent.trim() === label);
    const el = document.getElementById(l.htmlFor);
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, value);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  // Time until the event's work (render, effects, follow-up updates) has finished; paint is not included,
  // because waiting for frames cannot measure anything under about 33 ms.
  window.__settle = () => new Promise((r) => setTimeout(r, 0));
  window.__timeSelect = async (label, value) => {
    const t0 = performance.now();
    window.__setSelect(label, value);
    await window.__settle();
    return performance.now() - t0;
  };
  window.__timeClick = async (name) => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes(name) && !x.disabled);
    const t0 = performance.now();
    b.click();
    await window.__settle();
    return performance.now() - t0;
  };
  window.__timeSearch = async (text) => {
    const input = document.querySelector('input[type=text]');
    const tbody = document.querySelector('tbody');
    const changed = new Promise((resolve) => {
      const o = new MutationObserver(() => { o.disconnect(); resolve(performance.now()); });
      o.observe(tbody, { childList: true, subtree: true, characterData: true });
    });
    const t0 = performance.now();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return (await changed) - t0;
  };
`;

try {
  await waitFor(APP);
  const results = [];

  for (const multiply of SIZES) {
    mock = spawn('node', ['perf/mock-api.mjs', '--delay', '0', '--multiply', String(multiply)], { stdio: 'ignore' });
    await waitFor(API, 'OPTIONS');

    const browser = await chromium.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });

    const t0 = Date.now();
    await page.goto(APP);
    await page.waitForSelector('tbody tr');
    const loadMs = Date.now() - t0;
    await page.evaluate(pageHelpers);

    // Three warm-up runs are thrown away so that cold JIT and caches do not skew the median.
    // The counter runs across warm-up and samples, so alternating actions (on, off, on, ...) never repeat.
    const sample = async (fn) => {
      let n = 0;
      for (let i = 0; i < 4; i++) await fn(n++);
      const xs = [];
      for (let i = 0; i < SAMPLES; i++) xs.push(await fn(n++));
      return Math.round(median(xs) * 10) / 10;
    };

    const filter = await sample((i) => page.evaluate(([v]) => window.__timeSelect('Continent', v), [i % 2 === 0 ? 'Europe' : '']));
    await page.evaluate(() => window.__setSelect('Continent', ''));
    await page.evaluate(() => window.__frame());
    const pageSize = await sample((i) => page.evaluate(([v]) => window.__timeSelect('Show', v), [i % 2 === 0 ? '100' : '10']));
    const next = await sample(async () => {
      await page.evaluate(() => window.__setSelect('Show', '10'));
      await page.evaluate(() => window.__frame());
      return page.evaluate(() => window.__timeClick('Next'));
    });
    const search = await sample(async (i) => {
      const ms = await page.evaluate(([t]) => window.__timeSearch(t), [i % 2 === 0 ? 'an' : '']);
      return ms - 300; // subtract the 300 ms debounce, which is a fixed wait and not work
    });
    const dom = await page.evaluate(() => ({
      rows: document.querySelectorAll('tbody tr').length,
      nodes: document.querySelectorAll('*').length,
    }));

    results.push({ countries: 250 * multiply, loadMs, filterMs: filter, pageSizeMs: pageSize, nextMs: next, searchMs: search, ...dom });
    await browser.close();
    mock.kill();
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\nMedian of ${SAMPLES} samples in Chrome, ${cpu}x CPU slowdown (about a mid-range phone). Milliseconds until the work for each interaction has finished (paint excluded):\n`);
  console.log('countries | load  | filter | page size | next page | search* | DOM rows | DOM nodes');
  console.log('----------|-------|--------|-----------|-----------|---------|----------|----------');
  for (const r of results) {
    console.log(
      `${String(r.countries).padStart(9)} | ${String(r.loadMs).padStart(5)} | ${String(r.filterMs).padStart(6)} | ${String(r.pageSizeMs).padStart(9)} | ${String(r.nextMs).padStart(9)} | ${String(r.searchMs).padStart(7)} | ${String(r.rows).padStart(8)} | ${String(r.nodes).padStart(9)}`,
    );
  }
  console.log('\n* search time excludes the fixed 300 ms debounce.');
  mkdirSync(new URL('./results/', import.meta.url), { recursive: true });
  writeFileSync(new URL('./results/scale.json', import.meta.url), JSON.stringify({ cpu, results }, null, 2));
} finally {
  stop();
}
