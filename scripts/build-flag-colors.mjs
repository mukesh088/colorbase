#!/usr/bin/env node
/**
 * Measures flag colors from flag SVGs and merges them into src/lib/data/flags.json.
 *
 * Method: collect every color the SVG declares (fill, stroke, stop-color, style),
 * render the flag to pixels with sharp, assign each pixel to the nearest declared
 * color (anti-aliased edge pixels are ignored), and keep colors covering ≥ 1% of
 * the flag, ranked by area (max 6).
 *
 * Existing entries are kept as they are (their values come from cited official
 * specs); new countries are added with `verified: false`.
 *
 * Usage: node scripts/build-flag-colors.mjs <codes.json> <svg-dir>
 *   codes.json: https://flagcdn.com/en/codes.json
 *   svg-dir:    https://flagcdn.com/<code>.svg for each code
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [codesPath, svgDir] = process.argv.slice(2);
if (!codesPath || !svgDir) {
  console.error("Usage: node scripts/build-flag-colors.mjs <codes.json> <svg-dir>");
  process.exit(1);
}

const NAMED = {
  white: "#ffffff", black: "#000000", red: "#ff0000", blue: "#0000ff", green: "#008000", yellow: "#ffff00",
  gold: "#ffd700", orange: "#ffa500", navy: "#000080", maroon: "#800000", purple: "#800080", gray: "#808080",
  grey: "#808080", silver: "#c0c0c0", lime: "#00ff00", aqua: "#00ffff", teal: "#008080", olive: "#808000",
};

const toHex6 = (raw) => {
  let v = raw.trim().toLowerCase();
  if (NAMED[v]) return NAMED[v];
  const rgb = v.match(/^rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*\)$/);
  if (rgb) return "#" + rgb.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, "0")).join("");
  if (/^#[0-9a-f]{3}$/.test(v)) v = "#" + [...v.slice(1)].map((c) => c + c).join("");
  return /^#[0-9a-f]{6}$/.test(v) ? v : null;
};

function declaredColors(svg) {
  const out = new Set();
  const re = /(?:fill|stroke|stop-color|color)\s*[:=]\s*["']?\s*(#[0-9a-fA-F]{3,6}\b|rgb\([^)]*\)|[a-zA-Z]+)/g;
  for (const m of svg.matchAll(re)) {
    const hex = toHex6(m[1]);
    if (hex) out.add(hex);
  }
  // Shapes without a fill paint black, and white grounds are often implicit.
  out.add("#000000");
  out.add("#ffffff");
  return [...out];
}

const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** Plain-language name for a measured color, from its HSL values. */
function colorName(hex) {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (l > 0.95 || (l > 0.9 && s < 0.35)) return "White";
  if (l < 0.1) return "Black";
  if (s < 0.12) return l > 0.6 ? "Light gray" : "Gray";
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const dark = l < 0.2 ? "Dark " : "";
  if (h < 12 || h >= 340) return l < 0.32 ? "Maroon" : "Red";
  if (h < 40) return l < 0.4 ? "Brown" : "Orange";
  if (h < 52) return "Gold";
  if (h < 66) return "Yellow";
  if (h < 172) return `${dark}Green`;
  if (h < 195) return "Teal";
  if (h < 250) return l < 0.22 ? "Navy blue" : l > 0.6 ? "Light blue" : "Blue";
  if (h < 290) return "Purple";
  return l < 0.35 ? "Maroon" : "Pink";
}

async function measure(svgPath) {
  const svg = fs.readFileSync(svgPath, "utf8");
  const declared = declaredColors(svg);
  const { data, info } = await sharp(Buffer.from(svg), { density: 72 })
    .resize({ width: 300 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const palette = declared.length ? declared : [];
  const rgbs = palette.map(rgbOf);
  const counts = new Map();
  let total = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    // Transparent areas (e.g. around Nepal's pennant) are not part of the flag.
    if (data[i + 3] < 128) continue;
    total++;
    const px = [data[i], data[i + 1], data[i + 2]];
    let best = -1;
    let bestD = Infinity;
    for (let j = 0; j < rgbs.length; j++) {
      const c = rgbs[j];
      const dd = (px[0] - c[0]) ** 2 + (px[1] - c[1]) ** 2 + (px[2] - c[2]) ** 2;
      if (dd < bestD) {
        bestD = dd;
        best = j;
      }
    }
    if (best >= 0 && bestD <= 12 * 12) counts.set(palette[best], (counts.get(palette[best]) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([hex, n]) => ({ hex, share: n / total }))
    .filter((c) => c.share >= 0.01)
    .sort((a, b) => b.share - a.share)
    .slice(0, 6);
}

const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const codes = JSON.parse(fs.readFileSync(codesPath, "utf8"));
const outFile = path.join(process.cwd(), "src/lib/data/flags.json");
const existing = JSON.parse(fs.readFileSync(outFile, "utf8"));
const byCode = new Map(existing.filter((e) => e.code).map((e) => [e.code, e]));
const bySlug = new Map(existing.map((e) => [e.slug, e]));

const result = [];
const skipped = [];
for (const [code, country] of Object.entries(codes)) {
  if (!(code.length === 2 || code.startsWith("gb-"))) continue;
  const slug = slugify(country);
  const kept = byCode.get(code) ?? bySlug.get(slug);
  if (kept) {
    result.push({ ...kept, code });
    continue;
  }
  const file = path.join(svgDir, `${code}.svg`);
  if (!fs.existsSync(file)) {
    skipped.push(code);
    continue;
  }
  const measured = await measure(file);
  if (!measured.length) {
    skipped.push(code);
    continue;
  }
  const names = new Map();
  result.push({
    slug,
    code,
    country,
    colors: measured.map(({ hex, share }) => {
      let name = colorName(hex);
      const n = (names.get(name) ?? 0) + 1;
      names.set(name, n);
      if (n > 1) name = `${name} ${n}`;
      return { name, hex: hex.toUpperCase(), share: Math.round(share * 1000) / 10 };
    }),
    source: `https://flagcdn.com/${code}.svg`,
    sourceNote: "Measured from the flag's SVG artwork (flagcdn.com, based on Wikimedia Commons): declared colors ranked by the share of the flag they cover.",
    verified: false,
  });
}

fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + "\n");
console.log(`${result.length} flags written (${existing.length} kept); skipped: ${skipped.join(", ") || "none"}`);
