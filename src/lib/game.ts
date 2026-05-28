import type { Category, Item, RoundResult, ScoredItem } from "./types";
import { itemsByCategory } from "./items";
import { CATEGORY_WEIGHTS } from "./popularity/types";
import { fetchSignals, blendRanks } from "./popularity/blend";

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/**
 * Build a round of `size` items from `category`. Each item gets a blended rank
 * in [0, 1] (lower = more hipster) computed from whatever sources are weighted
 * for that category.
 *
 * Items that come back with no signal data (all sources returned null) are
 * dropped and the round is refilled from the same pool — keeps the game playable
 * even if one source is broken or an item lacks IDs for the active sources.
 */
export async function buildRound(
  category: Category | "mixed",
  size: number,
): Promise<ScoredItem[]> {
  const pool = itemsByCategory(category);
  const weights =
    category === "mixed" ? { wikipedia: 1 } : CATEGORY_WEIGHTS[category];

  // Slightly oversample so we can drop signal-less items without re-fetching.
  const oversample = Math.min(size + 2, pool.length);
  const picks = pickRandom(pool, oversample);

  const signals = await fetchSignals(picks, weights);

  // Items with at least one signal value > 0.
  const usable = picks.filter((p) => {
    const s = signals.get(p.id) ?? {};
    return Object.values(s).some((v) => (v ?? 0) > 0);
  });

  // Trim to round size, then re-rank within just the final set — gives ranks
  // a clean 0..1 spread for `size` items rather than gaps from oversample.
  const final = usable.slice(0, size);
  const finalRanks = blendRanks(final, signals, weights);

  return final.map((item) => ({
    ...item,
    signals: signals.get(item.id) ?? {},
    rank: finalRanks.get(item.id) ?? 0.5,
  }));
}

// Score: concordant pairs / total pairs (Kendall-tau, normalized 0..1).
// Orientation: leftmost / topmost = most MAINSTREAM. rank is in [0,1] where
// 0 = most hipster, 1 = most mainstream. Player placing [i] before [j] means
// they think [i] is more mainstream. Correct iff rank(i) >= rank(j).
export function scoreOrder(
  playerOrder: Item[],
  scoredItems: ScoredItem[],
): { score: number; pairsCorrect: number; pairsTotal: number } {
  const rankById = new Map(scoredItems.map((s) => [s.id, s.rank]));
  const n = playerOrder.length;
  let correct = 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      total++;
      const a = rankById.get(playerOrder[i].id) ?? 0.5;
      const b = rankById.get(playerOrder[j].id) ?? 0.5;
      if (a >= b) correct++;
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
  // correctOrder: mainstream → hipster (descending rank).
  const correct = [...items].sort((a, b) => b.rank - a.rank);
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
