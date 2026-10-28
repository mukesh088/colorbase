import { NextRequest, NextResponse } from "next/server";
import { normalizeHex } from "@/lib/colors/convert";

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };

/** A progressive-enhancement form endpoint; only canonical color pages are indexed. */
export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!/^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(query)) {
    return NextResponse.json({ error: "Enter three or six hexadecimal digits, with an optional #." }, { status: 400, headers });
  }
  // Keep the redirect on the public origin even behind the hosting proxy.
  return new NextResponse(null, {
    status: 303,
    headers: { ...headers, Location: `/color/${normalizeHex(query).slice(1)}` },
  });
}
