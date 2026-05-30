"use client";

// Per-category animated background motif for the game board. Each returns an
// absolutely-positioned, full-bleed, pointer-events-none layer. `tint` is the
// category's mid-spectrum colour so motifs read against the newsprint base.
//
// Keyframes (spectrum-eq, press-film, press-projector, press-scan, …) live in
// globals.css and all respect prefers-reduced-motion.

import { sample } from "@/lib/spectrum";
import { stopsFor, motifFor, type CategoryKey } from "@/lib/categoryTheme";

type MotifProps = { tint: string };

/* ---------------------------------------------------------------- music */
// Static integer heights (px) — deterministic so SSR/client match (Math.sin
// floats caused a hydration mismatch).
const EQ_HEIGHTS = [
  54, 96, 40, 120, 70, 104, 48, 116, 62, 88, 44, 110, 76, 98, 52, 124, 66, 92,
  46, 112, 72, 100, 58, 118, 50, 84,
];
function Music({ tint }: MotifProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex items-end justify-center gap-1.5 px-6 pb-6 opacity-85">
        {EQ_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className="spectrum-eq w-2.5 rounded-t shadow-[0_0_12px_-2px_#1DB954]"
            style={{
              height: `${h}px`,
              backgroundImage: "linear-gradient(to top, #0a3d1f, #1DB954)",
              animationName: "spectrum-eq",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDuration: `${0.55 + (i % 6) * 0.12}s`,
              animationDelay: `${i * 0.045}s`,
            }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute -bottom-20 -right-20 opacity-30">
        <div
          className="press-spin h-56 w-56 rounded-full"
          style={{
            backgroundImage: `repeating-radial-gradient(circle at center, ${tint} 0 1px, transparent 1px 6px), radial-gradient(circle at center, #f4efe2 0 14%, ${tint} 14.5% 17%, transparent 17.5%)`,
          }}
        />
      </div>
    </>
  );
}

/* --------------------------------------------------------------- movies */
function Movies({ tint }: MotifProps) {
  const frame = `repeating-linear-gradient(90deg, transparent 0 6px, ${tint}66 6px 74px, transparent 74px 80px)`;
  const holes =
    "repeating-linear-gradient(90deg, #efe9da 0 10px, transparent 10px 20px)";
  const Strip = ({ dur }: { dur: string }) => (
    <div className="relative h-24 w-full" style={{ backgroundColor: "#171410" }}>
      <div
        className="press-film absolute inset-x-0 top-3 bottom-3"
        style={{ backgroundImage: frame, animationDuration: dur }}
      />
      <div
        className="press-film absolute inset-x-0 top-1 h-2"
        style={{ backgroundImage: holes, animationDuration: dur }}
      />
      <div
        className="press-film absolute inset-x-0 bottom-1 h-2"
        style={{ backgroundImage: holes, animationDuration: dur }}
      />
    </div>
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-6%] top-[20%] w-[112%] -rotate-3 opacity-45">
        <Strip dur="2.4s" />
      </div>
      <div className="absolute left-[-6%] bottom-[15%] w-[112%] rotate-2 opacity-40">
        <Strip dur="3.4s" />
      </div>
      <div
        className="press-projector absolute inset-0"
        style={{ backgroundColor: "#000" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.22))",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------- tv */
function TV({ tint }: MotifProps) {
  const bars = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 flex opacity-25">
        {bars.map((c) => (
          <div key={c} className="h-full flex-1" style={{ background: c }} />
        ))}
      </div>
      <div
        className="press-flicker absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 3px)",
        }}
      />
      <div
        className="press-scan absolute inset-x-0 h-28"
        style={{ background: `linear-gradient(180deg, transparent, ${tint}, transparent)`, opacity: 0.5 }}
      />
      <div className="absolute right-8 top-24 font-mono text-sm font-bold tracking-widest text-black/50">
        CH 03 ▮
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- books */
function Books({ tint }: MotifProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-55">
      <div
        className="absolute left-[10%] top-24 bottom-24 w-[34%]"
        style={{ backgroundImage: `repeating-linear-gradient(0deg, ${tint} 0 2px, transparent 2px 18px)`, opacity: 0.3 }}
      />
      <div
        className="absolute right-[10%] top-24 bottom-24 w-[34%]"
        style={{ backgroundImage: `repeating-linear-gradient(0deg, ${tint} 0 2px, transparent 2px 18px)`, opacity: 0.3 }}
      />
      <div className="press-read absolute left-[10%] h-4 w-[34%]" style={{ background: tint, opacity: 0.5 }} />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2" style={{ perspective: "600px" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="press-flip absolute h-24 w-16 border"
            style={{ borderColor: `${tint}aa`, background: "#f3eedd", animationDelay: `${i * 1.1}s`, left: i * 2 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- food */
function Food({ tint }: MotifProps) {
  const wisps = [30, 42, 50, 58, 70];
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 opacity-60">
      <div className="absolute inset-x-[28%] bottom-16 h-1 rounded-full" style={{ background: `${tint}88` }} />
      {wisps.map((left, i) => (
        <span
          key={i}
          className="press-wisp absolute bottom-16 w-2 rounded-full blur-[3px]"
          style={{
            left: `${left}%`,
            height: `${70 + (i % 3) * 30}px`,
            background: `linear-gradient(to top, ${tint}, transparent)`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${3.8 + (i % 3) * 0.6}s`,
          }}
        />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- drinks */
function Drinks({ tint }: MotifProps) {
  const bubbles = Array.from({ length: 22 }, (_, i) => ({
    left: 6 + ((i * 4.3) % 88),
    size: 5 + ((i * 7) % 18),
    delay: (i % 9) * 0.4,
    dur: 2.8 + (i % 5) * 0.5,
  }));
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-full opacity-60">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="press-bubble absolute bottom-0 rounded-full border"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            borderColor: tint,
            background: `radial-gradient(circle at 30% 30%, #ffffffaa, ${tint}44)`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- tech */
function Tech({ tint }: MotifProps) {
  const cols = Array.from({ length: 22 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden font-mono text-xs opacity-45">
      {cols.map((c) => (
        <span
          key={c}
          className="press-binary absolute top-0 whitespace-pre leading-4"
          style={{
            left: `${(c / cols.length) * 100}%`,
            color: tint,
            WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 18%, transparent 70%)",
            maskImage: "linear-gradient(180deg, #000 0%, #000 18%, transparent 70%)",
            animationDelay: `${(c % 7) * 0.35}s`,
            animationDuration: `${2.2 + (c % 6) * 0.5}s`,
          }}
        >
          {"1\n0\n1\n1\n0\n1\n0\n0\n1\n1\n0\n1\n0\n1\n1"}
        </span>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- cities */
function Cities({ tint }: MotifProps) {
  const buildings = [
    { w: 8, h: 42, cols: 2 },
    { w: 10, h: 64, cols: 3 },
    { w: 7, h: 36, cols: 2 },
    { w: 12, h: 80, cols: 3 },
    { w: 9, h: 52, cols: 2 },
    { w: 11, h: 70, cols: 3 },
    { w: 7, h: 44, cols: 2 },
    { w: 10, h: 58, cols: 3 },
    { w: 8, h: 38, cols: 2 },
  ];
  let key = 0;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-1.5 px-6 opacity-70">
      {buildings.map((b, bi) => (
        <div
          key={bi}
          className="relative flex flex-wrap content-start gap-1 p-1"
          style={{ width: `${b.w}%`, height: `${b.h}%`, background: `${tint}cc` }}
        >
          {Array.from({ length: b.cols * Math.round(b.h / 12) }, () => {
            const k = key++;
            return (
              <span
                key={k}
                className="press-blink h-1.5 w-1.5 rounded-[1px] bg-[#fff4cc]"
                style={{ animationDelay: `${(k % 11) * 0.27}s`, animationDuration: `${1.6 + (k % 5) * 0.4}s` }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- animals */
function Animals({ tint }: MotifProps) {
  const paws = Array.from({ length: 10 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {paws.map((p) => {
        const up = p % 2 === 0;
        return (
          <span
            key={p}
            className="press-paw absolute text-2xl"
            style={
              {
                left: `${6 + p * 9}%`,
                top: `${72 - p * 6 + (up ? -4 : 4)}%`,
                color: tint,
                opacity: 0.6,
                ["--paw-rot" as string]: `${up ? -25 : 25}deg`,
                animationDelay: `${p * 0.3}s`,
              } as React.CSSProperties
            }
          >
            🐾
          </span>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------- generic */
// Fallback for categories without a dedicated motif (brands, hobbies, mixed):
// a few soft blobs drifting through the middle for gentle ambient motion.
function Generic({ tint }: MotifProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="spectrum-blob-a absolute left-1/3 top-1/2 h-[55vh] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: tint, mixBlendMode: "soft-light", opacity: 0.7 }}
      />
      <div
        className="spectrum-blob-b absolute left-2/3 top-1/2 h-[45vh] w-[34vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: tint, mixBlendMode: "soft-light", opacity: 0.55 }}
      />
    </div>
  );
}

const MOTIFS: Record<string, (p: MotifProps) => React.ReactNode> = {
  music: Music,
  movies: Movies,
  tv: TV,
  books: Books,
  food: Food,
  drinks: Drinks,
  tech: Tech,
  cities: Cities,
  animals: Animals,
  generic: Generic,
};

export default function CategoryMotif({ category }: { category: CategoryKey }) {
  const stops = stopsFor(category);
  const tint = sample(stops, 0.5);
  const M = MOTIFS[motifFor(category)] ?? Generic;
  return <>{M({ tint })}</>;
}
