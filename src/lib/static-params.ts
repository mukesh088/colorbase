/**
 * Hostinger (and similar shared hosts) have strict inode (file count) limits.
 * Prebuilding thousands of color/palette/brand HTML pages can push `.next`
 * past ~40–50k files and exhaust the account. Default: generate those pages
 * on demand (still in sitemap for SEO). Set PREBUILD_LIBRARY_PAGES=1 to
 * restore full SSG where inodes are plentiful (e.g. Vercel).
 */
export const PREBUILD_LIBRARY_PAGES = process.env.PREBUILD_LIBRARY_PAGES === "1";

export function maybeStaticParams<T>(params: T[]): T[] {
  return PREBUILD_LIBRARY_PAGES ? params : [];
}
