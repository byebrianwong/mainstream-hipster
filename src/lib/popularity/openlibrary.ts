// Open Library source (books) — reads pre-scraped data from
// src/lib/data/openlibrary-counts.json.
//
// Goodreads killed its API in 2020, so the best *free, official, keyless* book
// popularity signal is Open Library's reading-log count: the number of people
// who have shelved a work as want-to-read / currently-reading / already-read.
// It's a Goodreads-shelf-like measure of how widely a book is tracked — a good
// mainstream proxy (e.g. The Great Gatsby ~3185 vs Infinite Jest ~377).
//
// The search API (https://openlibrary.org/search.json) returns readinglog_count
// per work, no key required. We resolve each book by title, grab the count, and
// bake it in. The runtime never calls Open Library — it just reads the JSON.
//
// Refresh the data with: scripts/scrape-openlibrary-data.mjs

import type { Item } from "../types";
import type { SourceFetcher } from "./types";
import data from "../data/openlibrary-counts.json";

type Entry = {
  workKey: string;
  title: string;
  readinglogCount?: number | null;
};

const COUNTS = data as Record<string, Entry>;

export const openlibrarySource: SourceFetcher = async (item: Item) => {
  const entry = COUNTS[item.id];
  if (!entry || entry.readinglogCount == null) return null;
  return entry.readinglogCount;
};
