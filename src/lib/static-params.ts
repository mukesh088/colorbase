/**
 * Hostinger (and similar shared hosts) have strict inode (file count) limits.
 * Prebuilding thousands of color/palette/brand HTML pages can push `.next`
 * past ~40–50k files and exhaust the account. Those pages render on demand and
 * are kept in memory only, so a Google crawl does not write a file per URL.
 * Set PREBUILD_LIBRARY_PAGES=1 to restore full SSG where inodes are plentiful.
 */
export const PREBUILD_LIBRARY_PAGES = process.env.PREBUILD_LIBRARY_PAGES === "1";

export function maybeStaticParams<T>(params: T[]): T[] {
  return PREBUILD_LIBRARY_PAGES ? params : [];
}
