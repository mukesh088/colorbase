import { hslSeedHex, seededRandom } from "@/lib/colors/spaces";
import { slugify } from "@/lib/utils";

export const GRADIENT_CATEGORIES = [
  "modern",
  "business",
  "nature",
  "ocean",
  "sunset",
  "pastel",
  "neon",
  "dark",
  "luxury",
  "gaming",
  "glass",
  "aurora",
  "mesh",
  "minimal",
] as const;

export type GradientCategory = (typeof GRADIENT_CATEGORIES)[number];

export interface LibraryGradient {
  slug: string;
  name: string;
  category: GradientCategory;
  angle: number;
  colors: string[];
  css: string;
  tailwind: string;
  scss: string;
}

const CATEGORY_OPTS: Record<
  GradientCategory,
  { sMin: number; sMax: number; lMin: number; lMax: number; stops: number }
> = {
  modern: { sMin: 45, sMax: 85, lMin: 40, lMax: 65, stops: 2 },
  business: { sMin: 30, sMax: 70, lMin: 28, lMax: 55, stops: 2 },
  nature: { sMin: 35, sMax: 80, lMin: 30, lMax: 60, stops: 3 },
  ocean: { sMin: 40, sMax: 90, lMin: 35, lMax: 60, stops: 3 },
  sunset: { sMin: 55, sMax: 95, lMin: 40, lMax: 65, stops: 3 },
  pastel: { sMin: 20, sMax: 45, lMin: 70, lMax: 88, stops: 3 },
  neon: { sMin: 80, sMax: 100, lMin: 45, lMax: 60, stops: 2 },
  dark: { sMin: 20, sMax: 60, lMin: 8, lMax: 28, stops: 2 },
  luxury: { sMin: 25, sMax: 70, lMin: 18, lMax: 45, stops: 2 },
  gaming: { sMin: 70, sMax: 100, lMin: 35, lMax: 55, stops: 3 },
  glass: { sMin: 15, sMax: 40, lMin: 75, lMax: 92, stops: 2 },
  aurora: { sMin: 50, sMax: 95, lMin: 40, lMax: 60, stops: 4 },
  mesh: { sMin: 40, sMax: 85, lMin: 35, lMax: 70, stops: 4 },
  minimal: { sMin: 5, sMax: 25, lMin: 85, lMax: 96, stops: 2 },
};

const TITLES = ["Horizon", "Pulse", "Drift", "Bloom", "Nova", "Cascade", "Echo", "Prism", "Flux", "Aura"];

function buildGradients(): LibraryGradient[] {
  const out: LibraryGradient[] = [];
  let n = 0;
  for (const category of GRADIENT_CATEGORIES) {
    const opts = CATEGORY_OPTS[category];
    for (let i = 0; i < 120; i++) {
      const seed = 8000 + n * 73;
      const rand = seededRandom(seed);
      const angle = Math.floor(rand() * 360);
      const colors = Array.from({ length: opts.stops }, (_, idx) =>
        hslSeedHex(seed + idx * 19, opts)
      );
      const name = `${category[0].toUpperCase()}${category.slice(1)} ${TITLES[i % TITLES.length]} ${i + 1}`;
      const css = `linear-gradient(${angle}deg, ${colors.join(", ")})`;
      out.push({
        slug: slugify(name),
        name,
        category,
        angle,
        colors,
        css,
        tailwind: `bg-[linear-gradient(${angle}deg,${colors.join(",")})]`,
        scss: `$gradient-${slugify(name)}: ${css};`,
      });
      n++;
    }
  }
  return out;
}

let _cache: LibraryGradient[] | null = null;

export function getAllGradients() {
  if (!_cache) _cache = buildGradients();
  return _cache;
}

export function getGradient(slug: string) {
  return getAllGradients().find((g) => g.slug === slug);
}

export function getGradientsByCategory(category: string) {
  return getAllGradients().filter((g) => g.category === category);
}

export function searchGradients(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return getAllGradients().slice(0, 48);
  return getAllGradients()
    .filter((g) => g.name.toLowerCase().includes(q) || g.category.includes(q))
    .slice(0, 80);
}
