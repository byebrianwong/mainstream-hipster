import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableCard from "./SortableCard";
import type { ScoredItem } from "@/lib/types";

// Standalone board renderer that doesn't need an API round — so we can showcase
// the playing state in isolation.
function Board({ initial }: { initial: ScoredItem[] }) {
  const [items, setItems] = useState(initial);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setItems((arr) => arrayMove(arr, oldIdx, newIdx));
  };

  return (
    <div className="w-full max-w-3xl">
      <h2 className="mb-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        Drag to rank these
      </h2>
      <p className="mb-6 text-sm text-[color:var(--muted)]">
        Most hipster on the left, most mainstream on the right.
      </p>
      <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
        <span>← hipster</span>
        <span>mainstream →</span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="grid auto-cols-fr grid-flow-col gap-3 overflow-x-auto pb-2">
            {items.map((item, idx) => (
              <SortableCard
                key={item.id}
                item={item}
                position={idx + 1}
                total={items.length}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

const meta: Meta<typeof Board> = {
  title: "Game/Board",
  component: Board,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof Board>;

const musicItems: ScoredItem[] = [
  { id: "alvvays", name: "Alvvays", wiki: "Alvvays", category: "music", emoji: "🎸", views: 142_000 },
  { id: "mitski", name: "Mitski", wiki: "Mitski", category: "music", emoji: "🎤", views: 627_000 },
  { id: "frank-ocean", name: "Frank Ocean", wiki: "Frank_Ocean", category: "music", emoji: "🎤", views: 1_354_000 },
  { id: "taylor-swift", name: "Taylor Swift", wiki: "Taylor_Swift", category: "music", emoji: "🎤", views: 12_300_000 },
];

export const FourMusicItems: Story = {
  args: { initial: musicItems },
};

export const TwoItems: Story = {
  args: { initial: musicItems.slice(0, 2) },
};

export const FiveItems: Story = {
  args: {
    initial: [
      ...musicItems,
      { id: "king-gizzard", name: "King Gizzard & the Lizard Wizard", wiki: "King_Gizzard_%26_the_Lizard_Wizard", category: "music", emoji: "🎸", views: 696_000 },
    ],
  },
};

export const Mixed: Story = {
  args: {
    initial: [
      { id: "kombucha", name: "Kombucha", wiki: "Kombucha", category: "drinks", emoji: "🍵", views: 1_252_000 },
      { id: "matcha", name: "Matcha", wiki: "Matcha", category: "drinks", emoji: "🍵", views: 1_888_000 },
      { id: "axolotl", name: "Axolotl", wiki: "Axolotl", category: "animals", emoji: "🦎", views: 800_000 },
      { id: "portland", name: "Portland, Oregon", wiki: "Portland,_Oregon", category: "cities", emoji: "🌲", views: 1_100_000 },
    ],
  },
};
