import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "cb_admin";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_SECRET?.trim());
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function adminCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

export function createAdminToken(secret: string, now = Date.now()) {
  const exp = String(now + MAX_AGE_SEC * 1000);
  return `${exp}.${sign(`admin|${exp}`, secret)}`;
}

export function verifyAdminToken(raw: string | undefined, secret: string | undefined, now = Date.now()) {
  if (!raw || !secret) return false;
  const i = raw.indexOf(".");
  if (i <= 0) return false;
  const exp = raw.slice(0, i);
  const sig = raw.slice(i + 1).toLowerCase();
  if (!/^\d+$/.test(exp) || !/^[0-9a-f]+$/.test(sig)) return false;
  if (Number(exp) < now) return false;
  const expected = sign(`admin|${exp}`, secret);
  try {
    return timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

export function secretsMatch(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAdminRequest(request?: Request) {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return false;
  let raw: string | undefined;
  if (request) {
    const cookie = request.headers.get("cookie") ?? "";
    const match = cookie.match(/(?:^|;\s*)cb_admin=([^;]+)/);
    raw = match?.[1] ? decodeURIComponent(match[1]) : undefined;
    const bearer = request.headers.get("authorization") ?? "";
    if (bearer.startsWith("Bearer ") && secretsMatch(bearer.slice(7), secret)) return true;
  } else {
    raw = (await cookies()).get(ADMIN_COOKIE)?.value;
  }
  return verifyAdminToken(raw, secret);
}

export async function requireAdminApi(request: Request) {
  if (await isAdminRequest(request)) return null;
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
