import { NextResponse } from "next/server";
import { readJsonLimited, requireUser, requireUserAndRateLimit } from "@/lib/db/http";
import { recentWriteSchema } from "@/lib/db/validate";
import { listRecentColors, pushRecentColor } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const items = await listRecentColors(auth.userId);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const auth = await requireUserAndRateLimit("me/recents");
  if ("error" in auth) return auth.error;
  const body = await readJsonLimited(request, 2048);
  if ("error" in body) return body.error;
  const parsed = recentWriteSchema.safeParse(body.json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.flatten() }, { status: 400 });
  }
  await pushRecentColor(auth.userId, parsed.data.hex);
  return NextResponse.json({ ok: true });
}
