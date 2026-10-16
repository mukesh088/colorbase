import Link from "next/link";
import type { ToolDefinition } from "@/types/tools";
import { CATEGORY_LABELS } from "@/lib/tools-registry";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RelatedTools } from "@/components/layout/related-tools";
import { ToolFaqs } from "@/components/layout/tool-faqs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, faqJsonLd, softwareAppJsonLd } from "@/lib/seo";
import { TOOL_FAQS } from "@/lib/faqs";
import { getRelatedTools } from "@/lib/tools-registry";
import { ToolGuideSection } from "@/components/content/tool-guide";
import { ArrowRight, Blend, Contrast, Image, Palette, Pipette, RefreshCw } from "lucide-react";
import "./tool-pages.css";

const TOOL_NAVIGATION = [
  { href: "/color-picker", title: "Picker", icon: Pipette, slugs: ["color-picker"] },
  {
    href: "/hex-to-rgb",
    title: "Convert",
    icon: RefreshCw,
    slugs: [
      "hex-to-rgb",
      "rgb-to-hex",
      "hex-to-hsl",
      "hsl-to-hex",
      "hsv-converter",
      "cmyk-converter",
    ],
  },
  {
    href: "/image-color-picker",
    title: "Image colors",
    icon: Image,
    slugs: ["image-color-picker", "image-palette-extractor", "palette-from-image"],
  },
  { href: "/color-wheel", title: "Color wheel", icon: Palette, slugs: ["color-wheel"] },
  {
    href: "/contrast-checker",
    title: "Contrast",
    icon: Contrast,
    slugs: ["contrast-checker", "accessibility-checker", "color-blind-simulator"],
  },
  {
    href: "/gradient-generator",
    title: "Gradients",
    icon: Blend,
    slugs: [
      "gradient-generator",
      "css-gradient-generator",
      "linear-gradient-generator",
      "radial-gradient-generator",
      "conic-gradient-generator",
    ],
  },
];

export function ToolPageShell({
  tool,
  children,
  hideHeader = false,
}: {
  tool: ToolDefinition;
  children: React.ReactNode;
  hideHeader?: boolean;
}) {
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Our Tools", href: "/tools" },
    { name: CATEGORY_LABELS[tool.category], href: `/tools?category=${tool.category}` },
    { name: tool.title, href: `/${tool.slug}` },
  ];
  const faqs = TOOL_FAQS[tool.slug] ?? [];
  const related = getRelatedTools(tool.slug);

  return (
    <div className="tool-page-shell">
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumbs),
          softwareAppJsonLd(tool),
          ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
        ]}
      />
      <Breadcrumbs items={breadcrumbs} />
      {hideHeader ? (
        <h1 className="sr-only">{tool.title}</h1>
      ) : (
        <header className="tool-page-header">
          <div>
            <Link href={`/tools?category=${tool.category}`} className="tool-page-category">
              {CATEGORY_LABELS[tool.category]}
            </Link>
            <h1>{tool.title}</h1>
            <p>{tool.description}</p>
          </div>
          <Link href="/theme-builder" className="tool-page-studio-link">
            Take your colors further <ArrowRight size={14} />
          </Link>
        </header>
      )}
      {TOOL_NAVIGATION.some((item) => item.slugs.includes(tool.slug)) && (
        <nav className="tool-page-navigation" aria-label="Color toolkit">
          {TOOL_NAVIGATION.map(({ href, title, icon: Icon, slugs }) => (
            <Link
              key={href}
              href={href}
              aria-current={slugs.includes(tool.slug) ? "page" : undefined}
            >
              <Icon size={14} />
              {title}
            </Link>
          ))}
        </nav>
      )}
      <div className="min-w-0">{children}</div>
      <ToolGuideSection slug={tool.slug} />
      <RelatedTools tools={related} />
      {faqs.length > 0 && <ToolFaqs faqs={faqs} />}
      <p className="text-muted-foreground mt-8 text-sm">
        Looking for more? Browse{" "}
        <Link href="/tools" className="text-primary underline-offset-4 hover:underline">
          Our Tools
        </Link>
        .
      </p>
    </div>
  );
}
