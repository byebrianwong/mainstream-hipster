// Rank-based weighted blending.
//
// Each source returns numbers on its own scale (Spotify followers in millions,
// Wikipedia in pageviews, TMDb popularity in arbitrary units). Naive averaging
// is dominated by whichever scale is bigger. Instead, within a round we:
//   1. rank items per source (0 = most hipster, n-1 = most mainstream)
//   2. compute a weighted average of those ranks per item
//   3. sort by the weighted-average rank
//
// This is Borda count with weights. "50% weight on Spotify, 50% on Wikipedia"
// means the two sources' ranks are averaged with equal influence.

import type { Item } from "../types";
import type {
  CategoryWeights,
  Signals,
  SourceFetcher,
  SourceName,
} from "./types";
import { wikipediaSource } from "./wikipedia";
import { spotifySource } from "./spotify";
import { lastfmSource } from "./lastfm";
import { tmdbSource } from "./tmdb";

export const SOURCES: Record<SourceName, SourceFetcher> = {
  wikipedia: wikipediaSource,
  spotify: spotifySource,
  lastfm: lastfmSource,
  tmdb: tmdbSource,
};

/** Fetch every signal listed in `weights` for every item, in parallel. */
export async function fetchSignals(
  items: Item[],
  weights: CategoryWeights,
): Promise<Map<string, Signals>> {
  const sources = Object.keys(weights) as SourceName[];
  const out = new Map<string, Signals>();
  for (const item of items) out.set(item.id, {});

  await Promise.all(
    sources.flatMap((source) =>
      items.map(async (item) => {
        try {
          const value = await SOURCES[source](item);
          if (value != null) out.get(item.id)![source] = value;
        } catch (e) {
          console.error(`source=${source} item=${item.id}`, e);
        }
      }),
    ),
  );
  return out;
}

/**
 * Given each item's raw signals and the category's weights, return a Map of
 * itemId → blended score in [0,1] (lower = more hipster, higher = more
 * mainstream).
 *
 * Uses min-max normalization per source within the round, then weighted-
 * averages those normalized values. This preserves *magnitude* gaps between
 * items (e.g., Billie's 84M Spotify vs Fleetwood's 53M is a real spread)
 * rather than collapsing everything to ranks 0..n-1, which throws away the
 * size of each gap and produces frequent ties when sources disagree.
 *
 * Sources not present for an item don't contribute (and weights renormalize
 * across the sources that *did* contribute).
 */
export function blendRanks(
  items: Item[],
  signals: Map<string, Signals>,
  weights: CategoryWeights,
): Map<string, number> {
  const sources = (Object.keys(weights) as SourceName[]).filter((s) => {
    const count = items.filter((i) => (signals.get(i.id) ?? {})[s] != null).length;
    return count >= 2; // need at least 2 to normalize
  });

  // For each usable source: min-max normalize values to [0, 1] within the round.
  const perSourceNorm: Record<SourceName, Map<string, number>> = {} as never;
  for (const source of sources) {
    const values = items
      .map((i) => ({ id: i.id, v: signals.get(i.id)?.[source] }))
      .filter((x): x is { id: string; v: number } => x.v != null);
    const nums = values.map((x) => x.v);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const range = max - min;
    const m = new Map<string, number>();
    for (const x of values) {
      // If every item has the same value, everyone gets 0.5 (no signal in this source).
      m.set(x.id, range > 0 ? (x.v - min) / range : 0.5);
    }
    perSourceNorm[source] = m;
  }

  // Per item: weighted average across the sources that have data for it.
  const result = new Map<string, number>();
  for (const item of items) {
    let weightSum = 0;
    let weightedScore = 0;
    for (const source of sources) {
      const norm = perSourceNorm[source].get(item.id);
      if (norm == null) continue;
      const w = weights[source] ?? 0;
      weightedScore += norm * w;
      weightSum += w;
    }
    // If no source has data for this item, fall back to 0.5 (middle of the road).
    result.set(item.id, weightSum > 0 ? weightedScore / weightSum : 0.5);
  }
  return result;
}
