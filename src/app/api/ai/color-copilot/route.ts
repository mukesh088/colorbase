import { NextResponse } from "next/server";
import { copilotRequestSchema } from "@/lib/copilot/schema";
import { runCopilot } from "@/lib/copilot/run";

export const runtime = "nodejs";

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
    const result = await runCopilot(parsed.data);
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
