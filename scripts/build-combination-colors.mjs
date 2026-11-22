#!/usr/bin/env node
/**
 * Builds src/lib/data/combination-colors.json: the base colors for
 * /colors-that-go-with/[color]. Every entry carries its source.
 *
 * Sources, in priority order:
 *   1. CSS Color Module Level 4 named colors (W3C spec values).
 *   2. meodai/color-names (MIT), the same dataset the color-name pages use.
 *
 * Usage: node scripts/build-combination-colors.mjs path/to/colornames.csv
 * (download from https://raw.githubusercontent.com/meodai/color-names/main/src/colornames.csv)
 */
import fs from "node:fs";
import path from "node:path";

const CSS_SOURCE = "https://www.w3.org/TR/css-color-4/#named-colors";
const MEODAI_SOURCE = "https://github.com/meodai/color-names";

/** Common color names people search "colors that go with …" for. */
const NAMES = [
  "Navy Blue", "Sage Green", "Maroon", "Beige", "Mustard", "Teal", "Burgundy", "Olive", "Emerald", "Dusty Rose",
  "Lavender", "Peach", "Coral", "Mint Green", "Charcoal", "Terracotta", "Rust", "Cream", "Ivory", "Taupe",
  "Khaki", "Plum", "Mauve", "Baby Blue", "Royal Blue", "Sky Blue", "Turquoise", "Forest Green", "Hunter Green",
  "Lime Green", "Blush", "Hot Pink", "Pink", "Red", "Crimson", "Scarlet", "Orange", "Burnt Orange", "Yellow",
  "Gold", "Mustard Yellow", "Green", "Dark Green", "Light Green", "Blue", "Light Blue", "Dark Blue",
  "Powder Blue", "Steel Blue", "Purple", "Violet", "Lilac", "Magenta", "Brown", "Chocolate", "Tan", "Camel",
  "Gray", "Light Grey", "Dark Grey", "Silver", "Black", "White", "Off White", "Salmon", "Peach Pink",
  "Rose Gold", "Wine", "Cherry Red", "Brick Red", "Tomato", "Apricot", "Amber", "Ochre", "Saffron", "Indigo",
  "Aqua", "Seafoam Green", "Jade", "Pistachio", "Army Green", "Khaki Green", "Sand", "Stone", "Slate Gray",
  "Slate Blue", "Denim Blue", "Midnight Blue", "Periwinkle", "Eggplant", "Raspberry", "Ruby", "Champagne",
  "Bronze", "Copper", "Mahogany", "Walnut", "Espresso", "Chartreuse", "Electric Blue", "Pastel Pink",
  "Pastel Blue", "Pastel Green", "Pastel Yellow", "Sea Green", "Cornflower Blue", "Dusty Blue", "Teal Blue",
  "Aquamarine", "Orchid", "Thistle", "Wheat", "Linen", "Antique White", "Cadet Blue", "Rosewood", "Oxblood",
  "Bottle Green", "Honeydew", "Lemon Chiffon", "Cream White", "Fuchsia", "Cyan", "Lime", "Navy",
];

/**
 * Search names whose dataset entry is unrepresentative ("Sage Green" is a
 * brown #887766 there): look up the plain entry instead and record it.
 */
const LOOKUP = { "Sage Green": "Sage", "Mint Green": "Mint" };

const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, "");
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function readCssNames() {
  // The repo's CSS keyword table: { name: "AliceBlue", hex: "#f0f8ff" } entries.
  const file = path.join(process.cwd(), "src/lib/colors/palettes.ts");
  const text = fs.readFileSync(file, "utf8");
  const out = new Map();
  for (const m of text.matchAll(/\{\s*name:\s*"([A-Za-z]+)",\s*hex:\s*"(#[0-9a-fA-F]{6})"\s*\}/g))
    if (!out.has(m[1].toLowerCase())) out.set(m[1].toLowerCase(), m[2].toLowerCase());
  return out;
}

function readMeodai(csvPath) {
  const out = new Map();
  for (const line of fs.readFileSync(csvPath, "utf8").split(/\r?\n/).slice(1)) {
    const m = line.match(/^("[^"]*"|[^,]*),(#[0-9a-fA-F]{6})/);
    if (m) {
      const name = m[1].replace(/"/g, "");
      if (!out.has(norm(name))) out.set(norm(name), { name, hex: m[2].toLowerCase() });
    }
  }
  return out;
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Pass the path to meodai colornames.csv");
  process.exit(1);
}
const css = readCssNames();
const meodai = readMeodai(csvPath);
if (css.size < 140) throw new Error(`Expected 140+ CSS keywords, parsed ${css.size}`);

const seenHex = new Map();
const entries = [];
const missing = [];
for (const name of NAMES) {
  const lookup = LOOKUP[name] ?? name;
  const keyword = norm(lookup);
  let entry;
  if (css.has(keyword)) {
    entry = { name, hex: css.get(keyword), source: CSS_SOURCE, cssKeyword: keyword };
  } else if (meodai.has(keyword)) {
    const found = meodai.get(keyword);
    entry = {
      name,
      hex: found.hex,
      source: MEODAI_SOURCE,
      ...(found.name.toLowerCase() !== name.toLowerCase() ? { sourceName: found.name } : {}),
    };
  }
  if (!entry) {
    missing.push(name);
    continue;
  }
  if (seenHex.has(entry.hex)) {
    seenHex.get(entry.hex).aliases.push(name);
    continue;
  }
  const record = { slug: slugify(name), ...entry, aliases: [], verified: true };
  seenHex.set(entry.hex, record);
  entries.push(record);
}

const out = path.join(process.cwd(), "src/lib/data/combination-colors.json");
fs.writeFileSync(out, JSON.stringify(entries, null, 2) + "\n");
console.log(`${entries.length} base colors written; not found: ${missing.join(", ") || "none"}`);
