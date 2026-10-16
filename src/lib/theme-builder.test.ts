import { describe, expect, it } from "vitest";
import {
  buildThemeSystems,
  decodeThemeProject,
  encodeThemeProject,
  newThemeProject,
  parseThemeProject,
  readableInk,
  repairThemeText,
  themeTextPairs,
} from "@/lib/theme-builder";
import { tokenMap } from "@/lib/copilot/types";
import { exportTheme, THEME_EXPORTS } from "@/lib/theme-exports";
import { getContrastRatio } from "@/lib/colors/convert";
import { compile } from "@tailwindcss/node";

describe("theme projects", () => {
  it("preserves exact brand seeds and applies overrides only to their mode", () => {
    const project = newThemeProject();
    project.primary = "#fefefe";
    project.overrides.light.background = "#123456";
    const systems = buildThemeSystems(project);
    for (const mode of ["light", "dark"] as const) {
      expect(tokenMap(systems[mode]).primary.hex).toBe("#fefefe");
      expect(tokenMap(systems[mode]).secondary.hex).toBe(project.secondary);
    }
    expect(tokenMap(systems.light).background.hex).toBe("#123456");
    expect(tokenMap(systems.dark).background.hex).not.toBe("#123456");
  });

  it("round-trips names and overrides in share links including Unicode", () => {
    const project = { ...newThemeProject(), name: "Studio 🌿 / रंग" };
    project.overrides.dark.surface = "#123456";
    expect(decodeThemeProject(encodeThemeProject(project))).toEqual(project);
  });

  it("rejects malformed, unsupported, and oversized shared projects", () => {
    expect(decodeThemeProject("!not-base64!")).toBeNull();
    expect(decodeThemeProject("a".repeat(14001))).toBeNull();
    for (const patch of [
      { version: 2 },
      { primary: "red" },
      { primary: "#123456ff" },
      { template: "injected" },
      { overrides: { light: { unknown: "#fff" }, dark: {} } },
    ]) {
      expect(parseThemeProject({ ...newThemeProject(), ...patch })).toBeNull();
    }
    expect(parseThemeProject(null)).toBeNull();
  });

  it("repairs compatible text surfaces at the raw threshold without altering brand colors", () => {
    const project = newThemeProject();
    project.overrides.light.text = "#eeeeee";
    project.overrides.light.textMuted = "#dddddd";
    const repaired = repairThemeText(project, 7);
    expect(repaired.primary).toBe(project.primary);
    for (const system of Object.values(buildThemeSystems(repaired))) {
      for (const pair of themeTextPairs(system).filter((pair) => pair.role))
        expect(getContrastRatio(pair.fg, pair.bg)).toBeGreaterThanOrEqual(7);
    }
    expect(project.overrides.light.text).toBe("#eeeeee");
  });

  it("does not invent a passing solution for incompatible surfaces", () => {
    const project = newThemeProject();
    project.overrides.light.background = "#000000";
    project.overrides.light.surface = "#ffffff";
    const system = buildThemeSystems(repairThemeText(project, 7)).light;
    const pairs = themeTextPairs(system).filter((pair) => pair.role === "text");
    expect(pairs.some((pair) => getContrastRatio(pair.fg, pair.bg) < 7)).toBe(true);
  });

  it("chooses readable button labels across the sRGB luminance range", () => {
    for (let value = 0; value <= 255; value += 5) {
      const hex = `#${value.toString(16).padStart(2, "0").repeat(3)}`;
      expect(getContrastRatio(readableInk(hex), hex)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("theme exports", () => {
  const project = newThemeProject();
  const systems = buildThemeSystems(project);
  it("includes both modes and semantic shadcn sidebar, chart, and foreground tokens", () => {
    const css = exportTheme(project, systems, "shadcn");
    for (const value of [
      ".dark {",
      "--sidebar-ring:",
      "--chart-5:",
      "--primary-foreground:",
      "--color-sidebar-ring:",
      "@theme inline",
      "@custom-variant dark",
    ])
      expect(css).toContain(value);
    expect(css).not.toContain("undefined");
  });

  it("compiles framework exports into actual Tailwind v4 utilities", async () => {
    for (const format of ["tailwind", "shadcn"] as const) {
      const compiler = await compile(exportTheme(project, systems, format), {
        base: process.cwd(),
        onDependency: () => {},
      });
      const css = compiler.build([
        "bg-primary",
        "dark:bg-background",
        format === "shadcn" ? "text-primary-foreground" : "text-text",
      ]);
      expect(css).toContain(".bg-primary");
      expect(css).toContain("var(--primary)");
      expect(css).toContain(".dark");
    }
  });

  it("exports structured light/dark tokens and nonempty files for every format", () => {
    const json = JSON.parse(exportTheme(project, systems, "json"));
    expect(json.modes.light.primary.$value).toBe(project.primary);
    expect(json.modes.dark.primary.$type).toBe("color");
    for (const format of THEME_EXPORTS)
      expect(exportTheme(project, systems, format.id).length).toBeGreaterThan(100);
  });

  it("escapes user names in the working HTML demo", () => {
    const html = exportTheme(
      { ...project, name: '</title><script>alert("x")</script>' },
      systems,
      "html"
    );
    expect(html).not.toContain('</title><script>alert("x")</script>');
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("classList.toggle('dark')");
    expect(html).toContain("--primary-foreground:");
  });
});
