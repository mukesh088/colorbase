import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureUserId } from "./identity";
import { USER_COOKIE_NAME, verifySignedUserId } from "./user-cookie";

const jar = vi.hoisted(() => new Map<string, string>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => jar.has(name) ? { value: jar.get(name) } : undefined,
    set: (name: string, value: string) => jar.set(name, value),
  }),
}));
vi.mock("./pool", () => ({ query: vi.fn().mockResolvedValue({ rows: [] }) }));

afterEach(() => {
  jar.clear();
  vi.unstubAllEnvs();
});

describe("identity created by persistence routes", () => {
  it("creates a signed cookie on the first API request and reuses it on the next request", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test.invalid/colorbase");
    vi.stubEnv("USER_COOKIE_SECRET", "test-secret");
    const firstId = await ensureUserId();
    expect(firstId).toBeTruthy();
    expect(await verifySignedUserId(jar.get(USER_COOKIE_NAME))).toBe(firstId);
    expect(await ensureUserId()).toBe(firstId);
  });
});
