import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Card from "./Card";
import type { ScoredItem } from "@/lib/types";

const sample: ScoredItem = {
  id: "mitski",
  name: "Mitski",
  wiki: "Mitski",
  category: "music",
  emoji: "🎤",
  signals: { wikipedia: 626975, lastfm: 3_307_003 },
  rank: 0.33,
};

const meta: Meta<typeof Card> = {
  title: "Game/Card",
  component: Card,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: { item: sample, position: 2, total: 4 },
};

export const NoBadge: Story = {
  args: { item: sample },
};

export const Dragging: Story = {
  args: { item: sample, position: 2, total: 4, dragging: true },
};

export const Ghost: Story = {
  name: "Ghost (origin slot while dragging)",
  args: { item: sample, position: 2, total: 4, ghost: true },
};

export const LongName: Story = {
  args: {
    item: {
      ...sample,
      id: "king-gizzard",
      name: "King Gizzard & the Lizard Wizard",
      emoji: "🎸",
    },
    position: 1,
    total: 5,
  },
};
