// IMDb source — reads pre-scraped vote counts from src/lib/data/imdb-votes.json.
//
// `numVotes` (how many people rated a title on IMDb) is the best free signal of
// a film's mainstream reach: blockbusters pull millions of votes, arthouse
// films tens of thousands. Unlike TMDb's recency-weighted `popularity`, it's
// stable across eras — classics keep accruing votes — which is what we want for
// a "how mainstream is this" ranking. It's the movie analog of the Spotify/kworb
// chart: a free bulk source (IMDb's title.ratings.tsv export) scraped once and
// baked in, so the runtime never calls an API or needs a key.
//
// Refresh the data with: scripts/scrape-movie-data.mjs

import type { Item } from "../types";
import type { SourceFetcher } from "./types";
import data from "../data/imdb-votes.json";

type Entry = {
  imdbId: string;
  name: string;
  numVotes?: number | null;
};

const VOTES = data as Record<string, Entry>;

export const imdbSource: SourceFetcher = async (item: Item) => {
  const entry = VOTES[item.id];
  if (!entry) return null;
  return entry.numVotes ?? null;
};
