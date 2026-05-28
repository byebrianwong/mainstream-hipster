// Verify Last.fm returns listener data for every music item.
// Flags artists that need a MusicBrainz ID for disambiguation.
//
//   LASTFM_API_KEY=... node --experimental-strip-types scripts/verify-lastfm.mjs

import { ITEMS } from "../src/lib/items.ts";

const KEY = process.env.LASTFM_API_KEY;
if (!KEY) {
  console.error("LASTFM_API_KEY not set");
  process.exit(2);
}

const music = ITEMS.filter((i) => i.category === "music");

async function lookup(name) {
  const url = new URL("https://ws.audioscrobbler.com/2.0/");
  url.searchParams.set("method", "artist.getinfo");
  url.searchParams.set("artist", name);
  url.searchParams.set("api_key", KEY);
  url.searchParams.set("format", "json");
  url.searchParams.set("autocorrect", "1");
  const res = await fetch(url);
  if (!res.ok) return { ok: false, status: res.status };
  const data = await res.json();
  if (data.error)
    return { ok: false, error: data.error, message: data.message };
  if (!data.artist?.stats?.listeners) return { ok: false, error: "no_stats" };
  return {
    ok: true,
    canonicalName: data.artist.name,
    mbid: data.artist.mbid || null,
    listeners: parseInt(data.artist.stats.listeners, 10),
    playcount: parseInt(data.artist.stats.playcount, 10),
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const rows = [];
for (const item of music) {
  const r = await lookup(item.name);
  rows.push({ item, ...r });
  await sleep(200); // 5 req/s — conservative
}

// Sort by listeners desc for a readable summary.
const ok = rows.filter((r) => r.ok).sort((a, b) => b.listeners - a.listeners);
const bad = rows.filter((r) => !r.ok);
const renamed = ok.filter((r) => r.canonicalName !== r.item.name);

console.log(`\n${music.length} music items checked: ${ok.length} ok, ${bad.length} failed\n`);
console.log("Listeners (mainstream → hipster):");
for (const r of ok) {
  const flag = r.canonicalName !== r.item.name ? ` ← renamed to "${r.canonicalName}"` : "";
  console.log(`  ${r.listeners.toString().padStart(10)} listeners · ${r.item.name}${flag}`);
}

if (renamed.length) {
  console.log(`\n${renamed.length} items got renamed by autocorrect (may indicate ambiguity):`);
  for (const r of renamed) {
    console.log(`  "${r.item.name}" → "${r.canonicalName}"  mbid=${r.mbid ?? "(none)"}`);
  }
}

if (bad.length) {
  console.log(`\nFAILED:`);
  for (const r of bad) {
    console.log(`  ${r.item.name}  ${JSON.stringify(r)}`);
  }
}

process.exit(bad.length > 0 ? 1 : 0);
