import { NextResponse } from "next/server";
import { favoriteKindSchema, favoriteWriteSchema, favoriteBulkSchema } from "@/lib/db/validate";
import { decodeCursor, pageSize, readJsonLimited, requireUser, requireUserAndRateLimit } from "@/lib/db/http";
import { deleteFavorite, listFavorites, upsertFavorite } from "@/lib/db/queries";
import { LIMITS } from "@/lib/db/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const kindParse = favoriteKindSchema.safeParse(url.searchParams.get("kind") ?? undefined);
  const kind = url.searchParams.has("kind") ? (kindParse.success ? kindParse.data : undefined) : undefined;
  if (url.searchParams.has("kind") && !kindParse.success) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }
  const cursorRaw = decodeCursor(url.searchParams.get("cursor"));
  const cursor = cursorRaw ? { createdAt: cursorRaw.updatedAt, id: cursorRaw.id } : undefined;
  try {
    const data = await listFavorites(auth.userId, kind, pageSize(url.searchParams.get("limit")), cursor);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Persistence unavailable", unavailable: true }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const auth = await requireUserAndRateLimit("me/favorites");
  if ("error" in auth) return auth.error;
  const body = await readJsonLimited(request);
  if ("error" in body) return body.error;

  const bulk = favoriteBulkSchema.safeParse(body.json);
  if (bulk.success) {
    let saved = 0;
    for (const item of bulk.data.items.slice(0, LIMITS.favorites)) {
      const result = await upsertFavorite(auth.userId, item.kind, item.value);
      if ("error" in result) break;
      saved += 1;
    }
    return NextResponse.json({ saved });
  }

  const single = favoriteWriteSchema.safeParse(body.json);
  if (!single.success) {
    return NextResponse.json({ error: "Invalid body", issues: single.error.flatten() }, { status: 400 });
  }
  const result = await upsertFavorite(auth.userId, single.data.kind, single.data.value);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireUserAndRateLimit("me/favorites");
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const parsed = favoriteWriteSchema.safeParse({
    kind: url.searchParams.get("kind"),
    value: url.searchParams.get("value"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "kind and value are required" }, { status: 400 });
  }
  await deleteFavorite(auth.userId, parsed.data.kind, parsed.data.value);
  return NextResponse.json({ ok: true });
}
