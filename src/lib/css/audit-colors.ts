import postcss from "postcss";
import { hexToHsl, normalizeHex } from "@/lib/colors/convert";
import { parseFlexibleColor } from "@/lib/colors/parse";

export interface CssColorHit {
  hex: string;
  raw: string;
  count: number;
  declarations: string[];
}

export interface CssColorAuditResult {
  colors: CssColorHit[];
  duplicates: { hex: string; raws: string[]; count: number }[];
  similar: { a: string; b: string; delta: number }[];
  tokenSuggestions: { hex: string; name: string; count: number }[];
  tokenCss: string;
  tokenJson: Record<string, string>;
  warnings: string[];
}

const COLOR_VALUE =
  /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\)|oklab\([^)]+\)/gi;

function semanticName(hex: string, index: number) {
  const { h, s, l } = hexToHsl(hex);
  if (l >= 92) return `--color-surface-${index + 1}`;
  if (l <= 12) return `--color-ink-${index + 1}`;
  if (s < 12) return `--color-neutral-${index + 1}`;
  if (h < 40 || h > 330) return `--color-warm-${index + 1}`;
  if (h >= 80 && h < 170) return `--color-fresh-${index + 1}`;
  if (h >= 170 && h < 260) return `--color-cool-${index + 1}`;
  return `--color-accent-${index + 1}`;
}

function perceptualDelta(a: string, b: string) {
  const A = hexToHsl(a);
  const B = hexToHsl(b);
  const dh = Math.min(Math.abs(A.h - B.h), 360 - Math.abs(A.h - B.h)) / 180;
  const ds = Math.abs(A.s - B.s) / 100;
  const dl = Math.abs(A.l - B.l) / 100;
  return Number((dh * 0.45 + ds * 0.25 + dl * 0.3).toFixed(3));
}

export function auditCssColors(cssText: string): CssColorAuditResult {
  const warnings: string[] = [
    "This audit inspects stylesheet text only. Unused selectors, cascade winners, and runtime theme switches are not computed.",
    "Contrast between arbitrary pairs is not claimed as page accessibility unless you verify against real UI pairs.",
  ];
  const bag = new Map<string, CssColorHit>();

  const addHit = (raw: string, tip?: string) => {
    const hex = parseFlexibleColor(raw);
    if (!hex) return;
    const key = normalizeHex(hex);
    const prev = bag.get(key);
    if (prev) {
      prev.count += 1;
      if (tip && !prev.declarations.includes(tip) && prev.declarations.length < 10) {
        prev.declarations.push(tip);
      }
      if (!prev.raw.split(", ").includes(raw)) prev.raw = `${prev.raw}, ${raw}`;
    } else {
      bag.set(key, { hex: key, raw, count: 1, declarations: tip ? [tip] : [] });
    }
  };

  try {
    const root = postcss.parse(cssText);
    root.walkDecls((decl) => {
      for (const match of decl.value.matchAll(COLOR_VALUE)) {
        addHit(match[0], `${decl.prop}: ${match[0]}`);
      }
    });
  } catch {
    warnings.push("PostCSS could not fully parse the stylesheet; falling back to regex extraction.");
    for (const match of cssText.matchAll(COLOR_VALUE)) addHit(match[0]);
  }

  const colors = [...bag.values()].sort((a, b) => b.count - a.count);
  const duplicates = colors
    .filter((c) => c.count >= 2)
    .map((c) => ({
      hex: c.hex,
      raws: [...new Set(c.raw.split(", ").map((s) => s.trim()))],
      count: c.count,
    }));

  const similar: { a: string; b: string; delta: number }[] = [];
  for (let i = 0; i < Math.min(colors.length, 24); i++) {
    for (let j = i + 1; j < Math.min(colors.length, 24); j++) {
      const delta = perceptualDelta(colors[i].hex, colors[j].hex);
      if (delta > 0 && delta < 0.12) similar.push({ a: colors[i].hex, b: colors[j].hex, delta });
    }
  }
  similar.sort((a, b) => a.delta - b.delta);

  const tokenSuggestions = colors.slice(0, 16).map((c, i) => ({
    hex: c.hex,
    name: semanticName(c.hex, i),
    count: c.count,
  }));
  const tokenJson = Object.fromEntries(tokenSuggestions.map((t) => [t.name, t.hex]));
  const tokenCss = `:root {\n${tokenSuggestions
    .map((t) => `  ${t.name}: ${t.hex}; /* used ~${t.count}× */`)
    .join("\n")}\n}\n`;

  return {
    colors,
    duplicates,
    similar: similar.slice(0, 12),
    tokenSuggestions,
    tokenCss,
    tokenJson,
    warnings,
  };
}

/** Inject a token block and replace exact normalized #rrggbb occurrences. */
export function applyTokenMapToCss(cssText: string, map: Record<string, string>) {
  let body = cssText;
  for (const [name, hex] of Object.entries(map)) {
    const needle = normalizeHex(hex);
    body = body.replaceAll(needle, `var(${name})`);
    body = body.replaceAll(needle.toUpperCase(), `var(${name})`);
  }
  const tokenBlock = `:root {\n${Object.entries(map)
    .map(([name, hex]) => `  ${name}: ${normalizeHex(hex)};`)
    .join("\n")}\n}\n\n`;
  return tokenBlock + body;
}
