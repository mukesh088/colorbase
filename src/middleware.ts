import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { catalogRouteDecision } from "@/lib/catalog-routes";

/**
 * Hostinger/hCDN caches Next HTML via Cache-Control.
 * Long-lived HTML after deploy can reference deleted `/_next/static/*` hashes
 * (ChunkLoadError). Use a short shared-cache TTL instead of blanket no-store
 * so pages stay fast on CDN while new deploys refresh within ~1 minute.
 */
const HTML_CACHE =
  "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

function siteOrigin(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || request.nextUrl.origin;
}

function agentLinkHeader(origin: string) {
  return [
    `<${origin}/llms.txt>; rel="describedby"; type="text/plain"`,
    `<${origin}/.well-known/mcp/server-card.json>; rel="alternate"; type="application/json"; title="MCP Server Card"`,
    `<${origin}/api/mcp>; rel="service-doc"; type="application/json"; title="MCP endpoint"`,
    `<${origin}/markdown>; rel="alternate"; type="text/markdown"; title="Markdown homepage"`,
  ].join(", ");
}

function wantsMarkdown(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";
  const format = request.nextUrl.searchParams.get("format");
  if (format === "md" || format === "markdown") return true;
  if (!accept) return false;
  const prefersMarkdown =
    accept.includes("text/markdown") || accept.includes("text/x-markdown");
  if (!prefersMarkdown) return false;
  const htmlIndex = accept.indexOf("text/html");
  const mdIndex = Math.max(accept.indexOf("text/markdown"), accept.indexOf("text/x-markdown"));
  if (htmlIndex === -1) return true;
  return mdIndex !== -1 && mdIndex < htmlIndex;
}

function withAgentHeaders(response: NextResponse, origin: string) {
  response.headers.set("Link", agentLinkHeader(origin));
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = siteOrigin(request);

  // Route handlers create identity cookies on the first persistence request.
  // Public HTML must remain cacheable; private API data must never be shared.
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

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
    return withAgentHeaders(response, origin);
  }

  if (
    pathname === "/llms.txt" ||
    pathname === "/robots.txt" ||
    pathname === "/markdown" ||
    pathname.startsWith("/.well-known/")
  ) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return withAgentHeaders(response, origin);
  }

  if (pathname === "/" && wantsMarkdown(request)) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/markdown";
    destination.search = "";
    const response = NextResponse.rewrite(destination);
    response.headers.set("Vary", "Accept");
    return withAgentHeaders(response, origin);
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

  if (pathname.match(/\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?|txt|xml|webmanifest|json)$/)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", HTML_CACHE);
  response.headers.set("Vary", "Accept");
  return withAgentHeaders(response, origin);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\..*).*)",
    "/:catalog(color|colors|brands|color-names|gradient-library|palette-library|blog|developers|color-codes)/:path*",
    "/llms.txt",
    "/robots.txt",
    "/markdown",
    "/.well-known/:path*",
  ],
};
