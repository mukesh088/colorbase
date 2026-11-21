# SEO + AEO + GEO progress — colorbase.in

Plan: [`SEO_GEO_PLAN.md`](../SEO_GEO_PLAN.md) (repo root). Rules: [`CLAUDE.md`](../CLAUDE.md).
Tick a task only when it is built, the build passes and it is committed.

## Handoff note (read first)
- **Status:** Phases 0–1 done. Next: Phase 2 (titles ≤ 60 chars, descriptions 140–155, duplicate titles, breadcrumbs, OG images, schema).
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

## Phase 2 — Metadata, headings, schema
- [ ] Central SEO helper (title, description, canonical, OG, Twitter, JSON-LD) on every page; no `meta keywords`.
- [ ] Title pattern `<Primary keyword> – <benefit> | ColorBase`; unique descriptions.
- [ ] One descriptive H1 per page; slogan H2s on the homepage renamed.
- [ ] Generated 1200×630 OG images for color, brand, palette and gradient pages.
- [ ] JSON-LD: Organization + WebSite (home), WebApplication (tools), FAQPage, BreadcrumbList, BlogPosting, Dataset.
- [ ] Visible breadcrumbs on inner pages.

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
- **`/interior-colors/<unknown-slug>` returns HTTP 200** (with `noindex` + the not-found page, so it won't be indexed). Cause: the global `src/app/loading.tsx` Suspense boundary flushes a 200 before the page calls `notFound()`. A true 404 needs either removing the global loading screen or moving `src/middleware.ts` to the Node.js runtime so it can check the interior catalog. Both change rendering, so I left it.
- Mixed-case non-HEX paths (e.g. `/Color-Picker`) 404 instead of redirecting to lowercase. Blog category URLs use capitals (`/blog/category/Color%20Psychology`), so a blanket lowercase redirect would change existing URLs. Left as is.
