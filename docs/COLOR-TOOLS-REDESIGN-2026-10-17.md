# Color tools redesign

Implemented locally on October 17, 2026. Reference pages:
[HTML Color Codes](https://htmlcolorcodes.com/) and its
[color picker](https://htmlcolorcodes.com/color-picker/).
The reference informed the prominence of color codes, clear controls, and connected
color exploration. ColorBase retains its own layouts, copy, and styling.

## Implemented scope

- A shared tool-page layout with compact editorial headers, color-tool navigation,
  quieter related-tool cards, readable guides, and simpler accessible FAQs. Existing
  tool URLs, metadata, breadcrumbs, application schema, and FAQ data are retained.
- A redesigned picker and all six converters use one color workbench: visible HEX,
  RGB, HSL, and OKLCH codes; copying; RGB/HSL/HSV/CMYK controls; native selection;
  supported-browser screen sampling; undo/redo; contrast previews; CSS snippets;
  tints, shades, harmonies; and links into Palette Studio and UI Theme Studio.
- The previous orbital picker display is replaced by a conventional saturation
  and brightness plane and a large selected-color preview. Pointer drags count as
  one undo action. Arrow keys operate the plane, with Shift for larger steps.
- Existing recent-color and favorite storage is reused. Dragging does not add a
  recent-color record for every pointer movement.
- The image picker and palette extractor share one workspace. Users can upload,
  paste, or drop an image, switch between pixel/palette views without re-uploading,
  sample with mouse or keyboard, copy codes, and continue into other tools.
- Image pixel sampling uses the original decoded image, rather than sampling a
  resized preview. Dominant palettes remain approximate frequency-based colors.
- Gradient controls follow the shared panel style, retain all gradient types, and
  validate HEX and stop positions while preserving the last valid preview.
- Floating social controls are hidden on the color editing routes. Footer links
  remain available. Standalone FAQ pages also load the redesigned FAQ styles.

## Conversion and input corrections

The old converter stored one saturation value for both HSL and HSV, even though
those are different representations. The new model keeps separate HSL and HSV
values and preserves their active controls at degenerate endpoints. For example,
lowering HSV brightness to zero and raising it again retains the intended hue
and saturation. CMYK inputs likewise retain their values at 100% black.

Input supports opaque 3/6-digit HEX and supported RGB/HSL syntax. Invalid values,
out-of-range channels, and alpha syntax are not silently converted into black or
stripped of alpha. Empty numeric fields remain drafts rather than immediately
becoming zero. CMYK output is clearly described as approximate and dependent on
the eventual print profile; HSV and CMYK values are identified as reference data.

## Verification

- All 57 automated tests pass. New cases cover opaque input parsing, channel bounds,
  independent HSL/HSV saturation, black/white endpoint editing, CMYK endpoint
  controls, compact OKLCH, and undoing a whole pointer gesture.
- TypeScript and the production build pass. Lint reports no errors and six existing
  warnings.
- Production-browser checks cover input validation, RGB paste, copying, undo/redo,
  drag grouping, favorite persistence, all six converter routes, HSV edits, and HSL
  recovery from white.
- Image checks use a 2,000-pixel-wide alternating-color fixture. Sampling returns
  an original source pixel rather than a blended preview pixel. The same upload
  remains available when switching to its palette view.
- Gradient checks verify that invalid HEX and positions do not replace valid CSS.
  Responsive checks cover 320, 390, 768, 1024, and 1440 pixel widths, including
  shared-shell checks on the contrast checker, color wheel, and palette generator.
  Tested flows produced no uncaught JavaScript exceptions.

Images are processed locally by these tools. The picker handles opaque colors;
transparent image pixels are identified rather than represented as opaque black.
EyeDropper availability depends on the browser and was not exercised through its
native screen-selection UI in automated checks. No deployment or account change
was performed.
