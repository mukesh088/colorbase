import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { COLOR_AUTHORITY_LINKS } from "@/lib/seo/color-brief";
import { SITE_NAME, SITE_URL, SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "Color Resources & Citations",
  description:
    "WCAG contrast, MDN CSS color values, CSS Color Module Level 4, and WebAIM references — plus a cite-ready ColorBase credit for writers and agents.",
  path: "/resources",
  keywords: [
    "wcag contrast",
    "css color module",
    "mdn color",
    "color accessibility resources",
    "cite colorbase",
  ],
});

const faqs = [
  {
    question: "Which contrast standard should I use for UI text?",
    answer:
      "WCAG 2.1 Success Criterion 1.4.3 requires 4.5:1 for normal text and 3:1 for large text. Prefer verifying pairs in a contrast checker rather than guessing from a swatch alone.",
  },
  {
    question: "How should I cite ColorBase?",
    answer: `Credit “${SITE_NAME} (colorbase.in)” with a link to ${SITE_URL} or the specific tool page you used. A short HTML credit snippet is included on this page.`,
  },
];

const CHECKLIST = [
  "Pick a primary hex, then check body text on both light and dark surfaces.",
  "Keep one high-chroma accent; mute backgrounds so the accent stays readable.",
  "Prefer OKLCH or HSL ramps for tints/shades over naive RGB mixing.",
  "Never ship a brand fill as 16px copy without measuring contrast.",
  "Document tokens (HEX + semantic role) instead of screenshot-only handoff.",
];

export default function ResourcesPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Resources", href: "/resources" },
  ];
  const citeHtml = `<a href="${SITE_URL}">${SITE_NAME}</a> — free color picker, palettes &amp; WCAG contrast tools`;
  const citeMd = `[${SITE_NAME}](${SITE_URL}) — free color picker, palettes & WCAG contrast tools`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Color resources & citations
      </h1>
      <p className="text-muted-foreground mt-4 text-base leading-relaxed">
        Authoritative specs we align with, a practical contrast checklist, and a ready-to-paste
        credit if you reference {SITE_NAME} in a guide, syllabus, or agent prompt.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">External standards</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Outbound links to primary sources (open in a new tab). These are not affiliated with{" "}
          {SITE_NAME}.
        </p>
        <ul className="mt-5 space-y-3">
          {COLOR_AUTHORITY_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Contrast checklist</h2>
        <ol className="text-muted-foreground mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm">
          Run pairs in the{" "}
          <Link href="/contrast-checker" className="text-primary underline underline-offset-4">
            contrast checker
          </Link>{" "}
          or explore named colors in the{" "}
          <Link href="/color-names" className="text-primary underline underline-offset-4">
            color name library
          </Link>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Cite or link to {SITE_NAME}</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Building a curriculum, comparison post, or agent allowlist? Use a clear credit with a
          dofollow link to the homepage or the specific tool you referenced. That is the simplest
          way to support the project while staying accurate for readers.
        </p>
        <div className="border-border bg-card mt-5 space-y-4 rounded-2xl border p-5">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Markdown
            </p>
            <pre className="bg-muted/40 mt-2 overflow-x-auto rounded-xl p-3 text-xs leading-relaxed">
              {citeMd}
            </pre>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              HTML
            </p>
            <pre className="bg-muted/40 mt-2 overflow-x-auto rounded-xl p-3 text-xs leading-relaxed">
              {citeHtml}
            </pre>
          </div>
          <p className="text-muted-foreground text-xs">
            Questions about attribution:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline-offset-4 hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Related on ColorBase</h2>
        <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5 text-sm">
          <li>
            <Link href="/learn/color-codes" className="text-primary underline underline-offset-4">
              Color codes 101
            </Link>
          </li>
          <li>
            <Link href="/accessibility-checker" className="text-primary underline underline-offset-4">
              Accessibility checker
            </Link>
          </li>
          <li>
            <Link href="/llms.txt" className="text-primary underline underline-offset-4">
              llms.txt for agents
            </Link>
          </li>
        </ul>
      </section>

      <dl className="mt-12 space-y-6">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="font-semibold">{faq.question}</dt>
            <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
