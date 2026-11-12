import { hexToHsl, hslToRgb, normalizeHex, rgbToHex, simulateColorBlind } from "@/lib/colors/convert";

export type ScaleKind = "sequential" | "diverging" | "categorical";
export type BreakMethod = "equal" | "quantile";
export type CvdMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

export type MapScalePreset = {
  id: string;
  label: string;
  blurb: string;
  kind: ScaleKind;
  low: string;
  mid?: string;
  high: string;
  seed?: string[];
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixHex(a: string, b: string, t: number) {
  const A = hexToHsl(a);
  const B = hexToHsl(b);
  let dh = B.h - A.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return rgbToHex(
    hslToRgb({
      h: (A.h + dh * t + 360) % 360,
      s: lerp(A.s, B.s, t),
      l: lerp(A.l, B.l, t),
    })
  );
}

export const MAP_SCALE_PRESETS: MapScalePreset[] = [
  {
    id: "blues",
    label: "Ocean blues",
    blurb: "Classic sequential for density / counts",
    kind: "sequential",
    low: "#dbeafe",
    high: "#1e3a8a",
  },
  {
    id: "teals",
    label: "Teal depth",
    blurb: "Calm sequential for dashboards",
    kind: "sequential",
    low: "#ccfbf1",
    high: "#115e59",
  },
  {
    id: "greens",
    label: "Forest greens",
    blurb: "Nature / environment metrics",
    kind: "sequential",
    low: "#dcfce7",
    high: "#14532d",
  },
  {
    id: "magma",
    label: "Heat magma",
    blurb: "High-energy sequential heat",
    kind: "sequential",
    low: "#fce7f3",
    high: "#701a75",
  },
  {
    id: "sunset",
    label: "Sunset",
    blurb: "Warm sequential for intensity",
    kind: "sequential",
    low: "#ffedd5",
    high: "#9a3412",
  },
  {
    id: "rdbu",
    label: "Red–blue diverge",
    blurb: "Above / below a midpoint",
    kind: "diverging",
    low: "#1d4ed8",
    mid: "#f8fafc",
    high: "#b91c1c",
  },
  {
    id: "puor",
    label: "Purple–orange",
    blurb: "CVD-friendlier diverge",
    kind: "diverging",
    low: "#6d28d9",
    mid: "#fafafa",
    high: "#c2410c",
  },
  {
    id: "brbg",
    label: "Brown–teal",
    blurb: "Earth-tone diverge",
    kind: "diverging",
    low: "#92400e",
    mid: "#f8fafc",
    high: "#0f766e",
  },
  {
    id: "regions",
    label: "Region set",
    blurb: "Named categories / districts",
    kind: "categorical",
    low: "#0ea5e9",
    high: "#e11d48",
    seed: ["#0ea5e9", "#22c55e", "#eab308", "#f97316", "#e11d48", "#8b5cf6", "#14b8a6", "#64748b", "#ec4899"],
  },
  {
    id: "soft-cat",
    label: "Soft categories",
    blurb: "Muted categorical labels",
    kind: "categorical",
    low: "#94a3b8",
    high: "#334155",
    seed: ["#7dd3fc", "#86efac", "#fde68a", "#fdba74", "#f9a8d4", "#c4b5fd", "#5eead4", "#cbd5e1", "#fda4af"],
  },
];

export function buildColorScale(
  kind: ScaleKind,
  stops: number,
  options?: { low?: string; mid?: string; high?: string; seed?: string[] }
): string[] {
  const n = Math.max(3, Math.min(12, stops));
  if (kind === "categorical") {
    const seed =
      options?.seed?.map(normalizeHex) ??
      ["#0ea5e9", "#22c55e", "#eab308", "#f97316", "#e11d48", "#8b5cf6", "#14b8a6", "#64748b", "#ec4899"];
    if (seed.length >= n) return seed.slice(0, n);
    const out = [...seed];
    while (out.length < n) {
      out.push(mixHex(seed[out.length % seed.length]!, seed[(out.length + 1) % seed.length]!, 0.35));
    }
    return out;
  }
  if (kind === "diverging") {
    const low = normalizeHex(options?.low ?? "#1d4ed8");
    const mid = normalizeHex(options?.mid ?? "#f8fafc");
    const high = normalizeHex(options?.high ?? "#b91c1c");
    return Array.from({ length: n }, (_, i) => {
      const t = i / Math.max(1, n - 1);
      if (t <= 0.5) return mixHex(low, mid, t / 0.5);
      return mixHex(mid, high, (t - 0.5) / 0.5);
    });
  }
  const low = normalizeHex(options?.low ?? "#eff6ff");
  const high = normalizeHex(options?.high ?? "#1e3a8a");
  return Array.from({ length: n }, (_, i) => mixHex(low, high, i / Math.max(1, n - 1)));
}

export function simulateScale(colors: string[], mode: Exclude<CvdMode, "none">) {
  return colors.map((hex) => simulateColorBlind(hex, mode));
}

/** Illustrative districts — synthetic, not real geography. */
export const SAMPLE_DISTRICTS = [
  { id: "nw", name: "Northwest", path: "M18,28 L95,18 L108,78 L28,92 Z", value: 18 },
  { id: "ne", name: "Northeast", path: "M95,18 L188,22 L200,70 L160,88 L108,78 Z", value: 42 },
  { id: "east", name: "East Bay", path: "M188,22 L248,48 L236,128 L200,70 Z", value: 61 },
  { id: "central", name: "Central", path: "M108,78 L160,88 L168,138 L95,148 L88,100 Z", value: 77 },
  { id: "west", name: "West Shore", path: "M28,92 L88,100 L95,148 L52,176 L16,118 Z", value: 33 },
  { id: "south", name: "South Park", path: "M95,148 L168,138 L186,188 L70,198 Z", value: 55 },
  { id: "se", name: "Southeast", path: "M168,138 L236,128 L242,186 L186,188 Z", value: 88 },
  { id: "sw", name: "Southwest", path: "M52,176 L70,198 L48,208 L22,182 Z", value: 12 },
] as const;

export function classIndex(value: number, breaks: number[]) {
  for (let i = 0; i < breaks.length; i++) {
    if (value <= breaks[i]!) return i;
  }
  return breaks.length;
}

export function equalBreaks(values: number[], classes: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / classes;
  return Array.from({ length: classes - 1 }, (_, i) => Number((min + step * (i + 1)).toFixed(2)));
}

export function quantileBreaks(values: number[], classes: number) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  return Array.from({ length: classes - 1 }, (_, i) => {
    const t = (i + 1) / classes;
    const idx = (sorted.length - 1) * t;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    const v = lo === hi ? sorted[lo]! : lerp(sorted[lo]!, sorted[hi]!, idx - lo);
    return Number(v.toFixed(2));
  });
}

export function classBreaks(values: number[], classes: number, method: BreakMethod) {
  return method === "quantile" ? quantileBreaks(values, classes) : equalBreaks(values, classes);
}

export function legendRanges(breaks: number[], values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const edges = [min, ...breaks, max];
  return Array.from({ length: edges.length - 1 }, (_, i) => ({
    from: Number(edges[i]!.toFixed(1)),
    to: Number(edges[i + 1]!.toFixed(1)),
  }));
}

export function scaleToCssVars(colors: string[], prefix = "map") {
  return `:root {\n${colors.map((hex, i) => `  --${prefix}-class-${i + 1}: ${hex};`).join("\n")}\n}`;
}

export function scaleToMapboxExpression(colors: string[], property = "value") {
  return [
    "interpolate",
    ["linear"],
    ["get", property],
    ...colors.flatMap((hex, i) => [i, hex]),
  ];
}

export function scaleToCsv(colors: string[], ranges: Array<{ from: number; to: number }>) {
  const rows = [["class", "from", "to", "hex"]];
  colors.forEach((hex, i) => {
    const range = ranges[i] ?? { from: i, to: i + 1 };
    rows.push([String(i + 1), String(range.from), String(range.to), hex]);
  });
  return rows.map((r) => r.join(",")).join("\n");
}
