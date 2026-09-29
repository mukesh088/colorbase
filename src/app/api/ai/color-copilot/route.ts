import { NextResponse } from "next/server";
import { copilotRequestSchema } from "@/lib/copilot/schema";
import { runCopilot } from "@/lib/copilot/run";
import { LIMITS } from "@/lib/db/limits";
import { ensureSchema } from "@/lib/db/migrate";
import { isDbConfigured } from "@/lib/db/pool";
import { ensureUserId } from "@/lib/db/identity";
import { checkRateLimit } from "@/lib/db/rate-limit";
import { saveCopilotSession } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = copilotRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    if (isDbConfigured()) {
      try {
        await ensureSchema();
        userId = await ensureUserId();
        if (userId) {
          const allowed = await checkRateLimit(userId, "copilot", LIMITS.copilotPerMinute);
          if (!allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
          }
        }
      } catch {
        userId = null;
      }
    }

    const result = await runCopilot(parsed.data);

    if (userId) {
      try {
        const slim = { intent: parsed.data, result };
        if (Buffer.byteLength(JSON.stringify(slim), "utf8") <= LIMITS.copilotBytes) {
          await saveCopilotSession(userId, slim);
        }
      } catch {
        // Persistence is optional; the generated palette still returns.
      }
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "We couldn't generate your color system right now. Your existing palette is safe.",
      },
      { status: 500 }
    );
  }
}
