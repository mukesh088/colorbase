import { describe, expect, it } from "vitest";
import { simulateColorBlind, simulateColorBlindRgb } from "@/lib/colors/convert";

describe("color blindness simulation severity", () => {
  it("leaves colors unchanged at 0% and applies the full matrix at 100%", () => {
    expect(simulateColorBlindRgb(239, 68, 68, "deuteranopia", 0)).toEqual([239, 68, 68]);
    expect(simulateColorBlind("#ef4444", "deuteranopia")).toBe(simulateColorBlind("#ef4444", "deuteranopia", 1));
    expect(simulateColorBlind("#ef4444", "achromatopsia")).toMatch(/^#([0-9a-f]{2})\1\1$/i);
  });

  it("moves partway at partial severity", () => {
    const [r] = simulateColorBlindRgb(239, 68, 68, "protanopia", 0.5);
    const [full] = simulateColorBlindRgb(239, 68, 68, "protanopia", 1);
    expect(r).toBeLessThan(239);
    expect(r).toBeGreaterThan(full);
  });
});
