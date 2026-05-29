// Scrape IMDb number-of-votes for every movie and TV item.
//
// IMDb has no free search API, but it publishes a free daily dataset and every
// notable film/show is on Wikidata with its IMDb id. So, no API key required:
//   1. ONE download of datasets.imdbws.com/title.ratings.tsv.gz — every title's
//      averageRating + numVotes. Parse into {tconst -> numVotes}.
//   2. For each movie/TV item, resolve its IMDb id from the Wikipedia slug we
//      already have:  wiki slug -> Wikidata QID (Wikipedia pageprops API)
//                                -> IMDb id  (Wikidata P345 claim).
//   3. Look the id up in the ratings table.
//
// Movies and TV both rank on IMDb numVotes and share this one data file, so
// this single script refreshes both categories' entries in one pass.
//
// Output: src/lib/data/imdb-votes.json  (keyed by item id)
//
//   node --experimental-strip-types scripts/scrape-imdb-data.mjs

import { ITEMS } from "../src/lib/items.ts";
import { writeFile, mkdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { dirname } from "node:path";

const UA =
  "mainstream-hipster/0.4 (https://github.com/byebrianwong/mainstream-hipster) data-scrape";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Shows whose Wikidata item has no IMDb id (P345) — usually because the article
// is a franchise/manga page rather than the series. Pin the series' IMDb id.
const IMDB_OVERRIDES = {
  "the-amazing-race": "tt0285335", // The Amazing Race (US)
  "mob-psycho-100": "tt5897304", // Mob Psycho 100 (anime)
  "the-mighty-boosh": "tt0398417", // The Mighty Boosh (TV series)
};

// Fetch JSON with exponential backoff on 429/5xx/network errors — the Wikipedia
// and Wikidata APIs throttle, and a transient miss would silently drop an item.
async function getJSON(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await sleep(1000 * 2 ** attempt);
      return getJSON(url, attempt + 1);
    }
    if (!res.ok) return null;
    return await res.json();
  } catch {
    if (attempt < 5) {
      await sleep(1000 * 2 ** attempt);
      return getJSON(url, attempt + 1);
    }
    return null;
  }
}

// --- 1. ratings dataset -> Map<tconst, numVotes> ---
async function fetchRatings() {
  const res = await fetch("https://datasets.imdbws.com/title.ratings.tsv.gz", {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`IMDb dataset ${res.status}`);
  const tsv = gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf8");
  const map = new Map();
  for (const line of tsv.split("\n")) {
    if (!line || line.startsWith("tconst")) continue;
    const tab1 = line.indexOf("\t");
    const tab2 = line.indexOf("\t", tab1 + 1);
    const tconst = line.slice(0, tab1);
    const numVotes = parseInt(line.slice(tab2 + 1), 10);
    if (tconst && Number.isFinite(numVotes)) map.set(tconst, numVotes);
  }
  return map;
}

// --- 2a. wiki slug -> Wikidata QID ---
async function wikidataId(wikiSlug) {
  let title = wikiSlug.replace(/_/g, " ");
  try {
    title = decodeURIComponent(title);
  } catch {
    /* leave as-is if the slug isn't valid percent-encoding */
  }
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("prop", "pageprops");
  url.searchParams.set("ppprop", "wikibase_item");
  url.searchParams.set("redirects", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("titles", title);
  const data = await getJSON(url);
  if (!data) return null;
  const pages = data?.query?.pages ?? {};
  for (const k of Object.keys(pages)) {
    const qid = pages[k]?.pageprops?.wikibase_item;
    if (qid) return qid;
  }
  return null;
}

// --- 2b. Wikidata QID -> IMDb id (P345) ---
const RANK = { preferred: 2, normal: 1, deprecated: 0 };
async function imdbId(qid) {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetclaims");
  url.searchParams.set("entity", qid);
  url.searchParams.set("property", "P345");
  url.searchParams.set("format", "json");
  const data = await getJSON(url);
  if (!data) return null;
  const claims = [...(data?.claims?.P345 ?? [])].sort(
    (a, b) => (RANK[b.rank] ?? 0) - (RANK[a.rank] ?? 0),
  );
  for (const c of claims) {
    const v = c?.mainsnak?.datavalue?.value;
    if (typeof v === "string" && /^tt\d+$/.test(v)) return v;
  }
  return null;
}

// --- Main ---
const ratings = await fetchRatings();
console.log(`✓ IMDb ratings dataset: ${ratings.size} titles\n`);

// Both movies and TV rank on IMDb numVotes — same resolution, one data file.
const targets = ITEMS.filter((i) => i.category === "movies" || i.category === "tv");
const out = {};
const failed = [];

for (const item of targets) {
  process.stdout.write(`${item.name.slice(0, 40).padEnd(42)} `);
  await sleep(120);

  let tt = IMDB_OVERRIDES[item.id];
  if (!tt) {
    const qid = await wikidataId(item.wiki);
    if (!qid) {
      console.log("× no Wikidata item");
      failed.push({ id: item.id, reason: "no_wikidata" });
      continue;
    }
    await sleep(120);
    tt = await imdbId(qid);
    if (!tt) {
      console.log(`× no IMDb id (${qid})`);
      failed.push({ id: item.id, reason: "no_imdb_id", qid });
      continue;
    }
  }
  const numVotes = ratings.get(tt) ?? null;
  out[item.id] = { imdbId: tt, name: item.name, numVotes };
  if (numVotes == null) {
    console.log(`× ${tt} not in ratings table`);
    failed.push({ id: item.id, reason: "no_votes", imdbId: tt });
  } else {
    console.log(`${numVotes.toString().padStart(9)} votes · ${tt}`);
  }
}

const outPath = "src/lib/data/imdb-votes.json";
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(out, null, 2) + "\n");

const withVotes = Object.values(out).filter((v) => v.numVotes != null).length;
console.log(
  `\nWrote ${withVotes}/${targets.length} entries with vote counts to ${outPath}`,
);
if (failed.length) {
  console.log("\nFailures:");
  for (const f of failed) console.log(`  ${f.id}  ${f.reason}`);
}
process.exit(failed.length > 0 ? 1 : 0);
