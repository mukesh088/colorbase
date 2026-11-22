import FLAGS_JSON from "@/lib/data/flags.json";

export type FlagColor = { name: string; hex: string; note?: string };
export type FlagEntry = {
  slug: string;
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
