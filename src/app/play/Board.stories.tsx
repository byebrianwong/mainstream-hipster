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
        Most mainstream on the left, most hipster on the right.
      </p>
      <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
        <span>mainstream ←</span>
        <span>→ hipster</span>
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
  { id: "alvvays", name: "Alvvays", wiki: "Alvvays", category: "music", emoji: "🎸", signals: { wikipedia: 142_000, lastfm: 1_215_981 }, rank: 0 },
  { id: "mitski", name: "Mitski", wiki: "Mitski", category: "music", emoji: "🎤", signals: { wikipedia: 627_000, lastfm: 3_307_003 }, rank: 0.33 },
  { id: "frank-ocean", name: "Frank Ocean", wiki: "Frank_Ocean", category: "music", emoji: "🎤", signals: { wikipedia: 1_354_000, lastfm: 4_301_404 }, rank: 0.66 },
  { id: "taylor-swift", name: "Taylor Swift", wiki: "Taylor_Swift", category: "music", emoji: "🎤", signals: { wikipedia: 12_300_000, lastfm: 5_981_316 }, rank: 1 },
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
      { id: "king-gizzard", name: "King Gizzard & the Lizard Wizard", wiki: "King_Gizzard_%26_the_Lizard_Wizard", category: "music", emoji: "🎸", signals: { wikipedia: 696_000, lastfm: 914_178 }, rank: 0.5 },
    ],
  },
};

export const Mixed: Story = {
  args: {
    initial: [
      { id: "kombucha", name: "Kombucha", wiki: "Kombucha", category: "drinks", emoji: "🍵", signals: { wikipedia: 1_252_000 }, rank: 0.66 },
      { id: "matcha", name: "Matcha", wiki: "Matcha", category: "drinks", emoji: "🍵", signals: { wikipedia: 1_888_000 }, rank: 1 },
      { id: "axolotl", name: "Axolotl", wiki: "Axolotl", category: "animals", emoji: "🦎", signals: { wikipedia: 800_000 }, rank: 0.33 },
      { id: "portland", name: "Portland, Oregon", wiki: "Portland,_Oregon", category: "cities", emoji: "🌲", signals: { wikipedia: 1_100_000 }, rank: 0 },
    ],
  },
};

export const TVShows: Story = {
  args: {
    initial: [
      { id: "reservation-dogs", name: "Reservation Dogs", wiki: "Reservation_Dogs", category: "tv", emoji: "🐕", signals: { wikipedia: 537_000, tmdb: 35 }, rank: 0 },
      { id: "severance", name: "Severance (TV series)", wiki: "Severance_(TV_series)", category: "tv", emoji: "🧠", signals: { wikipedia: 2_900_000, tmdb: 120 }, rank: 0.33 },
      { id: "the-bear", name: "The Bear (TV series)", wiki: "The_Bear_(TV_series)", category: "tv", emoji: "🐻", signals: { wikipedia: 4_100_000, tmdb: 95 }, rank: 0.66 },
      { id: "friends", name: "Friends", wiki: "Friends", category: "tv", emoji: "📺", signals: { wikipedia: 9_800_000, tmdb: 180 }, rank: 1 },
    ],
  },
};

export const Books: Story = {
  args: {
    initial: [
      { id: "normal-people", name: "Normal People (novel)", wiki: "Normal_People", category: "books", emoji: "💔", signals: { wikipedia: 380_000 }, rank: 0 },
      { id: "a-little-life", name: "A Little Life", wiki: "A_Little_Life", category: "books", emoji: "💔", signals: { wikipedia: 612_000 }, rank: 0.33 },
      { id: "atomic-habits", name: "Atomic Habits", wiki: "Atomic_Habits", category: "books", emoji: "⚛️", signals: { wikipedia: 1_900_000 }, rank: 0.66 },
      { id: "harry-potter", name: "Harry Potter", wiki: "Harry_Potter", category: "books", emoji: "⚡", signals: { wikipedia: 14_500_000 }, rank: 1 },
    ],
  },
};
