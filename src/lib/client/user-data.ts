let identityInitialized = false;
let identityInitialization: Promise<void> | undefined;

async function readApi<T>(url: string, init?: RequestInit): Promise<{ data: T | null; ok: boolean }> {
  try {
    const res = await fetch(url, {
      credentials: "same-origin",
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
    if (!res.ok) return { data: null, ok: false };
    return { data: (await res.json()) as T, ok: true };
  } catch {
    return { data: null, ok: false };
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  if (!url.startsWith("/api/me/")) return (await readApi<T>(url, init)).data;

  // Let the first persistence response set its cookie before parallel syncs.
  // This replaces the identity previously minted on every public HTML request.
  while (!identityInitialized && identityInitialization) await identityInitialization;
  if (identityInitialized) return (await readApi<T>(url, init)).data;

  let release: (() => void) | undefined;
  identityInitialization = new Promise<void>((resolve) => { release = resolve; });
  try {
    const result = await readApi<T>(url, init);
    identityInitialized = result.ok;
    return result.data;
  } finally {
    identityInitialization = undefined;
    release?.();
  }
}

export function mergeUnique(local: string[], remote: string[], cap: number) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...local, ...remote]) {
    const key = raw.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(raw);
    if (out.length >= cap) break;
  }
  return out;
}
