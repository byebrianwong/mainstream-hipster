// Keyless Spotify backfill for music items missing a spotify-listeners entry.
//
// The official scrape-spotify-data.mjs needs Spotify creds only to resolve
// artist name -> canonical Spotify ID. We can get that ID without any key via
// Wikidata's "Spotify artist ID" property (P1902), since every item has a
// Wikipedia article. Chain, per missing item:
//
//   item.wiki --(Wikipedia pageprops)--> Wikidata QID
//             --(Wikidata P1902)--------> Spotify artist ID
//             --(kworb per-artist page)--> daily streams
//
// We store { spotifyId, name, monthlyListeners: null, dailyStreams }, matching
// the official scraper's long-tail format; spotify.ts scales dailyStreams x5.6.
//
// Writes the merged file in place. Run against a clean tree.
//
//   node --experimental-strip-types scripts/backfill-spotify-keyless.mjs

import { ITEMS } from "../src/lib/items.ts";
import { readFile, writeFile } from "node:fs/promises";

const UA = "mainstream-hipster/0.3 (https://github.com/byebrianwong/mainstream-hipster) backfill";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SP_PATH = "src/lib/data/spotify-listeners.json";

const sp = JSON.parse(await readFile(SP_PATH, "utf8"));
const missing = ITEMS.filter((i) => i.category === "music" && !sp[i.id]);
console.log(`music items missing spotify: ${missing.length}\n`);

async function getJSON(url, attempt = 0) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.status === 429 && attempt < 5) {
      await sleep(1000 * 2 ** attempt);
      return getJSON(url, attempt + 1);
    }
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function qid(wiki) {
  const d = await getJSON(
    `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json&titles=${wiki}`,
  );
  const pages = d?.query?.pages ?? {};
  return Object.values(pages)[0]?.pageprops?.wikibase_item ?? null;
}
async function spotifyId(q) {
  const d = await getJSON(`https://www.wikidata.org/wiki/Special:EntityData/${q}.json`);
  return d?.entities?.[q]?.claims?.P1902?.[0]?.mainsnak?.datavalue?.value ?? null;
}
async function kworbArtist(id) {
  try {
    const r = await fetch(`https://kworb.net/spotify/artist/${id}_songs.html`, { headers: { "User-Agent": UA } });
    if (!r.ok) return null;
    const h = await r.text();
    const daily = h.match(/<tr><td class="text">Daily<\/td><td>([\d,]+)<\/td>/);
    const title = h.match(/<title>([^<]+?)\s*-\s*Spotify/i);
    return {
      dailyStreams: daily ? parseInt(daily[1].replace(/,/g, ""), 10) : null,
      name: title?.[1] ?? null,
    };
  } catch {
    return null;
  }
}

// concurrency-limited worker pool
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      out[i] = await fn(items[i]);
      await sleep(150);
    }
  }
  await Promise.all(Array.from({ length: n }, worker));
  return out;
}

let done = 0;
const results = await pool(missing, 4, async (it) => {
  const q = await qid(it.wiki);
  const sid = q ? await spotifyId(q) : null;
  const k = sid ? await kworbArtist(sid) : null;
  done++;
  if (done % 20 === 0) process.stderr.write(`  ${done}/${missing.length}\n`);
  if (sid && k?.dailyStreams != null) {
    return { id: it.id, entry: { spotifyId: sid, name: k.name ?? it.name, monthlyListeners: null, dailyStreams: k.dailyStreams } };
  }
  return { id: it.id, name: it.name, fail: !sid ? "no_spotify_id" : "no_kworb_data" };
});

const recovered = results.filter((r) => r.entry);
const failed = results.filter((r) => r.fail);

for (const r of recovered) sp[r.id] = r.entry;
await writeFile(SP_PATH, JSON.stringify(sp, null, 2) + "\n");

console.log(`\nRecovered ${recovered.length}/${missing.length}. Total spotify entries now: ${Object.keys(sp).length}`);
console.log("\nSample of recovered (daily → ~monthly-equiv ×5.6):");
for (const r of recovered.slice(0, 12))
  console.log(`  ${r.entry.name.padEnd(24)} daily=${r.entry.dailyStreams.toLocaleString()}  ~${Math.round(r.entry.dailyStreams * 5.6).toLocaleString()}`);
if (failed.length) {
  console.log(`\nStill unfilled (${failed.length}):`);
  for (const f of failed) console.log(`  ${f.name}  [${f.fail}]`);
}
