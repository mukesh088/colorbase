import { analyzeColor } from "@/lib/colors/spaces";
import { normalizeHex } from "@/lib/colors/convert";

export type CodeFormat =
  | "css"
  | "scss"
  | "less"
  | "stylus"
  | "tailwind"
  | "bootstrap"
  | "mui"
  | "chakra"
  | "react"
  | "react-native"
  | "flutter"
  | "swiftui"
  | "android"
  | "json"
  | "yaml";

export const CODE_FORMATS: { slug: CodeFormat; title: string; description: string }[] = [
  { slug: "css", title: "CSS", description: "CSS custom properties and utility declarations." },
  { slug: "scss", title: "SCSS", description: "Sass variables and maps for design tokens." },
  { slug: "less", title: "LESS", description: "LESS variables for stylesheet systems." },
  { slug: "stylus", title: "Stylus", description: "Stylus variables for expressive CSS." },
  { slug: "tailwind", title: "Tailwind", description: "Tailwind theme extension snippets." },
  { slug: "bootstrap", title: "Bootstrap", description: "Bootstrap SCSS variable overrides." },
  { slug: "mui", title: "Material UI", description: "MUI palette object for createTheme." },
  { slug: "chakra", title: "Chakra UI", description: "Chakra theme color tokens." },
  { slug: "react", title: "React", description: "React theme constants and CSS-in-JS objects." },
  { slug: "react-native", title: "React Native", description: "React Native StyleSheet color map." },
  { slug: "flutter", title: "Flutter", description: "Flutter Color constants." },
  { slug: "swiftui", title: "SwiftUI", description: "SwiftUI Color extensions." },
  { slug: "android", title: "Android XML", description: "Android colors.xml resources." },
  { slug: "json", title: "JSON", description: "Portable JSON design tokens." },
  { slug: "yaml", title: "YAML", description: "YAML tokens for pipelines and configs." },
];

export function generateCode(colors: string[], format: CodeFormat, name = "brand") {
  const hexes = colors.map((c) => normalizeHex(c));
  const analyzed = hexes.map((hex) => analyzeColor(hex));

  switch (format) {
    case "css":
      return `:root {\n${analyzed.map((c, i) => `  --${name}-${i + 1}: ${c.hex};`).join("\n")}\n}`;
    case "scss":
      return analyzed.map((c, i) => `$${name}-${i + 1}: ${c.hex};`).join("\n");
    case "less":
      return analyzed.map((c, i) => `@${name}-${i + 1}: ${c.hex};`).join("\n");
    case "stylus":
      return analyzed.map((c, i) => `${name}-${i + 1} = ${c.hex}`).join("\n");
    case "tailwind":
      return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${analyzed
        .map((c, i) => `        '${name}-${i + 1}': '${c.hex}',`)
        .join("\n")}\n      }\n    }\n  }\n}`;
    case "bootstrap":
      return analyzed.map((c, i) => `$${name}-${i + 1}: ${c.hex};`).join("\n");
    case "mui":
      return `const ${name}Palette = {\n${analyzed
        .map((c, i) => `  color${i + 1}: '${c.hex}',`)
        .join("\n")}\n};`;
    case "chakra":
      return `const colors = {\n  ${name}: {\n${analyzed
        .map((c, i) => `    ${(i + 1) * 100}: '${c.hex}',`)
        .join("\n")}\n  }\n}`;
    case "react":
      return `export const ${name}Colors = {\n${analyzed
        .map((c, i) => `  color${i + 1}: '${c.hex}',`)
        .join("\n")}\n} as const;`;
    case "react-native":
      return `export const colors = {\n${analyzed
        .map((c, i) => `  ${name}${i + 1}: '${c.hex}',`)
        .join("\n")}\n};`;
    case "flutter":
      return analyzed
        .map((c, i) => `static const Color ${name}${i + 1} = Color(0xFF${c.hex.slice(1).toUpperCase()});`)
        .join("\n");
    case "swiftui":
      return analyzed
        .map((c, i) => {
          const { r, g, b } = c.rgb;
          return `static let ${name}${i + 1} = Color(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)})`;
        })
        .join("\n");
    case "android":
      return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${analyzed
        .map((c, i) => `  <color name="${name}_${i + 1}">${c.hex}</color>`)
        .join("\n")}\n</resources>`;
    case "json":
      return JSON.stringify(
        {
          name,
          colors: analyzed.map((c, i) => ({
            id: `${name}-${i + 1}`,
            hex: c.hex,
            rgb: c.rgb,
            hsl: c.hsl,
            oklch: c.oklch,
          })),
        },
        null,
        2
      );
    case "yaml":
      return `name: ${name}\ncolors:\n${analyzed
        .map((c, i) => `  - id: ${name}-${i + 1}\n    hex: '${c.hex}'`)
        .join("\n")}`;
    default:
      return "";
  }
}
