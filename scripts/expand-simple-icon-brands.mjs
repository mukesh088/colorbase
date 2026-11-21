/**
 * Append more Simple Icons brand references to expanded-brands.json.
 * Official HEX only — no invented secondaries.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "src", "lib", "data");
const OUT = path.join(DATA, "expanded-brands.json");
const SI_URL =
  "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/data/simple-icons.json";
const ADD = Number(process.argv[2] || 1000);

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function identity(value) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function iconSlug(row) {
  if (row.slug) return row.slug;
  const replacements = {
    "+": "plus",
    ".": "dot",
    "&": "and",
    đ: "d",
    ħ: "h",
    ı: "i",
    ĸ: "k",
    ŀ: "l",
    ł: "l",
    ß: "ss",
    ŧ: "t",
    ø: "o",
  };
  const title = [...row.title.toLowerCase()].map((c) => replacements[c] ?? c).join("");
  return title.normalize("NFD").replace(/[^a-z0-9]/g, "");
}

function collectExisting() {
  const slugs = new Set();
  const names = new Set();
  for (const file of ["brands.ts", "food-brands.ts", "football-brands.ts", "imported-brands.ts"]) {
    const text = fs.readFileSync(path.join(DATA, file), "utf8");
    for (const slug of text.matchAll(/\bslug:\s*"([^"]+)"/g)) slugs.add(slug[1]);
    for (const name of text.matchAll(/\bname:\s*"([^"]+)"/g)) names.add(identity(name[1]));
  }
  return { slugs, names };
}

const res = await fetch(SI_URL);
if (!res.ok) throw new Error(`Simple Icons fetch failed: ${res.status}`);
const raw = await res.json();
const icons = Array.isArray(raw) ? raw : raw.icons;
if (!Array.isArray(icons)) throw new Error("Unexpected Simple Icons JSON shape");

const previous = JSON.parse(fs.readFileSync(OUT, "utf8"));
const { slugs, names } = collectExisting();
for (const record of previous) {
  slugs.add(record.slug);
  names.add(identity(record.name));
}

icons.sort(
  (a, b) =>
    Number(Boolean(b.guidelines)) - Number(Boolean(a.guidelines)) ||
    crypto.createHash("sha256").update(a.title).digest("hex").localeCompare(
      crypto.createHash("sha256").update(b.title).digest("hex")
    )
);

const added = [];
for (const row of icons) {
  if (added.length >= ADD) break;
  const name = row.title;
  const slug = slugify(name);
  if (!slug || slugs.has(slug) || names.has(identity(name))) continue;
  if (/porn|xvideos|xhamster|redtube|youporn/i.test(name)) continue;
  const hex = String(row.hex || "").replace(/^#/, "").toLowerCase();
  if (!/^[a-f0-9]{6}$/.test(hex)) continue;
  const source = row.source || "";
  if (!source.startsWith("https://")) continue;
  const result = {
    slug,
    name,
    hex: `#${hex}`,
    source,
    icon: iconSlug(row),
  };
  if (typeof row.guidelines === "string" && row.guidelines.startsWith("https://")) {
    result.guidelines = row.guidelines;
  }
  if (row.license) result.iconLicense = row.license;
  added.push(result);
  slugs.add(slug);
  names.add(identity(name));
}

if (added.length !== ADD) {
  throw new Error(`Expected ${ADD} new brands, got ${added.length}`);
}

const merged = [...previous, ...added].sort((a, b) => a.slug.localeCompare(b.slug));
fs.writeFileSync(OUT, JSON.stringify(merged));
const guided = added.filter((r) => r.guidelines).length;
console.log(`expanded-brands.json now ${merged.length} (added ${added.length}, ${guided} with guidelines)`);
