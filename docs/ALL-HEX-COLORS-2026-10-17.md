# Every HEX color without per-color files

`/colors/ffd700` now redirects permanently to `/color/ffd700`, which displays
Gold. The same alias works for arbitrary valid HEX colors, uppercase HEX, and
three-digit shorthand. Middleware normalizes the URL in one redirect and retains
query parameters. Named library URLs such as `/colors/red` and design-system
pages keep their existing behavior. Invalid colors still return HTTP 404.

All 16,777,216 opaque RGB colors use the single `/color/[hex]` route. Its
`force-dynamic` configuration renders each requested color without the Next.js
full-route/ISR page cache. There is no `generateStaticParams` for this route,
including when `PREBUILD_LIBRARY_PAGES=1` is used for other catalogs. The existing
`isrFlushToDisk: false` configuration remains a safeguard for other routes.
See the [Next.js 15 route configuration documentation](https://nextjs.org/docs/15/app/api-reference/file-conventions/route-segment-config#dynamic).

RGB, HSL, shades, harmonies, and contrast are derived from the HEX value using
existing color math. A database row or generated HTML/RSC file for every color is
unnecessary. Existing user favorites and palettes retain their persistence; simply
viewing a color does not create a database record or write a color file. Build
assets and operational host/CDN logs still have their normal storage requirements.

The existing curated indexing policy remains: opening a valid color is independent
of whether that color is selected for search indexing or the sitemap.

Validation: all 59 unit tests, TypeScript, lint on the changed files, and the
production build pass. Production HTTP checks cover six plural HEX aliases with
query preservation, 35 distinct rendered colors, malformed-color 404s, and the
existing SEO regression checks. The prerender manifest contains no HEX pages or
HEX ISR route. Comparing the standalone server's page-file inventory before and
after the color requests shows zero additional generated files. A browser check
confirms `/colors/ffd700` opens `/color/ffd700` and displays Gold without runtime
errors. The local server was restarted on port 3001; these changes are not deployed.
