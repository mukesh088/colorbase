import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db/migrate";
import { isDbConfigured, query, sanitizeDbError } from "@/lib/db/pool";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = isDbConfigured();
  const cookieSecret = Boolean(process.env.USER_COOKIE_SECRET?.trim());
  if (!configured) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  try {
    await query("SELECT 1 AS ok");
  } catch (err) {
    console.error("[db] health connect failed:", sanitizeDbError(err));
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  try {
    await ensureSchema();
    const tables = await query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'users'`
    );
    const schema = Number(tables.rows[0]?.n ?? 0) > 0;
    return NextResponse.json({ ok: schema && cookieSecret });
  } catch (err) {
    console.error("[db] health schema failed:", sanitizeDbError(err));
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
