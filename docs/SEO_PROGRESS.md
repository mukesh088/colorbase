# SEO + AEO + GEO progress — colorbase.in

Plan: [`SEO_GEO_PLAN.md`](../SEO_GEO_PLAN.md) (repo root). Rules: [`CLAUDE.md`](../CLAUDE.md).
Tick a task only when it is built, the build passes and it is committed.

## Handoff note (read first)
- **Status:** Phases 0–2 done. Next: Phase 3 (answer-first `<ToolContent>` sections on every tool page; group non-color tools as "More tools").
- Branches are stacked: `seo/phase-0-audit` → `seo/phase-1-crawling` → … Merge them into `main` in order (or merge the last one).
- Non-color tools: keep current URLs, group them as "More tools" (your answer, 2026-11-21). No `/extras/` move.
- Run vitest from an upper-case drive path (`D:\projects\colorbase`). From `d:\…` every suite fails with "Vitest failed to find the current suite" (Windows drive-letter case makes vitest load twice).

---

## Phase 0 — Audit & setup (no feature changes) ✅
- [x] Detect the stack; fill in the "Commands" section of `CLAUDE.md`.
- [x] Create `docs/SEO_PROGRESS.md` with every task as a checklist.
- [x] List every public route, including dynamic ones (147 static + 18 dynamic; see `docs/seo-audit.md`).
- [x] Per-route title / description / canonical / H1 / server-HTML text / word count → `docs/seo-audit.md`.
- [x] Check robots.txt, sitemap, JSON-LD, OG tags, meta keywords, duplicate/generic links, soft 404s.
- [x] Main content is server-rendered (Next.js App Router, not an SPA), so no pre-render decision is needed.

## Phase 1 — Crawling & indexing ✅
- [x] Main text, title, meta, H1 and FAQ in server HTML on every indexable page (`htmlLimitedBots: /.*/` stops Next 15 streaming metadata into `<body>`).
- [x] robots.txt: allow public, disallow `/api/`, `/admin/`, `/search?`, utm URLs; Sitemap line; one explicit group each for Googlebot, Bingbot, Google-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-SearchBot, Claude-User, Applebot, Applebot-Extended. Dropped the non-standard `Host:` line.
- [x] Sitemap index `/sitemap.xml` → `/sitemaps/{tools,blog,brands,color-names,colors-1,palettes,gradients,interior}.xml`; lastmod from git history per route/section (`scripts/generate-content-dates.mjs`, runs as `prebuild`) or post dates; only indexable 200 URLs.
- [x] Canonical on every page (self-referencing on all 16,098 sitemap URLs). www→non-www 308 already in `next.config.js`; HEX normalization already works. http→https is a hosting setting (see manual tasks).
- [x] Invalid slugs return a real HTTP 404, **except** `/interior-colors/<unknown>` (see "Needs your decision").
- [x] GSC + Bing verification meta via `GSC_VERIFICATION` / `BING_VERIFICATION` (set at **build** time).

## Phase 2 — Metadata, headings, schema ✅
- [x] Central SEO helper: `createPageMetadata` (title, description, canonical, OG, Twitter) + JSON-LD helpers in `src/lib/seo.ts`; used by every page. No `meta keywords` (the `keywords` arg is accepted but never rendered).
- [x] Title pattern `<Keyword> – <benefit> | ColorBase`; every title ≤ 60 chars (`documentTitle` drops the suffix only when it would overflow; `fitTitle` picks the first brand-name variant that fits). Descriptions: `META_DESCRIPTIONS` (90 static pages, 140–155, unique, tested) + `fitDescription` templates for color, brand, brand-HEX, color-name, library color, family, kit, gradient, palette, blog, developer and Roblox pages.
- [x] One descriptive H1 on every sitemap URL (verified). Homepage H2s were already descriptive.
- [x] Generated 1200×630 OG images for color, brand (+ brand-HEX), palette and gradient pages. The existing color/brand/palette image routes were never referenced (every page hard-coded `/og-image.png`); `createPageMetadata({ ogImage })` now points `og:image` at them, and the catalog middleware lets `/brands/<slug>/opengraph-image` through.
- [x] JSON-LD: Organization (+ Play Store in `sameAs`) + WebSite on every page; tools now `WebApplication` (free, `DesignApplication`, publisher); FAQPage; BreadcrumbList; BlogPosting with `dateModified`, author/publisher `@id`. `Dataset` is deferred to the Phase 6 research report (the only data-report page).
- [x] Visible breadcrumbs on inner pages; added BreadcrumbList to `/color-meaning`, `/contact`, `/learning`, `/search` and the 4 legal pages (`<Breadcrumbs withJsonLd>`).

## Phase 3 — Answer-first content on tool pages
- [ ] Reusable server-rendered `<ToolContent>` section.
- [ ] Answer box (40–60 words) first.
- [ ] How-to (3–5 steps).
- [ ] Explainer with table/code where useful.
- [ ] 4–6 question-style FAQs.
- [ ] 3–5 related tool links.
- [ ] "Last updated" + maintainer line.
- [ ] Applied to every tool on `/tools`; ask about moving non-color tools to `/extras/`.

## Phase 4 — Upgrade existing programmatic pages
- [ ] `/color/[hex]` full upgrade (answer sentence, formats, shades/tints, harmonies, contrast, CVD previews, snippets, nearest names, palettes, varied description).
- [ ] Index only curated HEX set; others `noindex,follow`.
- [ ] Brand / palette / gradient / family pages: unique intros, snippets, related links, schema.
- [ ] Hub pages with crawlable pagination.

## Phase 5 — New page groups
- [ ] 5.1 Colors that go with X
- [ ] 5.2 Flag & team colors
- [ ] 5.3 Paint shade code → HEX
- [ ] 5.4 Outfit & saree color combinations
- [ ] 5.5 Palettes by use case
- [ ] 5.6 Game color tools (Discord ANSI + game codes)
- [ ] 5.7 Color blindness simulator
- [ ] 5.8 Color trends 2027 + color of the year
- [ ] 5.9 RAL colors

## Phase 6 — Original data report
- [ ] `scripts/brand-color-study/` + placeholder `sites.txt`
- [ ] Stats generation
- [ ] `/research/brand-colors-2026` page
- [ ] Findings → FAQ + links from tools

## Phase 7 — GEO extras
- [ ] `/llms.txt` + `/llms-full.txt`
- [ ] Quotable definition + "Key facts" on tool/data pages
- [ ] Consistent entity name "ColorBase (colorbase.in)"; stronger `/about`
- [ ] `/press` / media kit
- [ ] Embeddable widgets documented on `/developers`

## Phase 8 — Internal linking & cleanup
- [ ] No duplicate links per nav/footer section; no generic anchors
- [ ] 3–5 related tools per tool; hubs ↔ groups; blog → tools
- [ ] "Related pages" blocks on programmatic pages

## Phase 9 — Performance
- [ ] CWV targets; code-split / lazy-load heavy tools
- [ ] Image + font optimization; remove unused JS/CSS
- [ ] Before/after bundle + Lighthouse report

## Phase 10 — Blog engine & drafts
- [ ] MDX blog engine, TOC, CTA, related posts, BlogPosting, `/rss.xml`
- [ ] 10 full drafts (`draft: true`)
- [ ] Answer-first, question H2s, FAQ, ≥ 2 tool links

## Phase 11 — Final verification
- [ ] Every indexable URL passes the checks
- [ ] Sitemap = indexable URLs (`scripts/seo-check`)
- [ ] Lighthouse mobile SEO 100 / perf ≥ 90
- [ ] `docs/MANUAL_TASKS.md`

---

## Log

### Phase 0 — 2026-11-21
- Files: `CLAUDE.md` (Commands), `docs/SEO_PROGRESS.md`, `docs/seo-audit.md`, `scripts/seo-audit.mjs` (reusable crawler).
- Findings: see "Prioritized problems" in `docs/seo-audit.md`. Biggest: P1 (streamed metadata), P2/P3 (soft 404s), P7/P8 (title/description lengths), P11 (thin pages).
- Baseline: `tsc` clean, `eslint` 0 errors / 65 warnings, vitest 32 files / 131 tests pass, `next build` passes.
- For you: the working tree had uncommitted changes from earlier work (37 modified + several untracked files). Phase 0 commits only its own files.

### Phase 1 — 2026-11-21
- Before the phase: committed your earlier uncommitted SEO work as `chore: commit in-progress SEO work…` (your choice).
- Files: `next.config.js` (htmlLimitedBots, `/color-palette-generator` → `/palette-generator` 308, removed a duplicated redirect), `src/lib/robots.ts`, `src/app/robots.txt/route.ts`, `src/lib/sitemaps.ts`, `src/lib/sitemap-xml.ts`, `src/app/sitemap.xml/route.ts`, `src/app/sitemaps/[file]/route.ts`, `src/lib/data/content-dates.json`, `scripts/generate-content-dates.mjs`, `package.json` (prebuild, `seo:audit`, `seo:dates`), `src/app/layout.tsx` (verification), `.env.example`, `src/lib/tools-registry.ts` (removed the broken static-page entry), `src/app/color-palette-generator/page.tsx` (redirect), 4 pages linking to it, `src/lib/data/blog.ts` (`updatedAt`), `src/lib/interior/store.ts` (lastmod = updatedAt), `src/middleware.ts`, tests.
- Verified on a production build: full crawl of all 16,098 sitemap URLs → 0 non-200, 0 metadata outside `<head>` (was 12,187), 0 soft 404s, 0 noindex, 1 H1 each, self canonicals. Tests 134/134, tsc clean, lint 0 errors.
- **For you:**
  - Set `GSC_VERIFICATION` and `BING_VERIFICATION` in Hostinger **before the build** (static pages bake the tags in), then redeploy.
  - Turn on "Force HTTPS" for colorbase.in in hPanel (http→https lives in hosting, not the app), then check `curl -I http://colorbase.in/` and `curl -I https://www.colorbase.in/` both 301/308 to `https://colorbase.in/`.
  - Resubmit `https://colorbase.in/sitemap.xml` in Search Console (it is now a sitemap index).

## Needs your decision
- **Near-duplicate pages** (Phase 4): `/tailwind-colors` vs `/colors/tailwind`, `/material-colors` vs `/colors/material`, `/bootstrap-colors` vs `/colors/bootstrap`, `/css-named-colors` vs `/colors/css`, `/color-names/whitesmoke` vs `/color-names/white-smoke`. They now have distinct titles and descriptions, but each pair targets the same query. Recommended: canonical the `/colors/<kit>` swatch pages to the tool pages (and `white-smoke` → `whitesmoke`), keeping all URLs live. That removes pages from the index, so I'm waiting for your OK.
- **`/interior-colors/<unknown-slug>` returns HTTP 200** (with `noindex` + the not-found page, so it won't be indexed). Cause: the global `src/app/loading.tsx` Suspense boundary flushes a 200 before the page calls `notFound()`. A true 404 needs either removing the global loading screen or moving `src/middleware.ts` to the Node.js runtime so it can check the interior catalog. Both change rendering, so I left it.
- Mixed-case non-HEX paths (e.g. `/Color-Picker`) 404 instead of redirecting to lowercase. Blog category URLs use capitals (`/blog/category/Color%20Psychology`), so a blanket lowercase redirect would change existing URLs. Left as is.

### Phase 2 — 2026-11-22
- Files: `src/lib/seo.ts` (`documentTitle`, `fitTitle`, `fitDescription`, `clampDescription`, `ogImage`, WebApplication schema), `src/lib/data/meta-descriptions.ts` (new: 90 descriptions + 7 titles), `src/lib/colors/describe.ts` (new: computed color phrase / answer sentence), `src/lib/site-config.ts` (Play Store in `sameAs`), `src/components/layout/breadcrumbs.tsx` (`withJsonLd`), `src/components/layout/legal-page.tsx`, 21 page titles, 15 dynamic templates (`color/[hex]`, `brands/*`, `color-names`, `colors/*`, gradient/palette/blog/developer/Roblox/interior), `src/app/blog/[slug]/page.tsx` (BlogPosting + visible "Updated"), `src/app/gradient-library/[slug]/opengraph-image.tsx` (new), `src/lib/catalog-routes.ts`, tests.
- Verified on a production build, all 16,098 sitemap URLs: 0 titles > 60 chars (was ~3,700), 16,098/16,098 descriptions 140–155 (was ~10%), 0 duplicate descriptions, 1 H1 each; OG images return `image/png`. Tests 140/140, tsc clean, lint 0 errors.
- Remaining duplicate title: `/color-names/whitesmoke` and `/color-names/white-smoke` are two pages for #F5F5F5 (CSS keyword + catalog name). Consolidating them is a Phase 4 item (see "Needs your decision").
