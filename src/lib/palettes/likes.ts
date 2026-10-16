export function paletteIdFromColors(colors: string[]) {
  return colors
    .map((c) => c.replace(/^#/, "").toLowerCase())
    .join("-");
}
