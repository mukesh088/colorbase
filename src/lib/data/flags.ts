import FLAGS_JSON from "@/lib/data/flags.json";

export type FlagColor = { name: string; hex: string; note?: string; /** % of the flag's area, when measured. */ share?: number };
export type FlagEntry = {
  slug: string;
  /** flagcdn.com code (ISO 3166-1 alpha-2, or gb-eng style subdivisions). */
  code: string;
  country: string;
  colors: FlagColor[];
  alternatives?: { label: string; colors: string[] }[];
  source: string;
  sourceNote: string;
  /** Set to true only after the owner has checked the values against the source. */
  verified: boolean;
};

const FLAGS = (FLAGS_JSON as FlagEntry[]).slice().sort((a, b) => a.country.localeCompare(b.country));

export function getAllFlags() {
  return FLAGS;
}

export function getFlag(slug: string) {
  return FLAGS.find((f) => f.slug === slug);
}

/** Only verified flags are indexed and listed in the sitemap. */
export function getIndexableFlags() {
  return FLAGS.filter((f) => f.verified);
}

/** Real flag artwork from flagcdn.com (PNG at a fixed width: 20–2560). */
export function flagImage(code: string, width: 80 | 160 | 320 | 640 | 1280 = 320) {
  return `https://flagcdn.com/w${width}/${code}.png`;
}

/** Flags that share the most color names with this one (ties broken alphabetically). */
export function similarFlags(flag: FlagEntry, count = 8) {
  const names = new Set(flag.colors.map((c) => c.name.replace(/ \d+$/, "").toLowerCase()));
  return FLAGS.filter((f) => f.slug !== flag.slug)
    .map((f) => {
      const other = new Set(f.colors.map((c) => c.name.replace(/ \d+$/, "").toLowerCase()));
      const shared = [...names].filter((n) => other.has(n)).length;
      return { f, score: shared / new Set([...names, ...other]).size };
    })
    .sort((a, b) => b.score - a.score || a.f.country.localeCompare(b.f.country))
    .slice(0, count)
    .map((x) => x.f);
}
