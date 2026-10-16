# Catalog and sitemap expansion

Added 1,000 new brand/product color references and 1,000 new community color
names, preserving all existing catalog slugs. These are fixed source snapshots,
not runtime external API dependencies.

## Sources

- [Simple Icons metadata](https://github.com/simple-icons/simple-icons/blob/develop/data/simple-icons.json):
  each brand retains its published reference HEX, upstream icon identifier,
  artwork source, and brand-resource URL when available. Only the one listed
  logo color is imported; no secondary brand colors are invented. The metadata
  is distributed under CC0. Individual marks keep their own terms, retained in
  the snapshot where supplied. See [license](SIMPLE-ICONS-LICENSE.txt).
- [Color Names by David Aerne](https://github.com/meodai/color-names): 1,000
  additional names from the source CSV's recommended names, retaining their HEX
  mappings. The MIT attribution is retained in [license](COLOR-NAMES-LICENSE.txt).
  These community labels are not presented as browser CSS keywords or historical
  color etymologies. Their pages link to the source and show valid HEX usage.

The two data files total approximately 243 KB. Source URLs, import counts, and
SHA-256 fingerprints are in `src/lib/data/reference-catalog-sources.json`.

## Routing and indexing eligibility

- All new brand pages and their sourced HEX subpages appear in `/sitemap.xml`.
- All new community color-name pages appear in the sitemap with CSS named
  colors. Original ColorBase-generated inspiration names remain excluded and
  retain `noindex`.
- Community name pages have self-referencing canonical URLs and indexable
  metadata. Their FAQ, visible CSS instructions, and source labels distinguish
  catalog labels from real CSS keywords. A single H1 describes each name page.
- The color-name library includes static links to the published names, and
  search includes the new records. Existing brand search and alphabetical links
  discover the new brands.
- The new Theme Studio and Chart Palette Studio were already registered in the
  tool sitemap. Tests now explicitly protect them along with the redesigned
  picker, palette, image, gradient, and contrast tools. Feature panels within an
  existing page do not need separate sitemap URLs.
- Brand, brand HEX, and named-color detail routes render on request with
  `force-dynamic`. They do not create a prebuilt/ISR page file per record, even
  when other finite catalogs enable `PREBUILD_LIBRARY_PAGES`.
- Brand and named-color lookups use maps, and brand HEX entries are computed
  once per process rather than rebuilt for each catalog request.

The canonical sitemap stays below the [50,000 URL / 50 MB sitemap limits](https://www.sitemaps.org/protocol.html) and is
advertised in `robots.txt`. These changes make the pages eligible for discovery;
Google decides whether and when to index them after deployment. No live site or
Search Console account changes have been made.

## Reproducing the import

Download the data and license files listed in the source manifest to a local
directory, using these filenames:

- `simple-icons-source.json`
- `color-names-source.csv`
- `simple-icons-license.txt`
- `color-names-license.txt`

Run a dry audit with
`python scripts/import-reference-catalogs.py --source-dir <directory>`.
Add `--apply` to write the snapshots. The importer validates opaque HEX, dedupes
against existing entries, uses upstream icon slug rules, and selects records in
a deterministic order. It does not remove unrelated catalog records or create
one file per entry. Review changed fingerprints when updating from a new source
snapshot.

## Validation results

- All 64 automated tests pass, including every new brand route, source data,
  unique slugs, published-name inclusion, generated-name exclusion, canonical
  sitemap inventory, and new-tool membership.
- TypeScript, lint on changed code, and the production build pass. The build
  retains the same six unrelated existing lint warnings.
- The generated sitemap contains 9,712 unique URLs: 1,162 main brand pages and
  1,141 published named-color pages, plus brand HEX references, tools, and other
  existing routes. It is 1,229,921 bytes uncompressed. Both main catalog counts
  increased by exactly 1,000 from the previous build.
- Ten sampled new/tool pages returned HTTP 200 with correct canonicals and
  indexable metadata. Robots still advertises the canonical sitemap; generated
  inspiration names retain `noindex`.
- Browser checks verified brand/name search, source links, a single H1 on a
  named-color page, and mobile layouts at 320px without horizontal overflow.
  No uncaught JavaScript exceptions occurred.
- Comparing the production page-file inventory before and after the requests
  found zero additional generated page files. The prerender manifest does not
  list brand, brand HEX, or named-color detail routes as ISR routes.
- Existing HTTP SEO checks passed: 32 missing routes returned 404, four HEX
  normalization checks returned 308, and the supplied green color reference
  remains indexable with its sitemap entry and internal link.

The final local app is running at `http://localhost:3001`; the expanded sitemap
is available at `http://localhost:3001/sitemap.xml`. Deployment and Search Console
submission have not been performed.
