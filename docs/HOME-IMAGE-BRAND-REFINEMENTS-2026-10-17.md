# Homepage, image picker, and another 1,000 brands

## Homepage and navigation

- The color picker is the flagship product in the homepage hero: a working
  saturation/brightness plane, keyboard controls, hue slider, native selection,
  validated HEX, HEX/RGB copying, and selected-color handoff into the full picker.
- Header and mobile navigation link directly to Color Picker, Image Picker,
  and UI Theme. The color library remains under Tools. Navigation uses a drawer
  below the desktop width and a compact search field to avoid crowded controls.
- A click-driven canvas color blast is available on the hero background and
  from an explicit keyboard-accessible button. Interactive controls are excluded.
  Only one animation runs at a time; it stops after one second, off-screen, when
  the document is hidden, or when reduced motion is requested. No idle loop runs.
- The homepage image section initializes its interactive workspace on demand.
  It shares the full image picker component rather than maintaining a second
  implementation. The previous static theme demonstration and duplicate quick
  picker are replaced by the flagship picker and image workflow.

## Image workspace

- Fit, 200%, and 400% zoom with scrolling inside the image viewport.
- A pixelated magnifier based on the original image, keyboard pixel navigation,
  and a history of up to twelve distinct sampled colors for the current image.
- HEX, RGB, and HSL copying; persistent favorite colors through the existing
  favorites system; readable black/white guidance and a contrast-checker handoff.
- Three-to-ten requested dominant colors, copy-all HEX, CSS/JSON downloads,
  complete palette handoff, and UI Theme Studio links. Low-color images can
  contain fewer distinct colors than requested.
- Replace and clear actions, local processing, existing upload/paste/drop support,
  file-type and size checks, and invalid-file recovery. Clear releases retained
  image data and resets samples and palette state.
- Sampling retains exact original pixels at every zoom. A one-pixel canvas is
  reused and cleared before each sample, so transparent pixels cannot blend with
  earlier samples. Translucent pixels are excluded from opaque palette extraction.
- Palette-size changes reuse a cached reduced image buffer rather than decoding
  and drawing the original file again. Browser image data is released on unmount.

## Brands and sitemap

Added another 1,000 records from the previously downloaded
[Simple Icons metadata snapshot](https://github.com/simple-icons/simple-icons/blob/develop/data/simple-icons.json).
The original 1,000 expanded records are retained exactly. There are now 2,000
expanded records plus the original 162 brands, for 2,162 total brand pages.
Source links, icon identifiers, reference HEX, and available brand-resource links
are retained. No secondary swatches are invented. Existing attribution remains.

`scripts/import-reference-catalogs.py --source-dir <directory> --brand-count 2000 --apply`
preserves existing records and writes a larger compact snapshot. A normal dry
run defaults to the existing size and cannot silently reduce the catalog.

The sitemap contains 12,500 unique URLs, including every new brand page, its HEX
subpage, its shared HEX reference, and the existing image/picker/theme routes.
The 1,141 published named-color pages remain included. There are no query or
fragment variants for homepage features. Detail pages retain on-demand rendering.

Brand-to-HEX lookups now use an index built once per process. Common HEX pages
show at most twelve brand cards while retaining the full matching count, so
black/white color pages do not grow hundreds of cards as the catalog expands.

Changes are local; no deployment or Search Console submission is included.

## Verification

- All 65 automated tests pass. TypeScript, lint on changed code, and the
  production build pass; the six existing unrelated lint warnings remain.
- Production-browser checks cover homepage HEX validation, copying, hue changes,
  animated and reduced-motion color blasts, deferred image initialization,
  original-pixel sampling, transparent-pixel rejection after an opaque sample,
  magnifier pixels, actual 200% canvas sizing, sample restoration, palette counts,
  CSS/JSON export contents, full-palette links, clear, and mobile navigation.
- Layouts were checked at 320, 390, 768, 1024, 1280, and 1440px. Tested flows
  produced no uncaught JavaScript exceptions or horizontal page overflow.
- All 1,000 added brands, their HEX subpages, and their shared HEX references
  appear in the final 12,500-URL sitemap. The original 1,000 records are unchanged.
  A dry importer run after expansion reports zero added records.
- Eight new brand/reference pages returned 200 with self-referencing canonicals
  and indexable metadata. Black's color page renders twelve brand cards. Request
  traffic added zero generated page files.
- Existing HTTP SEO checks passed, including 32 missing-resource 404s, four
  canonical redirects, sitemap inclusion of the selected green reference, and
  exclusion of non-selected arbitrary colors and search pages.

The final production app is running locally at `http://localhost:3001`.
