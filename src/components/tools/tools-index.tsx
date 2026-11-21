import Link from "next/link";
import { CATEGORY_LABELS, NON_COLOR_TOOL_SLUGS, REDIRECTED_TOOL_SLUGS, TOOLS } from "@/lib/tools-registry";
import type { ToolCategory, ToolDefinition } from "@/types/tools";

/** Color categories in reading order; anything else falls in after them. */
const ORDER: ToolCategory[] = [
  "pickers",
  "converters",
  "palettes",
  "gradients",
  "accessibility",
  "image",
  "libraries",
  "inspiration",
  "css-generators",
  "learning",
];

function ToolList({ tools }: { tools: ToolDefinition[] }) {
  return (
    <ul className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={tool.slug}>
          <Link
            href={`/${tool.slug}`}
            className="font-medium text-foreground underline-offset-4 hover:text-rose-700 hover:underline dark:hover:text-rose-300"
          >
            {tool.title}
          </Link>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{tool.description}</p>
        </li>
      ))}
    </ul>
  );
}

/** Server-rendered list of every tool with real links (the directory above is interactive). */
export function ToolsIndex() {
  const live = TOOLS.filter((t) => !REDIRECTED_TOOL_SLUGS.has(t.slug));
  const color = live.filter((t) => !NON_COLOR_TOOL_SLUGS.has(t.slug));
  const more = live.filter((t) => NON_COLOR_TOOL_SLUGS.has(t.slug)).sort((a, b) => a.title.localeCompare(b.title));
  const categories = [
    ...ORDER,
    ...(Object.keys(CATEGORY_LABELS) as ToolCategory[]).filter((c) => !ORDER.includes(c)),
  ].filter((c) => color.some((t) => t.category === c));

  return (
    <section aria-labelledby="all-tools" className="mt-12 border-t border-border/60 pt-8">
      <h2 id="all-tools" className="font-display text-2xl font-semibold tracking-tight">
        All {color.length + more.length} ColorBase tools
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Every tool is free, runs in your browser and needs no account. Color tools come first, grouped by job; layout,
        type and time utilities are listed under More tools.
      </p>
      {categories.map((category) => (
        <div key={category} className="mt-8">
          <h3 className="font-display text-lg font-semibold tracking-tight">{CATEGORY_LABELS[category]}</h3>
          <ToolList
            tools={color.filter((t) => t.category === category).sort((a, b) => a.title.localeCompare(b.title))}
          />
        </div>
      ))}
      {more.length > 0 && (
        <div id="more-tools" className="mt-10 scroll-mt-24 rounded-xl border border-border/60 p-5">
          <h3 className="font-display text-lg font-semibold tracking-tight">More tools: CSS layout, type and time</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Utilities that are not about color but sit alongside it in a front-end workflow.
          </p>
          <ToolList tools={more} />
        </div>
      )}
    </section>
  );
}
