import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/interior/published-slugs", () => ({
  publishedInteriorSlugs: vi.fn(async () => new Set(["modern-living-room-deep-cyan-palette"])),
}));

import { middleware } from "./middleware";
import { publishedInteriorSlugs } from "@/lib/interior/published-slugs";

afterEach(() => vi.unstubAllEnvs());

describe("public page and private API caching", () => {
  it("does not mint a cookie or bypass shared cache for a new public visitor", async () => {
    vi.stubEnv("USER_COOKIE_SECRET", "test-secret");
    const response = await middleware(new NextRequest("https://colorbase.in/color/584930"));
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("cache-control")).toContain("s-maxage=60");
    expect(response.headers.get("cache-control")).toMatch(/^public/);
  });

  it("sends trailing-slash paths to the slash-free canonical", async () => {
    const response = await middleware(new NextRequest("https://colorbase.in/color-picker/"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://colorbase.in/color-picker");
  });

  it.each(["/api/me/preferences", "/api/me/palettes", "/api/me/tables/example"]) (
    "never shares a private persistence response at %s, even for returning visitors",
    async (path) => {
      const request = new NextRequest(`https://colorbase.in${path}`, {
        headers: { cookie: "cb_uid=test-existing-cookie" },
      });
      const response = await middleware(request);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      expect(response.headers.get("set-cookie")).toBeNull();
    }
  );
});

describe("interior palette 404s", () => {
  it("returns a real 404 for an unknown interior slug", async () => {
    const response = await middleware(new NextRequest("https://colorbase.in/interior-colors/not-a-room"));
    expect(response.status).toBe(404);
  });

  it("lets published interior slugs through", async () => {
    const response = await middleware(
      new NextRequest("https://colorbase.in/interior-colors/modern-living-room-deep-cyan-palette")
    );
    expect(response.status).toBe(200);
  });

  it("lets admins preview drafts", async () => {
    const response = await middleware(
      new NextRequest("https://colorbase.in/interior-colors/draft-room", { headers: { cookie: "cb_admin=token" } })
    );
    expect(response.status).toBe(200);
  });

  it("falls through to the page when the catalog can't be read", async () => {
    vi.mocked(publishedInteriorSlugs).mockResolvedValueOnce(undefined);
    const response = await middleware(new NextRequest("https://colorbase.in/interior-colors/anything"));
    expect(response.status).toBe(200);
  });
});
