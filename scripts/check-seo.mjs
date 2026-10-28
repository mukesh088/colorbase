import assert from "node:assert/strict";
import fs from "node:fs";

const args = process.argv.slice(2);
const option = (name) => args[args.indexOf(name) + 1];
const base = new URL(args.includes("--base-url") ? option("--base-url") : "https://colorbase.in");
const checks = [];
const assets = new Set();
const decode = (value = "") =>
  value.replace(
    /&(?:amp|lt|gt|quot|apos|#39|#x27|nbsp);/gi,
    (entity) =>
      ({
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&apos;": "'",
        "&#39;": "'",
        "&#x27;": "'",
        "&nbsp;": " ",
      })[entity.toLowerCase()] ?? entity
  );
const normalize = (value) => decode(value).replace(/\s+/g, " ").trim();
const visibleText = (html) =>
  normalize(html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "));
const attribute = (tag, name) =>
  decode(tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1]);
const meta = (html, name) =>
  [...html.matchAll(/<meta\b[^>]*>/gi)]
    .filter(([tag]) => attribute(tag, "name") === name)
    .map(([tag]) => attribute(tag, "content"));

async function check(path, verify) {
  const started = Date.now();
  try {
    const response = await fetch(new URL(path, base), {
      redirect: "manual",
      signal: AbortSignal.timeout(30000),
    });
    const html = await response.text();
    const detail = await verify(response, html);
    checks.push({
      path,
      passed: true,
      status: response.status,
      milliseconds: Date.now() - started,
      ...detail,
    });
  } catch (error) {
    checks.push({ path, passed: false, error: error.message });
  }
}

function verifyPage(path, response, html) {
  assert.equal(response.status, 200, "Expected a successful page");
  assert.ok(
    !meta(html, "robots").some((value) => /noindex/i.test(value)),
    "Public landing page blocks indexing"
  );
  assert.ok(
    !/noindex/i.test(response.headers.get("x-robots-tag") ?? ""),
    "HTTP header blocks indexing"
  );
  const title = normalize(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  assert.ok(title.length > 0, "Missing title");
  assert.equal(meta(html, "description").length, 1, "Expected one meta description");
  assert.ok(meta(html, "description")[0].length > 0, "Empty description");
  assert.equal([...html.matchAll(/<h1\b[^>]*>/gi)].length, 1, "Expected one main heading");
  const canonicalTags = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => tag)
    .filter((tag) => attribute(tag, "rel") === "canonical");
  assert.equal(canonicalTags.length, 1, "Expected one canonical URL");
  const canonical = new URL(attribute(canonicalTags[0], "href"));
  assert.equal(canonical.origin, "https://colorbase.in", "Unexpected canonical origin");
  assert.equal(canonical.pathname, path, "Canonical does not match this page");
  assert.equal(canonical.search, "", "Canonical contains query parameters");
  const text = visibleText(html);
  let structuredBlocks = 0;
  for (const [, attrs, content] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attribute(attrs, "type") !== "application/ld+json") continue;
    const document = JSON.parse(content);
    structuredBlocks++;
    const nodes = Array.isArray(document) ? document : (document["@graph"] ?? [document]);
    for (const node of nodes) {
      if (node["@type"] !== "FAQPage") continue;
      for (const item of node.mainEntity ?? []) {
        assert.ok(text.includes(normalize(item.name)), `FAQ question is not visible: ${item.name}`);
        assert.ok(
          text.includes(normalize(item.acceptedAnswer?.text ?? "")),
          `FAQ answer is not visible: ${item.name}`
        );
      }
    }
  }
  assert.ok(structuredBlocks > 0, "No structured data blocks found");
  assert.equal(response.headers.get("set-cookie"), null, "Public HTML sets an identity cookie");
  if (["/", "/color-codes"].includes(path)) {
    for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
      const url = attribute(tag, "src") || attribute(tag, "href");
      if (url.startsWith("/_next/static/")) assets.add(url);
    }
  }
  return {
    title,
    canonical: canonical.href,
    structuredBlocks,
    cache: response.headers.get("cache-control"),
  };
}

const corePaths = [
  "/",
  "/color-codes",
  "/color-codes/common",
  "/color-picker",
  "/colors",
  "/colors/css",
  "/color-names",
  "/hex-to-rgb",
  "/rgb-to-hex",
  "/hex-to-hsl",
  "/image-color-picker",
  "/contrast-checker",
  "/learn/color-codes",
  "/brands/grab",
  "/brands/meta",
  "/color/584930",
  "/color/346249",
  "/color/ff0000",
  "/color/438052",
  "/color-names/red",
  "/colors/red",
  "/color-codes/minecraft",
  "/color-codes/bukkit",
  "/color-codes/roblox",
  "/color-codes/roblox/1",
  "/brands/meta/0668e1",
  "/faq",
  "/gradient-library",
  "/palette-library",
  "/blog/confirm-a-brand-hex-before-you-publish-it",
];
for (let i = 0; i < corePaths.length; i += 3) {
  await Promise.all(
    corePaths
      .slice(i, i + 3)
      .map((path) => check(path, (response, html) => verifyPage(path, response, html)))
  );
}
for (const [path, destination] of [
  ["/color/fff", "/color/ffffff"],
  ["/color/FF0000", "/color/ff0000"],
  ["/colors/ff0000", "/color/ff0000"],
]) {
  await check(path, (response) => {
    assert.ok([301, 308].includes(response.status), "Alias is not a permanent redirect");
    assert.equal(
      new URL(response.headers.get("location"), base).pathname,
      destination,
      "Incorrect canonical redirect"
    );
    return { destination };
  });
}
for (const path of ["/color/123456", "/search?q=%233B82F6"]) {
  await check(path, (response, html) => {
    assert.equal(response.status, 200);
    assert.ok(
      meta(html, "robots").some((value) => /noindex/i.test(value)),
      "Utility URL should remain excluded"
    );
    return { expectedExclusion: true };
  });
}
await check("/seo-check-nonexistent-page", (response) => {
  assert.equal(response.status, 404, "Missing page is a soft 404");
  return {};
});
await check("/robots.txt", (response, text) => {
  assert.equal(response.status, 200);
  assert.ok(text.includes("Sitemap: https://colorbase.in/sitemap.xml"));
  assert.ok(!/^Disallow:\s*\/$/m.test(text), "Robots file blocks the whole website");
  return {};
});
await check("/sitemap.xml", (response, text) => {
  assert.equal(response.status, 200);
  const urls = [...text.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => decode(url));
  assert.ok(urls.length > 0 && urls.length <= 50000, "Invalid sitemap URL count");
  assert.equal(new Set(urls).size, urls.length, "Duplicate sitemap URLs");
  assert.ok(
    urls.includes("https://colorbase.in/color/584930"),
    "Recovered landing page missing from sitemap"
  );
  assert.ok(
    urls.every((url) => new URL(url).origin === "https://colorbase.in" && !new URL(url).search),
    "Noncanonical sitemap entries"
  );
  assert.ok(!urls.includes("https://colorbase.in/search"), "Search utility is in the sitemap");
  return { urls: urls.length };
});
await check("/api/color-lookup?q=%233B82F6", (response) => {
  assert.equal(response.status, 303, "HEX lookup did not redirect");
  assert.equal(new URL(response.headers.get("location"), base).pathname, "/color/3b82f6");
  assert.match(response.headers.get("cache-control") ?? "", /private|no-store/);
  return { lookupWithoutJavaScript: true };
});
const staticAssets = [...assets].slice(0, 30);
for (let i = 0; i < staticAssets.length; i += 3) {
  await Promise.all(
    staticAssets.slice(i, i + 3).map((path) =>
      check(path, (response) => {
        assert.equal(response.status, 200, "Missing production asset");
        return { staticAsset: true };
      })
    )
  );
}
const report = {
  base: base.href,
  checkedAt: new Date().toISOString(),
  passed: checks.filter((row) => row.passed).length,
  failed: checks.filter((row) => !row.passed).length,
  checks,
};
if (args.includes("--output"))
  fs.writeFileSync(option("--output"), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      base: report.base,
      passed: report.passed,
      failed: report.failed,
      failures: checks.filter((row) => !row.passed),
    },
    null,
    2
  )
);
if (report.failed) process.exitCode = 1;
