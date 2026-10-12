import { CopyButton } from "@/components/color/copy-button";
import {
  highlightCode,
  tokenClassName,
  type CodeLanguage,
} from "@/lib/syntax-highlight";

const LANGUAGE_ALIASES: Record<string, CodeLanguage> = {
  css: "css",
  scss: "css",
  html: "html",
  htm: "html",
  xml: "xml",
  svg: "xml",
  js: "js",
  javascript: "js",
  jsx: "js",
  ts: "js",
  tsx: "js",
  typescript: "js",
  json: "json",
  sql: "sql",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  markdown: "markdown",
  text: "plain",
  txt: "plain",
  plain: "plain",
};

function mapLanguage(raw: string): CodeLanguage {
  return LANGUAGE_ALIASES[raw.trim().toLowerCase()] ?? "plain";
}

export function IdeCodeBlock({ code, language = "" }: { code: string; language?: string }) {
  const lang = mapLanguage(language);
  const tokens = highlightCode(code, lang);
  const lines = code.split("\n");
  const label = language.trim() || "text";

  return (
    <figure className="overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-lg shadow-black/20">
      <figcaption className="flex items-center justify-between gap-3 border-b border-[#30363d] bg-[#161b22] px-3 py-2">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex shrink-0 gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </span>
          <span className="truncate font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#8b949e]">
            {label}
          </span>
        </span>
        <CopyButton
          value={code}
          label="Copy"
          variant="outline"
          size="sm"
          className="h-7 shrink-0 border-[#30363d] bg-transparent px-2 text-[11px] text-[#e6edf3] hover:bg-white/10 hover:text-white"
        />
      </figcaption>
      <pre className="m-0 overflow-x-auto font-mono text-[12.5px] leading-6">
        <div className="flex min-w-full">
          <div
            aria-hidden
            className="sticky left-0 select-none border-r border-[#30363d] bg-[#0d1117] px-3 py-3 text-right text-[#484f58]"
          >
            {lines.map((_, index) => (
              <span key={index} className="block">
                {index + 1}
              </span>
            ))}
          </div>
          <code className="min-w-0 flex-1 whitespace-pre px-4 py-3 text-[#e6edf3]">
            {tokens.map((token, index) => (
              <span key={index} className={tokenClassName(token.type)}>
                {token.text}
              </span>
            ))}
          </code>
        </div>
      </pre>
    </figure>
  );
}
