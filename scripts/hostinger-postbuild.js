/**
 * After `next build`, drop files that `next start` does not need.
 * Webpack cache alone is often 500MB+ and burns Hostinger disk and inodes.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const nextDir = path.join(root, ".next");

function rm(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function rmMaps(dir) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) removed += rmMaps(full);
    else if (entry.name.endsWith(".map")) {
      fs.rmSync(full);
      removed += 1;
    }
  }
  return removed;
}

if (!fs.existsSync(path.join(root, "package.json"))) {
  console.error("package.json missing at project root — Hostinger root directory is wrong.");
  process.exit(1);
}

if (!fs.existsSync(nextDir)) {
  console.error(".next missing — run `npm run build` first.");
  process.exit(1);
}

rm(path.join(nextDir, "standalone"));

const drop = ["cache", "trace", "diagnostics", "cache/webpack"].map((name) => path.join(nextDir, name));
for (const target of drop) rm(target);

const maps = rmMaps(nextDir);
console.log("Removed Next.js build cache, trace, and", maps, "source maps.");
console.log("Hostinger runtime keeps .next/server and .next/static only.");
