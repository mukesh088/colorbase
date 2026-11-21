#!/usr/bin/env node
/**
 * SEO audit crawler. Fetches raw server HTML (no JavaScript runs), so every
 * value it reports is what a crawler sees on first load.
 *
 * Usage:
 *   node scripts/seo-audit.mjs --base-url http://localhost:3000 \
 *     [--out docs/seo-audit.md] [--json audit.json] [--sitemap-sample 0]
 *
 * --sitemap-sample N  also crawl N evenly spaced URLs from the sitemap (0 = all)
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const BASE = new URL(opt("--base-url", "http://localhost:3000"));
const OUT = opt("--out", "");
const JSON_OUT = opt("--json", "");
const SITEMAP_SAMPLE = opt("--sitemap-sample", "");
const CONCURRENCY = Number(opt("--concurrency", "6"));
const APP_DIR = path.join(process.cwd(), "src", "app");

const decode = (v = "") =>
  v
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (_, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " })[e.toLowerCase()]);
const clean = (v) => decode(v.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i"));
  return m ? decode(m[1] ?? m[2] ?? "") : undefined;
};
const metaContent = (html, key, keyAttr = "name") =>
  [...html.matchAll(/<meta\b[^>]*>/gi)].map(([t]) => t).filter((t) => attr(t, keyAttr)?.toLowerCase() === key).map((t) => attr(t, "content") ?? "");

const GENERIC_ANCHORS = /^(view all|see all|learn more|read more|click here|open swatch|open|more|here|details|view|explore|go)$/i;

/** Static routes from the filesystem; dynamic segments are sampled from the sitemap. */
function discoverRoutes(dir = APP_DIR, prefix = "") {
  const out = { static: [], dynamic: [] };
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name.startsWith("_") || name === "api" || name === "admin") continue;
    const seg = name.startsWith("(") ? "" : `/${name}`;
    const sub = discoverRoutes(path.join(dir, name), prefix + seg);
    out.static.push(...sub.static);
    out.dynamic.push(...sub.dynamic);
  }
  if (fs.existsSync(path.join(dir, "page.tsx"))) {
    const route = prefix || "/";
    (route.includes("[") ? out.dynamic : out.static).push(route);
  }
  return out;
}

function routePattern(route) {
  return new RegExp(`^${route.replace(/\[[^\]]+\]/g, "[^/]+")}$`);
}

async function fetchText(url) {
  const started = Date.now();
  const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(60000), headers: { "user-agent": "ColorBaseSEOAudit/1.0" } });
  const body = await res.text();
  return { res, body, ms: Date.now() - started };
}

async function sitemapUrls() {
  const { body } = await fetchText(new URL("/sitemap.xml", BASE));
  let locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
  if (/<sitemapindex/.test(body)) {
    const nested = [];
    for (const loc of locs) {
      const child = await fetchText(new URL(new URL(loc).pathname, BASE));
      nested.push(...[...child.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1])));
    }
    locs = nested;
  }
  return locs.map((u) => new URL(u).pathname);
}

function analyse(pathname, res, html, ms) {
  const realHead = html.match(/<head(?:\s[^>]*)?>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  // Next 15 can stream metadata into <body> on a first (uncached) render; read the whole document.
  const head = html;
  const titles = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => clean(m[1]));
  const canonicalTag = [...head.matchAll(/<link\b[^>]*>/gi)].map(([t]) => t).find((t) => attr(t, "rel") === "canonical");
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => clean(m[1]));
  const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html)
    .replace(/<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const main = body.replace(/<(header|nav|footer|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const words = clean(main).split(" ").filter((w) => /[a-z]/i.test(w)).length;
  const jsonLd = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((m) => {
    try {
      const data = JSON.parse(m[1]);
      const nodes = Array.isArray(data) ? data : data["@graph"] ?? [data];
      return nodes.map((n) => [].concat(n["@type"] ?? "?").join("+"));
    } catch {
      return ["INVALID"];
    }
  });
  const anchors = [...body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({ href: attr(`<a ${m[1]}>`, "href"), text: clean(m[2]) || attr(`<a ${m[1]}>`, "aria-label") || "" }));
  const generic = anchors.filter((a) => GENERIC_ANCHORS.test(a.text)).map((a) => a.text);
  const dupSections = [];
  for (const [, tag, inner] of body.matchAll(/<(nav|footer|header)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const hrefs = [...inner.matchAll(/<a\b[^>]*href="([^"]+)"/gi)].map((m) => m[1]);
    const dups = [...new Set(hrefs.filter((h, i) => hrefs.indexOf(h) !== i))];
    if (dups.length) dupSections.push(`${tag}: ${dups.slice(0, 4).join(", ")}${dups.length > 4 ? "…" : ""}`);
  }
  const description = metaContent(head, "description")[0];
  const robots = metaContent(head, "robots")[0] ?? "";
  return {
    path: pathname,
    status: res.status,
    location: res.headers.get("location") ?? undefined,
    ms,
    title: titles[0] ?? "",
    titleCount: titles.length,
    description: description ?? "",
    canonical: canonicalTag ? attr(canonicalTag, "href") : "",
    robots,
    h1: h1s,
    words,
    jsonLd,
    og: metaContent(head, "og:title", "property").length > 0,
    ogImage: metaContent(head, "og:image", "property")[0] ?? "",
    twitter: metaContent(head, "twitter:card").length > 0,
    keywordsMeta: metaContent(head, "keywords").length > 0,
    generic,
    dupSections,
    gscVerification: metaContent(head, "google-site-verification").length > 0,
    metaInHead: /rel="canonical"/.test(realHead) || /name="description"/.test(realHead),
  };
}

function problems(p) {
  const list = [];
  if (p.status !== 200) return [`status ${p.status}${p.location ? ` → ${p.location}` : ""}`];
  const noindex = /noindex/i.test(p.robots);
  if (!p.title) list.push("no title");
  else if (p.title.length > 60) list.push(`title ${p.title.length} chars`);
  if (!p.description) list.push("no description");
  else if (!noindex && (p.description.length < 120 || p.description.length > 160)) list.push(`desc ${p.description.length} chars`);
  if (!p.canonical) list.push("no canonical");
  if (p.h1.length !== 1) list.push(`${p.h1.length} H1`);
  if (!noindex && p.words < 250) list.push(`thin (${p.words} words)`);
  if (p.jsonLd.includes("INVALID")) list.push("invalid JSON-LD");
  if (!p.og) list.push("no OG");
  if (p.keywordsMeta) list.push("meta keywords");
  if (p.generic.length) list.push(`generic anchors: ${[...new Set(p.generic)].join("/")}`);
  if (p.dupSections.length) list.push("duplicate links in nav/footer");
  return list;
}

async function pool(items, fn) {
  const results = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < items.length) {
        const item = items[i++];
        results.push(await fn(item));
      }
    })
  );
  return results;
}

const SOFT_404_PROBES = [
  "/this-page-does-not-exist",
  "/color/zzzzzz",
  "/color/12345",
  "/colors/not-a-color-slug",
  "/colors/family/not-a-family",
  "/brands/not-a-real-brand",
  "/brands/google/zzzzzz",
  "/color-names/not-a-real-color-name",
  "/palette-library/not-a-palette",
  "/palette-library/category/not-a-category",
  "/gradient-library/not-a-gradient",
  "/gradient-library/category/not-a-category",
  "/blog/not-a-post",
  "/blog/category/not-a-category",
  "/developers/not-a-format",
  "/interior-colors/not-a-room",
  "/color-codes/roblox/999999",
  "/colors/kits/not-a-kit",
];
const REDIRECT_PROBES = ["/color/FF5733", "/color/f53", "/color/%23ff5733", "/tools/", "/Color-Picker"];

async function main() {
  const routes = discoverRoutes();
  let sitemap = [];
  try {
    sitemap = await sitemapUrls();
  } catch (e) {
    console.error("sitemap fetch failed", e.message);
  }
  const sitemapSet = new Set(sitemap);
  const samples = routes.dynamic.map((r) => {
    const re = routePattern(r);
    return { route: r, sample: sitemap.find((u) => re.test(u)), count: sitemap.filter((u) => re.test(u)).length };
  });
  let targets = [...routes.static, ...samples.filter((s) => s.sample).map((s) => s.sample)];
  if (SITEMAP_SAMPLE !== "") {
    const n = Number(SITEMAP_SAMPLE);
    const picked = n === 0 ? sitemap : sitemap.filter((_, i) => i % Math.max(1, Math.floor(sitemap.length / n)) === 0);
    targets.push(...picked);
  }
  targets = [...new Set(targets)];
  console.error(`Crawling ${targets.length} URLs (${sitemap.length} in sitemap)…`);

  const pages = (
    await pool(targets, async (p) => {
      try {
        const { res, body, ms } = await fetchText(new URL(p, BASE));
        return analyse(p, res, body, ms);
      } catch (e) {
        return { path: p, status: 0, error: e.message, h1: [], generic: [], dupSections: [], jsonLd: [] };
      }
    })
  ).sort((a, b) => a.path.localeCompare(b.path));

  const soft404 = await pool(SOFT_404_PROBES, async (p) => {
    const { res } = await fetchText(new URL(p, BASE));
    return { path: p, status: res.status };
  });
  const redirects = await pool(REDIRECT_PROBES, async (p) => {
    const { res } = await fetchText(new URL(p, BASE));
    return { path: p, status: res.status, location: res.headers.get("location") ?? "" };
  });
  const robots = await fetchText(new URL("/robots.txt", BASE)).then((r) => ({ status: r.res.status, body: r.body }));
  const llms = await fetchText(new URL("/llms.txt", BASE)).then((r) => ({ status: r.res.status, bytes: r.body.length }));

  const titleDupes = Object.entries(
    pages.filter((p) => p.status === 200 && !/noindex/i.test(p.robots)).reduce((acc, p) => ((acc[p.title] ??= []).push(p.path), acc), {})
  ).filter(([, v]) => v.length > 1);
  const descDupes = Object.entries(
    pages.filter((p) => p.status === 200 && !/noindex/i.test(p.robots) && p.description).reduce((acc, p) => ((acc[p.description] ??= []).push(p.path), acc), {})
  ).filter(([, v]) => v.length > 1);

  const report = { base: BASE.href, generatedAt: new Date().toISOString(), routes, samples, sitemapCount: sitemap.length, pages, soft404, redirects, robots, llms, titleDupes, descDupes };
  if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(report, null, 2));
  if (OUT) fs.writeFileSync(OUT, toMarkdown(report, sitemapSet));
  const flagged = pages.filter((p) => problems(p).length);
  console.error(`Done. ${pages.length} pages, ${flagged.length} with problems.`);
}

const esc = (v = "") => String(v).replace(/\|/g, "\\|").replace(/\n/g, " ");

function toMarkdown(r, sitemapSet) {
  const lines = [];
  lines.push(`# SEO audit — raw server HTML`, "");
  lines.push(`Generated ${r.generatedAt.slice(0, 10)} by \`node scripts/seo-audit.mjs\` against \`${r.base}\` (production build, no JavaScript executed).`, "");
  lines.push(`- Static routes: **${r.routes.static.length}**; dynamic route templates: **${r.routes.dynamic.length}**`);
  lines.push(`- URLs in \`/sitemap.xml\`: **${r.sitemapCount}**`);
  lines.push(`- robots.txt: HTTP ${r.robots.status}; llms.txt: HTTP ${r.llms.status} (${r.llms.bytes} bytes)`, "");
  lines.push(`## Dynamic routes`, "", `| Route | URLs in sitemap | Sample audited |`, `|---|---:|---|`);
  for (const s of r.samples) lines.push(`| \`${s.route}\` | ${s.count} | ${s.sample ? `\`${s.sample}\`` : "— (none in sitemap)"} |`);
  lines.push("", `## Pages`, "", "Words = visible text outside header/nav/footer/aside in the server HTML. `SSR` is ✅ when the H1 and ≥ 150 words are in that HTML.", "");
  lines.push(`| Path | Status | Title (len) | Desc len | Canonical | Robots | H1 | Words | SSR | JSON-LD | In sitemap | Problems |`);
  lines.push(`|---|---|---|---:|---|---|---|---:|---|---|---|---|`);
  for (const p of r.pages) {
    const canon = p.canonical ? (new URL(p.canonical).pathname === (p.path === "/" ? "/" : p.path) ? "self" : `\`${new URL(p.canonical).pathname}\``) : "—";
    const ssr = p.status === 200 && p.h1?.length && p.words >= 150 ? "✅" : p.status === 200 ? "⚠️" : "";
    lines.push(
      `| \`${p.path}\` | ${p.status}${p.location ? ` → \`${p.location}\`` : ""} | ${esc(p.title)} (${p.title?.length ?? 0}) | ${p.description?.length ?? 0} | ${canon} | ${esc(p.robots) || "index"} | ${esc(p.h1?.join(" ‖ ") ?? "")} | ${p.words ?? 0} | ${ssr} | ${esc([...new Set(p.jsonLd)].join(", "))} | ${sitemapSet.has(p.path) ? "yes" : "no"} | ${esc(problems(p).join("; "))} |`
    );
  }
  lines.push("", `## Soft-404 probes (expect 404)`, "", `| Path | Status |`, `|---|---|`);
  for (const s of r.soft404) lines.push(`| \`${s.path}\` | ${s.status}${s.status === 404 ? " ✅" : " ❌"} |`);
  lines.push("", `## Redirect / normalization probes`, "", `| Path | Status | Location |`, `|---|---|---|`);
  for (const s of r.redirects) lines.push(`| \`${s.path}\` | ${s.status} | ${s.location ? `\`${s.location}\`` : ""} |`);
  lines.push("", `## Duplicate titles (indexable)`, "");
  lines.push(r.titleDupes.length ? r.titleDupes.map(([t, ps]) => `- "${esc(t)}": ${ps.map((x) => `\`${x}\``).join(", ")}`).join("\n") : "None.");
  lines.push("", `## Duplicate descriptions (indexable)`, "");
  lines.push(r.descDupes.length ? r.descDupes.map(([t, ps]) => `- ${ps.map((x) => `\`${x}\``).join(", ")}: "${esc(t.slice(0, 80))}…"`).join("\n") : "None.");
  lines.push("");
  return lines.join("\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
