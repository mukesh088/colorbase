/**
 * Bukkit / Spigot ChatColor constants map to the same 16 Minecraft legacy colors.
 * Chat codes below use the § form; many plugins also accept & as an alias.
 */
import { MINECRAFT_COLORS } from "@/lib/data/color-codes/minecraft";

export type BukkitColor = {
  enumName: string;
  name: string;
  chat: string;
  amp: string;
  motd: string;
  hex: string;
  rgb: string;
};

const ENUM: Record<string, string> = {
  Black: "BLACK",
  "Dark Blue": "DARK_BLUE",
  "Dark Green": "DARK_GREEN",
  "Dark Aqua": "DARK_AQUA",
  "Dark Red": "DARK_RED",
  "Dark Purple": "DARK_PURPLE",
  Gold: "GOLD",
  Gray: "GRAY",
  "Dark Gray": "DARK_GRAY",
  Blue: "BLUE",
  Green: "GREEN",
  Aqua: "AQUA",
  Red: "RED",
  "Light Purple": "LIGHT_PURPLE",
  Yellow: "YELLOW",
  White: "WHITE",
};

export const BUKKIT_COLORS: BukkitColor[] = MINECRAFT_COLORS.map((c) => ({
  enumName: ENUM[c.name] ?? c.name.toUpperCase().replace(/\s+/g, "_"),
  name: c.name,
  chat: c.chat,
  amp: c.chat.replace("§", "&"),
  motd: c.motd,
  hex: c.hex,
  rgb: c.rgb,
}));

export function bukkitRows() {
  return BUKKIT_COLORS.map((c) => ({
    id: c.enumName,
    name: c.name,
    enumName: c.enumName,
    chat: c.chat,
    amp: c.amp,
    motd: c.motd,
    hex: c.hex,
    rgb: c.rgb,
  }));
}
