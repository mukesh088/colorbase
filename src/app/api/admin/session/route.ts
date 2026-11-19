import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminToken,
  isAdminConfigured,
  isAdminRequest,
  secretsMatch,
} from "@/lib/interior/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return NextResponse.json({
    configured: isAdminConfigured(),
    authenticated: await isAdminRequest(request),
  });
}

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Set ADMIN_SECRET on the server to enable the admin panel." },
      { status: 503 }
    );
  }
  const body = (await request.json().catch(() => null)) as { secret?: unknown } | null;
  const provided = typeof body?.secret === "string" ? body.secret : "";
  if (!provided || !secretsMatch(provided, secret)) {
    return NextResponse.json({ error: "Incorrect admin secret." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createAdminToken(secret), adminCookieOptions());
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 });
  return res;
}
