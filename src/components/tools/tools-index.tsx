import Link from "next/link";
import { getToolMenus } from "@/lib/tools-registry";
import type { ToolDefinition } from "@/types/tools";

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
  const menus = getToolMenus();
  const total = menus.reduce((n, m) => n + m.tools.length, 0);
  return (
    <section aria-labelledby="all-tools" className="mt-12 border-t border-border/60 pt-8">
      <h2 id="all-tools" className="font-display text-2xl font-semibold tracking-tight">
        All {total} ColorBase tools
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Every tool is free, runs in your browser and needs no account. Color tools come first, grouped by job; layout,
        type and time utilities are listed under More tools.
      </p>
      {menus.map((menu) =>
        menu.id === "more-tools" ? (
          <div key={menu.id} id="more-tools" className="mt-10 scroll-mt-24 rounded-xl border border-border/60 p-5">
            <h3 className="font-display text-lg font-semibold tracking-tight">{menu.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Utilities that are not about color but sit alongside it in a front-end workflow.
            </p>
            <ToolList tools={menu.tools} />
          </div>
        ) : (
          <div key={menu.id} className="mt-8">
            <h3 className="font-display text-lg font-semibold tracking-tight">{menu.label}</h3>
            <ToolList tools={menu.tools} />
          </div>
        )
      )}
    </section>
  );
}
