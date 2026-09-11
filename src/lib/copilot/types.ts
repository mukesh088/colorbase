import type { ContrastResult, HSL, RGB } from "@/types/color";
import type { ShadeScale } from "@/lib/colors/oklch";

export const COLOR_ROLES = [
  "primary",
  "primaryHover",
  "primaryActive",
  "primaryLight",
  "primaryDark",
  "secondary",
  "secondaryHover",
  "secondaryActive",
  "accent",
  "background",
  "backgroundSecondary",
  "surface",
  "surfaceElevated",
  "text",
  "textSecondary",
  "textMuted",
  "textDisabled",
  "border",
  "borderStrong",
  "success",
  "warning",
  "error",
  "info",
  "focus",
] as const;

export type ColorRole = (typeof COLOR_ROLES)[number];

export type AccessibilityTarget = "AA" | "AAA";
export type CopilotTheme = "light" | "dark";

export type CopilotIntent = {
  industry: string;
  style: string;
  product: string;
  mood: string;
  theme: CopilotTheme;
  accessibility: AccessibilityTarget;
  primaryHue?: number;
  secondaryHue?: number;
  accentHue?: number;
  seedPrimary?: string;
  seedSecondary?: string;
  seedAccent?: string;
  existingColors: string[];
  lockedRoles: ColorRole[];
  operations: CopilotOperation[];
  query?: string;
  count?: number;
};

export type CopilotOperation =
  | { type: "desaturate"; amount?: number }
  | { type: "saturate"; amount?: number }
  | { type: "warmer" }
  | { type: "cooler" }
  | { type: "increaseContrast" }
  | { type: "setHueFamily"; family: string }
  | { type: "setAccentHue"; hue: number }
  | { type: "darkMode" }
  | { type: "lightMode" }
  | { type: "keepPrimary" };

export type ColorToken = {
  role: ColorRole;
  label: string;
  hex: string;
  rgb: RGB;
  hsl: HSL;
  oklch: string;
  purpose: string;
  bestFor: string[];
  avoid: string[];
  locked: boolean;
  contrast: ContrastResult;
  contrastAgainst: string;
};

export type ContrastPair = {
  id: string;
  fgRole: ColorRole;
  bgRole: ColorRole;
  fg: string;
  bg: string;
  contrast: ContrastResult;
};

export type ColorSystem = {
  theme: CopilotTheme;
  tokens: ColorToken[];
  pairs: ContrastPair[];
  shades: {
    primary: ShadeScale;
    secondary: ShadeScale;
    accent: ShadeScale;
  };
};

export type CopilotRecommendation = {
  id: string;
  title: string;
  detail: string;
  role?: ColorRole;
  hex?: string;
};

export type CopilotSuggestion = {
  id: string;
  label: string;
  action: "darkMode" | "improveA11y" | "shades" | "tailwind" | "react" | "tokens" | "review";
};

export type ColorSearchHit = {
  name: string;
  hex: string;
  rgb: RGB;
  hsl: HSL;
  oklch: string;
  similarity: number;
  contrastOnWhite: ContrastResult;
  contrastOnBlack: ContrastResult;
};

export type CopilotResponse = {
  intent: CopilotIntent;
  system: ColorSystem;
  darkSystem?: ColorSystem;
  explanation: string;
  recommendations: CopilotRecommendation[];
  suggestions: CopilotSuggestion[];
  searchHits?: ColorSearchHit[];
  usedFallback: boolean;
  error?: string;
};

export function tokenMap(system: ColorSystem): Record<ColorRole, ColorToken> {
  return Object.fromEntries(system.tokens.map((t) => [t.role, t])) as Record<ColorRole, ColorToken>;
}

export function getToken(system: ColorSystem, role: ColorRole): ColorToken | undefined {
  return system.tokens.find((t) => t.role === role);
}
