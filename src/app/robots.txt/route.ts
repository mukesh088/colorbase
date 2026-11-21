import { robotsTxt } from "@/lib/robots";

export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  return new Response(robotsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
