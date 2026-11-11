import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Check, Contrast, ImagePlus, LayoutDashboard, Palette, Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorSearchBox } from "@/components/search/color-search-box";
import { FlagshipPicker } from "./flagship-picker";
import { ColorSwatchImage } from "@/components/library/color-swatch-image";
import { HomeColorBlastLazy } from "./home-color-blast-lazy";
import "./home-studio.css";

/** Above-the-fold hero only — keeps first paint lean for LCP. */
export function HomeHero() {
  return (
    <section className="home-studio-hero">
      <div className="home-studio-orb home-studio-orb-a" aria-hidden />
      <div className="home-studio-orb home-studio-orb-b" aria-hidden />
      <HomeColorBlastLazy />
      <div className="home-studio-grid">
        <div className="home-studio-copy animate-rise">
          <p className="home-studio-eyebrow">
            <span /> COLOR SYSTEMS FOR THE WEB
          </p>
          <h1>
            Build better
            <br />
            <span>color systems.</span>
          </h1>
          <p className="home-studio-description">
            Explore colors, create accessible palettes, preview interfaces, and export
            production-ready CSS and design tokens — free, with no account required.
          </p>
          <div className="home-studio-actions">
            <Button asChild size="lg" className="home-studio-primary">
              <Link prefetch={false} href="/color-picker">
                <Pipette className="h-4 w-4" />
                Open Color Picker <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="home-studio-secondary-btn">
              <Link prefetch={false} href="/palette-generator">
                <Palette className="h-4 w-4" />
                Generate Palette
              </Link>
            </Button>
            <Link prefetch={false} href="/contrast-checker" className="home-studio-secondary">
              <Contrast className="h-3.5 w-3.5" />
              Check Contrast <ArrowUpRightIcon />
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
          <div className="home-studio-flagship">
            <ColorSwatchImage
              hex="#635BFF"
              name="ColorBase flagship violet"
              width={48}
              height={48}
              className="home-studio-flagship-swatch"
              priority
            />
            <div>
              <p className="home-studio-flagship-label">Flagship starter</p>
              <p className="home-studio-flagship-copy">
                <span className="font-mono">#635BFF</span> — open it in the picker or sample your
                own.
              </p>
            </div>
            <Link prefetch={false} href="/color/635bff" className="home-studio-flagship-link">
              Open swatch <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <div className="home-studio-visual home-studio-visual-rise">
          <FlagshipPicker />
        </div>
      </div>
      <div className="home-studio-workflows">
        {[
          {
            icon: Pipette,
            name: "Pick and convert",
            description: "HEX, RGB, HSL, and OKLCH in one place.",
            href: "/color-picker",
            accent: "#db2777",
          },
          {
            icon: ImagePlus,
            name: "Extract from an image",
            description: "Sample pixels into a usable palette.",
            href: "/image-color-picker",
            accent: "#ea580c",
          },
          {
            icon: Palette,
            name: "Generate a balanced palette",
            description: "Harmony rules with lockable swatches.",
            href: "/palette-generator",
            accent: "#7c3aed",
          },
          {
            icon: Contrast,
            name: "Check accessibility",
            description: "WCAG contrast before you ship text.",
            href: "/contrast-checker",
            accent: "#0f766e",
          },
          {
            icon: LayoutDashboard,
            name: "Preview a UI theme",
            description: "See tokens on a real interface.",
            href: "/theme-builder",
            accent: "#2563eb",
          },
          {
            icon: ArrowRight,
            name: "Export design tokens",
            description: "CSS variables and Tailwind-ready output.",
            href: "/palette-export",
            accent: "#be185d",
          },
        ].map(({ icon: Icon, name, description, href, accent }) => (
          <Link key={href} href={href} prefetch={false} style={{ "--wf-accent": accent } as CSSProperties}>
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
