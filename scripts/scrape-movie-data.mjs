// Scrape IMDb vote counts for every movie item.
//
// IMDb's `numVotes` (how many people rated a title) is the best free signal of
// a film's mainstream reach — blockbusters pull millions of votes, arthouse
// darlings tens of thousands — and unlike TMDb's recency-weighted `popularity`
// it's stable across eras (classics keep accruing votes). It's the movie
// equivalent of kworb's Spotify chart: a free bulk source we scrape once and
// bake in, so the runtime never needs an API key.
//
// Approach:
//   1. Resolve each movie's Wikipedia slug -> Wikidata QID via the MediaWiki API
//      (follows redirects, so a slightly-off slug still lands on the right page).
//   2. Batch-query Wikidata SPARQL for each QID's IMDb ID (property P345).
//   3. Download IMDb's free title.ratings.tsv.gz bulk export (no key) and look
//      up numVotes for each resolved IMDb ID.
//
// Output: src/lib/data/imdb-votes.json
//
//   node --experimental-strip-types scripts/scrape-movie-data.mjs

import { ITEMS } from "../src/lib/items.ts";
import { writeFile, mkdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { dirname } from "node:path";

const UA =
  "mainstream-hipster/0.4 (https://github.com/byebrianwong/mainstream-hipster) movie-ranking";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- 1. Wikipedia slug -> Wikidata QID (one polite request per item) ---
async function resolveQid(wiki) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "pageprops",
    ppprop: "wikibase_item",
    redirects: "1",
    titles: decodeURIComponent(wiki).replace(/_/g, " "),
  }).toString();
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  return page?.pageprops?.wikibase_item ?? null;
}

// --- 2. Wikidata QIDs -> IMDb IDs (P345), batched via SPARQL ---
async function resolveImdbIds(qids) {
  const out = new Map();
  const BATCH = 120;
  for (let i = 0; i < qids.length; i += BATCH) {
    const slice = qids.slice(i, i + BATCH);
    const values = slice.map((q) => `wd:${q}`).join(" ");
    const query = `SELECT ?item ?imdb WHERE { VALUES ?item { ${values} } ?item wdt:P345 ?imdb . }`;
    const res = await fetch("https://query.wikidata.org/sparql", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        Accept: "application/sparql-results+json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ query }).toString(),
    });
    if (!res.ok) throw new Error(`Wikidata SPARQL ${res.status}`);
    const data = await res.json();
    for (const b of data.results.bindings) {
      const qid = b.item.value.split("/").pop();
      const imdb = b.imdb.value;
      // Only keep film IMDb ids (tt…), and the first one per item.
      if (imdb.startsWith("tt") && !out.has(qid)) out.set(qid, imdb);
    }
    await sleep(300);
  }
  return out;
}

// --- 3. IMDb bulk ratings: tconst -> numVotes (filtered to the ids we need) ---
async function fetchVotes(neededTconsts) {
  const res = await fetch("https://datasets.imdbws.com/title.ratings.tsv.gz", {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`IMDb dataset ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const text = gunzipSync(buf).toString("utf8");
  const votes = new Map();
  for (const line of text.split("\n")) {
    const tab = line.indexOf("\t");
    if (tab < 0) continue;
    const tconst = line.slice(0, tab);
    if (!neededTconsts.has(tconst)) continue;
    // tconst \t averageRating \t numVotes
    const parts = line.split("\t");
    const n = parseInt(parts[2], 10);
    if (n > 0) votes.set(tconst, n);
  }
  return votes;
}

// --- Main ---
const movies = ITEMS.filter((i) => i.category === "movies");
console.log(`Resolving ${movies.length} movies…\n`);

// Step 1: QIDs
const qidByItem = new Map();
const noQid = [];
for (const item of movies) {
  await sleep(120);
  const qid = await resolveQid(item.wiki);
  if (qid) {
    qidByItem.set(item.id, qid);
  } else {
    noQid.push(item.id);
    console.log(`  × no Wikidata QID: ${item.id} (wiki=${item.wiki})`);
  }
}
console.log(`✓ ${qidByItem.size}/${movies.length} resolved to a QID\n`);

// Step 2: IMDb ids
const imdbByQid = await resolveImdbIds([...new Set(qidByItem.values())]);
console.log(`✓ ${imdbByQid.size} QIDs carry an IMDb ID\n`);

// Step 3: vote counts
const neededTconsts = new Set(imdbByQid.values());
const votesByTconst = await fetchVotes(neededTconsts);
console.log(`✓ ${votesByTconst.size}/${neededTconsts.size} IMDb ids found in the ratings export\n`);

const out = {};
const failed = [];
for (const item of movies) {
  const qid = qidByItem.get(item.id);
  const imdbId = qid ? imdbByQid.get(qid) : null;
  const numVotes = imdbId ? votesByTconst.get(imdbId) : null;
  if (imdbId && numVotes != null) {
    out[item.id] = { imdbId, name: item.name, numVotes };
    console.log(`${item.name.padEnd(42)} ${numVotes.toString().padStart(9)}  ${imdbId}`);
  } else {
    failed.push({
      id: item.id,
      reason: !qid ? "no_qid" : !imdbId ? "no_imdb_id" : "no_votes",
    });
  }
}

const outPath = "src/lib/data/imdb-votes.json";
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(out, null, 2) + "\n");

console.log(`\nWrote ${Object.keys(out).length}/${movies.length} entries to ${outPath}`);
if (failed.length) {
  console.log("\nFailures:");
  for (const f of failed) console.log(`  ${f.id.padEnd(34)} ${f.reason}`);
}
process.exit(failed.length > 0 ? 1 : 0);
