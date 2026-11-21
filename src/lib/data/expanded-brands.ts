import records from "./expanded-brands.json";
import { hexToRgb } from "@/lib/colors/convert";
import type { BrandPalette } from "./brands";

type Record = {
  slug: string;
  name: string;
  hex: string;
  source: string;
  icon: string;
  guidelines?: string;
  iconLicense?: string;
};

function rgbLine(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return `RGB ${r}, ${g}, ${b}`;
}

function hexDistance(a: string, b: string) {
  const left = hexToRgb(a);
  const right = hexToRgb(b);
  return Math.hypot(left.r - right.r, left.g - right.g, left.b - right.b);
}

const mapped: BrandPalette[] = (records as Record[]).map((record) => {
  const hex = record.hex.toUpperCase();
  return {
    slug: record.slug,
    name: record.name,
    overview: `${record.name}'s Simple Icons logo color is ${hex} (${rgbLine(record.hex)}). Copy HEX, RGB, and CSS from this page, then use the derived tints and shades below as a working UI palette — not as extra official brand colors.${
      record.guidelines
        ? " A published brand resource is linked for logo usage and specification checks."
        : " The linked source identifies the artwork used for this color reference."
    }`,
    category: "Brands & products",
    primary: [record.hex],
    secondary: [],
    related: [],
    metaTitle: `${record.name} Hex Color ${hex} — Logo Palette`,
    metaDescription: `${record.name} brand hex is ${hex} (${rgbLine(record.hex)}). Copy the logo color, export CSS or Tailwind, and build a working tint/shade palette. Simple Icons reference — confirm against official guidelines.`,
    logoUrl: `https://cdn.simpleicons.org/${record.icon}/${record.hex.slice(1)}`,
    logoProvider: "simple-icons",
    sourceName: "Simple Icons",
    sourceUrl: record.source,
    guidelinesUrl: record.guidelines,
  };
});

/** Nearest official HEX neighbors — related palettes without inventing swatches. */
export const EXPANDED_BRANDS: BrandPalette[] = mapped.map((brand) => {
  const hex = brand.primary[0];
  const related = mapped
    .filter((other) => other.slug !== brand.slug)
    .map((other) => ({ slug: other.slug, d: hexDistance(hex, other.primary[0]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((item) => item.slug);
  return { ...brand, related };
});
