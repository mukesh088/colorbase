# QA Test Results — Wave 1 (2026-11-11)

## Automated

| Check | Command | Result |
| --- | --- | --- |
| Unit / integration | `npm test` (vitest) | **Pass** — 16 files, 88 tests |
| SEO quality flags | `npm run seo:flags` | **Pass** after docs present; expected `review` on large Simple Icons stub catalog |
| Production build | `npm run build` | **Pass** — Next.js 15.5 compile + Hostinger postbuild |

### Notable test updates

- `sitemaps.test.ts` — alias tools excluded; brand hubs limited to sitemap-worthy set; total URL count &lt; 12k.
- `brands-sitemap.test.ts` — `isSitemapWorthyBrand` rules.
- `reference-catalogs.test.ts` — stub routes stay crawlable; sitemap inclusion follows guidelines / worthy filter.

## Manual browser checks (document; Playwright not added this wave)

Run against staging or production after deploy:

1. `/` — headline “Build better color systems”; CTAs to picker, palette, contrast; workflows visible.
2. `/theme-builder`, `/chart-palette-generator`, `/tools/harmony-studio`, `/tools/shades-tints-tones` — interactive tool primary; guide section present below.
3. `/color/ff0000` (or other allowlisted hex) — curated/reference copy preferred; page indexable.
4. `/color/123456` — functional + `noindex`.
5. `/brands/1password` (guidelines stub) vs a stub without guidelines — both load; only worthy brands appear in sitemap shards.
6. `/css-gradient-generator` → 308 `/gradient-generator`; `/palette-from-image` → 308 `/image-palette-extractor`.
7. `/blog/case-study-an-accessible-saas-dashboard-palette` and `/blog/case-study-light-and-dark-theme-from-one-brand-blue` — render, FAQs, studio links.
8. `/learning` — links to case studies and theme builder.
9. `/ads.txt` — contains `pub-9077025320968455`.
10. Trust pages `/about`, `/privacy`, `/terms`, `/contact`, `/cookies`, `/disclaimer` — match current product (tools, analytics, AdSense).

## Live SEO probe (optional)

`npm run seo:check -- --base-url https://colorbase.in` after deploy. Not run in this agent session against production.

## Explicitly not claimed

- AdSense approval
- Core Web Vitals percentile wins
- Search Console recovery from a presumed penalty
`}