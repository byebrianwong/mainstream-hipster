import type { Item } from "./types";
import { ITEMS } from "./items";
import { spotifyListeners } from "./popularity/spotify";

// Light popularity weighting for which items get drawn into a round.
//
// Rounds are still mostly random, but well-known artists come up a bit more
// often so a round isn't full of names nobody recognizes. Music artists are
// ranked by baked Spotify monthly listeners within the item bank. The bank
// covers nearly all of Spotify's top 300, so these ranks track the chart.
//
// The weight is relative to an artist outside the top 500 (weight 1).
const MUSIC_TIERS: { maxRank: number; weight: number }[] = [
  { maxRank: 100, weight: 2.0 },
  { maxRank: 200, weight: 1.6 },
  { maxRank: 300, weight: 1.3 },
  { maxRank: 500, weight: 1.1 },
];

function buildMusicWeights(): Map<string, number> {
  const ranked = ITEMS.filter((i) => i.category === "music")
    .map((i) => ({ id: i.id, listeners: spotifyListeners(i.id) ?? 0 }))
    .sort((a, b) => b.listeners - a.listeners);

  const raw = ranked.map(({ id }, i) => {
    const tier = MUSIC_TIERS.find((t) => i < t.maxRank);
    return [id, tier?.weight ?? 1] as const;
  });

  // Rescale so music weights average 1. Non-music items have weight 1, so
  // mixed rounds keep the same share of music as before; only which artists
  // show up shifts.
  const mean = raw.reduce((s, [, w]) => s + w, 0) / (raw.length || 1);
  return new Map(raw.map(([id, w]) => [id, w / mean]));
}

const MUSIC_WEIGHTS = buildMusicWeights();

/** Relative chance of an item being drawn into a round (1 = average). */
export function drawWeight(item: Item): number {
  return MUSIC_WEIGHTS.get(item.id) ?? 1;
}
