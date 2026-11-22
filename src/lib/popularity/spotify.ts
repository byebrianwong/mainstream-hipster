// Spotify source — reads pre-scraped data from src/lib/data/spotify-listeners.json.
//
// Spotify's own Web API restricts followers/popularity/top-tracks/previews for
// new dev apps (see README), so we scrape kworb.net once and bake the numbers
// in. The runtime never calls Spotify or kworb — it just reads the JSON.
//
// Primary metric: monthly listeners, read from each artist's public Spotify
// page. Legacy fallback: daily streams from kworb's per-artist songs page,
// scaled by ~5.6 to approximate monthly listeners (rough conversion: each
// listener plays the artist ~5×/mo). Every current entry has real listeners;
// the fallback only matters for entries added without a refresh.
//
// Refresh the data with: node scripts/refresh-spotify-listeners.mjs

import type { Item } from "../types";
import type { SourceFetcher } from "./types";
import data from "../data/spotify-listeners.json";

type Entry = {
  spotifyId: string;
  name: string;
  monthlyListeners?: number | null;
  dailyStreams?: number | null;
};

const LISTENERS = data as Record<string, Entry>;
const DAILY_TO_MONTHLY = 5.6;

/** Baked monthly listeners (or the daily-streams estimate) for an item. */
export function spotifyListeners(itemId: string): number | null {
  const entry = LISTENERS[itemId];
  if (!entry) return null;
  if (entry.monthlyListeners != null) return entry.monthlyListeners;
  if (entry.dailyStreams != null)
    return Math.round(entry.dailyStreams * DAILY_TO_MONTHLY);
  return null;
}

export const spotifySource: SourceFetcher = async (item: Item) =>
  spotifyListeners(item.id);

/**
 * The Spotify artist ID we already scraped for this item, if any. Used to embed
 * a "listen to a top song" player on the reveal screen — the same baked-in JSON,
 * no extra Spotify call or auth.
 */
export function spotifyArtistId(itemId: string): string | undefined {
  return LISTENERS[itemId]?.spotifyId ?? undefined;
}
