import fs from "node:fs";

const htmlPath = process.argv[2];
const html = fs.readFileSync(htmlPath, "utf8");
const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].length;
const css = [...html.matchAll(/<link\b[^>]+stylesheet/gi)].length;
const imgs = [...html.matchAll(/<img\b/gi)].length;
const preloads = [...html.matchAll(/rel=["']preload["']/gi)].length;
const nextAssets = new Set(
  [...html.matchAll(/\/_next\/static\/[^"'\\\s>]+/g)].map((m) => m[0])
);
console.log(
  JSON.stringify(
    {
      htmlBytes: Buffer.byteLength(html),
      scripts,
      css,
      imgs,
      preloads,
      nextAssets: nextAssets.size,
    },
    null,
    2
  )
);
