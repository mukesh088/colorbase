import { tokenMap, type ColorSystem } from "@/lib/copilot/types";
import { readableInk, type ThemeProject } from "@/lib/theme-builder";
import { formatOklch } from "@/lib/colors/spaces";
import { hexToOklch } from "@/lib/colors/oklch";

export type ThemeExportFormat = "shadcn" | "tailwind" | "css" | "json" | "html";
export const THEME_EXPORTS: { id: ThemeExportFormat; label: string; filename: string }[] = [
  { id: "shadcn", label: "shadcn/ui", filename: "theme.css" },
  { id: "tailwind", label: "Tailwind v4", filename: "theme.css" },
  { id: "css", label: "CSS variables", filename: "theme.css" },
  { id: "json", label: "Design tokens", filename: "theme.json" },
  { id: "html", label: "Working HTML demo", filename: "theme-preview.html" },
];

function uiVariables(system: ColorSystem): Record<string, string> {
  const t = tokenMap(system);
  return {
    background: t.background.hex,
    foreground: t.text.hex,
    card: t.surface.hex,
    "card-foreground": t.text.hex,
    popover: t.surfaceElevated.hex,
    "popover-foreground": t.text.hex,
    primary: t.primary.hex,
    "primary-foreground": readableInk(t.primary.hex),
    secondary: t.secondary.hex,
    "secondary-foreground": readableInk(t.secondary.hex),
    muted: t.backgroundSecondary.hex,
    "muted-foreground": t.textMuted.hex,
    accent: t.primaryLight.hex,
    "accent-foreground": readableInk(t.primaryLight.hex),
    destructive: t.error.hex,
    "destructive-foreground": readableInk(t.error.hex),
    border: t.border.hex,
    input: t.borderStrong.hex,
    ring: t.focus.hex,
    "chart-1": t.primary.hex,
    "chart-2": t.secondary.hex,
    "chart-3": t.accent.hex,
    "chart-4": t.success.hex,
    "chart-5": t.warning.hex,
    sidebar: t.backgroundSecondary.hex,
    "sidebar-foreground": t.text.hex,
    "sidebar-primary": t.primary.hex,
    "sidebar-primary-foreground": readableInk(t.primary.hex),
    "sidebar-accent": t.primaryLight.hex,
    "sidebar-accent-foreground": readableInk(t.primaryLight.hex),
    "sidebar-border": t.border.hex,
    "sidebar-ring": t.focus.hex,
  };
}

function block(selector: string, variables: Record<string, string>, oklch = false) {
  return `${selector} {\n${Object.entries(variables)
    .map(([name, hex]) => `  --${name}: ${oklch ? formatOklch(hexToOklch(hex)) : hex};`)
    .join("\n")}\n}`;
}

export function exportTheme(
  project: ThemeProject,
  systems: Record<"light" | "dark", ColorSystem>,
  format: ThemeExportFormat
): string {
  const light = uiVariables(systems.light);
  const dark = uiVariables(systems.dark);
  if (format === "json") {
    return JSON.stringify(
      {
        name: project.name,
        modes: Object.fromEntries(
          Object.entries(systems).map(([mode, system]) => [
            mode,
            Object.fromEntries(
              system.tokens.map((token) => [token.role, { $type: "color", $value: token.hex }])
            ),
          ])
        ),
      },
      null,
      2
    );
  }
  if (format === "shadcn" || format === "tailwind") {
    const variables =
      format === "shadcn"
        ? light
        : Object.fromEntries(
            systems.light.tokens.map((token) => [
              token.role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
              token.hex,
            ])
          );
    const darkVariables =
      format === "shadcn"
        ? dark
        : Object.fromEntries(
            systems.dark.tokens.map((token) => [
              token.role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
              token.hex,
            ])
          );
    return `/* Tailwind CSS v4${format === "shadcn" ? " / shadcn/ui" : ""}. Merge into your existing global stylesheet. */\n@import "tailwindcss";\n\n@custom-variant dark (&:where(.dark, .dark *));\n\n${block(":root", variables, true)}\n\n${block(".dark", darkVariables, true)}\n\n:root { --radius: 0.75rem; }\n\n@theme inline {\n${Object.keys(
      variables
    )
      .map((key) => `  --color-${key}: var(--${key});`)
      .join(
        "\n"
      )}\n  --radius-sm: calc(var(--radius) - 4px);\n  --radius-md: calc(var(--radius) - 2px);\n  --radius-lg: var(--radius);\n  --radius-xl: calc(var(--radius) + 4px);\n}\n`;
  }
  if (format === "css")
    return `/* Add .dark to the root element to switch modes. */\n${block(":root", light)}\n\n${block(".dark", dark)}\n`;
  const escapedName = project.name.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!
  );
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapedName} — ColorBase preview</title><style>\n${block(":root", light)}\n${block(".dark", dark)}\n*{box-sizing:border-box}body{margin:0;padding:32px;font:16px/1.6 system-ui;background:var(--background);color:var(--foreground)}main{max-width:960px;margin:auto}header{display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:1px solid var(--border);padding-bottom:24px}button{cursor:pointer;border:1px solid var(--border);border-radius:10px;padding:12px 18px;background:var(--primary);color:var(--primary-foreground);font:inherit}button:focus-visible{outline:3px solid var(--ring);outline-offset:3px}.hero{padding:64px 0}h1{font-size:clamp(32px,6vw,56px);letter-spacing:-.05em;line-height:1.1}p{max-width:540px}.muted{color:var(--muted-foreground)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}.card{background:var(--card);color:var(--card-foreground);border:1px solid var(--border);padding:24px;border-radius:16px}a{color:var(--foreground)}\n</style></head><body><main><header><strong>${escapedName}</strong><button id="toggle" type="button" aria-pressed="false">Toggle dark mode</button></header><section class="hero"><p class="muted">YOUR NEXT GREAT IDEA</p><h1>A considered palette.<br>A clearer experience.</h1><p class="muted">This working sample uses your exported light and dark theme tokens. Replace the content and make it yours.</p><a href="#components">Explore components ↓</a></section><div id="components" class="grid"><article class="card"><p class="muted">PROJECTS</p><h2>24 active</h2><p>A surface for your most useful work.</p></article><article class="card"><p class="muted">YOUR THEME</p><h2>Ready to build</h2><p>Semantic colors for a consistent interface.</p></article></div></main><script>document.getElementById('toggle').addEventListener('click',function(){this.setAttribute('aria-pressed',String(document.documentElement.classList.toggle('dark')))});</script></body></html>`;
}
