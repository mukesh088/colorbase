# Post-Launch Monitoring (Wave 1)

Use this checklist after deploy. Nothing here predicts AdSense approval.

## Week 1 — Search Console

Import CSVs (no API assumed):

1. **Coverage / Pages** — Indexed vs Not indexed; watch “Crawled – currently not indexed” and “Discovered – currently not indexed” for `/brands/*` stubs removed from the sitemap.
2. **Sitemap** — Confirm new sitemap shard totals (~10.9k URLs) process without errors.
3. **Performance** — Compare impressions/clicks for `/color/{allowlisted}` and top brand hubs vs the prior 28 days. Do **not** assume a penalty from an impression drop alone.
4. **Removals** — Ensure no accidental temporary removals of ranking HEX URLs.

### Flags that need a human decision

| Signal | Likely cause | Action |
| --- | --- | --- |
| Stub brand URLs drop from sitemap but stay indexed | Expected | Leave crawlable; improve overview or add guidelines before re-including |
| Alias tool URL still getting impressions | 308 not picked up yet | Confirm live redirect; keep sitemap on canonical only |
| Spike in soft 404 on `/tools` from retired redirects | Existing retired-tool map | Manual review; prefer richer `/tools` landing copy over mass 410 |

## Week 2–4 — Quality & ads

1. Re-run `npm run seo:flags` after any content push.
2. Optionally run `npm run seo:check -- --base-url https://colorbase.in` against production.
3. AdSense checklist: complete outstanding rows in `docs/ADSENSE_READINESS_CHECKLIST.md` (consent/audience, placement density on tool pages).
4. Watch Hostinger CDN 429s on `/color-picker`; document allowlist changes — do not disable abuse protection in app middleware.

## What “good” looks like

- Allowlisted HEX and curated brand hubs retain indexation and usefulness.
- Fewer thin stub URLs **pushed** via sitemap without deleting those pages.
- Homepage and priority tools read as a product, not a URL farm.
- Legal/trust pages match the live product.

## Out of scope metrics this wave

- Claiming CWV 75th-percentile wins without RUM/PageSpeed evidence.
- Claiming AdSense approval.
`}