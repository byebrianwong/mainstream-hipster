// Wikipedia Pageviews API client.
//
// Docs: https://wikitech.wikimedia.org/wiki/Analytics/PageviewAPI
// Endpoint pattern:
//   /metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/{article}/monthly/{startYYYYMMDD00}/{endYYYYMMDD00}
//
// Cached via fetch's built-in Next.js cache for 24h. Pageview data updates daily.

const BASE =
  "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents";

const USER_AGENT = "mainstream-hipster/0.1 (https://github.com/) ranking-game";

// Trailing-12-months window. Computed at module load — fine for a server that
// restarts on deploy. Wikipedia rejects current/future months.
function trailingTwelveMonths(): { start: string; end: string } {
  const now = new Date();
  // Use the first day of the month two months ago as `end` to guarantee complete data.
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const start = new Date(Date.UTC(end.getUTCFullYear() - 1, end.getUTCMonth(), 1));
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}0100`;
  return { start: fmt(start), end: fmt(end) };
}

export async function fetchMonthlyViews(wikiTitle: string): Promise<number> {
  const { start, end } = trailingTwelveMonths();
  const url = `${BASE}/${wikiTitle}/monthly/${start}/${end}`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Api-User-Agent": USER_AGENT },
    next: { revalidate: 60 * 60 * 24 }, // 24h
  });

  if (!res.ok) {
    // 404 happens for very obscure articles or wrong slugs — return 0 so the game
    // can degrade gracefully rather than crash.
    if (res.status === 404) return 0;
    throw new Error(`Wikipedia pageviews ${res.status} for ${wikiTitle}`);
  }

  const data = (await res.json()) as { items?: { views: number }[] };
  if (!data.items?.length) return 0;
  return data.items.reduce((sum, it) => sum + (it.views ?? 0), 0);
}

export async function fetchManyViews(
  wikiTitles: string[],
): Promise<Record<string, number>> {
  const entries = await Promise.all(
    wikiTitles.map(async (t) => [t, await fetchMonthlyViews(t)] as const),
  );
  return Object.fromEntries(entries);
}
