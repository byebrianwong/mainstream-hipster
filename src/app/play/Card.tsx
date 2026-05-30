"use client";

import type { ScoredItem } from "@/lib/types";
import { cardSkin } from "@/lib/spectrum";
import { CATEGORY_STOPS } from "@/lib/categoryTheme";
import clsx from "clsx";

type Props = {
  item: ScoredItem;
  position?: number;
  total?: number;
  dragging?: boolean;
  ghost?: boolean;
  /** Per-category gradient stops. Defaults to the neutral "mixed" spectrum. */
  stops?: string[];
};

export default function Card({
  item,
  position,
  total,
  dragging,
  ghost,
  stops,
}: Props) {
  // Position along the spectrum: 0 = most mainstream (left), 1 = most hipster.
  const t =
    position != null && total != null && total > 1
      ? (position - 1) / (total - 1)
      : 0.5;
  const s = cardSkin(t, stops ?? CATEGORY_STOPS.mixed);

  return (
    <div
      className={clsx(
        "relative flex h-44 select-none flex-col justify-between p-4 backdrop-blur-md transition-all duration-500 will-change-transform sm:h-52",
        ghost && "opacity-30",
      )}
      style={{
        minWidth: 140,
        background: s.panel,
        color: s.ink,
        borderRadius: s.radius,
        border: `1px solid ${dragging ? s.accent : s.border}`,
        transform: `rotate(${s.rotate}deg)`,
        boxShadow: dragging
          ? `0 18px 40px -10px rgba(0,0,0,0.45), 0 0 30px -4px ${s.accent}`
          : s.glow > 1
            ? `0 0 ${s.glow}px -4px ${s.accent}, 0 10px 30px -12px rgba(0,0,0,0.5)`
            : "3px 4px 0 rgba(0,0,0,0.2)",
      }}
    >
      {/* per-card grain that grows toward the hipster end */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          opacity: s.grain,
          borderRadius: s.radius,
        }}
      />

      <div className="relative flex items-start justify-between">
        <span className="text-3xl" aria-hidden>
          {item.emoji ?? "•"}
        </span>
        {position != null && total != null ? (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: `${s.accent}40`, color: s.ink }}
          >
            {position}/{total}
          </span>
        ) : null}
      </div>

      <div className="relative">
        <p
          className={clsx(
            "leading-snug",
            s.mono ? "font-mono text-sm" : "text-sm font-bold tracking-tight",
          )}
        >
          {item.name}
        </p>
        <p
          className="mt-1 text-[10px] uppercase tracking-wider"
          style={{ color: s.ink, opacity: 0.6 }}
        >
          {item.category}
        </p>
      </div>
    </div>
  );
}
