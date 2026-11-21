import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

afterEach(() => vi.unstubAllEnvs());

describe("public page and private API caching", () => {
  it("does not mint a cookie or bypass shared cache for a new public visitor", () => {
    vi.stubEnv("USER_COOKIE_SECRET", "test-secret");
    const response = middleware(new NextRequest("https://colorbase.in/color/584930"));
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("cache-control")).toContain("s-maxage=60");
    expect(response.headers.get("cache-control")).toMatch(/^public/);
  });

  it("sends trailing-slash paths to the slash-free canonical", () => {
    const response = middleware(new NextRequest("https://colorbase.in/color-picker/"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://colorbase.in/color-picker");
  });

  it.each(["/api/me/preferences", "/api/me/palettes", "/api/me/tables/example"]) (
    "never shares a private persistence response at %s, even for returning visitors",
    (path) => {
      const request = new NextRequest(`https://colorbase.in${path}`, {
        headers: { cookie: "cb_uid=test-existing-cookie" },
      });
      const response = middleware(request);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      expect(response.headers.get("set-cookie")).toBeNull();
    }
  );
});
