import Link from "next/link";
import { Suspense } from "react";
import GameClient from "./GameClient";
import GameBackground from "./GameBackground";
import type { Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/items";

type SP = { category?: string; size?: string };

const VALID: (Category | "mixed")[] = [
  "mixed",
  "music",
  "food",
  "drinks",
  "cities",
  "movies",
  "tv",
  "books",
  "brands",
  "hobbies",
  "tech",
  "animals",
];

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const rawCat = (sp.category ?? "mixed") as Category | "mixed";
  const category = VALID.includes(rawCat) ? rawCat : "mixed";
  const size = Math.min(Math.max(Number(sp.size ?? 4), 2), 5);
  const meta = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="relative flex flex-1 flex-col items-center px-6 py-10">
      {/* Full-bleed animated, per-category backdrop. */}
      <div className="fixed inset-0 -z-10">
        <GameBackground category={category} />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <nav className="mb-8 flex items-center justify-between text-sm">
          <Link
            href="/"
            className="text-white mix-blend-difference transition hover:underline"
          >
            ← back
          </Link>
          <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur">
            {meta?.emoji} {meta?.label ?? category}
          </span>
        </nav>

        <Suspense fallback={<LoadingState />}>
          <GameClient category={category} size={size} />
        </Suspense>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="py-16 text-center text-white mix-blend-difference">
      Loading round…
    </div>
  );
}
