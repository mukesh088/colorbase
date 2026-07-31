"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToolWorkbench, OutputBox, ActionRow, PrimaryButton } from "./workbench";
import { slugify } from "./helpers";
import type { TextSuiteMode } from "@/lib/suite-modes";

export type { TextSuiteMode };
export { isTextSuite } from "@/lib/suite-modes";

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";

const EMOJIS = "😀 😂 🥰 😍 🤔 🙌 🔥 ✨ 💯 🎉 ❤️ 💙 💚 💛 💜 🖤 🚀 🌟 🎯 💡 🧠 🛠️ 📱 💻 🌍 ✅ ❌ ⚡ 🌈 🍕".split(" ");

const FANCY: Record<string, (s: string) => string> = {
  bold: (s) => mapFancy(s, 0x1d5d4, 0x1d5ee),
  italic: (s) => mapFancy(s, 0x1d608, 0x1d622),
  monospace: (s) => mapFancy(s, 0x1d670, 0x1d68a),
  circled: (s) =>
    s.replace(/[a-z]/gi, (ch) => {
      const base = ch.toLowerCase().charCodeAt(0) - 97;
      if (base < 0 || base > 25) return ch;
      return String.fromCodePoint(0x24b6 + base);
    }),
};

function mapFancy(s: string, upper: number, lower: number) {
  return s.replace(/[a-z]/gi, (ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(upper + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(lower + (code - 97));
    return ch;
  });
}

function toTitleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function simpleMarkdown(md: string) {
  return md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/`([^`]+)`/gim, "<code>$1</code>")
    .replace(/\n/g, "<br/>");
}

export function TextSuiteTool({ mode }: { mode: TextSuiteMode }) {
  const [input, setInput] = useState("Hello World from colorBase");
  const [caseMode, setCaseMode] = useState("title");
  const [sortDir, setSortDir] = useState("asc");
  const [reverseMode, setReverseMode] = useState("chars");
  const [fancy, setFancy] = useState("bold");
  const [count, setCount] = useState(3);
  const [wpm, setWpm] = useState(200);
  const [md, setMd] = useState("# Hello\n\nWrite **markdown** here and preview it live.");

  const [tick, setTick] = useState(0);

  const output = useMemo(() => {
    void tick;
    switch (mode) {
      case "case-converter": {
        if (caseMode === "upper") return input.toUpperCase();
        if (caseMode === "lower") return input.toLowerCase();
        if (caseMode === "title") return toTitleCase(input);
        if (caseMode === "camel")
          return input
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => (i === 0 ? w.toLowerCase() : w.toUpperCase()))
            .replace(/\s+/g, "");
        if (caseMode === "snake") return input.trim().toLowerCase().replace(/\s+/g, "_");
        if (caseMode === "kebab") return slugify(input);
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
        lines.sort((a, b) => a.localeCompare(b));
        if (sortDir === "desc") lines.reverse();
        return lines.join("\n");
      }
      case "reverse-text":
        return reverseMode === "lines"
          ? input.split("\n").reverse().join("\n")
          : [...input].reverse().join("");
      case "random-text-generator": {
        const words = ["color", "design", "palette", "gradient", "contrast", "brand", "pixel", "canvas", "layout", "system"];
        return Array.from({ length: count }, () =>
          Array.from({ length: 8 }, () => words[Math.floor(Math.random() * words.length)]).join(" ") + "."
        ).join(" ");
      }
      case "lorem-ipsum-generator":
        return Array.from({ length: count }, () => LOREM).join("\n\n");
      case "fancy-text-generator":
        return (FANCY[fancy] ?? FANCY.bold)(input);
      case "unicode-converter":
        return [...input].map((ch) => `U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")} ${ch}`).join("\n");
      case "emoji-picker":
        return EMOJIS.join("  ");
      case "slug-generator":
        return slugify(input);
      case "character-counter":
      case "word-counter":
      case "reading-time-calculator": {
        const chars = input.length;
        const words = input.trim() ? input.trim().split(/\s+/).length : 0;
        const lines = input ? input.split("\n").length : 0;
        const mins = Math.max(1, Math.ceil(words / wpm));
        return `Characters: ${chars}\nWords: ${words}\nLines: ${lines}\nReading time: ~${mins} min (@ ${wpm} wpm)`;
      }
      case "markdown-preview":
      case "markdown-editor":
        return simpleMarkdown(md);
      default:
        return input;
    }
  }, [mode, input, caseMode, sortDir, reverseMode, fancy, count, wpm, md, tick]);

  const isMd = mode === "markdown-preview" || mode === "markdown-editor";

  return (
    <ToolWorkbench
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
                    ["camel", "camelCase"],
                    ["snake", "snake_case"],
                    ["kebab", "kebab-case"],
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
                  {Object.keys(FANCY).map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {(mode === "lorem-ipsum-generator" || mode === "random-text-generator") && (
            <div className="space-y-1.5">
              <Label>Count {count}</Label>
              <Slider min={1} max={10} value={[count]} onValueChange={([n]) => setCount(n)} />
            </div>
          )}
          {mode === "reading-time-calculator" && (
            <div className="space-y-1.5">
              <Label>WPM {wpm}</Label>
              <Slider min={100} max={400} step={10} value={[wpm]} onValueChange={([n]) => setWpm(n)} />
            </div>
          )}
          {mode === "emoji-picker" ? (
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="rounded-xl border border-border/50 bg-background px-3 py-2 text-xl hover:border-rose-500/40"
                  onClick={() => setInput((p) => `${p}${e}`)}
                >
                  {e}
                </button>
              ))}
            </div>
          ) : isMd ? (
            <div className="space-y-1.5">
              <Label>Markdown</Label>
              <Textarea value={md} onChange={(e) => setMd(e.target.value)} rows={14} className="font-mono text-sm" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Input</Label>
              <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10} />
            </div>
          )}
          {(mode === "random-text-generator" || mode === "lorem-ipsum-generator") && (
            <ActionRow>
              <PrimaryButton onClick={() => setTick((n) => n + 1)}>Regenerate</PrimaryButton>
            </ActionRow>
          )}
        </div>
      }
      output={
        isMd ? (
          <div className="rounded-3xl border border-border/50 bg-background/70 p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold">Preview</p>
            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: output }} />
          </div>
        ) : (
          <OutputBox value={output} />
        )
      }
    />
  );
}
