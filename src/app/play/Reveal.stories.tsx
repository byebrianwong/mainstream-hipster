import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Reveal from "./Reveal";
import type { ScoredItem } from "@/lib/types";
import { buildResult } from "@/lib/game";

const items: ScoredItem[] = [
  { id: "arcade-fire", name: "Arcade Fire", wiki: "Arcade_Fire", category: "music", emoji: "🎸", views: 922_000 },
  { id: "frank-ocean", name: "Frank Ocean", wiki: "Frank_Ocean", category: "music", emoji: "🎤", views: 1_400_000 },
  { id: "the-beatles", name: "The Beatles", wiki: "The_Beatles", category: "music", emoji: "🎸", views: 5_200_000 },
  { id: "taylor-swift", name: "Taylor Swift", wiki: "Taylor_Swift", category: "music", emoji: "🎤", views: 12_300_000 },
];

const meta: Meta<typeof Reveal> = {
  title: "Game/Reveal",
  component: Reveal,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Reveal>;

// Player got it exactly right.
const perfectOrder = [...items];
// Player swapped one adjacent pair (Beatles ↔ Taylor Swift).
const goodOrder = [items[0], items[1], items[3], items[2]];
// Mixed — a 50/50 ish ordering.
const mixedOrder = [items[2], items[0], items[3], items[1]];
// Reverse — totally backwards.
const worstOrder = [...items].reverse();

export const Perfect: Story = {
  args: {
    items,
    result: buildResult(items, perfectOrder),
    onReplay: () => {},
  },
};

export const SharpInstincts: Story = {
  name: "Sharp instincts (one swap)",
  args: {
    items,
    result: buildResult(items, goodOrder),
    onReplay: () => {},
  },
};

export const MixedSignals: Story = {
  args: {
    items,
    result: buildResult(items, mixedOrder),
    onReplay: () => {},
  },
};

export const Inverted: Story = {
  name: "Time to recalibrate (fully reversed)",
  args: {
    items,
    result: buildResult(items, worstOrder),
    onReplay: () => {},
  },
};

export const TwoItems: Story = {
  args: {
    items: items.slice(0, 2),
    result: buildResult(items.slice(0, 2), items.slice(0, 2)),
    onReplay: () => {},
  },
};

export const FiveItems: Story = {
  args: {
    items: [
      ...items,
      { id: "mitski", name: "Mitski", wiki: "Mitski", category: "music", emoji: "🎤", views: 627_000 },
    ],
    result: buildResult(
      [
        ...items,
        { id: "mitski", name: "Mitski", wiki: "Mitski", category: "music", emoji: "🎤", views: 627_000 },
      ],
      [
        { id: "mitski", name: "Mitski", wiki: "Mitski", category: "music", emoji: "🎤", views: 627_000 },
        items[0],
        items[1],
        items[2],
        items[3],
      ],
    ),
    onReplay: () => {},
  },
};
