"use client";

// Newspaper-print game backdrop: a drifting per-category spectrum wash, heavy
// halftone dots crawling through the middle, paper grain, and the category's
// animated motif. Sits behind the board (absolute, full-bleed).

import { gradientCss } from "@/lib/spectrum";
import { stopsFor, type CategoryKey } from "@/lib/categoryTheme";
import CategoryMotif from "./CategoryMotif";

export default function GameBackground({
  category,
  angle = 102,
}: {
  category: CategoryKey;
  angle?: number;
}) {
  const stops = stopsFor(category);

  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {/* newsprint paper base */}
      <div className="absolute inset-0 bg-[#efe9da] dark:bg-[#15140f]" />

      {/* drifting spectrum wash (soft, reads as printed ink) */}
      <div
        className="spectrum-drift absolute inset-0 opacity-80"
        style={{
          backgroundImage: gradientCss(stops, angle),
          backgroundSize: "220% 100%",
          mixBlendMode: "multiply",
        }}
      />

      {/* per-category animation */}
      <CategoryMotif category={category} />

      {/* crawling halftone dots, densest through the middle */}
      <div
        className="spectrum-halftone absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(#000 1.5px, transparent 1.7px)",
          backgroundSize: "12px 12px",
          opacity: 0.26,
          WebkitMaskImage: `linear-gradient(${angle}deg, transparent 8%, #000 50%, transparent 92%)`,
          maskImage: `linear-gradient(${angle}deg, transparent 8%, #000 50%, transparent 92%)`,
        }}
      />

      {/* fine paper grain everywhere */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          opacity: 0.08,
        }}
      />
    </div>
  );
}
