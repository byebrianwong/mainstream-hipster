import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Reveal from "./Reveal";
import type { RoundResult, ScoredItem } from "@/lib/types";
import { CATEGORY_STOPS } from "@/lib/categoryTheme";

const items: ScoredItem[] = [
  { id: "taylor-swift", name: "Taylor Swift", wiki: "Taylor_Swift", category: "music", emoji: "🎤", signals: { wikipedia: 12_300_000, lastfm: 5_981_316 }, rank: 1 },
  { id: "frank-ocean", name: "Frank Ocean", wiki: "Frank_Ocean", category: "music", emoji: "🎤", signals: { wikipedia: 1_354_000, lastfm: 4_301_404 }, rank: 0.66 },
  { id: "mitski", name: "Mitski", wiki: "Mitski", category: "music", emoji: "🎤", signals: { wikipedia: 627_000, lastfm: 3_307_003 }, rank: 0.33 },
  { id: "alvvays", name: "Alvvays", wiki: "Alvvays", category: "music", emoji: "🎸", signals: { wikipedia: 142_000, lastfm: 1_215_981 }, rank: 0 },
];

// playerOrder differs from correctOrder so deltas and scoring are visible.
const result: RoundResult = {
  items,
  playerOrder: ["frank-ocean", "taylor-swift", "alvvays", "mitski"],
  correctOrder: ["taylor-swift", "frank-ocean", "mitski", "alvvays"],
  score: 0.667,
  maxScore: 1,
  pairsCorrect: 4,
  pairsTotal: 6,
};

const stops = CATEGORY_STOPS.music;

const meta: Meta<typeof Reveal> = {
  title: "Game/Reveal",
  component: Reveal,
  parameters: { layout: "padded", backgrounds: { default: "dark" } },
};
export default meta;

type Story = StoryObj<typeof Reveal>;

export const Guess: Story = {
  args: { result, items, stops, pinnedPhase: "guess" },
};

export const Revealing: Story = {
  args: { result, items, stops, pinnedPhase: "revealing" },
};

export const Settled: Story = {
  args: { result, items, stops, pinnedPhase: "settled" },
};

export const PerfectScore: Story = {
  args: {
    result: { ...result, playerOrder: result.correctOrder, score: 1, pairsCorrect: 6 },
    items,
    stops,
    pinnedPhase: "settled",
  },
};
