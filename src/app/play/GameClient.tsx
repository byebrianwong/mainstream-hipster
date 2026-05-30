"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import type { Category, ScoredItem } from "@/lib/types";
import { stopsFor } from "@/lib/categoryTheme";
import { sample, readableText } from "@/lib/spectrum";
import SortableCard from "./SortableCard";
import Card from "./Card";
import Reveal from "./Reveal";
import PopularityRail from "./PopularityRail";
import { buildResult } from "@/lib/game";

type Props = { category: Category | "mixed"; size: number };

type Phase = "loading" | "playing" | "revealed" | "error";

export default function GameClient({ category, size }: Props) {
  const [items, setItems] = useState<ScoredItem[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const stops = stopsFor(category);
  const accent = sample(stops, 0); // vivid mainstream-end colour for buttons
  const accentInk = readableText(accent);

  const loadRound = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch(`/api/round?category=${category}&size=${size}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load round");
      }
      const data = (await res.json()) as { items: ScoredItem[] };
      // Shuffle on the client so the player's starting order is randomized.
      const shuffled = [...data.items].sort(() => Math.random() - 0.5);
      setItems(shuffled);
      setPhase("playing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setPhase("error");
    }
  }, [category, size]);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (e: DragStartEvent) => setDragId(String(e.active.id));
  const handleDragEnd = (e: DragEndEvent) => {
    setDragId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setItems((arr) => arrayMove(arr, oldIndex, newIndex));
  };

  if (phase === "loading") {
    return (
      <div className="py-16 text-center text-white mix-blend-difference">
        <div className="mx-auto mb-3 h-2 w-24 animate-pulse rounded-full bg-white/60" />
        Loading round…
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-white/20 bg-black/55 p-6 text-center text-white backdrop-blur-md">
        <p className="mb-3 text-sm text-white/70">Something went wrong: {error}</p>
        <button
          onClick={loadRound}
          className="rounded-full px-4 py-2 text-sm font-bold"
          style={{ background: accent, color: accentInk }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (phase === "revealed") {
    return (
      <Reveal
        result={buildResult(items, items)}
        items={items}
        stops={stops}
        onReplay={loadRound}
      />
    );
  }

  const dragItem = items.find((i) => i.id === dragId);

  return (
    <div>
      <p className="mb-5 text-center font-mono text-xs uppercase tracking-[0.25em] text-white mix-blend-difference">
        drag to rank · mainstream → hipster
      </p>

      <PopularityRail stops={stops} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
            {items.map((item, idx) => (
              <SortableCard
                key={item.id}
                item={item}
                position={idx + 1}
                total={items.length}
                stops={stops}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {dragItem ? <Card item={dragItem} stops={stops} dragging /> : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-8 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
        <Link
          href="/"
          className="text-sm text-white underline-offset-4 mix-blend-difference hover:underline"
        >
          Change category
        </Link>
        <button
          onClick={() => setPhase("revealed")}
          className="rounded-full px-7 py-3 text-sm font-bold uppercase tracking-wide shadow-xl transition hover:scale-105"
          style={{
            background: accent,
            color: accentInk,
            boxShadow: `0 0 30px -6px ${accent}`,
          }}
        >
          Lock in &amp; reveal
        </button>
      </div>
    </div>
  );
}
