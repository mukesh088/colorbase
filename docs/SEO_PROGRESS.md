# SEO + AEO + GEO progress — colorbase.in

Plan: [`SEO_GEO_PLAN.md`](../SEO_GEO_PLAN.md) (repo root). Rules: [`CLAUDE.md`](../CLAUDE.md).
Tick a task only when it is built, the build passes and it is committed.

## Handoff note (read first)
- **Status:** Phases 0–4 done. Phase 5 in progress on `seo/phase-5-page-groups` (each group committed separately): 5.1 ✅, 5.7 ✅, 5.6 Discord ✅. Remaining, in order:
  - 5.2 flags/teams, 5.3 paint codes, 5.6 game codes, 5.9 RAL: research public official sources, store with `source` + `verified: false`, pages `noindex` and out of the sitemap until you verify (your decision).
  - 5.4 outfit/saree and 5.5 palettes-for-use-case: computed from the combinations engine (`src/lib/colors/combinations.ts`); write unique intros so they don't duplicate `/colors-that-go-with`.
  - 5.8 trends/color of the year: draft + noindex with citations (your decision).
- Workflow notes: build with `npm run build` from `D:\projects\colorbase` (PowerShell), serve with `npx next start -p 3123`, scan with `node scripts/seo-audit.mjs --base-url http://localhost:3123`.
- Branches are stacked: `seo/phase-0-audit` → `seo/phase-1-crawling` → … Merge them into `main` in order (or merge the last one).
- Non-color tools: keep current URLs, group them as "More tools" (your answer, 2026-11-21). No `/extras/` move.
- Indexing decision (2026-11-22): the ~900 generated `/colors/[slug]` library colors and 2,000 catalog color names are now indexable and in the sitemap (they carry ~1,000 words of computed content each). Arbitrary `/color/[hex]` values outside the curated 3,534, `/search` and draft interior palettes stay `noindex`.
- Local builds: `next.config.js` honors `NEXT_DIST_DIR`. Run verification builds with `$env:NEXT_DIST_DIR='.next-verify'; npm run build; npx next start -p 3123` so they don't clobber a running `npm run dev` (which uses `.next`). Production/Hostinger still uses `.next`.
- Phase 5 decisions (2026-11-22): research flag/team/paint/RAL/game-code data from public official sources, store with `source` + `verified: false`, keep those pages `noindex` until you check; upgrade the color blindness simulator at the existing `/color-blind-simulator` and 308 `/color-blindness-simulator` to it; build `/color-trends-2027` and `/color-of-the-year` now as draft/noindex.
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

## Phase 3 — Answer-first content on tool pages ✅
- [x] Reusable server-rendered section: `<ToolAnswerSection>` (`src/components/content/tool-answer.tsx`), rendered by `ToolPageShell` directly under every tool, before the existing guide, related tools and FAQs. (Named `ToolAnswerSection` because `ToolContent` already renders the widgets.) Content lives in `src/lib/data/tool-answers.ts` (typed TS data, same pattern as the existing guides; no MDX dependency added).
- [x] Answer box first: question-style H2 + 40–60 word answer for all 76 live tools + 6 tool-like pages (AI generators, Color Atlas, Color Explorer, Image Tools). Word counts enforced by `tool-answers.test.ts`.
- [x] How-to: 3–5 numbered steps for every live tool (filled the 10 CSS studios that had none).
- [x] Explainer: table or CSS/HTML sample on 45 tools (conversion tables, WCAG thresholds, CVD types, CSS syntax for every generator) plus 3 "Key facts" on every tool (also covers Phase 7's key-facts task for tool pages).
- [x] 4–6 question-style FAQs on every live tool (existing; enforced by test).
- [x] 3–5 related tools per tool, never a redirected tool (fixed Font Generator's link to the retired fancy-text page; enforced by test).
- [x] "Last updated <date>" (from git history via `src/lib/content-dates.ts`) + "Maintained by the ColorBase team" linking `/about`.
- [x] Non-color tools: kept at their URLs (your decision) and grouped under "More tools: CSS layout, type & time" in a new server-rendered index on `/tools` (`src/components/tools/tools-index.tsx`, `/tools#more-tools`), plus a nav link. `/tools` went from 107 to 1,600 words of crawlable text with a real link to every tool.

## Phase 4 — Upgrade existing programmatic pages ✅ (one item waits on you)
- [x] `/color/[hex]`: new server-rendered `HexQuickFacts` block under the H1: answer sentence ("#E11D48 is a vivid pink-red. RGB …; HSL …"), computed usage sentences that vary by temperature and measured contrast, CMYK, WCAG table on white/black (AA, AA large, AAA), color-blindness previews (protan/deutan/tritan/achromat), CSS/SCSS/Tailwind snippet, nearest CSS keyword and Tailwind token, and library palettes/gradients containing the exact HEX. Existing page already had all formats incl. LAB/OKLCH, 50–950 scale, tints/shades/tones and five harmonies. Same block on `/colors/[slug]`, `/color-names/[slug]` and verified brand-HEX pages. Median `/color/*` page ≈ 1,000 words.
- [x] Indexing stays curated (CSS named colors, design-system colors, verified brand HEXes, hand-written references); other HEX values render with `noindex,follow` (existing `src/lib/hex-indexing.ts`, which plays the role of the plan's `popular-colors.json`).
- [x] Brand, palette, gradient and family pages: brand-HEX pages 190 → 309+ words; palette pages get a computed intro (each color named, pairs passing 4.5:1, strongest pair) replacing identical boilerplate; gradient pages get an "About" section (type, angle, stops, safest text color + ratio), linked color stops, 3 computed FAQs + FAQPage schema and 8 related gradients (35 → ~220 words); `/developers/[format]` shows real generated output for a sample palette and links all formats.
- [x] Hub pages with crawlable links: gradient category pages listed **0** gradient links in server HTML (client gallery); they now list every gradient in the category. Family pages showed only the first 120 colors; the remaining curated colors are now linked. Brand and color-name hubs already linked every item; palette categories already did.
- [x] Near-duplicate pairs (your decision, 2026-11-22): `/colors/tailwind|material|bootstrap|css` canonical → `/tailwind-colors`, `/material-colors`, `/bootstrap-colors`, `/css-named-colors`; `/color-names/white-smoke` → `/color-names/whitesmoke`. All URLs stay live; duplicates left the sitemap; nav links point at the canonical pages. (`aqua`/`cyan` and `fuchsia`/`magenta` are both official CSS keywords and stay.)

## Phase 5 — New page groups
- [x] 5.1 Colors that go with X: `/colors-that-go-with` hub + 122 pages (`/colors-that-go-with/navy-blue`, `sage-green`, `maroon`, `beige`, `mustard`, `teal`, …). Data `src/lib/data/combination-colors.json` built by `scripts/build-combination-colors.mjs` from CSS named colors (W3C) and meodai/color-names (MIT), every entry with `source` and `verified: true` (values copied from the cited datasets). "Sage Green"/"Mint Green" use the dataset's "Sage"/"Mint" values because its "Sage Green" (#887766) and "Mint Green" (#487D4A) are not what people mean; recorded as `sourceName`. Matches computed (`src/lib/colors/combinations.ts`): complement, 2 analogous, 2 split-complementary, light/dark neutrals mixed from the base, tint or shade; neutrals get classic CSS-keyword accents. Each page: answer sentence, 8 linked matches, 3 ready palettes, website/room/outfit/logo previews from swatches, 3 computed FAQs + FAQPage, 10 related bases. Own sitemap file `combinations.xml`; real 404 for unknown slugs; linked from color pages (when the HEX is a base), the color wheel and palette generator guides, and `/complementary-colors`.
- [~] 5.2 Flag & team colors: ✅ template `/flags/[country]` + hub `/flags` (HEX/RGB/CMYK table, other published values, CSS variables, FAQs, source line, "not yet checked" notice). Data `src/lib/data/flags.json`, first batch of 10 countries, all 10 marked `verified: true` by you on 2026-11-22 → indexed and listed in `sitemaps/flags.xml`. New countries are added as `verified: false` until you confirm them. ✅ all 256 flagcdn.com flags (countries, territories, England/Scotland/Wales/Northern Ireland) added 2026-11-22. The 10 verified entries keep their official-spec values; the other 246 are measured from each flag's SVG by `scripts/build-flag-colors.mjs` (declared colors ranked by rendered area, ≥ 1%, `share` stored) and are `verified: false` → `noindex` until you check them. New UI: real flag images (flagcdn.com, already allowed in `next.config.js`), searchable hub with A–Z jump, color cards with copy buttons and area share, three palettes (flag / soft / deep), CSS variables, FAQs, similar-color flags. ✅ Team colors (2026-11-22): `/teams` hub, `/teams/<league>` (IPL, NBA, NFL, MLB, NHL, Premier League, MLS) and `/teams/<league>/<team>` for 169 teams. Data `src/lib/data/teams.json` built by `scripts/build-team-colors.mjs` from the teamcolors dataset (github.com/jimniels/teamcolors, compiled from league brand sheets; NBA HEX converted from official RGB) plus 4 IPL teams from Wikipedia infobox HEX / Wikimedia colours SVG. All `verified: false` → `noindex`, out of the sitemap until you check them. ⏳ 6 IPL teams (DC, PBKS, RR, SRH, GT, LSG): Wikimedia rate-limited the colours SVGs (HTTP 429); retry later. ⏳ FIFA national teams (their kit colors mostly follow the flag; link to `/flags` for now).
- [ ] 5.3 Paint shade code → HEX
- [ ] 5.4 Outfit & saree color combinations
- [ ] 5.5 Palettes by use case
- [~] 5.6 Game color tools: ✅ Discord ANSI generator at `/discord-color-text-generator` (segments with text color 30–37, background 40–47, bold, underline; live preview; copies a real ```ansi block). Preview colors cite the community reference (`src/lib/discord-ansi.ts`, no official Discord table exists). ⏳ Valorant/BGMI/Free Fire/Fortnite code pages still need sourced data.
- [x] 5.7 Color blindness simulator: upgraded at the existing `/color-blind-simulator` (your decision) with three modes (HEX palette, image upload processed in the browser, website URL via the existing `/api/website-colors` CSS analysis), a 0–100% severity slider (`simulateColorBlindRgb`, linear blend toward the deficiency matrix) and side-by-side protan/deutan/tritan/achromat previews. `/color-blindness-simulator` 308s to it. Contrast checker and accessibility checker already link to it.
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

## Unverified data for you to check
Flip `"verified": true` in the data file once a value is confirmed; the page then becomes indexable and joins the sitemap automatically.
- `src/lib/data/flags.json`: 246 flags measured from SVG artwork, `verified: false`. Spot-check a few (e.g. compare with each country's official spec) and set `"verified": true` to index them; to accept all at once, replace `"verified": false` with `"verified": true` in that file.
- ~~first 10 flags~~ verified by you on 2026-11-22. (Original note: source: each country's Wikipedia "Flag of …" colour table, which cites the official spec): India, United States (State Dept set; GPO/Old Glory/ECA sets listed as alternatives), United Kingdom, Canada (#EF3340; FIP #FF0000 alternative), Germany (red #D00000, often quoted as #DD0000, so check), France (government #000091/#E1000F; lighter embassy set as alternative), Brazil, Australia, Pakistan (white not specified, #FFFFFF assumed), Bangladesh.
- Not added because no HEX is published anywhere citable: Japan (Munsell 5R 4/12 and DIC 156 only).

- `src/lib/data/teams.json`: 169 teams, `verified: false`. Known dataset quirks to check: NBA values come from the 2014–15 logo sheet (some teams rebranded since); the NFL entries' HEX and RGB sometimes disagree (e.g. Arizona #97233F vs RGB 135, 0, 39), HEX was kept.

## Needs your decision
- ~~Near-duplicate pages~~: decided 2026-11-22 (canonical to one page). Done in Phase 4.
- **`/interior-colors/<unknown-slug>` returns HTTP 200** (with `noindex` + the not-found page, so it won't be indexed). Cause: the global `src/app/loading.tsx` Suspense boundary flushes a 200 before the page calls `notFound()`. A true 404 needs either removing the global loading screen or moving `src/middleware.ts` to the Node.js runtime so it can check the interior catalog. Both change rendering, so I left it.
- Mixed-case non-HEX paths (e.g. `/Color-Picker`) 404 instead of redirecting to lowercase. Blog category URLs use capitals (`/blog/category/Color%20Psychology`), so a blanket lowercase redirect would change existing URLs. Left as is.

### Phase 2 — 2026-11-22
- Files: `src/lib/seo.ts` (`documentTitle`, `fitTitle`, `fitDescription`, `clampDescription`, `ogImage`, WebApplication schema), `src/lib/data/meta-descriptions.ts` (new: 90 descriptions + 7 titles), `src/lib/colors/describe.ts` (new: computed color phrase / answer sentence), `src/lib/site-config.ts` (Play Store in `sameAs`), `src/components/layout/breadcrumbs.tsx` (`withJsonLd`), `src/components/layout/legal-page.tsx`, 21 page titles, 15 dynamic templates (`color/[hex]`, `brands/*`, `color-names`, `colors/*`, gradient/palette/blog/developer/Roblox/interior), `src/app/blog/[slug]/page.tsx` (BlogPosting + visible "Updated"), `src/app/gradient-library/[slug]/opengraph-image.tsx` (new), `src/lib/catalog-routes.ts`, tests.
- Verified on a production build, all 16,098 sitemap URLs: 0 titles > 60 chars (was ~3,700), 16,098/16,098 descriptions 140–155 (was ~10%), 0 duplicate descriptions, 1 H1 each; OG images return `image/png`. Tests 140/140, tsc clean, lint 0 errors.
- Remaining duplicate title: `/color-names/whitesmoke` and `/color-names/white-smoke` are two pages for #F5F5F5 (CSS keyword + catalog name). Consolidating them is a Phase 4 item (see "Needs your decision").

### Phase 3 — 2026-11-22
- Files: `src/lib/data/tool-answers.ts` (new), `src/lib/data/tool-answers.test.ts` (new), `src/components/content/tool-answer.tsx` (new), `src/components/tools/tools-index.tsx` (new), `src/lib/content-dates.ts` (new; shared by sitemaps and bylines), `src/components/layout/tool-page-shell.tsx`, `src/components/layout/tool-pages.css`, `src/lib/data/tool-guides.ts` (guides for 10 CSS studios), `src/lib/tools-registry.ts` (`NON_COLOR_TOOL_SLUGS`, `REDIRECTED_TOOL_SLUGS`), `src/lib/nav.ts`, `src/app/tools/page.tsx`, 6 tool-like pages, `src/lib/sitemaps.ts`.
- Verified on a production build: tool pages gained ~120–220 words of server-rendered text each; `/tools` 107 → 1,600 words; `/color-atlas` 6 → 115; `/explore-colors` 6 → 105. Tests 143/143, tsc clean, lint 0 errors.
- Still under 250 words (Phase 4 / hubs): `/gradient-library/[slug]` (~35), `/developers/[format]` (~40), `/blog/category/*` (~36), `/colors/bootstrap` (46), `/colors/radix` (70), `/interior-colors` (82), brand-HEX pages (~190), some palette pages (~230), `/contact` (44).
- For you: review the 82 answers in `src/lib/data/tool-answers.ts`. They are written from each tool's existing copy and standard references (WCAG 2.2, CSS specs, color math); anything that misdescribes a tool is easiest to fix there.

### Phase 4 — 2026-11-22
- Files: `src/components/library/hex-quick-facts.tsx` (new), `src/lib/colors/describe.ts` (`contrastVerdict`, `hexUsageSentences`), `src/app/color/[hex]/page.tsx`, `src/app/colors/[slug]/page.tsx`, `src/app/color-names/[slug]/page.tsx`, `src/app/brands/[slug]/[hex]/page.tsx`, `src/app/gradient-library/[slug]/page.tsx`, `src/app/gradient-library/category/[category]/page.tsx`, `src/app/palette-library/[slug]/page.tsx`, `src/app/colors/family/[family]/page.tsx`, `src/app/developers/[format]/page.tsx`.
- Verified on a production build: full crawl of 16,098 sitemap URLs still clean (200, metadata in head, self canonical, 1 H1, titles ≤ 60, descriptions 140–155, unique); 0 invalid JSON-LD in a 448-page sample. Tests 143/143, tsc clean, lint 0 errors.
- Still thin (< 250 words): `/contact` (44), `/colors/bootstrap` (46), `/colors/radix` (70), `/interior-colors` (82), `/blog/category/*` with one post, a few palettes (~240). `/colors/bootstrap` and `/colors/radix` depend on the duplicate-page decision.

### Phase 5 (partial) — 2026-11-22
- 5.1 `/colors-that-go-with` (123 URLs), 5.7 simulator upgrade, 5.6 Discord ANSI tool. Each verified on a production build and committed separately on `seo/phase-5-page-groups`.
- Files: `scripts/build-combination-colors.mjs`, `src/lib/data/combination-colors.json`, `src/lib/colors/combinations.ts` (+test), `src/app/colors-that-go-with/**`, `src/lib/colors/convert.ts` (`COLOR_BLIND_MATRICES`, `simulateColorBlindRgb`, severity), `src/components/tools/color-blind-simulator.tsx`, `src/lib/discord-ansi.ts` (+test), `src/components/tools/discord-color-text-generator.tsx`, `src/app/discord-color-text-generator/page.tsx`, registry/answers/supplements/meta entries, `src/lib/sitemaps.ts` (`combinations` section), `src/lib/catalog-routes.ts`, `next.config.js`.
- Tests 152/152, tsc clean, lint 0 errors.

### Teams + shared UI — 2026-11-22
- Header: the "UI Theme" item is now an "Explore" menu (flags, teams by league, colors that go together, color blindness simulator, Discord text, color names A–Z). The theme builder is still under Tools.
- Shared components (code optimization): `ColorCodeCards`, `PaletteTrio`, `cssVariables` (`src/components/library/color-code-cards.tsx`), `SwatchCardBrowser` (searchable, filterable, A–Z card grid), `CollectionHero`, `letterOf` (utils), `simpleColorName`/`nameSwatches` (describe.ts). Flags, teams and the colors-that-go-with hub all use them; the old `flag-browser.tsx` was removed.

### Team logos, palette guide, color blindness test — 2026-11-22
- Team logos: 165 logos (NBA, NFL, MLB, NHL, MLS, Premier League) from the teamcolors repo, converted to 256px WebP by `scripts/build-team-logos.mjs` and self-hosted in `public/team-logos/<league>/<slug>.webp` (1.9 MB total). IPL teams have no logo yet (color block fallback). Logos are trademarks of their teams, shown for identification; remove any a team objects to.
- `PaletteGuide` (shared): per color role (primary/secondary/accent/neutral), suggested use, white/black text samples with WCAG ratios, strongest pair in the palette. On team and flag pages.
- New tool `/color-blind-test`: 7 original pseudo-isochromatic plates (control, 4 red–green, 2 blue–yellow), instant screening result with a "not a diagnosis" note. In the registry (Accessibility), with answer box, guide and FAQs.
- Explore menu now also lists the color blindness test and MLB/NHL/MLS teams; the new tools were moved out of the Tools menu.
