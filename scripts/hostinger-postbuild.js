/**
 * Finish a Next.js standalone build for Hostinger.
 * Copies static assets into .next/standalone and removes the webpack cache.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const nextDir = path.join(root, ".next");
const standalone = path.join(nextDir, "standalone");

function rm(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
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
  console.error("package.json missing at project root.");
  process.exit(1);
}

const serverJs = path.join(standalone, "server.js");
if (!fs.existsSync(serverJs)) {
  console.error("Standalone server missing:", serverJs);
  console.error("next.config.js must set output: 'standalone'.");
  process.exit(1);
}

rm(path.join(nextDir, "cache"));
rm(path.join(nextDir, "trace"));
rm(path.join(nextDir, "diagnostics"));
rm(path.join(standalone, ".next", "cache"));
rm(path.join(standalone, "node_modules", "typescript"));
rm(path.join(standalone, "node_modules", "@types"));

copyDir(path.join(nextDir, "static"), path.join(standalone, ".next", "static"));
copyDir(path.join(root, "public"), path.join(standalone, "public"));

const maps = rmMaps(nextDir);
console.log("Standalone server ready:", serverJs);
console.log("Removed build cache and", maps, "source maps.");
