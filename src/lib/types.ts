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
  | "tech"
  | "mixed";

export type Item = {
  id: string;
  name: string;
  wiki: string;
  category: Category;
  emoji?: string;
};

export type ScoredItem = Item & {
  views: number;
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
