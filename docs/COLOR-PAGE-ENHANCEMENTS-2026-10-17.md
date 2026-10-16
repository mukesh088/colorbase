# Color detail workspace

The shared color detail component now provides a compact workspace for HEX and
named color pages, including `/color/ffd700` and `/colors/red`.

- The hero displays the exact opaque sRGB swatch without a decorative gradient,
  readable black/white text, essential codes, source information, and saved colors.
- The HEX form validates shorthand and full HEX before navigating. Invalid input
  leaves the current color open. Arbitrary colors are labelled as calculated.
- Theme, picker, and palette links carry the selected color. Saved colors reuse
  existing local storage and optional account persistence.
- A section navigation bar links to preview, codes, scales, harmonies, export,
  token comparisons, and usage notes.
- The live preview supports custom sample text, 14–48px sizes, text/background
  roles, a native paired-color picker, validated HEX, black/white presets, and a
  readable black/white suggestion. Invalid drafts preserve the last valid pair.
- The pair inspector shows separate AA normal, AA large, and AAA normal results,
  a copyable CSS pair, and a full-checker link with both colors. Existing contrast
  math uses unrounded ratios to determine pass/fail. Displayed ratios are rounded.
  Thresholds follow [W3C contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
  and [contrast enhanced](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html).
- Codes initially show six useful formats, with all 19 available on expansion,
  individual copy buttons, and a copy-all action. Long values wrap rather than
  being truncated. CMYK approximation and non-CSS formats are identified.
- Developer exports use a stable `color` + HEX identifier (such as
  `color12ab34`), so unnamed colors and names containing spaces do not produce
  invalid CSS or JavaScript identifiers.
- Scales scroll within their own container on small screens. Harmony and scale
  palettes can be copied or opened in Palette Studio. Scales over ten colors use
  nine evenly spaced samples to fit the studio, retaining both endpoints.
- Floating social controls are hidden on color detail routes; sharing remains in
  the page. Existing metadata, canonical URLs, and indexing policy are retained.

The HEX route continues to render on request without per-color HTML/RSC files or
database records. No deployment or account changes are included.

Validation: all 59 unit tests and the production build pass. TypeScript, lint on
changed components, and formatting checks pass. Production browser checks cover
the exact swatch, copying, favorite persistence, selected-color handoffs, custom
preview text/size, both color roles, invalid drafts, AA/AAA results, all formats,
palette sampling, section targets, named colors, and black/white extremes. Tested
widths are 320, 390, 768, 1024, and 1440px, with no horizontal page overflow.
Light/dark screenshots were reviewed. CSS and React exports for arbitrary colors
were checked in the final build. Browser flows produced no uncaught exceptions.
Rechecking 35 HEX pages after the UI changes added zero generated page files.
The final production server is running locally on port 3001.
