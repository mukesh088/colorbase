import { familyFromHex, hslSeedHex } from "@/lib/colors/spaces";
import { psychologyForFamily } from "@/lib/data/families";
import { CSS_NAMED_COLORS } from "@/lib/colors/palettes";
import { normalizeHex } from "@/lib/colors/convert";
import { slugify } from "@/lib/utils";
import COMMUNITY_COLOR_NAMES from "./expanded-color-names.json";

const ADJECTIVES = [
  "Soft",
  "Deep",
  "Bright",
  "Muted",
  "Vivid",
  "Dusty",
  "Royal",
  "Neon",
  "Pale",
  "Rich",
  "Warm",
  "Cool",
  "Electric",
  "Misty",
  "Golden",
  "Silver",
  "Crystal",
  "Velvet",
  "Ocean",
  "Forest",
  "Sunset",
  "Midnight",
  "Dawn",
  "Twilight",
  "Arctic",
  "Tropical",
  "Desert",
  "Lavender",
  "Coral",
  "Amber",
  "Jade",
  "Ruby",
  "Sapphire",
  "Ivory",
  "Obsidian",
  "Pearl",
  "Copper",
  "Bronze",
  "Cherry",
  "Maple",
];

const NOUNS = [
  "Blush",
  "Flame",
  "Wave",
  "Sky",
  "Meadow",
  "Stone",
  "Bloom",
  "Shadow",
  "Glow",
  "Spark",
  "Mist",
  "Dusk",
  "Tide",
  "Grove",
  "Sand",
  "Frost",
  "Ember",
  "Petal",
  "Lagoon",
  "Canyon",
  "Orchid",
  "Cedar",
  "Maple",
  "Ink",
  "Cloud",
  "Berry",
  "Citrus",
  "Moss",
  "Clay",
  "Smoke",
];

export interface NamedColorEntry {
  slug: string;
  name: string;
  displayName: string;
  hex: string;
  meaning: string;
  history: string;
  usage: string;
  family: string;
  source: "css" | "community" | "catalog";
  sourceUrl?: string;
}

export function displayColorName(name: string) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
}

function buildNamedColors(): NamedColorEntry[] {
  const base: NamedColorEntry[] = CSS_NAMED_COLORS.map((c) => {
    const family = familyFromHex(c.hex);
    const hex = normalizeHex(c.hex);
    const displayName = displayColorName(c.name);
    return {
      slug: slugify(c.name),
      name: c.name,
      displayName,
      hex,
      meaning: psychologyForFamily(family),
      history: `${displayName} is a standard CSS/SVG named color used across browsers since early web standards.`,
      usage: `Use ${displayName} color in CSS as color: ${c.name.toLowerCase()}; or as ${hex}.`,
      family,
      source: "css",
    };
  });

  const published: NamedColorEntry[] = COMMUNITY_COLOR_NAMES.map((record) => {
    const family = familyFromHex(record.hex);
    return {
      slug: record.slug,
      name: record.name,
      displayName: record.name,
      hex: record.hex,
      family,
      source: "community",
      sourceUrl: "https://github.com/meodai/color-names/blob/main/src/colornames.csv",
      meaning: `${record.name} is mapped to ${record.hex.toUpperCase()} in the Color Names community dataset. Its calculated color family is ${family}; this name is a descriptive catalog label, not a CSS keyword.`,
      history: `This name and HEX pairing comes from David Aerne's Color Names project, distributed under the MIT license. Other catalogs may associate a similar name with a different HEX.`,
      usage: `Use ${record.hex} in CSS, for example color: ${record.hex}; or background-color: ${record.hex};. The name ${record.name} is not a browser-supported CSS color keyword. Check the exact foreground/background pair before using it for text.`,
    };
  });
  const generated: NamedColorEntry[] = [];
  for (let i = 0; i < 2000; i++) {
    const adj = ADJECTIVES[i % ADJECTIVES.length];
    const noun = NOUNS[Math.floor(i / ADJECTIVES.length) % NOUNS.length];
    const name = `${adj} ${noun} ${Math.floor(i / (ADJECTIVES.length * NOUNS.length)) + 1}`
      .replace(/ 1$/, "")
      .trim();
    const hex = hslSeedHex(5000 + i * 41);
    const family = familyFromHex(hex);
    const slug = slugify(name);
    if (base.some((b) => b.slug === slug) || generated.some((g) => g.slug === slug)) continue;
    generated.push({
      slug,
      name,
      displayName: name,
      hex,
      meaning: psychologyForFamily(family),
      history: `${name} is a ColorBase-generated inspiration name mapped to ${hex}, not a standard CSS keyword or a historical color name.`,
      usage: `Ideal for UI accents, brand explorations, and palette building in the ${family} family.`,
      family,
      source: "catalog",
    });
  }

  return [...base, ...published, ...generated];
}

let _cache: NamedColorEntry[] | null = null;
let namesBySlug: Map<string, NamedColorEntry> | undefined;

export function getAllNamedColors() {
  if (!_cache) _cache = buildNamedColors();
  return _cache;
}

export function getNamedColor(slug: string) {
  namesBySlug ??= new Map(getAllNamedColors().map((color) => [color.slug, color]));
  return namesBySlug.get(slug);
}

export function getCssNamedColors() {
  return getAllNamedColors().filter((c) => c.source === "css");
}

/** Only published CSS and attributed community records belong in the sitemap. */
export function getIndexableNamedColors() {
  return getAllNamedColors().filter((color) => color.source !== "catalog");
}

export function searchNamedColors(query: string) {
  const q = query
    .toLowerCase()
    .trim()
    .replace(/\b(colors?|colours?|hex|code|css|named)\b/g, " ")
    .replace(/[#]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!q) return getAllNamedColors().slice(0, 60);
  return getAllNamedColors()
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.displayName.toLowerCase().includes(q) ||
        c.slug.includes(q.replace(/\s+/g, "")) ||
        c.hex.toLowerCase().includes(q) ||
        c.family.includes(q)
    )
    .slice(0, 100);
}

export function getNamedColorsByFamily(family: string) {
  return getAllNamedColors().filter((c) => c.family === family);
}

export function getNamedColorFamilies() {
  return [...new Set(getAllNamedColors().map((c) => c.family))].sort();
}

export function getFeaturedNamedColors(count = 60) {
  // Prefer classic CSS named colors first, then fill with curated names
  const all = getAllNamedColors();
  const classic = all.filter((c) =>
    [
      "red",
      "blue",
      "green",
      "gold",
      "coral",
      "tomato",
      "crimson",
      "indigo",
      "teal",
      "orange",
      "violet",
      "salmon",
      "khaki",
      "orchid",
      "turquoise",
      "lavender",
      "navy",
      "maroon",
      "olive",
      "cyan",
      "magenta",
      "pink",
      "purple",
      "brown",
      "chocolate",
      "peru",
      "tan",
      "wheat",
      "azure",
      "ivory",
      "snow",
      "black",
      "white",
      "gray",
      "silver",
      "deeppink",
      "hotpink",
      "lightblue",
      "skyblue",
      "dodgerblue",
      "steelblue",
      "seagreen",
      "limegreen",
      "forestgreen",
      "darkorange",
      "royalblue",
      "mediumvioletred",
      "slateblue",
    ].includes(c.slug)
  );
  const rest = all.filter((c) => !classic.some((x) => x.slug === c.slug));
  return [...classic, ...rest].slice(0, count);
}
