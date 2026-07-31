export type HexColor = string;

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSLA extends HSL {
  a: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface ColorFormats {
  hex: string;
  rgb: RGB;
  rgba: RGBA;
  hsl: HSL;
  hsla: HSLA;
  hsv: HSV;
  cmyk: CMYK;
  name?: string;
}

export type ContrastLevel = "AAA" | "AA" | "AA Large" | "Fail";

export interface ContrastResult {
  ratio: number;
  level: ContrastLevel;
  normalAA: boolean;
  normalAAA: boolean;
  largeAA: boolean;
  largeAAA: boolean;
}

export type ColorBlindType =
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia"
  | "protanomaly"
  | "deuteranomaly"
  | "tritanomaly";

export interface PaletteColor {
  hex: string;
  name?: string;
  locked?: boolean;
}

export interface Palette {
  id: string;
  name: string;
  colors: PaletteColor[];
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export type ExportFormat =
  | "json"
  | "css"
  | "scss"
  | "tailwind"
  | "bootstrap"
  | "android"
  | "swift"
  | "flutter"
  | "react-native"
  | "figma"
  | "ase"
  | "png"
  | "svg"
  | "pdf";

export type ThemeMode = "light" | "dark" | "system";

export interface GradientStop {
  color: string;
  position: number;
}

export type GradientType = "linear" | "radial" | "conic";

export interface GradientConfig {
  type: GradientType;
  angle: number;
  stops: GradientStop[];
  shape?: "circle" | "ellipse";
  position?: string;
}

export interface HistoryEntry<T> {
  past: T[];
  present: T;
  future: T[];
}
