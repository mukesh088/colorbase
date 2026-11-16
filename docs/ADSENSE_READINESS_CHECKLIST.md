# AdSense Readiness Checklist

Status date: 2026-11-17. Publisher reported **AdSense approved**. This checklist
still records evidence of publisher-quality work; it is not a rank forecast.

Publisher ID in repo: `ca-pub-9077025320968455` (`public/ads.txt`, site-config).

## Completed with evidence

| Requirement | Evidence | Status |
| --- | --- | --- |
| Original product functionality | 62 interactive tools; core color workflows work without ads | Done |
| Original editorial | 18 blog posts + `/learning` + `/learn/color-codes` | Done |
| Trust pages | About, Contact, Privacy, Terms, Cookies, Disclaimer | Done |
| Ownership / contact | Ranchi address + `support@colorbase.in` on About/Contact | Done |
| Brand trademark honesty | Brand overviews + Simple Icons source labels; disclaimer page | Done |
| ads.txt | `public/ads.txt` DIRECT line for pub-9077025320968455 | Done |
| AdSense account meta | `google-adsense-account` in root layout | Done |
| Script load strategy | AdSense `lazyOnload` — not blocking first paint | Done |
| Thin catalog control | Hex allowlist + unverified brand hex noindex | Done (Wave 1 tightened) |
| Duplicate tool URLs | 308 aliases for gradient/image duplicates | Done (Wave 1) |
| Sitemap quality | Stubs without guidelines removed from brand sitemap | Done (Wave 1) |
| No fake ratings schema | BlogPosting uses Organization author; no aggregateRating | Done |

## Ad placement architecture (policy-conscious)

Documented regions only — do not place ads inside:

- Color picker canvases, hue wheels, or eyedropper controls
- Between critical contrast results and export buttons
- Blank / loading-only / error-only states

Preferred regions after useful content:

1. Below tool intro, above fold only if content height allows
2. After tool results / export section
3. In-article mid-body on long guides (after first meaningful section)
4. Footer-adjacent on index pages with real content above

Density: one primary unit per viewport of useful content; avoid sticky overlays that cover controls. Layout must reserve space to limit CLS.

## Outstanding manual checks

| Check | Owner action |
| --- | --- |
| Consent / CMP for EEA/UK if serving personalized ads | Confirm audience; add CMP if required before enabling personalized ads |
| AdSense policy center review after content deploy | Wait for crawl of improved pages before resubmission |
| Social profile URLs in ORGANIZATION.sameAs | Verify each profile exists or remove dead links |
| Phone number accuracy | Confirm `SUPPORT_PHONE` is monitored |
| Live ads.txt on production | `https://colorbase.in/ads.txt` returns current file |
| Search Console coverage after sitemap change | Resubmit `/sitemap.xml`; monitor brand stub crawl |

## Explicit non-claims

- No fabricated publisher approval
- No invented traffic or revenue figures
- No injection of placeholder ad units that look like site buttons
