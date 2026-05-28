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
    { wikipedia: 922_000, spotify: 1_300_000 },
    0,
  ),
  scored(
    { id: "frank-ocean", name: "Frank Ocean", wiki: "Frank_Ocean", category: "music", emoji: "🎤" },
    { wikipedia: 1_400_000, spotify: 12_000_000 },
    0.33,
  ),
  scored(
    { id: "the-beatles", name: "The Beatles", wiki: "The_Beatles", category: "music", emoji: "🎸" },
    { wikipedia: 5_200_000, spotify: 26_000_000 },
    0.66,
  ),
  scored(
    { id: "taylor-swift", name: "Taylor Swift", wiki: "Taylor_Swift", category: "music", emoji: "🎤" },
    { wikipedia: 12_300_000, spotify: 65_000_000 },
    1,
  ),
];

const meta: Meta<typeof Reveal> = {
  title: "Game/Reveal",
  component: Reveal,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Reveal>;

const perfectOrder = [...items];
const goodOrder = [items[0], items[1], items[3], items[2]];
const mixedOrder = [items[2], items[0], items[3], items[1]];
const worstOrder = [...items].reverse();

export const Perfect: Story = {
  args: { items, result: buildResult(items, perfectOrder), onReplay: () => {} },
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
    result: buildResult(tvItems, [tvItems[0], tvItems[2], tvItems[1], tvItems[3]]),
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
    result: buildResult(bookItems, [bookItems[0], bookItems[3], bookItems[1], bookItems[2]]),
    onReplay: () => {},
  },
};
