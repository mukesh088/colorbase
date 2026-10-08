import { CSS_NAMED_COLORS, MATERIAL_COLORS, TAILWIND_COLORS, BOOTSTRAP_COLORS } from "@/lib/colors/palettes";
import { normalizeHex } from "@/lib/colors/convert";
import { deltaE2000Hex } from "@/lib/colors/spaces";
import { getColorsBySource, type ColorSource } from "@/lib/data/color-library";
import { FLAT_UI_COLORS } from "@/lib/data/color-codes/flat-ui";

export type AtlasToken = {
  token: string;
  hex: string;
  official: true;
};

export type AtlasSystemId =
  | "css"
  | "html"
  | "web-safe"
  | "tailwind"
  | "material"
  | "bootstrap"
  | "fluent"
  | "apple"
  | "android"
  | "radix"
  | "chakra"
  | "antd"
  | "primereact"
  | "flat-ui";

function fromShades(map: Record<string, Record<string, string>>, joiner = "-"): AtlasToken[] {
  return Object.entries(map).flatMap(([hue, shades]) =>
    Object.entries(shades).map(([step, hex]) => ({
      token: `${hue}${joiner}${step}`,
      hex: normalizeHex(hex),
      official: true as const,
    }))
  );
}

function fromLibrary(source: ColorSource): AtlasToken[] {
  return getColorsBySource(source).map((c) => ({
    token: c.shade ? `${c.name.replace(/\s+/g, "-")}-${c.shade}` : c.name,
    hex: normalizeHex(c.hex),
    official: true as const,
  }));
}

function webSafeTokens(): AtlasToken[] {
  const steps = [0, 51, 102, 153, 204, 255];
  const tokens: AtlasToken[] = [];
  for (const r of steps) {
    for (const g of steps) {
      for (const b of steps) {
        const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
        tokens.push({ token: hex.toUpperCase(), hex, official: true });
      }
    }
  }
  return tokens;
}

const CSS_TOKENS: AtlasToken[] = CSS_NAMED_COLORS.map((c) => ({
  token: c.name,
  hex: normalizeHex(c.hex),
  official: true as const,
}));

export const ATLAS_SYSTEMS: { id: AtlasSystemId; label: string; href: string; note: string }[] = [
  { id: "css", label: "CSS", href: "/colors/css", note: "Official CSS named color keywords" },
  { id: "html", label: "HTML", href: "/colors", note: "HTML uses the same named color keywords as CSS" },
  { id: "web-safe", label: "Web Safe", href: "/colors/web-safe", note: "Historical 216-color web-safe palette" },
  { id: "tailwind", label: "Tailwind", href: "/colors/tailwind", note: "Official Tailwind CSS 50–950 tokens" },
  { id: "material", label: "Material", href: "/colors/material", note: "Material Design shade tokens" },
  { id: "bootstrap", label: "Bootstrap", href: "/colors/bootstrap", note: "Bootstrap theme color tokens" },
  { id: "fluent", label: "Fluent", href: "/colors/kits/fluent", note: "Fluent / Windows reference swatches" },
  { id: "apple", label: "Apple", href: "/colors/kits/apple", note: "Apple system color reference" },
  { id: "android", label: "Android", href: "/colors/kits/android", note: "Android material-adjacent reference" },
  { id: "radix", label: "Radix", href: "/colors/radix", note: "Radix UI accent colors" },
  { id: "chakra", label: "Chakra", href: "/colors/kits/chakra", note: "Chakra UI palette tokens" },
  { id: "antd", label: "Ant Design", href: "/colors/kits/antd", note: "Ant Design token reference" },
  { id: "primereact", label: "PrimeReact", href: "/colors/kits/primereact", note: "PrimeReact theme tokens" },
  { id: "flat-ui", label: "Flat UI", href: "/colors/flat-ui", note: "Flat UI Original and American palettes" },
];

const TOKEN_CACHE: Partial<Record<AtlasSystemId, AtlasToken[]>> = {};

export function atlasTokens(id: AtlasSystemId): AtlasToken[] {
  if (TOKEN_CACHE[id]) return TOKEN_CACHE[id]!;
  let tokens: AtlasToken[] = [];
  switch (id) {
    case "css":
    case "html":
      tokens = CSS_TOKENS;
      break;
    case "web-safe":
      tokens = webSafeTokens();
      break;
    case "tailwind":
      tokens = fromShades(TAILWIND_COLORS);
      break;
    case "material":
      tokens = fromShades(MATERIAL_COLORS);
      break;
    case "bootstrap":
      tokens = Object.entries(BOOTSTRAP_COLORS).map(([token, hex]) => ({
        token,
        hex: normalizeHex(hex),
        official: true as const,
      }));
      break;
    case "fluent":
      tokens = fromLibrary("fluent");
      break;
    case "apple":
      tokens = fromLibrary("apple");
      break;
    case "android":
      tokens = fromLibrary("android");
      break;
    case "radix":
      tokens = fromLibrary("radix");
      break;
    case "chakra":
      tokens = fromLibrary("chakra");
      break;
    case "antd":
      tokens = fromLibrary("antd");
      break;
    case "primereact":
      tokens = fromLibrary("primereact");
      break;
    case "flat-ui":
      tokens = FLAT_UI_COLORS.map((c) => ({
        token: c.name,
        hex: c.hex,
        official: true as const,
      }));
      break;
  }
  TOKEN_CACHE[id] = tokens;
  return tokens;
}

export type AtlasMatch = {
  system: AtlasSystemId;
  label: string;
  token: string;
  hex: string;
  kind: "official" | "nearest";
  deltaE: number;
};

export function nearestInSystem(hex: string, id: AtlasSystemId): AtlasMatch {
  const n = normalizeHex(hex);
  const tokens = atlasTokens(id);
  let best = tokens[0]!;
  let bestD = Infinity;
  for (const token of tokens) {
    if (token.hex === n) {
      return {
        system: id,
        label: ATLAS_SYSTEMS.find((s) => s.id === id)?.label ?? id,
        token: token.token,
        hex: token.hex,
        kind: "official",
        deltaE: 0,
      };
    }
    const d = deltaE2000Hex(n, token.hex);
    if (d < bestD) {
      bestD = d;
      best = token;
    }
  }
  return {
    system: id,
    label: ATLAS_SYSTEMS.find((s) => s.id === id)?.label ?? id,
    token: best.token,
    hex: best.hex,
    kind: "nearest",
    deltaE: Math.round(bestD * 100) / 100,
  };
}

export function compareAcrossSystems(hex: string): AtlasMatch[] {
  return ATLAS_SYSTEMS.map((s) => nearestInSystem(hex, s.id));
}
