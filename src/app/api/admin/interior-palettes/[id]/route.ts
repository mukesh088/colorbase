import { NextResponse } from "next/server";
import {
  deleteInteriorPalette,
  getInteriorById,
  updateInteriorPalette,
} from "@/lib/db/interior";
import { requireAdminApi } from "@/lib/interior/auth";
import { isRoomType, isStyle, MAX_INTERIOR_UPLOAD_BYTES } from "@/lib/interior/catalog";
import { analyzeInteriorUpload } from "@/lib/interior/process";
import { parseSwatches } from "@/lib/interior/swatches";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;
  const { id } = await ctx.params;
  const item = await getInteriorById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;
  const { id } = await ctx.params;
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("image");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Choose a replacement photo." }, { status: 400 });
      }
      if (file.size > MAX_INTERIOR_UPLOAD_BYTES) {
        return NextResponse.json({ error: "Image must be 4 MB or smaller." }, { status: 400 });
      }
      const { colors, display } = await analyzeInteriorUpload(file);
      const item = await updateInteriorPalette(id, { colors, image: display });
      if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ item });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const patch: Parameters<typeof updateInteriorPalette>[1] = {};
    if (typeof body.title === "string") patch.title = body.title.trim().slice(0, 120);
    if (typeof body.description === "string") patch.description = body.description.trim().slice(0, 4000);
    if (typeof body.altText === "string") patch.altText = body.altText.trim().slice(0, 200);
    if (typeof body.usageNotes === "string") patch.usageNotes = body.usageNotes.trim().slice(0, 4000);
    if (typeof body.roomType === "string") {
      if (!isRoomType(body.roomType)) return NextResponse.json({ error: "Invalid room type." }, { status: 400 });
      patch.roomType = body.roomType;
    }
    if (typeof body.style === "string") {
      if (!isStyle(body.style)) return NextResponse.json({ error: "Invalid style." }, { status: 400 });
      patch.style = body.style;
    }
    if (body.colors) patch.colors = parseSwatches(body.colors);
    if (body.status === "draft" || body.status === "published") patch.status = body.status;
    const item = await updateInteriorPalette(id, patch);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;
  const { id } = await ctx.params;
  await deleteInteriorPalette(id);
  return NextResponse.json({ ok: true });
}
