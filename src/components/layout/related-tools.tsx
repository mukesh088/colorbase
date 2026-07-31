import Link from "next/link";
import { ArrowRight, Palette } from "lucide-react";
import type { ToolDefinition } from "@/types/tools";
import { CATEGORY_LABELS } from "@/lib/tools-registry";
import { TOOL_ICONS } from "@/lib/nav";
import { cn } from "@/lib/utils";

const STRIP: Record<string, string> = {
  "color-picker": "from-rose-600 via-rose-400 to-rose-200",
  "hex-to-rgb": "from-pink-600 via-fuchsia-400 to-pink-200",
  "rgb-to-hex": "from-sky-600 via-blue-400 to-sky-200",
  "hex-to-hsl": "from-emerald-600 via-teal-400 to-emerald-200",
  "hsl-to-hex": "from-violet-600 via-purple-400 to-violet-200",
  "contrast-checker": "from-zinc-900 via-rose-600 to-rose-100",
  "palette-generator": "from-pink-800 via-rose-500 to-amber-400",
  "color-wheel": "from-red-500 via-amber-400 via-green-400 via-sky-400 to-violet-500",
  "image-color-picker": "from-pink-900 via-rose-400 to-rose-100",
  "popular-ui-colors": "from-slate-800 via-rose-500 to-sky-400",
  "gradient-generator": "from-rose-500 via-fuchsia-500 to-violet-500",
  "accessibility-checker": "from-emerald-700 via-emerald-400 to-lime-200",
};

const GLOW: Record<string, string> = {
  "color-picker": "bg-rose-500/35",
  "hex-to-rgb": "bg-fuchsia-500/35",
  "contrast-checker": "bg-rose-700/35",
  "palette-generator": "bg-rose-600/35",
  "color-wheel": "bg-amber-500/30",
  "image-color-picker": "bg-pink-600/35",
  "popular-ui-colors": "bg-sky-500/30",
  "gradient-generator": "bg-violet-500/35",
};

export function RelatedTools({ tools }: { tools: ToolDefinition[] }) {
  if (!tools.length) return null;

  return (
    <section className="mt-12 sm:mt-14" aria-labelledby="related-tools-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
            Keep exploring
          </p>
          <h2 id="related-tools-heading" className="mt-1 font-display text-xl font-semibold sm:text-2xl">
            Related tools
          </h2>
        </div>
        <Link
          href="/tools"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-rose-600"
        >
          Browse all →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => {
          const Icon = TOOL_ICONS[tool.icon] ?? Palette;
          const strip = STRIP[tool.slug] ?? "from-rose-600 via-pink-500 to-fuchsia-400";
          const glow = GLOW[tool.slug] ?? "bg-rose-500/30";

          return (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className={cn(
                "group relative block overflow-hidden rounded-[1.35rem] border border-border/50 bg-background/70 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)] transition-all duration-300 animate-rise",
                "hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-[0_22px_48px_-22px_rgba(225,29,72,0.45)]"
              )}
              style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
            >
              <div
                className={`h-14 bg-gradient-to-r ${strip} transition-transform duration-500 group-hover:scale-105`}
                aria-hidden
              />
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-24 opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70 ${glow}`}
                aria-hidden
              />
              <div className="relative p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-700 dark:text-rose-300">
                    {CATEGORY_LABELS[tool.category]}
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold tracking-tight transition-colors group-hover:text-rose-700 dark:group-hover:text-rose-300 sm:text-lg">
                  {tool.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 transition-all duration-300 group-hover:gap-2.5 dark:text-rose-300">
                  Open tool
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
