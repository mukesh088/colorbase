import { NextResponse } from "next/server";
import { copilotRequestSchema } from "@/lib/copilot/schema";
import { runCopilot } from "@/lib/copilot/run";
import { LIMITS } from "@/lib/db/limits";
import { ensureSchema } from "@/lib/db/migrate";
import { isDbConfigured } from "@/lib/db/pool";
import { ensureUserId } from "@/lib/db/identity";
import { checkRateLimit } from "@/lib/db/rate-limit";
import { saveCopilotSession } from "@/lib/db/queries";
import { allowRequest, clientIpFromHeaders } from "@/lib/security/rate-limit-memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  if (!allowRequest(`copilot:${ip}`, { windowMs: 60_000, max: LIMITS.copilotPerMinute })) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const json = await request.json();
    const parsed = copilotRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const result = await runCopilot(parsed.data);

    if (isDbConfigured()) {
      void persistSession(parsed.data, result).catch(() => {});
    }

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      {
        error: "We couldn't generate your color system right now. Your existing palette is safe.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

async function persistSession(intent: unknown, result: unknown) {
  await ensureSchema();
  const userId = await ensureUserId();
  if (!userId) return;
  const allowed = await checkRateLimit(userId, "copilot", LIMITS.copilotPerMinute);
  if (!allowed) return;
  const slim = { intent, result };
  if (Buffer.byteLength(JSON.stringify(slim), "utf8") <= LIMITS.copilotBytes) {
    await saveCopilotSession(userId, slim);
  }
}
