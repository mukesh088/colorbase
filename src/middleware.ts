import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Hostinger/hCDN caches Next static HTML using Cache-Control.
 * Default static pages use s-maxage=1y, so after a deploy clients can keep
 * HTML that references deleted `/_next/static/*` hashes (ChunkLoadError + missing CSS).
 * Force short shared-cache TTL for documents; hashed assets stay immutable via Next.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.match(/\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?|txt|xml|webmanifest)$/)
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, max-age=0, must-revalidate"
  );
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
