import { describe, expect, it } from "vitest";
import {
  applyCvdToRoles,
  auditPresentationTheme,
  buildPresentationTheme,
  pickOnColor,
  themeToCssVars,
  themeToTokenJson,
} from "./theme";

describe("presentation theme", () => {
  it("builds light roles with readable title ink", () => {
    const roles = buildPresentationTheme({
      primary: "#1d4ed8",
      secondary: "#0f172a",
      mode: "light",
      harmony: "analogous",
    });
    expect(roles.surface).toBe("#ffffff");
    expect(roles.accent).toBe("#1d4ed8");
    expect(roles.charts).toHaveLength(5);
    const audit = auditPresentationTheme(roles);
    expect(audit.find((a) => a.id === "title")?.aa).toBe(true);
    expect(audit.find((a) => a.id === "cta")?.aaLarge).toBe(true);
  });

  it("builds dark surfaces and exports css/json", () => {
    const roles = buildPresentationTheme({
      primary: "#7c3aed",
      secondary: "#1e1b4b",
      mode: "dark",
      harmony: "triadic",
    });
    expect(roles.surface).toBe("#0b1020");
    expect(pickOnColor(roles.accent)).toMatch(/^#/);
    const css = themeToCssVars(roles);
    expect(css).toContain("--deck-accent:");
    expect(css).toContain("--deck-chart-5:");
    const json = themeToTokenJson({
      name: "Test",
      mode: "dark",
      harmony: "triadic",
      aspect: "widescreen",
      title: "Q4",
      subtitle: "Update",
      roles,
      audit: auditPresentationTheme(roles),
    });
    expect(json.colors.charts).toHaveLength(5);
    expect(json.contrast.length).toBeGreaterThan(3);
  });

  it("simulates CVD without mutating original accent identity blindly", () => {
    const roles = buildPresentationTheme({
      primary: "#e11d48",
      secondary: "#18181b",
      mode: "light",
      harmony: "complementary",
    });
    const cvd = applyCvdToRoles(roles, "deuteranopia");
    expect(cvd.accent).not.toBe(roles.accent);
    expect(applyCvdToRoles(roles, "none").accent).toBe(roles.accent);
  });
});
