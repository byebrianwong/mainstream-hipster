// Refresh monthly listeners for every entry in spotify-listeners.json.
//
// Spotify's public artist page (open.spotify.com/artist/{id}) is server-rendered
// with the exact monthly-listener count ("1,430,965 monthly listeners"), so no
// API key is needed. This replaces both earlier sources:
//   - kworb's top-2500 chart (only covers artists above ~5M listeners), and
//   - the daily-streams x5.6 estimate used for the long tail, which was a
//     rough proxy and often far off.
//
// On success an entry gets the exact monthlyListeners and its dailyStreams
// estimate is dropped. On failure the entry is left as it was.
//
//   node scripts/refresh-spotify-listeners.mjs            # every entry
//   node scripts/refresh-spotify-listeners.mjs ashe adele # only these item ids

import { readFile, writeFile } from "node:fs/promises";

const SP_PATH = "src/lib/data/spotify-listeners.json";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sp = JSON.parse(await readFile(SP_PATH, "utf8"));
const only = new Set(process.argv.slice(2));
const ids = Object.keys(sp).filter((id) => only.size === 0 || only.has(id));

async function monthlyListeners(spotifyId, attempt = 0) {
  try {
    const r = await fetch(`https://open.spotify.com/artist/${spotifyId}`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "en" },
    });
    if (r.status === 429 && attempt < 5) {
      await sleep(2000 * 2 ** attempt);
      return monthlyListeners(spotifyId, attempt + 1);
    }
    if (!r.ok) return null;
    const html = await r.text();
    const m = html.match(/([\d,]+) monthly listeners/);
    return m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
  } catch {
    if (attempt < 3) {
      await sleep(2000);
      return monthlyListeners(spotifyId, attempt + 1);
    }
    return null;
  }
}

let next = 0;
let done = 0;
const failed = [];
async function worker() {
  while (next < ids.length) {
    const id = ids[next++];
    const n = await monthlyListeners(sp[id].spotifyId);
    if (n != null) {
      sp[id].monthlyListeners = n;
      delete sp[id].dailyStreams;
    } else {
      failed.push(id);
    }
    done++;
    if (done % 50 === 0) process.stderr.write(`  ${done}/${ids.length}\n`);
    await sleep(200);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

await writeFile(SP_PATH, JSON.stringify(sp, null, 2) + "\n");
console.log(`Refreshed ${ids.length - failed.length}/${ids.length}.`);
if (failed.length) console.log(`Unchanged (fetch or parse failed): ${failed.join(", ")}`);
