import type { ExportFormat, PaletteColor } from "@/types/color";
import { downloadText } from "@/lib/utils";
import { hexToRgb, rgbToHsl } from "@/lib/colors/convert";

export function exportPalette(
  colors: PaletteColor[],
  format: ExportFormat,
  name = "palette"
) {
  const hexes = colors.map((c) => c.hex);

  switch (format) {
    case "json":
      downloadText(JSON.stringify({ name, colors }, null, 2), `${name}.json`, "application/json");
      break;
    case "css":
      downloadText(
        `:root {\n${hexes.map((h, i) => `  --color-${i + 1}: ${h};`).join("\n")}\n}\n`,
        `${name}.css`,
        "text/css"
      );
      break;
    case "scss":
      downloadText(
        hexes.map((h, i) => `$color-${i + 1}: ${h};`).join("\n") + "\n",
        `${name}.scss`,
        "text/x-scss"
      );
      break;
    case "tailwind":
      downloadText(
        `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${hexes
          .map((h, i) => `        'palette-${i + 1}': '${h}',`)
          .join("\n")}\n      },\n    },\n  },\n};\n`,
        `${name}.tailwind.js`,
        "text/javascript"
      );
      break;
    case "bootstrap":
      downloadText(
        hexes.map((h, i) => `$palette-${i + 1}: ${h};`).join("\n") + "\n",
        `${name}.bootstrap.scss`
      );
      break;
    case "android":
      downloadText(
        `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${hexes
          .map((h, i) => `    <color name="palette_${i + 1}">${h}</color>`)
          .join("\n")}\n</resources>\n`,
        `${name}.xml`,
        "application/xml"
      );
      break;
    case "swift":
      downloadText(
        hexes
          .map((h, i) => {
            const { r, g, b } = hexToRgb(h);
            return `static let palette${i + 1} = UIColor(red: ${(r / 255).toFixed(3)}, green: ${(g / 255).toFixed(3)}, blue: ${(b / 255).toFixed(3)}, alpha: 1.0)`;
          })
          .join("\n") + "\n",
        `${name}.swift`
      );
      break;
    case "flutter":
      downloadText(
        hexes
          .map((h, i) => `static const Color palette${i + 1} = Color(0xFF${h.slice(1).toUpperCase()});`)
          .join("\n") + "\n",
        `${name}.dart`
      );
      break;
    case "react-native":
      downloadText(
        `export const colors = {\n${hexes
          .map((h, i) => `  palette${i + 1}: '${h}',`)
          .join("\n")}\n};\n`,
        `${name}.ts`
      );
      break;
    case "figma":
      downloadText(
        JSON.stringify(
          {
            name,
            modes: {
              Default: Object.fromEntries(
                hexes.map((h, i) => [
                  `color/${i + 1}`,
                  (() => {
                    const { r, g, b } = hexToRgb(h);
                    return { r: r / 255, g: g / 255, b: b / 255, a: 1 };
                  })(),
                ])
              ),
            },
          },
          null,
          2
        ),
        `${name}.figma-tokens.json`,
        "application/json"
      );
      break;
    case "svg": {
      const width = hexes.length * 80;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="120">${hexes
        .map(
          (h, i) =>
            `<rect x="${i * 80}" y="0" width="80" height="120" fill="${h}"/><text x="${i * 80 + 40}" y="110" text-anchor="middle" fill="${isDark(h) ? "#fff" : "#000"}" font-size="10" font-family="sans-serif">${h}</text>`
        )
        .join("")}</svg>`;
      downloadText(svg, `${name}.svg`, "image/svg+xml");
      break;
    }
    case "png":
    case "pdf":
    case "ase":
      // Client-side canvas/PDF handled by dedicated helpers when needed
      downloadText(
        JSON.stringify({ name, colors: hexes, format }),
        `${name}.${format === "ase" ? "json" : format}`,
        "application/json"
      );
      break;
    default:
      break;
  }
}

function isDark(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export function paletteToCssVariables(colors: PaletteColor[]) {
  return colors
    .map((c, i) => {
      const rgb = hexToRgb(c.hex);
      const hsl = rgbToHsl(rgb);
      return [
        `  --color-${i + 1}: ${c.hex};`,
        `  --color-${i + 1}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};`,
        `  --color-${i + 1}-hsl: ${hsl.h}, ${hsl.s}%, ${hsl.l}%;`,
      ].join("\n");
    })
    .join("\n");
}
