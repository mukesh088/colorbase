import { NextResponse } from "next/server";
import { ensureSchema } from "./migrate";
import { isDbConfigured } from "./pool";
import { ensureUserId } from "./identity";
import { checkRateLimit } from "./rate-limit";
import { LIMITS } from "./limits";

export function unavailable() {
  return NextResponse.json(
    { error: "Persistence unavailable", unavailable: true },
    { status: 503 }
  );
}

export function tooLarge(message = "Payload too large") {
  return NextResponse.json({ error: message }, { status: 413 });
}

export function badRequest(message: string, issues?: unknown) {
  return NextResponse.json(issues ? { error: message, issues } : { error: message }, { status: 400 });
}

export async function requireUser() {
  if (!isDbConfigured()) return { error: unavailable() };
  try {
    await ensureSchema();
    const userId = await ensureUserId();
    if (!userId) return { error: unavailable() };
    return { userId };
  } catch {
    return { error: unavailable() };
  }
}

export async function requireUserAndRateLimit(route: string, maxPerMinute = LIMITS.savePerMinute) {
  const auth = await requireUser();
  if ("error" in auth) return auth;
  try {
    const ok = await checkRateLimit(auth.userId, route, maxPerMinute);
    if (!ok) {
      return {
        error: NextResponse.json({ error: "Too many requests" }, { status: 429 }),
      };
    }
  } catch {
    return { error: unavailable() };
  }
  return auth;
}

export async function readJsonLimited(request: Request, maxBytes = LIMITS.bodyBytes) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) return { error: tooLarge() };
  const buf = Buffer.from(await request.arrayBuffer());
  if (buf.byteLength > maxBytes) return { error: tooLarge() };
  try {
    return { json: JSON.parse(buf.toString("utf8")) as unknown, bytes: buf.byteLength };
  } catch {
    return { error: badRequest("Invalid JSON") };
  }
}

export function encodeCursor(updatedAt: Date | string, id: string) {
  const iso = updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt;
  return Buffer.from(`${iso}|${id}`, "utf8").toString("base64url");
}

export function decodeCursor(raw: string | null): { updatedAt: string; id: string } | null {
  if (!raw) return null;
  try {
    const text = Buffer.from(raw, "base64url").toString("utf8");
    const i = text.indexOf("|");
    if (i <= 0) return null;
    return { updatedAt: text.slice(0, i), id: text.slice(i + 1) };
  } catch {
    return null;
  }
}

export function pageSize(raw: string | null) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return LIMITS.pageSize;
  return Math.min(Math.floor(n), LIMITS.maxPageSize);
}
