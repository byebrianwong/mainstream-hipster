// Visual rail showing the mainstream→hipster gradient.
//
// 16 vertical bars descending in height from left to right. Tall bars on the
// left = "lots of attention" (mainstream); short bars on the right = "less
// attention" (hipster). Renders above the play board and the reveal list.

type Props = {
  /** Compact mode (smaller, used in tight spots). */
  size?: "default" | "compact";
};

const BAR_COUNT = 24;

export default function PopularityRail({ size = "default" }: Props) {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const t = i / (BAR_COUNT - 1); // 0 → 1
    // Linear decay — most legible "tall left → short right."
    const heightPct = 100 - t * 92;
    // Color fades from accent into muted as it gets more "hipster."
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
      <div
        className={`mt-2 flex ${railHeight} items-end gap-[3px]`}
        aria-hidden
      >
        {bars.map((b, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-[color:var(--accent)]"
            style={{ height: `${b.heightPct}%`, opacity: b.opacity }}
          />
        ))}
      </div>
    </div>
  );
}
