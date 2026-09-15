/**
 * Prepare Next.js standalone output for Hostinger Node.js deploys.
 * Copies static assets and verifies `.next/standalone/server.js` exists.
 */
const fs = require("node:fs");
const path = require("node:path");

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

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
const serverJs = path.join(standalone, "server.js");

if (!fs.existsSync(path.join(root, "package.json"))) {
  console.error("package.json missing at project root — Hostinger root directory is wrong.");
  process.exit(1);
}

if (!fs.existsSync(serverJs)) {
  console.error("Standalone server missing after build:");
  console.error(serverJs);
  console.error("Ensure next.config has output: 'standalone' and outputFileTracingRoot pinned to this app.");
  process.exit(1);
}

copyDir(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"));
copyDir(path.join(root, "public"), path.join(standalone, "public"));

console.log("Hostinger standalone ready:", serverJs);
