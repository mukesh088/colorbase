/**
 * Minecraft Java Edition legacy formatting codes.
 * HEX values are the widely published chat/dye palette used with § codes.
 * ColorBase does not claim a specific game version.
 */
import { analyzeColor } from "@/lib/colors/spaces";
export type MinecraftColor = {
  name: string;
  chat: string;
  motd: string;
  hex: string;
  rgb: string;
};

export const MINECRAFT_COLORS: MinecraftColor[] = [
  { name: "Black", chat: "§0", motd: "\\u00A70", hex: "#000000", rgb: "rgb(0, 0, 0)" },
  { name: "Dark Blue", chat: "§1", motd: "\\u00A71", hex: "#0000AA", rgb: "rgb(0, 0, 170)" },
  { name: "Dark Green", chat: "§2", motd: "\\u00A72", hex: "#00AA00", rgb: "rgb(0, 170, 0)" },
  { name: "Dark Aqua", chat: "§3", motd: "\\u00A73", hex: "#00AAAA", rgb: "rgb(0, 170, 170)" },
  { name: "Dark Red", chat: "§4", motd: "\\u00A74", hex: "#AA0000", rgb: "rgb(170, 0, 0)" },
  { name: "Dark Purple", chat: "§5", motd: "\\u00A75", hex: "#AA00AA", rgb: "rgb(170, 0, 170)" },
  { name: "Gold", chat: "§6", motd: "\\u00A76", hex: "#FFAA00", rgb: "rgb(255, 170, 0)" },
  { name: "Gray", chat: "§7", motd: "\\u00A77", hex: "#AAAAAA", rgb: "rgb(170, 170, 170)" },
  { name: "Dark Gray", chat: "§8", motd: "\\u00A78", hex: "#555555", rgb: "rgb(85, 85, 85)" },
  { name: "Blue", chat: "§9", motd: "\\u00A79", hex: "#5555FF", rgb: "rgb(85, 85, 255)" },
  { name: "Green", chat: "§a", motd: "\\u00A7a", hex: "#55FF55", rgb: "rgb(85, 255, 85)" },
  { name: "Aqua", chat: "§b", motd: "\\u00A7b", hex: "#55FFFF", rgb: "rgb(85, 255, 255)" },
  { name: "Red", chat: "§c", motd: "\\u00A7c", hex: "#FF5555", rgb: "rgb(255, 85, 85)" },
  { name: "Light Purple", chat: "§d", motd: "\\u00A7d", hex: "#FF55FF", rgb: "rgb(255, 85, 255)" },
  { name: "Yellow", chat: "§e", motd: "\\u00A7e", hex: "#FFFF55", rgb: "rgb(255, 255, 85)" },
  { name: "White", chat: "§f", motd: "\\u00A7f", hex: "#FFFFFF", rgb: "rgb(255, 255, 255)" },
];

export function minecraftRows() {
  return MINECRAFT_COLORS.map((c) => {
    const a = analyzeColor(c.hex);
    return {
      id: c.chat,
      name: c.name,
      chat: c.chat,
      motd: c.motd,
      hex: c.hex,
      rgb: c.rgb,
      hsl: a.hsl,
    };
  });
}

export const MINECRAFT_FORMATS = [
  { name: "Obfuscated", chat: "§k", note: "Scrambles glyphs" },
  { name: "Bold", chat: "§l", note: "Bold weight" },
  { name: "Strikethrough", chat: "§m", note: "Strike text" },
  { name: "Underline", chat: "§n", note: "Underline" },
  { name: "Italic", chat: "§o", note: "Italic" },
  { name: "Reset", chat: "§r", note: "Clears color and style" },
] as const;
