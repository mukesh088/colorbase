# Google integration and release checks

Checked the final local production build and the live `https://colorbase.in`
site before committing the accumulated product, catalog, and SEO changes.

## AdSense installation

- Both sites return `/ads.txt` with HTTP 200 and a plain-text content type.
  Its publisher is `pub-9077025320968455`, `DIRECT`, certification authority
  `f08c47fec0942fa0`, matching the HTML `google-adsense-account` meta tag and
  script client `ca-pub-9077025320968455`.
- Browser checks on both sites loaded the AdSense script with HTTP 200. Only
  one loader was present after navigating to another page.
- Public privacy, cookie, terms, and contact pages return HTTP 200. Robots does
  not block the homepage or `ads.txt`. The live CSP is
  `upgrade-insecure-requests`, which does not block the HTTPS Google loaders.
- These checks verify the installation, not AdSense account approval, policy
  review, Auto ads settings, actual ad fill, or account-configured privacy
  messages. Those account-side states were not accessible.
- Existing consent defaults deny advertising storage, ad user data, and
  personalization. No consent choices were silently granted during this audit.
  To serve personalized ads in the EEA, UK, or Switzerland, verify a Google
  certified CMP is configured through AdSense or the selected consent provider.
  A consent-mode default is not evidence that a certified CMP is configured.

References: [Google ads.txt guide](https://support.google.com/adsense/answer/12171612),
[Google consent-management requirements](https://support.google.com/adsense/answer/13554116).

## Analytics

- Both sites contain measurement ID `G-H9NJB2152F` and load one Google tag.
- In both production-browser checks, one `config` call was observed. The initial
  homepage and a Next.js client navigation to `/color-picker` each produced a
  `page_view` for that ID with a completed HTTP 204 response.
- No uncaught application exceptions occurred. Some background Google beacons
  were aborted during the sessions; completed page views confirmed successful
  collection for both tested pages. This is a sampled transport check, not a
  guarantee that every visitor's browser permits tracking.
- GA4 property filters, report processing, enhanced-measurement settings for
  other event types, and the account's processed daily active-user totals were
  not available. Successful collection does not verify a particular dashboard
  total or reveal visitor identity.

Reference: [Google SPA measurement guidance](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications).

## Sitemap and robots

- The local sitemap returns HTTP 200 as `application/xml`, parses with the
  sitemap namespace, and contains 12,500 unique canonical HTTPS URLs on
  `colorbase.in`. It is 1,565,767 bytes, below the standard size and URL limits.
- Entries contain no query or fragment variants, and none match exact-path
  redirects from Next.js configuration. Automated catalog validation covers
  every listed catalog URL, including new brands and published names.
- `robots.txt` returns HTTP 200 and advertises the canonical sitemap. The new
  picker/image/theme/studio routes are listed. Generated inspiration names,
  search pages, and non-selected arbitrary HEX pages retain their exclusions.
- At the time of this pre-push check, the live sitemap contains 5,888 URLs from
  the older deployment. That is a release difference, not evidence that the new
  12,500-URL sitemap has deployed. Recheck the live sitemap after hosting finishes
  deploying the pushed commit.

Reference: [Google sitemap documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Code verification and release scope

All 65 automated tests, TypeScript, and lint pass with no lint errors. Six
pre-existing unrelated lint warnings remain. The final production build passed
and the browser/HTTP checks above ran against it. Earlier product verification
is recorded in the accompanying implementation notes.

The release includes source, catalog snapshots and licenses, tests, and project
documentation. Local editor settings under `.vscode`, secrets, `node_modules`,
build outputs, and ignored browser audit artifacts are excluded.
