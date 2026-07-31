"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ToolWorkbench, OutputBox, ActionRow, PrimaryButton } from "./workbench";
import { slugify } from "./helpers";
import type { TextSuiteMode } from "@/lib/suite-modes";
import { cn } from "@/lib/utils";

export type { TextSuiteMode };
export { isTextSuite } from "@/lib/suite-modes";

const LOREM_PARAS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra.",
];

const WORD_BANK = [
  "color", "design", "palette", "gradient", "contrast", "brand", "pixel", "canvas", "layout", "system",
  "typography", "harmony", "shade", "tint", "hue", "saturation", "balance", "rhythm", "space", "form",
  "texture", "surface", "depth", "light", "shadow", "focus", "motion", "flow", "grid", "frame",
];

const EMOJI_GROUPS: { label: string; items: string[] }[] = [
  { label: "Smileys", items: ["😀", "😂", "🥰", "😍", "🤔", "😎", "🤩", "😅", "🙌", "👏"] },
  { label: "Symbols", items: ["🔥", "✨", "💯", "🎉", "⚡", "🌈", "✅", "❌", "💡", "🎯"] },
  { label: "Hearts", items: ["❤️", "💙", "💚", "💛", "💜", "🖤", "🤍", "🧡", "💖", "💕"] },
  { label: "Objects", items: ["🚀", "🌟", "🧠", "🛠️", "📱", "💻", "🌍", "🎨", "📌", "📎"] },
];

const FANCY_STYLES: { value: string; label: string; sample: string; fn: (s: string) => string }[] = [
  { value: "bold", label: "Bold", sample: "𝗕𝗼𝗹𝗱", fn: (s) => mapFancy(s, 0x1d5d4, 0x1d5ee) },
  { value: "italic", label: "Italic", sample: "𝐼𝑡𝑎𝑙𝑖𝑐", fn: (s) => mapFancy(s, 0x1d434, 0x1d44e) },
  { value: "bold-italic", label: "Bold italic", sample: "𝑩𝒐𝒍𝒅", fn: (s) => mapFancy(s, 0x1d468, 0x1d482) },
  { value: "monospace", label: "Monospace", sample: "𝙼𝚘𝚗𝚘", fn: (s) => mapFancy(s, 0x1d670, 0x1d68a) },
  { value: "circled", label: "Circled", sample: "Ⓒⓘⓡⓒ", fn: circledFancy },
  { value: "squared", label: "Squared", sample: "🅂🅀", fn: squaredFancy },
  { value: "fullwidth", label: "Fullwidth", sample: "Ｆｕｌｌ", fn: fullwidthFancy },
];

function mapFancy(s: string, upper: number, lower: number) {
  return s.replace(/[a-z]/gi, (ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(upper + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(lower + (code - 97));
    return ch;
  });
}

function circledFancy(s: string) {
  return s.replace(/[a-z]/gi, (ch) => {
    const base = ch.toLowerCase().charCodeAt(0) - 97;
    if (base < 0 || base > 25) return ch;
    return String.fromCodePoint(0x24b6 + base);
  });
}

function squaredFancy(s: string) {
  return s.replace(/[a-z]/gi, (ch) => {
    const base = ch.toUpperCase().charCodeAt(0) - 65;
    if (base < 0 || base > 25) return ch;
    return String.fromCodePoint(0x1f170 + base);
  });
}

function fullwidthFancy(s: string) {
  return [...s]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code === 32) return "\u3000";
      if (code >= 33 && code <= 126) return String.fromCharCode(code + 0xfee0);
      return ch;
    })
    .join("");
}

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function toSentenceCase(s: string) {
  return s
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, (m) => m.toUpperCase());
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function simpleMarkdown(md: string) {
  const escaped = escapeHtml(md);
  const lines = escaped.split("\n");
  const out: string[] = [];
  let inList = false;
  let inCode = false;
  let codeBuf: string[] = [];

  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    if (raw.startsWith("```")) {
      if (inCode) {
        out.push(`<pre class="md-code"><code>${codeBuf.join("\n")}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(raw);
      continue;
    }

    const inline = (t: string) =>
      t
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");

    if (/^###\s+/.test(raw)) {
      flushList();
      out.push(`<h3>${inline(raw.replace(/^###\s+/, ""))}</h3>`);
    } else if (/^##\s+/.test(raw)) {
      flushList();
      out.push(`<h2>${inline(raw.replace(/^##\s+/, ""))}</h2>`);
    } else if (/^#\s+/.test(raw)) {
      flushList();
      out.push(`<h1>${inline(raw.replace(/^#\s+/, ""))}</h1>`);
    } else if (/^[-*]\s+/.test(raw)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(raw.replace(/^[-*]\s+/, ""))}</li>`);
    } else if (!raw.trim()) {
      flushList();
      out.push("<br/>");
    } else {
      flushList();
      out.push(`<p>${inline(raw)}</p>`);
    }
  }
  flushList();
  if (inCode) out.push(`<pre class="md-code"><code>${codeBuf.join("\n")}</code></pre>`);
  return out.join("\n");
}

function textStats(input: string, wpm: number) {
  const chars = input.length;
  const charsNoSpaces = input.replace(/\s/g, "").length;
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const lines = input ? input.split("\n").length : 0;
  const sentences = input.trim() ? (input.match(/[.!?]+/g) || []).length || 1 : 0;
  const mins = words === 0 ? 0 : Math.max(1, Math.ceil(words / wpm));
  const secs = words === 0 ? 0 : Math.max(1, Math.round((words / wpm) * 60));
  return { chars, charsNoSpaces, words, lines, sentences, mins, secs };
}

function pickWords(n: number) {
  return Array.from({ length: n }, () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
}

function randomSentence() {
  const words = pickWords(6 + Math.floor(Math.random() * 6));
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return `${words.join(" ")}.`;
}

const HINTS: Partial<Record<TextSuiteMode, string>> = {
  "case-converter": "Convert casing for titles, variables, and URLs.",
  "remove-duplicate-lines": "Keeps the first occurrence of each line.",
  "sort-text": "Sort lines alphabetically, one line per entry.",
  "reverse-text": "Flip characters or entire lines.",
  "random-text-generator": "Placeholder sentences for mock layouts.",
  "lorem-ipsum-generator": "Classic filler paragraphs for wireframes.",
  "fancy-text-generator": "Unicode letter styles for social posts.",
  "unicode-converter": "Inspect every character as a code point.",
  "emoji-picker": "Click an emoji to append it to your text.",
  "slug-generator": "URL-safe slugs from any title or phrase.",
  "character-counter": "Live character counts with and without spaces.",
  "word-counter": "Words, lines, and sentences at a glance.",
  "reading-time-calculator": "Estimate reading time from your words-per-minute.",
  "markdown-preview": "Write Markdown and see a live HTML preview.",
  "markdown-editor": "Side-by-side editor with headings, lists, and links.",
};

function StatsGrid({
  stats,
  highlight,
}: {
  stats: ReturnType<typeof textStats>;
  highlight: "chars" | "words" | "reading";
}) {
  const items = [
    { key: "chars" as const, label: "Characters", value: stats.chars.toLocaleString(), sub: `${stats.charsNoSpaces.toLocaleString()} no spaces` },
    { key: "words" as const, label: "Words", value: stats.words.toLocaleString(), sub: `${stats.sentences} sentences` },
    { key: "lines" as const, label: "Lines", value: stats.lines.toLocaleString(), sub: "including blanks" },
    {
      key: "reading" as const,
      label: "Reading",
      value: stats.words === 0 ? "0s" : stats.mins < 2 ? `~${stats.secs}s` : `~${stats.mins} min`,
      sub: "estimated",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => {
        const active =
          (highlight === "chars" && item.key === "chars") ||
          (highlight === "words" && item.key === "words") ||
          (highlight === "reading" && item.key === "reading");
        return (
          <div
            key={item.key}
            className={cn(
              "rounded-2xl border px-3 py-3",
              active
                ? "border-rose-500/40 bg-rose-500/10 shadow-sm"
                : "border-border/50 bg-muted/20"
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="mt-1 font-display text-xl font-semibold tracking-tight">{item.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{item.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

export function TextSuiteTool({ mode }: { mode: TextSuiteMode }) {
  const [input, setInput] = useState("Hello World from colorBase");
  const [caseMode, setCaseMode] = useState("title");
  const [sortDir, setSortDir] = useState("asc");
  const [reverseMode, setReverseMode] = useState("chars");
  const [fancy, setFancy] = useState("bold");
  const [count, setCount] = useState(3);
  const [wpm, setWpm] = useState(200);
  const [md, setMd] = useState(
    "# Hello\n\nWrite **markdown** here and preview it live.\n\n- Lists work\n- So do [links](https://colorbase.in)\n\n`inline code` and:\n\n```\ncode blocks\n```"
  );
  const [emojiTab, setEmojiTab] = useState(EMOJI_GROUPS[0].label);
  const [tick, setTick] = useState(0);

  const isCounter = mode === "character-counter" || mode === "word-counter" || mode === "reading-time-calculator";
  const isMd = mode === "markdown-preview" || mode === "markdown-editor";
  const isGenerator = mode === "lorem-ipsum-generator" || mode === "random-text-generator";
  const needsInput =
    !isMd &&
    !isGenerator &&
    mode !== "emoji-picker";

  const stats = useMemo(() => textStats(isMd ? md : input, wpm), [input, md, wpm, isMd]);

  const output = useMemo(() => {
    void tick;
    switch (mode) {
      case "case-converter": {
        if (caseMode === "upper") return input.toUpperCase();
        if (caseMode === "lower") return input.toLowerCase();
        if (caseMode === "title") return toTitleCase(input);
        if (caseMode === "sentence") return toSentenceCase(input);
        if (caseMode === "camel")
          return input
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => (i === 0 ? w.toLowerCase() : w.toUpperCase()))
            .replace(/\s+/g, "");
        if (caseMode === "pascal")
          return input
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase())
            .replace(/\s+/g, "");
        if (caseMode === "snake") return input.trim().toLowerCase().replace(/\s+/g, "_");
        if (caseMode === "kebab") return slugify(input);
        if (caseMode === "constant") return input.trim().toUpperCase().replace(/\s+/g, "_");
        return input;
      }
      case "remove-duplicate-lines": {
        const seen = new Set<string>();
        return input
          .split("\n")
          .filter((line) => {
            if (seen.has(line)) return false;
            seen.add(line);
            return true;
          })
          .join("\n");
      }
      case "sort-text": {
        const lines = input.split("\n");
        lines.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));
        if (sortDir === "desc") lines.reverse();
        return lines.join("\n");
      }
      case "reverse-text":
        return reverseMode === "lines"
          ? input.split("\n").reverse().join("\n")
          : reverseMode === "words"
            ? input.split(/(\s+)/).map((part) => (/\s/.test(part) ? part : [...part].reverse().join(""))).join("")
            : [...input].reverse().join("");
      case "random-text-generator":
        return Array.from({ length: count }, () => randomSentence()).join(" ");
      case "lorem-ipsum-generator":
        return Array.from({ length: count }, (_, i) => LOREM_PARAS[i % LOREM_PARAS.length]).join("\n\n");
      case "fancy-text-generator": {
        const style = FANCY_STYLES.find((s) => s.value === fancy) ?? FANCY_STYLES[0];
        return style.fn(input);
      }
      case "unicode-converter":
        return [...input]
          .map((ch, i) => {
            const cp = ch.codePointAt(0)!;
            return `${String(i + 1).padStart(2, "0")}  U+${cp.toString(16).toUpperCase().padStart(4, "0")}  ${ch === " " ? "␠" : ch}  (${cp})`;
          })
          .join("\n");
      case "emoji-picker":
        return input;
      case "slug-generator":
        return slugify(input);
      case "character-counter":
        return `Characters: ${stats.chars}\nCharacters (no spaces): ${stats.charsNoSpaces}\nWords: ${stats.words}\nLines: ${stats.lines}`;
      case "word-counter":
        return `Words: ${stats.words}\nSentences: ${stats.sentences}\nLines: ${stats.lines}\nCharacters: ${stats.chars}`;
      case "reading-time-calculator":
        return `Reading time: ~${stats.mins} min (${stats.secs}s)\nWords: ${stats.words}\nWPM setting: ${wpm}\nCharacters: ${stats.chars}`;
      case "markdown-preview":
      case "markdown-editor":
        return simpleMarkdown(md);
      default:
        return input;
    }
  }, [mode, input, caseMode, sortDir, reverseMode, fancy, count, wpm, md, tick, stats]);

  const copyValue = isMd ? md : isCounter ? output : output;

  return (
    <ToolWorkbench
      title={isMd ? "Editor" : isCounter ? "Text" : "Controls"}
      hint={HINTS[mode]}
      controls={
        <div className="space-y-4">
          {mode === "case-converter" && (
            <div className="space-y-1.5">
              <Label>Case</Label>
              <Select value={caseMode} onValueChange={setCaseMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[
                    ["upper", "UPPERCASE"],
                    ["lower", "lowercase"],
                    ["title", "Title Case"],
                    ["sentence", "Sentence case"],
                    ["camel", "camelCase"],
                    ["pascal", "PascalCase"],
                    ["snake", "snake_case"],
                    ["kebab", "kebab-case"],
                    ["constant", "CONSTANT_CASE"],
                  ].map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "sort-text" && (
            <div className="space-y-1.5">
              <Label>Order</Label>
              <Select value={sortDir} onValueChange={setSortDir}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">A → Z</SelectItem>
                  <SelectItem value="desc">Z → A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "reverse-text" && (
            <div className="space-y-1.5">
              <Label>Reverse</Label>
              <Select value={reverseMode} onValueChange={setReverseMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="chars">Characters</SelectItem>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="lines">Lines</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "fancy-text-generator" && (
            <div className="space-y-1.5">
              <Label>Style</Label>
              <Select value={fancy} onValueChange={setFancy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FANCY_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label} · {s.sample}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isGenerator && (
            <div className="space-y-1.5">
              <Label>
                {mode === "lorem-ipsum-generator" ? "Paragraphs" : "Sentences"} · {count}
              </Label>
              <Slider min={1} max={12} value={[count]} onValueChange={([n]) => setCount(n)} />
            </div>
          )}

          {mode === "reading-time-calculator" && (
            <div className="space-y-1.5">
              <Label>Reading speed · {wpm} WPM</Label>
              <Slider min={100} max={400} step={10} value={[wpm]} onValueChange={([n]) => setWpm(n)} />
              <div className="flex flex-wrap gap-2 pt-1">
                {[150, 200, 250, 300].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={wpm === n ? "default" : "outline"}
                    className="h-8 rounded-full"
                    onClick={() => setWpm(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {mode === "emoji-picker" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_GROUPS.map((g) => (
                  <Button
                    key={g.label}
                    type="button"
                    size="sm"
                    variant={emojiTab === g.label ? "default" : "outline"}
                    className="h-8 rounded-full"
                    onClick={() => setEmojiTab(g.label)}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {(EMOJI_GROUPS.find((g) => g.label === emojiTab)?.items ?? []).map((e) => (
                  <button
                    key={e}
                    type="button"
                    className="rounded-xl border border-border/50 bg-background px-3 py-2 text-xl transition hover:border-rose-500/40 hover:bg-rose-500/5"
                    onClick={() => setInput((p) => `${p}${e}`)}
                    aria-label={`Insert ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label>Your text</Label>
                <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5} />
              </div>
            </div>
          ) : isMd ? (
            <div className="space-y-1.5">
              <Label>Markdown</Label>
              <Textarea
                value={md}
                onChange={(e) => setMd(e.target.value)}
                rows={mode === "markdown-editor" ? 16 : 12}
                className="font-mono text-sm leading-relaxed"
              />
            </div>
          ) : needsInput ? (
            <div className="space-y-1.5">
              <Label>Input</Label>
              <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={isCounter ? 12 : 10} />
            </div>
          ) : null}

          {isCounter && (
            <StatsGrid
              stats={stats}
              highlight={
                mode === "character-counter" ? "chars" : mode === "word-counter" ? "words" : "reading"
              }
            />
          )}

          <ActionRow>
            {isGenerator && (
              <PrimaryButton onClick={() => setTick((n) => n + 1)}>Regenerate</PrimaryButton>
            )}
            {(needsInput || mode === "emoji-picker") && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setInput("")}
              >
                Clear
              </Button>
            )}
            {isMd && (
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setMd("")}>
                Clear
              </Button>
            )}
          </ActionRow>
        </div>
      }
      preview={
        isMd ? (
          <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm">
            <div className="border-b border-border/40 px-4 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                Preview
              </p>
              <p className="text-sm font-semibold">Rendered Markdown</p>
            </div>
            <div
              className="prose prose-sm dark:prose-invert max-w-none space-y-2 p-4 sm:p-5 [&_.md-code]:overflow-x-auto [&_.md-code]:rounded-xl [&_.md-code]:bg-muted/60 [&_.md-code]:p-3 [&_code]:rounded [&_code]:bg-muted/50 [&_code]:px-1 [&_h1]:mb-2 [&_h1]:mt-0 [&_h2]:mb-2 [&_h3]:mb-1 [&_p]:my-1.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          </div>
        ) : undefined
      }
      output={
        isMd ? (
          mode === "markdown-editor" ? (
            <OutputBox value={md} label="Markdown" filename="document.md" rows={8} />
          ) : undefined
        ) : isCounter ? (
          <OutputBox value={copyValue} label="Stats" filename="stats.txt" rows={6} />
        ) : (
          <OutputBox
            value={output}
            label={mode === "slug-generator" ? "Slug" : "Copy"}
            filename={mode === "slug-generator" ? "slug.txt" : "output.txt"}
            rows={mode === "unicode-converter" ? 14 : 12}
          />
        )
      }
    />
  );
}
