"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ScoredItem } from "@/lib/types";
import Card from "./Card";

type Props = { item: ScoredItem; position: number; total: number };

export default function SortableCard({ item, position, total }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab touch-none active:cursor-grabbing"
    >
      <Card item={item} position={position} total={total} ghost={isDragging} />
    </div>
  );
}
