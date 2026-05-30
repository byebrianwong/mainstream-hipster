// Per-category visual theme: the colour spectrum each category's board uses,
// plus which animated background motif it shows. Keyed by Category | "mixed".

import type { Category } from "./types";

export type CategoryKey = Category | "mixed";

/** Multi-stop gradient (mainstream → hipster) per category. */
export const CATEGORY_STOPS: Record<CategoryKey, string[]> = {
  music: ["#1DB954", "#1aa39a", "#7e9a52", "#c79a4f", "#caa66f"],
  movies: ["#f5c518", "#d98324", "#9c5a33", "#7a5a3e", "#cbb48f"],
  tv: ["#ff3b6b", "#b14bff", "#5b8def", "#6c7a89", "#c9c2b0"],
  books: ["#b3163a", "#8a3b2f", "#6b5a3a", "#a89a72", "#e3dcc6"],
  food: ["#ff5a3c", "#ff9a3c", "#d98324", "#b08a4f", "#d8c6a0"],
  drinks: ["#e11d48", "#9a2d4a", "#5a7a4a", "#8aa06a", "#cfd6b4"],
  tech: ["#00d4ff", "#3b6bff", "#6b4bff", "#7a6d8a", "#c2c2cc"],
  cities: ["#ff7a3c", "#e0852f", "#5b8def", "#6c7a89", "#c9c2b0"],
  animals: ["#ff9a3c", "#e0852f", "#7e9a52", "#6f9a8a", "#cfd6c4"],
  brands: ["#ff2d6f", "#d62d7a", "#a85a4a", "#b89a6a", "#ded2b8"],
  hobbies: ["#1aa39a", "#4a9a8a", "#7e9a52", "#b0925a", "#d8c6a0"],
  mixed: ["#ff2d6f", "#b14bff", "#5b8def", "#3fa796", "#cfa15e"],
};

/** Which CategoryMotif variant to render. Categories without a dedicated motif
 *  fall back to "generic" (gentle drifting shapes). */
export type MotifKey =
  | "music"
  | "movies"
  | "tv"
  | "books"
  | "food"
  | "drinks"
  | "tech"
  | "cities"
  | "animals"
  | "generic";

export const CATEGORY_MOTIF: Record<CategoryKey, MotifKey> = {
  music: "music",
  movies: "movies",
  tv: "tv",
  books: "books",
  food: "food",
  drinks: "drinks",
  tech: "tech",
  cities: "cities",
  animals: "animals",
  brands: "generic",
  hobbies: "generic",
  mixed: "generic",
};

export function stopsFor(category: CategoryKey): string[] {
  return CATEGORY_STOPS[category] ?? CATEGORY_STOPS.mixed;
}

export function motifFor(category: CategoryKey): MotifKey {
  return CATEGORY_MOTIF[category] ?? "generic";
}
