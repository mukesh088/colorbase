"use client";

/**
 * Polished Web Tools suite — SEO generators + code minify/beautify.
 * CSS Beautifier lives in web-social-utility (templates + live preview).
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Download, Globe2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/color/copy-button";
import { ToolWorkbench, ActionRow, PrimaryButton } from "./workbench";
import { CodeOutput } from "./code-output";
import { minifyCss, minifyHtml, minifyJs, simpleBeautify } from "./helpers";
import type { CodeLanguage } from "@/lib/syntax-highlight";
import type { WebSuiteMode } from "@/lib/suite-modes";
import { cn } from "@/lib/utils";

const CssBeautifierTool = dynamic(
  () => import("./web-social-utility").then((m) => m.CssBeautifierTool),
  { ssr: false }
);

export type { WebSuiteMode };
export { isWebSuite } from "@/lib/suite-modes";

type SeoMode = Extract<
  WebSuiteMode,
  | "robots-txt-generator"
  | "sitemap-generator"
  | "meta-tag-generator"
  | "open-graph-generator"
  | "twitter-card-generator"
  | "favicon-generator"
  | "manifest-generator"
>;

type CodeMode = Extract<
  WebSuiteMode,
  "css-minifier" | "js-minifier" | "html-minifier" | "js-beautifier" | "html-beautifier"
>;

const SEO_META: Record<SeoMode, { title: string; hint: string }> = {
  "robots-txt-generator": {
    title: "Robots.txt",
    hint: "Control crawler access with flexible allow/disallow rules.",
  },
  "sitemap-generator": {
    title: "Sitemap",
    hint: "Build an XML sitemap from your URL list.",
  },
  "meta-tag-generator": {
    title: "Meta tags",
    hint: "Generate core SEO tags for any page.",
  },
  "open-graph-generator": {
    title: "Open Graph",
    hint: "Craft rich link previews for social shares.",
  },
  "twitter-card-generator": {
    title: "Twitter card",
    hint: "Generate X/Twitter card meta tags.",
  },
  "favicon-generator": {
    title: "Favicon tags",
    hint: "Output HTML link tags for favicons and PWA icons.",
  },
  "manifest-generator": {
    title: "Web manifest",
    hint: "Start a flexible PWA manifest.json.",
  },
};

const CODE_META: Record<CodeMode, { title: string; hint: string; sample: string; action: string }> = {
  "css-minifier": {
    title: "CSS Minifier",
    hint: "Compress stylesheets by stripping comments and whitespace.",
    sample: `.hero {\n  color: #e11d48;\n  padding: 24px 32px;\n  /* brand */\n  background: linear-gradient(135deg, #fff1f2, #ffe4e6);\n}`,
    action: "Minify CSS",
  },
  "js-minifier": {
    title: "JS Minifier",
    hint: "Shrink JavaScript for faster delivery.",
    sample: `function greet(name) {\n  // welcome message\n  const msg = "Hello, " + name + "!";\n  return msg;\n}\n\nconsole.log(greet("colorBase"));`,
    action: "Minify JS",
  },
  "html-minifier": {
    title: "HTML Minifier",
    hint: "Tighten markup for smaller HTML payloads.",
    sample: `<section class="hero">\n  <h1>colorBase</h1>\n  <!-- tagline -->\n  <p>Design faster with better color tools.</p>\n</section>`,
    action: "Minify HTML",
  },
  "js-beautifier": {
    title: "JS Beautifier",
    hint: "Pretty-print JavaScript for reading and review.",
    sample: `function greet(name){const msg="Hello, "+name+"!";return msg;}console.log(greet("colorBase"));`,
    action: "Beautify JS",
  },
  "html-beautifier": {
    title: "HTML Beautifier",
    hint: "Indent HTML so structure is easy to scan.",
    sample: `<section class="hero"><h1>colorBase</h1><p>Design faster with better color tools.</p></section>`,
    action: "Beautify HTML",
  },
};

function WebResultPanel({
  title,
  subtitle,
  actions,
  children,
  empty,
  emptyTitle,
  emptyHint,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  empty?: boolean;
  emptyTitle: string;
  emptyHint: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-fuchsia-500/5 to-transparent px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
            Result
          </p>
          <p className="text-sm font-semibold">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="p-4 sm:p-5">
        {empty ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 text-center">
            <p className="font-display text-lg font-semibold tracking-tight">{emptyTitle}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyHint}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] || "example.com";
  }
}

function SocialSharePreview({
  variant,
  title,
  description,
  image,
  site,
}: {
  variant: "og" | "twitter";
  title: string;
  description: string;
  image: string;
  site: string;
}) {
  const host = hostnameOf(site);
  return (
    <div className="web-preview-card overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-3 py-2">
        <Globe2 className="h-3.5 w-3.5 text-rose-600" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {variant === "og" ? "Open Graph preview" : "Twitter card preview"}
        </p>
      </div>
      <div className="aspect-[1.91/1] overflow-hidden bg-muted/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || "https://placehold.co/1200x630/fff1f2/e11d48?text=Preview"}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://placehold.co/1200x630/fff1f2/e11d48?text=Image";
          }}
        />
      </div>
      <div className="space-y-1 px-3 py-3">
        <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">{host}</p>
        <p className="line-clamp-2 font-display text-base font-semibold leading-snug tracking-tight">
          {title || "Untitled"}
        </p>
        <p className="line-clamp-2 text-sm text-muted-foreground">{description || "Add a description to preview the card."}</p>
      </div>
    </div>
  );
}

function SeoWebTool({ mode }: { mode: SeoMode }) {
  const meta = SEO_META[mode];
  const [site, setSite] = useState("https://colorbase.in");
  const [title, setTitle] = useState("colorBase");
  const [desc, setDesc] = useState("Free modern color tools for designers and developers.");
  const [image, setImage] = useState("https://colorbase.in/og-image.png");
  const [urls, setUrls] = useState("https://colorbase.in/\nhttps://colorbase.in/colors\nhttps://colorbase.in/tools");
  const [userAgent, setUserAgent] = useState("*");
  const [allowPath, setAllowPath] = useState("/");
  const [disallow, setDisallow] = useState("");
  const [changefreq, setChangefreq] = useState("weekly");
  const [priority, setPriority] = useState("0.8");
  const [ogType, setOgType] = useState("website");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [keywords, setKeywords] = useState("color tools, palette, design");
  const [themeColor, setThemeColor] = useState("#e11d48");
  const [bgColor, setBgColor] = useState("#fff7fa");
  const [display, setDisplay] = useState("standalone");
  const [shortName, setShortName] = useState("colorBase");
  const [startUrl, setStartUrl] = useState("/");
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const build = () => {
    switch (mode) {
      case "robots-txt-generator": {
        const lines = [`User-agent: ${userAgent || "*"}`];
        allowPath
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .forEach((p) => lines.push(`Allow: ${p}`));
        disallow
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .forEach((p) => lines.push(`Disallow: ${p}`));
        if (site.trim()) lines.push(`Sitemap: ${site.replace(/\/$/, "")}/sitemap.xml`);
        return lines.join("\n");
      }
      case "sitemap-generator": {
        const list = urls
          .split("\n")
          .map((u) => u.trim())
          .filter(Boolean);
        return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${list
          .map(
            (u) =>
              `  <url>\n    <loc>${u}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
          )
          .join("\n")}\n</urlset>`;
      }
      case "meta-tag-generator":
        return [
          `<title>${title}</title>`,
          `<meta name="description" content="${desc}" />`,
          keywords.trim() ? `<meta name="keywords" content="${keywords}" />` : null,
          `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
          `<meta name="theme-color" content="${themeColor}" />`,
          `<link rel="canonical" href="${site}" />`,
        ]
          .filter(Boolean)
          .join("\n");
      case "open-graph-generator":
        return [
          `<meta property="og:title" content="${title}" />`,
          `<meta property="og:description" content="${desc}" />`,
          `<meta property="og:image" content="${image}" />`,
          `<meta property="og:url" content="${site}" />`,
          `<meta property="og:type" content="${ogType}" />`,
        ].join("\n");
      case "twitter-card-generator":
        return [
          `<meta name="twitter:card" content="${twitterCard}" />`,
          `<meta name="twitter:title" content="${title}" />`,
          `<meta name="twitter:description" content="${desc}" />`,
          `<meta name="twitter:image" content="${image}" />`,
        ].join("\n");
      case "favicon-generator":
        return [
          `<link rel="icon" href="/favicon.ico" sizes="any" />`,
          `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`,
          `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
          `<link rel="manifest" href="/site.webmanifest" />`,
          `<meta name="theme-color" content="${themeColor}" />`,
        ].join("\n");
      case "manifest-generator":
        return JSON.stringify(
          {
            name: title,
            short_name: shortName || title.slice(0, 12),
            description: desc,
            start_url: startUrl || "/",
            display,
            background_color: bgColor,
            theme_color: themeColor,
            icons: [
              { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
              { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
            ],
          },
          null,
          2
        );
      default:
        return "";
    }
  };

  const generate = () => {
    if (generating) return;
    setGenerating(true);
    setWaveKey((k) => k + 1);
    window.setTimeout(() => {
      const next = build();
      setOutput(next);
      setHasResult(true);
      setGenerating(false);
      toast.success("Generated");
    }, 420);
  };

  const filename =
    mode === "robots-txt-generator"
      ? "robots.txt"
      : mode === "sitemap-generator"
        ? "sitemap.xml"
        : mode === "manifest-generator"
          ? "manifest.webmanifest"
          : `${mode}.txt`;

  const livePreview =
    mode === "open-graph-generator" ||
    mode === "twitter-card-generator" ||
    mode === "manifest-generator";

  return (
    <ToolWorkbench
      title={meta.title}
      hint={meta.hint}
      controls={
        <div className="space-y-4">
          {mode === "robots-txt-generator" && (
            <>
              <div className="space-y-1.5">
                <Label>User-agent</Label>
                <Input value={userAgent} onChange={(e) => setUserAgent(e.target.value)} placeholder="*" />
              </div>
              <div className="space-y-1.5">
                <Label>Allow paths (one per line)</Label>
                <Textarea value={allowPath} onChange={(e) => setAllowPath(e.target.value)} rows={3} className="font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label>Disallow paths (one per line)</Label>
                <Textarea value={disallow} onChange={(e) => setDisallow(e.target.value)} rows={3} className="font-mono text-xs" placeholder="/admin&#10;/api" />
              </div>
              <div className="space-y-1.5">
                <Label>Site URL (for Sitemap)</Label>
                <Input value={site} onChange={(e) => setSite(e.target.value)} />
              </div>
            </>
          )}

          {mode === "sitemap-generator" && (
            <>
              <div className="space-y-1.5">
                <Label>URLs (one per line)</Label>
                <Textarea value={urls} onChange={(e) => setUrls(e.target.value)} rows={8} className="font-mono text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Change frequency</Label>
                  <Select value={changefreq} onValueChange={setChangefreq}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["1.0", "0.8", "0.6", "0.4", "0.2"].map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {["meta-tag-generator", "open-graph-generator", "twitter-card-generator", "manifest-generator"].includes(mode) && (
            <>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
              </div>
            </>
          )}

          {mode === "meta-tag-generator" && (
            <>
              <div className="space-y-1.5">
                <Label>Canonical URL</Label>
                <Input value={site} onChange={(e) => setSite(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Keywords (optional)</Label>
                <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Theme color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="h-10 w-14 p-1" />
                  <Input value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="font-mono" />
                </div>
              </div>
            </>
          )}

          {["open-graph-generator", "twitter-card-generator"].includes(mode) && (
            <>
              <div className="space-y-1.5">
                <Label>Page URL</Label>
                <Input value={site} onChange={(e) => setSite(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <Input value={image} onChange={(e) => setImage(e.target.value)} />
              </div>
            </>
          )}

          {mode === "open-graph-generator" && (
            <div className="space-y-1.5">
              <Label>OG type</Label>
              <Select value={ogType} onValueChange={setOgType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["website", "article", "product", "profile"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "twitter-card-generator" && (
            <div className="space-y-1.5">
              <Label>Card type</Label>
              <Select value={twitterCard} onValueChange={setTwitterCard}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["summary", "summary_large_image", "app", "player"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "favicon-generator" && (
            <div className="space-y-1.5">
              <Label>Theme color</Label>
              <div className="flex gap-2">
                <Input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="h-10 w-14 p-1" />
                <Input value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="font-mono" />
              </div>
            </div>
          )}

          {mode === "manifest-generator" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Short name</Label>
                  <Input value={shortName} onChange={(e) => setShortName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Start URL</Label>
                  <Input value={startUrl} onChange={(e) => setStartUrl(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Display</Label>
                <Select value={display} onValueChange={setDisplay}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["standalone", "fullscreen", "minimal-ui", "browser"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Theme</Label>
                  <Input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="h-10 w-full p-1" />
                </div>
                <div className="space-y-1.5">
                  <Label>Background</Label>
                  <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full p-1" />
                </div>
              </div>
            </>
          )}

          <ActionRow>
            <PrimaryButton onClick={generate} disabled={generating} className="min-w-32">
              {generating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Generating…
                </>
              ) : hasResult ? (
                "Regenerate"
              ) : (
                "Generate"
              )}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      preview={
        <WebResultPanel
          title={generating ? "Building output…" : hasResult ? "Ready to copy" : "Output"}
          subtitle={hasResult ? `${output.length.toLocaleString()} characters` : undefined}
          empty={!livePreview && !hasResult && !generating}
          emptyTitle="Ready when you are"
          emptyHint="Tune the options, then generate an animated, copy-ready result."
          actions={
            hasResult ? (
              <>
                <CopyButton value={output} label="Copy" className="h-9 rounded-full" />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full"
                  onClick={() => {
                    downloadText(output, filename);
                    toast.success("Downloaded");
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </>
            ) : undefined
          }
        >
          <div className="space-y-4">
            {(mode === "open-graph-generator" || mode === "twitter-card-generator") && (
              <SocialSharePreview
                variant={mode === "open-graph-generator" ? "og" : "twitter"}
                title={title}
                description={desc}
                image={image}
                site={site}
              />
            )}
            {mode === "manifest-generator" && (
              <div className="web-preview-card flex items-center gap-3 rounded-2xl border border-border/50 bg-gradient-to-br from-rose-500/10 via-background to-fuchsia-500/5 p-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-sm"
                  style={{ background: themeColor }}
                >
                  {(shortName || title || "A").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold tracking-tight">{title}</p>
                  <p className="truncate text-sm text-muted-foreground">{shortName} · {display}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            )}
            <div
              key={waveKey}
              className={cn(
                "overflow-hidden rounded-2xl border border-border/50 bg-muted/20",
                generating ? "web-gen-shimmer blog-title-pulse" : hasResult ? "animate-rise blog-title-card" : ""
              )}
            >
              <pre className="max-h-[28rem] overflow-auto p-4 font-mono text-[12px] leading-relaxed">
                {hasResult || generating ? output : "Your generated markup will appear here."}
              </pre>
            </div>
          </div>
        </WebResultPanel>
      }
    />
  );
}

function CodeWebTool({ mode }: { mode: CodeMode }) {
  const meta = CODE_META[mode];
  const [code, setCode] = useState(meta.sample);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  useEffect(() => {
    setCode(CODE_META[mode].sample);
    setOutput("");
    setHasResult(false);
    setBusy(false);
    setWaveKey((k) => k + 1);
  }, [mode]);

  const transform = useMemo(() => {
    if (mode === "css-minifier") return minifyCss;
    if (mode === "js-minifier") return minifyJs;
    if (mode === "html-minifier") return minifyHtml;
    if (mode === "html-beautifier") return (input: string) => simpleBeautify(input.replace(/>\s*</g, ">\n<"), "<", ">");
    return simpleBeautify;
  }, [mode]);

  const run = () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    setWaveKey((k) => k + 1);
    window.setTimeout(() => {
      const next = transform(code);
      setOutput(next);
      setHasResult(true);
      setBusy(false);
      toast.success(mode.includes("minifier") ? "Minified" : "Beautified");
    }, 450);
  };

  const saved = hasResult ? code.length - output.length : 0;
  const isMinify = mode.includes("minifier");
  const ratio =
    hasResult && code.length > 0
      ? Math.round((Math.max(0, saved) / code.length) * 100)
      : 0;

  return (
    <ToolWorkbench
      title={meta.title}
      hint={meta.hint}
      controls={
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" className="h-8 rounded-full" onClick={() => setCode(meta.sample)}>
              Load sample
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-8 rounded-full" onClick={() => setCode("")}>
              Clear
            </Button>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label>Input</Label>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {code.length.toLocaleString()} chars
              </span>
            </div>
            <Textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setHasResult(false);
              }}
              rows={14}
              className="font-mono text-xs leading-relaxed"
              spellCheck={false}
            />
          </div>
          <ActionRow>
            <PrimaryButton onClick={run} disabled={busy || !code.trim()} className="min-w-36">
              {busy ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Working…
                </>
              ) : (
                <>
                  {isMinify ? <Wand2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  {meta.action}
                </>
              )}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      preview={
        <WebResultPanel
          title={busy ? "Processing…" : hasResult ? "Transformed code" : "Output"}
          subtitle={
            hasResult
              ? isMinify
                ? `Saved ${Math.max(0, saved).toLocaleString()} chars (${ratio}%) · ${output.length.toLocaleString()} out`
                : `${output.length.toLocaleString()} characters`
              : `${code.length.toLocaleString()} in`
          }
          empty={!hasResult && !busy}
          emptyTitle="Transform your code"
          emptyHint="Paste code or load a sample, then run for an animated result."
          actions={
            hasResult ? (
              <>
                <CopyButton value={output} label="Copy" className="h-9 rounded-full" />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full"
                  onClick={() => {
                    setCode(output);
                    toast.success("Moved to input");
                  }}
                >
                  Use in editor
                </Button>
              </>
            ) : undefined
          }
        >
          <div className="space-y-3">
            {hasResult && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-muted/20 px-3 py-2 animate-rise">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Before</p>
                  <p className="font-display text-xl font-semibold tabular-nums">{code.length.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 px-3 py-2 animate-rise" style={{ animationDelay: "60ms" }}>
                  <p className="text-[11px] uppercase tracking-wider text-rose-600">After</p>
                  <p className="font-display text-xl font-semibold tabular-nums">{output.length.toLocaleString()}</p>
                </div>
                {isMinify && (
                  <div className="col-span-2 rounded-2xl border border-border/50 bg-muted/20 px-3 py-2 animate-rise sm:col-span-1" style={{ animationDelay: "120ms" }}>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Saved</p>
                    <p className="font-display text-xl font-semibold tabular-nums">{ratio}%</p>
                  </div>
                )}
              </div>
            )}
            <CodeOutput
              key={waveKey}
              value={hasResult || busy ? output : ""}
              language={codeLanguage(mode)}
              filename={codeFilename(mode)}
              title={busy ? "Processing…" : hasResult ? "Transformed code" : "Output"}
              emptyMessage="Result appears here after you run the tool."
              rows={14}
              animate={hasResult && !busy}
            />
          </div>
        </WebResultPanel>
      }
    />
  );
}

function codeLanguage(mode: CodeMode): CodeLanguage {
  if (mode.includes("css")) return "css";
  if (mode.includes("js")) return "js";
  if (mode.includes("html")) return "html";
  return "plain";
}

function codeFilename(mode: CodeMode) {
  if (mode.includes("css")) return "output.css";
  if (mode.includes("js")) return "output.js";
  if (mode.includes("html")) return "output.html";
  return "output.txt";
}

const SEO_MODES: SeoMode[] = [
  "robots-txt-generator",
  "sitemap-generator",
  "meta-tag-generator",
  "open-graph-generator",
  "twitter-card-generator",
  "favicon-generator",
  "manifest-generator",
];

const CODE_MODES: CodeMode[] = [
  "css-minifier",
  "js-minifier",
  "html-minifier",
  "js-beautifier",
  "html-beautifier",
];

export function WebSuiteTool({ mode }: { mode: WebSuiteMode }) {
  if (mode === "css-beautifier") return <CssBeautifierTool />;
  if ((SEO_MODES as readonly string[]).includes(mode)) return <SeoWebTool mode={mode as SeoMode} />;
  if ((CODE_MODES as readonly string[]).includes(mode)) return <CodeWebTool mode={mode as CodeMode} />;
  return null;
}
