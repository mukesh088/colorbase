import { NextResponse } from "next/server";
import { insertInteriorPalette, listInteriorPalettesAdmin } from "@/lib/db/interior";
import { requireAdminApi } from "@/lib/interior/auth";
import {
  INTERIOR_ROOM_TYPES,
  INTERIOR_STYLES,
  isRoomType,
  isStyle,
  MAX_INTERIOR_UPLOAD_BYTES,
} from "@/lib/interior/catalog";
import { suggestInteriorCopy } from "@/lib/interior/copy";
import { analyzeInteriorUpload } from "@/lib/interior/process";
import { parseSwatches } from "@/lib/interior/swatches";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;
  const items = await listInteriorPalettesAdmin();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File) || file.size < 24) {
    return NextResponse.json({ error: "Choose a room photo (JPG, PNG, or WebP)." }, { status: 400 });
  }
  if (file.size > MAX_INTERIOR_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be 4 MB or smaller." }, { status: 400 });
  }
  const roomType = String(form.get("roomType") ?? "");
  const style = String(form.get("style") ?? "");
  if (!isRoomType(roomType) || !isStyle(style)) {
    return NextResponse.json(
      { error: `Choose a room type (${INTERIOR_ROOM_TYPES.join(", ")}) and style (${INTERIOR_STYLES.join(", ")}).` },
      { status: 400 }
    );
  }
  try {
    const { colors: extracted, display } = await analyzeInteriorUpload(file);
    let colors = extracted;
    const rawColors = form.get("colors");
    if (typeof rawColors === "string" && rawColors.trim()) {
      try {
        colors = parseSwatches(JSON.parse(rawColors) as unknown);
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Palette colors are invalid." },
          { status: 400 }
        );
      }
    }
    const copy = await suggestInteriorCopy({ roomType, style, swatches: colors });
    const title = String(form.get("title") ?? "").trim() || copy.title;
    const description = String(form.get("description") ?? "").trim() || copy.description;
    const altText =
      String(form.get("altText") ?? "").trim() ||
      `${roomType.replace(/-/g, " ")} interior photo for a ${style} color palette`;
    const usageNotes = String(form.get("usageNotes") ?? "").trim() || copy.usageNotes;
    const item = await insertInteriorPalette({
      title: title.slice(0, 120),
      description: description.slice(0, 4000),
      roomType,
      style,
      altText: altText.slice(0, 200),
      usageNotes: usageNotes.slice(0, 4000),
      colors,
      image: display,
    });
    return NextResponse.json({ item, usedAi: copy.usedAi });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not process the photo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
