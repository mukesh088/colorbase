import { describe, expect, it } from "vitest";
import { softProofRgb } from "@/lib/print/cmyk-softproof";

describe("softProofRgb", () => {
  it("returns cmyk percentages and a proof hex", () => {
    const result = softProofRgb("#1d4ed8", "coated-fogra39-approx");
    expect(result.proof).toMatch(/^#[0-9a-f]{6}$/);
    expect(result.cmyk.k).toBeGreaterThanOrEqual(0);
    expect(result.disclaimer.toLowerCase()).toContain("approximate");
  });
});
