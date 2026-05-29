// Scrape Open Library reading-log counts for every book item.
//
// Open Library's search API returns `readinglog_count` per work: the number of
// users who have shelved it (want-to-read + currently-reading + already-read).
// It's the best free, keyless, Goodreads-shelf-like popularity signal for books.
//
// Matching is the hard part — many books share a title with a companion/summary,
// a play, or an unrelated work. So we disambiguate by AUTHOR: resolve each book's
// author from its Wikipedia slug via Wikidata (P50, no API key), then prefer the
// Open Library work whose author + title both match. Falls back through looser
// tiers and flags any low-confidence pick for review.
//
// Output: src/lib/data/openlibrary-counts.json  (keyed by item id)
//
//   node --experimental-strip-types scripts/scrape-openlibrary-data.mjs

import { ITEMS } from "../src/lib/items.ts";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const UA =
  "mainstream-hipster/0.4 (https://github.com/byebrianwong/mainstream-hipster) data-scrape";
const FIELDS =
  "key,title,author_name,readinglog_count,want_to_read_count,already_read_count,ratings_count,edition_count,first_publish_year";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch JSON with exponential backoff on 429/5xx/network errors. Wikipedia,
// Wikidata, and Open Library all throttle; a transient miss would silently
// drop an item or mis-resolve its author.
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

// Books whose author/title can't be auto-resolved cleanly — pin the OL work key.
// readinglog count is then read from /works/<key>/bookshelves.json. These are
// mostly cases where OL's canonical work lists the author in the original script
// (so author-match misses it) or the title search resolves to a series/box-set.
const OL_OVERRIDES = {
  "the-wind-up-bird-chronicle": "/works/OL2625412W", // canonical work lists 村上春樹
  "the-memory-police": "/works/OL11690127W", // canonical lists 小川洋子
  "the-tin-drum": "/works/OL67334W", // Die Blechtrommel (canonical)
  "the-lightning-thief": "/works/OL492658W", // individual book, not the series page
  "my-struggle-knausgard": "/works/OL16415706W", // Book One, not Book Three
};

const norm = (s) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// --- Author via Wikipedia slug -> Wikidata QID -> P50 -> label(s) ---
async function wikidataQID(wikiSlug) {
  let title = wikiSlug.replace(/_/g, " ");
  try {
    title = decodeURIComponent(title);
  } catch {}
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    prop: "pageprops",
    ppprop: "wikibase_item",
    redirects: "1",
    format: "json",
    titles: title,
  });
  const data = await getJSON(url);
  const pages = data?.query?.pages ?? {};
  for (const k of Object.keys(pages)) {
    const qid = pages[k]?.pageprops?.wikibase_item;
    if (qid) return qid;
  }
  return null;
}

async function wikidata(params) {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.search = new URLSearchParams({ format: "json", ...params });
  return getJSON(url);
}

async function authorsFor(wikiSlug) {
  const qid = await wikidataQID(wikiSlug);
  if (!qid) return [];
  await sleep(100);
  const claims = await wikidata({
    action: "wbgetclaims",
    entity: qid,
    property: "P50",
  });
  const ids = (claims?.claims?.P50 ?? [])
    .map((c) => c?.mainsnak?.datavalue?.value?.id)
    .filter(Boolean);
  if (!ids.length) return [];
  await sleep(100);
  const ent = await wikidata({
    action: "wbgetentities",
    ids: ids.join("|"),
    props: "labels",
    languages: "en",
  });
  return ids
    .map((id) => ent?.entities?.[id]?.labels?.en?.value)
    .filter(Boolean);
}

// --- Open Library ---
async function olSearch(params) {
  const url = new URL("https://openlibrary.org/search.json");
  url.search = new URLSearchParams({ ...params, fields: FIELDS, limit: "15" });
  const data = await getJSON(url);
  return data?.docs ?? [];
}

async function bookshelvesCount(workKey) {
  const data = await getJSON(`https://openlibrary.org${workKey}/bookshelves.json`);
  if (!data) return null;
  const c = data.counts ?? {};
  return (c.want_to_read ?? 0) + (c.currently_reading ?? 0) + (c.already_read ?? 0);
}

const bareTitle = (name) => name.replace(/\s*\([^)]*\)\s*$/, "").trim();
const readers = (d) => d.readinglog_count ?? 0;
const maxBy = (arr) => arr.reduce((b, d) => (readers(d) > readers(b) ? d : b));

function authorMatch(doc, authors) {
  if (!authors.length) return false;
  const da = (doc.author_name ?? []).map(norm);
  return authors.some((a) => {
    const na = norm(a);
    const surname = na.split(" ").pop();
    return da.some(
      (d) => d.includes(na) || (surname && surname.length >= 4 && d.includes(surname)),
    );
  });
}

// The canonical OL "work" merges all editions/translations and has by far the
// most editions — but its title is often the ORIGINAL language ("O Alquimista",
// not "The Alchemist"), and English-titled duplicate works carry near-zero
// counts. So title matching is unreliable; author match + max edition_count
// finds the canonical work, whose readinglog_count is the true shelving total.
function canonical(pool) {
  return pool.reduce((b, d) => {
    const be = b.edition_count ?? 0;
    const de = d.edition_count ?? 0;
    if (de !== be) return de > be ? d : b;
    return readers(d) > readers(b) ? d : b;
  });
}

function select(docs, wanted, authors) {
  if (!docs.length) return null;
  const byAuthor = authors.length ? docs.filter((d) => authorMatch(d, authors)) : [];
  if (byAuthor.length) return { doc: canonical(byAuthor), tier: 0 };

  // No author match (author unresolved, or an anthology) — fall back to title.
  const wt = norm(wanted);
  const wtNoSub = norm(wanted.split(":")[0]);
  const titleish = docs.filter((d) => {
    const t = norm(d.title);
    return [wt, wtNoSub].includes(t) || t.startsWith(wt) || wt.startsWith(t);
  });
  return {
    doc: canonical(titleish.length ? titleish : docs),
    tier: titleish.length ? 3 : 5,
  };
}

// --- Main ---
const books = ITEMS.filter((i) => i.category === "books");
const out = {};
const failed = [];
const lowConfidence = [];

for (const item of books) {
  process.stdout.write(`${item.name.slice(0, 36).padEnd(38)} `);
  await sleep(120);

  // Manual override: pin the work, read its shelf counts directly.
  if (OL_OVERRIDES[item.id]) {
    const key = OL_OVERRIDES[item.id];
    const count = await bookshelvesCount(key);
    out[item.id] = { workKey: key, title: item.name, author: null, readinglogCount: count };
    console.log(`${(count ?? 0).toString().padStart(7)} readers · [override ${key}]`);
    continue;
  }

  const authors = await authorsFor(item.wiki);
  await sleep(120);

  const title = bareTitle(item.name);
  const q = authors.length ? `${title} ${authors[0]}` : title;
  let docs = await olSearch({ q });
  let pick = select(docs, title, authors);
  // Retry on the title field if the q search whiffed (tier-5 / nothing).
  if (!pick || pick.tier >= 5) {
    await sleep(300);
    const more = await olSearch({ title });
    const merged = [...docs, ...more];
    const better = select(merged, title, authors);
    if (better) pick = better;
    docs = merged;
  }

  if (!pick) {
    console.log("× no match");
    failed.push({ id: item.id, reason: "no_match" });
    continue;
  }
  const d = pick.doc;
  const count = d.readinglog_count ?? null;
  out[item.id] = {
    workKey: d.key,
    title: d.title,
    author: d.author_name?.[0] ?? null,
    readinglogCount: count,
  };
  const flag = pick.tier >= 3 ? ` ⚠tier${pick.tier}` : "";
  console.log(
    `${(count ?? 0).toString().padStart(7)} readers · ${d.title?.slice(0, 32)}${d.author_name?.[0] ? " · " + d.author_name[0] : ""}${flag}`,
  );
  if (pick.tier >= 3) lowConfidence.push({ id: item.id, title: d.title, author: d.author_name?.[0], tier: pick.tier });
  if (count == null) failed.push({ id: item.id, reason: "no_count" });
}

const outPath = "src/lib/data/openlibrary-counts.json";
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(out, null, 2) + "\n");

const withCounts = Object.values(out).filter((v) => v.readinglogCount != null).length;
console.log(`\nWrote ${withCounts}/${books.length} entries with reading-log counts to ${outPath}`);
if (lowConfidence.length) {
  console.log(`\nLow-confidence matches (review these):`);
  for (const l of lowConfidence) console.log(`  ${l.id}  tier${l.tier}  -> ${l.title} · ${l.author}`);
}
if (failed.length) {
  console.log(`\nFailures:`);
  for (const f of failed) console.log(`  ${f.id}  ${f.reason}`);
}
process.exit(0);
