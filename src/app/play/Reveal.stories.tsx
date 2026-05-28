import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Reveal from "./Reveal";
import type { ScoredItem } from "@/lib/types";
import { buildResult } from "@/lib/game";

// Build a ScoredItem with both signals + a pre-computed rank in [0,1].
function scored(
  partial: Omit<ScoredItem, "signals" | "rank">,
  signals: ScoredItem["signals"],
  rank: number,
): ScoredItem {
  return { ...partial, signals, rank };
}

const items: ScoredItem[] = [
  scored(
    { id: "arcade-fire", name: "Arcade Fire", wiki: "Arcade_Fire", category: "music", emoji: "🎸" },
    { wikipedia: 922_000, lastfm: 3_134_495 },
    0,
  ),
  scored(
    { id: "frank-ocean", name: "Frank Ocean", wiki: "Frank_Ocean", category: "music", emoji: "🎤" },
    { wikipedia: 1_400_000, lastfm: 4_301_404 },
    0.33,
  ),
  scored(
    { id: "the-beatles", name: "The Beatles", wiki: "The_Beatles", category: "music", emoji: "🎸" },
    { wikipedia: 5_200_000, lastfm: 6_551_415 },
    0.66,
  ),
  scored(
    { id: "taylor-swift", name: "Taylor Swift", wiki: "Taylor_Swift", category: "music", emoji: "🎤" },
    { wikipedia: 12_300_000, lastfm: 5_981_316 },
    1,
  ),
];

const meta: Meta<typeof Reveal> = {
  title: "Game/Reveal",
  component: Reveal,
  parameters: { layout: "padded" },
  // Stories render the final "settled" state so Chromatic snapshots are stable.
  // GuessPhase explicitly pins at "guess" to capture the pre-reveal view.
  args: { pinnedPhase: "settled" },
};
export default meta;

type Story = StoryObj<typeof Reveal>;

// New orientation: leftmost / topmost = most MAINSTREAM. items[] is in
// hipster→mainstream order (rank 0..1), so a perfect player guess is the reverse.
const perfectOrder = [...items].reverse(); // [TS, Beatles, Frank Ocean, Arcade Fire]
const goodOrder = [items[3], items[1], items[2], items[0]]; // one adjacent swap
const mixedOrder = [items[1], items[3], items[0], items[2]];
const worstOrder = [...items]; // hipster first — fully backwards from correct

export const Perfect: Story = {
  args: { items, result: buildResult(items, perfectOrder), onReplay: () => {} },
};

export const GuessPhase: Story = {
  name: "Phase 1 — player guess (pre-reveal)",
  args: {
    items,
    result: buildResult(items, mixedOrder),
    onReplay: () => {},
    pinnedPhase: "guess",
  },
};

export const SharpInstincts: Story = {
  name: "Sharp instincts (one swap)",
  args: { items, result: buildResult(items, goodOrder), onReplay: () => {} },
};

export const MixedSignals: Story = {
  args: { items, result: buildResult(items, mixedOrder), onReplay: () => {} },
};

export const Inverted: Story = {
  name: "Time to recalibrate (fully reversed)",
  args: { items, result: buildResult(items, worstOrder), onReplay: () => {} },
};

export const TwoItems: Story = {
  args: {
    items: items.slice(0, 2),
    result: buildResult(items.slice(0, 2), items.slice(0, 2)),
    onReplay: () => {},
  },
};

// --- Category-specific reveals ---

const tvItems: ScoredItem[] = [
  scored(
    { id: "reservation-dogs", name: "Reservation Dogs", wiki: "Reservation_Dogs", category: "tv", emoji: "🐕" },
    { wikipedia: 537_000, tmdb: 35.2 },
    0,
  ),
  scored(
    { id: "severance", name: "Severance (TV series)", wiki: "Severance_(TV_series)", category: "tv", emoji: "🧠" },
    { wikipedia: 2_900_000, tmdb: 120.4 },
    0.33,
  ),
  scored(
    { id: "the-bear", name: "The Bear (TV series)", wiki: "The_Bear_(TV_series)", category: "tv", emoji: "🐻" },
    { wikipedia: 4_100_000, tmdb: 95.1 },
    0.66,
  ),
  scored(
    { id: "friends", name: "Friends", wiki: "Friends", category: "tv", emoji: "📺" },
    { wikipedia: 9_800_000, tmdb: 180.8 },
    1,
  ),
];

export const TVReveal: Story = {
  name: "TV (sharp instincts)",
  args: {
    items: tvItems,
    // Mainstream-first guess with one adjacent swap (Severance ↔ The Bear).
    result: buildResult(tvItems, [tvItems[3], tvItems[1], tvItems[2], tvItems[0]]),
    onReplay: () => {},
  },
};

const bookItems: ScoredItem[] = [
  scored(
    { id: "normal-people", name: "Normal People (novel)", wiki: "Normal_People", category: "books", emoji: "💔" },
    { wikipedia: 380_000 },
    0,
  ),
  scored(
    { id: "a-little-life", name: "A Little Life", wiki: "A_Little_Life", category: "books", emoji: "💔" },
    { wikipedia: 612_000 },
    0.33,
  ),
  scored(
    { id: "atomic-habits", name: "Atomic Habits", wiki: "Atomic_Habits", category: "books", emoji: "⚛️" },
    { wikipedia: 1_900_000 },
    0.66,
  ),
  scored(
    { id: "harry-potter", name: "Harry Potter", wiki: "Harry_Potter", category: "books", emoji: "⚡" },
    { wikipedia: 14_500_000 },
    1,
  ),
];

export const BooksReveal: Story = {
  name: "Books (mixed signals)",
  args: {
    items: bookItems,
    // Mainstream-first guess that gets two pairs wrong.
    result: buildResult(bookItems, [bookItems[2], bookItems[0], bookItems[3], bookItems[1]]),
    onReplay: () => {},
  },
};
