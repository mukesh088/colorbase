#!/usr/bin/env node
/**
 * Writes src/lib/data/content-dates.json: the last git commit date of the
 * files behind each sitemap section and each static route, so sitemap
 * <lastmod> reflects real content changes instead of the build time.
 *
 * Runs before `next build`. If git history is unavailable or shallow (every
 * file would share the clone date), the committed JSON is kept as-is.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outFile = path.join(root, "src/lib/data/content-dates.json");

/** Files whose changes alter the main content of a whole section. */
export const SECTION_SOURCES = {
  tools: [
    "src/lib/tools-registry.ts",
    "src/lib/data/tool-guides.ts",
    "src/lib/data/tool-supplements.ts",
    "src/lib/data/tool-supplements-more.ts",
    "src/lib/data/tool-supplements-rest.ts",
    "src/lib/faqs.ts",
  ],
  developers: ["src/lib/codegen", "src/app/developers"],
  blog: ["src/lib/data/blog.ts", "src/lib/data/blog-guides.ts", "src/app/blog"],
  brands: [
    "src/lib/data/brands.ts",
    "src/lib/data/expanded-brands.ts",
    "src/lib/data/expanded-brands.json",
    "src/lib/data/imported-brands.ts",
    "src/lib/data/food-brands.ts",
    "src/lib/data/football-brands.ts",
    "src/lib/data/brand-stories.ts",
    "src/app/brands",
  ],
  "color-names": [
    "src/lib/data/color-names.ts",
    "src/lib/data/expanded-color-names.json",
    "src/lib/data/named-color-stories.ts",
    "src/app/color-names",
  ],
  colors: [
    "src/lib/data/families.ts",
    "src/lib/data/color-library.ts",
    "src/lib/data/curated-colors.ts",
    "src/lib/data/hex-references.ts",
    "src/lib/data/search-landing-hexes.ts",
    "src/lib/data/design-systems.ts",
    "src/lib/data/color-codes",
    "src/lib/hex-indexing.ts",
    "src/app/color",
    "src/app/colors",
    "src/app/color-codes",
  ],
  palettes: ["src/lib/data/palette-library.ts", "src/lib/data/studio-palettes.ts", "src/app/palette-library"],
  gradients: ["src/lib/data/gradient-library.ts", "src/lib/data/studio-gradients.ts", "src/app/gradient-library"],
};

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function lastCommitDate(paths) {
  const existing = paths.filter((p) => fs.existsSync(path.join(root, p)));
  if (!existing.length) return undefined;
  return git(["log", "-1", "--format=%cs", "--", ...existing]) || undefined;
}

/** Static page routes: every src/app directory with a page.tsx and no dynamic segment. */
function staticRoutes(dir = "src/app", route = "") {
  const out = [];
  const abs = path.join(root, dir);
  if (fs.existsSync(path.join(abs, "page.tsx")) && !route.includes("[")) out.push({ route: route || "/", dir });
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (!entry.isDirectory() || ["api", "admin"].includes(entry.name) || entry.name.startsWith("_")) continue;
    out.push(...staticRoutes(`${dir}/${entry.name}`, `${route}/${entry.name}`));
  }
  return out;
}

function main() {
  let shallow;
  try {
    shallow = git(["rev-parse", "--is-shallow-repository"]) === "true";
  } catch {
    console.warn("[content-dates] git unavailable; keeping existing content-dates.json");
    return;
  }
  if (shallow) {
    console.warn("[content-dates] shallow clone; keeping existing content-dates.json");
    return;
  }
  const sections = Object.fromEntries(
    Object.entries(SECTION_SOURCES).map(([id, paths]) => [id, lastCommitDate(paths)])
  );
  const routes = Object.fromEntries(
    staticRoutes()
      .map(({ route, dir }) => [route, lastCommitDate([route === "/" ? `${dir}/page.tsx` : dir])])
      .filter(([, date]) => date)
      .sort(([a], [b]) => a.localeCompare(b))
  );
  const next = JSON.stringify({ sections, routes }, null, 2) + "\n";
  const prev = fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf8") : "";
  if (prev !== next) fs.writeFileSync(outFile, next);
  console.log(`[content-dates] ${Object.keys(routes).length} routes, ${Object.keys(sections).length} sections`);
}

main();
