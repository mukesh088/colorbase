# Initial page loading

The homepage was fetching code for closed controls and prefetching numerous
other pages. The gradient library also serialized all 1,862 complete recipes
into its initial HTML. These competed with the visible page for bandwidth and
JavaScript work.

- Global search, mobile navigation, the theme menu, and gradient detail dialogs
  load their code when opened. Theme loading keeps a button of the same size;
  the existing Radix keyboard, focus, and dismissal behavior is retained.
- Tooltip context belongs to the gradient viewer, the only component using it,
  instead of every page's root provider.
- The gradient landing page renders popular previews and the new collection's
  crawlable links immediately. Search and category/collection filters import
  the full catalog when first used, with loading and retry states. Finite
  category pages still render their complete category on the server.
- Header and homepage links do not eagerly prefetch other tools and catalogs.
  Links retain normal Next.js navigation. This trades speculative navigation
  downloads for more bandwidth available to the current page.
- The social dock uses CSS rather than Framer Motion, has no continuously
  pulsing decoration, and its desktop-only component is not loaded on mobile.
- Image sampling remains deferred until the workspace is opened. The flagship
  picker and click background remain interactive on the initial homepage.

## Production payload measurements

Compared with the production build immediately before these optimizations,
which already contained the purple homepage and 100 new gradients:

| Measurement                                             |    Before |     After |
| ------------------------------------------------------- | --------: | --------: |
| Homepage initial JS, gzip sum from build manifests      | 218,658 B | 183,095 B |
| Gradient page initial JS, gzip sum from build manifests | 193,742 B | 177,245 B |
| Gradient page HTML, gzip                                | 125,215 B |  36,579 B |
| Gradient page HTML, uncompressed                        | 935,486 B | 271,923 B |
| Homepage browser JS downloads before interaction        | 374,349 B | 185,755 B |
| Gradient page browser JS downloads before interaction   | 374,099 B | 179,910 B |
| Homepage speculative RSC prefetches                     |        27 |         0 |
| Gradient page speculative RSC prefetches                |        27 |         0 |

Manifest totals include layout and route scripts, deduplicated by filename.
HTML gzip totals use Python's gzip compression. Browser totals use resource
timing encoded body sizes in an isolated desktop Chrome session with caching
disabled. Both browser runs blocked Google advertising/analytics requests to
isolate application downloads; their network transport was checked separately.
Counts include additional startup and prefetch scripts beyond the manifest.
These demonstrate payload reductions, not measured improvements in real-world
Core Web Vitals. Local server startup and network conditions are not controlled
enough for a before/after latency claim.

## Verification

- All 68 unit tests, TypeScript, changed-file lint, and production build pass.
  Six existing unrelated lint warnings remain.
- Browser checks exercise the picker, copying, click background, social dock,
  deferred global search and navigation, mobile menu dismissal/focus restoration,
  theme selection and keyboard reopening, gradient search/filtering, retry after
  an intentionally blocked catalog chunk, CSS copying, tooltips, category dialogs,
  and the deferred image workspace. No unexpected uncaught app exceptions occur.
- The catalog chunk is absent before interaction. The retry check temporarily
  sets the existing deployment-recovery guard so the catalog error can be tested
  independently of the global one-time stale-chunk reload.
- Homepage widths 320, 390, 768, 1024, 1280, and 1440px have no horizontal overflow.
- The sitemap retains 12,600 unique URLs. Representative new gradient details,
  robots, and ads.txt return 200. Gradient details remain absent from the
  prerendered-page inventory.
- The final local production browser loaded one AdSense loader with HTTP 200
  and one Analytics configuration. Homepage and client navigation page views
  completed with HTTP 204. Two additional background beacons were aborted;
  successful collection was observed for both tested pages. Account approval
  and report processing remain outside these installation checks.

The release also includes the preceding homepage color-blast refinement and
100 named gradients. Local editor settings, build outputs, dependencies, and
temporary browser audit files are excluded from the commit.
