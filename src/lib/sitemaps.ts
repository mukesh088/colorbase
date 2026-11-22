import type { MetadataRoute } from "next";
import { STATIC_PAGES, TOOLS } from "@/lib/tools-registry";
import {
  BRANDS,
  getAllBrandHexEntries,
  isSitemapWorthyBrand,
  isUnverifiedBrandHex,
} from "@/lib/data/brands";
import { COLOR_FAMILIES } from "@/lib/data/families";
import { UI_KITS, getAllLibraryColors } from "@/lib/data/color-library";
import { DESIGN_SYSTEM_CANONICAL, kitToDesignPath } from "@/lib/data/design-systems";
import { getIndexableNamedColors } from "@/lib/data/color-names";
import { GRADIENT_CATEGORIES, getAllGradients } from "@/lib/data/gradient-library";
import { PALETTE_CATEGORIES, getAllPalettes } from "@/lib/data/palette-library";
import { BLOG_CATEGORIES, getAllPosts } from "@/lib/data/blog";
import { CODE_FORMATS } from "@/lib/codegen";
import { uniqueRobloxColors } from "@/lib/data/color-codes/roblox";
import { getIndexableHexSlugs, isCuratedLibraryColor } from "@/lib/hex-indexing";
import { absoluteUrl } from "@/lib/utils";
import { getCombinationBases } from "@/lib/colors/combinations";
import { isoToDate as toDate, latestIso as latest, routeLastModified, sectionLastModified } from "@/lib/content-dates";
import retiredToolSlugs from "../../retired-tools";

/** Sitemap sections. Each becomes one or more `/sitemaps/<file>.xml` files. */
export const SITEMAP_IDS = [
  "tools",
  "blog",
  "brands",
  "color-names",
  "colors",
  "palettes",
  "gradients",
  "combinations",
] as const;
export type SitemapId = (typeof SITEMAP_IDS)[number];

/** Sections always split into numbered files (`colors-1.xml`, …) because they grow. */
const NUMBERED_SECTIONS = new Set<SitemapId>(["colors"]);
/** Well under the 50,000-URL / 50 MB protocol limit per file. */
export const SITEMAP_CHUNK_SIZE = 10_000;

type Entry = MetadataRoute.Sitemap[number];

export { routeLastModified, sectionLastModified };
/** Redirects and retired tools stay out of the sitemap. */
const SITEMAP_EXCLUDED_TOOL_SLUGS = new Set<string>([
  "css-gradient-generator",
  "palette-from-image",
  "timestamp-converter",
  ...retiredToolSlugs,
]);

function entry(
  path: string,
  lastModified: Date,
  priority = 0.7,
  changeFrequency: Entry["changeFrequency"] = "weekly"
): Entry {
  return { url: absoluteUrl(path), lastModified, changeFrequency, priority };
}

export function sitemapForId(id: string): MetadataRoute.Sitemap {
  switch (id) {
    case "tools":
      return [
        entry("/", routeLastModified("/"), 1, "daily"),
        ...TOOLS.filter((t) => !SITEMAP_EXCLUDED_TOOL_SLUGS.has(t.slug)).map((t) =>
          entry(
            `/${t.slug}`,
            routeLastModified(`/${t.slug}`, "tools"),
            t.popular || t.featured ? 0.9 : 0.7
          )
        ),
        ...STATIC_PAGES.filter((p) => p.slug !== "search").map((p) =>
          entry(`/${p.slug}`, routeLastModified(`/${p.slug}`), 0.7, "weekly")
        ),
        ...CODE_FORMATS.map((f) =>
          entry(`/developers/${f.slug}`, sectionLastModified("developers"), 0.7)
        ),
      ];
    case "blog": {
      const posts = getAllPosts();
      const newestPost = latest(...posts.map((p) => p.updatedAt ?? p.publishedAt));
      return [
        ...BLOG_CATEGORIES.map((c) =>
          entry(
            `/blog/category/${encodeURIComponent(c)}`,
            toDate(latest(...posts.filter((p) => p.category === c).map((p) => p.updatedAt ?? p.publishedAt)) ?? newestPost),
            0.65
          )
        ),
        ...posts.map((p) => entry(`/blog/${p.slug}`, toDate(p.updatedAt ?? p.publishedAt), 0.7)),
      ];
    }
    case "brands": {
      const lastModified = sectionLastModified("brands");
      return [
        ...BRANDS.filter(isSitemapWorthyBrand).map((b) => entry(`/brands/${b.slug}`, lastModified, 0.85)),
        ...getAllBrandHexEntries()
          .filter((e) => isSitemapWorthyBrand(e.brand) && !isUnverifiedBrandHex(e.brand, e.hex))
          .map((e) => entry(`/brands/${e.brand.slug}/${e.hexSlug}`, lastModified, 0.8)),
      ];
    }
    case "color-names": {
      const lastModified = sectionLastModified("color-names");
      return getIndexableNamedColors().map((c) => entry(`/color-names/${c.slug}`, lastModified, 0.85));
    }
    case "colors": {
      const lastModified = sectionLastModified("colors");
      return [
        ...COLOR_FAMILIES.map((f) => entry(`/colors/family/${f}`, lastModified, 0.75)),
        ...UI_KITS.map((k) => kitToDesignPath(k.slug) ?? `/colors/kits/${k.slug}`)
          .filter((path) => !DESIGN_SYSTEM_CANONICAL[path])
          .map((path) => entry(path, lastModified, 0.75)),
        ...[
          ...new Map(
            getAllLibraryColors()
              .filter(isCuratedLibraryColor)
              .map((c) => [c.slug, c] as const)
          ).values(),
        ].map((c) => entry(`/colors/${c.slug}`, lastModified, 0.65)),
        ...getIndexableHexSlugs().map((hex) => entry(`/color/${hex}`, lastModified, 0.6)),
        ...uniqueRobloxColors().map((c) => entry(`/color-codes/roblox/${c.id}`, lastModified, 0.5)),
      ];
    }
    case "palettes": {
      const lastModified = sectionLastModified("palettes");
      return [
        ...PALETTE_CATEGORIES.map((c) => entry(`/palette-library/category/${c}`, lastModified, 0.7)),
        ...getAllPalettes().map((p) => entry(`/palette-library/${p.slug}`, lastModified, 0.6)),
      ];
    }
    case "gradients": {
      const lastModified = sectionLastModified("gradients");
      return [
        ...GRADIENT_CATEGORIES.map((c) => entry(`/gradient-library/category/${c}`, lastModified, 0.7)),
        ...getAllGradients().map((g) => entry(`/gradient-library/${g.slug}`, lastModified, 0.6)),
      ];
    }
    case "combinations": {
      const lastModified = sectionLastModified("combinations");
      return [
        entry("/colors-that-go-with", lastModified, 0.8),
        ...getCombinationBases().map((b) => entry(`/colors-that-go-with/${b.slug}`, lastModified, 0.7)),
      ];
    }
    default:
      return [];
  }
}

export type SitemapFile = { name: string; section: SitemapId; entries: MetadataRoute.Sitemap };

/** Every static sitemap file, split into chunks of SITEMAP_CHUNK_SIZE. */
export function sitemapFiles(): SitemapFile[] {
  return SITEMAP_IDS.flatMap((section) => {
    const entries = sitemapForId(section);
    const chunks = Math.max(1, Math.ceil(entries.length / SITEMAP_CHUNK_SIZE));
    const numbered = chunks > 1 || NUMBERED_SECTIONS.has(section);
    return Array.from({ length: chunks }, (_, i) => ({
      name: numbered ? `${section}-${i + 1}` : section,
      section,
      entries: entries.slice(i * SITEMAP_CHUNK_SIZE, (i + 1) * SITEMAP_CHUNK_SIZE),
    }));
  });
}

export function sitemapFileByName(name: string) {
  return sitemapFiles().find((file) => file.name === name);
}

/** Newest lastmod in a list of entries (for the sitemap index). */
export function newestLastModified(entries: MetadataRoute.Sitemap) {
  return entries.reduce<Date | undefined>((max, e) => {
    const d = e.lastModified instanceof Date ? e.lastModified : e.lastModified ? new Date(e.lastModified) : undefined;
    return d && (!max || d > max) ? d : max;
  }, undefined);
}

/** Every static sitemap URL (DB-backed interior pages are added by the route). */
export function allSitemapEntries(): MetadataRoute.Sitemap {
  return SITEMAP_IDS.flatMap((id) => sitemapForId(id));
}
