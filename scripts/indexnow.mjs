#!/usr/bin/env node
/**
 * Submits ColorBase URLs to IndexNow (Bing, Yandex, Seznam, Naver and other
 * participating engines share submissions). Google does not use IndexNow;
 * for Google, submit the sitemap in Search Console.
 *
 * Run AFTER deploying, so https://colorbase.in/<key>.txt is live.
 *   node scripts/indexnow.mjs                 # every sitemap URL
 *   node scripts/indexnow.mjs --since 2026-11-22   # only URLs with lastmod >= date
 *   node scripts/indexnow.mjs --dry-run       # list what would be sent
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://colorbase.in";
const KEY = process.env.INDEXNOW_KEY || "42260d102688fbbfae40b229ce3088dc";
const args = process.argv.slice(2);
const since = args.includes("--since") ? args[args.indexOf("--since") + 1] : undefined;
const dryRun = args.includes("--dry-run");

async function locs(url) {
  const xml = await (await fetch(url)).text();
  return [...xml.matchAll(/<(sitemap|url)>([\s\S]*?)<\/\1>/g)].map((m) => ({
    kind: m[1],
    loc: m[2].match(/<loc>([^<]+)<\/loc>/)?.[1],
    lastmod: m[2].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
  }));
}

const urls = [];
for (const s of await locs(`${SITE}/sitemap.xml`)) {
  if (s.kind !== "sitemap" || !s.loc) continue;
  for (const u of await locs(s.loc)) if (u.loc && (!since || (u.lastmod ?? "") >= since)) urls.push(u.loc);
}
console.log(`${urls.length} URLs${since ? ` changed since ${since}` : ""}`);
if (dryRun) {
  console.log(urls.slice(0, 20).join("\n"), urls.length > 20 ? "\n…" : "");
  process.exit(0);
}
for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: batch }),
  });
  console.log(`batch ${i / 10000 + 1}: HTTP ${res.status}`);
}
