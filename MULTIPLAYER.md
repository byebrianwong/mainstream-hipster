# Multiplayer roadmap

The single-player game already separates the two halves cleanly:

1. **Round generation** — a server function that picks items + fetches Wikipedia pageviews.
   In `src/lib/game.ts` (`buildRound`).
2. **Scoring** — pure, deterministic, runs anywhere given items + a player's order.
   In `src/lib/game.ts` (`scoreOrder`, `buildResult`).

Multiplayer is a thin layer on top of those.

## v1: shared rounds via room codes (lobby style)

**UX**

- One player taps "Play with friends" → server creates a `Room { code, hostId, category, size }` and a first `Round { items[], correctOrder, startsAt }`.
- Other players join by code (4-letter, e.g. `RNGE`).
- Everyone sees the same items shuffled the same way (seeded by `roundId`), and submits their order.
- When everyone has submitted (or a timer expires), scores reveal side-by-side.
- Host can hit "Next round" to draw a new set in the same category.

**State**

```ts
type Room = { code: string; hostId: string; category: Category; size: number; players: Player[] };
type Round = { id: string; roomCode: string; items: ScoredItem[]; submissions: Record<playerId, string[]>; revealedAt?: number };
```

Round `items` includes `views`, but the **server never sends `views` to clients until the reveal**. Each client receives a `PublicItem` (no `views`) and submits `playerOrder: string[]`. The server scores using the hidden `views`.

**Transport options on Vercel**

| Option | Fit | Why |
|---|---|---|
| **Vercel + Upstash Redis + SSE** | ✅ Strong default | Redis for room state + pub/sub. SSE works on Fluid Compute. Cheap, simple. |
| **Vercel + Pusher / Ably** | ✅ Easiest | Managed realtime, both have generous free tiers. Marketplace integrations. |
| **Vercel + Partykit** | ✅ Best DX | Stateful "room" object per code; built for this exact pattern. |
| **Vercel + WebSockets in Fluid** | ⚠️ Works but DIY | Possible but requires custom connection management. Not worth it for v1. |

**Recommendation:** start with **Partykit** (one Durable Object per room code, no DB needed for v1) or **Upstash Redis + SSE** if you'd rather keep all infra inside Vercel Marketplace.

## v2: async / pass-and-play

- "Daily round" — every player sees the same 4 items each day. Compare scores with friends via a share link. No realtime needed; just a stable seed per UTC date.
- This is the cheapest path to viral growth and uses the same scoring + Wikipedia data.

## Where to wire it in

- `src/app/play/page.tsx` reads `?room=ABCD` query → switches to a different client that subscribes instead of generating its own round.
- `src/app/api/round/route.ts` becomes `room` aware (creates room rounds, hides views).
- `src/lib/game.ts` already exposes the only two primitives multiplayer needs: `buildRound`, `buildResult`.

## Anti-cheat note

Players could inspect the `/api/round` response and see pageview counts. Two mitigations:

1. **Always strip `views` from the wire** for the active player. Send them server-side only.
2. For competitive ranked modes: do the scoring entirely server-side. Client sends `playerOrder: string[]`, server returns the score and (post-reveal) the real ordering.

The single-player code currently exposes `views` to the client for simplicity. That changes the day we go multiplayer.
