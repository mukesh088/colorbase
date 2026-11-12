import {
  generateHarmony,
  getContrastRatio,
  mixColors,
  normalizeHex,
  simulateColorBlind,
} from "@/lib/colors/convert";

export type DeckMode = "light" | "dark";
export type HarmonyKind =
  | "analogous"
  | "complementary"
  | "triadic"
  | "split-complementary"
  | "monochromatic";
export type AspectRatio = "widescreen" | "standard";
export type CvdMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

export type PresentationRoles = {
  surface: string;
  surfaceAlt: string;
  ink: string;
  muted: string;
  accent: string;
  onAccent: string;
  support: string;
  supportAlt: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  charts: [string, string, string, string, string];
};

export type ContrastCheck = {
  id: string;
  label: string;
  fg: string;
  bg: string;
  ratio: number;
  aa: boolean;
  aaLarge: boolean;
  aaa: boolean;
};

export type PresentationPreset = {
  id: string;
  label: string;
  blurb: string;
  primary: string;
  secondary: string;
  harmony: HarmonyKind;
  mode: DeckMode;
};

export const PRESENTATION_PRESETS: PresentationPreset[] = [
  {
    id: "corporate",
    label: "Corporate",
    blurb: "Trust blue + slate ink for board decks",
    primary: "#1d4ed8",
    secondary: "#0f172a",
    harmony: "analogous",
    mode: "light",
  },
  {
    id: "startup",
    label: "Startup",
    blurb: "High-energy accent with near-black ink",
    primary: "#e11d48",
    secondary: "#18181b",
    harmony: "complementary",
    mode: "light",
  },
  {
    id: "finance",
    label: "Finance",
    blurb: "Teal authority for investor updates",
    primary: "#0f766e",
    secondary: "#0b1324",
    harmony: "split-complementary",
    mode: "light",
  },
  {
    id: "creative",
    label: "Creative",
    blurb: "Violet stage for product storytelling",
    primary: "#7c3aed",
    secondary: "#1e1b4b",
    harmony: "triadic",
    mode: "dark",
  },
  {
    id: "education",
    label: "Education",
    blurb: "Readable sky blue for teaching slides",
    primary: "#0369a1",
    secondary: "#0c4a6e",
    harmony: "analogous",
    mode: "light",
  },
  {
    id: "minimal",
    label: "Minimal",
    blurb: "Neutral ink with restrained accent",
    primary: "#404040",
    secondary: "#171717",
    harmony: "monochromatic",
    mode: "light",
  },
];

export const ROLE_LABELS: Record<keyof Omit<PresentationRoles, "charts">, string> = {
  surface: "Slide surface",
  surfaceAlt: "Alt surface",
  ink: "Title / ink",
  muted: "Body / muted",
  accent: "Primary accent",
  onAccent: "On accent",
  support: "Support",
  supportAlt: "Support alt",
  border: "Rule / border",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
};

export function pickOnColor(bg: string): string {
  const surface = normalizeHex(bg);
  const white = getContrastRatio("#ffffff", surface);
  const dark = getContrastRatio("#0f172a", surface);
  return white >= dark ? "#ffffff" : "#0f172a";
}

function ensureBodyInk(preferred: string, surface: string): string {
  const ink = normalizeHex(preferred);
  if (getContrastRatio(ink, surface) >= 4.5) return ink;
  const dark = mixColors(ink, "#000000", 0.55);
  if (getContrastRatio(dark, surface) >= 4.5) return dark;
  const light = mixColors(ink, "#ffffff", 0.72);
  if (getContrastRatio(light, surface) >= 4.5) return light;
  return getContrastRatio("#0f172a", surface) >= getContrastRatio("#f8fafc", surface)
    ? "#0f172a"
    : "#f8fafc";
}

function ensureMuted(ink: string, surface: string): string {
  const candidates = [
    mixColors(ink, surface, 0.38),
    mixColors(ink, surface, 0.48),
    mixColors(ink, surface, 0.28),
    mixColors(ink, "#64748b", 0.35),
  ].map(normalizeHex);
  for (const c of candidates) {
    if (getContrastRatio(c, surface) >= 4.5) return c;
  }
  return ink;
}

function distinctCharts(seed: string[], surface: string): PresentationRoles["charts"] {
  const out: string[] = [];
  for (const raw of seed) {
    let c = normalizeHex(raw);
    if (getContrastRatio(c, surface) < 3) {
      c = mixColors(c, pickOnColor(surface) === "#ffffff" ? "#ffffff" : "#0f172a", 0.35);
    }
    if (!out.some((x) => x === c)) out.push(c);
    if (out.length === 5) break;
  }
  while (out.length < 5) {
    out.push(normalizeHex(mixColors(out[out.length - 1] ?? seed[0] ?? "#1d4ed8", "#94a3b8", 0.4)));
  }
  return out as PresentationRoles["charts"];
}

export function buildPresentationTheme(input: {
  primary: string;
  secondary: string;
  mode: DeckMode;
  harmony: HarmonyKind;
}): PresentationRoles {
  const accent = normalizeHex(input.primary);
  const secondary = normalizeHex(input.secondary);
  const dark = input.mode === "dark";
  const surface = dark ? "#0b1020" : "#ffffff";
  const surfaceAlt = dark ? mixColors(surface, accent, 0.08) : mixColors("#f8fafc", accent, 0.04);
  const ink = ensureBodyInk(dark ? "#f8fafc" : secondary, surface);
  const muted = ensureMuted(ink, surface);
  const onAccent = pickOnColor(accent);
  const harmony = generateHarmony(accent, input.harmony);
  const support = normalizeHex(harmony[1] ?? harmony[2] ?? accent);
  const supportAlt = normalizeHex(harmony[2] ?? harmony[harmony.length - 1] ?? support);
  const border = dark ? mixColors(surface, "#94a3b8", 0.28) : mixColors(surface, secondary, 0.14);
  const success = dark ? "#4ade80" : "#15803d";
  const warning = dark ? "#fbbf24" : "#b45309";
  const danger = dark ? "#fb7185" : "#b91c1c";
  const chartSeed = [
    accent,
    support,
    supportAlt,
    ...generateHarmony(accent, "triadic").slice(1),
    ...generateHarmony(accent, "tetradic").slice(1),
  ];

  return {
    surface: normalizeHex(surface),
    surfaceAlt: normalizeHex(surfaceAlt),
    ink,
    muted,
    accent,
    onAccent,
    support,
    supportAlt,
    border: normalizeHex(border),
    success: normalizeHex(success),
    warning: normalizeHex(warning),
    danger: normalizeHex(danger),
    charts: distinctCharts(chartSeed, surface),
  };
}

export function auditPresentationTheme(roles: PresentationRoles): ContrastCheck[] {
  const pairs: Array<{ id: string; label: string; fg: string; bg: string; large?: boolean }> = [
    { id: "title", label: "Title on surface", fg: roles.ink, bg: roles.surface },
    { id: "body", label: "Body on surface", fg: roles.muted, bg: roles.surface },
    { id: "cta", label: "CTA label on accent", fg: roles.onAccent, bg: roles.accent },
    { id: "accent-surface", label: "Accent on surface (UI)", fg: roles.accent, bg: roles.surface, large: true },
    { id: "support-surface", label: "Support on surface (UI)", fg: roles.support, bg: roles.surface, large: true },
    { id: "success", label: "Success on surface", fg: roles.success, bg: roles.surface },
    { id: "danger", label: "Danger on surface", fg: roles.danger, bg: roles.surface },
  ];

  return pairs.map((p) => {
    const ratio = getContrastRatio(p.fg, p.bg);
    return {
      id: p.id,
      label: p.label,
      fg: p.fg,
      bg: p.bg,
      ratio,
      aa: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaa: ratio >= 7,
    };
  });
}

export function themeToCssVars(roles: PresentationRoles, prefix = "deck"): string {
  const lines = [
    `--${prefix}-surface: ${roles.surface};`,
    `--${prefix}-surface-alt: ${roles.surfaceAlt};`,
    `--${prefix}-ink: ${roles.ink};`,
    `--${prefix}-muted: ${roles.muted};`,
    `--${prefix}-accent: ${roles.accent};`,
    `--${prefix}-on-accent: ${roles.onAccent};`,
    `--${prefix}-support: ${roles.support};`,
    `--${prefix}-support-alt: ${roles.supportAlt};`,
    `--${prefix}-border: ${roles.border};`,
    `--${prefix}-success: ${roles.success};`,
    `--${prefix}-warning: ${roles.warning};`,
    `--${prefix}-danger: ${roles.danger};`,
    ...roles.charts.map((c, i) => `--${prefix}-chart-${i + 1}: ${c};`),
  ];
  return `:root {\n  ${lines.join("\n  ")}\n}`;
}

export function themeToTokenJson(input: {
  name: string;
  mode: DeckMode;
  harmony: HarmonyKind;
  aspect: AspectRatio;
  title: string;
  subtitle: string;
  roles: PresentationRoles;
  audit: ContrastCheck[];
}) {
  return {
    name: input.name,
    generator: "ColorBase Presentation Theme Generator",
    mode: input.mode,
    harmony: input.harmony,
    aspect: input.aspect,
    meta: { title: input.title, subtitle: input.subtitle },
    colors: input.roles,
    contrast: input.audit.map((a) => ({
      id: a.id,
      label: a.label,
      ratio: Number(a.ratio.toFixed(2)),
      aa: a.aa,
      aaLarge: a.aaLarge,
      aaa: a.aaa,
    })),
  };
}

export function applyCvdToRoles(roles: PresentationRoles, mode: CvdMode): PresentationRoles {
  if (mode === "none") return roles;
  const map = (hex: string) => simulateColorBlind(hex, mode);
  return {
    surface: map(roles.surface),
    surfaceAlt: map(roles.surfaceAlt),
    ink: map(roles.ink),
    muted: map(roles.muted),
    accent: map(roles.accent),
    onAccent: map(roles.onAccent),
    support: map(roles.support),
    supportAlt: map(roles.supportAlt),
    border: map(roles.border),
    success: map(roles.success),
    warning: map(roles.warning),
    danger: map(roles.danger),
    charts: roles.charts.map(map) as PresentationRoles["charts"],
  };
}

export function stripHash(hex: string): string {
  return normalizeHex(hex).replace("#", "");
}
