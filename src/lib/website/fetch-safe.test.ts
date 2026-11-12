import { describe, expect, it } from "vitest";
import { isBlockedIp, validatePublicHttpUrl } from "@/lib/website/fetch-safe";

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
      "http://169.254.169.254/",
      "http://100.64.1.2/",
      "ftp://example.com/",
      "https://user:pass@example.com/",
    ]) {
      const result = validatePublicHttpUrl(url);
      expect(result.ok, url).toBe(false);
    }
  });
});

describe("isBlockedIp", () => {
  it("flags loopback and RFC1918 ranges", () => {
    expect(isBlockedIp("127.0.0.1")).toBe(true);
    expect(isBlockedIp("10.1.2.3")).toBe(true);
    expect(isBlockedIp("172.16.0.1")).toBe(true);
    expect(isBlockedIp("192.168.0.10")).toBe(true);
    expect(isBlockedIp("::1")).toBe(true);
    expect(isBlockedIp("fe80::1")).toBe(true);
  });

  it("allows public addresses", () => {
    expect(isBlockedIp("8.8.8.8")).toBe(false);
    expect(isBlockedIp("1.1.1.1")).toBe(false);
  });
});
