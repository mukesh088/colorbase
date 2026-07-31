import { generateHarmony, normalizeHex } from "@/lib/colors/convert";
import { checkContrast } from "@/lib/colors/convert";
import { hslSeedHex } from "@/lib/colors/spaces";
import { slugify } from "@/lib/utils";

export const PALETTE_CATEGORIES = [
  "business",
  "startup",
  "dashboard",
  "portfolio",
  "gaming",
  "healthcare",
  "finance",
  "education",
  "food",
  "nature",
  "travel",
  "fashion",
  "wedding",
  "festival",
  "dark",
  "light",
  "retro",
  "cyberpunk",
] as const;

export type PaletteCategory = (typeof PALETTE_CATEGORIES)[number];

export interface LibraryPalette {
  slug: string;
  name: string;
  category: PaletteCategory;
  colors: string[];
  accessibilityScore: number;
}

const HARMONIES = ["analogous", "triadic", "complementary", "tetradic", "monochromatic", "split-complementary"];

function scorePalette(colors: string[]) {
  let passes = 0;
  let total = 0;
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      total++;
      if (checkContrast(colors[i], colors[j]).ratio >= 3) passes++;
    }
  }
  return total === 0 ? 50 : Math.round((passes / total) * 100);
}

function buildPalettes(): LibraryPalette[] {
  const out: LibraryPalette[] = [];
  let n = 0;
  for (const category of PALETTE_CATEGORIES) {
    for (let i = 0; i < 80; i++) {
      const seed = 12000 + n * 59;
      const base = hslSeedHex(seed, {
        sMin: category === "light" ? 15 : category === "dark" ? 25 : 40,
        sMax: category === "cyberpunk" || category === "gaming" ? 100 : 85,
        lMin: category === "dark" ? 12 : category === "light" ? 70 : 30,
        lMax: category === "dark" ? 40 : category === "light" ? 92 : 65,
      });
      const harmony = HARMONIES[i % HARMONIES.length];
      const colors = generateHarmony(normalizeHex(base), harmony).map(normalizeHex);
      const name = `${category[0].toUpperCase()}${category.slice(1)} Palette ${i + 1}`;
      out.push({
        slug: slugify(name),
        name,
        category,
        colors,
        accessibilityScore: scorePalette(colors),
      });
      n++;
    }
  }
  return out;
}

let _cache: LibraryPalette[] | null = null;

export function getAllPalettes() {
  if (!_cache) _cache = buildPalettes();
  return _cache;
}

export function getPalette(slug: string) {
  return getAllPalettes().find((p) => p.slug === slug);
}

export function getPalettesByCategory(category: string) {
  return getAllPalettes().filter((p) => p.category === category);
}

export function searchPalettes(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return getAllPalettes().slice(0, 48);
  return getAllPalettes()
    .filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q))
    .slice(0, 80);
}

export function getRelatedPalettes(palette: LibraryPalette, count = 6) {
  return getPalettesByCategory(palette.category)
    .filter((p) => p.slug !== palette.slug)
    .slice(0, count);
}
