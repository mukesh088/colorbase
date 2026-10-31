import { isValidHex, normalizeHex } from "@/lib/colors/convert";
import { getAllLibraryColors, type LibraryColor } from "@/lib/data/color-library";
import { getAllBrandHexEntries, isUnverifiedBrandHex } from "@/lib/data/brands";
import { getCssNamedColors } from "@/lib/data/color-names";
import { HEX_REFERENCES } from "@/lib/data/hex-references";

export function isCuratedLibraryColor(color: Pick<LibraryColor, "sources">) {
  return color.sources.some((source) => source !== "generated");
}

let indexableHexes: Set<string> | undefined;

/**
 * Index only curated inventory: design-system colors, CSS names, verified brand
 * hexes, and hand-written hex references. Arbitrary search-landing RGB values
 * stay reachable at /color/{hex} but are noindex to avoid thin catalog bloat.
 */
function getIndexableHexes() {
  if (!indexableHexes) {
    indexableHexes = new Set<string>(
      HEX_REFERENCES.map((reference) => normalizeHex(reference.hex).slice(1))
    );
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
