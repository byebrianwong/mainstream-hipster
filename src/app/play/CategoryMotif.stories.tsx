import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import GameBackground from "./GameBackground";
import type { CategoryKey } from "@/lib/categoryTheme";

// Showcases each category's full backdrop (per-category gradient wash, halftone,
// grain + the animated motif). Chromatic snapshots a single frame of each.
function MotifBox({ category }: { category: CategoryKey }) {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl">
      <GameBackground category={category} />
      <div className="relative z-10 flex h-full items-start justify-center p-4">
        <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur">
          {category}
        </span>
      </div>
    </div>
  );
}

const meta: Meta<typeof MotifBox> = {
  title: "Game/CategoryMotif",
  component: MotifBox,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof MotifBox>;

export const Music: Story = { args: { category: "music" } };
export const Movies: Story = { args: { category: "movies" } };
export const TV: Story = { args: { category: "tv" } };
export const Books: Story = { args: { category: "books" } };
export const Food: Story = { args: { category: "food" } };
export const Drinks: Story = { args: { category: "drinks" } };
export const Tech: Story = { args: { category: "tech" } };
export const Cities: Story = { args: { category: "cities" } };
export const Animals: Story = { args: { category: "animals" } };
export const Brands: Story = { args: { category: "brands" } };
export const Hobbies: Story = { args: { category: "hobbies" } };
export const MixedBag: Story = { args: { category: "mixed" } };
