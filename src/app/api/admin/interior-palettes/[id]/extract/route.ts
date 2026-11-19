import { NextResponse } from "next/server";
import { getInteriorImage, updateInteriorPalette } from "@/lib/db/interior";
import { requireAdminApi } from "@/lib/interior/auth";
import { decodeInteriorImage, resizeRgba } from "@/lib/interior/decode";
import { extractInteriorPalette } from "@/lib/interior/quantize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;
  const { id } = await ctx.params;
  const row = await getInteriorImage(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const decoded = await decodeInteriorImage(row.image_bytes);
    const analysis = resizeRgba(decoded.data, decoded.width, decoded.height, 480);
    const colors = extractInteriorPalette(analysis.data, 6);
    if (colors.length < 5) {
      return NextResponse.json({ error: "Could not find 5 distinct colors in this photo." }, { status: 400 });
    }
    const item = await updateInteriorPalette(id, { colors });
    return NextResponse.json({ item, colors });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
