import { getBrandBySlug, getBrandHexEntry } from "@/lib/data/brands";
import { getColorBySlug, UI_KITS } from "@/lib/data/color-library";
import { getNamedColor } from "@/lib/data/color-names";
import { getGradient, GRADIENT_CATEGORIES } from "@/lib/data/gradient-library";
import { getPalette, PALETTE_CATEGORIES } from "@/lib/data/palette-library";
import { getPost, BLOG_CATEGORIES } from "@/lib/data/blog";
import { COLOR_FAMILIES } from "@/lib/data/families";
import { DESIGN_SYSTEM_ROUTES } from "@/lib/data/design-systems";
import { getRobloxById } from "@/lib/data/color-codes/roblox";
import { CODE_FORMATS } from "@/lib/codegen";
import { isValidHex, normalizeHex } from "@/lib/colors/convert";

type CatalogDecision = { status: 404 } | { status: 308; pathname: string };
const missing: CatalogDecision = { status: 404 };

/** Validate finite catalogs before React can stream a success response. */
export function catalogRouteDecision(pathname: string): CatalogDecision | null {
  let segments: string[];
  try {
    segments = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return missing;
  }
  const [root, slug, detail] = segments;
  if (segments.length === 2) {
    switch (root) {
      case "color": {
        if (!isValidHex(slug)) return missing;
        const canonical = `/color/${normalizeHex(slug).slice(1)}`;
        return pathname === canonical ? null : { status: 308, pathname: canonical };
      }
      case "colors": {
        // Keep named library/design-system pages, but accept HEX URLs here too.
        if (DESIGN_SYSTEM_ROUTES.some((route) => route.path === pathname) || getColorBySlug(slug))
          return null;
        return isValidHex(slug)
          ? { status: 308, pathname: `/color/${normalizeHex(slug).slice(1)}` }
          : missing;
      }
      case "brands":
        return getBrandBySlug(slug) ? null : missing;
      case "color-names":
        return getNamedColor(slug) ? null : missing;
      case "gradient-library":
        return getGradient(slug) ? null : missing;
      case "palette-library":
        return getPalette(slug) ? null : missing;
      case "blog":
        return getPost(slug) ? null : missing;
      case "developers":
        return CODE_FORMATS.some((format) => format.slug === slug) ? null : missing;
    }
  }
  if (segments.length === 3) {
    if (root === "brands") {
      const entry = getBrandHexEntry(slug, detail);
      if (!entry) return missing;
      const canonical = `/brands/${entry.brand.slug}/${entry.hexSlug}`;
      return pathname === canonical ? null : { status: 308, pathname: canonical };
    }
    if (root === "colors" && slug === "family") {
      return COLOR_FAMILIES.some((family) => family === detail) ? null : missing;
    }
    if (root === "colors" && slug === "kits") {
      return UI_KITS.some((kit) => kit.slug === detail) ? null : missing;
    }
    if (slug === "category") {
      if (root === "gradient-library")
        return GRADIENT_CATEGORIES.some((category) => category === detail) ? null : missing;
      if (root === "palette-library")
        return PALETTE_CATEGORIES.some((category) => category === detail) ? null : missing;
      if (root === "blog")
        return BLOG_CATEGORIES.some((category) => category === detail) ? null : missing;
    }
    if (root === "color-codes" && slug === "roblox") {
      const color = getRobloxById(Number(detail));
      if (!color) return missing;
      const canonical = `/color-codes/roblox/${color.id}`;
      return pathname === canonical ? null : { status: 308, pathname: canonical };
    }
  }
  return null;
}
