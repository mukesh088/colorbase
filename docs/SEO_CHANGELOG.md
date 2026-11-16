# SEO Changelog — 2026-11-17 content refresh

- `/brands/opencode` and `/color-names/hot-fudge`: unique titles, first-screen briefs, HEX/RGB/RGBA/HSL/CSS copy stack.
- Image palette: first-screen swatches + HEX/CSS/JSON/Tailwind export on `/image-color-picker`, `/image-palette-extractor`, and `/color-palette-from-image`. No new landing URLs.
- `/color-picker`: Randomize label, paste HEX/RGB/RGBA/HSL, RGBA copy (opaque paint).
- GSC: compare clicks/CTR on the two hubs after 2+ weeks.
- Keyword shortlist chosen 2026-11-17 (AdSense reported approved): `docs/RANK_TRACKING.csv` — picker, hex, palette, gradient, AI tools, color-family hubs + OpenCode / Hot Fudge. No HEX×AI doorway pages.
- US/EU organic: OG locale `en_US`, hreflang `en`/`x-default`, schema areaServed Worldwide, rank tracker US/GB/DE. Playbook: `docs/ORGANIC_US_EU.md`. Do not geotarget GSC to India.
- `SITE_CONTENT_UPDATED` → 2026-11-17.

# SEO Changelog — AdSense / Quality Wave 1

Date: 2026-11-11  
Baseline commit reference: `b696ace` (main before Wave 1)

## Policy snapshot (rollback reference)

| Rule | Before Wave 1 | After Wave 1 |
| --- | --- | --- |
| Indexable `/color/{hex}` | Allowlist via `hex-indexing` (~2,794) | **Unchanged** allowlist; richer curated briefs; generic family psychology suppressed when no unique source |
| Arbitrary hex | 200 + `noindex,follow` | **Unchanged** |
| Brand hubs in sitemap | All brands incl. ~2,000 Simple Icons stubs | Sitemap-worthy only: non–Simple Icons **or** Simple Icons with `guidelines` URL (~962 hubs). Stub pages **remain live** (crawlable), not mass-noindex |
| Brand hex in sitemap | Verified brand hexes | Same + parent must be sitemap-worthy |
| Tool aliases | Both URLs in sitemap | `css-gradient-generator` → `/gradient-generator` (308); `palette-from-image` → `/image-palette-extractor` (308); aliases **excluded** from sitemap |
| Sitemap URL total | ~13,335 | **~10,935** (pages 148 / brands 2,387 / color-names 1,141 / colors 3,925 / libraries 3,334) |
| Indexable hex count | 2,794 | **2,794** (preserved) |
| `lastmod` | Shared `SITE_CONTENT_UPDATED` | Shared date bumped to **2026-11-11** |
| robots.txt | No blanket `/color/` or `/brands/` block | **Unchanged** — do not robots-block noindexed hexes |
| AdSense | `ca-pub-9077025320968455` + `public/ads.txt` | **Preserved** |

## Code / content changes

1. **Indexation strategy** documented in `docs/INDEXATION_STRATEGY.md`.
2. **Brand sitemap filter** `isSitemapWorthyBrand` in `src/lib/data/brands.ts`.
3. **Hex brief quality** — expanded `HEX_REFERENCES`; color detail prefers reference copy over templated psychology.
4. **Metadata** shortened on theme builder, chart palette, brands directory where needed.
5. **Homepage** — “Build better color systems” + Picker / Palette / Contrast CTAs + workflows.
6. **Tool guides** — theme builder, chart palette, harmony studio, shades/tints/tones.
7. **Editorial** — two case-study guides; `CONTENT_IMPROVEMENT_PLAN.md`; learning + blog contextual links.
8. **Trust** — About/Privacy alignment; `ADSENSE_READINESS_CHECKLIST.md`.
9. **QA utilities** — `scripts/seo-quality-flags.mjs`, `npm run seo:flags`; live probe remains `scripts/check-seo.mjs`.

## Explicit non-changes (do not “fix” in a panic)

- No blanket `noindex` on `/color/` or `/brands/` hubs.
- No deletion of Simple Icons stub pages.
- No claim of AdSense approval or recovery from a presumed penalty.
- `/color-picker` 429s remain Hostinger/edge; app middleware was not loosened.

## Rollback

1. Revert Wave 1 commits (or restore `isSitemapWorthyBrand` to always `true` and remove alias sitemap exclusions / redirects if required).
2. Restore prior `SITE_CONTENT_UPDATED` if you need old `lastmod` for debugging only.
3. Re-submit sitemap in GSC after any rollback.
4. Prefer changelog + prior counts above over irreversible redirects of ranking HEX URLs.
`}