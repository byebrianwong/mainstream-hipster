import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Home from "./page";

const meta: Meta<typeof Home> = {
  title: "Game/Landing",
  component: Home,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof Home>;

export const Default: Story = {};
