import { CSS_NAMED_COLORS, MATERIAL_COLORS, TAILWIND_COLORS, BOOTSTRAP_COLORS } from "@/lib/colors/palettes";
import { familyFromHex, hslSeedHex } from "@/lib/colors/spaces";
import { normalizeHex, rgbToHex } from "@/lib/colors/convert";
import { slugify } from "@/lib/utils";
import type { ColorFamily } from "@/lib/data/families";

export type ColorSource =
  | "html"
  | "css-named"
  | "svg"
  | "web-safe"
  | "tailwind"
  | "bootstrap"
  | "material"
  | "fluent"
  | "apple"
  | "android"
  | "chakra"
  | "antd"
  | "radix"
  | "primereact"
  | "generated";

export interface LibraryColor {
  slug: string;
  name: string;
  hex: string;
  family: ColorFamily | string;
  sources: ColorSource[];
  kit?: string;
  shade?: string;
}

function webSafeColors(): LibraryColor[] {
  const colors: LibraryColor[] = [];
  const steps = [0, 51, 102, 153, 204, 255];
  for (const r of steps) {
    for (const g of steps) {
      for (const b of steps) {
        const hex = rgbToHex({ r, g, b });
        colors.push({
          slug: `websafe-${hex.slice(1)}`,
          name: `Web Safe ${hex.toUpperCase()}`,
          hex,
          family: familyFromHex(hex),
          sources: ["web-safe"],
        });
      }
    }
  }
  return colors;
}

const FLUENT: Record<string, string> = {
  "Fluent Blue": "#0078D4",
  "Fluent Navy": "#004E8C",
  "Fluent Teal": "#00B7C3",
  "Fluent Green": "#107C10",
  "Fluent Purple": "#5C2D91",
  "Fluent Magenta": "#B4009E",
  "Fluent Red": "#D13438",
  "Fluent Orange": "#CA5010",
  "Fluent Yellow": "#FCE100",
  "Fluent Gray": "#605E5C",
};

const APPLE: Record<string, string> = {
  "System Blue": "#007AFF",
  "System Green": "#34C759",
  "System Indigo": "#5856D6",
  "System Orange": "#FF9500",
  "System Pink": "#FF2D55",
  "System Purple": "#AF52DE",
  "System Red": "#FF3B30",
  "System Teal": "#5AC8FA",
  "System Yellow": "#FFCC00",
  "System Gray": "#8E8E93",
  "Label Primary": "#000000",
  "Fill Tertiary": "#78788033",
};

const ANDROID: Record<string, string> = {
  "Material You Primary": "#6750A4",
  "Material You Secondary": "#625B71",
  "Material You Tertiary": "#7D5260",
  "Material You Error": "#B3261E",
  "Material You Neutral": "#938F99",
  "Material You Surface": "#FFFBFE",
  "Material You On Surface": "#1C1B1F",
};

const CHAKRA: Record<string, Record<string, string>> = {
  blue: { "400": "#63B3ED", "500": "#4299E1", "600": "#3182CE" },
  teal: { "400": "#4FD1C5", "500": "#38B2AC", "600": "#319795" },
  purple: { "400": "#B794F4", "500": "#9F7AEA", "600": "#805AD5" },
  pink: { "400": "#F687B3", "500": "#ED64A6", "600": "#D53F8C" },
  orange: { "400": "#F6AD55", "500": "#ED8936", "600": "#DD6B20" },
  red: { "400": "#FC8181", "500": "#F56565", "600": "#E53E3E" },
  gray: { "400": "#A0AEC0", "500": "#718096", "600": "#4A5568" },
};

const ANTD: Record<string, string> = {
  "Ant Primary": "#1677FF",
  "Ant Success": "#52C41A",
  "Ant Warning": "#FAAD14",
  "Ant Error": "#FF4D4F",
  "Ant Info": "#1677FF",
  "Ant Geek Blue": "#2F54EB",
  "Ant Magenta": "#EB2F96",
  "Ant Volcano": "#FA541C",
  "Ant Gold": "#FAAD14",
  "Ant Lime": "#A0D911",
  "Ant Cyan": "#13C2C2",
};

const RADIX: Record<string, string> = {
  "Radix Indigo 9": "#3E63DD",
  "Radix Cyan 9": "#00A2C7",
  "Radix Teal 9": "#12A594",
  "Radix Green 9": "#30A46C",
  "Radix Grass 9": "#46A758",
  "Radix Orange 9": "#F76B15",
  "Radix Tomato 9": "#E54D2E",
  "Radix Red 9": "#E5484D",
  "Radix Crimson 9": "#E93D82",
  "Radix Violet 9": "#6E56CF",
  "Radix Purple 9": "#AB4ABA",
  "Radix Pink 9": "#D6409F",
};

const PRIME: Record<string, string> = {
  "Prime Blue": "#3B82F6",
  "Prime Green": "#22C55E",
  "Prime Yellow": "#EAB308",
  "Prime Cyan": "#06B6D4",
  "Prime Pink": "#EC4899",
  "Prime Indigo": "#6366F1",
  "Prime Teal": "#14B8A6",
  "Prime Orange": "#F97316",
  "Prime Purple": "#A855F7",
  "Prime Red": "#EF4444",
  "Prime Surface": "#FFFFFF",
  "Prime Ground": "#F8FAFC",
};

function fromMap(map: Record<string, string>, source: ColorSource, kit: string): LibraryColor[] {
  return Object.entries(map).map(([name, hex]) => ({
    slug: slugify(`${kit}-${name}`),
    name,
    hex: normalizeHex(hex),
    family: familyFromHex(hex),
    sources: [source],
    kit,
  }));
}

function fromShades(
  groups: Record<string, Record<string, string>>,
  source: ColorSource,
  kit: string
): LibraryColor[] {
  const out: LibraryColor[] = [];
  for (const [group, shades] of Object.entries(groups)) {
    for (const [shade, hex] of Object.entries(shades)) {
      out.push({
        slug: slugify(`${kit}-${group}-${shade}`),
        name: `${kit} ${group} ${shade}`,
        hex: normalizeHex(hex),
        family: familyFromHex(hex),
        sources: [source],
        kit,
        shade,
      });
    }
  }
  return out;
}

function generatedLibraryColors(count = 900): LibraryColor[] {
  const out: LibraryColor[] = [];
  for (let i = 0; i < count; i++) {
    const hex = hslSeedHex(1000 + i * 97);
    out.push({
      slug: `color-${hex.slice(1)}`,
      name: `Spectrum ${hex.toUpperCase()}`,
      hex,
      family: familyFromHex(hex),
      sources: ["generated"],
    });
  }
  return out;
}

let _cache: LibraryColor[] | null = null;

export function getAllLibraryColors(): LibraryColor[] {
  if (_cache) return _cache;

  const named = CSS_NAMED_COLORS.map((c) => ({
    slug: slugify(c.name),
    name: c.name,
    hex: normalizeHex(c.hex),
    family: familyFromHex(c.hex),
    sources: ["html", "css-named", "svg"] as ColorSource[],
  }));

  const material = fromShades(MATERIAL_COLORS, "material", "Material");
  const tailwind = fromShades(TAILWIND_COLORS, "tailwind", "Tailwind");
  const bootstrap = Object.entries(BOOTSTRAP_COLORS).map(([name, hex]) => ({
    slug: slugify(`bootstrap-${name}`),
    name: `Bootstrap ${name}`,
    hex: normalizeHex(hex),
    family: familyFromHex(hex),
    sources: ["bootstrap"] as ColorSource[],
    kit: "Bootstrap",
  }));

  const merged = new Map<string, LibraryColor>();
  const push = (c: LibraryColor) => {
    const key = normalizeHex(c.hex).toLowerCase();
    const existing = merged.get(key);
    if (existing) {
      existing.sources = [...new Set([...existing.sources, ...c.sources])];
      if (!existing.name || existing.sources.includes("generated")) {
        if (!c.sources.includes("generated")) existing.name = c.name;
      }
      return;
    }
    merged.set(key, { ...c });
  };

  [
    ...named,
    ...webSafeColors(),
    ...material,
    ...tailwind,
    ...bootstrap,
    ...fromMap(FLUENT, "fluent", "Fluent"),
    ...fromMap(APPLE, "apple", "Apple"),
    ...fromMap(ANDROID, "android", "Android"),
    ...fromShades(CHAKRA, "chakra", "Chakra"),
    ...fromMap(ANTD, "antd", "Ant Design"),
    ...fromMap(RADIX, "radix", "Radix"),
    ...fromMap(PRIME, "primereact", "PrimeReact"),
    ...generatedLibraryColors(900),
  ].forEach(push);

  _cache = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
  return _cache;
}

export function getColorBySlug(slug: string) {
  return getAllLibraryColors().find((c) => c.slug === slug);
}

export function getColorByHex(hex: string) {
  const n = normalizeHex(hex).toLowerCase();
  return getAllLibraryColors().find((c) => c.hex.toLowerCase() === n);
}

export function getColorsByFamily(family: string) {
  return getAllLibraryColors().filter((c) => c.family === family);
}

export function getColorsBySource(source: ColorSource) {
  return getAllLibraryColors().filter((c) => c.sources.includes(source));
}

export function getColorsByKit(kit: string) {
  return getAllLibraryColors().filter((c) => c.kit?.toLowerCase() === kit.toLowerCase());
}

export const UI_KITS = [
  {
    slug: "html",
    title: "HTML Colors",
    source: "html" as ColorSource,
    accent: "#ef4444",
    blurb: "Classic web-safe & HTML color roots",
    preview: ["#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ffffff"],
  },
  {
    slug: "css-named",
    title: "CSS Named Colors",
    source: "css-named" as ColorSource,
    accent: "#0ea5e9",
    blurb: "140+ named CSS colors with HEX codes",
    preview: ["#f0f8ff", "#dc143c", "#00ffff", "#8a2be2", "#ff7f50", "#228b22"],
  },
  {
    slug: "svg",
    title: "SVG Colors",
    source: "svg" as ColorSource,
    accent: "#14b8a6",
    blurb: "SVG-compatible named color set",
    preview: ["#ff6347", "#4682b4", "#daa520", "#2e8b57", "#9370db", "#ff69b4"],
  },
  {
    slug: "web-safe",
    title: "Web Safe Colors",
    source: "web-safe" as ColorSource,
    accent: "#64748b",
    blurb: "216 historical web-safe palette colors",
    preview: ["#000000", "#330099", "#009933", "#993300", "#ffcc00", "#ffffff"],
  },
  {
    slug: "tailwind",
    title: "Tailwind Colors",
    source: "tailwind" as ColorSource,
    accent: "#38bdf8",
    blurb: "Full Tailwind CSS color scales",
    preview: ["#0f172a", "#0369a1", "#0d9488", "#ca8a04", "#e11d48", "#7c3aed"],
  },
  {
    slug: "bootstrap",
    title: "Bootstrap Colors",
    source: "bootstrap" as ColorSource,
    accent: "#7952b3",
    blurb: "Bootstrap theme & utility colors",
    preview: ["#0d6efd", "#6610f2", "#198754", "#ffc107", "#dc3545", "#212529"],
  },
  {
    slug: "material",
    title: "Material Design Colors",
    source: "material" as ColorSource,
    accent: "#4285f4",
    blurb: "Google Material Design shades",
    preview: ["#f44336", "#e91e63", "#9c27b0", "#2196f3", "#4caf50", "#ff9800"],
  },
  {
    slug: "fluent",
    title: "Fluent UI Colors",
    source: "fluent" as ColorSource,
    accent: "#0078d4",
    blurb: "Microsoft Fluent design accents",
    preview: ["#0078d4", "#00b7c3", "#107c10", "#5c2d91", "#d13438", "#605e5c"],
  },
  {
    slug: "apple",
    title: "Apple Human Interface Colors",
    source: "apple" as ColorSource,
    accent: "#007aff",
    blurb: "iOS & macOS system colors",
    preview: ["#007aff", "#34c759", "#ff3b30", "#af52de", "#ff9500", "#5856d6"],
  },
  {
    slug: "android",
    title: "Android Material You Colors",
    source: "android" as ColorSource,
    accent: "#6750a4",
    blurb: "Material You dynamic accents",
    preview: ["#6750a4", "#625b71", "#7d5260", "#b3261e", "#938f99", "#1c1b1f"],
  },
  {
    slug: "chakra",
    title: "Chakra UI Colors",
    source: "chakra" as ColorSource,
    accent: "#319795",
    blurb: "Chakra UI semantic color scales",
    preview: ["#3182ce", "#38b2ac", "#9f7aea", "#ed64a6", "#ed8936", "#f56565"],
  },
  {
    slug: "antd",
    title: "Ant Design Colors",
    source: "antd" as ColorSource,
    accent: "#1677ff",
    blurb: "Ant Design system palette",
    preview: ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#eb2f96", "#13c2c2"],
  },
  {
    slug: "radix",
    title: "Radix UI Colors",
    source: "radix" as ColorSource,
    accent: "#6e56cf",
    blurb: "Radix color scales for UI kits",
    preview: ["#3e63dd", "#00a2c7", "#30a46c", "#e5484d", "#6e56cf", "#d6409f"],
  },
  {
    slug: "primereact",
    title: "PrimeReact Colors",
    source: "primereact" as ColorSource,
    accent: "#3b82f6",
    blurb: "PrimeReact theme color tokens",
    preview: ["#3b82f6", "#22c55e", "#eab308", "#06b6d4", "#a855f7", "#ef4444"],
  },
];

export function getLibraryStats() {
  const all = getAllLibraryColors();
  return {
    total: all.length,
    families: new Set(all.map((c) => c.family)).size,
    kits: UI_KITS.length,
  };
}
