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
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import type { Category, ScoredItem } from "@/lib/types";
import SortableCard from "./SortableCard";
import Card from "./Card";
import Reveal from "./Reveal";
import { buildResult } from "@/lib/game";

type Props = { category: Category | "mixed"; size: number };

type Phase = "loading" | "playing" | "revealed" | "error";

export default function GameClient({ category, size }: Props) {
  const [items, setItems] = useState<ScoredItem[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

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
      <div className="py-16 text-center text-[color:var(--muted)]">
        <div className="mx-auto mb-3 h-2 w-24 animate-pulse rounded-full bg-[color:var(--accent-soft)]" />
        Loading round…
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 text-center">
        <p className="mb-3 text-sm text-[color:var(--muted)]">
          Something went wrong: {error}
        </p>
        <button
          onClick={loadRound}
          className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white"
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
        onReplay={loadRound}
      />
    );
  }

  const dragItem = items.find((i) => i.id === dragId);

  return (
    <div>
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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="grid grid-flow-col gap-3 overflow-x-auto pb-2 sm:auto-cols-fr">
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

        <DragOverlay>
          {dragItem ? <Card item={dragItem} dragging /> : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="text-sm text-[color:var(--muted)] underline-offset-4 hover:underline"
        >
          Change category
        </Link>
        <button
          onClick={() => setPhase("revealed")}
          className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-base font-medium text-white shadow-[0_8px_24px_-8px_rgba(242,92,84,0.6)] transition hover:brightness-110"
        >
          Lock in & reveal
        </button>
      </div>
    </div>
  );
}
