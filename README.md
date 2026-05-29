# Mainstream / Hipster

A ranking game: drag 2–5 things from most hipster to most mainstream. Real popularity comes from a per-category blend of public signals — English Wikipedia pageviews plus a category-specific source (Spotify, Last.fm, TMDb, IMDb, or Open Library).

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's where

```
src/
  lib/
    items.ts            # Curated item bank — names + Wikipedia article slugs
    game.ts             # Round generation + Kendall-tau pair scoring
    types.ts
    popularity/         # Pluggable popularity sources + weighted blending
      wikipedia.ts spotify.ts lastfm.ts tmdb.ts imdb.ts openlibrary.ts
      blend.ts          #   min-max normalize per source, then weighted-average
      types.ts          #   SourceName, per-category weights, display labels
    data/               # Pre-scraped numbers baked in (spotify / imdb / openlibrary)
  app/
    page.tsx           # Landing: category picker
    play/page.tsx      # Game shell (reads ?category=&size=)
    play/GameClient.tsx, Card.tsx, SortableCard.tsx, Reveal.tsx
    api/round/route.ts # GET /api/round?category=music&size=4 -> { items: ScoredItem[] }
```

## How scoring works

Concordant-pair fraction (a Kendall-tau variant, normalized to 0–1). For *n* items there are *C(n,2)* pairs; you get credit for every pair you ordered correctly relative to the actual popularity ranking. So in a 4-item round, perfect is 6/6 = 100%; swapping two adjacent items is 5/6 ≈ 83%.

## Popularity sources

The "actual" ranking is a weighted blend of public popularity signals, chosen per category. Each source returns a raw number on its own scale; within a round we min-max normalize each source to [0, 1] and take a weighted average (see [src/lib/popularity/blend.ts](src/lib/popularity/blend.ts)). Weights live in [src/lib/popularity/types.ts](src/lib/popularity/types.ts):

| Category | Source (weight) | + Wikipedia |
| --- | --- | --- |
| Music | Spotify monthly listeners (0.5), Last.fm listeners (0.1) | 0.4 |
| Movies | TMDb popularity (0.5) | 0.5 |
| **TV** | **IMDb number of ratings (0.6)** | **0.4** |
| **Books** | **Open Library reading-log count (0.6)** | **0.4** |
| Everything else | — | 1.0 |

**TV → IMDb** and **Books → Open Library** are both free and need no API key. IMDb publishes a [daily ratings dataset](https://datasets.imdbws.com/) (`numVotes` is a great mainstream proxy); we resolve each show's IMDb id from its Wikipedia slug via Wikidata, then look up its vote count. Open Library's [search API](https://openlibrary.org/dev/docs/api/search) returns `readinglog_count` (how many people have shelved a book) — the best free Goodreads-shelf-like signal.

Both are pre-scraped and baked into `src/lib/data/` so the runtime makes no extra calls. Refresh them with:

```bash
node --experimental-strip-types scripts/scrape-imdb-data.mjs        # → data/imdb-votes.json
node --experimental-strip-types scripts/scrape-openlibrary-data.mjs # → data/openlibrary-counts.json
```

Music's Spotify numbers come from `scripts/scrape-spotify-data.mjs` (kworb). Last.fm and TMDb are live API calls gated on `LASTFM_API_KEY` / `TMDB_API_KEY` (see [.env.example](.env.example)); a source with no data for an item simply drops out and the remaining weights renormalize.

## Adding items

Edit [src/lib/items.ts](src/lib/items.ts). Each item needs:

```ts
{ id: "unique-slug", name: "Display Name", wiki: "Wikipedia_Article_Title", category: "music" }
```

The `wiki` field is the article's URL slug. Underscores are fine. URL-encode non-ASCII (`Phở` → `Pho` because the article redirects, but `Nattō` → `Natt%C5%8D`). Quick check: the slug works if `https://en.wikipedia.org/wiki/<slug>` loads.

## Multiplayer

See [MULTIPLAYER.md](MULTIPLAYER.md) — the room-code architecture, transport options (Partykit / Upstash + SSE / Pusher), and the anti-cheat note about hiding pageview counts from the client.

## Storybook

Every main game state has a story.

```bash
npm run storybook       # dev
npm run build-storybook # static build → ./storybook-static
```

Stories live next to their components:

- `src/app/Landing.stories.tsx` — landing/category picker
- `src/app/play/Card.stories.tsx` — base card, dragging, ghost, long name
- `src/app/play/Board.stories.tsx` — full drag-and-drop play state (2/4/5 items, mixed category)
- `src/app/play/Reveal.stories.tsx` — score states: perfect, sharp instincts, mixed signals, inverted, plus 2- and 5-item rounds

Tailwind v4 is wired into the preview via `.storybook/preview.tsx`, which imports `src/app/globals.css`.

## Visual regression with Chromatic

Snapshots every story and diffs against the last accepted baseline.

```bash
npm run chromatic
```

For CI, [.github/workflows/chromatic.yml](.github/workflows/chromatic.yml) runs on every push and PR. To activate:

1. Create a project at [chromatic.com](https://www.chromatic.com).
2. Add the project token as a repo secret named `CHROMATIC_PROJECT_TOKEN`.
3. The first run accepts all snapshots as the baseline; subsequent runs flag pixel diffs in PR checks.

## Deploy

Push to GitHub, import on Vercel — zero config needed. The Wikipedia Pageviews API is free and unauthenticated.
