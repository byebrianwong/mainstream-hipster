import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PopularityRail from "./PopularityRail";

const meta: Meta<typeof PopularityRail> = {
  title: "Game/PopularityRail",
  component: PopularityRail,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof PopularityRail>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: "compact" },
};
