import { NextResponse } from "next/server";
import { decodeCursor, pageSize, readJsonLimited, requireUser, requireUserAndRateLimit } from "@/lib/db/http";
import { paletteWriteSchema } from "@/lib/db/validate";
import { deletePalette, listPalettes, upsertPalette } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const cursorRaw = decodeCursor(url.searchParams.get("cursor"));
  const data = await listPalettes(
    auth.userId,
    pageSize(url.searchParams.get("limit")),
    cursorRaw ? { updatedAt: cursorRaw.updatedAt, id: cursorRaw.id } : undefined
  );
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requireUserAndRateLimit("me/palettes");
  if ("error" in auth) return auth.error;
  const body = await readJsonLimited(request, 32_768);
  if ("error" in body) return body.error;
  const parsed = paletteWriteSchema.safeParse(body.json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.flatten() }, { status: 400 });
  }
  const result = await upsertPalette(auth.userId, parsed.data.name, parsed.data.colors, parsed.data.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id: result.id });
}

export async function DELETE(request: Request) {
  const auth = await requireUserAndRateLimit("me/palettes");
  if ("error" in auth) return auth.error;
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await deletePalette(auth.userId, id);
  return NextResponse.json({ ok: true });
}
