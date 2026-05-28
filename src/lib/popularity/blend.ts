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
 * itemId → blended rank score (lower = more hipster).
 *
 * For each source actually present on >=2 items in the round, we:
 *   - rank items 0..k-1 by raw value within the round (tie-broken arbitrarily)
 *   - normalize ranks to 0..1 so different roundSizes mix cleanly with weights
 *   - weight by `weights[source]` and sum
 * Sources not present for an item don't contribute (and weights renormalize
 * across the sources that *did* contribute to that item).
 */
export function blendRanks(
  items: Item[],
  signals: Map<string, Signals>,
  weights: CategoryWeights,
): Map<string, number> {
  const sources = (Object.keys(weights) as SourceName[]).filter((s) => {
    const count = items.filter((i) => (signals.get(i.id) ?? {})[s] != null).length;
    return count >= 2; // need at least 2 to rank
  });

  // For each usable source, compute normalized rank per item.
  const perSourceNorm: Record<SourceName, Map<string, number>> = {} as never;
  for (const source of sources) {
    const withValue = items
      .map((i) => ({ id: i.id, v: signals.get(i.id)?.[source] }))
      .filter((x): x is { id: string; v: number } => x.v != null)
      .sort((a, b) => a.v - b.v);
    const k = withValue.length;
    const m = new Map<string, number>();
    withValue.forEach((x, idx) => {
      // Normalize to [0, 1]. k==1 case skipped above.
      m.set(x.id, k > 1 ? idx / (k - 1) : 0);
    });
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
