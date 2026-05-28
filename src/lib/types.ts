export type Category =
  | "music"
  | "food"
  | "cities"
  | "movies"
  | "tv"
  | "books"
  | "animals"
  | "drinks"
  | "brands"
  | "hobbies"
  | "tech";

export type Item = {
  id: string;
  name: string;
  wiki: string;
  category: Category;
  emoji?: string;
  /** Spotify artist ID — present on music items once assigned. */
  spotifyId?: string;
  /** TMDb numeric ID — present on movies/tv items once assigned. */
  tmdbId?: number;
};

import type { Signals } from "./popularity/types";

export type ScoredItem = Item & {
  /** Raw values from each source that contributed to this item's ranking. */
  signals: Signals;
  /**
   * Blended rank within the round, in [0, 1]. Lower = more hipster.
   * Computed by `blendRanks` in popularity/blend.ts.
   */
  rank: number;
};

export type RoundResult = {
  items: ScoredItem[];
  playerOrder: string[];
  correctOrder: string[];
  score: number;
  maxScore: number;
  pairsCorrect: number;
  pairsTotal: number;
};
