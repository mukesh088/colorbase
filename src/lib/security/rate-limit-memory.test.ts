import { describe, expect, it } from "vitest";
import { allowRequest } from "@/lib/security/rate-limit-memory";

describe("allowRequest", () => {
  it("allows traffic under the max and blocks after", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    expect(allowRequest(key, { windowMs: 60_000, max: 2 })).toBe(true);
    expect(allowRequest(key, { windowMs: 60_000, max: 2 })).toBe(true);
    expect(allowRequest(key, { windowMs: 60_000, max: 2 })).toBe(false);
  });
});
