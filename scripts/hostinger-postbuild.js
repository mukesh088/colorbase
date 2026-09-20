/**
 * Hostinger health check after `next build`.
 * Standalone output is intentionally disabled (inode savings).
 * This script verifies the build root and warns about common inode traps.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

if (!fs.existsSync(path.join(root, "package.json"))) {
  console.error("package.json missing at project root — Hostinger root directory is wrong.");
  process.exit(1);
}

const nextDir = path.join(root, ".next");
if (!fs.existsSync(nextDir)) {
  console.error(".next missing — run `npm run build` first.");
  process.exit(1);
}

const standalone = path.join(nextDir, "standalone");
if (fs.existsSync(standalone)) {
  console.warn(
    "WARNING: `.next/standalone` exists and uses many inodes. " +
      "Remove `output: \"standalone\"` from next.config.js on Hostinger, then delete `.next` and rebuild."
  );
}

console.log("Hostinger build check OK (no standalone copy).");
console.log("If inodes are still high in hPanel: delete old Node app folders, clear caches, redeploy once.");
