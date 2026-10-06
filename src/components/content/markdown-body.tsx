import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={key++} className="font-display text-xl font-semibold tracking-tight">
          {inline(line.slice(4))}
        </h3>
      );
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={key++} className="font-display text-2xl font-semibold tracking-tight">
          {inline(line.slice(3))}
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
