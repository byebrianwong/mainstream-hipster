"use client";

import type { RoundResult, ScoredItem } from "@/lib/types";
import { SOURCE_LABEL } from "@/lib/popularity/types";
import type { SourceName } from "@/lib/popularity/types";
import clsx from "clsx";

type Props = {
  result: RoundResult;
  items: ScoredItem[];
  onReplay: () => void;
};

function formatNumber(n: number, unit: string): string {
  // TMDb popularity is a small float; everything else is a count.
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
  const entries = Object.entries(item.signals) as [SourceName, number][];
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

export default function Reveal({ result, items, onReplay }: Props) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const correctItems = result.correctOrder.map((id) => byId.get(id)!).filter(Boolean);
  const playerItems = result.playerOrder.map((id) => byId.get(id)!).filter(Boolean);
  const v = verdict(result.score);

  return (
    <div>
      <div className="mb-8 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            Round complete
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            <span className={v.tone}>{v.label}</span>
          </h2>
        </div>
        <div className="text-right">
          <div className="text-5xl font-semibold tabular-nums">
            {Math.round(result.score * 100)}
            <span className="text-xl text-[color:var(--muted)]">%</span>
          </div>
          <p className="text-xs text-[color:var(--muted)]">
            {result.pairsCorrect}/{result.pairsTotal} pairs correct
          </p>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="mb-3 text-xs uppercase tracking-wider text-[color:var(--muted)]">
          Actual ranking — hipster to mainstream
        </h3>
        <ol className="space-y-2">
          {correctItems.map((item, idx) => {
            const playerIdx = playerItems.findIndex((p) => p.id === item.id);
            const delta = playerIdx - idx;
            return (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--accent-soft)] text-sm font-semibold text-[color:var(--accent)]">
                  {idx + 1}
                </span>
                <span className="text-2xl">{item.emoji ?? "•"}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <SignalBadges item={item} />
                </div>
                <span
                  className={clsx(
                    "rounded-full px-2 py-1 text-xs font-medium",
                    delta === 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : Math.abs(delta) === 1
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
                  )}
                  title={delta === 0 ? "Exact match" : `Off by ${Math.abs(delta)}`}
                >
                  {delta === 0 ? "✓" : delta > 0 ? `+${delta}` : `${delta}`}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
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
      </div>
    </div>
  );
}
