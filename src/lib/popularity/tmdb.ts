// TMDb (The Movie Database) source.
//
// Free API, requires API key (https://www.themoviedb.org/settings/api).
// Returns the show's/movie's `popularity` score — TMDb's own recency-weighted
// metric that updates daily. Numerically arbitrary (often 5–500 range) but
// monotonic and well-suited for ranking comparison within a round.
//
// Requires:
//   - Each movie/tv Item to carry a `tmdbId` (number)
//   - Each Item to indicate type via category (movies → /movie/, tv → /tv/)
//   - TMDB_API_KEY env var

import type { Item } from "../types";
import type { SourceFetcher } from "./types";

const API_BASE = "https://api.themoviedb.org/3";

export const tmdbSource: SourceFetcher = async (item: Item) => {
  if (!item.tmdbId) return null;
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;

  const kind = item.category === "movies" ? "movie" : "tv";
  const res = await fetch(
    `${API_BASE}/${kind}/${item.tmdbId}?api_key=${key}`,
    { next: { revalidate: 60 * 60 * 24 } },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(`TMDb ${res.status} for ${kind}/${item.tmdbId}`);
    return null;
  }
  const data = (await res.json()) as { popularity?: number };
  return data.popularity ?? 0;
};
