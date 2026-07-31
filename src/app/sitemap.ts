import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { STATIC_PAGES, TOOLS } from "@/lib/tools-registry";
import { BRANDS } from "@/lib/data/brands";
import { COLOR_FAMILIES } from "@/lib/data/families";
import { UI_KITS, getAllLibraryColors } from "@/lib/data/color-library";
import { getAllNamedColors } from "@/lib/data/color-names";
import { GRADIENT_CATEGORIES, getAllGradients } from "@/lib/data/gradient-library";
import { PALETTE_CATEGORIES, getAllPalettes } from "@/lib/data/palette-library";
import { getAllPosts, BLOG_CATEGORIES } from "@/lib/data/blog";
import { CODE_FORMATS } from "@/lib/codegen";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entry = (
    path: string,
    priority = 0.7,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
  ) => ({
    url: `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    entry("/", 1, "daily"),
    ...TOOLS.map((t) => entry(`/${t.slug}`, t.popular || t.featured ? 0.9 : 0.7)),
    ...STATIC_PAGES.map((p) => entry(`/${p.slug}`, 0.6, "monthly")),
    ...COLOR_FAMILIES.map((f) => entry(`/colors/family/${f}`, 0.75)),
    ...UI_KITS.map((k) => entry(`/colors/kits/${k.slug}`, 0.75)),
    ...getAllLibraryColors()
      .filter((c) => !c.sources.includes("generated"))
      .slice(0, 500)
      .map((c) => entry(`/colors/${c.slug}`, 0.65)),
    ...BRANDS.map((b) => entry(`/brands/${b.slug}`, 0.8)),
    ...getAllNamedColors()
      .slice(0, 400)
      .map((c) => entry(`/color-names/${c.slug}`, 0.6)),
    ...GRADIENT_CATEGORIES.map((c) => entry(`/gradient-library/category/${c}`, 0.7)),
    ...getAllGradients()
      .slice(0, 400)
      .map((g) => entry(`/gradient-library/${g.slug}`, 0.6)),
    ...PALETTE_CATEGORIES.map((c) => entry(`/palette-library/category/${c}`, 0.7)),
    ...getAllPalettes()
      .slice(0, 400)
      .map((p) => entry(`/palette-library/${p.slug}`, 0.6)),
    ...CODE_FORMATS.map((f) => entry(`/developers/${f.slug}`, 0.7)),
    ...BLOG_CATEGORIES.map((c) => entry(`/blog/category/${encodeURIComponent(c)}`, 0.65)),
    ...getAllPosts().map((p) => entry(`/blog/${p.slug}`, 0.7)),
  ];
}
