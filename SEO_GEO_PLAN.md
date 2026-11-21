# SEO + AEO + GEO Plan — colorbase.in

> Follow the rules in `CLAUDE.md`. Work phase by phase, tick tasks in `docs/SEO_PROGRESS.md`, and commit after each phase.
> **SEO** = rank on Google/Bing. **AEO** = get picked for featured snippets, People Also Ask and voice answers. **GEO** = get cited by ChatGPT, Perplexity, Gemini, Google AI Overviews and Claude.

---

## Phase 0 — Audit & setup (no feature changes)
- [ ] Detect the stack (framework, router, rendering mode: SSR/SSG/SPA, hosting). Fill in the "Commands" section of `CLAUDE.md`.
- [ ] Create `docs/SEO_PROGRESS.md` with every task from this plan as a checklist.
- [ ] List every public route, including dynamic ones (`/color/[hex]`, `/brands/[slug]`, `/gradient-library/[slug]`, `/colors/family/[name]`, `/blog/[slug]`, etc.).
- [ ] For each route, record the title, description, canonical, H1, whether the main text is in the server HTML without JS, and the word count. Save this as `docs/seo-audit.md`.
- [ ] Check for robots.txt, sitemap, JSON-LD, OG tags, meta keywords, duplicate or generic links, and soft 404s.
- [ ] If the main content is JS-only, **ask me** before choosing a pre-render/SSR approach. Otherwise continue.

## Phase 1 — Crawling & indexing
- [ ] Main text, title, meta, H1 and FAQ render in the server HTML on every indexable page (interactive widgets may stay client-side).
- [ ] `robots.txt`: allow everything public, disallow `/api/` and admin/auth paths, and add `Sitemap: https://colorbase.in/sitemap.xml`. **Explicitly allow** search and AI crawlers: Googlebot, Bingbot, Google-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-SearchBot, Claude-User, Applebot-Extended.
- [ ] Automatic sitemap index: `/sitemap.xml` → `tools.xml`, `colors-N.xml`, `brands.xml`, `palettes.xml`, `gradients.xml`, `blog.xml`, plus one for each new section. Use real `lastmod` dates, and include only indexable 200 URLs.
- [ ] Canonical on every page. 301 redirects for www→non-www and http→https. Normalize HEX URLs (`/color/FF5733` and `/color/f53` → `/color/ff5733`).
- [ ] Invalid slugs return a real HTTP 404.
- [ ] Add a Search Console verification meta tag and a Bing verification tag via env vars (`GSC_VERIFICATION`, `BING_VERIFICATION`), with the values left empty for me.

## Phase 2 — Metadata, headings, schema
- [ ] Central SEO helper/component covering title, description, canonical, OG, Twitter and JSON-LD. Use it on every page and remove `meta keywords`.
- [ ] Title pattern: `<Primary keyword> – <benefit> | ColorBase`. Write a unique description for each page.
- [ ] One descriptive H1 per page. Slogans become subtitles. Rename slogan H2s on the homepage (e.g. "Great colors are already around you." → "Pick Colors from Images").
- [ ] Generated OG images (1200×630) for color, brand, palette and gradient pages showing swatches and HEX codes.
- [ ] JSON-LD:
  - home: `Organization` (name "ColorBase", url, logo, `sameAs`: Play Store `https://play.google.com/store/apps/details?id=com.colorbase.app`, Product Hunt, GitHub, socials) + `WebSite`
  - tools: `WebApplication` (free, `applicationCategory: DesignApplication`)
  - FAQ blocks: `FAQPage`, matching the visible text exactly
  - inner pages: `BreadcrumbList`
  - blog: `BlogPosting` with author, datePublished and dateModified
  - data/report pages: `Dataset`
- [ ] Visible breadcrumbs on inner pages.

## Phase 3 — Answer-first content on tool pages (AEO + GEO core)
Build a reusable `<ToolContent>` section that is server-rendered below each tool, with its content in MDX/markdown per tool:
- [ ] **Answer box first:** a 40–60 word plain-language definition or answer at the top (e.g. "A contrast ratio measures… WCAG AA requires 4.5:1 for normal text…"). This is the text snippets and AI answers quote.
- [ ] How to use it (3–5 numbered steps).
- [ ] An explainer with a small table or code example where useful.
- [ ] 4–6 FAQs written the way people ask ("What is a good contrast ratio?").
- [ ] Related tools (3–5 descriptive internal links).
- [ ] A "Last updated" date and an author/maintainer line (E-E-A-T).
- [ ] Do this for every tool on `/tools` (≈60). Group the non-color tools (font generator, fancy text) and **ask me** whether to move them to `/extras/`.

## Phase 4 — Upgrade the existing programmatic pages
- [ ] `/color/[hex]`: answer sentence first ("#FF5733 is a vivid reddish-orange. RGB 255, 87, 51; HSL 11°, 100%, 60%."), then all formats (HEX/RGB/HSL/HSV/CMYK/LAB), 10 shades and 10 tints (linked), harmonies, contrast on white and black with AA/AAA results, color-blindness previews, CSS/Tailwind/SCSS snippets, nearest named colors, palettes that use the color, and a templated description that varies by hue, lightness and temperature.
- [ ] Index only a curated set: CSS named colors, all design-system palettes, and `data/popular-colors.json` (top ~1,000). Other HEX values render but are `noindex,follow`.
- [ ] Brand pages, palette pages, gradient pages and family pages get unique intros, copy snippets, related links and schema.
- [ ] Hub pages (`/colors`, `/brands`, `/palette-library`, `/gradient-library`) use crawlable pagination with real links.

## Phase 5 — New page groups (growth). Build in this order.
Each group needs a data file (with `source` and `verified` fields), a template, a hub page, sitemap entries, internal links from related tools, and schema. Unverified entries stay `noindex`.

- [ ] **5.1 "Colors that go with X":** `/colors-that-go-with/[color]` (navy-blue, sage-green, maroon, beige, mustard, teal, …, about 150 common color names). Show 5–8 matches computed with the harmony engine, ready palettes, and use-case previews (website, room, outfit, logo), with an answer sentence first.
- [ ] **5.2 Flag & team colors:** `/flags/[country]` (≈195) and `/teams/ipl/[team]`, `/teams/fifa/[team]`, `/teams/nba/[team]`. HEX/RGB/CMYK values, a CSS snippet and a matching palette. Data only from official or cited sources.
- [ ] **5.3 Paint shade code → HEX:** `/paint/[brand]/[code-name]` for Asian Paints, Berger, Nerolac, Dulux, Sherwin-Williams and Benjamin Moore. HEX/RGB approximation, the nearest shade from other brands, wall combinations (link `/house-color-combinations`), and a disclaimer that screen colors are approximate. **Don't make up codes:** build the template and hub, add only entries with a source, and list everything missing for me.
- [ ] **5.4 Outfit & saree color combinations:** `/outfit-colors/[item]` ("black-pants", "navy-blazer", …) and `/saree-color-combinations/[color]`. Use computed pairings with an illustration made from swatches (no stock photos of people).
- [ ] **5.5 Palettes by use case:** `/palettes-for/[use-case]` (restaurant-logo, fintech-app, wedding-invitation, youtube-thumbnail, diwali-poster, kids-brand, saas-dashboard, …, about 60). 3–5 palettes each with a theme-builder preview link.
- [ ] **5.6 Game color tools:** a Discord colored text (ANSI) generator at `/discord-color-text-generator`, plus `/color-codes/valorant-crosshair`, `/color-codes/bgmi`, `/color-codes/free-fire` and `/color-codes/fortnite`, using only documented codes.
- [ ] **5.7 Color blindness simulator:** `/color-blindness-simulator` covering images and URLs, with protanopia, deuteranopia, tritanopia, achromatopsia and severity sliders. Link it from the contrast checker and accessibility checker.
- [ ] **5.8 Color trends:** `/color-trends-2027` (UI, interior, fashion) and `/color-of-the-year` (with each brand's announced color, cited). Publish the draft by mid-December.
- [ ] **5.9 RAL colors:** `/colors/ral` and `/colors/ral/[code]` (RAL Classic, labeled as screen approximations). No Pantone library.

## Phase 6 — Original data report (the strongest asset for backlinks and AI citations)
- [ ] Write a script (`scripts/brand-color-study/`) that runs the existing website color extractor over a list of sites I provide (put a placeholder `sites.txt` with instructions; **don't scrape without my list**).
- [ ] Generate stats: most common primary hues, the share failing WCAG AA, dark vs light themes, and differences by industry and by India vs global.
- [ ] Publish `/research/brand-colors-2026` with charts, methodology, a downloadable CSV, `Dataset` schema, quotable key findings in short sentences, and a "Cite this report" box (APA + HTML snippet).
- [ ] Turn the key findings into an FAQ and link them from related tool pages.

## Phase 7 — GEO extras
- [ ] `/llms.txt` (and `/llms-full.txt`): a markdown summary of what ColorBase is, its main tools with URLs, and its data sections. It's cheap and harmless. Note: Google says it ignores this file, so it's only for other AI tools.
- [ ] Every tool and data page has a short, factual, quotable definition sentence and a "Key facts" list.
- [ ] Use the same entity name everywhere: "ColorBase (colorbase.in)" in the header, footer, About page and schema. Strengthen `/about` with who builds it, why, contact details and links to the app and socials, so AI tools don't confuse it with ColorBase.com.
- [ ] A `/press` or `/media-kit` page with the logo, a one-line description, screenshots and key stats (makes it easy for writers to mention and link you).
- [ ] Embeddable widgets: a palette embed and a "contrast verified by ColorBase" badge, both with a backlink. Document them on `/developers`.

## Phase 8 — Internal linking & cleanup
- [ ] Remove duplicate links in each footer/header section. Replace generic anchors ("View all", "Open swatch") with descriptive ones.
- [ ] Each tool links to 3–5 related tools. Every new page group links back to its hub and its tool. Blog posts link to tools.
- [ ] "Related pages" blocks on programmatic pages (similar colors, similar brands, nearby flags).

## Phase 9 — Performance (Core Web Vitals)
- [ ] Mobile targets: LCP < 2.5s, INP < 200ms, CLS < 0.1. Code-split each tool and lazy-load heavy ones (image/video/PDF extractors, AI Copilot) when someone interacts.
- [ ] Optimize images (AVIF/WebP, set width and height), self-host fonts with `font-display: swap`, remove unused JS/CSS.
- [ ] Report before/after bundle sizes and Lighthouse scores for home and three tool pages in `docs/SEO_PROGRESS.md`.

## Phase 10 — Blog engine & content drafts
- [ ] MDX blog with frontmatter (`title, description, date, updated, author, cover, tags, relatedTool`), a table of contents, a tool CTA box, related posts, `BlogPosting` schema and an RSS feed at `/rss.xml`.
- [ ] Write **full drafts** (marked `draft: true`, for my review) for these posts: WCAG contrast ratio explained; HEX vs RGB vs HSL; how to choose a brand color palette; best website color combinations 2026; colors that go with navy blue; Tailwind color palette guide; dark mode palette guide; color psychology in UI; Asian Paints shade codes explained; Indian flag colors and their meaning.
- [ ] Each draft opens with an answer, uses question-style H2s, has an FAQ and links to two or more tools.

## Phase 11 — Final verification
- [ ] Every indexable URL passes: 200 status, unique title and description, canonical, one H1, server-rendered text, valid JSON-LD.
- [ ] Sitemap URLs equal the indexable URLs (write `scripts/seo-check` to crawl the production build and report problems).
- [ ] Lighthouse mobile SEO score of 100 and performance of 90 or more on key pages.
- [ ] Write `docs/MANUAL_TASKS.md` for me (see below), filled with the real URLs.

---

## Things only I (the owner) can do — Claude writes these into `docs/MANUAL_TASKS.md`
1. Google Search Console: add the Domain property, verify it via DNS, submit the sitemap, and request indexing for the top 20 URLs.
2. Bing Webmaster Tools: import from Search Console and submit the sitemap.
3. Fill in the env vars (verification codes, analytics) and deploy.
4. Check the data entries marked `verified: false` and the blog drafts.
5. Provide `sites.txt` for the research study.
6. Submit and launch on Product Hunt (web), AlternativeTo, SaaSHub, Toolify, There's An AI For That and BetaList. Post the research report on Reddit, Dev.to and LinkedIn.
7. Each month, ask ChatGPT, Perplexity and Gemini about your target queries and note whether ColorBase is cited.
