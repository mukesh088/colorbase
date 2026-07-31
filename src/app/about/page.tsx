import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "Learn about colorBase — free modern color tools for designers and developers.",
  path: "/about",
  keywords: ["about html color codes", "color tools"],
});

export default function AboutPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-4xl font-semibold">About {SITE_NAME}</h1>
      <div className="prose prose-neutral mt-6 dark:prose-invert">
        <p>
          {SITE_NAME} is a free suite of modern color tools for designers, developers, and
          creators. Convert formats, generate palettes and gradients, check WCAG contrast, and
          export tokens for every platform.
        </p>
        <p>
          We focus on performance, accessibility, and clean UX — with glassmorphism UI, dark mode,
          and keyboard-friendly interactions across every tool.
        </p>
      </div>
    </div>
  );
}
