# Indexation Strategy (Wave 1)

Effective date: 2026-11-11. Rollback snapshot: pre-change behavior documented in
`SEO_CHANGELOG.md` and prior files `SEO-AUDIT-2026-10-16.md`,
`SEARCH-CONSOLE-COVERAGE-2026-10-17.md`.

## Principles

1. Prefer curated, useful URLs in sitemaps and `index`.
2. Keep lookup functionality for arbitrary hex without promoting thin pages.
3. Never blanket-noindex `/color/` or `/brands/`.
4. Do not robots.txt-block noindexed pages before Google can read `noindex`.
5. Preserve Hostinger constraints (no mass static prebuild of hex pages).

## Rules by family

| Family | HTTP | robots | Sitemap | Notes |
| --- | --- | --- | --- | --- |
| `/color/{hex}` allowlisted | 200 | index,follow | Yes | Curated library, CSS names, verified brands, HEX_REFERENCES |
| `/color/{hex}` other valid | 200 | noindex,follow | No | Full tool UI still works |
| `/colors/{slug}` curated | 200 | index | Yes | `isCuratedLibraryColor` |
| `/brands/{slug}` core / guidelines | 200 | index | Yes | Non–Simple Icons **or** `guidelinesUrl` |
| `/brands/{slug}` Simple Icons stub without guidelines | 200 | index,follow | **No** | Page remains crawlable; removed from sitemap until review |
| `/brands/{slug}/{hex}` verified | 200 | index | Yes (if brand sitemap-worthy) | Unverified stays noindex |
| Tools (canonical) | 200 | index | Yes | Working UI + guides |
| Tool aliases | **308** | — | No | `css-gradient-generator` → `gradient-generator`; `palette-from-image` → `image-palette-extractor` |
| `/search` | 200 | noindex,follow | No | Already enforced |
| Gradient/palette libraries | 200 | index | Yes | Manual review for further pruning |

## Hex content quality

- Expand hand-written `HEX_REFERENCES` for common product colors.
- On `/color/{hex}`, omit generic family-psychology boilerplate unless a
  `HEX_REFERENCES` entry or named-color identity supplies unique context.
- Do not invent brand psychology essays for every RGB value.

## lastmod

Continue shared `SITE_CONTENT_UPDATED` for sitemap entries until per-resource
revision dates exist. Do not stamp `new Date()` at request time.

## Crawler / 429

App middleware does not return 429 for HTML. Hostinger CDN rate limits for
aggressive bots are documented separately. Prefer allowlisting legitimate
crawlers at the CDN; do not disable abuse protection.

## Rollback

1. Revert `isSitemapWorthyBrand` filter in `sitemaps.ts`.
2. Remove alias redirects from `next.config.js`.
3. Restore psychology paragraph gating if needed.
4. Redeploy and resubmit `/sitemap.xml` in Search Console.
