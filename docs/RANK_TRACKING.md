# Rank tracking shortlist

**Chosen:** 2026-11-17 (user: track the picker / hex / palette / gradient seeds; AdSense reported approved).

This is a **priority ranking for monitoring**, not a claimed Google position. Import `docs/RANK_TRACKING.csv` into Search Console filters, Ahrefs, Semrush, or AccuRanker. Primary locale is **United States** (`US`); P1 also tracked in **GB** and head terms in **DE**. See `docs/ORGANIC_US_EU.md`.

## Rules

- One canonical URL per query. Do not add landing pages for the same intent.
- P1 = weekly check. P2 = every two weeks.
- After crawl, paste **real** GSC position / clicks into a tracker. Do not invent ranks.
- AdSense approval does not change indexation rules: no mass `/color/` or `/brands/` noindex, no extra doorway URLs.

## P1 — maximum-rank effort (existing tools)

| Keyword | URL | Why |
| --- | --- | --- |
| color picker | `/color-picker` | Head term; Randomize + RGBA already on-page |
| html color picker | `/color-picker` | Same URL, adjacent query |
| hex color picker | `/color-picker` | Same URL |
| hex color | `/color-codes` | Catalog / codes hub |
| hex color code | `/color-codes` | Catalog / codes hub |
| hex to rgb | `/hex-to-rgb` | Converter |
| rgb to hex | `/rgb-to-hex` | Converter |
| color palette | `/palette-generator` | Head palette term |
| palette generator | `/palette-generator` | Tool intent |
| color palette from image | `/image-palette-extractor` | Image workflow (alias 308s here) |
| css gradient generator | `/gradient-generator` | Canonical gradient tool |

## P2 — supporting + CTR hubs

RGBA / random / eyedropper picker queries → `/color-picker`.  
`image palette` → extractor. Linear/radial → those studio URLs.  
`opencode hex color` and `hot fudge color` → CTR comparison after the 2026-11-17 copy refresh.

## P1 — AI tools

| Keyword | URL |
| --- | --- |
| ai color generator | `/ai-color-copilot` |
| ai color copilot | `/ai-color-copilot` |
| ai color palette | `/ai-color-palette-generator` |
| ai color palette generator | `/ai-color-palette-generator` |

P2 AI: accessible palette, Tailwind generator, color system — same product, different query.

## P2 — color families and hubs (not every HEX)

Family queries (`red colors` …) map to `/colors/family/{slug}`. Hubs: pastel, shades of purple, complementary, Tailwind, Material, CSS named.

**Do not track “every HEX × AI”.** ~16.7 million `#RRGGBB` values plus AI suffixes are not 16.7 million rankable keywords. Google already has the **allowlisted** `/color/{hex}` inventory (~2.8k) and named-color URLs in the sitemap. Combinatorial pages (`#e11d48 ai palette`) are doorway spam, Hostinger inode risk, and AdSense low-value content.

## Not tracked

Per-HEX and per–color-name rows (lakhs of tracker slots). Near-duplicates until GSC shows impressions.
