import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { STATIC_PAGES, TOOLS } from "@/lib/tools-registry";
import { BRANDS, getAllBrandHexEntries } from "@/lib/data/brands";
import { COLOR_FAMILIES } from "@/lib/data/families";
import { UI_KITS, getAllLibraryColors } from "@/lib/data/color-library";
import { getAllNamedColors, getCssNamedColors } from "@/lib/data/color-names";
import { GRADIENT_CATEGORIES, getAllGradients } from "@/lib/data/gradient-library";
import { PALETTE_CATEGORIES, getAllPalettes } from "@/lib/data/palette-library";
import { getAllPosts, BLOG_CATEGORIES } from "@/lib/data/blog";
import { CODE_FORMATS } from "@/lib/codegen";

export const SITEMAP_IDS = ["pages", "brands", "color-names", "colors", "libraries"] as const;
export type SitemapId = (typeof SITEMAP_IDS)[number];

type Entry = MetadataRoute.Sitemap[number];

const LAST_MODIFIED = new Date();

function entry(
  path: string,
  priority = 0.7,
  changeFrequency: Entry["changeFrequency"] = "weekly"
): Entry {
  return {
    url: `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    lastModified: LAST_MODIFIED,
    changeFrequency,
    priority,
  };
}

export function sitemapForId(id: string): MetadataRoute.Sitemap {
  switch (id) {
    case "pages":
      return [
        entry("/", 1, "daily"),
        ...TOOLS.map((t) => entry(`/${t.slug}`, t.popular || t.featured ? 0.9 : 0.7)),
        ...STATIC_PAGES.map((p) => entry(`/${p.slug}`, 0.7, "weekly")),
        ...CODE_FORMATS.map((f) => entry(`/developers/${f.slug}`, 0.7)),
        ...BLOG_CATEGORIES.map((c) => entry(`/blog/category/${encodeURIComponent(c)}`, 0.65)),
        ...getAllPosts().map((p) => entry(`/blog/${p.slug}`, 0.7)),
      ];
    case "brands":
      return [
        ...BRANDS.map((b) => entry(`/brands/${b.slug}`, 0.85)),
        ...getAllBrandHexEntries().map((e) => entry(`/brands/${e.brand.slug}/${e.hexSlug}`, 0.8)),
      ];
    case "color-names":
      return [
        ...getCssNamedColors().map((c) => entry(`/color-names/${c.slug}`, 0.85)),
        ...getAllNamedColors()
          .filter((c) => c.source !== "css")
          .map((c) => entry(`/color-names/${c.slug}`, 0.5)),
      ];
    case "colors": {
      const hexUrls = new Map<string, ReturnType<typeof entry>>();
      for (const c of getCssNamedColors()) {
        const slug = c.hex.slice(1).toLowerCase();
        hexUrls.set(slug, entry(`/color/${slug}`, 0.6));
      }
      for (const e of getAllBrandHexEntries()) {
        if (!hexUrls.has(e.hexSlug)) hexUrls.set(e.hexSlug, entry(`/color/${e.hexSlug}`, 0.55));
      }
      return [
        ...COLOR_FAMILIES.map((f) => entry(`/colors/family/${f}`, 0.75)),
        ...UI_KITS.map((k) => entry(`/colors/kits/${k.slug}`, 0.75)),
        ...getAllLibraryColors()
          .filter((c) => !c.sources.includes("generated"))
          .map((c) => entry(`/colors/${c.slug}`, 0.65)),
        ...hexUrls.values(),
      ];
    }
    case "libraries":
      return [
        ...GRADIENT_CATEGORIES.map((c) => entry(`/gradient-library/category/${c}`, 0.7)),
        ...getAllGradients().map((g) => entry(`/gradient-library/${g.slug}`, 0.6)),
        ...PALETTE_CATEGORIES.map((c) => entry(`/palette-library/category/${c}`, 0.7)),
        ...getAllPalettes().map((p) => entry(`/palette-library/${p.slug}`, 0.6)),
      ];
    default:
      return [];
  }
}
