import { readFile, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Published interior slugs for the Node.js middleware, so unknown
 * /interior-colors/<slug> URLs get a real 404 before the page streams a 200
 * shell. Reads (never writes) the same catalog file as `store.ts`, re-reading
 * only when its mtime changes, so admin publishes apply on the next request.
 */
const CATALOG_PATH = path.join(process.cwd(), "public", "assets", "interior-colors", "catalog.json");

let cached: { mtimeMs: number; slugs: Set<string> } | undefined;

/** `undefined` when the catalog can't be read: callers should let the page decide. */
export async function publishedInteriorSlugs(): Promise<Set<string> | undefined> {
  try {
    const { mtimeMs } = await stat(CATALOG_PATH);
    if (cached?.mtimeMs === mtimeMs) return cached.slugs;
    const parsed = JSON.parse(await readFile(CATALOG_PATH, "utf8")) as {
      items?: { slug?: string; status?: string }[];
    };
    const slugs = new Set(
      (parsed.items ?? []).filter((item) => item.status === "published" && item.slug).map((item) => item.slug!)
    );
    cached = { mtimeMs, slugs };
    return slugs;
  } catch {
    return undefined;
  }
}
