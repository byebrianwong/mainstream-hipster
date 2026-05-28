// Visual rail showing the mainstream→hipster gradient.
//
// A single smooth curve descends from "tall" on the left (mainstream) to
// "near-baseline" on the right (hipster). Filled with a horizontal gradient
// that fades from accent into the background. Labels sit inside the rail.
//
// The reveal animation (left-to-right clip) is pure CSS via the
// `reveal-ltr` utility in globals.css — that combo of clipPath + Motion
// + HMR + nested mounts was unreliable.

type Props = {
  /** Compact mode (smaller, used in tight spots). */
  size?: "default" | "compact";
};

export default function PopularityRail({ size = "default" }: Props) {
  const railHeight = size === "compact" ? "h-12" : "h-20";

  // Cubic bezier: flat-ish start, steep middle, gentle tail.
  // viewBox 0..100 x 0..30. preserveAspectRatio="none" stretches horizontally.
  const curvePath = "M 0 1 C 22 1 55 24 100 27 L 100 30 L 0 30 Z";

  return (
    <div className="mb-6 w-full">
      <div
        className={`reveal-ltr relative w-full ${railHeight} overflow-hidden rounded-md`}
        aria-hidden
      >
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="popularity-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d={curvePath} fill="url(#popularity-grad)" />
        </svg>

        {/* Labels sit inside the rail. Mainstream: white on the accent area.
            Hipster: muted/foreground on the dark side where the curve is low. */}
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
