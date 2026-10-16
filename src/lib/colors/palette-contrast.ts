import { checkContrast } from "@/lib/colors/convert";

export function paletteContrastPairs(colors: string[]) {
  return colors.flatMap((foreground, index) =>
    colors.slice(index + 1).map((background) => ({
      foreground,
      background,
      contrast: checkContrast(foreground, background),
    }))
  );
}
