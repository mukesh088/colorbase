# Search Console coverage export: findings and fixes

Source: `colorbase.in-Coverage-2026-10-17.xlsx`, supplied by the site owner.
Read all four sheets as data: Chart, Critical issues, Non-critical issues, Metadata.
The workbook contains aggregate counts, not affected-URL lists. Its chart runs
from July 30 through October 12, 2026, despite the October 17 export filename.

## What the supplied data establishes

- The latest indexed count is **257,784**, compared with a peak of **258,041**.
  That is a decline of 257 URLs, approximately **0.10%**, not a mass deindexing in
  this chart's final period.
- Impressions total **53,940 for October 6–12**, versus **18,365 for September
  29–October 5**. The week increased about **193.7%** even though individual days
  fell after the October 8 peak. The file has no clicks, positions, queries, or
  data after October 12, so it cannot establish the cause of a later decline.
- There are **91,450 not-indexed URLs** across the twelve listed reasons. Not
  every excluded URL represents a defect: duplicates, intentional exclusions,
  and genuinely removed pages can correctly remain outside the index.

This evidence does not confirm the earlier hypothesis that retiring 85 tools
caused the recent decline. Page/query performance around the actual deployment
is still needed before changing those retired URLs.

## Supplied URL: `/color/438052`

The owner identified this URL under a non-indexing issue. Live requests using a
browser user agent and a Googlebot user agent returned HTTP 200, real color
content, a self-canonical URL, and **`noindex, nofollow`**. The exclusion was the
app's deliberate rule for colors outside its selected reference catalogs.

The local fix adds #438052 to the selected reference pages, with specific usage
notes, indexable metadata, a sitemap entry, and an internal link from the green
family page. This is a targeted editorial selection. The app retains its
existing exclusion policy for other arbitrary generated colors.

Index eligibility does not guarantee Google's selection or ranking. This change
must be deployed before the live URL changes.

## Confirmed response defects and implementation

Live testing also reproduced HTTP 200 responses for nonexistent dynamic catalog
pages, including `/color/not-a-color`, `/brands/does-not-exist`, and
`/palette-library/does-not-exist`. The response contained a late noindex directive,
but its success status was misleading. HEX aliases such as `/color/fff` and
`/color/3B82F6` also returned 200 with a later application redirect.

React can start streaming the layout before an asynchronous page reports a
missing record or redirect. Moving guards into metadata alone did not fix the
HTTP status in the production-mode reproduction.

The implementation now validates catalog paths in middleware before streaming:

- Invalid records/categories rewrite to the existing custom not-found page with
  HTTP 404. Catalog paths containing file extensions also receive validation.
- Short/uppercase HEX aliases, brand HEX aliases, and alternate numeric BrickColor
  IDs receive an HTTP 308 to their canonical path. Query strings are retained.
- The alternate www/non-www host redirects to the configured canonical origin,
  preserving the path and query.
- Metadata functions also reject missing catalog records instead of inheriting
  homepage metadata. Public pages and the existing private API restrictions remain.

Validation checks every published sitemap URL against the request validator to
catch accidental exclusions of legitimate pages. The reference-page change and
response handling do not turn the whole HEX space into indexable landing pages.

## Issue-by-issue interpretation

| Export reason | URLs | Action or remaining evidence |
| --- | ---: | --- |
| Alternate page with proper canonical tag | 2,772 | Usually expected when the canonical target is correct. Check targets rather than making every duplicate indexable. Host and HEX normalization reduce duplicate variants. |
| Blocked by robots.txt | 3,439 | Needs example URLs. Current rules protect API routes; broad unblocking is not justified by a count alone. |
| Blocked due to other 4xx issue | 537 | Needs exact URLs/statuses and hosting/WAF logs to identify access denials, rate limits, or other client errors. |
| Not found (404) | 309 | Correct for genuinely missing content. Restore or redirect only URLs with a real replacement or incorrectly broken links. |
| Duplicate without user-selected canonical | 77 | Review example URLs and selected targets. Canonical host/HEX redirects address the reproduced alias behavior. |
| Server error (5xx) | 54 | Needs affected URLs and server logs. The supplied #438052 page returned 200, so it does not establish the source of these errors. |
| Page with redirect | 25 | Expected when a page has intentionally moved. |
| Redirect error | 5 | Needs the affected URLs and redirect chains. Normalization is tested independently; these five specific historical errors are not yet identified. |
| Excluded by noindex | 22,593 | Fixed eligibility for the supplied #438052 reference. Preserve intentional exclusions; do not enable all arbitrary generated pages. |
| Soft 404 | 3,965 | Request-stage validation corrects the reproduced success responses on missing catalog records. Need URL examples to distinguish other soft-404 causes. |
| Crawled, currently not indexed | 52,405 | Review representative pages, usefulness, duplication, and demand. No code setting can require Google to index every eligible URL. |
| Discovered, currently not indexed | 5,269 | Check crawl history, internal links, sitemap selection, and server capacity. A count alone does not establish a robots block or server fault. |
| Indexed, though blocked by robots.txt | 6 | Needs example URLs to decide whether they should be crawlable public pages or should be removed from indexing. |

[Google's Page indexing report guidance](https://support.google.com/webmasters/answer/7440203)
explains why some exclusions are expected. Google's
[HTTP status guidance](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes)
supports meaningful 404 responses for missing pages and investigation of repeated
server failures.

## Verification

- All 29 automated tests passed, including validation of every published sitemap
  URL. TypeScript and the production build passed; lint reported no errors and
  six existing warnings.
- Against the local production server, 32 missing-page requests across browser
  and Googlebot user agents returned HTTP 404 with the custom not-found content.
- Both user agents received HTTP 200, indexable metadata, the correct canonical,
  and the added usage section for `/color/438052`.
- Four HEX-alias requests returned HTTP 308 and retained their query strings.
  The www-host redirect also preserved the path and query.
- The selected reference appeared in the sitemap and green-family links. Valid
  catalog pages remained accessible, while the existing exclusions for search
  and unselected generated colors remained effective.

## After deployment

1. Open `/color/438052` in URL Inspection, run Test live URL, confirm indexing is
   allowed and the canonical URL is correct, then request indexing for that URL.
2. Submit or recheck `/sitemap.xml`. Confirm the reference page is included.
3. Check the reported soft-404 examples: intentionally missing pages should now
   return 404, while valid pages should return 200 with their real content.
4. Recheck the coverage categories after Google recrawls. A corrected missing page
   may move from Soft 404 to Not found; it should not become an indexed empty page.
5. Supply the URL-example exports for 5xx, other 4xx, redirect errors, and remaining
   soft 404s to diagnose the residual counts. Do not use aggregate validation to
   force intentional noindex or duplicate categories to zero.

These are local source fixes. No deployment or Search Console account change was
performed as part of this work.
