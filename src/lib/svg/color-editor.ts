import { sanitizeSvgMarkup } from "@/lib/image-studio";
import { normalizeHex } from "@/lib/colors/convert";
import { parseFlexibleColor } from "@/lib/colors/parse";

export interface SvgColorOccurrence {
  id: string;
  hex: string;
  attr: "fill" | "stroke" | "stop-color" | "style";
  count: number;
}

const ATTR_COLOR =
  /\b(fill|stroke|stop-color)\s*=\s*("|')(?!none|currentColor|url\()([^"']+)\2/gi;
const STYLE_COLOR =
  /(fill|stroke|stop-color)\s*:\s*(?!none|currentColor|url\()([^;}"']+)/gi;

export function listSvgColors(raw: string): SvgColorOccurrence[] {
  const safe = sanitizeSvgMarkup(raw);
  const bag = new Map<string, SvgColorOccurrence>();
  const add = (attr: SvgColorOccurrence["attr"], value: string) => {
    const hex = parseFlexibleColor(value.trim());
    if (!hex) return;
    const key = `${attr}:${normalizeHex(hex)}`;
    const prev = bag.get(key);
    if (prev) prev.count += 1;
    else bag.set(key, { id: key, hex: normalizeHex(hex), attr, count: 1 });
  };
  for (const m of safe.matchAll(ATTR_COLOR)) add(m[1] as SvgColorOccurrence["attr"], m[3]);
  for (const m of safe.matchAll(STYLE_COLOR)) add(m[1] as SvgColorOccurrence["attr"], m[2]);
  return [...bag.values()].sort((a, b) => b.count - a.count);
}

export function replaceSvgColor(
  raw: string,
  fromHex: string,
  toHex: string,
  options?: { attr?: SvgColorOccurrence["attr"] | "all" }
): string {
  const safe = sanitizeSvgMarkup(raw);
  const from = normalizeHex(fromHex).toLowerCase();
  const to = normalizeHex(toHex);
  const attrFilter = options?.attr ?? "all";

  const rewriteValue = (value: string) => {
    const parsed = parseFlexibleColor(value.trim());
    if (!parsed) return value;
    return normalizeHex(parsed).toLowerCase() === from ? to : value;
  };

  let out = safe.replace(ATTR_COLOR, (full, attr, quote, value) => {
    if (attrFilter !== "all" && attr !== attrFilter) return full;
    const next = rewriteValue(value);
    return next === value ? full : `${attr}=${quote}${next}${quote}`;
  });

  out = out.replace(STYLE_COLOR, (full, attr, value) => {
    if (attrFilter !== "all" && attr !== attrFilter) return full;
    const next = rewriteValue(value);
    return next === value ? full : `${attr}:${next}`;
  });

  return sanitizeSvgMarkup(out);
}

export function replaceAllSvgColors(raw: string, map: Record<string, string>) {
  let out = sanitizeSvgMarkup(raw);
  for (const [from, to] of Object.entries(map)) {
    out = replaceSvgColor(out, from, to);
  }
  return out;
}
