import { getContrastRatio, hexToHsl, hexToRgb, normalizeHex } from "@/lib/colors/convert";
import { parseFlexibleColor } from "@/lib/colors/parse";

export type WebsiteColorRole = "background" | "typography" | "accent" | "border" | "button" | "other";

export interface ExtractedWebsiteColor {
  hex: string;
  count: number;
  role: WebsiteColorRole;
  sources: string[];
}

export interface WebsiteColorAnalysis {
  colors: ExtractedWebsiteColor[];
  pairs: { fg: string; bg: string; ratio: number }[];
  warnings: string[];
  analyzedUrl: string;
  stylesheetCount: number;
}

const COLOR_TOKEN =
  /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|rgba?\(\s*[^)]+\)|hsla?\(\s*[^)]+\)|oklch\(\s*[^)]+\)|oklab\(\s*[^)]+\)|\b(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)\b/gi;

function roleFromContext(context: string): WebsiteColorRole {
  const c = context.toLowerCase();
  if (/button|btn|cta[\s_-]|--primary|primary-/.test(c)) return "button";
  if (/border|outline|stroke|divider|hairline/.test(c)) return "border";
  if (/accent|link-|brand-|highlight|focus-/.test(c)) return "accent";
  if (/background|bg-|canvas|surface/.test(c)) return "background";
  if (/color\s*:|text-|foreground|typography|heading/.test(c)) return "typography";
  return "other";
}

function preferRole(a: WebsiteColorRole, b: WebsiteColorRole): WebsiteColorRole {
  const rank: Record<WebsiteColorRole, number> = {
    background: 5,
    typography: 4,
    button: 3,
    accent: 2,
    border: 1,
    other: 0,
  };
  return rank[a] >= rank[b] ? a : b;
}

function collectFromCss(css: string, source: string, bag: Map<string, ExtractedWebsiteColor>) {
  const decls = css.match(/[^{}]+\{[^{}]+\}/g) ?? [css];
  for (const block of decls) {
    const ctx = block.slice(0, 180);
    const role = roleFromContext(ctx);
    for (const match of block.matchAll(COLOR_TOKEN)) {
      const raw = match[0];
      if (/^(transparent|currentcolor|inherit|initial|unset)$/i.test(raw)) continue;
      const hex = parseFlexibleColor(raw);
      if (!hex) continue;
      const key = normalizeHex(hex);
      const prev = bag.get(key);
      if (prev) {
        prev.count += 1;
        prev.role = preferRole(prev.role, role);
        if (!prev.sources.includes(source) && prev.sources.length < 6) prev.sources.push(source);
      } else {
        bag.set(key, { hex: key, count: 1, role, sources: [source] });
      }
    }
  }
}

function stylesheetHrefs(html: string, baseUrl: string): string[] {
  const hrefs: string[] = [];
  for (const m of html.matchAll(/<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi)) {
    const tag = m[0];
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    try {
      hrefs.push(new URL(href, baseUrl).toString());
    } catch {
      /* ignore */
    }
  }
  return [...new Set(hrefs)].slice(0, 8);
}

function inlineStylesAndStyleTags(html: string): string {
  const parts: string[] = [];
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    parts.push(m[1] ?? "");
  }
  for (const m of html.matchAll(/style=["']([^"']+)["']/gi)) {
    parts.push(m[1] ?? "");
  }
  return parts.join("\n");
}

function guessPairs(colors: ExtractedWebsiteColor[]) {
  const bgs = colors.filter((c) => c.role === "background").slice(0, 4);
  const texts = colors.filter((c) => c.role === "typography").slice(0, 4);
  const pairs: { fg: string; bg: string; ratio: number }[] = [];
  for (const bg of bgs.length ? bgs : colors.slice(0, 3)) {
    for (const fg of texts.length ? texts : colors.slice(0, 5)) {
      if (fg.hex === bg.hex) continue;
      pairs.push({ fg: fg.hex, bg: bg.hex, ratio: Number(getContrastRatio(fg.hex, bg.hex).toFixed(2)) });
    }
  }
  return pairs.sort((a, b) => b.ratio - a.ratio).slice(0, 8);
}

export function analyzeWebsiteMarkup(
  html: string,
  stylesheets: { url: string; css: string }[],
  analyzedUrl: string
): WebsiteColorAnalysis {
  const bag = new Map<string, ExtractedWebsiteColor>();
  const warnings: string[] = [];
  collectFromCss(inlineStylesAndStyleTags(html), "inline HTML", bag);
  for (const sheet of stylesheets) collectFromCss(sheet.css, sheet.url, bag);

  if (bag.size === 0) {
    warnings.push("No CSS color declarations were found in the fetched HTML/CSS.");
  }
  warnings.push(
    "Dynamic or canvas-painted colors, and styles applied only after client-side hydration, are not included."
  );

  const colors = [...bag.values()].sort((a, b) => b.count - a.count).slice(0, 48);
  return {
    colors,
    pairs: guessPairs(colors),
    warnings,
    analyzedUrl,
    stylesheetCount: stylesheets.length,
  };
}

export function formatWebsiteColorStats(color: ExtractedWebsiteColor) {
  const rgb = hexToRgb(color.hex);
  const hsl = hexToHsl(color.hex);
  return {
    hex: color.hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
  };
}

export { stylesheetHrefs };
