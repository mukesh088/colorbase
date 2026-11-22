"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type FlagCard = { slug: string; code: string; country: string; colors: string[]; letter: string };

/** Searchable, server-rendered grid of every flag (the full list is in the initial HTML). */
export function FlagBrowser({ flags }: { flags: FlagCard[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flags;
    return flags.filter(
      (f) => f.country.toLowerCase().includes(q) || f.colors.some((c) => c.toLowerCase().includes(q.replace(/^#?/, "#")))
    );
  }, [flags, query]);
  const letters = [...new Set(flags.map((f) => f.letter))];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Search countries or a HEX code</span>
          <Search aria-hidden className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a country or HEX (e.g. #FF9933)" className="pl-9" />
        </label>
        <p className="text-muted-foreground text-sm">
          {shown.length} of {flags.length} flags
        </p>
      </div>
      {!query && (
        <nav aria-label="Jump to letter" className="mt-4 flex flex-wrap gap-1.5 text-sm">
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} className="border-border hover:border-primary/50 rounded-md border px-2 py-1 font-medium uppercase">
              {l}
            </a>
          ))}
        </nav>
      )}
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((f, i) => {
          const firstOfLetter = !query && (i === 0 || shown[i - 1].letter !== f.letter);
          return (
            <li key={f.slug} id={firstOfLetter ? `letter-${f.letter}` : undefined} className="scroll-mt-24">
              <Link
                href={`/flags/${f.slug}`}
                className="group border-border/60 bg-card hover:border-primary/50 block overflow-hidden rounded-2xl border transition-shadow hover:shadow-md"
              >
                <span className="bg-muted/40 flex aspect-[3/2] items-center justify-center overflow-hidden p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://flagcdn.com/w320/${f.code}.png`}
                    alt={`Flag of ${f.country}`}
                    width={320}
                    height={213}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full w-auto rounded-sm object-contain shadow-sm transition-transform group-hover:scale-[1.03]"
                  />
                </span>
                <span className="block p-3">
                  <span className="block truncate text-sm font-medium">{f.country}</span>
                  <span className="mt-2 flex h-3 overflow-hidden rounded-full" aria-hidden>
                    {f.colors.map((c, j) => (
                      <span key={`${c}-${j}`} className="flex-1" style={{ background: c }} />
                    ))}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p className="text-muted-foreground mt-6 text-sm">No flag matches “{query}”.</p>}
    </div>
  );
}
