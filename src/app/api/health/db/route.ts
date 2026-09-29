import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db/migrate";
import { isDbConfigured, query, sanitizeDbError } from "@/lib/db/pool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isDbConfigured();
  const cookieSecret = Boolean(process.env.USER_COOKIE_SECRET?.trim());
  if (!configured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        cookieSecret,
        connected: false,
        schema: false,
        error: "DATABASE_URL is not set",
      },
      { status: 503 }
    );
  }

  try {
    await query("SELECT 1 AS ok");
  } catch (err) {
    const error = sanitizeDbError(err);
    console.error("[db] health connect failed:", error);
    return NextResponse.json(
      { ok: false, configured: true, cookieSecret, connected: false, schema: false, error },
      { status: 503 }
    );
  }

  try {
    await ensureSchema();
    const tables = await query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'users'`
    );
    const schema = Number(tables.rows[0]?.n ?? 0) > 0;
    return NextResponse.json({
      ok: schema && cookieSecret,
      configured: true,
      cookieSecret,
      connected: true,
      schema,
    });
  } catch (err) {
    const error = sanitizeDbError(err);
    console.error("[db] health schema failed:", error);
    return NextResponse.json(
      { ok: false, configured: true, cookieSecret, connected: true, schema: false, error },
      { status: 503 }
    );
  }
}
