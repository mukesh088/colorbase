import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, Contrast, ImagePlus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorSearchBox } from "@/components/search/color-search-box";
import { COLOR_FAMILIES, FAMILY_LABELS } from "@/lib/data/families";
import { DESIGN_SYSTEM_ROUTES } from "@/lib/data/design-systems";
import { BRANDS } from "@/lib/data/brands";
import { POPULAR_UI_COLOR_GROUPS } from "@/lib/colors/palettes";
import { getFeaturedPosts } from "@/lib/data/blog";
import { getToolsByCategory } from "@/lib/tools-registry";
import { FlagshipPicker } from "./flagship-picker";
import { HomeColorBlast } from "./home-color-blast";
import { HomeImageStarter } from "./home-image-starter";
import { PaletteDiscovery } from "@/components/home/palette-discovery";
import "./home-studio.css";

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
  const popularUi = Object.values(POPULAR_UI_COLOR_GROUPS).flat().slice(0, 8);
  const brands = BRANDS.slice(0, 8);
  const converters = getToolsByCategory("converters").slice(0, 6);
  const generators = getToolsByCategory("css-generators").slice(0, 6);
  const a11y = getToolsByCategory("accessibility").slice(0, 4);
  const guides = getFeaturedPosts(3);

  return (
    <div>
      <section className="home-studio-hero">
        <HomeColorBlast />
        <div className="home-studio-grid">
          <div className="home-studio-copy">
            <p className="home-studio-eyebrow">
              <span /> YOUR NEXT IDEA, IN COLOR
            </p>
            <h1>
              Find your color.
              <br />
              <span>Make it yours.</span>
            </h1>
            <p className="home-studio-description">
              Meet the color picker at the heart of ColorBase. Explore a shade, capture colors from
              an image, and turn your inspiration into a beautiful UI theme.
            </p>
            <div className="home-studio-actions">
              <Button asChild size="lg" className="home-studio-primary">
                <Link href="/color-picker">
                  Open color picker <ArrowRight />
                </Link>
              </Button>
              <Link href="/image-color-picker" className="home-studio-secondary">
                Pick from an image <ArrowUpRightIcon />
              </Link>
            </div>
            <div className="home-studio-benefits">
              <span>
                <Check size={12} />
                Free to use
              </span>
              <span>
                <Check size={12} />
                No account needed
              </span>
              <span>
                <Check size={12} />
                Yours to export
              </span>
            </div>
            <div className="home-studio-search">
              <span>LOOKING FOR A SPECIFIC COLOR?</span>
              <ColorSearchBox autoFocus={false} />
            </div>
          </div>
          <div className="home-studio-visual">
            <FlagshipPicker />
          </div>
        </div>
        <div className="home-studio-workflows">
          {[
            {
              icon: LayoutDashboard,
              name: "Build a UI theme",
              description: "Your palette, on a real interface.",
              href: "/theme-builder",
            },
            {
              icon: ImagePlus,
              name: "Start from an image",
              description: "Turn inspiration into usable colors.",
              href: "/image-color-picker",
            },
            {
              icon: Contrast,
              name: "Check your contrast",
              description: "Make every word easier to read.",
              href: "/contrast-checker",
            },
          ].map(({ icon: Icon, name, description, href }) => (
            <Link key={href} href={href}>
              <span className="home-workflow-icon">
                <Icon size={19} />
              </span>
              <div>
                <strong>{name}</strong>
                <p>{description}</p>
              </div>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      </section>

      <HomeImageStarter />
      <PaletteDiscovery />

      <HomeSection
        title="Popular colors"
        href="/colors"
        description="Start from colors developers actually ship."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {POPULAR_COLORS.map((c) => (
            <Link
              key={c.hex}
              href={`/color/${c.hex.slice(1).toLowerCase()}`}
              className="card-lift border-border bg-card overflow-hidden rounded-[var(--radius-md)] border"
            >
              <span className="block h-[4.5rem]" style={{ backgroundColor: c.hex }} />
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
              key={b.slug}
              href={`/brands/${b.slug}`}
              className="card-lift border-border bg-card rounded-[var(--radius-md)] border p-3.5"
            >
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

      <HomeSection
        title="Developer tools"
        href="/tools"
        description="Converters and pickers for daily CSS work."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {converters.map((t) => (
            <Link
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
            href="/palette-generator"
            className="border-border/70 bg-card hover:border-primary/25 hover:bg-muted/50 rounded-xl border px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em]"
          >
            Palette generator
          </Link>
          <Link
            href="/gradient-generator"
            className="border-border/70 bg-card hover:border-primary/25 hover:bg-muted/50 rounded-xl border px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em]"
          >
            Gradient generator
          </Link>
          {generators.slice(0, 4).map((t) => (
            <Link
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
            href="/contrast-checker"
            className="border-border/70 bg-card hover:border-primary/25 hover:bg-muted/50 flex items-center gap-2 rounded-xl border px-3.5 py-3.5 text-sm font-medium tracking-[-0.01em]"
          >
            <Contrast className="h-4 w-4" /> Contrast checker
          </Link>
          {a11y.map((t) => (
            <Link
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
        title="AI Color Copilot"
        href="/ai-color-copilot"
        description="Describe a product. Get semantic tokens, light/dark themes, and exportable code."
      >
        <Link
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
                key={c.hex + c.name}
                href={`/color/${c.hex.replace("#", "").toLowerCase()}`}
                className="border-border/70 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
              >
                <span
                  className="border-border h-3 w-3 rounded-full border"
                  style={{ backgroundColor: c.hex }}
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

function ArrowUpRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
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
          <Link href={href} className="text-primary text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}
