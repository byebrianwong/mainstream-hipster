// Popularity-source types.
//
// Each source returns a single number per item: the raw value of whatever
// metric the source measures (Spotify followers, Wikipedia pageviews, etc).
// Within a round we *rank* items per source, then blend the ranks using
// per-category weights. See ./blend.ts.

import type { Category, Item } from "../types";

export type SourceName = "wikipedia" | "spotify" | "lastfm" | "tmdb";

/** Raw values from each source for a single item. */
export type Signals = Partial<Record<SourceName, number>>;

/** Function that fetches a raw value for one item from one source. */
export type SourceFetcher = (item: Item) => Promise<number | null>;

/** What weight does each source carry, per category? Weights need not sum to 1. */
export type CategoryWeights = Partial<Record<SourceName, number>>;

export const CATEGORY_WEIGHTS: Record<Category, CategoryWeights> = {
  music:   { lastfm: 0.5, wikipedia: 0.5 },
  movies:  { tmdb: 0.5, wikipedia: 0.5 },
  tv:      { tmdb: 0.5, wikipedia: 0.5 },
  books:   { wikipedia: 1 },
  food:    { wikipedia: 1 },
  cities:  { wikipedia: 1 },
  drinks:  { wikipedia: 1 },
  brands:  { wikipedia: 1 },
  hobbies: { wikipedia: 1 },
  tech:    { wikipedia: 1 },
  animals: { wikipedia: 1 },
};

/** Which sources we need to query, for a given category. */
export function sourcesFor(category: Category | "mixed"): SourceName[] {
  if (category === "mixed") return ["wikipedia"];
  return Object.keys(CATEGORY_WEIGHTS[category]) as SourceName[];
}

/** Pretty label + units for each source — used in the reveal UI. */
export const SOURCE_LABEL: Record<SourceName, { label: string; unit: string }> = {
  wikipedia: { label: "Wikipedia", unit: "pageviews" },
  spotify:   { label: "Spotify",   unit: "followers" },
  lastfm:    { label: "Last.fm",   unit: "listeners" },
  tmdb:      { label: "TMDb",      unit: "popularity" },
};

/**
 * Canonical display order for signal badges. Category-specific sources
 * appear first (they're the "interesting" signal for that category),
 * Wikipedia last as the universal baseline. Without this the order is
 * whatever fetch happened to resolve first.
 */
export const SIGNAL_DISPLAY_ORDER: SourceName[] = [
  "lastfm",
  "tmdb",
  "spotify",
  "wikipedia",
];
