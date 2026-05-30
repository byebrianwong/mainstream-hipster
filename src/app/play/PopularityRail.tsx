// The mainstream → hipster spectrum bar.
// - One continuous per-category gradient, just the two end labels.
// - Tapered: tall on the mainstream (left) side, curving down to thin on the
//   hipster (right) side, so the shape itself says "left is more popular."
// - A soft, slow shimmer drifts gently inside it (hidden under reduced-motion).

import { CATEGORY_STOPS } from "@/lib/categoryTheme";

type Props = {
  /** Per-category gradient stops. Defaults to the neutral "mixed" spectrum. */
  stops?: string[];
  /** Compact mode (smaller, used in tight spots). */
  size?: "default" | "compact";
};

export default function PopularityRail({ stops, size = "default" }: Props) {
  const ramp = stops ?? CATEGORY_STOPS.mixed;
  const key = ramp.join("").replace(/[^a-z0-9]/gi, "");
  const gid = `railg-${key}`;
  const sid = `rails-${key}`;
  const cid = `railc-${key}`;
  // tall on the left (top y≈6 → height ~22) curving to short on the right
  // (top y≈23 → height ~5). Bottom sits flat on the baseline.
  const PATH = "M0,6 C34,9 64,20 100,23 L100,28 L0,28 Z";
  const heightClass = size === "compact" ? "h-5" : "h-7";

  return (
    <div className="mb-5 w-full">
      <svg
        viewBox="0 0 100 28"
        preserveAspectRatio="none"
        className={`block w-full ${heightClass}`}
        aria-hidden
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
            {ramp.map((c, i) => (
              <stop key={i} offset={`${(i / (ramp.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
          <linearGradient id={sid} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={cid}>
            <path d={PATH} />
          </clipPath>
        </defs>

        <path d={PATH} fill={`url(#${gid})`} />

        <g clipPath={`url(#${cid})`}>
          <rect className="rail-shimmer" y="0" height="28" width="26" opacity="0.5" fill={`url(#${sid})`}>
            <animate attributeName="x" values="-26;100" dur="7.5s" repeatCount="indefinite" />
          </rect>
        </g>
      </svg>

      <div className="mt-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white mix-blend-difference">
        <span>Mainstream</span>
        <span>Hipster</span>
      </div>
    </div>
  );
}
