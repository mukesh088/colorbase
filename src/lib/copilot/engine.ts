import {
  checkContrast,
  getContrastRatio,
  hexToRgb,
  hslToRgb,
  isValidHex,
  normalizeHex,
  rgbToHex,
  rgbToHsl,
} from "@/lib/colors/convert";
import { formatOklch } from "@/lib/colors/spaces";
import {
  hexToOklch,
  oklchShadeScale,
  oklchToHex,
  withOklch,
  type ShadeScale,
} from "@/lib/colors/oklch";
import { CSS_NAMED_COLORS } from "@/lib/colors/palettes";
import { colorDistance } from "@/lib/colors/spaces";
import { clamp } from "@/lib/utils";
import {
  COLOR_ROLES,
  tokenMap,
  type AccessibilityTarget,
  type ColorRole,
  type ColorSearchHit,
  type ColorSystem,
  type ColorToken,
  type ContrastPair,
  type CopilotIntent,
  type CopilotOperation,
  type CopilotRecommendation,
  type CopilotTheme,
} from "@/lib/copilot/types";

const ROLE_META: Record<
  ColorRole,
  { label: string; purpose: string; bestFor: string[]; avoid: string[] }
> = {
  primary: {
    label: "Primary",
    purpose: "Brand actions and key interactive elements.",
    bestFor: ["CTA", "links", "navigation", "buttons"],
    avoid: ["large backgrounds", "long paragraphs", "warning messages"],
  },
  primaryHover: {
    label: "Primary Hover",
    purpose: "Darker primary for hover feedback.",
    bestFor: ["button hover", "link hover"],
    avoid: ["body text", "backgrounds"],
  },
  primaryActive: {
    label: "Primary Active",
    purpose: "Pressed / active primary state.",
    bestFor: ["button active", "selected nav"],
    avoid: ["large fills"],
  },
  primaryLight: {
    label: "Primary Light",
    purpose: "Soft tint for chips, selected rows, and highlights.",
    bestFor: ["badges", "selected rows", "tinted surfaces"],
    avoid: ["small text on white"],
  },
  primaryDark: {
    label: "Primary Dark",
    purpose: "Deep brand shade for emphasis and dark-theme buttons.",
    bestFor: ["headers", "dark CTAs"],
    avoid: ["muted text"],
  },
  secondary: {
    label: "Secondary",
    purpose: "Supporting brand color for secondary actions.",
    bestFor: ["secondary buttons", "tags"],
    avoid: ["error states"],
  },
  secondaryHover: {
    label: "Secondary Hover",
    purpose: "Hover state for secondary actions.",
    bestFor: ["secondary button hover"],
    avoid: ["body text"],
  },
  secondaryActive: {
    label: "Secondary Active",
    purpose: "Active state for secondary actions.",
    bestFor: ["pressed secondary buttons"],
    avoid: ["backgrounds"],
  },
  accent: {
    label: "Accent",
    purpose: "Highlight color for emphasis without competing with primary.",
    bestFor: ["badges", "charts", "highlights"],
    avoid: ["body text", "error messages"],
  },
  background: {
    label: "Background",
    purpose: "Page canvas.",
    bestFor: ["app shell", "page background"],
    avoid: ["text on similar-light surfaces"],
  },
  backgroundSecondary: {
    label: "Background Secondary",
    purpose: "Subtle alternate canvas for striped sections.",
    bestFor: ["alt sections", "sidebar"],
    avoid: ["small muted text"],
  },
  surface: {
    label: "Surface",
    purpose: "Cards and panels sitting on the background.",
    bestFor: ["cards", "inputs", "tables"],
    avoid: ["overlaying same-tone text"],
  },
  surfaceElevated: {
    label: "Surface Elevated",
    purpose: "Raised layers such as popovers and modals.",
    bestFor: ["modals", "dropdowns"],
    avoid: ["page background"],
  },
  text: {
    label: "Text",
    purpose: "Primary readable content.",
    bestFor: ["headings", "body copy"],
    avoid: ["low-contrast backgrounds"],
  },
  textSecondary: {
    label: "Text Secondary",
    purpose: "Supporting copy with slightly lower emphasis.",
    bestFor: ["subheads", "table labels"],
    avoid: ["tiny captions on tinted surfaces"],
  },
  textMuted: {
    label: "Text Muted",
    purpose: "De-emphasized metadata.",
    bestFor: ["captions", "timestamps", "hints"],
    avoid: ["long reading", "legal copy"],
  },
  textDisabled: {
    label: "Text Disabled",
    purpose: "Unavailable controls — intentionally lower contrast.",
    bestFor: ["disabled labels"],
    avoid: ["required reading"],
  },
  border: {
    label: "Border",
    purpose: "Hairline dividers and input outlines.",
    bestFor: ["cards", "inputs", "tables"],
    avoid: ["text"],
  },
  borderStrong: {
    label: "Border Strong",
    purpose: "Higher-contrast edges for focus rings and separators.",
    bestFor: ["active inputs", "section splits"],
    avoid: ["body text"],
  },
  success: {
    label: "Success",
    purpose: "Positive confirmation.",
    bestFor: ["alerts", "badges", "status"],
    avoid: ["primary brand"],
  },
  warning: {
    label: "Warning",
    purpose: "Caution without blocking.",
    bestFor: ["alerts", "badges"],
    avoid: ["links", "success"],
  },
  error: {
    label: "Error",
    purpose: "Destructive and invalid states.",
    bestFor: ["errors", "destructive buttons"],
    avoid: ["success", "brand"],
  },
  info: {
    label: "Info",
    purpose: "Neutral informational callouts.",
    bestFor: ["alerts", "tooltips"],
    avoid: ["errors"],
  },
  focus: {
    label: "Focus",
    purpose: "Keyboard focus ring.",
    bestFor: ["focus rings", "selection"],
    avoid: ["large fills"],
  },
};

const HUE_FAMILIES: Record<string, number> = {
  red: 18,
  orange: 42,
  amber: 72,
  yellow: 92,
  lime: 125,
  green: 145,
  teal: 175,
  cyan: 195,
  sky: 210,
  blue: 250,
  indigo: 265,
  violet: 285,
  purple: 300,
  fuchsia: 325,
  pink: 340,
  rose: 8,
};

function sanitizeHex(input?: string | null): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (!isValidHex(trimmed)) return undefined;
  return normalizeHex(trimmed);
}

function hueFromFamily(name?: string, fallback = 250) {
  if (!name) return fallback;
  const key = name.toLowerCase().trim();
  return HUE_FAMILIES[key] ?? fallback;
}

function chromaForStyle(style: string, industry: string) {
  const s = `${style} ${industry}`.toLowerCase();
  if (/(premium|luxury|banking|finance|fintech|trust)/.test(s)) return 0.11;
  if (/(gaming|neon|bold|playful)/.test(s)) return 0.18;
  if (/(muted|minimal|calm)/.test(s)) return 0.08;
  return 0.13;
}

function targetRatio(level: AccessibilityTarget) {
  return level === "AAA" ? 7 : 4.5;
}

export function ensureContrast(
  fg: string,
  bg: string,
  minRatio: number,
  prefer: "lighter" | "darker" | "auto" = "auto"
): string {
  if (getContrastRatio(fg, bg) >= minRatio) return fg;
  const bgL = hexToOklch(bg).l;
  const direction =
    prefer === "auto" ? (bgL > 0.55 ? "darker" : "lighter") : prefer;
  const seed = hexToOklch(fg);
  let best = fg;
  let bestRatio = getContrastRatio(fg, bg);
  for (let i = 0; i <= 40; i++) {
    const delta = (i / 40) * 0.55;
    const l =
      direction === "darker"
        ? clamp(seed.l - delta, 0.08, 0.98)
        : clamp(seed.l + delta, 0.08, 0.98);
    const candidate = oklchToHex({ ...seed, l });
    const ratio = getContrastRatio(candidate, bg);
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
    if (ratio >= minRatio) return candidate;
  }
  return best;
}

function makeHex(l: number, c: number, h: number) {
  return oklchToHex({ l: clamp(l, 0, 1), c: Math.max(0, c), h: (h + 360) % 360 });
}

function wrapToken(
  role: ColorRole,
  hex: string,
  bg: string,
  locked: boolean
): ColorToken {
  const safe = normalizeHex(hex);
  const rgb = hexToRgb(safe);
  const hsl = rgbToHsl(rgb);
  const meta = ROLE_META[role];
  const against =
    role === "background" || role === "surface" || role === "surfaceElevated"
      ? hexToRgb(safe).r + hexToRgb(safe).g + hexToRgb(safe).b > 400
        ? "#0f172a"
        : "#f8fafc"
      : bg;
  return {
    role,
    label: meta.label,
    hex: safe,
    rgb,
    hsl,
    oklch: formatOklch(hexToOklch(safe)),
    purpose: meta.purpose,
    bestFor: meta.bestFor,
    avoid: meta.avoid,
    locked,
    contrast: checkContrast(
      role.startsWith("text") || role === "primary" || role === "secondary" || role === "accent"
        ? safe
        : against,
      role.startsWith("text") || role === "primary" || role === "secondary" || role === "accent"
        ? bg
        : safe
    ),
    contrastAgainst: role.startsWith("background") ? against : bg,
  };
}

function pair(id: string, fgRole: ColorRole, bgRole: ColorRole, tokens: Record<ColorRole, ColorToken>): ContrastPair {
  const fg = tokens[fgRole].hex;
  const bg = tokens[bgRole].hex;
  return { id, fgRole, bgRole, fg, bg, contrast: checkContrast(fg, bg) };
}

function buildPairs(tokens: Record<ColorRole, ColorToken>): ContrastPair[] {
  return [
    pair("text-bg", "text", "background", tokens),
    pair("text-surface", "text", "surface", tokens),
    pair("muted-bg", "textMuted", "background", tokens),
    pair("secondary-bg", "textSecondary", "background", tokens),
    pair("primary-bg", "primary", "background", tokens),
    pair("primary-on-primarylight", "primaryDark", "primaryLight", tokens),
    pair("on-primary", "background", "primary", tokens),
    pair("success-bg", "success", "background", tokens),
    pair("error-bg", "error", "background", tokens),
    pair("warning-bg", "warning", "background", tokens),
    pair("focus-bg", "focus", "background", tokens),
  ];
}

function assemble(
  hexes: Record<ColorRole, string>,
  theme: CopilotTheme,
  locked: Set<ColorRole>
): ColorSystem {
  const bg = hexes.background;
  const tokens = COLOR_ROLES.map((role) => wrapToken(role, hexes[role], bg, locked.has(role)));
  const map = tokenMap({ theme, tokens, pairs: [], shades: { primary: oklchShadeScale(hexes.primary), secondary: oklchShadeScale(hexes.secondary), accent: oklchShadeScale(hexes.accent) } });
  return {
    theme,
    tokens,
    pairs: buildPairs(map),
    shades: {
      primary: oklchShadeScale(hexes.primary),
      secondary: oklchShadeScale(hexes.secondary),
      accent: oklchShadeScale(hexes.accent),
    },
  };
}

function lightSurfaces(hue: number, chroma: number) {
  return {
    background: makeHex(0.99, chroma * 0.04, hue),
    backgroundSecondary: makeHex(0.97, chroma * 0.05, hue),
    surface: makeHex(0.985, chroma * 0.03, hue),
    surfaceElevated: makeHex(0.995, chroma * 0.02, hue),
    border: makeHex(0.9, chroma * 0.04, hue),
    borderStrong: makeHex(0.78, chroma * 0.06, hue),
  };
}

function darkSurfaces(hue: number, chroma: number) {
  return {
    background: makeHex(0.16, chroma * 0.03, hue),
    backgroundSecondary: makeHex(0.19, chroma * 0.035, hue),
    surface: makeHex(0.21, chroma * 0.04, hue),
    surfaceElevated: makeHex(0.26, chroma * 0.045, hue),
    border: makeHex(0.32, chroma * 0.04, hue),
    borderStrong: makeHex(0.42, chroma * 0.05, hue),
  };
}

function rawHexes(intent: CopilotIntent): Record<ColorRole, string> {
  const chroma = chromaForStyle(intent.style, intent.industry);
  const primaryHue =
    intent.primaryHue ??
    (intent.seedPrimary ? hexToOklch(intent.seedPrimary).h : hueFromFamily("blue"));
  const secondaryHue = intent.secondaryHue ?? (primaryHue + 42) % 360;
  const accentHue = intent.accentHue ?? (primaryHue + 148) % 360;
  const seedP = sanitizeHex(intent.seedPrimary);
  const seedS = sanitizeHex(intent.seedSecondary);
  const seedA = sanitizeHex(intent.seedAccent);
  const theme = intent.theme;
  const surfaces = theme === "dark" ? darkSurfaces(primaryHue, chroma) : lightSurfaces(primaryHue, chroma);

  const primary = seedP ?? makeHex(theme === "dark" ? 0.68 : 0.55, chroma + 0.02, primaryHue);
  const secondary = seedS ?? makeHex(theme === "dark" ? 0.7 : 0.52, chroma * 0.9, secondaryHue);
  const accent = seedA ?? makeHex(theme === "dark" ? 0.74 : 0.68, chroma + 0.04, accentHue);

  const text =
    theme === "dark"
      ? makeHex(0.93, chroma * 0.02, primaryHue)
      : makeHex(0.22, chroma * 0.04, primaryHue);
  const textSecondary =
    theme === "dark" ? makeHex(0.78, chroma * 0.02, primaryHue) : makeHex(0.4, chroma * 0.03, primaryHue);
  const textMuted =
    theme === "dark" ? makeHex(0.68, chroma * 0.015, primaryHue) : makeHex(0.52, chroma * 0.025, primaryHue);

  const hexes: Record<ColorRole, string> = {
    primary,
    primaryHover: withOklch(primary, { l: hexToOklch(primary).l + (theme === "dark" ? 0.05 : -0.06) }),
    primaryActive: withOklch(primary, { l: hexToOklch(primary).l + (theme === "dark" ? 0.08 : -0.1) }),
    primaryLight: makeHex(theme === "dark" ? 0.32 : 0.94, chroma * 0.35, primaryHue),
    primaryDark: makeHex(theme === "dark" ? 0.78 : 0.38, chroma * 0.9, primaryHue),
    secondary,
    secondaryHover: withOklch(secondary, { l: hexToOklch(secondary).l + (theme === "dark" ? 0.05 : -0.06) }),
    secondaryActive: withOklch(secondary, { l: hexToOklch(secondary).l + (theme === "dark" ? 0.08 : -0.1) }),
    accent,
    ...surfaces,
    text,
    textSecondary,
    textMuted,
    textDisabled: theme === "dark" ? makeHex(0.5, 0.01, primaryHue) : makeHex(0.72, 0.01, primaryHue),
    success: makeHex(theme === "dark" ? 0.72 : 0.52, 0.14, 145),
    warning: makeHex(theme === "dark" ? 0.78 : 0.66, 0.15, 72),
    error: makeHex(theme === "dark" ? 0.7 : 0.55, 0.17, 25),
    info: makeHex(theme === "dark" ? 0.72 : 0.55, 0.12, 250),
    focus: withOklch(primary, { l: hexToOklch(primary).l + (theme === "dark" ? 0.08 : -0.04), c: hexToOklch(primary).c + 0.02 }),
  };
  return hexes;
}

function applyAccessibility(hexes: Record<ColorRole, string>, intent: CopilotIntent) {
  const min = targetRatio(intent.accessibility);
  const uiMin = 3;
  hexes.text = ensureContrast(hexes.text, hexes.background, min);
  hexes.textSecondary = ensureContrast(hexes.textSecondary, hexes.background, min === 7 ? 4.5 : 4.5);
  hexes.textMuted = ensureContrast(hexes.textMuted, hexes.background, 4.5);
  hexes.primary = ensureContrast(hexes.primary, hexes.background, uiMin);
  if (intent.theme === "light") {
    hexes.primaryHover = ensureContrast(hexes.primaryHover, "#ffffff", uiMin);
  }
  hexes.success = ensureContrast(hexes.success, hexes.background, Math.max(uiMin, 4.5));
  hexes.error = ensureContrast(hexes.error, hexes.background, Math.max(uiMin, 4.5));
  hexes.warning = ensureContrast(hexes.warning, hexes.background, Math.max(uiMin, 4.5));
  hexes.focus = ensureContrast(hexes.focus, hexes.background, uiMin);
  return hexes;
}

function applyLocks(
  next: Record<ColorRole, string>,
  previous: ColorSystem | undefined,
  locked: Set<ColorRole>
) {
  if (!previous) return next;
  for (const role of locked) {
    const token = previous.tokens.find((t) => t.role === role);
    if (token) next[role] = token.hex;
  }
  return next;
}

function applyOperations(hexes: Record<ColorRole, string>, ops: CopilotOperation[], locked: Set<ColorRole>) {
  const mutate = (role: ColorRole, fn: (hex: string) => string) => {
    if (locked.has(role)) return;
    hexes[role] = fn(hexes[role]);
  };
  const all = COLOR_ROLES.filter((r) => !locked.has(r));
  for (const op of ops) {
    if (op.type === "desaturate") {
      const amount = op.amount ?? 0.35;
      for (const role of all) {
        const ok = hexToOklch(hexes[role]);
        mutate(role, () => oklchToHex({ ...ok, c: ok.c * (1 - amount) }));
      }
    }
    if (op.type === "saturate") {
      const amount = op.amount ?? 0.25;
      for (const role of all) {
        const ok = hexToOklch(hexes[role]);
        mutate(role, () => oklchToHex({ ...ok, c: ok.c * (1 + amount) }));
      }
    }
    if (op.type === "warmer") {
      for (const role of all) {
        const ok = hexToOklch(hexes[role]);
        mutate(role, () => oklchToHex({ ...ok, h: (ok.h - 12 + 360) % 360 }));
      }
    }
    if (op.type === "cooler") {
      for (const role of all) {
        const ok = hexToOklch(hexes[role]);
        mutate(role, () => oklchToHex({ ...ok, h: (ok.h + 12) % 360 }));
      }
    }
    if (op.type === "setHueFamily") {
      const hue = hueFromFamily(op.family, hexToOklch(hexes.primary).h);
      for (const role of ["primary", "primaryHover", "primaryActive", "primaryLight", "primaryDark", "focus"] as ColorRole[]) {
        const ok = hexToOklch(hexes[role]);
        mutate(role, () => oklchToHex({ ...ok, h: hue }));
      }
    }
    if (op.type === "setAccentHue") {
      const ok = hexToOklch(hexes.accent);
      mutate("accent", () => oklchToHex({ ...ok, h: op.hue }));
    }
    if (op.type === "increaseContrast") {
      hexes.text = ensureContrast(hexes.text, hexes.background, 7);
      hexes.textMuted = ensureContrast(hexes.textMuted, hexes.background, 4.5);
    }
  }
  return hexes;
}

export function defaultIntent(partial?: Partial<CopilotIntent>): CopilotIntent {
  return {
    industry: "general",
    style: "professional",
    product: "web app",
    mood: "trustworthy",
    theme: "light",
    accessibility: "AA",
    existingColors: [],
    lockedRoles: [],
    operations: [],
    ...partial,
  };
}

export function buildColorSystem(
  intent: CopilotIntent,
  previous?: ColorSystem
): ColorSystem {
  const locked = new Set(intent.lockedRoles);
  if (previous) {
    for (const t of previous.tokens) if (t.locked) locked.add(t.role);
  }
  let hexes = rawHexes(intent);
  hexes = applyLocks(hexes, previous, locked);
  hexes = applyOperations(hexes, intent.operations, locked);
  hexes = applyAccessibility(hexes, intent);
  hexes = applyLocks(hexes, previous, locked);
  return assemble(hexes, intent.theme, locked);
}

export function buildDarkMode(light: ColorSystem, intent: CopilotIntent): ColorSystem {
  const map = tokenMap(light);
  const locked = new Set(intent.lockedRoles);
  const darkIntent: CopilotIntent = {
    ...intent,
    theme: "dark",
    seedPrimary: map.primary.hex,
    seedSecondary: map.secondary.hex,
    seedAccent: map.accent.hex,
    lockedRoles: [...locked].filter((r) => r.startsWith("primary") || r === "accent" || r === "secondary"),
  };
  return buildColorSystem(darkIntent);
}

export function systemFromTokens(
  tokens: { role: ColorRole; hex: string; locked?: boolean }[],
  theme: CopilotTheme = "light"
): ColorSystem {
  const locked = new Set(tokens.filter((t) => t.locked).map((t) => t.role));
  const seed = Object.fromEntries(tokens.map((t) => [t.role, t.hex])) as Partial<Record<ColorRole, string>>;
  const intent = defaultIntent({
    theme,
    seedPrimary: seed.primary,
    seedSecondary: seed.secondary,
    seedAccent: seed.accent,
    lockedRoles: [...locked],
  });
  const base = rawHexes(intent);
  for (const t of tokens) base[t.role] = t.hex;
  return assemble(base, theme, locked);
}

export function applyManualHex(system: ColorSystem, role: ColorRole, hex: string): ColorSystem {
  const safe = sanitizeHex(hex);
  if (!safe) return system;
  const hexes = Object.fromEntries(system.tokens.map((t) => [t.role, t.hex])) as Record<ColorRole, string>;
  hexes[role] = safe;
  const locked = new Set(system.tokens.filter((t) => t.locked).map((t) => t.role));
  locked.add(role);
  return assemble(hexes, system.theme, locked);
}

export function toggleLock(system: ColorSystem, role: ColorRole): ColorSystem {
  return {
    ...system,
    tokens: system.tokens.map((t) => (t.role === role ? { ...t, locked: !t.locked } : t)),
  };
}

export function regenerateRole(system: ColorSystem, role: ColorRole, intent: CopilotIntent): ColorSystem {
  if (system.tokens.find((t) => t.role === role)?.locked) return system;
  const fresh = rawHexes({ ...intent, theme: system.theme, seedPrimary: tokenMap(system).primary.hex });
  const hexes = Object.fromEntries(system.tokens.map((t) => [t.role, t.hex])) as Record<ColorRole, string>;
  hexes[role] = fresh[role];
  const locked = new Set(system.tokens.filter((t) => t.locked).map((t) => t.role));
  return assemble(hexes, system.theme, locked);
}

export function improveAccessibility(system: ColorSystem, target: AccessibilityTarget): ColorSystem {
  const hexes = Object.fromEntries(system.tokens.map((t) => [t.role, t.hex])) as Record<ColorRole, string>;
  const locked = new Set(system.tokens.filter((t) => t.locked).map((t) => t.role));
  applyAccessibility(hexes, defaultIntent({ accessibility: target, theme: system.theme }));
  return assemble(hexes, system.theme, locked);
}

export function parsePaletteInput(raw: string): string[] {
  const hexes = [...raw.matchAll(/#(?:[0-9a-fA-F]{3,8})\b/g)].map((m) => normalizeHex(m[0]));
  const unique = [...new Set(hexes)];
  return unique.slice(0, 24);
}

export function reviewSystem(input: string | ColorSystem): CopilotRecommendation[] {
  const recs: CopilotRecommendation[] = [];
  let tokens: ColorToken[];
  let pairs: ContrastPair[];
  if (typeof input === "string") {
    const hexes = parsePaletteInput(input);
    if (hexes.length < 2) {
      return [{ id: "need-more", title: "Need more colors", detail: "Paste at least a text color and a background (or a CSS :root block)." }];
    }
    const bg = hexes.find((h) => hexToOklch(h).l > 0.85) ?? hexes[hexes.length - 1];
    const others = hexes.filter((h) => h !== bg);
    others.forEach((hex, i) => {
      const contrast = checkContrast(hex, bg);
      if (!contrast.normalAA) {
        const fixed = ensureContrast(hex, bg, 4.5);
        recs.push({
          id: `fail-${i}`,
          title: `Replace ${hex} for readable text`,
          detail: `${hex} on ${bg} is ${contrast.ratio}:1 (fails AA). ${fixed} reaches ${checkContrast(fixed, bg).ratio}:1.`,
          hex: fixed,
        });
      }
    });
    const hasDarkHover = others.some((h) => hexToOklch(h).l < 0.45);
    if (!hasDarkHover) {
      recs.push({
        id: "hover",
        title: "Add a darker primary hover state",
        detail: "Interactive primary colors need a darker hover companion.",
        hex: withOklch(others[0] ?? bg, { l: 0.42 }),
      });
    }
    return recs;
  }
  tokens = input.tokens;
  pairs = input.pairs;
  const fails = pairs.filter((p) => !p.contrast.normalAA && p.fgRole !== "textDisabled" && p.fgRole !== "border");
  fails.forEach((p) => {
    const fixed = ensureContrast(p.fg, p.bg, 4.5);
    recs.push({
      id: `pair-${p.id}`,
      title: `Fix ${p.fgRole} on ${p.bgRole}`,
      detail: `${p.fg} on ${p.bg} is ${p.contrast.ratio}:1. Suggested ${fixed}.`,
      role: p.fgRole,
      hex: fixed,
    });
  });
  const map = tokenMap(input);
  const hoverL = hexToOklch(map.primaryHover.hex).l;
  const primaryL = hexToOklch(map.primary.hex).l;
  if (Math.abs(hoverL - primaryL) < 0.03) {
    recs.push({
      id: "hover-gap",
      title: "Add a darker primary hover state",
      detail: "Hover is too close to primary. Darken it for clearer interaction.",
      role: "primaryHover",
      hex: withOklch(map.primary.hex, { l: clamp(primaryL - 0.07, 0.15, 0.9) }),
    });
  }
  const neutrals = [map.background, map.surface, map.border, map.textMuted].map((t) => hexToOklch(t.hex).l);
  const span = Math.max(...neutrals) - Math.min(...neutrals);
  if (span < 0.35) {
    recs.push({
      id: "neutral-scale",
      title: "Neutral scale is missing a middle shade",
      detail: "Background, surface, and muted text are too close. Widen the luminance steps.",
      role: "textMuted",
      hex: ensureContrast(map.textMuted.hex, map.background.hex, 4.5),
    });
  }
  if (!recs.length) {
    recs.push({
      id: "ok",
      title: "Color system looks consistent",
      detail: "Core pairs pass AA and hover/focus roles are present.",
    });
  }
  return recs;
}

export function searchColors(intent: CopilotIntent): ColorSearchHit[] {
  const hue = intent.primaryHue ?? (intent.seedPrimary ? hexToOklch(intent.seedPrimary).h : 250);
  const seed = intent.seedPrimary ?? intent.existingColors[0];
  const wantMuted = /muted|warm gray|grey|financial|bank/i.test(`${intent.style} ${intent.mood} ${intent.query ?? ""}`);
  const needWhiteText = /white text|on white|accessible dark/i.test(intent.query ?? "");
  const generated = Array.from({ length: 8 }, (_, i) => {
    const h = (hue + (i - 3) * 8 + 360) % 360;
    const c = wantMuted ? 0.04 + i * 0.008 : 0.09 + (i % 4) * 0.02;
    const l = needWhiteText ? 0.38 - i * 0.02 : 0.55 + (i % 5) * 0.04;
    return makeHex(clamp(l, 0.18, 0.92), c, h);
  });
  const named = CSS_NAMED_COLORS.map((c) => c.hex);
  const pool = [...generated, ...named];
  const scored = pool.map((hex) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const hueDist = Math.min(Math.abs(hsl.h - hue), 360 - Math.abs(hsl.h - hue));
    const sim = seed ? 100 - Math.min(100, colorDistance(seed, hex)) : Math.max(0, 100 - hueDist);
    return {
      name: CSS_NAMED_COLORS.find((c) => normalizeHex(c.hex) === hex)?.name ?? `Custom ${hex.toUpperCase()}`,
      hex,
      rgb,
      hsl,
      oklch: formatOklch(hexToOklch(hex)),
      similarity: Math.round(sim),
      contrastOnWhite: checkContrast(hex, "#ffffff"),
      contrastOnBlack: checkContrast(hex, "#000000"),
    } satisfies ColorSearchHit;
  });
  const filtered = needWhiteText
    ? scored.filter((c) => c.contrastOnWhite.normalAA)
    : scored;
  return filtered
    .sort((a, b) => b.similarity - a.similarity)
    .filter((c, i, arr) => arr.findIndex((x) => x.hex === c.hex) === i)
    .slice(0, intent.count ?? 8);
}

export function applyRecommendation(system: ColorSystem, rec: CopilotRecommendation): ColorSystem {
  if (!rec.hex) return system;
  if (rec.role) return applyManualHex(system, rec.role, rec.hex);
  return applyManualHex(system, "text", rec.hex);
}

export function shadeScaleFor(hex: string): ShadeScale {
  return oklchShadeScale(hex);
}

export function whyThisColor(token: ColorToken, intent: CopilotIntent): string {
  const industry = intent.industry && intent.industry !== "general" ? ` for ${intent.industry}` : "";
  const style = intent.style || "professional";
  return `${token.hex.toUpperCase()} — ${token.label}. Chosen as a ${style} ${token.label.toLowerCase()} color${industry}. ${token.purpose}`;
}
