import { isValidHex, normalizeHex, parseColor } from "@/lib/colors/convert";
import { oklchToHex } from "@/lib/colors/oklch";
import { findTailwindToken } from "@/lib/colors/spaces";

export function parseFlexibleColor(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsed = parseColor(trimmed);
  if (parsed) return parsed.hex;

  if (isValidHex(trimmed)) return normalizeHex(trimmed);

  const bareHex = trimmed.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (bareHex && isValidHex(bareHex[0])) return normalizeHex(bareHex[0]);

  const modernRgb = trimmed.match(/^rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)(?:\s*\/\s*[\d.]+%?)?\s*\)$/i);
  if (modernRgb) {
    return parseColor(`rgb(${modernRgb[1]}, ${modernRgb[2]}, ${modernRgb[3]})`)?.hex ?? null;
  }

  const oklchMatch = trimmed.match(
    /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+(-?[\d.]+)(?:deg)?(?:\s*\/\s*[\d.%]+)?\s*\)$/i
  );
  if (oklchMatch) {
    const rawL = oklchMatch[1] ?? "0";
    const l = rawL.endsWith("%") ? Number(rawL.slice(0, -1)) / 100 : Number(rawL);
    const c = Number(oklchMatch[2]);
    const h = Number(oklchMatch[3]);
    if (Number.isFinite(l) && Number.isFinite(c) && Number.isFinite(h)) {
      return oklchToHex({ l, c, h });
    }
  }

  const token = findTailwindToken(trimmed);
  if (token) return token.hex;

  return null;
}
