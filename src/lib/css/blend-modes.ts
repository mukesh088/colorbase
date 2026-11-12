export const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

export type BlendMode = (typeof BLEND_MODES)[number];
export type BlendKind = "mix" | "background";
export type BlendScene = "solids" | "photo" | "mesh" | "stripes" | "type";
export type BlendShape = "full" | "orbits" | "split" | "diamond";

export type BlendModeMeta = {
  id: BlendMode;
  group: "basic" | "darken" | "lighten" | "contrast" | "inversion" | "component";
  blurb: string;
  tip: string;
};

export const BLEND_MODE_META: BlendModeMeta[] = [
  {
    id: "normal",
    group: "basic",
    blurb: "No blending — top layer covers the base.",
    tip: "Use as a reset when comparing modes.",
  },
  {
    id: "multiply",
    group: "darken",
    blurb: "Multiplies channels — great for shadows and print-like overlays.",
    tip: "White disappears; darks deepen. Classic for photo filters.",
  },
  {
    id: "darken",
    group: "darken",
    blurb: "Keeps the darker channel of each pair.",
    tip: "Safer than multiply when you only want selective darkening.",
  },
  {
    id: "color-burn",
    group: "darken",
    blurb: "Burns base into the blend — high-contrast darks.",
    tip: "Can clip to black quickly; dial opacity down.",
  },
  {
    id: "screen",
    group: "lighten",
    blurb: "Inverse of multiply — lightens like a projector.",
    tip: "Black disappears; good for glow and light leaks.",
  },
  {
    id: "lighten",
    group: "lighten",
    blurb: "Keeps the lighter channel of each pair.",
    tip: "Use for soft highlights without the screen glow.",
  },
  {
    id: "color-dodge",
    group: "lighten",
    blurb: "Brightens base toward the blend color aggressively.",
    tip: "Easy to blow out whites — lower opacity.",
  },
  {
    id: "overlay",
    group: "contrast",
    blurb: "Multiply on darks, screen on lights — punchy contrast.",
    tip: "Go-to for branded photo color washes.",
  },
  {
    id: "soft-light",
    group: "contrast",
    blurb: "Gentle contrast like a soft spotlight.",
    tip: "More natural than overlay for UI washes.",
  },
  {
    id: "hard-light",
    group: "contrast",
    blurb: "Stronger overlay — vivid, graphic looks.",
    tip: "Pair with muted brand colors to avoid neon blowouts.",
  },
  {
    id: "difference",
    group: "inversion",
    blurb: "Absolute channel difference — psychedelic inversions.",
    tip: "Great for experimental hero art; rare in product UI.",
  },
  {
    id: "exclusion",
    group: "inversion",
    blurb: "Softer cousin of difference.",
    tip: "Less extreme than difference for dual-tone art.",
  },
  {
    id: "hue",
    group: "component",
    blurb: "Takes hue from the blend, keeps base sat/luma.",
    tip: "Recolor photos while preserving texture.",
  },
  {
    id: "saturation",
    group: "component",
    blurb: "Takes saturation from the blend layer.",
    tip: "Desaturate or punch chroma without shifting hue.",
  },
  {
    id: "color",
    group: "component",
    blurb: "Hue + saturation from blend, luma from base.",
    tip: "Best all-around recolor mode for brand tints.",
  },
  {
    id: "luminosity",
    group: "component",
    blurb: "Luma from blend, hue/sat from base.",
    tip: "Useful for luminance masks and duotone setups.",
  },
];

export const BLEND_GROUPS = [
  { id: "basic", label: "Basic" },
  { id: "darken", label: "Darken" },
  { id: "lighten", label: "Lighten" },
  { id: "contrast", label: "Contrast" },
  { id: "inversion", label: "Inversion" },
  { id: "component", label: "HSL components" },
] as const;

export type BlendPreset = {
  id: string;
  label: string;
  blurb: string;
  a: string;
  b: string;
  mode: BlendMode;
  kind: BlendKind;
  opacity: number;
  scene: BlendScene;
};

export const BLEND_PRESETS: BlendPreset[] = [
  {
    id: "brand-wash",
    label: "Brand wash",
    blurb: "Rose over navy with multiply",
    a: "#e11d48",
    b: "#1e3a8a",
    mode: "multiply",
    kind: "mix",
    opacity: 0.72,
    scene: "photo",
  },
  {
    id: "soft-glow",
    label: "Soft glow",
    blurb: "Screen light leak",
    a: "#fb7185",
    b: "#0f172a",
    mode: "screen",
    kind: "mix",
    opacity: 0.65,
    scene: "mesh",
  },
  {
    id: "print-ink",
    label: "Print ink",
    blurb: "Ink-on-paper multiply",
    a: "#0f172a",
    b: "#f8fafc",
    mode: "multiply",
    kind: "background",
    opacity: 1,
    scene: "solids",
  },
  {
    id: "duotone",
    label: "Duotone",
    blurb: "Color mode brand tint",
    a: "#be123c",
    b: "#334155",
    mode: "color",
    kind: "mix",
    opacity: 0.9,
    scene: "photo",
  },
  {
    id: "neon-diff",
    label: "Neon difference",
    blurb: "Graphic inversion art",
    a: "#22d3ee",
    b: "#e11d48",
    mode: "difference",
    kind: "mix",
    opacity: 1,
    scene: "mesh",
  },
  {
    id: "overlay-punch",
    label: "Overlay punch",
    blurb: "High-contrast brand wash",
    a: "#f59e0b",
    b: "#1d4ed8",
    mode: "overlay",
    kind: "background",
    opacity: 1,
    scene: "stripes",
  },
  {
    id: "type-knockout",
    label: "Type knockout",
    blurb: "Headline through photo",
    a: "#ffffff",
    b: "#0f172a",
    mode: "difference",
    kind: "mix",
    opacity: 1,
    scene: "type",
  },
  {
    id: "soft-ui",
    label: "Soft UI wash",
    blurb: "Gentle soft-light tint",
    a: "#fda4af",
    b: "#e2e8f0",
    mode: "soft-light",
    kind: "mix",
    opacity: 0.8,
    scene: "mesh",
  },
];

export function getBlendMeta(mode: BlendMode): BlendModeMeta {
  return BLEND_MODE_META.find((m) => m.id === mode) ?? BLEND_MODE_META[0]!;
}

export function sceneBackground(scene: BlendScene, base: string): string {
  switch (scene) {
    case "photo":
      return `
        linear-gradient(135deg, color-mix(in oklab, ${base} 70%, #0f172a), ${base}),
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), transparent 42%),
        radial-gradient(circle at 80% 70%, rgba(0,0,0,0.35), transparent 45%),
        repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 8px, transparent 8px 16px)
      `;
    case "mesh":
      return `
        radial-gradient(ellipse at 15% 20%, #fb7185, transparent 45%),
        radial-gradient(ellipse at 85% 15%, #38bdf8, transparent 42%),
        radial-gradient(ellipse at 50% 85%, #a78bfa, transparent 48%),
        linear-gradient(160deg, ${base}, color-mix(in oklab, ${base} 55%, #0f172a))
      `;
    case "stripes":
      return `
        repeating-linear-gradient(
          -18deg,
          ${base} 0 14px,
          color-mix(in oklab, ${base} 70%, white) 14px 28px
        )
      `;
    case "type":
      return `
        linear-gradient(180deg, color-mix(in oklab, ${base} 85%, black), ${base}),
        radial-gradient(circle at 50% 40%, rgba(255,255,255,0.2), transparent 55%)
      `;
    default:
      return base;
  }
}

export function buildBlendCss(options: {
  kind: BlendKind;
  mode: BlendMode;
  a: string;
  b: string;
  opacity: number;
  isolate: boolean;
  scene: BlendScene;
}): string {
  const { kind, mode, a, b, opacity, isolate, scene } = options;
  const isolation = isolate ? "\n  isolation: isolate;" : "";

  if (kind === "background") {
    return `.blend-stage {${isolation}
  background-image:
    linear-gradient(${a}, ${a}),
    ${scene === "solids" ? `linear-gradient(${b}, ${b})` : sceneBackground(scene, b)};
  background-blend-mode: ${mode};
  background-size: cover;
  background-position: center;
}`;
  }

  return `.blend-stage {${isolation}
  position: relative;
  background: ${scene === "solids" ? b : sceneBackground(scene, b)};
  background-size: cover;
}
.blend-layer {
  position: absolute;
  inset: 0;
  background: ${a};
  mix-blend-mode: ${mode};
  opacity: ${opacity};
}`;
}
