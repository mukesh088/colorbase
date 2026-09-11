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
  popular?: boolean;
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

const ADJECTIVES = [
  "Velvet", "Silent", "Amber", "Crystal", "Electric", "Misty", "Copper", "Ivory",
  "Neon", "Opal", "Ruby", "Sage", "Solar", "Twilight", "Arctic", "Bloom",
  "Cedar", "Cobalt", "Coral", "Dawn", "Ember", "Fable", "Frost", "Golden",
  "Harbor", "Indigo", "Jade", "Lagoon", "Maple", "Midnight", "Nimbus", "Orchid",
  "Pearl", "Quartz", "River", "Shadow", "Timber", "Ultraviolet", "Vivid", "Willow",
];

const NOUNS = [
  "Harbor", "Orchid", "Ember", "Tide", "Lantern", "Meadow", "Comet", "Dune",
  "Glacier", "Blossom", "Current", "Mirage", "Pavilion", "Sparrow", "Canyon", "Drift",
  "Eclipse", "Garden", "Horizon", "Island", "Jasmine", "Kite", "Lumen", "Monarch",
  "Nova", "Oasis", "Prism", "Quill", "Reef", "Summit", "Thistle", "Umbra",
  "Vesper", "Willow", "Yarrow", "Zephyr", "Arcade", "Breeze", "Cascade", "Delta",
  "Echo", "Flare",
];

type PopularDef = [string, GradientCategory, number, string[]];

const POPULAR: PopularDef[] = [
  ["Velvet Dawn", "sunset", 135, ["#FF9A9E", "#FECFEF", "#F6D365"]],
  ["Indigo Coast", "ocean", 120, ["#0F2027", "#203A43", "#2C5364"]],
  ["Peach Lantern", "pastel", 90, ["#FFECD2", "#FCB69F"]],
  ["Moss Circuit", "nature", 160, ["#134E5E", "#71B280"]],
  ["Neon Orchard", "neon", 45, ["#00F5A0", "#00D9F5"]],
  ["Copper Dusk", "luxury", 210, ["#B79891", "#94716B"]],
  ["Glacier Mint", "glass", 180, ["#D4FC79", "#96E6A1"]],
  ["Night Orchid", "dark", 135, ["#0F0C29", "#302B63", "#24243E"]],
  ["Solar Flare", "sunset", 45, ["#F12711", "#F5AF19"]],
  ["Arctic Harbor", "ocean", 200, ["#2193B0", "#6DD5ED"]],
  ["Rose Pavilion", "modern", 120, ["#EE9CA7", "#FFDDE1"]],
  ["Emerald Tide", "nature", 90, ["#11998E", "#38EF7D"]],
  ["Royal Umbra", "luxury", 160, ["#141E30", "#243B55"]],
  ["Candy Comet", "neon", 90, ["#FC466B", "#3F5EFB"]],
  ["Sand Mirage", "minimal", 180, ["#E6DADA", "#274046"]],
  ["Aurora Drift", "aurora", 130, ["#5F2C82", "#49A09D"]],
  ["Lumen Garden", "pastel", 60, ["#A1C4FD", "#C2E9FB"]],
  ["Crimson Summit", "sunset", 15, ["#CB2D3E", "#EF473A"]],
  ["Quiet Reef", "ocean", 165, ["#1A2980", "#26D0CE"]],
  ["Honey Canyon", "luxury", 45, ["#F2994A", "#F2C94C"]],
  ["Pixel Arcade", "gaming", 90, ["#7F00FF", "#E100FF"]],
  ["Foggy Meadow", "nature", 140, ["#56AB2F", "#A8E063"]],
  ["Paper Zephyr", "minimal", 180, ["#F5F7FA", "#C3CFE2"]],
  ["Magenta Nova", "mesh", 120, ["#C33764", "#1D2671"]],
  ["Sky Jasmine", "glass", 90, ["#89F7FE", "#66A6FF"]],
  ["Ink Vesper", "dark", 200, ["#232526", "#414345"]],
  ["Tangerine Kite", "sunset", 75, ["#F46B45", "#EEA849"]],
  ["Teal Horizon", "business", 135, ["#136A8A", "#267871"]],
  ["Berry Echo", "modern", 45, ["#834D9B", "#D04ED6"]],
  ["Lime Pulse", "neon", 160, ["#7B920A", "#ADD100"]],
  ["Slate Harbor", "business", 210, ["#2C3E50", "#4CA1AF"]],
  ["Blush Thistle", "pastel", 120, ["#FFAFBD", "#FFC3A0"]],
  ["Cobalt Flare", "aurora", 90, ["#000046", "#1CB5E0"]],
  ["Olive Timber", "nature", 30, ["#3C3B3F", "#605C3C"]],
  ["Orchid Breeze", "mesh", 60, ["#DA22FF", "#9733EE"]],
  ["Midnight Reef", "dark", 150, ["#000000", "#434343"]],
  ["Aqua Cascade", "ocean", 45, ["#00B4DB", "#0083B0"]],
  ["Marigold Dune", "sunset", 180, ["#F7971E", "#FFD200"]],
  ["Violet Quill", "luxury", 135, ["#4A00E0", "#8E2DE2"]],
  ["Seafoam Drift", "glass", 200, ["#43CEA2", "#185A9D"]],
  ["Cherry Lumen", "modern", 90, ["#ED213A", "#93291E"]],
  ["Frosted Pearl", "minimal", 120, ["#E0EAFC", "#CFDEF3"]],
  ["Lavender Dusk", "pastel", 140, ["#E0C3FC", "#8EC5FC"]],
  ["Ember Coast", "sunset", 25, ["#FF512F", "#F09819"]],
  ["Sage Pavilion", "nature", 155, ["#3CA55C", "#B5AC49"]],
  ["Electric Reef", "neon", 120, ["#00F260", "#0575E6"]],
  ["Onyx Mirror", "dark", 210, ["#111111", "#434343"]],
  ["Champagne Veil", "luxury", 60, ["#D1913C", "#FFD194"]],
  ["Coral Atoll", "ocean", 90, ["#FF6A88", "#FF99AC"]],
  ["Prism Wake", "mesh", 45, ["#FC5C7D", "#6A82FB"]],
  ["Ivory Haze", "minimal", 180, ["#ECE9E6", "#FFFFFF"]],
  ["Jade Lantern", "nature", 135, ["#00B09B", "#96C93D"]],
  ["Magma River", "sunset", 10, ["#C02425", "#F0CB35"]],
  ["Polar Silk", "glass", 200, ["#E6FFFA", "#B2F5EA"]],
  ["Neon Citrus", "neon", 75, ["#F9D423", "#FF4E50"]],
  ["Bordeaux Night", "luxury", 160, ["#4A0000", "#9A1750"]],
  ["Cerulean Bay", "ocean", 195, ["#36D1DC", "#5B86E5"]],
  ["Wisteria Fog", "pastel", 110, ["#D9AFD9", "#97D9E1"]],
  ["Graphite Pulse", "business", 135, ["#3A6073", "#16222A"]],
  ["Plasma Field", "gaming", 90, ["#F00000", "#DC281E"]],
  ["Moss Cathedral", "nature", 170, ["#2C7744", "#5A3F37"]],
  ["Apricot Glow", "sunset", 50, ["#FFB347", "#FFCC33"]],
  ["Indigo Silk", "aurora", 125, ["#667EEA", "#764BA2"]],
  ["Porcelain Drift", "minimal", 180, ["#FDFBFB", "#EBEDEE"]],
  ["Fuchsia Storm", "modern", 35, ["#F953C6", "#B91D73"]],
  ["Pine Shadow", "dark", 150, ["#0B3D2E", "#14532D"]],
  ["Gold Meridian", "luxury", 40, ["#F7E7CE", "#C9A227"]],
  ["Cyan Spark", "neon", 160, ["#00C9FF", "#92FE9D"]],
  ["Mauve Horizon", "pastel", 100, ["#E8CBC0", "#636FA4"]],
  ["Steel Current", "business", 220, ["#485563", "#29323C"]],
  ["Tropical Flare", "ocean", 70, ["#FF5F6D", "#FFC371"]],
  ["Amaranth Field", "modern", 85, ["#ED4264", "#FFEDBC"]],
  ["Smoke Quartz", "glass", 145, ["#D7D2CC", "#304352"]],
  ["Voltage Bloom", "gaming", 55, ["#00C6FF", "#0072FF"]],
  ["Terracotta Mesa", "sunset", 20, ["#C94B4B", "#4B134F"]],
  ["Baltic Ice", "ocean", 185, ["#83A4D4", "#B6FBFF"]],
  ["Lilac Mirage", "pastel", 130, ["#A18CD1", "#FBC2EB"]],
  ["Obsidian Tide", "dark", 200, ["#1F1C2C", "#928DAB"]],
  ["Chartreuse Beam", "neon", 95, ["#DCE35B", "#45B649"]],
  ["Bronze Harbor", "luxury", 30, ["#C79081", "#DFAF88"]],
  ["Mint Cathedral", "nature", 165, ["#96E6A1", "#D4FC79"]],
  ["Twilight Prism", "aurora", 115, ["#4E54C8", "#8F94FB"]],
];

function toGradient(
  name: string,
  category: GradientCategory,
  angle: number,
  colors: string[],
  popular = false
): LibraryGradient {
  const css = `linear-gradient(${angle}deg, ${colors.join(", ")})`;
  const slug = slugify(name);
  return {
    slug,
    name,
    category,
    angle,
    colors,
    css,
    tailwind: `bg-[linear-gradient(${angle}deg,${colors.join(",")})]`,
    scss: `$gradient-${slug}: ${css};`,
    popular,
  };
}

function poeticName(n: number) {
  const adj = ADJECTIVES[n % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(n / ADJECTIVES.length) % NOUNS.length];
  const cycle = Math.floor(n / (ADJECTIVES.length * NOUNS.length));
  return cycle > 0 ? `${adj} ${noun} ${cycle + 1}` : `${adj} ${noun}`;
}

function buildGradients(): LibraryGradient[] {
  const curated = POPULAR.map(([name, category, angle, colors]) =>
    toGradient(name, category, angle, colors, true)
  );
  const taken = new Set(curated.map((g) => g.slug));
  const generated: LibraryGradient[] = [];
  let n = 0;
  for (const category of GRADIENT_CATEGORIES) {
    const opts = CATEGORY_OPTS[category];
    for (let i = 0; i < 120; i++) {
      const seed = 8000 + n * 73;
      const rand = seededRandom(seed);
      const angle = Math.floor(rand() * 360);
      const colors = Array.from({ length: opts.stops }, (_, idx) => hslSeedHex(seed + idx * 19, opts));
      let name = poeticName(n);
      let slug = slugify(name);
      let extra = 2;
      while (taken.has(slug)) {
        name = `${poeticName(n)} ${extra}`;
        slug = slugify(name);
        extra += 1;
      }
      taken.add(slug);
      generated.push(toGradient(name, category, angle, colors));
      n += 1;
    }
  }
  return [...curated, ...generated];
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

export function getPopularGradients() {
  return getAllGradients().filter((g) => g.popular);
}

export function searchGradients(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return getPopularGradients();
  return getAllGradients()
    .filter((g) => g.name.toLowerCase().includes(q) || g.category.includes(q) || g.colors.some((c) => c.toLowerCase().includes(q.replace(/^#/, ""))))
    .slice(0, 80);
}
