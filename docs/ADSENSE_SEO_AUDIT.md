# ColorBase AdSense / SEO Audit (Wave 1)

Reviewed on November 11, 2026 against repository `main` at commit `b696ace`.
This is a codebase-and-policy audit. Live Search Console exports were not
available in this environment. Impression decline numbers from the product owner
(8,088 on 2026-10-12 → 1,710 on 2026-11-08) are treated as investigation leads,
not as proof of a Google penalty.

Machine-readable family inventory: [`url-inventory.json`](./url-inventory.json).

## Executive verdict

ColorBase already has stronger indexation gates than a typical thin color
directory: curated `/color/{hex}` allowlisting (~2,794 sitemap hexes),
unverified brand hex exclusion, sharded sitemaps (~13,335 URLs), Hostinger-safe
`force-dynamic` for high-cardinality routes, 62 tools with 44 guides, and an
original learning/blog corpus.

AdSense “low value content” risk remains because:

1. Indexable hex pages still share templated usage and family-psychology copy.
2. About 2,000 Simple Icons brand stubs share near-identical overview sentences.
3. Duplicate tool URLs still self-canonicalize (`css-gradient-generator` /
   `gradient-generator`, `palette-from-image` / `image-palette-extractor`).
4. Large gradient/palette library shards are high-scale templated pages.
5. Some featured tools (theme builder, chart palette, harmony/shades) lack
   ToolGuide educational blocks.

## Architecture snapshot

| Area | Fact |
| --- | --- |
| Framework | Next.js 15 App Router, React 19, TypeScript |
| Deploy | Hostinger Node standalone; `isrFlushToDisk: false`; images unoptimized |
| Metadata | `createPageMetadata` in `src/lib/seo.ts` (`noIndex` → `index:false, follow:true`) |
| Hex index | `src/lib/hex-indexing.ts` allowlist |
| Sitemaps | `src/lib/sitemaps.ts` shards pages/brands/color-names/colors/libraries |
| Middleware | Catalog 404/308 only — **no app-layer 429 on `/color-picker`** |
| Ads | `ads.txt` + `ca-pub-9077025320968455`, script `lazyOnload` |
| Tests | Vitest unit suite; no Playwright smoke in package scripts |

## Page inventory (family level)

| Pattern | Intent | Indexability | Unique value | Risk | Action | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Product | Index | Interactive entry | Low | KEEP AND IMPROVE | P1 |
| `/color/{hex}` | Lookup | Allowlist index; else noindex | Formats, contrast, brands | Templated prose | KEEP AND IMPROVE allowlist; KEEP FUNCTIONAL BUT NOINDEX arbitrary | P0 |
| `/colors/{slug}` | Library | Curated only | Named tokens | Medium | KEEP AND IMPROVE | P0 |
| `/brands/{slug}` | Brand hub | Index | Palette + source | 2k stubs | KEEP AND IMPROVE core; REQUIRES MANUAL REVIEW stubs | P0 |
| `/brands/{slug}/{hex}` | Brand swatch | Verified only | Brand context | Medium | KEEP verified; noindex unverified | P0 |
| `/color-names/{slug}` | Named color | Non-catalog | Identity | Medium | KEEP AND IMPROVE | P1 |
| `/{tool}` | Tools | Index | Working UI + guides | Alias pairs | KEEP AND IMPROVE; CONSOLIDATE aliases | P0 |
| `/gradient-library/*` | Inspiration | Index | Preview/CSS | Scale | REQUIRES MANUAL REVIEW | P1 |
| `/palette-library/*` | Inspiration | Index | Preview | Scale | REQUIRES MANUAL REVIEW | P1 |
| `/blog/*`, `/learning`, `/learn/color-codes` | Editorial | Index | Original writing | Low | KEEP AND IMPROVE | P1 |
| `/search` | Search UI | noindex | Query UI | — | KEEP FUNCTIONAL BUT NOINDEX | Done |
| Trust pages | Trust | Index | Policies | Low | KEEP AND IMPROVE | P0 |
| Retired tools → `/tools` | Legacy | 308 | Soft-404 risk | Equity loss | REQUIRES MANUAL REVIEW | P0 |

## Low-value content risks (policy-aligned)

Per [Google low-value publisher content](https://support.google.com/publisherpolicies/answer/11112688)
and [helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content):

- **Scaled templates:** Indexable hex pages share `colorUsageNotes` plus a fixed
  `psychologyForFamily` paragraph even when no unique reference exists.
- **Icon-library brands:** `expanded-brands.json` (2,000) uses one overview
  template. Values must stay labeled as Simple Icons references, not official
  guidelines, unless `guidelinesUrl` is present (~800 have guidelines).
- **Overlapping tools:** Same component, two URLs, two self-canonicals.
- **Suite topical stretch:** CSS layout utilities without color education dilute
  topical focus; keep functional, do not mass-delete without traffic review.

## Crawler / 429 note

OpenSEO previously reported HTTP 429 on `/color-picker`. Application middleware
does not rate-limit HTML. Hostinger CDN documentation (`HOSTINGER.md`, commits
`b696ace` / `b9e457f`) attributes ClaudeBot/GPTBot 429s to `hcdn` edge limits.
Do not loosen abuse protection. Prefer CDN allowlists for legitimate crawlers.

## Search Console investigation (manual)

Prepare but do not invent:

1. Performance export for last 28 complete days vs prior 28.
2. Separate retired-tool URL losses from surviving color/tool losses.
3. Coverage: crawled-not-indexed vs excluded by noindex for `/color/*`.
4. Compare which of each duplicate-tool pair Google selects.

Import checklist lives in `POST_LAUNCH_MONITORING.md`.

## Wave 1 remediation map

| Work | Outcome |
| --- | --- |
| Hex brief quality | More `HEX_REFERENCES`; suppress generic psychology when no unique source |
| Brand sitemap | Include expanded stubs only when `guidelinesUrl` exists |
| Tool aliases | 308 `css-gradient-generator` → `gradient-generator`; `palette-from-image` → `image-palette-extractor` |
| Metadata | Cap long titles/descriptions on heavy tools/hubs |
| Guides | theme-builder, chart-palette, harmony, shades |
| Editorial | Two case studies + content plan |
| Trust / AdSense | Accurate legal pages + readiness checklist |

## Explicit non-actions this wave

- No blanket noindex of `/color/` or `/brands/`
- No mass deletion of expanded brands
- No robots.txt block of noindexed hex pages
- No claim of AdSense approval
- No fabricated GSC metrics or CWV scores
