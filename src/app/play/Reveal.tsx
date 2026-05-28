"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import type { RoundResult, ScoredItem } from "@/lib/types";
import { SOURCE_LABEL, SIGNAL_DISPLAY_ORDER } from "@/lib/popularity/types";
import clsx from "clsx";

type Phase = "guess" | "revealing" | "settled";

type Props = {
  result: RoundResult;
  items: ScoredItem[];
  onReplay: () => void;
  /**
   * Pin to a specific phase and skip auto-advance. Used by Storybook so
   * Chromatic snapshots are deterministic; production leaves this undefined
   * and the reveal animates through guess → revealing → settled.
   */
  pinnedPhase?: Phase;
};

function formatNumber(n: number, unit: string): string {
  if (unit === "popularity") return n.toFixed(1);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(Math.round(n));
}

function verdict(score: number): { label: string; tone: string } {
  if (score === 1) return { label: "Perfect taste calibration", tone: "text-emerald-600" };
  if (score >= 0.8) return { label: "Sharp instincts", tone: "text-emerald-600" };
  if (score >= 0.6) return { label: "Pretty good read", tone: "text-amber-600" };
  if (score >= 0.4) return { label: "Mixed signals", tone: "text-amber-600" };
  return { label: "Time to recalibrate", tone: "text-rose-600" };
}

function SignalBadges({ item }: { item: ScoredItem }) {
  // Render in canonical order, not whatever order the fetches resolved in.
  const entries = SIGNAL_DISPLAY_ORDER.flatMap((source) => {
    const value = item.signals[source];
    return value != null ? [[source, value] as const] : [];
  });
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[color:var(--muted)]">
      {entries.map(([source, value]) => {
        const meta = SOURCE_LABEL[source];
        return (
          <span key={source}>
            <span className="font-medium text-[color:var(--foreground)]/70">{meta.label}</span>{" "}
            {formatNumber(value, meta.unit)} {meta.unit}
          </span>
        );
      })}
    </div>
  );
}

export default function Reveal({ result, items, onReplay, pinnedPhase }: Props) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const correctItems = result.correctOrder.map((id) => byId.get(id)!).filter(Boolean);
  const playerItems = result.playerOrder.map((id) => byId.get(id)!).filter(Boolean);
  const v = verdict(result.score);

  const [phase, setPhase] = useState<Phase>(pinnedPhase ?? "guess");

  useEffect(() => {
    if (pinnedPhase) return; // story / test mode: don't auto-advance
    const t1 = setTimeout(() => setPhase("revealing"), 1300);
    const t2 = setTimeout(() => setPhase("settled"), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pinnedPhase]);

  // What order to render right now.
  const orderedItems = phase === "guess" ? playerItems : correctItems;

  return (
    <div>
      <div className="mb-8 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-6">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={phase === "guess" ? "guess" : "actual"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="inline-block"
              >
                {phase === "guess"
                  ? "Your guess"
                  : "Actual ranking — mainstream to hipster"}
              </motion.span>
            </AnimatePresence>
          </p>
          <AnimatePresence>
            {phase !== "guess" && (
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="mt-1 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
              >
                <span className={v.tone}>{v.label}</span>
              </motion.h2>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {phase !== "guess" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-right"
            >
              <div className="text-4xl font-semibold tabular-nums sm:text-5xl">
                {Math.round(result.score * 100)}
                <span className="text-xl text-[color:var(--muted)]">%</span>
              </div>
              <p className="text-xs text-[color:var(--muted)]">
                {result.pairsCorrect}/{result.pairsTotal} pairs correct
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-10">
        <LayoutGroup>
          <ol className="space-y-2">
            {orderedItems.map((item, idx) => {
              const correctIdx = correctItems.findIndex((c) => c.id === item.id);
              const playerIdx = playerItems.findIndex((p) => p.id === item.id);
              // Signed delta: positive = actual position number is greater
              // (item is further down / more hipster than the player guessed).
              const signedDelta = correctIdx - playerIdx;
              const absDelta = Math.abs(signedDelta);
              const correctPos = correctIdx + 1;
              const playerPos = playerIdx + 1;
              const noun = absDelta === 1 ? "position" : "positions";
              const direction = signedDelta > 0 ? "higher" : "lower";
              const tooltip =
                absDelta === 0
                  ? `Exact match — you placed it at #${playerPos}.`
                  : `The actual ranking #${correctPos} is ${absDelta} ${noun} ${direction} than your ranking of #${playerPos}.`;
              return (
                <motion.li
                  key={item.id}
                  layout
                  transition={{ type: "spring", damping: 30, stiffness: 220 }}
                  className="flex items-center gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--accent-soft)] text-sm font-semibold text-[color:var(--accent)]">
                    {phase === "guess" ? idx + 1 : correctIdx + 1}
                  </span>
                  <span className="text-2xl" aria-hidden>{item.emoji ?? "•"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <SignalBadges item={item} />
                  </div>
                  <AnimatePresence>
                    {phase === "settled" && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, delay: idx * 0.05 }}
                        className={clsx(
                          "cursor-help rounded-full px-2 py-1 text-xs font-medium tabular-nums",
                          absDelta === 0
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : absDelta === 1
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
                        )}
                        title={tooltip}
                      >
                        {absDelta === 0
                          ? "✓"
                          : signedDelta > 0
                            ? `+${absDelta}`
                            : `−${absDelta}`}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ol>
        </LayoutGroup>
      </div>

      <AnimatePresence>
        {phase === "settled" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <button
              onClick={onReplay}
              className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-base font-medium text-white shadow-[0_8px_24px_-8px_rgba(242,92,84,0.6)] transition hover:brightness-110"
            >
              New round
            </button>
            <a
              href="/"
              className="rounded-full border border-[color:var(--border)] px-6 py-3 text-center text-base font-medium transition hover:border-[color:var(--accent)]"
            >
              Change category
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
