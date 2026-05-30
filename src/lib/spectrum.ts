// Continuous-spectrum visual helpers for the game board.
//
// Nothing is "left side" or "right side": every card sits at a position
// t in [0,1] (0 = most mainstream, 1 = most hipster) and ALL of its visual
// properties interpolate continuously across that range.

export function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function toRGB(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Mix two hex colors, returns an rgb() string. */
export function mix(c1: string, c2: string, t: number): string {
  const a = toRGB(c1);
  const b = toRGB(c2);
  const k = clamp01(t);
  return `rgb(${Math.round(lerp(a[0], b[0], k))}, ${Math.round(
    lerp(a[1], b[1], k),
  )}, ${Math.round(lerp(a[2], b[2], k))})`;
}

/** Mix two hex colors with an alpha, returns an rgba() string. */
export function mixA(c1: string, c2: string, t: number, alpha: number): string {
  const a = toRGB(c1);
  const b = toRGB(c2);
  const k = clamp01(t);
  return `rgba(${Math.round(lerp(a[0], b[0], k))}, ${Math.round(
    lerp(a[1], b[1], k),
  )}, ${Math.round(lerp(a[2], b[2], k))}, ${alpha})`;
}

/** Sample a multi-stop gradient at position t in [0,1]. */
export function sample(stops: string[], t: number): string {
  if (stops.length === 1) return stops[0];
  const x = clamp01(t) * (stops.length - 1);
  const i = Math.floor(x);
  if (i >= stops.length - 1) return stops[stops.length - 1];
  return mix(stops[i], stops[i + 1], x - i);
}

/** Build a CSS linear-gradient string from stops, evenly spaced. */
export function gradientCss(stops: string[], angle = 105): string {
  const n = stops.length;
  const parts = stops.map((c, i) => `${c} ${Math.round((i / (n - 1)) * 100)}%`);
  return `linear-gradient(${angle}deg, ${parts.join(", ")})`;
}

/** Black or white — whichever is more readable on the given background colour.
 *  Accepts BOTH hex ("#1DB954") and rgb()/rgba() strings (what mix()/sample()
 *  return) — the rgb() case was silently producing NaN and always picking
 *  white, which made light cards unreadable. Uses perceived luminance. */
export function readableText(color: string): "#000000" | "#ffffff" {
  let r: number, g: number, b: number;
  if (color.trim().startsWith("rgb")) {
    const nums = color.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
    [r, g, b] = nums;
  } else {
    [r, g, b] = toRGB(color);
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}

// Endpoint palettes for the dark<->light frosted card panels. Cards stay legible
// at every t because the text colour is chosen (black/white) for contrast against
// the panel's lightness at that position.
const PANEL_DARK = "#0b0b12";
const PANEL_LIGHT = "#f5eedd";

export type Skin = {
  accent: string; // sampled spectrum color at this position
  panel: string; // frosted panel background (rgba)
  ink: string; // primary text color
  subInk: string; // secondary text color
  border: string; // border color (rgba)
  glow: number; // px blur radius for the accent glow (fades out toward hipster)
  rotate: number; // deg tilt (straight pop -> tilted handmade)
  radius: number; // px corner radius (rounded -> boxy zine)
  grain: number; // 0..1 grain overlay opacity (clean -> photocopied)
  mono: boolean; // monospace past the midpoint
};

/** Everything a card needs to render itself at position t on a given palette. */
export function cardSkin(t: number, stops: string[]): Skin {
  const k = clamp01(t);
  const accent = sample(stops, k);
  // Solid panel colour at this position; ink is chosen for contrast against it.
  const panelSolid = mix(PANEL_DARK, PANEL_LIGHT, k);
  return {
    accent,
    // More opaque than before so text isn't fighting the gradient bleeding
    // through — the middle cards were the unreadable ones.
    panel: mixA(PANEL_DARK, PANEL_LIGHT, k, 0.78),
    ink: readableText(panelSolid),
    subInk: accent,
    border: mixA("#ffffff", "#7a6d4d", k, lerp(0.35, 0.6, k)),
    glow: lerp(26, 0, k),
    rotate: lerp(0, -1.6, k),
    radius: lerp(18, 4, k),
    grain: lerp(0, 0.14, k),
    mono: k > 0.55,
  };
}
