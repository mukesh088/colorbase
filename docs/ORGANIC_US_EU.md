# Organic traffic: United States and Europe

English pages on colorbase.in can rank in US and EU Search **without** country-specific URLs. Do not geotarget the property to India in Search Console.

## Search Console (do this in the UI)

1. **Settings → International targeting → Country:** leave **unlisted / not set**. If it is set to India, US and EU results are suppressed. Save.
2. **Performance → Countries:** compare United States, United Kingdom, Germany, France, Netherlands vs India (last 28 days vs previous 28). Export.
3. **Performance → Pages:** filter country = United States, then United Kingdom. Note which P1 URLs have impressions but low CTR — those get title/meta tests, not new pages.
4. **Sitemaps:** confirm `https://colorbase.in/sitemap.xml` is submitted and has no errors after deploy.
5. **URL inspection** on `/color-picker`, `/palette-generator`, `/hex-to-rgb`, `/ai-color-copilot` after this deploy; request indexing once.

Rank-tracker locales: **US** (all queries), **GB** (P1), **DE** (head terms). File: `docs/RANK_TRACKING.csv`.

## On-site (shipped 2026-11-17)

- Open Graph locale **en_US** (was en_IN), with en_GB / en_IN alternates.
- `hreflang` `en` + `x-default` on the canonical URL (one English site, worldwide).
- Organization / support `areaServed` **Worldwide** (legal address stays Ranchi).
- Software tools advertised as free **USD**, English, worldwide.

Do not add `/us/` clones, German doorway pages, or “color picker USA” landing URLs.

## What actually moves US/EU clicks

| Lever | Action |
| --- | --- |
| CTR | After 2 weeks of US impressions, rewrite titles only on URLs with impressions and CTR below the site average |
| Intent | Keep P1 tools as the ranking URL: picker, hex codes, palette, image palette, gradient, AI copilot |
| Internal links | Homepage, `/tools`, and blog posts should keep linking those P1 URLs with the query as link text |
| Speed | Hostinger 429s on `/color-picker` still hurt crawl; do not disable abuse protection, do keep CDN allowlists for Googlebot |
| Links | Earn mentions from design/dev write-ups; do not buy PBNs |

## Europe without localised sites

German, French, and Dutch queries still often click **English** color tools. Rank the English canonical. Add a translated site only if you will maintain unique copy — not auto-translated stubs.

## Out of scope

- Claiming a US office we do not have.
- Inventing GSC ranks.
- Lakhs of HEX × country keyword pages.
