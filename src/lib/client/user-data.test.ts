import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

describe("first persistence request", () => {
  it("waits for the first cookie-setting response before parallel user-data syncs", async () => {
    vi.resetModules();
    let complete: ((value: Response) => void) | undefined;
    const first = new Promise<Response>((resolve) => { complete = resolve; });
    const fetch = vi.fn().mockReturnValueOnce(first).mockImplementation(async () => Response.json({ items: [] }));
    vi.stubGlobal("fetch", fetch);
    const { apiFetch } = await import("./user-data");
    const requests = [apiFetch("/api/me/recents"), apiFetch("/api/me/favorites"), apiFetch("/api/me/tables")];
    expect(fetch).toHaveBeenCalledTimes(1);
    complete?.(Response.json({ items: [] }));
    await expect(Promise.all(requests)).resolves.toEqual([{ items: [] }, { items: [] }, { items: [] }]);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("keeps the local-only fallback and allows a later request to recover", async () => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(Response.json({ unavailable: true }, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ items: ["#ffffff"] })));
    const { apiFetch } = await import("./user-data");
    await expect(apiFetch("/api/me/recents")).resolves.toBeNull();
    await expect(apiFetch("/api/me/recents")).resolves.toEqual({ items: ["#ffffff"] });
  });
});
