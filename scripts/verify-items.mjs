// One-off verifier: fetches Wikipedia pageviews for every item and reports
// any slug that returns zero views (i.e. wrong title, redirect, or missing article).
//
//   node --experimental-strip-types scripts/verify-items.mjs
//
// Polite mode: concurrency 1, ~600ms between requests (well under the 500 req/hr
// anonymous limit on api.wikimedia.org). Takes a couple minutes for ~300 items.

import { ITEMS } from "../src/lib/items.ts";

const BASE =
  "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents";
const UA = "mainstream-hipster/0.1 (verify; https://github.com/byebrianwong/mainstream-hipster) ranking-game";
const DELAY_MS = 600;

function range() {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const start = new Date(Date.UTC(end.getUTCFullYear() - 1, end.getUTCMonth(), 1));
  const fmt = (d) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}0100`;
  return { start: fmt(start), end: fmt(end) };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchViews(wiki, attempt = 0) {
  const { start, end } = range();
  const url = `${BASE}/${wiki}/monthly/${start}/${end}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 && attempt < 6) {
      const wait = 2000 * 2 ** attempt;
      await sleep(wait);
      return fetchViews(wiki, attempt + 1);
    }
    if (res.status === 404) return { ok: false, status: 404, views: 0 };
    if (!res.ok) return { ok: false, status: res.status, views: 0 };
    const data = await res.json();
    const views = (data.items ?? []).reduce((s, it) => s + (it.views ?? 0), 0);
    return { ok: views > 0, status: 200, views };
  } catch (e) {
    return { ok: false, status: 0, views: 0, error: e.message };
  }
}

const results = [];
let idx = 0;
for (const item of ITEMS) {
  idx++;
  const r = await fetchViews(item.wiki);
  results.push({ item, ...r });
  if (idx % 25 === 0) process.stderr.write(`  ${idx}/${ITEMS.length}...\n`);
  await sleep(DELAY_MS);
}

const broken = results.filter((r) => !r.ok);
const lowSignal = results.filter((r) => r.ok && r.views < 1000);
const byCategory = {};
for (const r of results) {
  byCategory[r.item.category] ??= { total: 0, broken: 0 };
  byCategory[r.item.category].total++;
  if (!r.ok) byCategory[r.item.category].broken++;
}

console.log(`\nTotal items: ${results.length}`);
console.log(`Broken: ${broken.length}`);
console.log(`Low-signal (<1k views): ${lowSignal.length}\n`);

console.log("Per category:");
for (const [cat, s] of Object.entries(byCategory)) {
  console.log(`  ${cat.padEnd(10)} ${s.total - s.broken}/${s.total} working`);
}

if (broken.length) {
  console.log("\nBROKEN:");
  for (const r of broken) {
    console.log(`  ${r.item.category.padEnd(8)} ${r.item.id.padEnd(28)} wiki=${r.item.wiki}  http=${r.status}`);
  }
}

if (lowSignal.length) {
  console.log("\nLOW SIGNAL (<1k views):");
  for (const r of lowSignal) {
    console.log(`  ${r.item.category.padEnd(8)} ${r.item.id.padEnd(28)} views=${r.views}`);
  }
}

process.exit(broken.length > 0 ? 1 : 0);
