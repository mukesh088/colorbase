import { generateHarmony, normalizeHex } from "@/lib/colors/convert";

/** Accept opaque HEX colors without silently turning invalid input into black. */
export function readHexColor(value: string | null | undefined): string | null {
  if (!value || !/^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())) return null;
  return normalizeHex(value);
}

export function colorToolLinks(value?: string, paletteColors?: string[]) {
  const hex = readHexColor(value);
  if (!hex) {
    return {
      picker: "/color-picker",
      contrast: "/contrast-checker",
      palette: "/palette-generator",
    };
  }
  const clean = hex.slice(1);
  const provided = paletteColors?.map(readHexColor);
  const palette =
    provided &&
    provided.length >= 2 &&
    provided.length <= 10 &&
    provided.every((color) => color !== null)
      ? (provided as string[])
      : generateHarmony(hex, "analogous");
  const colors = palette.map((color) => color.slice(1)).join("-");
  return {
    picker: `/color-picker?hex=${clean}`,
    contrast: `/contrast-checker?fg=${clean}&bg=ffffff`,
    palette: `/palette-generator?colors=${colors}`,
  };
}
