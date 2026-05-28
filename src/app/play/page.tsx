import Link from "next/link";
import { Suspense } from "react";
import GameClient from "./GameClient";
import type { Category } from "@/lib/types";

type SP = { category?: string; size?: string };

const VALID: (Category | "mixed")[] = [
  "mixed",
  "music",
  "food",
  "drinks",
  "cities",
  "movies",
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

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <nav className="mb-8 flex items-center justify-between text-sm">
          <Link
            href="/"
            className="text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
          >
            ← back
          </Link>
          <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[color:var(--accent)]">
            {category}
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
    <div className="text-center text-[color:var(--muted)]">
      Loading round…
    </div>
  );
}
