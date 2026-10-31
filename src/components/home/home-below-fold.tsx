import Link from "next/link";
import { ArrowRight, Contrast } from "lucide-react";
import { COLOR_FAMILIES, FAMILY_LABELS } from "@/lib/data/families";
import { DESIGN_SYSTEM_ROUTES } from "@/lib/data/design-systems";
import { BRANDS } from "@/lib/data/brands";
import { POPULAR_UI_COLOR_GROUPS } from "@/lib/colors/palettes";
import { getFeaturedPosts } from "@/lib/data/blog";
import { getToolsByCategory } from "@/lib/tools-registry";
import { getStudioGradients } from "@/lib/data/gradient-library";
import { HomeImageStarter } from "./home-image-starter";
import { PaletteDiscovery } from "@/components/home/palette-discovery";
import { ColorSwatchImage } from "@/components/library/color-swatch-image";
import type { ReactNode } from "react";

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

/** Below-the-fold homepage blocks — kept out of the first paint composition. */
export function HomeBelowFold() {
  const popularUi = Object.values(POPULAR_UI_COLOR_GROUPS).flat().slice(0, 8);
  const brands = BRANDS.slice(0, 8);
  const converters = getToolsByCategory("converters").slice(0, 6);
  const generators = getToolsByCategory("css-generators").slice(0, 6);
  const a11y = getToolsByCategory("accessibility").slice(0, 4);
  const guides = getFeaturedPosts(3);

  return (
    <div>
      <HomeImageStarter />
      <PaletteDiscovery />

      <HomeSection
        title="A fresh take on gradients"
        href="/gradient-library#new-gradients"
        description="100 new named blends. Find a background you love and take the CSS with you."
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {getStudioGradients()
            .slice(0, 4)
            .map((gradient) => (
              <Link
                prefetch={false}
                key={gradient.slug}
                href={`/gradient-library/${gradient.slug}`}
                className="card-lift border-border bg-card overflow-hidden rounded-2xl border"
              >
                <span
                  className="block h-28 sm:h-36"
                  style={{ background: gradient.css }}
                  role="img"
                  aria-label={`${gradient.name} CSS gradient preview`}
                />
                <span className="block p-4">
                  <strong className="block text-sm font-semibold">{gradient.name}</strong>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    Preview & copy CSS
                  </span>
                </span>
              </Link>
            ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Popular colors"
        href="/colors"
        description="Start from colors developers actually ship."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {POPULAR_COLORS.map((c, index) => (
            <Link
              prefetch={false}
              key={c.hex}
              href={`/color/${c.hex.slice(1).toLowerCase()}`}
              className="card-lift border-border bg-card overflow-hidden rounded-[var(--radius-md)] border"
            >
              <ColorSwatchImage
                hex={c.hex}
                name={c.name}
                width={160}
                height={72}
                className="block h-[4.5rem] w-full object-cover"
                priority={index < 4}
              />
              <span className="block px-2.5 py-2.5">
                <span className="block text-sm font-semibold tracking-[-0.02em]">{c.name}</span>
                <span className="text-muted-foreground font-mono text-[11px]">{c.hex}</span>
              </span>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Color families"
        href="/colors"
        description="Browse reds, blues, neutrals, and the rest of the library."
      >
        <div className="flex flex-wrap gap-2">
          {COLOR_FAMILIES.map((family) => (
            <Link
              prefetch={false}
              key={family}
              href={`/colors/family/${family}`}
              className="border-border/70 bg-card hover:border-primary/30 hover:bg-muted rounded-full border px-3.5 py-1.5 text-sm font-medium tracking-[-0.01em]"
            >
              {FAMILY_LABELS[family]}
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Design systems"
        href="/colors/tailwind"
        description="Official scales, labeled as nearest when a hex is only an approximation."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DESIGN_SYSTEM_ROUTES.map((item) => (
            <Link
              prefetch={false}
              key={item.path}
              href={item.path}
              className="card-lift border-border bg-card rounded-[var(--radius-md)] border p-5"
            >
              <p className="font-display text-base font-semibold tracking-[-0.03em]">
                {item.title}
              </p>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Brand colors"
        href="/brands"
        description="Curated palettes. Distinct from approximations on individual hex pages."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {brands.map((b) => (
            <Link
              prefetch={false}
              key={b.slug}
              href={`/brands/${b.slug}`}
              className="card-lift border-border bg-card rounded-[var(--radius-md)] border p-3.5"
            >
              <div className="flex h-9 overflow-hidden rounded-lg">
                {b.primary.slice(0, 4).map((hex) => (
                  <ColorSwatchImage
                    key={hex}
                    hex={hex}
                    name={`${b.name} brand color`}
                    width={48}
                    height={36}
                    className="h-full min-w-0 flex-1 object-cover"
                  />
                ))}
              </div>
              <p className="mt-2.5 text-sm font-semibold tracking-[-0.02em]">{b.name}</p>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Developer tools"
        href="/tools"
        description="Converters and pickers for daily CSS work."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {converters.map((t) => (
            <Link
              prefetch={false}
              key={t.slug}
              href={`/${t.slug}`}
              className="border-border/70 bg-card hover:border-primary/25 hover:bg-muted/50 rounded-xl border px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em]"
            >
              {t.title}
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Color generators"
        href="/palette-generator"
        description="Palettes, gradients, and CSS you can paste into a codebase."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            prefetch={false}
            href="/palette-generator"
            className="border-border/70 bg-card hover:border-primary/25 hover:bg-muted/50 rounded-xl border px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em]"
          >
            Palette generator
          </Link>
          <Link
            prefetch={false}
            href="/gradient-generator"
            className="border-border/70 bg-card hover:border-primary/25 hover:bg-muted/50 rounded-xl border px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em]"
          >
            Gradient generator
          </Link>
          {generators.slice(0, 4).map((t) => (
            <Link
              prefetch={false}
              key={t.slug}
              href={`/${t.slug}`}
              className="border-border/70 bg-card hover:border-primary/25 hover:bg-muted/50 rounded-xl border px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em]"
            >
              {t.title}
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Accessibility tools"
        href="/contrast-checker"
        description="Check contrast before a color ships in UI copy."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            prefetch={false}
            href="/contrast-checker"
            className="border-border/70 bg-card hover:border-primary/25 hover:bg-muted/50 flex items-center gap-2 rounded-xl border px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em]"
          >
            <Contrast className="h-4 w-4" /> Contrast checker
          </Link>
          {a11y.map((t) => (
            <Link
              prefetch={false}
              key={t.slug}
              href={`/${t.slug}`}
              className="border-border/70 bg-card hover:border-primary/25 hover:bg-muted/50 rounded-xl border px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em]"
            >
              {t.title}
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Standards & resources"
        href="/resources"
        description="WCAG, MDN, and CSS Color Module references — plus a cite-ready ColorBase link."
      >
        <Link
          prefetch={false}
          href="/resources"
          className="border-border bg-card hover:border-primary/30 flex items-center justify-between rounded-[var(--radius-lg)] border p-5 shadow-[var(--shadow-sm)] transition-colors duration-200"
        >
          <span>
            <span className="font-display block text-base font-semibold tracking-[-0.03em]">
              Color accessibility & citation resources
            </span>
            <span className="text-muted-foreground mt-1 block text-sm leading-relaxed">
              Outbound specs, contrast checklist, and embeddable credit for writers and agents.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </HomeSection>

      <HomeSection
        title="AI Color Copilot"
        href="/ai-color-copilot"
        description="Describe a product. Get semantic tokens, light/dark themes, and exportable code."
      >
        <Link
          prefetch={false}
          href="/ai-color-copilot"
          className="border-border bg-card hover:border-primary/30 flex items-center justify-between rounded-[var(--radius-lg)] border p-5 shadow-[var(--shadow-sm)] transition-colors duration-200"
        >
          <span>
            <span className="font-display block text-base font-semibold tracking-[-0.03em]">
              Generate an accessible color system
            </span>
            <span className="text-muted-foreground mt-1 block text-sm leading-relaxed">
              Banking dashboards, SaaS dark themes, Tailwind exports — structured, not paragraphs.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </HomeSection>

      <HomeSection
        title="Latest guides"
        href="/learning"
        description="Evergreen notes for CSS, contrast, and design tokens."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {guides.map((post) => (
            <Link
              prefetch={false}
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card-lift border-border bg-card rounded-[var(--radius-md)] border p-4"
            >
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                {post.category}
              </p>
              <p className="font-display mt-2 text-[15px] leading-snug font-semibold tracking-[-0.03em]">
                {post.title}
              </p>
            </Link>
          ))}
        </div>
      </HomeSection>

      {popularUi.length > 0 && (
        <HomeSection
          title="Popular developer resources"
          href="/popular-ui-colors"
          description="UI tokens used across product interfaces."
        >
          <div className="flex flex-wrap gap-2">
            {popularUi.map((c) => (
              <Link
                prefetch={false}
                key={c.hex + c.name}
                href={`/color/${c.hex.replace("#", "").toLowerCase()}`}
                className="border-border/70 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
              >
                <ColorSwatchImage
                  hex={c.hex}
                  name={c.name}
                  width={12}
                  height={12}
                  className="border-border h-3 w-3 rounded-full border"
                />
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
    <section className="border-border/50 border-b">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.035em] sm:text-2xl">
              {title}
            </h2>
            <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-relaxed">
              {description}
            </p>
          </div>
          <Link
            prefetch={false}
            href={href}
            className="text-primary text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}
