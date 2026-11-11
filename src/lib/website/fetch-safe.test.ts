import { describe, expect, it } from "vitest";
import { validatePublicHttpUrl } from "@/lib/website/fetch-safe";

describe("validatePublicHttpUrl", () => {
  it("allows public https URLs", () => {
    const result = validatePublicHttpUrl("https://example.com/path");
    expect(result.ok).toBe(true);
  });

  it("blocks private and local targets", () => {
    for (const url of [
      "http://127.0.0.1/",
      "http://localhost:3000",
      "http://192.168.1.1/",
      "http://10.0.0.5/",
      "ftp://example.com/",
      "https://user:pass@example.com/",
    ]) {
      const result = validatePublicHttpUrl(url);
      expect(result.ok, url).toBe(false);
    }
  });
});
