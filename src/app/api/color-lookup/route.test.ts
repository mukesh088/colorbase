import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

describe("direct HEX lookup", () => {
  it.each([["#F00", "ff0000"], ["3B82F6", "3b82f6"]])("opens the canonical color for %s without JavaScript", (query, hex) => {
    const url = new URL("https://colorbase.in/api/color-lookup");
    url.searchParams.set("q", query);
    const response = GET(new NextRequest(url));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(`/color/${hex}`);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it.each(["not-a-color", "#12345", "#12345678", ""])("rejects %s instead of silently returning black", (query) => {
    const url = new URL("https://colorbase.in/api/color-lookup");
    url.searchParams.set("q", query);
    const response = GET(new NextRequest(url));
    expect(response.status).toBe(400);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
  });
});
