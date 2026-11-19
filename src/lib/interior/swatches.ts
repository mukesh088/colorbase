import { hexToRgb, isValidHex, normalizeHex, rgbToHsl } from "@/lib/colors/convert";
import {
  INTERIOR_SWATCH_MAX,
  INTERIOR_SWATCH_MIN,
  SUGGESTED_ROLES,
  type InteriorSwatch,
  type SuggestedRole,
} from "@/lib/interior/catalog";
import { nameFromHex } from "@/lib/interior/names";

function isRole(value: unknown): value is SuggestedRole {
  return typeof value === "string" && (SUGGESTED_ROLES as readonly string[]).includes(value);
}

export function parseSwatches(raw: unknown): InteriorSwatch[] {
  if (!Array.isArray(raw)) throw new Error("Palette colors are invalid.");
  const swatches: InteriorSwatch[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const hex = typeof rec.hex === "string" && isValidHex(rec.hex) ? normalizeHex(rec.hex) : "";
    if (!hex) continue;
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const name =
      typeof rec.name === "string" && rec.name.trim().length >= 2
        ? rec.name.trim().slice(0, 48)
        : nameFromHex(hex);
    const share =
      typeof rec.share === "number" && Number.isFinite(rec.share)
        ? Math.min(1, Math.max(0, rec.share))
        : 0;
    swatches.push({
      hex,
      name,
      rgb,
      hsl,
      share,
      suggestedRole: isRole(rec.suggestedRole)
        ? rec.suggestedRole
        : isRole(rec.role)
          ? rec.role
          : "secondary",
    });
  }
  if (swatches.length < INTERIOR_SWATCH_MIN || swatches.length > INTERIOR_SWATCH_MAX) {
    throw new Error(`Keep between ${INTERIOR_SWATCH_MIN} and ${INTERIOR_SWATCH_MAX} colors.`);
  }
  return swatches;
}

export function compactSwatches(swatches: InteriorSwatch[]) {
  return swatches.map((swatch) => ({
    hex: swatch.hex,
    name: swatch.name,
    share: Number(swatch.share.toFixed(4)),
    role: swatch.suggestedRole,
  }));
}

export function slugifyTitle(title: string) {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return slug.length >= 3 ? slug : `interior-${slug || "palette"}`;
}
