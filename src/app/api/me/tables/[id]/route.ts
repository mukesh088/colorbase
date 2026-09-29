import { NextResponse } from "next/server";
import { requireUser } from "@/lib/db/http";
import { getTable } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
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
