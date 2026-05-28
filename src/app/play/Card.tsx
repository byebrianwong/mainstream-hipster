"use client";

import type { ScoredItem } from "@/lib/types";
import clsx from "clsx";

type Props = {
  item: ScoredItem;
  position?: number;
  total?: number;
  dragging?: boolean;
  ghost?: boolean;
};

export default function Card({ item, position, total, dragging, ghost }: Props) {
  return (
    <div
      className={clsx(
        "flex h-44 select-none flex-col justify-between rounded-2xl border bg-[color:var(--card)] p-4 transition will-change-transform sm:h-52",
        dragging
          ? "border-[color:var(--accent)] shadow-[0_18px_40px_-10px_rgba(0,0,0,0.3)]"
          : "border-[color:var(--border)] shadow-[0_2px_0_var(--border)]",
        ghost && "opacity-30",
      )}
      style={{ minWidth: 140 }}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl" aria-hidden>{item.emoji ?? "•"}</span>
        {position != null && total != null ? (
          <span className="rounded-full bg-[color:var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent)]">
            {position}/{total}
          </span>
        ) : null}
      </div>
      <div>
        <p className="text-sm font-semibold leading-snug">{item.name}</p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
          {item.category}
        </p>
      </div>
    </div>
  );
}
