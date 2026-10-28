import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-config";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getAllNamedColors,
  getCssNamedColors,
  getIndexableNamedColors,
} from "@/lib/data/color-names";
import { ColorNamesExplorer } from "@/components/library/color-names-explorer";
import { LibraryHero } from "@/components/library/library-hero";
import { LibraryInsight } from "@/components/library/library-insight";

export const dynamic = "force-static";
export const revalidate = 86400;

export const metadata: Metadata = createPageMetadata({
  title: "CSS Color Names & Hex Codes",
  description:
    "Look up CSS named colors with HEX and RGB. Wheat is #F5DEB3, salmon is #FA8072, tomato is #FF6347 — copy any keyword for CSS and design.",
  path: "/color-names",
  keywords: [
    "css color names",
    "named colors hex",
    "wheat color",
    "salmon color",
    "tomato color",
    "color hex code",
  ],
});

export default function ColorNamesPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Names", href: "/color-names" },
  ];
  const total = getAllNamedColors().length;
  const cssColors = getCssNamedColors();
  const publishedColors = getIndexableNamedColors();
  const featuredForLd = publishedColors.slice(0, 24);
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CSS named colors hex codes",
    description: "Index of CSS named colors with hex codes, including wheat, salmon, and tomato.",
    url: `${SITE_URL}/color-names`,
    numberOfItems: publishedColors.length,
    itemListElement: featuredForLd.map((c, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${c.displayName} color ${c.hex.toUpperCase()}`,
      url: `${SITE_URL}/color-names/${c.slug}`,
    })),
  };
  const faqs = [
    {
      question: "What are CSS named colors?",
      answer:
        "CSS named colors are keywords such as wheat, salmon, and tomato that browsers map to a fixed hex value. Wheat is #F5DEB3, salmon is #FA8072, and tomato is #FF6347.",
    },
    {
      question: "Should I use color names or hex codes in production CSS?",
      answer:
        "Hex (or OKLCH) is more precise in new code. Use a CSS keyword only when you are matching an existing stylesheet. Many named colors are too light for body text on white.",
    },
    {
      question: "How many CSS named colors are there?",
      answer: `This library lists ${cssColors.length} browser-supported CSS named colors, each with HEX, RGB, meaning, and a usage note.`,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), listLd, faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      <LibraryHero
        eyebrow="Named catalog"
        title="Color Names & Hex Codes"
        description={`Search wheat, salmon, tomato, and ${cssColors.length} CSS named colors — plus ${total.toLocaleString("en-US")} catalog names — with HEX, RGB, meaning, and a usage caveat for each keyword.`}
        stats={[
          { label: "CSS names", value: String(cssColors.length) },
          { label: "Catalog", value: total.toLocaleString("en-US") },
        ]}
        swatches={["#F5DEB3", "#FA8072", "#FF6347", "#F0E68C", "#4682B4", "#2F4F4F"]}
        actions={[
          { href: "/css-named-colors", label: "Named color tool", primary: true },
          { href: "/color-picker", label: "Open picker" },
        ]}
      />

      <div className="mt-8">
        <LibraryInsight id="color-names" />
      </div>

      <div className="mt-8">
        <ColorNamesExplorer />
      </div>

      <nav
        aria-label="Published color name index"
        className="mt-16 rounded-[1.35rem] border border-border/50 bg-background/70 p-5 sm:rounded-[1.75rem] sm:p-7"
      >
        <h2 className="font-display text-xl font-semibold tracking-tight">
          CSS named color index
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every CSS keyword with its hex code — wheat, salmon, tomato, and the rest of the named set.
        </p>
        <ul className="mt-6 columns-1 gap-x-8 text-sm sm:columns-2 lg:columns-3">
          {cssColors.map((c) => (
            <li key={c.slug} className="mb-1.5 break-inside-avoid">
              <Link
                href={`/color-names/${c.slug}`}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {c.displayName} color {c.hex.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="mt-12 space-y-4">
        <h2 className="font-display text-xl font-semibold tracking-tight">Named color FAQ</h2>
        <dl className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-border/50 p-4">
              <dt className="font-medium">{faq.question}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
