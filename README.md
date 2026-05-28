# Mainstream / Hipster

A ranking game: drag 2–5 things from most hipster to most mainstream. Real popularity comes from English Wikipedia pageviews over the trailing 12 months.

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
    items.ts       # Curated item bank — names + Wikipedia article slugs
    pageviews.ts   # Wikipedia Pageviews API client (cached 24h via fetch)
    game.ts        # Round generation + Kendall-tau pair scoring
    types.ts
  app/
    page.tsx           # Landing: category picker
    play/page.tsx      # Game shell (reads ?category=&size=)
    play/GameClient.tsx, Card.tsx, SortableCard.tsx, Reveal.tsx
    api/round/route.ts # GET /api/round?category=music&size=4 -> { items: ScoredItem[] }
```

## How scoring works

Concordant-pair fraction (a Kendall-tau variant, normalized to 0–1). For *n* items there are *C(n,2)* pairs; you get credit for every pair you ordered correctly relative to the actual pageview ranking. So in a 4-item round, perfect is 6/6 = 100%; swapping two adjacent items is 5/6 ≈ 83%.

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
