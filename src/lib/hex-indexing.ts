import { isValidHex, normalizeHex } from "@/lib/colors/convert";
import { getAllLibraryColors, type LibraryColor } from "@/lib/data/color-library";
import { getAllBrandHexEntries, isUnverifiedBrandHex } from "@/lib/data/brands";
import { getCssNamedColors } from "@/lib/data/color-names";
import { HEX_REFERENCES } from "@/lib/data/hex-references";
import { SEARCH_LANDING_HEXES } from "@/lib/data/search-landing-hexes";

export function isCuratedLibraryColor(color: Pick<LibraryColor, "sources">) {
  return color.sources.some((source) => source !== "generated");
}

let indexableHexes: Set<string> | undefined;

function getIndexableHexes() {
  if (!indexableHexes) {
    indexableHexes = new Set<string>([...SEARCH_LANDING_HEXES, ...HEX_REFERENCES.map((reference) => normalizeHex(reference.hex).slice(1))]);
    for (const color of getAllLibraryColors()) {
      if (isCuratedLibraryColor(color)) indexableHexes.add(normalizeHex(color.hex).slice(1));
    }
    for (const color of getCssNamedColors()) {
      indexableHexes.add(normalizeHex(color.hex).slice(1));
    }
    for (const entry of getAllBrandHexEntries()) {
      if (!isUnverifiedBrandHex(entry.brand, entry.hex)) indexableHexes.add(entry.hexSlug);
    }
  }
  return indexableHexes;
}

/** One inventory for metadata, static params, and sitemap discovery. */
export function getIndexableHexSlugs(): string[] {
  return [...getIndexableHexes()].sort();
}

export function isIndexableHex(hex: string): boolean {
  return isValidHex(hex) && getIndexableHexes().has(normalizeHex(hex).slice(1));
}
