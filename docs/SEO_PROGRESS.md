# SEO + AEO + GEO progress — colorbase.in

Plan: [`SEO_GEO_PLAN.md`](../SEO_GEO_PLAN.md) (repo root). Rules: [`CLAUDE.md`](../CLAUDE.md).
Tick a task only when it is built, the build passes and it is committed.

## Handoff note (read first)
- **Status:** Phase 0 done. Next: Phase 1 (start with P1 in `docs/seo-audit.md`: metadata streamed into `<body>` on 12,187 URLs).
- Run vitest from an upper-case drive path (`D:\projects\colorbase`). From `d:\…` every suite fails with "Vitest failed to find the current suite" (Windows drive-letter case makes vitest load twice).

---

## Phase 0 — Audit & setup (no feature changes) ✅
- [x] Detect the stack; fill in the "Commands" section of `CLAUDE.md`.
- [x] Create `docs/SEO_PROGRESS.md` with every task as a checklist.
- [x] List every public route, including dynamic ones (147 static + 18 dynamic; see `docs/seo-audit.md`).
- [x] Per-route title / description / canonical / H1 / server-HTML text / word count → `docs/seo-audit.md`.
- [x] Check robots.txt, sitemap, JSON-LD, OG tags, meta keywords, duplicate/generic links, soft 404s.
- [x] Main content is server-rendered (Next.js App Router, not an SPA), so no pre-render decision is needed.

## Phase 1 — Crawling & indexing
- [ ] Main text, title, meta, H1 and FAQ in server HTML on every indexable page.
- [ ] robots.txt: allow public, disallow `/api/` + admin/auth, Sitemap line, explicitly allow Googlebot, Bingbot, Google-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-SearchBot, Claude-User, Applebot-Extended.
- [ ] Sitemap index `/sitemap.xml` → tools, colors-N, brands, palettes, gradients, blog (+ new sections); real lastmod; only indexable 200 URLs.
- [ ] Canonical on every page; www→non-www and http→https 301; HEX URL normalization.
- [ ] Invalid slugs return a real HTTP 404.
- [ ] GSC + Bing verification meta tags via `GSC_VERIFICATION` / `BING_VERIFICATION` env vars.

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
