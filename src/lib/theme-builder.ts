import {
  buildColorSystem,
  defaultIntent,
  ensureContrast,
  systemFromTokens,
} from "@/lib/copilot/engine";
import { COLOR_ROLES, tokenMap, type ColorRole, type ColorSystem } from "@/lib/copilot/types";
import { getContrastRatio } from "@/lib/colors/convert";
import { readHexColor } from "@/lib/colors/tool-links";

export const THEME_TEMPLATES = ["dashboard", "landing", "store"] as const;
export type ThemeTemplate = (typeof THEME_TEMPLATES)[number];
export type ThemeMode = "light" | "dark";
export type ThemeProject = {
  version: 1;
  name: string;
  template: ThemeTemplate;
  primary: string;
  secondary: string;
  accent: string;
  overrides: Record<ThemeMode, Partial<Record<ColorRole, string>>>;
};

export const THEME_PRESETS = [
  { name: "Studio", primary: "#635bff", secondary: "#0f766e", accent: "#e89151" },
  { name: "Evergreen", primary: "#147d64", secondary: "#475569", accent: "#c57836" },
  { name: "Terracotta", primary: "#b94c38", secondary: "#6c705a", accent: "#d49b42" },
  { name: "Ocean", primary: "#2563eb", secondary: "#7c3aed", accent: "#0891b2" },
  { name: "Rosewood", primary: "#b83268", secondary: "#654b82", accent: "#b27837" },
] as const;

export function newThemeProject(): ThemeProject {
  const { primary, secondary, accent } = THEME_PRESETS[0];
  return {
    version: 1,
    name: "Untitled theme",
    template: "dashboard",
    primary,
    secondary,
    accent,
    overrides: { light: {}, dark: {} },
  };
}

/** Build both modes, retaining the exact brand seeds and manual overrides. */
export function buildThemeSystems(project: ThemeProject): Record<ThemeMode, ColorSystem> {
  const make = (theme: ThemeMode) => {
    const base = buildColorSystem(
      defaultIntent({
        theme,
        seedPrimary: project.primary,
        seedSecondary: project.secondary,
        seedAccent: project.accent,
      })
    );
    const overrides = {
      ...project.overrides[theme],
      primary: project.primary,
      secondary: project.secondary,
      accent: project.accent,
    };
    return systemFromTokens(
      base.tokens.map((token) => ({ ...token, hex: overrides[token.role] ?? token.hex })),
      theme
    );
  };
  return { light: make("light"), dark: make("dark") };
}

export function readableInk(background: string): string {
  return getContrastRatio("#ffffff", background) >= getContrastRatio("#000000", background)
    ? "#ffffff"
    : "#000000";
}

/** Only accept the documented project shape; shared data never supplies markup. */
export function parseThemeProject(value: unknown): ThemeProject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (row.version !== 1 || !THEME_TEMPLATES.includes(row.template as ThemeTemplate)) return null;
  const colors = [row.primary, row.secondary, row.accent].map((color) =>
    typeof color === "string" ? readHexColor(color) : null
  );
  if (colors.some((color) => !color)) return null;
  const overrides: ThemeProject["overrides"] = { light: {}, dark: {} };
  if (!row.overrides || typeof row.overrides !== "object") return null;
  for (const mode of ["light", "dark"] as const) {
    const entries = (row.overrides as Record<string, unknown>)[mode];
    if (!entries || typeof entries !== "object" || Array.isArray(entries)) return null;
    for (const [role, raw] of Object.entries(entries)) {
      if (!COLOR_ROLES.includes(role as ColorRole) || typeof raw !== "string") return null;
      const hex = readHexColor(raw);
      if (!hex) return null;
      overrides[mode][role as ColorRole] = hex;
    }
  }
  return {
    version: 1,
    name:
      typeof row.name === "string"
        ? row.name.trim().slice(0, 64) || "Untitled theme"
        : "Untitled theme",
    template: row.template as ThemeTemplate,
    primary: colors[0]!,
    secondary: colors[1]!,
    accent: colors[2]!,
    overrides,
  };
}

export function encodeThemeProject(project: ThemeProject): string {
  const bytes = new TextEncoder().encode(JSON.stringify(project));
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeThemeProject(encoded: string): ThemeProject | null {
  if (encoded.length > 14000) return null;
  try {
    const raw = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    return parseThemeProject(
      JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(
          Uint8Array.from(raw, (char) => char.charCodeAt(0))
        )
      )
    );
  } catch {
    return null;
  }
}

export function themeTextPairs(system: ColorSystem) {
  const t = tokenMap(system);
  return [
    { label: "Body / canvas", role: "text" as ColorRole, fg: t.text.hex, bg: t.background.hex },
    { label: "Body / card", role: "text" as ColorRole, fg: t.text.hex, bg: t.surface.hex },
    {
      label: "Muted / canvas",
      role: "textMuted" as ColorRole,
      fg: t.textMuted.hex,
      bg: t.background.hex,
    },
    { label: "Button label", role: null, fg: readableInk(t.primary.hex), bg: t.primary.hex },
  ];
}

export function repairThemeText(project: ThemeProject, target: 4.5 | 7): ThemeProject {
  const systems = buildThemeSystems(project);
  const overrides = { light: { ...project.overrides.light }, dark: { ...project.overrides.dark } };
  for (const mode of ["light", "dark"] as const) {
    const t = tokenMap(systems[mode]);
    for (const role of ["text", "textMuted"] as const) {
      const backgrounds = role === "text" ? [t.background.hex, t.surface.hex] : [t.background.hex];
      const candidate = [
        t[role].hex,
        ensureContrast(t[role].hex, t.background.hex, target),
        "#111111",
        "#ffffff",
        "#000000",
      ].find((hex) => backgrounds.every((bg) => getContrastRatio(hex, bg) >= target));
      if (candidate) overrides[mode][role] = candidate;
    }
  }
  return { ...project, overrides };
}

export function downloadText(content: string, filename: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
