import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = createPageMetadata({
  title: "Learning Section",
  description: "Learn color theory, HEX/RGB/HSL formats, contrast, and accessible design.",
  path: "/learning",
  keywords: ["learn color theory", "hex rgb hsl tutorial"],
});

const lessons = [
  {
    title: "HEX, RGB, and HSL explained",
    body: "HEX encodes RGB channels in base-16. HSL is more intuitive for adjusting hue, saturation, and lightness in design systems.",
    href: "/hex-to-rgb",
  },
  {
    title: "Building accessible contrast",
    body: "Aim for 4.5:1 for body text (WCAG AA). Use our contrast checker while choosing text and background pairs.",
    href: "/contrast-checker",
  },
  {
    title: "Color harmonies",
    body: "Complementary, analogous, and triadic schemes create balanced palettes from a single base hue.",
    href: "/palette-generator",
  },
  {
    title: "Exporting design tokens",
    body: "Export palettes as CSS variables, Tailwind config, Swift, Flutter, and more for cross-platform consistency.",
    href: "/palette-export",
  },
];

export default function LearningPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Learning", href: "/learning" },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold">Learning</h1>
      <p className="mt-3 text-muted-foreground">
        Short guides to help you use color confidently on the web.
      </p>
      <div className="mt-8 space-y-4">
        {lessons.map((lesson) => (
          <Link
            key={lesson.title}
            href={lesson.href}
            className="glass block rounded-2xl border border-border/60 p-5 transition-colors hover:border-primary/40"
          >
            <h2 className="font-display text-xl font-semibold">{lesson.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{lesson.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
