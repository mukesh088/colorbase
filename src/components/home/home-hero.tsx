import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Contrast, Palette, Pipette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorSearchBox } from "@/components/search/color-search-box";
import { SITE_NAME_DISPLAY, SITE_PROMISE } from "@/lib/site-config";
import { COLOR_FAMILIES, FAMILY_LABELS } from "@/lib/data/families";
import { DESIGN_SYSTEM_ROUTES } from "@/lib/data/design-systems";
import { BRANDS } from "@/lib/data/brands";
import { POPULAR_UI_COLOR_GROUPS } from "@/lib/colors/palettes";
import { getFeaturedPosts } from "@/lib/data/blog";
import { getToolsByCategory } from "@/lib/tools-registry";
import { getTextColor } from "@/lib/colors/convert";
import { HeroColorRipple } from "@/components/home/hero-color-ripple";

const POPULAR_COLORS = [
  { hex: "#3B82F6", name: "Blue 500" },
  { hex: "#E11D48", name: "Rose 600" },
  { hex: "#22C55E", name: "Green 500" },
  { hex: "#111827", name: "Gray 900" },
  { hex: "#F59E0B", name: "Amber 500" },
  { hex: "#8B5CF6", name: "Violet 500" },
  { hex: "#0EA5E9", name: "Sky 500" },
  { hex: "#FFFFFF", name: "White" },
];

export function HomeHero() {
  const popularUi = Object.values(POPULAR_UI_COLOR_GROUPS)
    .flat()
    .slice(0, 8);
  const brands = BRANDS.slice(0, 8);
  const converters = getToolsByCategory("converters").slice(0, 6);
  const generators = getToolsByCategory("css-generators").slice(0, 6);
  const a11y = getToolsByCategory("accessibility").slice(0, 4);
  const guides = getFeaturedPosts(3);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60">
        <HeroColorRipple />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="pointer-events-none relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.7fr)] lg:items-center lg:py-20">
          <div>
            <p className="kicker inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              {SITE_NAME_DISPLAY}
            </p>
            <h1 className="mt-5 font-display text-[2.05rem] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[3.35rem]">
              The developer&apos;s
              <span className="mt-1 block sm:mt-2">
                <span className="text-gradient-brand">color intelligence</span> platform.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {SITE_PROMISE}
            </p>
            <div className="pointer-events-auto mt-8 rounded-[var(--radius-lg)] border border-border bg-card p-2 shadow-[var(--shadow-md)]">
              <ColorSearchBox autoFocus={false} />
            </div>
            <div className="pointer-events-auto mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/colors">Explore Colors</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/color-picker">
                  <Pipette className="h-4 w-4" />
                  Color Picker
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/palette-generator">
                  <Palette className="h-4 w-4" />
                  Generate Palette
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/ai-color-copilot">
                  <Sparkles className="h-4 w-4" />
                  ColorBase Copilot
                </Link>
              </Button>
            </div>
          </div>
          <div className="pointer-events-auto hidden overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-[var(--shadow-md)] lg:grid lg:grid-cols-2 lg:grid-rows-4 lg:h-[26rem]">
            {POPULAR_COLORS.map((c) => (
              <Link
                key={c.hex}
                href={`/color/${c.hex.slice(1).toLowerCase()}`}
                className="group relative min-h-0"
                style={{ backgroundColor: c.hex }}
              >
                <span
                  className="absolute inset-x-0 bottom-0 p-2.5 text-[11px] font-semibold leading-tight"
                  style={{ color: getTextColor(c.hex) }}
                >
                  {c.name}
                  <span className="mt-0.5 block font-mono text-[10px] opacity-80">{c.hex}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeSection title="Popular colors" href="/colors" description="Start from colors developers actually ship.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {POPULAR_COLORS.map((c) => (
            <Link
              key={c.hex}
              href={`/color/${c.hex.slice(1).toLowerCase()}`}
              className="card-lift overflow-hidden rounded-[var(--radius-md)] border border-border bg-card"
            >
              <span className="block h-[4.5rem]" style={{ backgroundColor: c.hex }} />
              <span className="block px-2.5 py-2.5">
                <span className="block text-sm font-semibold tracking-[-0.02em]">{c.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{c.hex}</span>
              </span>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection title="Color families" href="/colors" description="Browse reds, blues, neutrals, and the rest of the library.">
        <div className="flex flex-wrap gap-2">
          {COLOR_FAMILIES.map((family) => (
            <Link
              key={family}
              href={`/colors/family/${family}`}
              className="rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-sm font-medium tracking-[-0.01em] hover:border-primary/30 hover:bg-muted"
            >
              {FAMILY_LABELS[family]}
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection title="Design systems" href="/colors/tailwind" description="Official scales, labeled as nearest when a hex is only an approximation.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DESIGN_SYSTEM_ROUTES.map((item) => (
            <Link key={item.path} href={item.path} className="card-lift rounded-[var(--radius-md)] border border-border bg-card p-5">
              <p className="font-display text-base font-semibold tracking-[-0.03em]">{item.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection title="Brand colors" href="/brands" description="Curated palettes. Distinct from approximations on individual hex pages.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {brands.map((b) => (
            <Link key={b.slug} href={`/brands/${b.slug}`} className="card-lift rounded-[var(--radius-md)] border border-border bg-card p-3.5">
              <div className="flex h-9 overflow-hidden rounded-lg">
                {b.primary.slice(0, 4).map((hex) => (
                  <span key={hex} className="flex-1" style={{ backgroundColor: hex }} />
                ))}
              </div>
              <p className="mt-2.5 text-sm font-semibold tracking-[-0.02em]">{b.name}</p>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection title="Developer tools" href="/tools" description="Converters and pickers for daily CSS work.">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {converters.map((t) => (
            <Link key={t.slug} href={`/${t.slug}`} className="rounded-xl border border-border/70 bg-card px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em] hover:border-primary/25 hover:bg-muted/50">
              {t.title}
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection title="Color generators" href="/palette-generator" description="Palettes, gradients, and CSS you can paste into a codebase.">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/palette-generator" className="rounded-xl border border-border/70 bg-card px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em] hover:border-primary/25 hover:bg-muted/50">
            Palette generator
          </Link>
          <Link href="/gradient-generator" className="rounded-xl border border-border/70 bg-card px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em] hover:border-primary/25 hover:bg-muted/50">
            Gradient generator
          </Link>
          {generators.slice(0, 4).map((t) => (
            <Link key={t.slug} href={`/${t.slug}`} className="rounded-xl border border-border/70 bg-card px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em] hover:border-primary/25 hover:bg-muted/50">
              {t.title}
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection title="Accessibility tools" href="/contrast-checker" description="Check contrast before a color ships in UI copy.">
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href="/contrast-checker" className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em] hover:border-primary/25 hover:bg-muted/50">
            <Contrast className="h-4 w-4" /> Contrast checker
          </Link>
          {a11y.map((t) => (
            <Link key={t.slug} href={`/${t.slug}`} className="rounded-xl border border-border/70 bg-card px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em] hover:border-primary/25 hover:bg-muted/50">
              {t.title}
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection title="AI Color Copilot" href="/ai-color-copilot" description="Describe a product. Get semantic tokens, light/dark themes, and exportable code.">
        <Link
          href="/ai-color-copilot"
          className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-[var(--shadow-sm)] transition-colors duration-200 hover:border-primary/30"
        >
          <span>
            <span className="block font-display text-base font-semibold tracking-[-0.03em]">Generate an accessible color system</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
              Banking dashboards, SaaS dark themes, Tailwind exports — structured, not paragraphs.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </HomeSection>

      <HomeSection title="Latest guides" href="/learning" description="Evergreen notes for CSS, contrast, and design tokens.">
        <div className="grid gap-3 sm:grid-cols-3">
          {guides.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card-lift rounded-[var(--radius-md)] border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{post.category}</p>
              <p className="mt-2 font-display text-[15px] font-semibold leading-snug tracking-[-0.03em]">{post.title}</p>
            </Link>
          ))}
        </div>
      </HomeSection>

      {popularUi.length > 0 && (
        <HomeSection title="Popular developer resources" href="/popular-ui-colors" description="UI tokens used across product interfaces.">
          <div className="flex flex-wrap gap-2">
            {popularUi.map((c) => (
              <Link
                key={c.hex + c.name}
                href={`/color/${c.hex.replace("#", "").toLowerCase()}`}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-sm"
              >
                <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                {c.name}
              </Link>
            ))}
          </div>
        </HomeSection>
      )}
    </div>
  );
}

function HomeSection({
  title,
  href,
  description,
  children,
}: {
  title: string;
  href: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.035em] sm:text-2xl">{title}</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
          <Link href={href} className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}
