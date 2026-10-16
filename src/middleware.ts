import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookieOptions, signUserId, USER_COOKIE_NAME } from "@/lib/db/user-cookie";
import { catalogRouteDecision } from "@/lib/catalog-routes";

/**
 * Hostinger/hCDN caches Next HTML via Cache-Control.
 * Long-lived HTML after deploy can reference deleted `/_next/static/*` hashes
 * (ChunkLoadError). Use a short shared-cache TTL instead of blanket no-store
 * so pages stay fast on CDN while new deploys refresh within ~1 minute.
 */
const HTML_CACHE =
  "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  if (pathname === "/sitemap.xml" || pathname.startsWith("/sitemap/")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return response;
  }

  const decision = catalogRouteDecision(pathname);
  if (decision?.status === 308) {
    const destination = request.nextUrl.clone();
    destination.pathname = decision.pathname;
    return NextResponse.redirect(destination, 308);
  }
  if (decision?.status === 404) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/_not-found";
    destination.search = "";
    const response = NextResponse.rewrite(destination, { status: 404 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  if (pathname.match(/\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?|txt|xml|webmanifest)$/)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const secret = process.env.USER_COOKIE_SECRET?.trim();
  let mintedCookie = false;
  if (secret && !request.cookies.get(USER_COOKIE_NAME)?.value) {
    try {
      const signed = await signUserId(crypto.randomUUID());
      response.cookies.set(USER_COOKIE_NAME, signed, cookieOptions());
      mintedCookie = true;
    } catch {
      // Cookie identity is optional until USER_COOKIE_SECRET is valid.
    }
  }
  response.headers.set(
    "Cache-Control",
    mintedCookie ? "private, max-age=0, no-cache" : HTML_CACHE
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\..*).*)",
    "/:catalog(color|colors|brands|color-names|gradient-library|palette-library|blog|developers|color-codes)/:path*",
  ],
};
