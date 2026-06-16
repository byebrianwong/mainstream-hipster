import Link from "next/link";
import { CATEGORIES } from "@/lib/items";
import { stopsFor, type CategoryKey } from "@/lib/categoryTheme";
import { gradientCss } from "@/lib/spectrum";

export default function Home() {
  const music = CATEGORIES.find((cat) => cat.id === "music");
  const rest = CATEGORIES.filter((cat) => cat.id !== "music");

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-16 sm:py-24">
      <main className="w-full max-w-3xl">
        <header className="mb-12 text-center sm:text-left">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
            A ranking game
          </p>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Mainstream
            <span className="text-[color:var(--accent)]"> / </span>
            Hipster
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[color:var(--muted)] sm:text-lg">
            You&rsquo;ll see a handful of things. Drag them from most mainstream
            (left) to most hipster (right). Score by how many pairs you ordered
            right against the real-world popularity data.
          </p>
        </header>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-[color:var(--muted)]">
            Pick a category
          </h2>

          {/* Music is the most fleshed-out deck — feature it above the rest. */}
          {music && (
            <Link
              href={`/play?category=${music.id}`}
              className="group mb-4 block overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.2)]"
            >
              {/* per-category spectrum swatch (mainstream → hipster) */}
              <div
                className="h-2.5 w-full"
                style={{ backgroundImage: gradientCss(stopsFor(music.id as CategoryKey), 90) }}
              />
              <div className="flex items-center gap-4 px-5 py-6">
                <span className="text-4xl sm:text-5xl" aria-hidden>
                  {music.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl font-semibold sm:text-2xl">
                      {music.label}
                    </span>
                    <span className="rounded-full bg-[color:var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                      Most complete
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    Hundreds of artists with real Spotify + Wikipedia data — the
                    fullest deck to rank.
                  </p>
                </div>
                <span className="self-center text-xl text-[color:var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]">
                  →
                </span>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rest.map((cat) => (
              <Link
                key={cat.id}
                href={`/play?category=${cat.id}`}
                className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)]"
              >
                {/* per-category spectrum swatch (mainstream → hipster) */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundImage: gradientCss(stopsFor(cat.id as CategoryKey), 90) }}
                />
                <div className="flex items-center gap-3 px-4 py-4">
                  <span className="text-2xl" aria-hidden>
                    {cat.emoji}
                  </span>
                  <span className="text-base font-medium">{cat.label}</span>
                  <span className="ml-auto text-[color:var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-16 text-xs text-[color:var(--muted)]">
          <p>
            Popularity is a per-category blend of public signals — Wikipedia
            pageviews plus a category source (Spotify, IMDb, Open Library, and
            more). Multiplayer with friends is coming.
          </p>
        </footer>
      </main>
    </div>
  );
}
