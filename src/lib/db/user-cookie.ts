/** Edge-safe HMAC cookie helpers. Do not import `pg` or `node:fs` here. */

export const USER_COOKIE_NAME = "cb_uid";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toHex(sig);
}

function timingEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export function parseSignedUserCookie(raw: string | undefined): { id: string; sig: string } | null {
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  if (i <= 0) return null;
  const id = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  if (!UUID_RE.test(id) || !/^[0-9a-f]+$/i.test(sig)) return null;
  return { id, sig };
}

export async function verifySignedUserId(raw: string | undefined): Promise<string | null> {
  const secret = process.env.USER_COOKIE_SECRET?.trim();
  const parsed = parseSignedUserCookie(raw);
  if (!parsed || !secret) return null;
  const expected = await hmacHex(secret, parsed.id);
  return timingEqual(expected, parsed.sig.toLowerCase()) ? parsed.id : null;
}

export async function signUserId(id: string): Promise<string> {
  const secret = process.env.USER_COOKIE_SECRET?.trim();
  if (!secret) throw new Error("USER_COOKIE_SECRET is not set");
  return `${id}.${await hmacHex(secret, id)}`;
}

export function cookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  };
}

export function persistenceConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim() && process.env.USER_COOKIE_SECRET?.trim());
}
