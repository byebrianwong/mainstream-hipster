import { NextResponse } from "next/server";
import { buildRound } from "@/lib/game";
import type { Category } from "@/lib/types";

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

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryParam = (url.searchParams.get("category") ?? "mixed") as Category | "mixed";
  const category = VALID.includes(categoryParam) ? categoryParam : "mixed";
  const size = Math.min(Math.max(Number(url.searchParams.get("size") ?? 4), 2), 5);

  try {
    const items = await buildRound(category, size);
    if (items.length < 2) {
      return NextResponse.json(
        { error: "Not enough items with pageview data" },
        { status: 503 },
      );
    }
    return NextResponse.json({ items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
