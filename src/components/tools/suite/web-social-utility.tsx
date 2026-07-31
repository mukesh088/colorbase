"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToolWorkbench, OutputBox, ActionRow, PrimaryButton } from "./workbench";
import { minifyCss, minifyHtml, minifyJs, simpleBeautify } from "./helpers";
import type { SocialSuiteMode, UtilitySuiteMode, WebSuiteMode } from "@/lib/suite-modes";

export type { WebSuiteMode, SocialSuiteMode, UtilitySuiteMode };
export { isWebSuite, isSocialSuite, isUtilitySuite } from "@/lib/suite-modes";

const FIRST = ["Ava", "Noah", "Mia", "Liam", "Zoe", "Kai", "Luna", "Ezra", "Ivy", "Leo"];
const LAST = ["Harper", "Brooks", "Reed", "Hayes", "Quinn", "Blake", "Rowe", "Sloan", "West", "Lane"];

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  return { score, label: labels[score] ?? "Very weak" };
}

function fancyIg(text: string) {
  const map: Record<string, string> = {
    a: "𝓪", b: "𝓫", c: "𝓬", d: "𝓭", e: "𝓮", f: "𝓯", g: "𝓰", h: "𝓱", i: "𝓲", j: "𝓳",
    k: "𝓴", l: "𝓵", m: "𝓶", n: "𝓷", o: "𝓸", p: "𝓹", q: "𝓺", r: "𝓻", s: "𝓼", t: "𝓽",
    u: "𝓾", v: "𝓿", w: "𝔀", x: "𝔁", y: "𝔂", z: "𝔃",
  };
  return text
    .split("")
    .map((ch) => map[ch.toLowerCase()] ?? ch)
    .join("");
}

export function WebSuiteTool({ mode }: { mode: WebSuiteMode }) {
  const [site, setSite] = useState("https://example.com");
  const [title, setTitle] = useState("colorBase");
  const [desc, setDesc] = useState("Free modern color tools for designers and developers.");
  const [image, setImage] = useState("https://example.com/og.png");
  const [urls, setUrls] = useState("https://example.com/\nhttps://example.com/colors\nhttps://example.com/tools");
  const [code, setCode] = useState(".btn { color: #e11d48; padding: 12px 20px; }");

  const output = useMemo(() => {
    switch (mode) {
      case "robots-txt-generator":
        return `User-agent: *\nAllow: /\nSitemap: ${site.replace(/\/$/, "")}/sitemap.xml`;
      case "sitemap-generator":
        return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .split("\n")
          .map((u) => u.trim())
          .filter(Boolean)
          .map((u) => `  <url>\n    <loc>${u}</loc>\n  </url>`)
          .join("\n")}\n</urlset>`;
      case "meta-tag-generator":
        return `<title>${title}</title>\n<meta name="description" content="${desc}" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n<link rel="canonical" href="${site}" />`;
      case "open-graph-generator":
        return `<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${desc}" />\n<meta property="og:image" content="${image}" />\n<meta property="og:url" content="${site}" />\n<meta property="og:type" content="website" />`;
      case "twitter-card-generator":
        return `<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${desc}" />\n<meta name="twitter:image" content="${image}" />`;
      case "favicon-generator":
        return `<link rel="icon" href="/favicon.ico" sizes="any" />\n<link rel="icon" href="/icon.svg" type="image/svg+xml" />\n<link rel="apple-touch-icon" href="/apple-touch-icon.png" />\n<link rel="manifest" href="/site.webmanifest" />`;
      case "manifest-generator":
        return JSON.stringify(
          {
            name: title,
            short_name: title.slice(0, 12),
            description: desc,
            start_url: "/",
            display: "standalone",
            background_color: "#fff7fa",
            theme_color: "#e11d48",
            icons: [
              { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
              { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
            ],
          },
          null,
          2
        );
      case "css-minifier":
        return minifyCss(code);
      case "js-minifier":
        return minifyJs(code);
      case "html-minifier":
        return minifyHtml(code);
      case "css-beautifier":
        return simpleBeautify(code);
      case "js-beautifier":
        return simpleBeautify(code);
      case "html-beautifier":
        return simpleBeautify(code.replace(/>\s*</g, ">\n<"), "<", ">");
      default:
        return "";
    }
  }, [mode, site, title, desc, image, urls, code]);

  const isCode = mode.includes("minifier") || mode.includes("beautifier");

  return (
    <ToolWorkbench
      controls={
        <div className="space-y-3">
          {isCode ? (
            <div className="space-y-1.5"><Label>Code</Label><Textarea value={code} onChange={(e) => setCode(e.target.value)} rows={14} className="font-mono text-xs" /></div>
          ) : (
            <>
              {mode !== "sitemap-generator" && (
                <>
                  <div className="space-y-1.5"><Label>Site URL</Label><Input value={site} onChange={(e) => setSite(e.target.value)} /></div>
                  {!["robots-txt-generator", "favicon-generator"].includes(mode) && (
                    <>
                      <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                      <div className="space-y-1.5"><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} /></div>
                    </>
                  )}
                  {["open-graph-generator", "twitter-card-generator"].includes(mode) && (
                    <div className="space-y-1.5"><Label>Image URL</Label><Input value={image} onChange={(e) => setImage(e.target.value)} /></div>
                  )}
                </>
              )}
              {mode === "sitemap-generator" && (
                <div className="space-y-1.5"><Label>URLs (one per line)</Label><Textarea value={urls} onChange={(e) => setUrls(e.target.value)} rows={10} className="font-mono text-xs" /></div>
              )}
            </>
          )}
        </div>
      }
      output={<OutputBox value={output} rows={14} />}
    />
  );
}

export function SocialSuiteTool({ mode }: { mode: SocialSuiteMode }) {
  const [topic, setTopic] = useState("color design tips");
  const [tick, setTick] = useState(0);

  const output = useMemo(() => {
    void tick;
    const words = topic
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
    switch (mode) {
      case "hashtag-generator":
        return words
          .flatMap((w) => [`#${w}`, `#${w}tips`, `#best${w}`, `#${w}life`])
          .slice(0, 20)
          .join(" ");
      case "instagram-font-generator":
        return fancyIg(topic);
      case "youtube-tag-generator":
        return [...words, `${topic} tutorial`, `${topic} guide`, `how to ${topic}`, "beginner", "2026"]
          .map((t) => t.trim())
          .filter(Boolean)
          .join(", ");
      case "youtube-title-generator":
        return [
          `${topic}: The Complete Guide (2026)`,
          `I Tried ${topic} for 30 Days — Here's What Happened`,
          `${topic} Tips You Need Right Now`,
          `Stop Making These ${topic} Mistakes`,
          `How to Master ${topic} Fast`,
        ].join("\n");
      case "meta-description-generator": {
        const base = `Discover practical ${topic} advice, examples, and tools to improve your results today.`;
        return `${base.slice(0, 155)}${base.length > 155 ? "…" : ""}\n\n(${Math.min(base.length, 155)} chars)`;
      }
      case "blog-title-generator":
        return [
          `10 Proven ${topic} Strategies That Work`,
          `The Ultimate Beginner's Guide to ${topic}`,
          `Why ${topic} Matters More Than Ever`,
          `${topic} Checklist for Busy Creators`,
          `From Zero to Pro: ${topic} Explained`,
        ].join("\n");
      default:
        return topic;
    }
  }, [mode, topic, tick]);

  return (
    <ToolWorkbench
      controls={
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Topic / keywords</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} /></div>
          <ActionRow>
            <PrimaryButton onClick={() => setTick((n) => n + 1)}>Regenerate</PrimaryButton>
          </ActionRow>
        </div>
      }
      output={<OutputBox value={output} rows={10} />}
    />
  );
}

export function UtilitySuiteTool({ mode }: { mode: UtilitySuiteMode }) {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("P@ssw0rd123!");
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [sides, setSides] = useState(6);
  const [count, setCount] = useState(2);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 19));
  const [unix, setUnix] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [result, setResult] = useState("");

  const generate = () => {
    switch (mode) {
      case "password-generator": {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
        let out = "";
        const arr = new Uint32Array(length);
        crypto.getRandomValues(arr);
        for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length];
        setResult(out);
        break;
      }
      case "password-strength-checker": {
        const s = passwordStrength(password);
        setResult(`Strength: ${s.label} (${s.score}/5)\nLength: ${password.length}\nHas upper: ${/[A-Z]/.test(password)}\nHas number: ${/[0-9]/.test(password)}\nHas symbol: ${/[^A-Za-z0-9]/.test(password)}`);
        break;
      }
      case "random-number-generator": {
        const lo = Math.min(min, max);
        const hi = Math.max(min, max);
        setResult(String(Math.floor(Math.random() * (hi - lo + 1)) + lo));
        break;
      }
      case "random-name-generator":
        setResult(
          Array.from({ length: 8 }, () => `${FIRST[Math.floor(Math.random() * FIRST.length)]} ${LAST[Math.floor(Math.random() * LAST.length)]}`).join("\n")
        );
        break;
      case "dice-roller":
        setResult(
          Array.from({ length: count }, (_, i) => `Die ${i + 1}: ${1 + Math.floor(Math.random() * sides)}`).join("\n")
        );
        break;
      case "coin-flip":
        setResult(Math.random() < 0.5 ? "Heads" : "Tails");
        break;
      case "timestamp-converter": {
        const ms = new Date(date).getTime();
        setResult(`ISO: ${new Date(ms).toISOString()}\nUnix (s): ${Math.floor(ms / 1000)}\nUnix (ms): ${ms}\nLocal: ${new Date(ms).toString()}`);
        break;
      }
      case "unix-timestamp-converter": {
        const n = Number(unix);
        const ms = n > 1e12 ? n : n * 1000;
        setResult(`Unix input: ${unix}\nISO: ${new Date(ms).toISOString()}\nLocal: ${new Date(ms).toString()}`);
        break;
      }
    }
  };

  return (
    <ToolWorkbench
      controls={
        <div className="space-y-3">
          {mode === "password-generator" && (
            <div className="space-y-1.5"><Label>Length {length}</Label><Input type="number" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} /></div>
          )}
          {mode === "password-strength-checker" && (
            <div className="space-y-1.5"><Label>Password</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          )}
          {mode === "random-number-generator" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Min</Label><Input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} /></div>
              <div className="space-y-1.5"><Label>Max</Label><Input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} /></div>
            </div>
          )}
          {mode === "dice-roller" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Sides</Label><Input type="number" value={sides} onChange={(e) => setSides(Number(e.target.value))} /></div>
              <div className="space-y-1.5"><Label>Count</Label><Input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} /></div>
            </div>
          )}
          {mode === "timestamp-converter" && (
            <div className="space-y-1.5"><Label>Date/time</Label><Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="YYYY-MM-DDTHH:mm:ss" /></div>
          )}
          {mode === "unix-timestamp-converter" && (
            <div className="space-y-1.5"><Label>Unix timestamp</Label><Input value={unix} onChange={(e) => setUnix(e.target.value)} /></div>
          )}
          <ActionRow>
            <PrimaryButton onClick={generate}>
              {mode === "coin-flip"
                ? "Flip coin"
                : mode === "password-strength-checker"
                  ? "Check strength"
                  : mode === "password-generator"
                    ? "Generate password"
                    : "Generate"}
            </PrimaryButton>
          </ActionRow>
        </div>
      }
      output={<OutputBox value={result || "Click generate to see results"} rows={8} />}
    />
  );
}
