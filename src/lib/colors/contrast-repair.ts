import { ensureContrast } from "@/lib/copilot/engine";
import { getContrastRatio } from "@/lib/colors/convert";

/** Returns a tested candidate or null when a locked color makes the target impossible. */
export function suggestContrastRepair(
  foreground: string,
  background: string,
  target: 4.5 | 7,
  adjust: "foreground" | "background"
) {
  const changing = adjust === "foreground" ? foreground : background;
  const locked = adjust === "foreground" ? background : foreground;
  const candidate = [changing, ensureContrast(changing, locked, target), "#000000", "#ffffff"].find(
    (hex) => getContrastRatio(hex, locked) >= target
  );
  if (!candidate) return null;
  return adjust === "foreground"
    ? { fg: candidate, bg: background }
    : { fg: foreground, bg: candidate };
}
