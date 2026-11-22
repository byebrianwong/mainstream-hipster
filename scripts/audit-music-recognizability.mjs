// Flag music artists that few players are likely to recognize.
//
// An artist is flagged when it is low on BOTH signals:
//   - English Wikipedia pageviews over the last 12 full months, and
//   - Spotify monthly listeners (baked in src/lib/data/spotify-listeners.json;
//     refresh first with scripts/refresh-spotify-listeners.mjs).
//
// Being low on only one is fine: a cult act with few streams but a widely read
// article, or a big streaming act with a quiet article, still reads as known.
//
// Defaults are the thresholds used for the November 2026 prune:
//   < 50K pageviews/yr (roughly the bottom 12% of the pool) AND
//   < 15M monthly listeners (outside Spotify's top ~740).
//
// Two passes to stay under Wikimedia's rate limits: a batched 60-day screen
// for every artist (50 titles per request), then the 12-month per-article
// count (the same endpoint the game uses) for the artists near the line.
//
//   node scripts/audit-music-recognizability.mjs [--views 50000] [--listeners 15000000] [--json out.json]

import { ITEMS } from "../src/lib/items.ts";
import { readFile, writeFile } from "node:fs/promises";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const VIEWS_MAX = Number(arg("views", 50_000));
const LISTENERS_MAX = Number(arg("listeners", 15_000_000));
const JSON_OUT = arg("json", null);

const UA = "mainstream-hipster/0.3 (https://github.com/byebrianwong/mainstream-hipster) recognizability-audit";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DAILY_TO_MONTHLY = 5.6; // same fallback as src/lib/popularity/spotify.ts

const sp = JSON.parse(await readFile("src/lib/data/spotify-listeners.json", "utf8"));
const music = ITEMS.filter((i) => i.category === "music");

async function fetchRetry(url, attempt = 0) {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Api-User-Agent": UA } });
  if (r.status === 429 && attempt < 10) {
    await sleep(Number(r.headers.get("retry-after") ?? 5) * 1000 + 1000 * attempt);
    return fetchRetry(url, attempt + 1);
  }
  return r;
}

// Pass 1: batched 60-day pageviews via the action API, annualized.
async function screenViews(items) {
  const out = new Map();
  for (let i = 0; i < items.length; i += 50) {
    const batch = items.slice(i, i + 50);
    const titles = batch.map((it) => decodeURIComponent(it.wiki).replace(/_/g, " "));
    const views = new Map(); // page title -> { sum, days }
    const normalized = new Map();
    let cont = {};
    do {
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        prop: "pageviews",
        pvipdays: "60",
        titles: titles.join("|"),
        ...cont,
      });
      const r = await fetchRetry(`https://en.wikipedia.org/w/api.php?${params}`);
      if (!r.ok) throw new Error(`action API ${r.status}`);
      const d = await r.json();
      for (const n of d.query?.normalized ?? []) normalized.set(n.from, n.to);
      for (const p of Object.values(d.query?.pages ?? {})) {
        if (!p.pageviews) continue;
        const cur = views.get(p.title) ?? { sum: 0, days: 0 };
        for (const v of Object.values(p.pageviews)) {
          if (v == null) continue;
          cur.sum += v;
          cur.days++;
        }
        views.set(p.title, cur);
      }
      cont = d.continue ?? null;
    } while (cont);
    batch.forEach((it, j) => {
      const v = views.get(normalized.get(titles[j]) ?? titles[j]);
      out.set(it.id, v && v.days ? Math.round((v.sum / v.days) * 365) : 0);
    });
    await sleep(500);
  }
  return out;
}

// Pass 2: 12 full months from the per-article REST endpoint (what the game reads).
function lastTwelveMonths() {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)); // last day of previous month
  const start = new Date(Date.UTC(end.getUTCFullYear() - 1, end.getUTCMonth() + 1, 1));
  const fmt = (d) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}00`;
  return { start: fmt(start), end: fmt(end) };
}
async function yearViews(wiki) {
  const { start, end } = lastTwelveMonths();
  const r = await fetchRetry(
    `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${wiki}/monthly/${start}/${end}`,
  );
  if (r.status === 404) return 0;
  if (!r.ok) throw new Error(`pageviews ${r.status} for ${wiki}`);
  return (await r.json()).items.reduce((s, x) => s + x.views, 0);
}

function listeners(id) {
  const e = sp[id];
  if (!e) return 0;
  if (e.monthlyListeners != null) return e.monthlyListeners;
  if (e.dailyStreams != null) return Math.round(e.dailyStreams * DAILY_TO_MONTHLY);
  return 0;
}

const screen = await screenViews(music);
const rows = music.map((it) => ({
  id: it.id,
  name: it.name,
  wiki: it.wiki,
  views60dAnnualized: screen.get(it.id) ?? 0,
  views: null,
  listeners: listeners(it.id),
}));

// Confirm anyone within 1.5x of either line with the 12-month count.
const near = rows.filter((r) => r.views60dAnnualized < VIEWS_MAX * 1.5 && r.listeners < LISTENERS_MAX);
for (const r of near) {
  r.views = await yearViews(r.wiki);
  await sleep(800);
}

const flagged = near.filter((r) => r.views < VIEWS_MAX).sort((a, b) => a.views - b.views);
const fmt = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}K`);
console.log(`Music artists: ${rows.length}`);
console.log(`Flagged (pageviews/yr < ${fmt(VIEWS_MAX)} AND listeners < ${fmt(LISTENERS_MAX)}): ${flagged.length}\n`);
for (const r of flagged) console.log(`  ${r.name.padEnd(46)} views/yr ${fmt(r.views).padStart(6)}   listeners ${fmt(r.listeners).padStart(6)}`);
const zero = rows.filter((r) => r.views60dAnnualized === 0);
if (zero.length) console.log(`\nNo pageview data (check the wiki slug): ${zero.map((r) => r.name).join(", ")}`);
if (JSON_OUT) await writeFile(JSON_OUT, JSON.stringify({ rows, flagged }, null, 2) + "\n");
