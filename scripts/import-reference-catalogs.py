"""Expand source-backed brand references and import 1,000 published color names.

No network or runtime database writes. Dry run is the default; pass --apply to
write compact catalogs, source manifest, and attribution files. Existing brand
records are retained; --brand-count sets a larger total without deleting them.
"""
import argparse
import csv
import hashlib
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/lib/data"


def slugify(value):
    value = re.sub(r"[^a-z0-9_\s-]", "", value.lower().strip())
    return re.sub(r"[\s_-]+", "-", value).strip("-")


def identity(value):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", value).lower())


def icon_slug(row):
    if row.get("slug"):
        return row["slug"]
    replacements = {"+": "plus", ".": "dot", "&": "and", "đ": "d", "ħ": "h",
                    "ı": "i", "ĸ": "k", "ŀ": "l", "ł": "l", "ß": "ss", "ŧ": "t", "ø": "o"}
    title = "".join(replacements.get(c, c) for c in row["title"].lower())
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", title))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--brand-count", type=int, help="Target expanded brand count; never removes existing records")
    args = parser.parse_args()
    inputs = args.source_dir
    brand_file = DATA / "expanded-brands.json"
    previous = json.loads(brand_file.read_text(encoding="utf-8")) if brand_file.exists() else []
    target_brands = args.brand_count or max(1000, len(previous))
    if target_brands < len(previous):
        parser.error("--brand-count cannot remove existing brands")
    existing_slugs, existing_names = set(), set()
    for filename in ["brands.ts", "food-brands.ts", "football-brands.ts", "imported-brands.ts"]:
        text = (DATA / filename).read_text(encoding="utf-8")
        existing_slugs.update(re.findall(r'\bslug:\s*"([^"]+)"', text))
        existing_names.update(identity(n) for n in re.findall(r'\bname:\s*"([^"]+)"', text))
    icons = json.loads((inputs / "simple-icons-source.json").read_text(encoding="utf-8-sig"))
    # Prefer published guidelines, then use a deterministic order across the alphabet.
    icons.sort(key=lambda r: (not bool(r.get("guidelines")), hashlib.sha256(r["title"].encode()).hexdigest()))
    brands = list(previous)
    existing_slugs.update(record["slug"] for record in previous)
    existing_names.update(identity(record["name"]) for record in previous)
    for row in icons:
        if len(brands) >= target_brands:
            break
        name = row["title"]
        slug = slugify(name)
        if not slug or slug in existing_slugs or identity(name) in existing_names:
            continue
        if re.search(r"porn|xvideos|xhamster|redtube|youporn", name, re.I):
            continue
        if not re.fullmatch(r"[A-Fa-f0-9]{6}", row["hex"]) or not row["source"].startswith("https://"):
            continue
        result = {"slug": slug, "name": name, "hex": "#" + row["hex"].lower(),
                  "source": row["source"], "icon": icon_slug(row)}
        if row.get("guidelines", "").startswith("https://"):
            result["guidelines"] = row["guidelines"]
        if row.get("license"):
            result["iconLicense"] = row["license"]
        brands.append(result)
        existing_slugs.add(slug)
        existing_names.add(identity(name))
        if len(brands) == target_brands:
            break

    color_text = (DATA / "color-names.ts").read_text(encoding="utf-8")
    from_css = (ROOT / "src/lib/colors/palettes.ts").read_text(encoding="utf-8")
    # Superset of CSS names is safe; never shadow a published CSS keyword.
    occupied = {slugify(n) for n in re.findall(r'\bname:\s*"([^"]+)"', from_css)}
    arrays = {}
    for key in ["ADJECTIVES", "NOUNS"]:
        body = re.search(r"const " + key + r" = \[([\s\S]*?)\]", color_text).group(1)
        arrays[key] = re.findall(r'"([^"]+)"', body)
    adjectives, nouns = arrays["ADJECTIVES"], arrays["NOUNS"]
    for i in range(2000):
        suffix = i // (len(adjectives) * len(nouns)) + 1
        name = f"{adjectives[i % len(adjectives)]} {nouns[(i // len(adjectives)) % len(nouns)]}"
        occupied.add(slugify(name + (f" {suffix}" if suffix > 1 else "")))
    with (inputs / "color-names-source.csv").open(encoding="utf-8-sig", newline="") as stream:
        names = list(csv.DictReader(stream))
    names.sort(key=lambda r: hashlib.sha256(r["name"].encode()).hexdigest())
    colors = []
    for row in names:
        name, hex_value = row["name"].strip(), row["hex"].lower()
        slug = slugify(name)
        if not row.get("good name") or not slug or slug in occupied:
            continue
        if re.search(r"fuck|shit|bitch|asshole", name, re.I):
            continue
        if not re.fullmatch(r"#[a-f0-9]{6}", hex_value):
            continue
        colors.append({"slug": slug, "name": name, "hex": hex_value})
        occupied.add(slug)
        if len(colors) == 1000:
            break
    if len(brands) != target_brands or len(colors) != 1000:
        raise ValueError(f"Expected {target_brands} brands and 1000 names, got {len(brands)} / {len(colors)}")
    brands.sort(key=lambda r: r["slug"])
    colors.sort(key=lambda r: r["slug"])
    manifest = {
        "importedOn": "2026-10-17", "brandCount": len(brands), "colorNameCount": len(colors),
        "sources": [
            {"project": "Simple Icons", "url": "https://github.com/simple-icons/simple-icons",
             "dataUrl": "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/data/simple-icons.json",
             "license": "CC0-1.0 (metadata; individual marks retain their own terms)",
             "sha256": hashlib.sha256((inputs / "simple-icons-source.json").read_bytes()).hexdigest()},
            {"project": "Color Names", "url": "https://github.com/meodai/color-names",
             "dataUrl": "https://raw.githubusercontent.com/meodai/color-names/main/src/colornames.csv",
             "license": "MIT", "sha256": hashlib.sha256((inputs / "color-names-source.csv").read_bytes()).hexdigest()},
        ],
    }
    if args.apply:
        for filename, records in [("expanded-brands.json", brands), ("expanded-color-names.json", colors)]:
            (DATA / filename).write_text(json.dumps(records, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        (DATA / "reference-catalog-sources.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        for source, target in [("color-names-license.txt", "COLOR-NAMES-LICENSE.txt"), ("simple-icons-license.txt", "SIMPLE-ICONS-LICENSE.txt")]:
            (ROOT / "docs" / target).write_bytes((inputs / source).read_bytes())
    print(json.dumps({"expandedBrands": len(brands), "brandsAdded": len(brands)-len(previous), "publishedColorNames": len(colors), "written": args.apply}))


if __name__ == "__main__":
    main()
