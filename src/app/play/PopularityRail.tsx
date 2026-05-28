"use client";

// Visual rail showing the mainstream→hipster gradient.
//
// 24 vertical bars descending in height from left to right. Tall bars on the
// left = "lots of attention" (mainstream); short bars on the right = "less
// attention" (hipster). On mount, bars rise from the baseline in a left-to-right
// wave to reinforce the directional metaphor.

import { motion, useReducedMotion } from "motion/react";

type Props = {
  /** Compact mode (smaller, used in tight spots). */
  size?: "default" | "compact";
};

const BAR_COUNT = 24;

export default function PopularityRail({ size = "default" }: Props) {
  const reduceMotion = useReducedMotion();

  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const t = i / (BAR_COUNT - 1); // 0 → 1
    const heightPct = 100 - t * 92;
    const opacity = 1 - t * 0.75;
    return { heightPct, opacity };
  });

  const railHeight = size === "compact" ? "h-6" : "h-12";

  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted)]">
        <span>Mainstream</span>
        <span>Hipster</span>
      </div>
      <motion.div
        className={`mt-2 flex ${railHeight} items-end gap-[3px]`}
        aria-hidden
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.025 } },
        }}
      >
        {bars.map((b, i) => (
          <motion.div
            key={i}
            className="flex-1 origin-bottom rounded-sm bg-[color:var(--accent)]"
            style={{ height: `${b.heightPct}%`, opacity: b.opacity }}
            variants={{
              hidden: { scaleY: 0 },
              visible: { scaleY: 1 },
            }}
            transition={{
              duration: 0.45,
              // Back-out cubic-bezier — quick rise with a touch of overshoot.
              ease: [0.34, 1.56, 0.64, 1],
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
