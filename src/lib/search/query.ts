import { parseFlexibleColor } from "@/lib/colors/parse";
import { findTailwindToken } from "@/lib/colors/spaces";
import { searchTools } from "@/lib/tools-registry";
import { searchBrands } from "@/lib/data/brands";
import { searchNamedColors } from "@/lib/data/color-names";
import { getColorByHex, UI_KITS } from "@/lib/data/color-library";
import { COLOR_FAMILIES, FAMILY_LABELS } from "@/lib/data/families";
import { getAllPosts } from "@/lib/data/blog";
import { DESIGN_SYSTEM_ROUTES, kitToDesignPath } from "@/lib/data/design-systems";
import { COLOR_CODE_CATEGORIES } from "@/lib/data/color-codes";
import { MINECRAFT_COLORS } from "@/lib/data/color-codes/minecraft";
import { uniqueRobloxColors, robloxHex } from "@/lib/data/color-codes/roblox";
import { FLAT_UI_COLORS } from "@/lib/data/color-codes/flat-ui";
import { getCommonColorRows } from "@/lib/data/color-codes/common";

export type SearchCategory =
  | "Colors"
  | "Color Names"
  | "Color Codes"
  | "Design Systems"
  | "Brands"
  | "Tools"
  | "Guides";

export interface SearchHit {
  href: string;
  label: string;
  hint?: string;
  swatch?: string;
  category: SearchCategory;
}

export interface SearchResultSet {
  parsedHex: string | null;
  groups: { category: SearchCategory; items: SearchHit[] }[];
}

const DESIGN_HITS: SearchHit[] = DESIGN_SYSTEM_ROUTES.map((item) => ({
  href: item.path,
  label: item.title,
  hint: "Official scale",
  category: "Design Systems",
}));

export function querySearch(raw: string, limit = 6): SearchResultSet {
  const q = raw.trim();
  const parsedHex = parseFlexibleColor(q);
  const groups: SearchResultSet["groups"] = [];

  if (!q) {
    return {
      parsedHex: null,
      groups: [
        {
          category: "Design Systems",
          items: DESIGN_HITS.slice(0, 6),
        },
        {
          category: "Color Codes",
          items: [
            { href: "/color-codes", label: "Color codes hub", category: "Color Codes" as const },
            { href: "/color-codes/minecraft", label: "Minecraft color codes", category: "Color Codes" as const },
            { href: "/color-codes/roblox", label: "Roblox BrickColor", category: "Color Codes" as const },
            { href: "/color-atlas", label: "Universal Color Atlas", category: "Color Codes" as const },
          ],
        },
      ],
    };
  }

  const colors: SearchHit[] = [];
  if (parsedHex) {
    const known = getColorByHex(parsedHex);
    colors.push({
      href: `/color/${parsedHex.slice(1)}`,
      label: known?.name ?? parsedHex.toUpperCase(),
      hint: parsedHex.toUpperCase(),
      swatch: parsedHex,
      category: "Colors",
    });
  }

  const token = findTailwindToken(q);
  if (token) {
    colors.push({
      href: `/color/${token.hex.slice(1)}`,
      label: token.token,
      hint: "Official Tailwind token",
      swatch: token.hex,
      category: "Colors",
    });
  }

  const family = COLOR_FAMILIES.find(
    (f) => f === q.toLowerCase() || FAMILY_LABELS[f].toLowerCase() === q.toLowerCase()
  );
  if (family) {
    colors.push({
      href: `/colors/family/${family}`,
      label: `${FAMILY_LABELS[family]} family`,
      hint: "Color family",
      category: "Colors",
    });
  }

  const names = searchNamedColors(q)
    .filter((c) => c.source === "css")
    .slice(0, limit)
    .map((c) => ({
      href: `/color-names/${c.slug}`,
      label: c.displayName,
      hint: c.hex.toUpperCase(),
      swatch: c.hex,
      category: "Color Names" as const,
    }));

  const systems = [
    ...DESIGN_HITS,
    ...UI_KITS.map((kit) => ({
      href: kitToDesignPath(kit.slug) ?? `/colors/kits/${kit.slug}`,
      label: kit.title,
      hint: "Design system",
      category: "Design Systems" as const,
    })),
  ]
    .filter((item, i, arr) => arr.findIndex((x) => x.href === item.href) === i)
    .filter(
      (item) =>
        item.label.toLowerCase().includes(q.toLowerCase()) || item.href.includes(q.toLowerCase().replace(/\s+/g, "-"))
    )
    .slice(0, limit);

  const brands = searchBrands(q)
    .slice(0, limit)
    .map((b) => ({
      href: `/brands/${b.slug}`,
      label: b.name,
      hint: b.category,
      swatch: b.primary[0],
      category: "Brands" as const,
    }));

  const tools = searchTools(q)
    .slice(0, limit)
    .map((t) => ({
      href: `/${t.slug}`,
      label: t.title,
      hint: t.shortTitle,
      category: "Tools" as const,
    }));

  const guides: SearchHit[] = getAllPosts()
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.keywords.some((k) => k.toLowerCase().includes(q.toLowerCase()))
    )
    .slice(0, limit)
    .map((p) => ({
      href: `/blog/${p.slug}`,
      label: p.title,
      hint: p.category,
      category: "Guides" as const,
    }));

  if (q.toLowerCase().includes("learn") || q.toLowerCase().includes("oklch") || q.toLowerCase().includes("guide")) {
    guides.unshift({ href: "/learning", label: "Learning guides", hint: "Learn", category: "Guides" });
    guides.unshift({ href: "/learn/color-codes", label: "Color codes explained", hint: "Learn", category: "Guides" });
  }

  const ql = q.toLowerCase();
  const codeHits: SearchHit[] = [];
  for (const cat of COLOR_CODE_CATEGORIES) {
    if (cat.title.toLowerCase().includes(ql) || cat.slug.includes(ql.replace(/\s+/g, "-")) || ql.includes(cat.slug)) {
      codeHits.push({ href: cat.href, label: cat.title, hint: "Color codes", category: "Color Codes" });
    }
  }
  if (ql.includes("minecraft") || ql.includes("motd") || ql.includes("chat code") || /minecraft color code/.test(ql)) {
    codeHits.push({ href: "/color-codes/minecraft", label: "Minecraft color codes", category: "Color Codes" });
    for (const c of MINECRAFT_COLORS) {
      const digit = c.chat.replace("§", "");
      if (
        c.name.toLowerCase().includes(ql.replace("minecraft ", "")) ||
        ql.includes(c.chat.toLowerCase()) ||
        ql.endsWith(`code ${digit}`) ||
        ql.endsWith(`§${digit}`)
      ) {
        codeHits.push({
          href: "/color-codes/minecraft",
          label: `Minecraft ${c.name}`,
          hint: c.chat,
          swatch: c.hex,
          category: "Color Codes",
        });
      }
    }
  }
  if (ql.includes("bukkit") || ql.includes("chatcolor") || ql.includes("spigot")) {
    codeHits.push({ href: "/color-codes/bukkit", label: "Bukkit ChatColor", category: "Color Codes" });
  }
  if (ql.includes("roblox") || ql.includes("brickcolor") || ql.includes("brick color")) {
    codeHits.push({ href: "/color-codes/roblox", label: "Roblox BrickColor", hint: "Game colors", category: "Color Codes" });
    const idMatch = ql.match(/\b(\d{1,4})\b/);
    const bricks = uniqueRobloxColors();
    if (idMatch) {
      const brick = bricks.find((c) => String(c.id) === idMatch[1]);
      if (brick) {
        codeHits.push({
          href: `/color-codes/roblox/${brick.id}`,
          label: `${brick.name} (BrickColor ${brick.id})`,
          hint: robloxHex(brick),
          swatch: robloxHex(brick),
          category: "Color Codes",
        });
      }
    }
    const nameQ = ql.replace("roblox ", "").replace("brickcolor ", "");
    for (const brick of bricks) {
      if (nameQ.length > 2 && brick.name.toLowerCase().includes(nameQ)) {
        codeHits.push({
          href: `/color-codes/roblox/${brick.id}`,
          label: brick.name,
          hint: `BrickColor ${brick.id}`,
          swatch: robloxHex(brick),
          category: "Color Codes",
        });
        if (codeHits.length > 12) break;
      }
    }
  }
  if (ql.includes("flat ui") || ql.includes("flatui")) {
    codeHits.push({ href: "/colors/flat-ui", label: "Flat UI colors", category: "Color Codes" });
    for (const c of FLAT_UI_COLORS) {
      if (c.name.toLowerCase().includes(ql.replace("flat ui ", ""))) {
        codeHits.push({
          href: `/color/${c.hex.slice(1)}`,
          label: `Flat UI ${c.name}`,
          hint: c.hex.toUpperCase(),
          swatch: c.hex,
          category: "Color Codes",
        });
      }
    }
  }
  if (ql.includes("atlas")) {
    codeHits.push({ href: "/color-atlas", label: "Universal Color Atlas", category: "Color Codes" });
  }
  if (ql.includes("explore") || ql.includes("16.7") || ql.includes("million")) {
    codeHits.push({ href: "/explore-colors", label: "16.7 million color explorer", category: "Color Codes" });
  }
  for (const row of getCommonColorRows()) {
    if (row.name.toLowerCase() === ql) {
      codeHits.push({
        href: `/color/${row.hex.slice(1).toLowerCase()}`,
        label: `${row.name} (common)`,
        hint: row.hex,
        swatch: row.hex,
        category: "Color Codes",
      });
    }
  }
  const uniqueCodes = codeHits
    .filter((item, i, arr) => arr.findIndex((x) => x.href === item.href && x.label === item.label) === i)
    .slice(0, limit);

  if (colors.length) groups.push({ category: "Colors", items: colors.slice(0, limit) });
  if (names.length) groups.push({ category: "Color Names", items: names });
  if (uniqueCodes.length) groups.push({ category: "Color Codes", items: uniqueCodes });
  if (systems.length) groups.push({ category: "Design Systems", items: systems });
  if (brands.length) groups.push({ category: "Brands", items: brands });
  if (tools.length) groups.push({ category: "Tools", items: tools });
  if (guides.length) groups.push({ category: "Guides", items: guides.slice(0, limit) });

  return { parsedHex, groups };
}

export function flattenHits(result: SearchResultSet): SearchHit[] {
  return result.groups.flatMap((g) => g.items);
}
