// IMDb source (TV) — reads pre-scraped data from src/lib/data/imdb-votes.json.
//
// IMDb has no free public search API, but it publishes a free daily dataset
// (https://datasets.imdbws.com/title.ratings.tsv.gz) listing every title's
// average rating and *number of votes*. numVotes — how many users bothered to
// rate a show — is a stable, interpretable mainstream-popularity proxy: a
// megahit pulls millions of votes, a cult favorite tens of thousands.
//
// We resolve each TV item's IMDb id from its Wikipedia slug via Wikidata
// (no API key), look up numVotes in the dataset, and bake the numbers in.
// The runtime never calls IMDb — it just reads the JSON.
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
  if (!entry || entry.numVotes == null) return null;
  return entry.numVotes;
};
