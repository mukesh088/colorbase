import { describe, expect, it } from "vitest";
import {
  SITEMAP_CHUNK_SIZE,
  SITEMAP_IDS,
  allSitemapEntries,
  sitemapFileByName,
  sitemapFiles,
  sitemapForId,
} from "@/lib/sitemaps";
import { BRANDS, isSitemapWorthyBrand } from "@/lib/data/brands";
import { getAllPosts } from "@/lib/data/blog";
import contentDates from "@/lib/data/content-dates.json";
import { robotsTxt, ROBOTS_ALLOWED_AGENTS } from "@/lib/robots";

describe("published sitemap inventory", () => {
  it("keeps only unique canonical public URLs with real lastmod dates", () => {
    const entries = allSitemapEntries();
    const urls = entries.map((entry) => entry.url);
    expect(entries.length).toBeGreaterThan(0);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some((url) => new URL(url).pathname === "/search")).toBe(false);
    expect(entries.every((entry) => entry.lastModified instanceof Date)).toBe(true);
    expect(entries.every((e) => !Number.isNaN((e.lastModified as Date).getTime()))).toBe(true);
    expect(urls.every((url) => new URL(url).search === "")).toBe(true);
    expect(urls.some((url) => new URL(url).pathname === "/color/438052")).toBe(true);
  });

  it("includes the studios and updated tools, but not redirects", () => {
    const paths = new Set(sitemapForId("tools").map((entry) => new URL(entry.url).pathname));
    for (const route of [
      "theme-builder",
      "chart-palette-generator",
      "palette-generator",
      "color-picker",
      "contrast-checker",
      "image-color-picker",
      "image-palette-extractor",
      "gradient-generator",
      "pdf-color-extractor",
      "css-blend-mode-generator",
      "brand-color-consistency-checker",
      "image-recolor",
      "map-color-scale-generator",
      "qr-code-color-designer",
      "presentation-theme-generator",
      "font-generator",
      "typography-generator",
      "interior-colors",
    ])
      expect(paths.has(`/${route}`), route).toBe(true);
    for (const redirected of [
      "/css-gradient-generator",
      "/palette-from-image",
      "/fancy-text-generator",
      "/color-palette-generator",
      "/timestamp-converter",
    ])
      expect(paths.has(redirected), redirected).toBe(false);
  });

  it("dates tool pages from their own files, not the build", () => {
    const tools = sitemapForId("tools");
    const dates = new Set(tools.map((e) => (e.lastModified as Date).toISOString().slice(0, 10)));
    expect(dates.size).toBeGreaterThan(1);
    const about = tools.find((e) => new URL(e.url).pathname === "/about");
    const routes = (contentDates as { routes: Record<string, string> }).routes;
    expect((about?.lastModified as Date).toISOString().slice(0, 10)).toBe(routes["/about"]);
  });

  it("dates blog posts from their own publish/update dates", () => {
    const blog = sitemapForId("blog");
    for (const post of getAllPosts()) {
      const e = blog.find((x) => new URL(x.url).pathname === `/blog/${post.slug}`);
      expect((e?.lastModified as Date).toISOString().slice(0, 10)).toBe(post.updatedAt ?? post.publishedAt);
    }
  });

  it("limits brand sitemap entries to sitemap-worthy brands", () => {
    const brandPaths = sitemapForId("brands").map((entry) => new URL(entry.url).pathname);
    const hubPaths = brandPaths.filter((p) => /^\/brands\/[^/]+$/.test(p));
    const worthy = new Set(BRANDS.filter(isSitemapWorthyBrand).map((b) => `/brands/${b.slug}`));
    expect(hubPaths.every((p) => worthy.has(p))).toBe(true);
    expect(hubPaths.length).toBe(worthy.size);
    expect(hubPaths.length).toBe(BRANDS.length);
  });

  it("splits sections into named files under the per-file limit", () => {
    const files = sitemapFiles();
    const names = files.map((f) => f.name);
    expect(new Set(names).size).toBe(names.length);
    for (const name of ["tools", "blog", "brands", "palettes", "gradients", "colors-1"])
      expect(names, name).toContain(name);
    expect(files.every((f) => f.entries.length > 0 && f.entries.length <= SITEMAP_CHUNK_SIZE)).toBe(true);
    expect(files.reduce((n, f) => n + f.entries.length, 0)).toBe(allSitemapEntries().length);
    expect(sitemapFileByName("colors-1")?.section).toBe("colors");
    expect(sitemapFileByName("nope")).toBeUndefined();
    expect(SITEMAP_IDS.every((id) => files.some((f) => f.section === id))).toBe(true);
  });
});

describe("robots.txt", () => {
  it("welcomes search and AI crawlers with the same rules and lists the sitemap", () => {
    const body = robotsTxt("https://colorbase.in");
    for (const agent of [
      "Googlebot",
      "Bingbot",
      "Google-Extended",
      "GPTBot",
      "OAI-SearchBot",
      "ChatGPT-User",
      "PerplexityBot",
      "ClaudeBot",
      "Claude-SearchBot",
      "Claude-User",
      "Applebot-Extended",
    ])
      expect(body, agent).toContain(`User-agent: ${agent}\n`);
    const groups = body.split(/\n\n(?=User-agent:)/).filter((g) => g.includes("User-agent:"));
    expect(groups.length).toBe(ROBOTS_ALLOWED_AGENTS.length + 1);
    for (const g of groups) {
      expect(g).toContain("Allow: /");
      expect(g).toContain("Disallow: /api/");
      expect(g).toContain("Disallow: /admin/");
    }
    expect(body).toContain("Sitemap: https://colorbase.in/sitemap.xml");
    expect(body).not.toMatch(/^Host:/m);
  });
});
