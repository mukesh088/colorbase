"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, Heart, RefreshCw, Search, Sparkles, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, downloadText } from "@/lib/utils";
import {
  FANCY_EMOJI_PACKS,
  FANCY_FRAMES,
  FONT_STYLE_CATEGORIES,
  FONT_STYLE_COUNT,
  FONT_STYLES,
  SAMPLE_PHRASES,
  composeFancyText,
  filterGeneratedStyles,
  generateFontStyles,
  stylesToTextFile,
  type FontStyleCategory,
} from "@/lib/fonts/generator";
import "./font-generator.css";

type PreviewSurface = "white" | "black" | "brand";
type StudioTab = "gallery" | "builder";

const PAGE_SIZE = 48;
const BUILDER_BASE_IDS = new Set([
  "script",
  "bold-script",
  "bold-sans",
  "italic-sans",
  "bold-serif",
  "italic-serif",
  "fraktur",
  "double-struck",
  "small-caps",
  "bubble",
  "mono",
  "fullwidth",
  "sans",
  "wire",
  "currency",
]);

function useCopiedFlash() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  async function copy(id: string, value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      toast.success(`Copied ${label}`);
      window.setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1400);
    } catch {
      toast.error("Clipboard blocked — select the text and copy manually");
    }
  }
  return { copiedId, copy };
}

export function FontGenerator() {
  const [text, setText] = useState("Your Name");
  const [category, setCategory] = useState<FontStyleCategory>("all");
  const [query, setQuery] = useState("");
  const [surface, setSurface] = useState<PreviewSurface>("white");
  const [ink, setInk] = useState("#e11d48");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [tab, setTab] = useState<StudioTab>("gallery");
  const [builderStyle, setBuilderStyle] = useState("script");
  const [frameId, setFrameId] = useState("none");
  const [emojiLeft, setEmojiLeft] = useState("✨");
  const [emojiRight, setEmojiRight] = useState("✨");
  const [emojiPack, setEmojiPack] = useState(FANCY_EMOJI_PACKS[0].id);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { copiedId, copy } = useCopiedFlash();

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [text, category, query, showFavoritesOnly, tab]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("colorbase-font-generator-favorites");
      if (raw) setFavorites(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("colorbase-font-generator-favorites", JSON.stringify(favorites));
    } catch {
      /* ignore */
    }
  }, [favorites]);

  const styles = useMemo(() => {
    let list = generateFontStyles(text, category);
    list = filterGeneratedStyles(list, query);
    if (showFavoritesOnly) list = list.filter((s) => favorites.includes(s.id));
    return list;
  }, [text, category, query, showFavoritesOnly, favorites]);

  const customFancy = useMemo(
    () =>
      composeFancyText(text, {
        styleId: builderStyle,
        frameId,
        emojiLeft,
        emojiRight,
      }),
    [text, builderStyle, frameId, emojiLeft, emojiRight]
  );

  const previewBg = surface === "white" ? "#ffffff" : surface === "black" ? "#0b1020" : ink;
  const previewFg =
    surface === "brand"
      ? ink.toLowerCase() === "#ffffff"
        ? "#0f172a"
        : "#ffffff"
      : surface === "black"
        ? "#f8fafc"
        : "#0f172a";

  const activePack = FANCY_EMOJI_PACKS.find((p) => p.id === emojiPack) ?? FANCY_EMOJI_PACKS[0];
  const cursiveStyles = FONT_STYLES.filter((s) => BUILDER_BASE_IDS.has(s.id));
  const visibleStyles = styles.slice(0, visibleCount);
  const hasMore = visibleCount < styles.length;
  const heroValue = tab === "builder" ? customFancy || text : styles[0]?.value || text;

  function toggleFavorite(id: string) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function randomSample() {
    const next = SAMPLE_PHRASES[Math.floor(Math.random() * SAMPLE_PHRASES.length)] ?? "ColorBase";
    setText(next);
  }

  function exportAll() {
    const all = generateFontStyles(text, "all");
    const custom = customFancy
      ? [{ id: "custom", label: "Custom fancyText", category: "emoji" as const, blurb: "Builder", value: customFancy }]
      : [];
    downloadText(stylesToTextFile([...custom, ...all], text), "colorbase-fancy-text.txt", "text/plain");
  }

  function pickEmoji(side: "left" | "right" | "both", emoji: string) {
    if (side === "left") setEmojiLeft(emoji);
    else if (side === "right") setEmojiRight(emoji);
    else {
      setEmojiLeft(emoji);
      setEmojiRight(emoji);
    }
  }

  return (
    <div className="fg-studio">
      <div className="fg-shell">
        <div className="fg-shell-head">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="fg-kicker">Fancy text studio</p>
              <h2 className="fg-title">Font generator</h2>
              <p className="fg-muted mt-1 max-w-2xl">
                {FONT_STYLE_COUNT.toLocaleString()}+ stylish Unicode fonts — cursive, bold, gothic, bubble, and emoji
                frames for bios and captions.
              </p>
            </div>
            <div className="fg-toolbar">
              <div className="fg-seg" role="tablist" aria-label="Studio mode">
                <button type="button" className={cn(tab === "gallery" && "is-active")} onClick={() => setTab("gallery")}>
                  <Type className="h-3.5 w-3.5" />
                  Gallery
                </button>
                <button type="button" className={cn(tab === "builder" && "is-active")} onClick={() => setTab("builder")}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Builder
                </button>
              </div>
              <Button variant="outline" size="sm" className="rounded-full" onClick={randomSample}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Surprise
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={exportAll} disabled={!text.trim()}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>
        </div>

        <div className="fg-composer">
          <label className="grid gap-2">
            <span className="fg-section-label mb-0">Your text</span>
            <textarea
              className="fg-input"
              value={text}
              maxLength={280}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a name, bio, or caption…"
              aria-label="Text to stylize"
            />
            <span className="fg-muted text-xs">{text.length}/280 characters</span>
          </label>

          <div className="fg-hero" style={{ background: previewBg, color: previewFg }}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-65">Live preview</p>
              <p className="fg-hero-copy">{heroValue || "Type to generate fancy text"}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="rounded-full"
                disabled={!heroValue.trim()}
                onClick={() =>
                  copy(
                    "hero",
                    tab === "builder" ? customFancy : styles[0]?.value ?? text,
                    tab === "builder" ? "custom fancyText" : styles[0]?.label ?? "style"
                  )
                }
              >
                {copiedId === "hero" ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                Copy preview
              </Button>
              <span className="text-xs opacity-70">
                {tab === "builder"
                  ? "Custom mix"
                  : `${styles.length.toLocaleString()} matches`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {tab === "builder" ? (
        <div className="fg-builder">
          <div className="fg-panel space-y-5">
            <div>
              <p className="fg-section-label">Base font</p>
              <div className="fg-chip-scroll">
                {cursiveStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    className={cn("fg-chip", builderStyle === style.id && "is-active")}
                    onClick={() => setBuilderStyle(style.id)}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="fg-section-label">Frame</p>
              <div className="fg-chip-scroll">
                {FANCY_FRAMES.slice(0, 18).map((frame) => (
                  <button
                    key={frame.id}
                    type="button"
                    className={cn("fg-chip", frameId === frame.id && "is-active")}
                    onClick={() => setFrameId(frame.id)}
                  >
                    {frame.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="fg-section-label">Emoji pack</p>
              <div className="fg-chip-scroll mb-3">
                {FANCY_EMOJI_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    className={cn("fg-chip", emojiPack === pack.id && "is-active")}
                    onClick={() => setEmojiPack(pack.id)}
                  >
                    {pack.label}
                  </button>
                ))}
              </div>
              <div className="fg-emoji-grid">
                {activePack.items.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="fg-emoji-btn"
                    onClick={() => pickEmoji("both", emoji)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      pickEmoji("right", emoji);
                    }}
                    title="Click both sides · right-click right only"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  Left
                  <input
                    className="w-16 rounded-xl border bg-background px-2 py-1.5 text-center text-lg"
                    style={{ borderColor: "var(--border)" }}
                    value={emojiLeft}
                    onChange={(e) => setEmojiLeft(e.target.value)}
                  />
                </label>
                <label className="inline-flex items-center gap-2">
                  Right
                  <input
                    className="w-16 rounded-xl border bg-background px-2 py-1.5 text-center text-lg"
                    style={{ borderColor: "var(--border)" }}
                    value={emojiRight}
                    onChange={(e) => setEmojiRight(e.target.value)}
                  />
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setEmojiLeft("");
                    setEmojiRight("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="fg-panel space-y-3">
            <h3 className="fg-panel-title">Your fancyText</h3>
            <div className="fg-result" style={{ background: previewBg, color: previewFg }}>
              {customFancy || "Add text to build a style"}
            </div>
            <div className="fg-toolbar">
              <Button className="rounded-full" onClick={() => copy("custom", customFancy, "custom fancyText")} disabled={!customFancy}>
                <Copy className="mr-1.5 h-4 w-4" />
                Copy fancyText
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => downloadText(customFancy, "fancy-text.txt", "text/plain")}
                disabled={!customFancy}
              >
                Save TXT
              </Button>
            </div>
            <p className="fg-muted text-xs">
              Mix cursive Unicode fonts with emoji frames for Instagram, TikTok, Discord, and WhatsApp.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="fg-panel space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="fg-section-label mb-0">Filters</p>
              <div className="fg-toolbar">
                {(
                  [
                    ["white", "White"],
                    ["black", "Black"],
                    ["brand", "Accent"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={cn("fg-chip", surface === id && "is-active")}
                    onClick={() => setSurface(id)}
                  >
                    {label}
                  </button>
                ))}
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="color" value={ink} onChange={(e) => setInk(e.target.value)} aria-label="Accent color" />
                </label>
              </div>
            </div>

            <div className="fg-chip-scroll">
              {FONT_STYLE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={cn("fg-chip", category === c.id && "is-active")}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
              <button
                type="button"
                className={cn("fg-chip", showFavoritesOnly && "is-active")}
                onClick={() => setShowFavoritesOnly((v) => !v)}
              >
                ♥ Favorites ({favorites.length})
              </button>
            </div>

            <div className="fg-search">
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cursive, emoji, gothic, bubble…"
                aria-label="Search styles"
              />
            </div>
          </div>

          <div className="fg-grid">
            {styles.length === 0 ? (
              <div className="fg-empty">
                <Type className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-semibold">No styles match</p>
                <p className="fg-muted mt-1">Try another category or clear search / favorites.</p>
              </div>
            ) : (
              visibleStyles.map((style) => {
                const fav = favorites.includes(style.id);
                const copied = copiedId === style.id;
                return (
                  <article key={style.id} className="fg-card">
                    <div className="fg-card-top">
                      <div>
                        <p className="fg-card-label">{style.label}</p>
                        <p className="fg-card-blurb">{style.blurb}</p>
                      </div>
                      <button
                        type="button"
                        className="fg-icon-btn"
                        aria-label={fav ? "Remove favorite" : "Save favorite"}
                        onClick={() => toggleFavorite(style.id)}
                      >
                        <Heart className={cn("h-4 w-4", fav && "fill-rose-500 text-rose-500")} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="fg-preview"
                      style={{ background: previewBg, color: previewFg }}
                      onClick={() => copy(style.id, style.value, style.label)}
                      title="Click to copy"
                    >
                      {style.value}
                    </button>
                    <div className="fg-card-foot">
                      <span className="fg-tag">{style.category}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full"
                        onClick={() => copy(style.id, style.value, style.label)}
                      >
                        {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {styles.length > 0 && (
            <div className="fg-panel">
              <div className="fg-footer">
                <p className="fg-muted text-sm">
                  Showing {Math.min(visibleCount, styles.length).toLocaleString()} of{" "}
                  {styles.length.toLocaleString()} styles
                </p>
                <div className="fg-toolbar">
                  {hasMore && (
                    <Button className="rounded-full" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
                      Load more
                    </Button>
                  )}
                  {visibleCount > PAGE_SIZE && (
                    <Button variant="outline" className="rounded-full" onClick={() => setVisibleCount(PAGE_SIZE)}>
                      Collapse
                    </Button>
                  )}
                  {hasMore && (
                    <Button variant="outline" className="rounded-full" onClick={() => setVisibleCount(styles.length)}>
                      Show all
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="fg-panel">
        <div className="fg-footer">
          <p className="fg-muted max-w-2xl text-sm">
            Unicode fancy fonts paste into Instagram, TikTok, Discord, and WhatsApp. For website CSS fonts, use
            Typography Generator.
          </p>
          <div className="fg-links">
            <Link href="/typography-generator">Typography CSS</Link>
            <Link href="/fancy-text-generator">Fancy text</Link>
            <Link href="/text-shadow-generator">Text shadow</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
