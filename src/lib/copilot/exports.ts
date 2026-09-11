import type { ColorSystem } from "@/lib/copilot/types";
import { tokenMap } from "@/lib/copilot/types";
import { SHADE_STEPS } from "@/lib/colors/oklch";
import { checkContrast } from "@/lib/colors/convert";

export type SemanticExportFormat =
  | "css"
  | "scss"
  | "tailwind"
  | "json"
  | "js"
  | "ts"
  | "react"
  | "flutter";

function tokenLines(system: ColorSystem) {
  return system.tokens.map((t) => ({
    key: t.role.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
    camel: t.role,
    hex: t.hex,
    label: t.label,
  }));
}

export function exportSemanticSystem(system: ColorSystem, format: SemanticExportFormat): string {
  const rows = tokenLines(system);
  switch (format) {
    case "css":
      return `:root {\n${rows.map((r) => `  --color-${r.key}: ${r.hex};`).join("\n")}\n}`;
    case "scss":
      return rows.map((r) => `$color-${r.key}: ${r.hex};`).join("\n");
    case "tailwind":
      return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${rows
        .map((r) => `        ${r.camel}: '${r.hex}',`)
        .join("\n")}\n      }\n    }\n  }\n};`;
    case "json":
      return JSON.stringify(
        {
          theme: system.theme,
          colors: Object.fromEntries(system.tokens.map((t) => [t.role, { hex: t.hex, rgb: t.rgb, hsl: t.hsl, oklch: t.oklch }])),
          shades: system.shades,
        },
        null,
        2
      );
    case "js":
      return `export const colors = {\n${rows.map((r) => `  ${r.camel}: '${r.hex}',`).join("\n")}\n};\n`;
    case "ts":
      return `export const colors = {\n${rows.map((r) => `  ${r.camel}: '${r.hex}',`).join("\n")}\n} as const;\n\nexport type ColorToken = keyof typeof colors;\n`;
    case "react":
      return `export const theme = {\n  colors: {\n${rows.map((r) => `    ${r.camel}: '${r.hex}',`).join("\n")}\n  },\n} as const;\n`;
    case "flutter":
      return rows
        .map((r) => `static const Color ${r.camel} = Color(0xFF${r.hex.slice(1).toUpperCase()});`)
        .join("\n");
    default:
      return "";
  }
}

export function exportShadeTailwind(system: ColorSystem) {
  const block = (name: string, scale: ColorSystem["shades"]["primary"]) =>
    `        ${name}: {\n${SHADE_STEPS.map((step) => `          ${step}: '${scale[step]}',`).join("\n")}\n        }`;
  return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${block("primary", system.shades.primary)},\n${block("secondary", system.shades.secondary)},\n${block("accent", system.shades.accent)}\n      }\n    }\n  }\n};`;
}

export function copyForAi(system: ColorSystem, explanation: string, locked: string[]): string {
  const map = tokenMap(system);
  const textBg = checkContrast(map.text.hex, map.background.hex);
  const primaryBg = checkContrast(map.primary.hex, map.background.hex);
  const lines = system.tokens.map((t) => `${t.label}: ${t.hex.toUpperCase()}${t.locked ? " (locked)" : ""}`);
  return `COLOR SYSTEM
${explanation}

${lines.join("\n")}

Accessibility:
Text on background: ${textBg.ratio}:1 ${textBg.normalAAA ? "WCAG AAA" : textBg.normalAA ? "WCAG AA" : "Fail"}
Primary on background: ${primaryBg.ratio}:1 ${primaryBg.normalAAA ? "WCAG AAA" : primaryBg.normalAA ? "WCAG AA" : "AA Large / check"}

Rules:
- Use primary for primary actions.
- Use primary-hover for hover states.
- Use muted text for secondary information.
- Maintain WCAG AA minimum contrast.
- Do not modify locked colors${locked.length ? `: ${locked.join(", ")}` : ""}.
- Keep semantic roles; do not flatten this into a random 5-color palette.`;
}

export const EXPORT_FORMATS: { id: SemanticExportFormat; label: string; filename: string }[] = [
  { id: "css", label: "CSS", filename: "colors.css" },
  { id: "tailwind", label: "Tailwind", filename: "tailwind.colors.js" },
  { id: "scss", label: "SCSS", filename: "_colors.scss" },
  { id: "json", label: "JSON", filename: "tokens.json" },
  { id: "js", label: "JavaScript", filename: "colors.js" },
  { id: "ts", label: "TypeScript", filename: "colors.ts" },
  { id: "react", label: "React", filename: "theme.ts" },
  { id: "flutter", label: "Flutter", filename: "colors.dart" },
];
