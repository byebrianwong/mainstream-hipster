// Visual rail showing the mainstream→hipster gradient.
//
// A single smooth concave curve drops from the top-left immediately and tapers
// to a long flat tail on the right. Labels sit inside the rail. On mount the
// SVG layer reveals left-to-right while simultaneously rising bottom-to-top.
// The label layer is outside the animated wrapper so text doesn't get scaled.

type Props = {
  /** Compact mode (smaller, used in tight spots). */
  size?: "default" | "compact";
};

export default function PopularityRail({ size = "default" }: Props) {
  const railHeight = size === "compact" ? "h-12" : "h-20";

  // Concave decay: starts dropping from (0,0) immediately, bottoms out by
  // ~x=35, then a flat tail to the right. The previous version had a flat-top
  // segment that read as a "convex bulge" before the descent — gone.
  // viewBox 0..100 x 0..30. preserveAspectRatio="none" stretches horizontally.
  const curvePath = "M 0 0 C 8 22 35 28 100 28 L 100 30 L 0 30 Z";

  return (
    <div className="mb-6 w-full">
      <div className={`relative w-full ${railHeight} overflow-hidden rounded-md`}>
        {/* Animated layer (clip + rise). Labels live outside so they aren't scaled. */}
        <div className="reveal-ltr-rise absolute inset-0">
          <svg
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="popularity-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <path d={curvePath} fill="url(#popularity-grad)" />
          </svg>
        </div>

        {/* Labels — static, on top of the animated curve layer. */}
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.2em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
          Mainstream
        </span>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Hipster
        </span>
      </div>
    </div>
  );
}
