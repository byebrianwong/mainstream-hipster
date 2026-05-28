// Last.fm source.
//
// API docs: https://www.last.fm/api/show/artist.getInfo
// Endpoint: GET https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=NAME&api_key=KEY&format=json
//
// Returns the artist's total unique listeners (people who have ever scrobbled
// the artist on Last.fm). This is a stronger signal than Spotify followers:
//   - Spotify follower = "I clicked follow once" (passive intent)
//   - Last.fm listener = "I played their music at least once with a scrobbler
//     attached" (actual listening behavior)
//
// Skews toward dedicated/engaged listeners — Last.fm users are music nerds.
// Which is exactly the right vibe for a hipster/mainstream taste game.

import type { Item } from "../types";
import type { SourceFetcher } from "./types";

const BASE = "https://ws.audioscrobbler.com/2.0/";

export const lastfmSource: SourceFetcher = async (item: Item) => {
  const key = process.env.LASTFM_API_KEY;
  if (!key) return null;

  // Prefer MBID if present (unambiguous); else use artist name (Last.fm does
  // fuzzy matching to canonical artist).
  const params = new URLSearchParams({
    method: "artist.getinfo",
    api_key: key,
    format: "json",
    autocorrect: "1",
  });
  if (item.musicbrainzId) params.set("mbid", item.musicbrainzId);
  else params.set("artist", item.name);

  const res = await fetch(`${BASE}?${params}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    console.error(`Last.fm ${res.status} for ${item.name}`);
    return null;
  }

  const data = (await res.json()) as {
    artist?: { stats?: { listeners?: string; playcount?: string } };
    error?: number;
    message?: string;
  };

  if (data.error || !data.artist?.stats?.listeners) {
    if (data.error) console.error(`Last.fm error ${data.error} for ${item.name}: ${data.message}`);
    return null;
  }

  return parseInt(data.artist.stats.listeners, 10) || null;
};
