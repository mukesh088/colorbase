/**
 * Expand existing catalog URLs into ~256k search queries.
 * Does not create pages. Output is gitignored.
 *
 *   npm run keywords:inventory
 */
import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = 256_000;
const OUT = path.join(ROOT, "data", "keyword-inventory-256k.csv");
const META = path.join(ROOT, "data", "keyword-inventory-meta.json");

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cleanHex(hex) {
  return String(hex || "")
    .replace(/^#/, "")
    .toLowerCase();
}

function queriesForColor(name, hex) {
  const n = name.trim();
  const lower = n.toLowerCase();
  const h = cleanHex(hex);
  const hashed = h ? `#${h}` : "";
  const colour = lower.replace(/\bcolor\b/g, "colour");
  const rows = [
    `${lower} color`,
    `${lower} colour`,
    `${lower} hex`,
    `${lower} hex code`,
    `${lower} color code`,
    `${lower} colour code`,
    `${lower} rgb`,
    `${lower} hex color`,
    `${lower} css color`,
    `${lower} html color`,
    `${hashed} color`,
    `${hashed} hex`,
    `${h} hex`,
    `${h} color`,
    `${hashed} rgb`,
    `what color is ${lower}`,
    `${lower} color meaning`,
    `${lower} background color`,
    `${lower} paint color`,
    `${lower} vs`,
  ];
  return rows.filter((q) => q.replace(/#/g, "").trim().length > 1);
}

function queriesForBrand(name, hex) {
  const n = name.trim();
  const lower = n.toLowerCase();
  const h = cleanHex(hex);
  return [
    `${lower} colors`,
    `${lower} colour`,
    `${lower} hex`,
    `${lower} hex color`,
    `${lower} brand colors`,
    `${lower} brand colour`,
    `${lower} logo color`,
    `${lower} logo colour`,
    `${lower} logo hex`,
    `${lower} brand hex`,
    `${lower} color palette`,
    `${lower} colour palette`,
    `${lower} brand palette`,
    `${lower} ui colors`,
    `${h} ${lower}`,
    `#${h} ${lower}`,
    `${lower} css color`,
    `${lower} hex code`,
    `${lower} rgb`,
    `${lower} official colors`,
  ];
}

function queriesForTool(title, keywords = []) {
  const t = title.toLowerCase();
  const extra = keywords.map((k) => k.toLowerCase());
  return [
    t,
    `${t} online`,
    `free ${t}`,
    `${t} tool`,
    ...extra,
    ...extra.map((k) => `free ${k}`),
    ...extra.map((k) => `${k} online`),
  ];
}

function parseCssNamed(source) {
  const out = [];
  const re = /\{\s*name:\s*"([^"]+)"\s*,\s*hex:\s*"([^"]+)"\s*\}/g;
  let m;
  while ((m = re.exec(source))) out.push({ name: m[1], hex: m[2] });
  return out;
}

function parseTools(source) {
  const tools = [];
  const re = /slug:\s*"([^"]+)",\s*\r?\n\s*title:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(source))) {
    const after = source.slice(m.index, m.index + 1200);
    const kwBlock = after.match(/keywords:\s*\[([\s\S]*?)\]/);
    const keywords = kwBlock ? [...kwBlock[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
    tools.push({ slug: m[1], title: m[2], keywords });
  }
  return tools;
}

function add(seen, rows, keyword, url, group) {
  const key = keyword.toLowerCase().replace(/\s+/g, " ").trim();
  if (!key || key.length < 2 || key.length > 80) return;
  if (seen.has(key)) return;
  seen.add(key);
  rows.push(`${csv(key)},US,desktop,${csv(url)},${group}`);
}

function csv(value) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

const FAMILIES = [
  "red",
  "pink",
  "purple",
  "blue",
  "green",
  "yellow",
  "orange",
  "brown",
  "black",
  "white",
  "grey",
  "teal",
  "cyan",
  "indigo",
  "amber",
  "lime",
];

async function main() {
  const names = JSON.parse(
    await readFile(path.join(ROOT, "src/lib/data/expanded-color-names.json"), "utf8")
  );
  const brands = JSON.parse(
    await readFile(path.join(ROOT, "src/lib/data/expanded-brands.json"), "utf8")
  );
  const cssNamed = parseCssNamed(
    await readFile(path.join(ROOT, "src/lib/colors/palettes.ts"), "utf8")
  );
  const tools = parseTools(await readFile(path.join(ROOT, "src/lib/tools-registry.ts"), "utf8"));

  const seen = new Set();
  const rows = [];

  for (const t of tools) {
    for (const q of queriesForTool(t.title, t.keywords)) {
      add(seen, rows, q, `/${t.slug}`, "tool");
    }
  }

  for (const family of FAMILIES) {
    for (const q of [
      `${family} colors`,
      `${family} colours`,
      `shades of ${family}`,
      `${family} hex colors`,
      `${family} color palette`,
      `${family} css colors`,
    ]) {
      add(seen, rows, q, `/colors/family/${family}`, "family");
    }
  }

  for (const c of cssNamed) {
    const slug = slugifyName(c.name);
    for (const q of queriesForColor(c.name.replace(/([a-z])([A-Z])/g, "$1 $2"), c.hex)) {
      add(seen, rows, q, `/color-names/${slug}`, "css-name");
      if (seen.size >= TARGET) break;
    }
    if (seen.size >= TARGET) break;
  }

  for (const c of names) {
    for (const q of queriesForColor(c.name, c.hex)) {
      add(seen, rows, q, `/color-names/${c.slug}`, "named-color");
      if (seen.size >= TARGET) break;
    }
    if (seen.size >= TARGET) break;
  }

  for (const b of brands) {
    for (const q of queriesForBrand(b.name, b.hex)) {
      add(seen, rows, q, `/brands/${b.slug}`, "brand");
      if (seen.size >= TARGET) break;
    }
    if (seen.size >= TARGET) break;
  }

  const fillers = [
    ...cssNamed.map((c) => ({
      name: c.name.replace(/([a-z])([A-Z])/g, "$1 $2"),
      hex: c.hex,
      url: `/color-names/${slugifyName(c.name)}`,
      group: "css-name",
    })),
    ...names.map((c) => ({
      name: c.name,
      hex: c.hex,
      url: `/color-names/${c.slug}`,
      group: "named-color",
    })),
    ...brands.map((b) => ({ name: b.name, hex: b.hex, url: `/brands/${b.slug}`, group: "brand" })),
  ];

  const extraTails = [
    (n, h) => `${n.toLowerCase()} #${cleanHex(h)}`,
    (n) => `${n.toLowerCase()} color hex code`,
    (n) => `${n.toLowerCase()} html colour`,
    (n) => `${n.toLowerCase()} web color`,
    (n) => `${n.toLowerCase()} srgb`,
    (n) => `${n.toLowerCase()} oklch`,
    (n) => `${n.toLowerCase()} hsl`,
    (n) => `${n.toLowerCase()} cmyk`,
    (n) => `${n.toLowerCase()} pantone`,
    (n) => `${n.toLowerCase()} similar colors`,
    (n) => `${n.toLowerCase()} complementary color`,
    (n) => `${n.toLowerCase()} color palette generator`,
    (n) => `ai ${n.toLowerCase()} color`,
    (n) => `${n.toLowerCase()} tailwind color`,
    (n) => `${n.toLowerCase()} material color`,
    (n, h) => `rgb ${cleanHex(h)}`,
    (n, h) => `hex ${cleanHex(h)}`,
    (n, h) => `#${cleanHex(h)} colour`,
    (n) => `${n.toLowerCase()} dark mode`,
    (n) => `${n.toLowerCase()} ui`,
    (n) => `${n.toLowerCase()} background`,
    (n) => `${n.toLowerCase()} foreground`,
    (n) => `${n.toLowerCase()} contrast`,
    (n) => `${n.toLowerCase()} wcag`,
    (n) => `${n.toLowerCase()} color picker`,
    (n) => `download ${n.toLowerCase()} palette`,
    (n) => `${n.toLowerCase()} css variable`,
    (n) => `${n.toLowerCase()} design token`,
    (n) => `${n.toLowerCase()} brand kit`,
    (n) => `${n.toLowerCase()} styleguide`,
    (n) => `${n.toLowerCase()} color codes`,
    (n) => `${n.toLowerCase()} hex rgb`,
    (n) => `is ${n.toLowerCase()} a css color`,
    (n) => `${n.toLowerCase()} vs white`,
    (n) => `${n.toLowerCase()} vs black`,
    (n) => `${n.toLowerCase()} light`,
    (n) => `${n.toLowerCase()} dark`,
    (n) => `${n.toLowerCase()} pastel`,
    (n) => `${n.toLowerCase()} neon`,
    (n) => `${n.toLowerCase()} muted`,
    (n) => `${n.toLowerCase()} color chart`,
    (n) => `${n.toLowerCase()} swatch`,
    (n) => `${n.toLowerCase()} sample`,
    (n) => `${n.toLowerCase()} preview`,
    (n) => `${n.toLowerCase()} code`,
    (n, h) => `${cleanHex(h)} css`,
    (n, h) => `${cleanHex(h)} html`,
    (n, h) => `${cleanHex(h)} rgb to hex`,
    (n) => `${n.toLowerCase()} color name`,
    (n) => `${n.toLowerCase()} named color`,
    (n) => `shades of ${n.toLowerCase()}`,
    (n) => `tints of ${n.toLowerCase()}`,
    (n) => `${n.toLowerCase()} analogous`,
    (n) => `${n.toLowerCase()} triadic`,
    (n) => `${n.toLowerCase()} gradient`,
    (n) => `${n.toLowerCase()} linear gradient`,
    (n) => `best ${n.toLowerCase()} color`,
    (n) => `${n.toLowerCase()} for website`,
    (n) => `${n.toLowerCase()} for logo`,
    (n) => `${n.toLowerCase()} for app`,
    (n) => `${n.toLowerCase()} bootstrap`,
    (n) => `${n.toLowerCase()} flutter`,
    (n) => `${n.toLowerCase()} swiftui`,
  ];

  for (const tail of extraTails) {
    if (seen.size >= TARGET) break;
    for (const item of fillers) {
      add(seen, rows, tail(item.name, item.hex), item.url, item.group);
      if (seen.size >= TARGET) break;
    }
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  const stream = createWriteStream(OUT);
  stream.write("keyword,locale,device,canonical_url,group\n");
  for (const line of rows.slice(0, TARGET)) stream.write(`${line}\n`);
  await new Promise((resolve, reject) => {
    stream.end(resolve);
    stream.on("error", reject);
  });

  const byGroup = {};
  for (const line of rows.slice(0, TARGET)) {
    const group = line.split(",").pop();
    byGroup[group] = (byGroup[group] || 0) + 1;
  }

  await writeFile(
    META,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        target: TARGET,
        count: Math.min(rows.length, TARGET),
        byGroup,
        note: "Query expansions of existing URLs only. Do not import the full file into a paid rank tracker.",
      },
      null,
      2
    )
  );

  console.log(`Wrote ${Math.min(rows.length, TARGET)} queries to ${OUT}`);
  console.log(byGroup);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
