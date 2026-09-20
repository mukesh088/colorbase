import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Hostinger/hCDN caches Next HTML via Cache-Control.
 * Long-lived HTML after deploy can reference deleted `/_next/static/*` hashes
 * (ChunkLoadError). Use a short shared-cache TTL instead of blanket no-store
 * so pages stay fast on CDN while new deploys refresh within ~1 minute.
 */
const HTML_CACHE =
  "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

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

  if (pathname === "/sitemap.xml" || pathname.startsWith("/sitemap/")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", HTML_CACHE);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
