import Link from "next/link";
import { ArrowRight, Check, Contrast, ImagePlus, LayoutDashboard } from "lucide-react";
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
      <HomeColorBlastLazy />
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
            Meet the color picker at the heart of ColorBase. Explore a shade, capture colors from an
            image, and turn your inspiration into a beautiful UI theme.
          </p>
          <div className="home-studio-actions">
            <Button asChild size="lg" className="home-studio-primary">
              <Link prefetch={false} href="/color-picker">
                Open color picker <ArrowRight />
              </Link>
            </Button>
            <Link prefetch={false} href="/image-color-picker" className="home-studio-secondary">
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
          <div className="mt-5 flex items-center gap-3">
            <ColorSwatchImage
              hex="#635BFF"
              name="ColorBase flagship violet"
              width={48}
              height={48}
              className="border-border h-12 w-12 rounded-xl border shadow-sm"
              priority
            />
            <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">
              Flagship starter swatch{" "}
              <span className="text-foreground font-mono font-medium">#635BFF</span> — open it in
              the picker or sample your own.
            </p>
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
          <Link key={href} href={href} prefetch={false}>
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
