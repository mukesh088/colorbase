# SEO Implementation Plan — colorbase.in

> **For the Cursor agent:** You are working on the codebase for **https://colorbase.in**, a free color toolkit for designers and developers (color picker, image color picker, palette generator, contrast checker, gradient generators, color code libraries for Tailwind/Material/Bootstrap/CSS named colors, brand colors, HEX/RGB/HSL converters, AI Color Copilot, blog, guides).
>
> **Goal:** Make every important page crawlable, indexable and rankable on Google, and build scalable, unique per-color and per-brand pages that bring organic traffic.
>
> **Rules for you (the agent):**
> 1. Work **one phase at a time**. At the end of each phase, stop, summarize what you changed (files + why), and wait for me to say "continue".
> 2. **Do not break existing tool functionality** or change visual design beyond what's needed (headings text, added content sections).
> 3. Reuse the project's existing framework, router, styling and component patterns. Don't add new frameworks unless a phase explicitly requires it and you ask first.
> 4. Never invent data (e.g., brand colors). If data isn't in the repo, create a clearly marked data file with TODOs instead of guessing.
> 5. Keep the canonical domain as `https://colorbase.in` (no `www`, always `https`). Put it in one config constant, e.g. `SITE_URL`.
> 6. After each phase, run the build and fix any errors before reporting.

---

## Phase 0 — Audit (no code changes)

1. Detect the stack: framework (Next.js App/Pages Router, Astro, Vite/React SPA, Nuxt, SvelteKit, plain HTML, etc.), rendering mode (SSR / SSG / client-only), hosting config (Vercel/Netlify/Cloudflare/other), and router.
2. List **every public route** in the app, including dynamic ones (e.g. `/color/[hex]`, `/brands/[slug]`, `/tailwind/...`, `/blog/[slug]`).
3. For each route, report in a table:
   - current `<title>`, meta description, canonical, H1
   - whether the main text content is present in the **server-rendered HTML** (check build output or `curl`-equivalent of the rendered HTML), or only appears after client JS runs
   - approx word count of real (non-nav) text
4. Check for: existing `robots.txt`, `sitemap.xml`, structured data (JSON-LD), Open Graph tags, `meta keywords` tag, duplicate links in the same section, generic anchor text ("View all", "Open swatch", "Learn more").
5. Identify non-color tools (font generator, fancy text generator, etc.).
6. Output a prioritized list of problems. **Stop and wait.**

---

## Phase 1 — Crawlability & indexing foundation

### 1.1 Server-rendered content
- If the site is a client-only SPA, every indexable page must ship its **title, meta tags, H1, intro text and FAQ in the initial HTML**.
  - Next.js: use Server Components / `generateStaticParams` + `generateMetadata` (App Router) or `getStaticProps` (Pages Router).
  - Vite/React SPA: propose pre-rendering (e.g. `vite-plugin-ssr`/Vike, `react-snap`, or migrating key pages to SSG) — **ask me before choosing**.
  - Interactive tool widgets can stay client-side, but the surrounding text content must be static HTML.

### 1.2 `robots.txt`
Create/update so it serves at `https://colorbase.in/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /*?*utm_
Sitemap: https://colorbase.in/sitemap.xml
```
(Adjust `Disallow` to real private paths: admin, API, auth, search-results pages with query params.)

### 1.3 `sitemap.xml`
- Generate automatically at build/request time from the real route list + all dynamic slugs (colors, brands, palettes, gradients, blog posts, guides).
- Include `<lastmod>` (use content/file modified date, not "now" on every build).
- If total URLs > 45,000, split into a **sitemap index** (`/sitemap.xml` → `/sitemaps/tools.xml`, `/sitemaps/colors-1.xml`, `/sitemaps/brands.xml`, `/sitemaps/blog.xml`).
- Exclude: legal pages are fine to include; exclude redirects, 404s, noindex pages, URLs with query strings.

### 1.4 Canonicals & redirects
- Every page outputs `<link rel="canonical" href="https://colorbase.in/<path>">` (lowercase, no trailing-slash inconsistency — pick one style and enforce it).
- 301 redirect `www.colorbase.in` → `colorbase.in` and `http` → `https` (in hosting config or middleware).
- HEX URLs: normalize to lowercase 6-digit without `#` (e.g. `/color/FF5733` and `/color/f53` → 301 to `/color/ff5733`).

### 1.5 Proper 404s
- Unknown routes and invalid slugs (e.g. `/color/zzzzzz`) must return **HTTP 404**, not a 200 "soft 404".

**Acceptance:** `robots.txt` and `sitemap.xml` load in production build; rendered HTML of 3 sample pages contains title, H1 and body text without JS. **Stop and wait.**

---

## Phase 2 — Metadata & headings for every page

### 2.1 Central SEO helper
Create one helper/component (e.g. `lib/seo.ts` or `<Seo />`) that produces: title, meta description, canonical, Open Graph (title, description, url, image, type), Twitter card, and optional JSON-LD. Use it on every page.

- Title format: `<Primary keyword> – <secondary> | ColorBase` — max ~60 chars.
- Meta description: 140–155 chars, unique per page, includes the main keyword and a benefit.
- **Remove the `<meta name="keywords">` tag** sitewide (obsolete).

### 2.2 Page-by-page targets (adjust to real routes)

| Page | Title | H1 |
|---|---|---|
| Home | Free Color Picker, HEX Codes & Palette Generator \| ColorBase | Free Color Picker, HEX Color Codes & Palette Tools |
| Color picker | Color Picker – Get HEX, RGB & HSL Codes Online \| ColorBase | Online Color Picker |
| Image color picker | Image Color Picker – Pick Colors from Any Photo \| ColorBase | Pick Colors from an Image |
| Palette generator | Color Palette Generator – Create Palettes Free \| ColorBase | Color Palette Generator |
| Contrast checker | Contrast Checker – WCAG AA & AAA Color Contrast \| ColorBase | WCAG Color Contrast Checker |
| Gradient generator | CSS Gradient Generator – Linear, Radial & Conic \| ColorBase | CSS Gradient Generator |
| HEX→RGB converter | HEX to RGB Converter \| ColorBase | HEX to RGB Converter |
| Tailwind colors | Tailwind CSS Colors – Full Palette with HEX Codes \| ColorBase | Tailwind CSS Color Palette |
| Brand colors | Brand Colors – Official HEX Codes of Top Brands \| ColorBase | Brand Color Codes |
| UI theme builder | UI Color Theme Builder – Export CSS & Tailwind Tokens \| ColorBase | UI Color Theme Builder |
| AI Copilot | AI Color Palette Generator – Accessible Color Systems \| ColorBase | AI Color Copilot |

### 2.3 Headings
- Exactly **one H1 per page**, descriptive and keyword-based (not a slogan). Slogans can stay as a subtitle `<p>`.
- Rename slogan H2s on the homepage to descriptive ones, e.g.:
  - "Great colors are already around you." → "Pick Colors from Images"
  - "Find a palette. Make it yours." → "Color Palette Generator & Library"
  - "A fresh take on gradients" → "CSS Gradient Generators"
- Logical hierarchy H1 → H2 → H3, no skipped levels.

### 2.4 Open Graph images
- Default OG image (1200×630) for the site.
- For dynamic color/brand/palette pages, generate OG images showing the swatch(es) + HEX (Next.js: `opengraph-image.tsx` / `@vercel/og`; otherwise a build script). Ask me if the stack makes this hard.

**Acceptance:** every route has a unique title, description, canonical and single H1. Print a table of all of them. **Stop and wait.**

---

## Phase 3 — Content on tool pages

For **each tool page**, add a static content section **below the tool** (server-rendered), 300–800 words, in a reusable layout component:

1. **Short intro (2–3 sentences)** — what the tool does, who it's for.
2. **How to use** — 3–5 numbered steps.
3. **Explainer** — relevant concept (e.g. contrast checker: what WCAG AA/AAA ratios mean (4.5:1, 3:1, 7:1); gradient: linear vs radial vs conic with CSS example; HEX: how hex notation maps to RGB).
4. **FAQ** — 4–6 real questions people search (e.g. "What is a good contrast ratio?", "How do I convert HEX to RGB?").
5. **Related tools** — 3–5 internal links with descriptive anchor text.

Store this content in markdown/MDX or a data file per tool so it's easy for me to edit. Write clear, accurate, original text — no filler, no keyword stuffing.

**Acceptance:** each tool page has ≥300 words of server-rendered text and a FAQ. **Stop and wait.**

---

## Phase 4 — Structured data (JSON-LD)

Add JSON-LD via the SEO helper:

- **Sitewide (home):** `Organization` (name "ColorBase", url, logo, `sameAs`: Play Store app URL `https://play.google.com/store/apps/details?id=com.colorbase.app`, Product Hunt, socials) + `WebSite`.
- **Tool pages:** `WebApplication` (`applicationCategory: "DesignApplication"`, `operatingSystem: "Any"`, `offers` price 0 INR/USD).
- **FAQ sections:** `FAQPage` matching the visible FAQ text exactly.
- **All non-home pages:** `BreadcrumbList`.
- **Blog posts/guides:** `Article` / `BlogPosting` with headline, datePublished, dateModified, author, image.
- **Mobile app (optional):** `MobileApplication` on an app promo page.

Validate output is valid JSON and matches visible content. **Stop and wait.**

---

## Phase 5 — Per-color & per-brand landing pages (main traffic driver)

### 5.1 Color pages — `/color/[hex]`
Pre-render (SSG/ISR) a **curated set** first — not all 16M colors:
- all CSS named colors (~148)
- full Tailwind, Material, Bootstrap, Flat UI palettes
- top ~500–1,000 popular HEX codes (create `data/popular-colors.json`)

Other valid HEX values can render on demand but should be **`noindex`** unless in the curated list (prevents thin-page bloat).

Each color page must have unique, computed content:
- H1: `#FF5733 Color – HEX, RGB, HSL & CMYK` (plus color name if known, e.g. "Tomato #FF6347")
- Large swatch, values in HEX / RGB / HSL / HSV / CMYK / LAB (computed)
- Shades (darker) and tints (lighter) — 10 steps each, each linking to its own color page
- Harmonies: complementary, analogous, triadic, split-complementary, tetradic
- Contrast with white & black text: ratio + AA/AAA pass/fail
- Color-blindness simulation previews (protanopia, deuteranopia, tritanopia)
- Copy-ready snippets: CSS (`color`, `background`), Tailwind arbitrary value / config, SCSS variable
- Short auto-generated description paragraph using the computed data (hue family, lightness, warm/cool, best uses) — vary sentence templates so pages aren't identical
- "Similar colors" (nearest named colors) + "Palettes using this color" links
- Breadcrumb: Home › Colors › #ff5733

### 5.2 Framework palette pages
- `/tailwind-colors`, `/tailwind-colors/[color]` (e.g. `/tailwind-colors/blue` with 50–950), same for Material, Bootstrap, CSS named colors, Flat UI.

### 5.3 Brand pages — `/brands/[slug]`
- H1: `Spotify Brand Colors – HEX, RGB & CMYK Codes`
- Swatches with values, copy buttons, CSS/Tailwind snippets, short brand note, related brands in the same industry.
- Data in `data/brands.json`. **Only use colors already in the repo; for any missing brand, add a TODO entry rather than guessing values.**

### 5.4 Palette & gradient pages
- Each named palette / gradient in the library gets its own indexable page with title, swatches, CSS export, and related palettes.

### 5.5 Hub/index pages
- `/colors` (browse by hue family: red, orange, yellow, green, blue, purple, pink, brown, gray, black, white), `/brands` (A–Z + by industry), `/palettes`, `/gradients` — paginated with real `<a href>` links (not JS-only buttons) so Google can crawl every child page.

Add all indexable dynamic pages to the sitemap (Phase 1.3).

**Acceptance:** build succeeds; 3 sample color pages and 2 brand pages render full content in HTML; non-curated HEX pages have `noindex`. **Stop and wait.**

---

## Phase 6 — Internal linking & site structure

- Header nav: main tools. Footer: grouped links (Tools, Color Codes, Brands, Learn, Company) — **remove duplicates** within the same section.
- Replace generic anchors ("View all", "Open swatch", "Learn more") with descriptive text ("View all Tailwind colors", "Open #ff5733 color details").
- Every tool page links to 3–5 related tools; every color page links to shades/tints/harmonies; blog posts link to the relevant tool.
- Add visible breadcrumbs on all inner pages.
- All links must be real `<a href>` elements (crawlable), not `onClick` navigation.
- Move non-color tools (font generator, fancy text generator) under a clearly separate section (e.g. `/extras/...`) or flag them for me to decide whether to remove — **ask, don't delete**.

**Stop and wait.**

---

## Phase 7 — Performance & Core Web Vitals

- Target: LCP < 2.5s, INP < 200ms, CLS < 0.1 on mobile.
- Lazy-load heavy tool scripts (image picker, AI Copilot) — load on interaction or when in viewport; code-split per route.
- Optimize images (WebP/AVIF, explicit width/height, `loading="lazy"` below the fold), preload the LCP image/font.
- Self-host fonts with `font-display: swap`; subset if possible.
- Remove unused JS/CSS; check bundle size and report the biggest chunks.
- Make sure there are no layout shifts when tools hydrate (reserve space).

Report before/after bundle sizes. **Stop and wait.**

---

## Phase 8 — Blog & guides setup

- Make sure blog/guides use MDX/markdown with frontmatter: `title`, `description`, `slug`, `date`, `updated`, `cover`, `tags`, `relatedTool`.
- Blog post template: H1, author/date, table of contents for long posts, related tool CTA box, related posts, `BlogPosting` schema.
- Create **draft outlines (not full posts)** in `content/blog/drafts/` for these topics, each with suggested H2s and which tool to link:
  1. WCAG contrast ratio explained (with examples)
  2. How to choose a brand color palette
  3. Best color combinations for websites
  4. Colors that go with navy blue
  5. Tailwind CSS color palette guide
  6. HEX vs RGB vs HSL — when to use each
  7. How to create a dark mode color palette
  8. Color psychology for UI design
- Add an RSS feed at `/rss.xml`.

**Stop and wait.**

---

## Phase 9 — Analytics & final checks

- Add Google Search Console verification via a meta tag or HTML file — use env var `NEXT_PUBLIC_GSC_VERIFICATION` (or equivalent); leave value empty for me to fill.
- Add privacy-friendly analytics placeholder (GA4 or Plausible) behind an env var, respecting the existing cookie policy.
- Final checklist — produce a report confirming:
  - [ ] robots.txt + sitemap(s) live and valid
  - [ ] every indexable page: unique title, description, canonical, single H1, ≥300 words where it's a tool/content page
  - [ ] JSON-LD valid on home, tools, FAQ, breadcrumbs, blog
  - [ ] no soft 404s; www/http redirects work; HEX URL normalization works
  - [ ] no `meta keywords`; no duplicate footer links; no generic anchors
  - [ ] content visible in server HTML without JavaScript
  - [ ] Lighthouse mobile SEO score 100, performance ≥ 90 on home and 2 tool pages

---

## Manual steps for me (not the agent)

1. Google Search Console → add **Domain property** `colorbase.in` → verify via DNS TXT at the registrar.
2. Submit `https://colorbase.in/sitemap.xml` under *Sitemaps*.
3. URL Inspection → **Request indexing** for home + top 10–20 pages.
4. Also add the site to **Bing Webmaster Tools** (import from GSC).
5. Check the *Pages* report after 1–2 weeks; fix "Crawled – currently not indexed" pages by adding more unique content.
6. Backlinks: Product Hunt (web launch), AlternativeTo (as alternative to Coolors / Adobe Color), SaaSHub, Toolify, There's An AI For That, BetaList, Dev.to/Hashnode posts, helpful Reddit posts (r/webdev, r/web_design, r/tailwindcss), open-source GitHub package linking to the site.
7. Link the Play Store listing ↔ website both ways.
8. Publish 2–4 blog posts per week from the Phase 8 outlines.
