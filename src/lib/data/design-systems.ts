export const DESIGN_SYSTEM_ROUTES = [
  {
    slug: "tailwind",
    kit: "tailwind",
    path: "/colors/tailwind",
    title: "Tailwind CSS Colors",
    description:
      "Official Tailwind CSS color scales from 50 to 950 with HEX, RGB, HSL, OKLCH, and copy-ready class names.",
  },
  {
    slug: "material",
    kit: "material",
    path: "/colors/material",
    title: "Material Colors",
    description: "Material Design color scales with HEX values, contrast notes, and production-ready tokens.",
  },
  {
    slug: "bootstrap",
    kit: "bootstrap",
    path: "/colors/bootstrap",
    title: "Bootstrap Colors",
    description: "Bootstrap theme colors with HEX, RGB, and CSS variable snippets.",
  },
  {
    slug: "css",
    kit: "css-named",
    path: "/colors/css",
    title: "CSS Named Colors",
    description: "The CSS named color set with HEX codes, families, and copy-ready snippets.",
  },
  {
    slug: "radix",
    kit: "radix",
    path: "/colors/radix",
    title: "Radix Colors",
    description: "Radix UI accent colors used in modern design systems.",
  },
  {
    slug: "web-safe",
    kit: "web-safe",
    path: "/colors/web-safe",
    title: "Web Safe Colors",
    description: "The historical 216 web-safe palette, kept as a reference for compatibility work.",
  },
  {
    slug: "flat-ui",
    kit: "flat-ui",
    path: "/colors/flat-ui",
    title: "Flat UI Colors",
    description: "Flat UI reference palettes with HEX, RGB, HSL, OKLCH, and copy-ready swatches.",
  },
] as const;

/**
 * Swatch-library pages that duplicate a tool page's query point their
 * canonical at the tool page and stay out of the sitemap (owner decision 2026-11-22).
 */
export const DESIGN_SYSTEM_CANONICAL: Partial<Record<string, string>> = {
  "/colors/tailwind": "/tailwind-colors",
  "/colors/material": "/material-colors",
  "/colors/bootstrap": "/bootstrap-colors",
  "/colors/css": "/css-named-colors",
};

export type DesignSystemSlug = (typeof DESIGN_SYSTEM_ROUTES)[number]["slug"];

export function getDesignSystem(slug: string) {
  return DESIGN_SYSTEM_ROUTES.find((item) => item.slug === slug);
}

export function kitToDesignPath(kit: string) {
  return DESIGN_SYSTEM_ROUTES.find((item) => item.kit === kit)?.path;
}
