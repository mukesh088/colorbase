import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/interior/auth";
import { MAX_INTERIOR_UPLOAD_BYTES } from "@/lib/interior/catalog";
import { analyzeInteriorUpload } from "@/lib/interior/process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  try {
    const { colors } = await analyzeInteriorUpload(file);
    return NextResponse.json({ colors });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
