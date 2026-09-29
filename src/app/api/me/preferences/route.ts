import { NextResponse } from "next/server";
import { preferencesSchema } from "@/lib/db/validate";
import { readJsonLimited, requireUser, requireUserAndRateLimit } from "@/lib/db/http";
import { getPreferences, putPreferences } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const prefs = await getPreferences(auth.userId);
  return NextResponse.json(prefs);
}

export async function PUT(request: Request) {
  const auth = await requireUserAndRateLimit("me/preferences");
  if ("error" in auth) return auth.error;
  const body = await readJsonLimited(request, 16_384);
  if ("error" in body) return body.error;
  const parsed = preferencesSchema.safeParse(body.json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.flatten() }, { status: 400 });
  }
  await putPreferences(auth.userId, parsed.data.theme ?? null, parsed.data.settings ?? {});
  return NextResponse.json({ ok: true });
}
