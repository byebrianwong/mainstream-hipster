import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Card from "./Card";
import type { ScoredItem } from "@/lib/types";
import { CATEGORY_STOPS } from "@/lib/categoryTheme";

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
  parameters: { layout: "centered", backgrounds: { default: "dark" } },
};
export default meta;

type Story = StoryObj<typeof Card>;

const music = CATEGORY_STOPS.music;

// The card morphs continuously by its position on the spectrum:
// mainstream (left) = dark & glossy, hipster (right) = light, papery, tilted.
export const Mainstream: Story = {
  args: { item: sample, position: 1, total: 4, stops: music },
};

export const Middle: Story = {
  args: { item: sample, position: 2, total: 4, stops: music },
};

export const Hipster: Story = {
  args: { item: sample, position: 4, total: 4, stops: music },
};

export const Dragging: Story = {
  args: { item: sample, position: 2, total: 4, stops: music, dragging: true },
};

export const Ghost: Story = {
  name: "Ghost (origin slot while dragging)",
  args: { item: sample, position: 2, total: 4, stops: music, ghost: true },
};

export const NoBadge: Story = {
  args: { item: sample, stops: music },
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
    stops: music,
  },
};
