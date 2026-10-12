import Link from "next/link";
import type { ReactNode } from "react";
import { CopyButton } from "@/components/color/copy-button";
import { cn, slugify } from "@/lib/utils";

export function markdownHeadingId(raw: string) {
  return slugify(raw.replace(/[*`]/g, ""));
}

function Swatch({ hex, label }: { hex: string; label?: string }) {
  return (
    <span className="my-1 inline-flex max-w-full items-center gap-3 rounded-xl border border-border/70 bg-background px-3 py-2 align-middle">
      <span className="h-8 w-8 shrink-0 rounded-md border border-black/10" style={{ backgroundColor: hex }} />
      <span className="min-w-0">
        <code className="font-mono text-sm font-semibold text-foreground">{hex.toUpperCase()}</code>
        {label ? <span className="mt-0.5 block text-xs text-muted-foreground">{label}</span> : null}
      </span>
      <CopyButton value={hex.toUpperCase()} label="Copy HEX" size="sm" variant="outline" className="shrink-0" />
    </span>
  );
}

function inline(text: string) {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={key++} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>
      );
    } else {
      const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        const href = m[2];
        const label = m[1];
        if (href.startsWith("/")) {
          parts.push(
            <Link key={key++} href={href} className="text-primary underline-offset-4 hover:underline">
              {label}
            </Link>
          );
        } else {
          parts.push(
            <a
              key={key++}
              href={href}
              className="text-primary underline-offset-4 hover:underline"
              rel="noopener noreferrer"
              target={href.startsWith("http") ? "_blank" : undefined}
            >
              {label}
            </a>
          );
        }
      }
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderBlocks(md: string) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1;
      nodes.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-4 text-sm"
        >
          <code className={lang ? `language-${lang}` : undefined}>{buf.join("\n")}</code>
        </pre>
      );
      continue;
    }
    if (line.startsWith("@swatch ")) {
      const match = line.slice(8).trim().match(/^(#[0-9A-Fa-f]{6})(?:\s+(.+))?$/);
      if (match) {
        nodes.push(<Swatch key={key++} hex={match[1]} label={match[2]} />);
        i += 1;
        continue;
      }
    }
    if (line.startsWith("|") && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] ?? "")) {
      const split = (row: string) =>
        row
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((cell) => cell.trim());
      const headers = split(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(split(lines[i]));
        i += 1;
      }
      nodes.push(
        <div key={key++} className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead className="bg-muted/50 text-foreground">
              <tr>
                {headers.map((cell, headerIndex) => (
                  <th key={headerIndex} className="px-3 py-2 font-semibold">
                    {inline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-border/60">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 align-middle">
                      {/^#[0-9A-Fa-f]{6}$/.test(cell) ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-5 w-5 rounded border border-black/10"
                            style={{ backgroundColor: cell }}
                          />
                          <code className="font-mono text-foreground">{cell.toUpperCase()}</code>
                        </span>
                      ) : (
                        inline(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      const text = line.slice(4);
      nodes.push(
        <h3
          key={key++}
          id={markdownHeadingId(text)}
          className="scroll-mt-24 font-display text-xl font-semibold tracking-tight"
        >
          {inline(text)}
        </h3>
      );
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      const text = line.slice(3);
      nodes.push(
        <h2
          key={key++}
          id={markdownHeadingId(text)}
          className="scroll-mt-24 font-display text-2xl font-semibold tracking-tight"
        >
          {inline(text)}
        </h2>
      );
      i += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        buf.push(lines[i].slice(2));
        i += 1;
      }
      nodes.push(
        <blockquote
          key={key++}
          className="border-l-2 border-rose-500/50 pl-4 text-muted-foreground"
        >
          {inline(buf.join(" "))}
        </blockquote>
      );
      continue;
    }
    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ""));
        i += 1;
      }
      nodes.push(
        <ul key={key++} className="list-disc space-y-1 pl-5">
          {items.map((item, idx) => (
            <li key={idx}>{inline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i += 1;
      }
      nodes.push(
        <ol key={key++} className="list-decimal space-y-1 pl-5">
          {items.map((item, idx) => (
            <li key={idx}>{inline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }
    const buf: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("> ") &&
      !/^[-*] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i])
    ) {
      buf.push(lines[i]);
      i += 1;
    }
    nodes.push(<p key={key++}>{inline(buf.join(" "))}</p>);
  }
  return nodes;
}

export function MarkdownBody({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose-content space-y-4 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:text-foreground [&_h3]:mt-8 [&_h3]:text-foreground [&_strong]:text-foreground",
        className
      )}
    >
      {renderBlocks(markdown)}
    </div>
  );
}
