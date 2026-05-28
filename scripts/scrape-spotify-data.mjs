// Scrape Spotify monthly listeners for every music item.
//
// Approach (much better than per-artist scraping):
//   1. ONE fetch of kworb.net/spotify/listeners.html — the top 2500 artists
//      ranked by current monthly listeners. Cache the whole table.
//   2. For each music item, use Spotify's /v1/search to resolve a canonical
//      artist ID, then look it up in the chart table.
//   3. For items outside the top 2500, fall back to their individual songs page
//      and grab "Daily" streams as a proxy. Store both fields — runtime decides.
//
// Output: src/lib/data/spotify-listeners.json
//
//   SPOTIFY_CLIENT_ID=… SPOTIFY_CLIENT_SECRET=… \
//   node --experimental-strip-types scripts/scrape-spotify-data.mjs

import { ITEMS } from "../src/lib/items.ts";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const SPOTIFY_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
if (!SPOTIFY_ID || !SPOTIFY_SECRET) {
  console.error("SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET required");
  process.exit(2);
}

const UA =
  "mainstream-hipster/0.3 (https://github.com/byebrianwong/mainstream-hipster)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- Spotify token ---
async function getToken() {
  const auth = Buffer.from(`${SPOTIFY_ID}:${SPOTIFY_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Spotify auth ${res.status}`);
  return (await res.json()).access_token;
}

async function searchArtist(token, name) {
  const url = new URL("https://api.spotify.com/v1/search");
  url.searchParams.set("q", name);
  url.searchParams.set("type", "artist");
  url.searchParams.set("limit", "5");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const items = data.artists?.items ?? [];
  return items.length ? { id: items[0].id, name: items[0].name } : null;
}

// --- kworb chart parse: build {spotifyId → monthlyListeners} from one HTML fetch ---
async function fetchChart() {
  const res = await fetch("https://kworb.net/spotify/listeners.html", {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`kworb chart ${res.status}`);
  const html = await res.text();
  // Each row: <a href="artist/{ID}_songs.html">{name}</a></div></td><td>{listeners}</td>
  const rows = html.matchAll(
    /artist\/([A-Za-z0-9]+)_songs\.html">([^<]+)<\/a><\/div><\/td><td>([\d,]+)<\/td>/g,
  );
  const map = new Map();
  for (const m of rows) {
    const [, id, name, listenersStr] = m;
    const listeners = parseInt(listenersStr.replace(/,/g, ""), 10);
    if (listeners > 0) map.set(id, { name, monthlyListeners: listeners });
  }
  return map;
}

// --- kworb per-artist fallback: get "Daily" streams from songs page ---
async function fetchDailyStreams(spotifyId) {
  const res = await fetch(
    `https://kworb.net/spotify/artist/${spotifyId}_songs.html`,
    { headers: { "User-Agent": UA } },
  );
  if (!res.ok) return null;
  const html = await res.text();
  // <tr><td class="text">Daily</td><td>{N}</td>...
  const m = html.match(
    /<tr><td class="text">Daily<\/td><td>([\d,]+)<\/td>/,
  );
  if (!m) return null;
  return parseInt(m[1].replace(/,/g, ""), 10) || null;
}

// --- Main ---
const token = await getToken();
console.log("✓ Spotify token");

const chart = await fetchChart();
console.log(`✓ kworb chart: ${chart.size} artists\n`);

const music = ITEMS.filter((i) => i.category === "music");
const out = {};
const failed = [];

for (const item of music) {
  process.stdout.write(`${item.name.padEnd(38)} `);
  await sleep(120);

  const match = await searchArtist(token, item.name);
  if (!match) {
    console.log("× no Spotify match");
    failed.push({ id: item.id, reason: "no_spotify_match" });
    continue;
  }
  const entry = chart.get(match.id);

  if (entry) {
    out[item.id] = {
      spotifyId: match.id,
      name: match.name,
      monthlyListeners: entry.monthlyListeners,
    };
    console.log(
      `${entry.monthlyListeners.toString().padStart(11)} monthly · ${match.name}`,
    );
  } else {
    // Not in top 2500 — try the per-artist daily streams fallback.
    await sleep(800);
    const daily = await fetchDailyStreams(match.id);
    if (daily != null) {
      out[item.id] = {
        spotifyId: match.id,
        name: match.name,
        monthlyListeners: null,
        dailyStreams: daily,
      };
      console.log(
        `${daily.toString().padStart(11)} daily   · ${match.name} (long tail)`,
      );
    } else {
      console.log(`× no data (id=${match.id}) ${match.name}`);
      failed.push({ id: item.id, reason: "no_kworb_data", spotifyId: match.id });
    }
  }
}

const outPath = "src/lib/data/spotify-listeners.json";
await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(out, null, 2) + "\n");

const withMonthly = Object.values(out).filter((v) => v.monthlyListeners != null).length;
const withDailyOnly = Object.values(out).filter((v) => v.monthlyListeners == null && v.dailyStreams != null).length;

console.log(`\nResults: ${withMonthly} with monthly listeners, ${withDailyOnly} with daily-only fallback, ${failed.length} failed`);
console.log(`Wrote ${Object.keys(out).length}/${music.length} entries to ${outPath}`);

if (failed.length) {
  console.log("\nFailures:");
  for (const f of failed) console.log(`  ${f.id}  ${f.reason}`);
}

process.exit(failed.length > 0 ? 1 : 0);
