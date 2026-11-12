/** Simple in-process sliding window rate limiter for public API routes. */

type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5_000;

function prune(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, row] of buckets) {
    if (row.reset < now) buckets.delete(key);
  }
  // Hard cap: drop oldest half if still oversized (memory pressure / abuse).
  if (buckets.size >= MAX_KEYS) {
    const keys = [...buckets.keys()].slice(0, Math.floor(buckets.size / 2));
    for (const key of keys) buckets.delete(key);
  }
}

export function allowRequest(
  key: string,
  options: { windowMs?: number; max?: number } = {}
): boolean {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 20;
  const now = Date.now();
  prune(now);

  const row = buckets.get(key);
  if (!row || row.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (row.count >= max) return false;
  row.count += 1;
  return true;
}

export function clientIpFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "anonymous"
  );
}
