import { NextResponse } from "next/server";
import { decodeCursor, pageSize, readJsonLimited, requireUser, requireUserAndRateLimit, tooLarge } from "@/lib/db/http";
import { tableWriteSchema } from "@/lib/db/validate";
import { deleteTable, getTable, listTables, upsertTable } from "@/lib/db/queries";
import { LIMITS } from "@/lib/db/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const row = await getTable(auth.userId, id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      id: row.id,
      name: row.name,
      payload: row.payload,
      rowCount: row.row_count,
      byteSize: row.byte_size,
      updatedAt: row.updated_at.toISOString(),
    });
  }
  const cursorRaw = decodeCursor(url.searchParams.get("cursor"));
  const data = await listTables(
    auth.userId,
    pageSize(url.searchParams.get("limit")),
    cursorRaw ? { updatedAt: cursorRaw.updatedAt, id: cursorRaw.id } : undefined
  );
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requireUserAndRateLimit("me/tables");
  if ("error" in auth) return auth.error;
  const body = await readJsonLimited(request);
  if ("error" in body) return body.error;
  const parsed = tableWriteSchema.safeParse(body.json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.flatten() }, { status: 400 });
  }
  const payloadBytes = Buffer.byteLength(JSON.stringify(parsed.data.payload), "utf8");
  if (payloadBytes > LIMITS.tableBytes) return tooLarge("Table JSON exceeds 400 KB");
  const rowCount = parsed.data.payload.rows.length;
  if (rowCount > LIMITS.tableRows) {
    return NextResponse.json({ error: "Table exceeds 400 rows" }, { status: 400 });
  }
  try {
    const saved = await upsertTable(
      auth.userId,
      parsed.data.id,
      parsed.data.name,
      parsed.data.payload,
      payloadBytes,
      rowCount
    );
    if (!saved) {
      return NextResponse.json({ error: "Document id is not available" }, { status: 409 });
    }
    return NextResponse.json({ ok: true, id: parsed.data.id });
  } catch {
    return NextResponse.json({ error: "Persistence unavailable", unavailable: true }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireUserAndRateLimit("me/tables");
  if ("error" in auth) return auth.error;
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await deleteTable(auth.userId, id);
  return NextResponse.json({ ok: true });
}
