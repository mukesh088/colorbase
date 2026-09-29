import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db/migrate";
import { isDbConfigured } from "@/lib/db/pool";
import { runCleanup } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 503 });
  }
  try {
    await ensureSchema();
    const deleted = await runCleanup();
    return NextResponse.json({ ok: true, deleted });
  } catch {
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
