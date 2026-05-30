import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PopularityRail from "./PopularityRail";
import { CATEGORY_STOPS } from "@/lib/categoryTheme";

const meta: Meta<typeof PopularityRail> = {
  title: "Game/PopularityRail",
  component: PopularityRail,
  parameters: { layout: "padded", backgrounds: { default: "dark" } },
};
export default meta;

type Story = StoryObj<typeof PopularityRail>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: "compact" },
};

export const Music: Story = {
  args: { stops: CATEGORY_STOPS.music },
};

export const Movies: Story = {
  args: { stops: CATEGORY_STOPS.movies },
};

export const Books: Story = {
  args: { stops: CATEGORY_STOPS.books },
};

export const Tech: Story = {
  args: { stops: CATEGORY_STOPS.tech },
};
