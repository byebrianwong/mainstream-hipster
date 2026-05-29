// IMDb source (movies + TV) — reads pre-scraped vote counts from
// src/lib/data/imdb-votes.json.
//
// IMDb has no free public search API, but it publishes a free daily dataset
// (https://datasets.imdbws.com/title.ratings.tsv.gz) listing every title's
// average rating and *number of votes*. `numVotes` — how many people rated a
// title — is the best free, stable mainstream-reach proxy: blockbusters and
// megahits pull millions of votes, arthouse films and cult shows tens of
// thousands. Unlike TMDb's recency-weighted `popularity`, it holds across eras
// (classics keep accruing votes).
//
// We resolve each movie/show's IMDb id from its Wikipedia slug via Wikidata
// (no API key), look up numVotes in the dataset, and bake the numbers in. The
// runtime never calls IMDb — it just reads the JSON, keyed by item id, so the
// same source serves both the movies and tv categories.
//
// Refresh the data with: scripts/scrape-imdb-data.mjs

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
