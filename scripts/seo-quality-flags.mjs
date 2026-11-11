/**
 * Offline SEO quality flags for ColorBase Wave 1.
 * Reports review signals only — does not predict AdSense approval or rankings.
 *
 * Usage: node scripts/seo-quality-flags.mjs [--json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const asJson = process.argv.includes("--json");

const flags = [];

function flag(severity, code, message, detail = {}) {
  flags.push({ severity, code, message, ...detail });
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

// --- Required docs ---
for (const doc of [
  "docs/ADSENSE_SEO_AUDIT.md",
  "docs/url-inventory.json",
  "docs/INDEXATION_STRATEGY.md",
  "docs/ADSENSE_READINESS_CHECKLIST.md",
  "docs/CONTENT_IMPROVEMENT_PLAN.md",
  "docs/SEO_CHANGELOG.md",
  "docs/QA_TEST_RESULTS.md",
  "docs/POST_LAUNCH_MONITORING.md",
]) {
  if (!exists(doc)) flag("error", "missing_doc", `Missing required doc: ${doc}`);
}

// --- ads.txt / publisher ---
const adsTxt = exists("public/ads.txt") ? read("public/ads.txt") : "";
if (!adsTxt.includes("pub-9077025320968455")) {
  flag("error", "ads_txt", "public/ads.txt missing expected publisher id");
} else {
  flag("info", "ads_txt_ok", "ads.txt contains publisher id");
}

const siteConfig = read("src/lib/site-config.ts");
if (!siteConfig.includes("ca-pub-9077025320968455")) {
  flag("error", "adsense_client", "site-config missing ca-pub id");
}

// --- Indexation helpers present ---
const hexIndexing = read("src/lib/hex-indexing.ts");
if (!hexIndexing.includes("isIndexableHex") || !hexIndexing.includes("getIndexableHexSlugs")) {
  flag("error", "hex_indexing", "hex-indexing helpers missing");
}

const brandsSrc = read("src/lib/data/brands.ts");
if (!brandsSrc.includes("isSitemapWorthyBrand")) {
  flag("error", "brand_sitemap_filter", "isSitemapWorthyBrand missing");
}

const sitemaps = read("src/lib/sitemaps.ts");
for (const slug of ["css-gradient-generator", "palette-from-image"]) {
  if (!sitemaps.includes(slug)) {
    flag("warn", "sitemap_alias", `Sitemap exclusion may omit ${slug}`);
  }
}

const nextConfig = read("next.config.js");
if (!nextConfig.includes('destination: "/gradient-generator"')) {
  flag("warn", "alias_redirect", "css-gradient-generator redirect missing");
}
if (!nextConfig.includes('destination: "/image-palette-extractor"')) {
  flag("warn", "alias_redirect", "palette-from-image redirect missing");
}

// --- Brand stub inventory ---
const expanded = require(path.join(root, "src/lib/data/expanded-brands.json"));
const stubRows = Array.isArray(expanded) ? expanded : Object.values(expanded);
const stubCount = stubRows.length;
const withGuidelines = stubRows.filter((b) => b && (b.guidelines || b.guidelinesUrl)).length;
flag("info", "brand_stubs", "Simple Icons expanded brand stub count", {
  stubCount,
  withGuidelines,
  sitemapPolicy: "stubs without guidelinesUrl excluded from sitemap; pages remain live",
});
if (stubCount > 1500) {
  flag(
    "review",
    "thin_brand_stubs",
    "Large Simple Icons stub catalog — keep manual review queue; do not mass-noindex"
  );
}

// --- Tool guides for priority tools ---
const guides = read("src/lib/data/tool-guides.ts");
for (const slug of [
  "theme-builder",
  "chart-palette-generator",
  "tools/harmony-studio",
  "tools/shades-tints-tones",
]) {
  if (!guides.includes(`"${slug}"`)) {
    flag("error", "missing_tool_guide", `TOOL_GUIDES missing entry for ${slug}`);
  }
}

// --- Homepage messaging ---
const hero = read("src/components/home/home-hero.tsx");
if (!/Build better/.test(hero) || !hero.includes("/color-picker") || !hero.includes("/contrast-checker")) {
  flag("warn", "homepage_cta", "Homepage may be missing Build better / primary CTAs");
}

// --- Case studies ---
const blogGuides = read("src/lib/data/blog-guides.ts");
if (!blogGuides.includes("Case Study: An Accessible SaaS Dashboard Palette")) {
  flag("error", "case_study", "Missing SaaS dashboard case study");
}
if (!blogGuides.includes("Case Study: Light and Dark Theme From One Brand Blue")) {
  flag("error", "case_study", "Missing light/dark case study");
}

// --- Template boilerplate risk (heuristic) ---
const colorDetail = read("src/components/library/color-detail-view.tsx");
if (/psychologyForFamily/.test(colorDetail) && !/HEX_REFERENCES|referenceBrief|getHexReference/.test(colorDetail)) {
  flag(
    "review",
    "hex_boilerplate",
    "color-detail-view still references family psychology without curated brief preference — review"
  );
} else if (/psychologyForFamily/.test(colorDetail)) {
  flag(
    "info",
    "hex_boilerplate_softened",
    "Family psychology present; confirm curated briefs take precedence on indexable pages"
  );
}

// --- Title length soft checks on key pages ---
for (const [file, label] of [
  ["src/app/theme-builder/page.tsx", "theme-builder"],
  ["src/app/chart-palette-generator/page.tsx", "chart-palette"],
  ["src/app/brands/page.tsx", "brands"],
]) {
  if (!exists(file)) continue;
  const src = read(file);
  const titleMatch = src.match(/title:\s*["'`]([^"'`]+)["'`]/);
  if (titleMatch && titleMatch[1].length > 60) {
    flag("review", "long_title", `${label} title is ${titleMatch[1].length} chars`, {
      title: titleMatch[1],
    });
  }
}

const errors = flags.filter((f) => f.severity === "error").length;
const reviews = flags.filter((f) => f.severity === "review" || f.severity === "warn").length;
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    total: flags.length,
    errors,
    reviewOrWarn: reviews,
    info: flags.filter((f) => f.severity === "info").length,
  },
  disclaimer:
    "Flags are for editorial/indexation review only. They do not predict AdSense approval, rankings, or Core Web Vitals.",
  flags,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`SEO quality flags — ${report.summary.errors} error(s), ${report.summary.reviewOrWarn} review/warn`);
  for (const f of flags) {
    console.log(`[${f.severity}] ${f.code}: ${f.message}`);
  }
  console.log(report.disclaimer);
}

if (errors > 0) process.exitCode = 1;
