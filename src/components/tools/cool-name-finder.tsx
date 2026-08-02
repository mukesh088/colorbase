"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Dice5,
  Heart,
  History,
  Pencil,
  Search,
  Smile,
  Sparkles,
  Star,
  Trash2,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/tools/suite/workbench";
import {
  COOL_EDITOR_EMOJIS,
  COOL_EDITOR_FONTS,
  COOL_EDITOR_FRAMES,
  COOL_NAME_CATEGORIES,
  COOL_PREVIEW_FONTS,
  applyCoolEditorFont,
  filterCoolNames,
  generateCoolNames,
  generateRandomCoolNames,
  googleFontsHref,
  wrapCoolEditorFrame,
  type CoolNameCategory,
  type CoolNameVariant,
} from "@/lib/cool-names";
import { cn } from "@/lib/utils";

const FAV_KEY = "colorbase-cool-name-favorites";
const RECENT_KEY = "colorbase-cool-name-recent";
const FONTS_HREF = googleFontsHref(COOL_PREVIEW_FONTS);

function loadList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 40) : [];
  } catch {
    return [];
  }
}

function saveList(key: string, items: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(0, 40)));
  } catch {
    /* ignore quota */
  }
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
  toast.success("Copied to clipboard");
}

function useGoogleFonts(href: string, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !href) return;
    const id = "cool-name-finder-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [href, enabled]);
}

function insertAtSelection(
  value: string,
  insert: string,
  start: number,
  end: number
): { next: string; caret: number } {
  const next = value.slice(0, start) + insert + value.slice(end);
  return { next, caret: start + insert.length };
}

function CoolNameEditorDialog({
  open,
  initial,
  favorites,
  onOpenChange,
  onCopy,
  onToggleFav,
}: {
  open: boolean;
  initial: string;
  favorites: string[];
  onOpenChange: (open: boolean) => void;
  onCopy: (value: string) => void;
  onToggleFav: (value: string) => void;
}) {
  const [text, setText] = useState(initial);
  const [unicodeFont, setUnicodeFont] = useState("plain");
  const [previewFont, setPreviewFont] = useState("system");
  const [frameId, setFrameId] = useState("none");
  const [emojiTab, setEmojiTab] = useState(COOL_EDITOR_EMOJIS[0]!.label);
  const [toolTab, setToolTab] = useState<"fonts" | "emoji" | "frames">("fonts");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const selRef = useRef({ start: 0, end: 0 });
  const favorited = favorites.includes(text);

  useGoogleFonts(FONTS_HREF, open);

  useEffect(() => {
    if (open) {
      setText(initial);
      setUnicodeFont("plain");
      setFrameId("none");
      setPreviewFont("system");
      window.setTimeout(() => {
        taRef.current?.focus();
        taRef.current?.setSelectionRange(initial.length, initial.length);
        selRef.current = { start: initial.length, end: initial.length };
      }, 50);
    }
  }, [open, initial]);

  const previewFamily =
    COOL_PREVIEW_FONTS.find((f) => f.id === previewFont)?.family ?? "inherit";

  const rememberSel = () => {
    const el = taRef.current;
    if (!el) return;
    selRef.current = { start: el.selectionStart, end: el.selectionEnd };
  };

  const replaceSelectionOrAll = useCallback((transform: (chunk: string) => string) => {
    const el = taRef.current;
    const { start, end } = selRef.current;
    const hasSel = el && start !== end;
    if (hasSel) {
      const chunk = text.slice(start, end);
      const mapped = transform(chunk);
      const { next, caret } = insertAtSelection(text, mapped, start, end);
      setText(next);
      window.setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + mapped.length);
        selRef.current = { start, end: start + mapped.length };
        void caret;
      }, 0);
    } else {
      setText(transform(text));
    }
  }, [text]);

  const insertSnippet = useCallback(
    (snippet: string) => {
      const { start, end } = selRef.current;
      const { next, caret } = insertAtSelection(text, snippet, start, end);
      setText(next);
      window.setTimeout(() => {
        const el = taRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(caret, caret);
        selRef.current = { start: caret, end: caret };
      }, 0);
    },
    [text]
  );

  const applyFont = (fontId: string) => {
    setUnicodeFont(fontId);
    replaceSelectionOrAll((chunk) => applyCoolEditorFont(chunk, fontId));
  };

  const applyFrame = (id: string) => {
    setFrameId(id);
    setText((prev) => wrapCoolEditorFrame(prev, id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-3xl">
        <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/15 via-fuchsia-500/5 to-transparent px-5 py-4 pr-12">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-display text-xl">Edit cool name</DialogTitle>
            <DialogDescription>
              Tweak text, apply fancy Unicode fonts, add emoji, wrap frames, then copy.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(92vh-5rem)] space-y-4 overflow-y-auto p-4 sm:p-5">
          {/* Live preview */}
          <div
            className="flex min-h-[5.5rem] items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-rose-500/10 via-background to-fuchsia-500/10 px-4 py-6 text-center"
            style={{ fontFamily: previewFamily }}
          >
            <p className="break-all text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
              {text || "Your cool name"}
            </p>
          </div>

          {/* Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="cool-name-editor">Nickname text</Label>
              <span className="text-[11px] text-muted-foreground">{text.length} chars</span>
            </div>
            <Textarea
              id="cool-name-editor"
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onSelect={rememberSel}
              onKeyUp={rememberSel}
              onClick={rememberSel}
              rows={3}
              className="min-h-[5.5rem] resize-y rounded-2xl border-border/60 bg-muted/15 text-lg leading-relaxed"
              placeholder="Type or paste your nickname…"
              style={{ fontFamily: previewFamily }}
            />
          </div>

          {/* Tool tabs */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "fonts" as const, label: "Fancy fonts", icon: Type },
                { id: "emoji" as const, label: "Emoji", icon: Smile },
                { id: "frames" as const, label: "Frames", icon: Sparkles },
              ] as const
            ).map((tab) => (
              <Button
                key={tab.id}
                type="button"
                size="sm"
                variant={toolTab === tab.id ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setToolTab(tab.id)}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Button>
            ))}
          </div>

          {toolTab === "fonts" && (
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Unicode fonts <span className="font-normal">(copied to clipboard)</span>
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {COOL_EDITOR_FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFont(f.id)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left transition hover:border-rose-400/50 hover:bg-rose-500/5",
                        unicodeFont === f.id
                          ? "border-rose-500/50 bg-rose-500/10"
                          : "border-border/50 bg-background/80"
                      )}
                    >
                      <span className="block truncate text-base leading-tight">{f.sample}</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preview font <span className="font-normal">(display only)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {COOL_PREVIEW_FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPreviewFont(f.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition",
                        previewFont === f.id
                          ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                          : "border-border/50 text-muted-foreground hover:border-rose-400/30"
                      )}
                      style={{ fontFamily: f.family }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {toolTab === "emoji" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {COOL_EDITOR_EMOJIS.map((g) => (
                  <Button
                    key={g.label}
                    type="button"
                    size="sm"
                    variant={emojiTab === g.label ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setEmojiTab(g.label)}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                {(COOL_EDITOR_EMOJIS.find((g) => g.label === emojiTab)?.items ?? []).map((e) => (
                  <button
                    key={e}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertSnippet(e)}
                    className="flex h-11 items-center justify-center rounded-xl border border-border/50 bg-muted/15 text-xl transition hover:border-rose-400/40 hover:bg-rose-500/10"
                    title={`Insert ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {toolTab === "frames" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COOL_EDITOR_FRAMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFrame(f.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left transition hover:border-rose-400/50 hover:bg-rose-500/5",
                    frameId === f.id
                      ? "border-rose-500/50 bg-rose-500/10"
                      : "border-border/50 bg-background/80"
                  )}
                >
                  <span className="block truncate text-sm">{f.wrap("Name")}</span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">{f.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-border/40 pt-4">
            <PrimaryButton
              type="button"
              className="rounded-full"
              disabled={!text.trim()}
              onClick={() => {
                onCopy(text);
                onOpenChange(false);
              }}
            >
              <Copy className="h-4 w-4" />
              Copy name
            </PrimaryButton>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!text.trim()}
              onClick={() => onToggleFav(text)}
            >
              <Heart className={cn("h-4 w-4", favorited && "fill-rose-500 text-rose-500")} />
              {favorited ? "Unfavorite" : "Favorite"}
            </Button>
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NameCard({
  item,
  favorited,
  onCopy,
  onEdit,
  onToggleFav,
  highlight,
}: {
  item: CoolNameVariant;
  favorited: boolean;
  onCopy: (value: string) => void;
  onEdit: (value: string) => void;
  onToggleFav: (value: string) => void;
  highlight?: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-3 shadow-sm transition hover:border-rose-400/40 hover:shadow-md sm:p-4",
        highlight && "ring-2 ring-rose-400/50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Badge variant="secondary" className="text-[10px] capitalize">
          {item.category}
        </Badge>
        <div className="flex gap-1 opacity-80 transition group-hover:opacity-100">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label={favorited ? "Remove favorite" : "Save favorite"}
            onClick={() => onToggleFav(item.value)}
          >
            <Heart className={cn("h-3.5 w-3.5", favorited && "fill-rose-500 text-rose-500")} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            aria-label="Copy nickname"
            onClick={() => onCopy(item.value)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <button
        type="button"
        className="w-full rounded-xl bg-muted/25 px-3 py-4 text-left transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onEdit(item.value)}
        title="Click to edit"
      >
        <p className="break-all font-display text-lg leading-snug tracking-tight sm:text-xl">
          {item.value}
        </p>
        <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Pencil className="h-3 w-3" />
          {item.label} · tap to edit
        </p>
      </button>
    </motion.div>
  );
}

export function CoolNameFinderTool() {
  const [query, setQuery] = useState("Gamer");
  const [seed, setSeed] = useState(1);
  const [category, setCategory] = useState<CoolNameCategory>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [panel, setPanel] = useState<"results" | "favorites" | "recent">("results");
  const [copied, setCopied] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState("");

  useEffect(() => {
    setFavorites(loadList(FAV_KEY));
    setRecent(loadList(RECENT_KEY));
    setHydrated(true);
  }, []);

  const variants = useMemo(() => {
    if (!query.trim()) {
      return filterCoolNames(generateRandomCoolNames(24, seed * 31), category);
    }
    return filterCoolNames(generateCoolNames(query, seed), category);
  }, [query, seed, category]);

  const randomBatch = useMemo(
    () => generateRandomCoolNames(8, seed * 17 + 42),
    [seed]
  );

  const handleCopy = useCallback((value: string) => {
    void copyText(value);
    setCopied(value);
    setRecent((prev) => {
      const next = [value, ...prev.filter((x) => x !== value)].slice(0, 40);
      saveList(RECENT_KEY, next);
      return next;
    });
    window.setTimeout(() => setCopied((c) => (c === value ? null : c)), 1200);
  }, []);

  const openEditor = useCallback((value: string) => {
    setEditing(value);
    setEditorOpen(true);
  }, []);

  const toggleFav = useCallback((value: string) => {
    setFavorites((prev) => {
      const next = prev.includes(value)
        ? prev.filter((x) => x !== value)
        : [value, ...prev].slice(0, 40);
      saveList(FAV_KEY, next);
      toast.success(prev.includes(value) ? "Removed from favorites" : "Saved to favorites");
      return next;
    });
  }, []);

  const find = () => setSeed((s) => s + 1);

  return (
    <div className="space-y-6">
      <CoolNameEditorDialog
        open={editorOpen}
        initial={editing}
        favorites={favorites}
        onOpenChange={setEditorOpen}
        onCopy={handleCopy}
        onToggleFav={toggleFav}
      />

      <section className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-rose-500/15 via-background to-fuchsia-500/10 shadow-sm">
        <div className="border-b border-border/40 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300">Utility</Badge>
            <span className="text-xs text-muted-foreground">Nickname & username generator</span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Cool Name Finder
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Type a name or keyword to generate stylish Unicode nicknames — click any box to edit with
            fancy fonts, emoji, and frames, then copy.
          </p>

          <form
            className="mt-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              find();
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a name or keyword…"
                className="h-12 rounded-2xl border-border/60 bg-background/90 pl-10 text-base shadow-sm"
                aria-label="Name or keyword"
                maxLength={32}
              />
            </div>
            <PrimaryButton type="submit" className="h-12 rounded-2xl px-6">
              <Sparkles className="h-4 w-4" />
              Find!
            </PrimaryButton>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl"
              onClick={() => {
                setQuery("");
                setSeed((s) => s + 1);
              }}
            >
              <Dice5 className="h-4 w-4" />
              Random
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {COOL_NAME_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  category === c.value
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    : "border-border/50 bg-background/60 text-muted-foreground hover:border-rose-400/30"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-4 py-3 sm:px-6">
          {(
            [
              { id: "results" as const, label: "Results", icon: Sparkles },
              { id: "favorites" as const, label: "Favorites", icon: Star },
              { id: "recent" as const, label: "Recently copied", icon: History },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={panel === tab.id ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setPanel(tab.id)}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.id === "favorites" && favorites.length > 0 && (
                <span className="ml-1 text-[10px] opacity-80">{favorites.length}</span>
              )}
            </Button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <Label className="text-xs uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                {panel === "results" ? "Stylish nicknames" : panel === "favorites" ? "Saved" : "History"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {panel === "results"
                  ? `${variants.length} styles for “${(query || "random").trim() || "random"}”`
                  : panel === "favorites"
                    ? `${favorites.length} favorites`
                    : `${recent.length} recently copied`}
              </p>
            </div>
            {panel === "results" && (
              <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={find}>
                <Dice5 className="h-3.5 w-3.5" />
                Shuffle frames
              </Button>
            )}
            {panel !== "results" && hydrated && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full text-muted-foreground"
                onClick={() => {
                  if (panel === "favorites") {
                    setFavorites([]);
                    saveList(FAV_KEY, []);
                  } else {
                    setRecent([]);
                    saveList(RECENT_KEY, []);
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {panel === "results" && (
              <motion.div
                key={`results-${seed}-${category}`}
                className="grid gap-3 sm:grid-cols-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {variants.map((item) => (
                  <NameCard
                    key={`${item.id}-${item.value}`}
                    item={item}
                    favorited={favorites.includes(item.value)}
                    onCopy={handleCopy}
                    onEdit={openEditor}
                    onToggleFav={toggleFav}
                    highlight={copied === item.value}
                  />
                ))}
                {variants.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 py-12 text-center">
                    <p className="font-display text-lg font-semibold">Enter a name to find cool styles</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try Gamer, King, Bella, or your own username.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {panel === "favorites" && (
              <motion.div key="favs" className="grid gap-3 sm:grid-cols-2">
                {favorites.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 py-12 text-center">
                    <p className="font-display text-lg font-semibold">No favorites yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any nickname to save it.</p>
                  </div>
                ) : (
                  favorites.map((value) => (
                    <NameCard
                      key={value}
                      item={{ id: value, label: "Favorite", value, category: "stylish" }}
                      favorited
                      onCopy={handleCopy}
                      onEdit={openEditor}
                      onToggleFav={toggleFav}
                      highlight={copied === value}
                    />
                  ))
                )}
              </motion.div>
            )}

            {panel === "recent" && (
              <motion.div key="recent" className="grid gap-3 sm:grid-cols-2">
                {recent.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 py-12 text-center">
                    <p className="font-display text-lg font-semibold">Nothing copied yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Copied nicknames show up here.</p>
                  </div>
                ) : (
                  recent.map((value) => (
                    <NameCard
                      key={value}
                      item={{ id: value, label: "Recent", value, category: "minimal" }}
                      favorited={favorites.includes(value)}
                      onCopy={handleCopy}
                      onEdit={openEditor}
                      onToggleFav={toggleFav}
                      highlight={copied === value}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
            <div className="border-b border-border/40 bg-gradient-to-r from-rose-500/10 via-transparent to-transparent px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Random
              </p>
              <p className="text-sm font-semibold">Fresh nicknames</p>
            </div>
            <div className="space-y-2 p-3">
              {randomBatch.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openEditor(item.value)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/10 px-3 py-2.5 text-left transition hover:border-rose-400/40 hover:bg-rose-500/5"
                >
                  <span className="min-w-0 flex-1 truncate font-display text-sm">{item.value}</span>
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="mt-1 w-full rounded-xl"
                onClick={() => setSeed((s) => s + 1)}
              >
                <Dice5 className="h-3.5 w-3.5" />
                Generate another
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border/50 bg-muted/15 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Tips</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4">
              <li>Click a nickname box to open the rich editor.</li>
              <li>Select text first to restyle only part of the name.</li>
              <li>Unicode fonts copy to apps; preview fonts are display-only.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
