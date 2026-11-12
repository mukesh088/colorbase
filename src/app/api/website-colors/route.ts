import { NextRequest, NextResponse } from "next/server";
import { allowRequest, clientIpFromHeaders } from "@/lib/security/rate-limit-memory";
import { analyzeWebsiteMarkup, stylesheetHrefs } from "@/lib/website/extract-colors";
import { fetchPublicText, validatePublicHttpUrl } from "@/lib/website/fetch-safe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = clientIpFromHeaders(request.headers);
  if (!allowRequest(`website-colors:${ip}`, { windowMs: 60_000, max: 8 })) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body with a url." }, { status: 400 });
  }

  const validated = validatePublicHttpUrl(String(body.url ?? ""));
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const page = await fetchPublicText(validated.url.toString(), {
      accept: "text/html,application/xhtml+xml",
    });
    const hrefs = stylesheetHrefs(page.text, page.url).slice(0, 12);
    const sheets: { url: string; css: string }[] = [];
    for (const href of hrefs) {
      try {
        const sheet = await fetchPublicText(href, {
          accept: "text/css,*/*;q=0.1",
          maxBytes: 800_000,
          timeoutMs: 6_000,
        });
        if (/text\/css|stylesheet|plain/i.test(sheet.contentType) || href.endsWith(".css")) {
          sheets.push({ url: sheet.url, css: sheet.text });
        }
      } catch {
        /* skip unreachable stylesheets */
      }
    }

    const analysis = analyzeWebsiteMarkup(page.text, sheets, page.url);
    return NextResponse.json(
      {
        ...analysis,
        limitations: [
          "Analysis uses publicly fetched HTML and linked CSS only.",
          "No headless browser is used; computed styles from JS-heavy SPAs may be incomplete.",
          "Screenshots are not captured by this endpoint.",
        ],
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze website.";
    return NextResponse.json(
      { error: message },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
