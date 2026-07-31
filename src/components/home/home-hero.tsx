import Link from "next/link";
import { ArrowRight, Contrast, Palette, Pipette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, getFeaturedTools, getPopularTools } from "@/lib/tools-registry";
import { LIBRARY_LINKS, TOOL_ICONS } from "@/lib/nav";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site-config";

const FEATURED_STRIPS: Record<string, string> = {
  "color-picker": "from-rose-600 via-rose-400 to-rose-200",
  "hex-to-rgb": "from-pink-600 via-fuchsia-400 to-pink-200",
  "gradient-generator": "from-rose-500 via-fuchsia-500 to-violet-500",
  "palette-generator": "from-pink-800 via-rose-500 to-amber-400",
  "css-named-colors": "from-red-600 via-amber-500 to-green-600",
  "contrast-checker": "from-zinc-900 via-rose-600 to-rose-100",
  "image-color-picker": "from-pink-900 via-rose-400 to-rose-100",
  "glassmorphism-generator": "from-rose-50 via-pink-300 to-rose-700",
};

const FEATURED_GLOW: Record<string, string> = {
  "color-picker": "bg-rose-500/40",
  "hex-to-rgb": "bg-fuchsia-500/40",
  "gradient-generator": "bg-violet-500/40",
  "palette-generator": "bg-rose-600/40",
  "css-named-colors": "bg-amber-500/35",
  "contrast-checker": "bg-rose-700/40",
  "image-color-picker": "bg-pink-600/40",
  "glassmorphism-generator": "bg-pink-400/35",
};

const QUICK_LINKS = [
  { icon: Pipette, title: "Pick", href: "/color-picker", tone: "bg-rose-600" },
  { icon: Palette, title: "Palettes", href: "/palette-generator", tone: "bg-pink-600" },
  { icon: Contrast, title: "Contrast", href: "/contrast-checker", tone: "bg-fuchsia-600" },
  { icon: Sparkles, title: "Glass CSS", href: "/glassmorphism-generator", tone: "bg-rose-500" },
] as const;

export function HomeHero() {
  const featured = getFeaturedTools();
  const popular = getPopularTools();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,0.22),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(232,121,249,0.18),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-3 py-10 sm:gap-10 sm:px-4 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-6 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="font-display text-3xl font-semibold tracking-tight text-rose-700 dark:text-rose-300 sm:text-5xl lg:text-6xl">
              {SITE_NAME}
            </p>
            <h1 className="mt-3 max-w-xl text-lg text-muted-foreground sm:mt-4 sm:text-2xl">{SITE_TAGLINE}</h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              Convert HEX, RGB, HSL & CMYK. Build palettes, gradients, and CSS effects. Check WCAG
              contrast — all free, fast, and accessible.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/color-picker">
                  Open Color Picker <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/palette-generator">Generate Palette</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 self-center sm:gap-4">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="glass group block rounded-2xl border border-border/50 p-3 transition-transform hover:-translate-y-1 sm:rounded-3xl sm:p-5"
              >
                <span
                  className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl text-white sm:mb-4 sm:h-11 sm:w-11 sm:rounded-2xl ${item.tone}`}
                >
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <p className="font-display text-base font-semibold sm:text-lg">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground group-hover:text-foreground">
                  Open tool →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-10 sm:px-4 sm:py-12 lg:px-6" aria-labelledby="libraries-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
              Explore
            </p>
            <h2 id="libraries-heading" className="mt-1 font-display text-2xl font-semibold">
              Libraries
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">Also pinned in the header for quick access.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LIBRARY_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="card-lift glass group flex items-center gap-3 rounded-2xl border border-border/50 px-4 py-3.5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-fuchsia-500/15 text-rose-600 transition-transform duration-300 group-hover:scale-110 dark:text-rose-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold tracking-tight group-hover:text-rose-700 dark:group-hover:text-rose-300">
                    {item.fullTitle}
                  </span>
                  <span className="text-[11px] text-muted-foreground">Browse →</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10 lg:px-6" aria-labelledby="featured-heading">
        <h2 id="featured-heading" className="font-display text-xl font-semibold sm:text-2xl">
          Featured tools
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Open any tool from the pink{" "}
          <span className="font-medium text-rose-600 dark:text-rose-400">Quick menu</span> in the
          header.
        </p>
        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {featured.map((tool) => {
            const Icon = TOOL_ICONS[tool.icon] ?? Palette;
            const strip = FEATURED_STRIPS[tool.slug] ?? "from-rose-600 via-pink-500 to-fuchsia-400";
            const glow = FEATURED_GLOW[tool.slug] ?? "bg-rose-500/40";
            return (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="card-lift group relative block overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm backdrop-blur-sm"
              >
                <div
                  className={`h-16 bg-gradient-to-r ${strip} transition-transform duration-500 group-hover:scale-105`}
                  aria-hidden
                />
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-28 opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70 ${glow}`}
                  aria-hidden
                />
                <div className="relative p-5 sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-700 dark:text-rose-300">
                      {CATEGORY_LABELS[tool.category]}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-rose-700 dark:group-hover:text-rose-300">
                    {tool.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {tool.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 transition-all duration-300 group-hover:gap-2.5 dark:text-rose-300">
                    Open tool
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-3 pb-12 sm:px-4 sm:pb-16 lg:px-6"
        aria-labelledby="popular-heading"
      >
        <h2 id="popular-heading" className="font-display text-xl font-semibold sm:text-2xl">
          Popular tools
        </h2>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
          {popular.map((tool) => (
            <Link
              key={tool.slug}
              href={`/${tool.slug}`}
              className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary sm:px-4 sm:py-2 sm:text-sm"
            >
              {tool.shortTitle}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
