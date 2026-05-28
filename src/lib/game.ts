import type { Category, Item, RoundResult, ScoredItem } from "./types";
import { itemsByCategory } from "./items";
import { fetchManyViews } from "./pageviews";

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export async function buildRound(
  category: Category | "mixed",
  size: number,
): Promise<ScoredItem[]> {
  const pool = itemsByCategory(category);
  const picks = pickRandom(pool, Math.min(size, pool.length));
  const views = await fetchManyViews(picks.map((p) => p.wiki));

  // Drop items we couldn't get data for and refill if needed.
  const scored: ScoredItem[] = picks
    .map((p) => ({ ...p, views: views[p.wiki] ?? 0 }))
    .filter((s) => s.views > 0);

  if (scored.length < size) {
    const remaining = pool.filter(
      (p) => !scored.some((s) => s.id === p.id),
    );
    const extra = pickRandom(remaining, size - scored.length);
    const extraViews = await fetchManyViews(extra.map((p) => p.wiki));
    for (const item of extra) {
      const v = extraViews[item.wiki] ?? 0;
      if (v > 0) scored.push({ ...item, views: v });
      if (scored.length >= size) break;
    }
  }

  return scored.slice(0, size);
}

// Score: count concordant pairs / total pairs (Kendall-tau, normalized).
// Returns 0..1.
export function scoreOrder(
  playerOrder: Item[],
  scoredItems: ScoredItem[],
): { score: number; pairsCorrect: number; pairsTotal: number } {
  const viewsById = new Map(scoredItems.map((s) => [s.id, s.views]));
  const n = playerOrder.length;
  let correct = 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      total++;
      const a = viewsById.get(playerOrder[i].id) ?? 0;
      const b = viewsById.get(playerOrder[j].id) ?? 0;
      // Player placed playerOrder[i] before playerOrder[j], which means they
      // ranked it as LESS popular. So this pair is correct when a <= b.
      if (a <= b) correct++;
    }
  }
  return {
    score: total === 0 ? 1 : correct / total,
    pairsCorrect: correct,
    pairsTotal: total,
  };
}

export function buildResult(
  items: ScoredItem[],
  playerOrder: Item[],
): RoundResult {
  const { score, pairsCorrect, pairsTotal } = scoreOrder(playerOrder, items);
  const correct = [...items].sort((a, b) => a.views - b.views);
  return {
    items,
    playerOrder: playerOrder.map((i) => i.id),
    correctOrder: correct.map((i) => i.id),
    score,
    maxScore: 1,
    pairsCorrect,
    pairsTotal,
  };
}
