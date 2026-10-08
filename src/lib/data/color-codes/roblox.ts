import { hexToRgb, rgbToHex, rgbToHsl } from "@/lib/colors/convert";
import { analyzeColor } from "@/lib/colors/spaces";

/**
 * Classic Roblox BrickColor named entries.
 * RGB values are the public BrickColor table; HEX, HSL, and OKLCH are calculated.
 */
export type RobloxBrickColor = {
  id: number;
  name: string;
  r: number;
  g: number;
  b: number;
};

export const ROBLOX_BRICKCOLORS: RobloxBrickColor[] = [
  { id: 1, name: "White", r: 242, g: 243, b: 243 },
  { id: 2, name: "Grey", r: 161, g: 165, b: 162 },
  { id: 3, name: "Light yellow", r: 249, g: 233, b: 153 },
  { id: 5, name: "Brick yellow", r: 215, g: 197, b: 154 },
  { id: 6, name: "Light green (Mint)", r: 194, g: 218, b: 184 },
  { id: 9, name: "Light reddish violet", r: 232, g: 186, b: 200 },
  { id: 11, name: "Pastel Blue", r: 128, g: 187, b: 219 },
  { id: 18, name: "Nougat", r: 204, g: 142, b: 105 },
  { id: 21, name: "Bright red", r: 196, g: 40, b: 28 },
  { id: 22, name: "Med. reddish violet", r: 196, g: 112, b: 160 },
  { id: 23, name: "Bright blue", r: 13, g: 105, b: 172 },
  { id: 24, name: "Bright yellow", r: 245, g: 205, b: 48 },
  { id: 25, name: "Earth orange", r: 98, g: 71, b: 50 },
  { id: 26, name: "Black", r: 27, g: 42, b: 53 },
  { id: 27, name: "Dark grey", r: 109, g: 110, b: 108 },
  { id: 28, name: "Dark green", r: 40, g: 127, b: 71 },
  { id: 29, name: "Medium green", r: 161, g: 196, b: 140 },
  { id: 36, name: "Lig. yellowish orange", r: 243, g: 207, b: 155 },
  { id: 37, name: "Bright green", r: 75, g: 151, b: 75 },
  { id: 38, name: "Dark orange", r: 160, g: 95, b: 53 },
  { id: 39, name: "Light bluish violet", r: 193, g: 202, b: 222 },
  { id: 40, name: "Transparent", r: 236, g: 236, b: 236 },
  { id: 41, name: "Tr. Red", r: 205, g: 84, b: 75 },
  { id: 42, name: "Tr. Lg blue", r: 193, g: 223, b: 240 },
  { id: 43, name: "Tr. Blue", r: 123, g: 182, b: 232 },
  { id: 44, name: "Tr. Yellow", r: 247, g: 241, b: 141 },
  { id: 45, name: "Light blue", r: 180, g: 210, b: 228 },
  { id: 47, name: "Tr. Flu. Reddish orange", r: 217, g: 133, b: 108 },
  { id: 48, name: "Tr. Green", r: 132, g: 182, b: 141 },
  { id: 49, name: "Tr. Flu. Green", r: 248, g: 241, b: 132 },
  { id: 50, name: "Phosph. White", r: 236, g: 232, b: 222 },
  { id: 100, name: "Light red", r: 238, g: 196, b: 182 },
  { id: 101, name: "Medium red", r: 218, g: 134, b: 122 },
  { id: 102, name: "Medium blue", r: 110, g: 153, b: 202 },
  { id: 103, name: "Light grey", r: 199, g: 193, b: 183 },
  { id: 104, name: "Bright violet", r: 107, g: 50, b: 124 },
  { id: 105, name: "Br. yellowish orange", r: 226, g: 155, b: 64 },
  { id: 106, name: "Bright orange", r: 218, g: 133, b: 65 },
  { id: 107, name: "Bright bluish green", r: 0, g: 143, b: 156 },
  { id: 108, name: "Earth yellow", r: 104, g: 92, b: 67 },
  { id: 110, name: "Bright bluish violet", r: 67, g: 84, b: 147 },
  { id: 111, name: "Tr. Brown", r: 191, g: 183, b: 177 },
  { id: 112, name: "Medium bluish violet", r: 104, g: 116, b: 172 },
  { id: 113, name: "Tr. Medi. reddish violet", r: 229, g: 173, b: 200 },
  { id: 115, name: "Med. yellowish green", r: 199, g: 210, b: 60 },
  { id: 116, name: "Med. bluish green", r: 85, g: 165, b: 175 },
  { id: 118, name: "Light bluish green", r: 183, g: 215, b: 213 },
  { id: 119, name: "Br. yellowish green", r: 164, g: 189, b: 71 },
  { id: 120, name: "Lig. yellowish green", r: 217, g: 228, b: 167 },
  { id: 121, name: "Med. yellowish orange", r: 231, g: 172, b: 88 },
  { id: 123, name: "Br. reddish orange", r: 211, g: 111, b: 76 },
  { id: 124, name: "Bright reddish violet", r: 146, g: 57, b: 120 },
  { id: 125, name: "Light orange", r: 234, g: 184, b: 146 },
  { id: 126, name: "Tr. Bright bluish violet", r: 165, g: 165, b: 203 },
  { id: 127, name: "Gold", r: 220, g: 188, b: 129 },
  { id: 128, name: "Dark nougat", r: 174, g: 122, b: 89 },
  { id: 131, name: "Silver", r: 156, g: 163, b: 168 },
  { id: 133, name: "Neon orange", r: 213, g: 115, b: 61 },
  { id: 134, name: "Neon green", r: 216, g: 221, b: 86 },
  { id: 135, name: "Sand blue", r: 116, g: 134, b: 157 },
  { id: 136, name: "Sand violet", r: 135, g: 124, b: 144 },
  { id: 137, name: "Medium orange", r: 224, g: 152, b: 100 },
  { id: 138, name: "Sand yellow", r: 149, g: 138, b: 115 },
  { id: 140, name: "Earth blue", r: 32, g: 58, b: 86 },
  { id: 141, name: "Earth green", r: 39, g: 70, b: 45 },
  { id: 143, name: "Tr. Flu. Blue", r: 207, g: 226, b: 247 },
  { id: 145, name: "Sand blue metallic", r: 121, g: 136, b: 161 },
  { id: 146, name: "Sand violet metallic", r: 149, g: 142, b: 163 },
  { id: 147, name: "Sand yellow metallic", r: 147, g: 135, b: 103 },
  { id: 148, name: "Dark grey metallic", r: 87, g: 88, b: 87 },
  { id: 149, name: "Black metallic", r: 22, g: 29, b: 50 },
  { id: 150, name: "Light grey metallic", r: 171, g: 173, b: 172 },
  { id: 151, name: "Sand green", r: 120, g: 144, b: 130 },
  { id: 153, name: "Sand red", r: 149, g: 121, b: 119 },
  { id: 154, name: "Dark red", r: 123, g: 46, b: 47 },
  { id: 157, name: "Tr. Flu. Yellow", r: 255, g: 246, b: 123 },
  { id: 158, name: "Tr. Flu. Red", r: 225, g: 164, b: 194 },
  { id: 168, name: "Gun metallic", r: 117, g: 108, b: 98 },
  { id: 176, name: "Red flip/flop", r: 151, g: 105, b: 91 },
  { id: 178, name: "Yellow flip/flop", r: 180, g: 132, b: 85 },
  { id: 179, name: "Silver flip/flop", r: 137, g: 135, b: 136 },
  { id: 180, name: "Curry", r: 215, g: 169, b: 75 },
  { id: 190, name: "Fire Yellow", r: 249, g: 214, b: 46 },
  { id: 191, name: "Flame yellowish orange", r: 232, g: 171, b: 45 },
  { id: 192, name: "Reddish brown", r: 105, g: 64, b: 40 },
  { id: 193, name: "Flame reddish orange", r: 207, g: 96, b: 36 },
  { id: 194, name: "Medium stone grey", r: 163, g: 162, b: 165 },
  { id: 195, name: "Royal blue", r: 70, g: 103, b: 164 },
  { id: 196, name: "Dark Royal blue", r: 35, g: 71, b: 139 },
  { id: 198, name: "Bright reddish lilac", r: 142, g: 66, b: 133 },
  { id: 199, name: "Dark stone grey", r: 99, g: 95, b: 98 },
  { id: 200, name: "Lemon metalic", r: 130, g: 138, b: 93 },
  { id: 208, name: "Light stone grey", r: 229, g: 228, b: 223 },
  { id: 209, name: "Dark curry", r: 176, g: 142, b: 68 },
  { id: 211, name: "Faded green", r: 112, g: 149, b: 120 },
  { id: 212, name: "Turquoise", r: 121, g: 181, b: 181 },
  { id: 213, name: "Light Purple", r: 159, g: 161, b: 172 },
  { id: 216, name: "Rust", r: 143, g: 76, b: 42 },
  { id: 217, name: "Brown", r: 124, g: 92, b: 70 },
  { id: 218, name: "Reddish lilac", r: 150, g: 112, b: 159 },
  { id: 219, name: "Lilac", r: 107, g: 98, b: 155 },
  { id: 220, name: "Light lilac", r: 167, g: 169, b: 206 },
  { id: 221, name: "Bright purple", r: 205, g: 98, b: 152 },
  { id: 222, name: "Light pink", r: 228, g: 173, b: 200 },
  { id: 223, name: "Light brick yellow", r: 220, g: 188, b: 129 },
  { id: 224, name: "Warm yellowish orange", r: 235, g: 184, b: 127 },
  { id: 225, name: "Cool yellow", r: 253, g: 234, b: 141 },
  { id: 226, name: "Dove blue", r: 125, g: 187, b: 221 },
  { id: 232, name: "Medium lilac", r: 52, g: 43, b: 117 },
  { id: 268, name: "Medium brown", r: 142, g: 85, b: 63 },
  { id: 301, name: "Slime green", r: 80, g: 109, b: 84 },
  { id: 302, name: "Smoky grey", r: 91, g: 93, b: 105 },
  { id: 303, name: "Dark blue", r: 0, g: 16, b: 176 },
  { id: 304, name: "Parsley green", r: 44, g: 101, b: 29 },
  { id: 305, name: "Steel blue", r: 82, g: 124, b: 174 },
  { id: 306, name: "Storm blue", r: 51, g: 88, b: 130 },
  { id: 307, name: "Lapis", r: 16, g: 42, b: 220 },
  { id: 308, name: "Dark indigo", r: 61, g: 21, b: 133 },
  { id: 309, name: "Sea green", r: 52, g: 142, b: 64 },
  { id: 310, name: "Shamrock", r: 91, g: 154, b: 76 },
  { id: 311, name: "Fossil", r: 159, g: 161, b: 172 },
  { id: 312, name: "Mulberry", r: 89, g: 34, b: 89 },
  { id: 313, name: "Forest green", r: 31, g: 128, b: 29 },
  { id: 314, name: "Cadet blue", r: 159, g: 173, b: 192 },
  { id: 315, name: "Electric blue", r: 9, g: 137, b: 207 },
  { id: 316, name: "Eggplant", r: 123, g: 0, b: 123 },
  { id: 317, name: "Baby blue", r: 110, g: 153, b: 202 },
  { id: 318, name: "Carnation pink", r: 255, g: 152, b: 220 },
  { id: 319, name: "Persimmon", r: 255, g: 89, b: 89 },
  { id: 320, name: "Almond", r: 239, g: 184, b: 56 },
  { id: 321, name: "Crimson", r: 151, g: 0, b: 0 },
  { id: 322, name: "Dusty Rose", r: 163, g: 75, b: 75 },
  { id: 323, name: "Olive", r: 193, g: 190, b: 66 },
  { id: 324, name: "Cool yellow", r: 253, g: 234, b: 141 },
  { id: 325, name: "New Yeller", r: 255, g: 255, b: 0 },
  { id: 327, name: "Really blue", r: 0, g: 0, b: 255 },
  { id: 328, name: "Really red", r: 255, g: 0, b: 0 },
  { id: 329, name: "Deep orange", r: 255, g: 176, b: 0 },
  { id: 330, name: "Alder", r: 180, g: 128, b: 255 },
  { id: 331, name: "Dusty Rose", r: 163, g: 75, b: 75 },
  { id: 332, name: "Olive", r: 193, g: 190, b: 66 },
  { id: 333, name: "Deep blue", r: 33, g: 84, b: 185 },
  { id: 334, name: "Toothpaste", r: 0, g: 255, b: 255 },
  { id: 335, name: "Hot pink", r: 255, g: 0, b: 191 },
  { id: 336, name: "Royal purple", r: 98, g: 37, b: 209 },
  { id: 337, name: "Camo", r: 58, g: 125, b: 21 },
  { id: 338, name: "Grime", r: 127, g: 142, b: 100 },
  { id: 339, name: "Lime green", r: 0, g: 255, b: 0 },
  { id: 340, name: "Toothpaste", r: 0, g: 255, b: 255 },
  { id: 341, name: "New Yeller", r: 255, g: 255, b: 0 },
  { id: 342, name: "Really black", r: 17, g: 17, b: 17 },
  { id: 343, name: "Really blue", r: 0, g: 0, b: 255 },
  { id: 1001, name: "Institutional white", r: 248, g: 248, b: 248 },
  { id: 1002, name: "Mid gray", r: 205, g: 205, b: 205 },
  { id: 1003, name: "Really black", r: 17, g: 17, b: 17 },
  { id: 1004, name: "Really red", r: 255, g: 0, b: 0 },
  { id: 1005, name: "Deep orange", r: 255, g: 176, b: 0 },
  { id: 1006, name: "Alder", r: 180, g: 128, b: 255 },
  { id: 1007, name: "Dusty Rose", r: 163, g: 75, b: 75 },
  { id: 1008, name: "Olive", r: 193, g: 190, b: 66 },
  { id: 1009, name: "New Yeller", r: 255, g: 255, b: 0 },
  { id: 1010, name: "Really blue", r: 0, g: 0, b: 255 },
  { id: 1011, name: "Navy blue", r: 0, g: 32, b: 96 },
  { id: 1012, name: "Deep blue", r: 33, g: 84, b: 185 },
  { id: 1013, name: "Cyan", r: 4, g: 175, b: 236 },
  { id: 1014, name: "CGA brown", r: 170, g: 85, b: 0 },
  { id: 1015, name: "Magenta", r: 170, g: 0, b: 170 },
  { id: 1016, name: "Pink", r: 255, g: 102, b: 204 },
  { id: 1017, name: "Deep orange", r: 255, g: 176, b: 0 },
  { id: 1018, name: "Teal", r: 18, g: 238, b: 212 },
  { id: 1019, name: "Toothpaste", r: 0, g: 255, b: 255 },
  { id: 1020, name: "Lime green", r: 0, g: 255, b: 0 },
  { id: 1021, name: "Camo", r: 58, g: 125, b: 21 },
  { id: 1022, name: "Grime", r: 127, g: 142, b: 100 },
  { id: 1023, name: "Lavender", r: 140, g: 91, b: 159 },
  { id: 1024, name: "Pastel light blue", r: 175, g: 221, b: 255 },
  { id: 1025, name: "Pastel orange", r: 255, g: 201, b: 201 },
  { id: 1026, name: "Pastel violet", r: 177, g: 167, b: 255 },
  { id: 1027, name: "Pastel blue-green", r: 159, g: 243, b: 233 },
  { id: 1028, name: "Pastel green", r: 204, g: 255, b: 204 },
  { id: 1029, name: "Pastel yellow", r: 255, g: 255, b: 204 },
  { id: 1030, name: "Pastel brown", r: 255, g: 204, b: 153 },
  { id: 1031, name: "Royal purple", r: 98, g: 37, b: 209 },
  { id: 1032, name: "Hot pink", r: 255, g: 0, b: 191 },
];

export function uniqueRobloxColors() {
  const seen = new Set<number>();
  return ROBLOX_BRICKCOLORS.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

export function getRobloxById(id: number) {
  return uniqueRobloxColors().find((c) => c.id === id);
}

export function robloxHex(c: RobloxBrickColor) {
  return rgbToHex({ r: c.r, g: c.g, b: c.b });
}

export function robloxAnalysis(c: RobloxBrickColor) {
  return analyzeColor(robloxHex(c));
}

export function robloxRows() {
  return uniqueRobloxColors().map((c) => {
    const a = robloxAnalysis(c);
    const { h } = rgbToHsl(hexToRgb(a.hex));
    return {
      id: String(c.id),
      name: c.name,
      brickId: String(c.id),
      rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
      hex: a.hex.toUpperCase(),
      hsl: a.hsl,
      oklch: a.oklch,
      hue: String(h),
    };
  });
}
