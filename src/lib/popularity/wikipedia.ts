// Wikipedia Pageviews source.
//
// Docs: https://wikitech.wikimedia.org/wiki/Analytics/PageviewAPI
// Endpoint: /metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/{article}/monthly/{start}/{end}
// Cached 24h via Next's fetch cache.

import type { Item } from "../types";
import type { SourceFetcher } from "./types";

const BASE =
  "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents";

const USER_AGENT =
  "mainstream-hipster/0.2 (https://github.com/byebrianwong/mainstream-hipster) ranking-game";

function trailingTwelveMonths(): { start: string; end: string } {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const start = new Date(Date.UTC(end.getUTCFullYear() - 1, end.getUTCMonth(), 1));
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}0100`;
  return { start: fmt(start), end: fmt(end) };
}

export const wikipediaSource: SourceFetcher = async (item: Item) => {
  const { start, end } = trailingTwelveMonths();
  const url = `${BASE}/${item.wiki}/monthly/${start}/${end}`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Api-User-Agent": USER_AGENT },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (res.status === 404) return 0;
  if (!res.ok) throw new Error(`Wikipedia pageviews ${res.status} for ${item.wiki}`);

  const data = (await res.json()) as { items?: { views: number }[] };
  if (!data.items?.length) return 0;
  return data.items.reduce((sum, it) => sum + (it.views ?? 0), 0);
};
