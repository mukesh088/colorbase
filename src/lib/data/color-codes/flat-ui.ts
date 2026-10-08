import { familyFromHex } from "@/lib/colors/spaces";
import { normalizeHex } from "@/lib/colors/convert";

export type FlatUiColor = {
  name: string;
  hex: string;
  family: string;
  collection: "Original" | "American";
};

const ORIGINAL: { name: string; hex: string }[] = [
  { name: "Turquoise", hex: "#1abc9c" },
  { name: "Green Sea", hex: "#16a085" },
  { name: "Emerald", hex: "#2ecc71" },
  { name: "Nephritis", hex: "#27ae60" },
  { name: "Peter River", hex: "#3498db" },
  { name: "Belize Hole", hex: "#2980b9" },
  { name: "Amethyst", hex: "#9b59b6" },
  { name: "Wisteria", hex: "#8e44ad" },
  { name: "Wet Asphalt", hex: "#34495e" },
  { name: "Midnight Blue", hex: "#2c3e50" },
  { name: "Sun Flower", hex: "#f1c40f" },
  { name: "Orange", hex: "#f39c12" },
  { name: "Carrot", hex: "#e67e22" },
  { name: "Pumpkin", hex: "#d35400" },
  { name: "Alizarin", hex: "#e74c3c" },
  { name: "Pomegranate", hex: "#c0392b" },
  { name: "Clouds", hex: "#ecf0f1" },
  { name: "Silver", hex: "#bdc3c7" },
  { name: "Concrete", hex: "#95a5a6" },
  { name: "Asbestos", hex: "#7f8c8d" },
];

const AMERICAN: { name: string; hex: string }[] = [
  { name: "Light Greenish Blue", hex: "#55efc4" },
  { name: "Faded Poster", hex: "#81ecec" },
  { name: "Green Darner Tail", hex: "#74b9ff" },
  { name: "Shy Moment", hex: "#a29bfe" },
  { name: "City Lights", hex: "#dfe6e9" },
  { name: "Mint Leaf", hex: "#00b894" },
  { name: "Robin's Egg Blue", hex: "#00cec9" },
  { name: "Electron Blue", hex: "#0984e3" },
  { name: "Exodus Fruit", hex: "#6c5ce7" },
  { name: "Soothing Breeze", hex: "#b2bec3" },
  { name: "Sour Lemon", hex: "#ffeaa7" },
  { name: "First Date", hex: "#fab1a0" },
  { name: "Pink Glamour", hex: "#ff7675" },
  { name: "Pico-8 Pink", hex: "#fd79a8" },
  { name: "American River", hex: "#636e72" },
  { name: "Bright Yarrow", hex: "#fdcb6e" },
  { name: "Orangeville", hex: "#e17055" },
  { name: "Chi-Gong", hex: "#d63031" },
  { name: "Prunus Avium", hex: "#e84393" },
  { name: "Dracula Orchid", hex: "#2d3436" },
];

export const FLAT_UI_COLORS: FlatUiColor[] = [
  ...ORIGINAL.map((c) => ({
    ...c,
    hex: normalizeHex(c.hex),
    family: familyFromHex(c.hex),
    collection: "Original" as const,
  })),
  ...AMERICAN.map((c) => ({
    ...c,
    hex: normalizeHex(c.hex),
    family: familyFromHex(c.hex),
    collection: "American" as const,
  })),
];
