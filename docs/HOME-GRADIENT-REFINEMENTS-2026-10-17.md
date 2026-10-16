# Purple homepage and 100 named gradients

The homepage uses the reference's lavender background, fading into the page,
with a stronger heading and magenta-to-purple accents. The working flagship
picker, image picker, and theme workflows remain available.

Clicking the hero background reveals the next color from the click position.
The color remains after the reveal completes. Light and dark themes use separate
readable palettes. The explicit button also works with a keyboard or touch.
Picker controls and links do not trigger the background. There is one bounded
Web Animation, with no idle animation loop or timer. Offscreen, hidden-page,
resize, theme changes, and reduced motion settle the animation; reduced motion
changes the background immediately.

The Gradients desktop dropdown and mobile navigation include the library,
new collection, and linear, radial, conic, and general gradient tools. The
homepage also features four new named blends.

`src/lib/data/studio-gradients.ts` contains 100 original, explicitly specified
recipes. Each has a unique name, direction, category, and HEX stops. The library
now has 1,862 gradients. The 1,762 existing slugs are preserved. The new collection
has a filter, searchable previews, code copying, and a complete linked name
index at `/gradient-library#new-gradients`.

The existing sitemap builder includes all new detail URLs automatically. There
are 12,600 unique canonical sitemap entries. Gradient details render on demand
without prerendering or caching a separate page file for each recipe. The
14 finite category pages remain static. No database is needed for these compact
shared recipes.

Validation:

- All 68 automated tests, TypeScript, changed-file lint, and production build
  pass. Six pre-existing unrelated lint warnings remain.
- Production browser checks cover persistent click colors, single-animation
  replacement, reduced motion, offscreen cleanup, dark theme changes, unaffected
  picker inputs and copying, desktop dropdown and mobile menu, name search,
  gradient CSS copying, the 100-item filter, and the empty search state.
- Homepage layouts have no horizontal overflow at 320, 390, 768, 1024, 1280,
  and 1440px. Tested browser flows produced no uncaught app exceptions.
- All 100 new detail URLs return 200 with self-referencing canonicals and
  indexable metadata. A missing gradient returns 404. All previous gradient
  slugs are present, and all new ones occur in the final sitemap.
- The production manifest contains no prerendered gradient detail pages; after
  requesting all 100 new pages, only the 14 static category HTML files exist
  within the gradient detail directory.

Preview locally at `http://localhost:3001`. These refinements have not been
deployed or submitted through Search Console.
