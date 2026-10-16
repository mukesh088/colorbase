import records from "./expanded-brands.json";
import type { BrandPalette } from "./brands";

/** One source-backed logo color per brand; no invented secondary swatches. */
export const EXPANDED_BRANDS: BrandPalette[] = records.map((record) => ({
  slug: record.slug,
  name: record.name,
  overview: `${record.name}'s Simple Icons reference color is ${record.hex.toUpperCase()}. ${record.guidelines ? "A published brand resource is linked below for checking logo usage and color specifications." : "The linked source identifies the artwork used for this color reference."}`,
  category: "Brands & products",
  primary: [record.hex],
  secondary: [],
  related: [],
  logoUrl: `https://cdn.simpleicons.org/${record.icon}/${record.hex.slice(1)}`,
  logoProvider: "simple-icons",
  sourceName: "Simple Icons",
  sourceUrl: record.source,
  guidelinesUrl: record.guidelines,
}));
