import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactDetails } from "@/components/layout/contact-details";
import { ORGANIZATION, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "colorBase is a free color studio from Ranchi, India — converters, palettes, contrast, and original guides for people who ship interfaces.",
  path: "/about",
  keywords: ["about colorbase", "color tools india", "html color codes"],
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
          {SITE_NAME} is a free studio for people who work with color on screens: product designers,
          frontend engineers, and students who are tired of guessing HEX. We run from Lalpur,
          Ranchi, Jharkhand, India, and we publish at colorbase.in.
        </p>
        <h2>What we build</h2>
        <p>
          Converters (HEX, RGB, HSL, HSV, CMYK), a serious color picker, palette and gradient
          generators, WCAG contrast and color-blind checks, CSS extras, and libraries of named
          colors, brands, and palettes. Copilot helps you describe a product; the math for contrast
          and ramps stays deterministic.
        </p>
        <h2>What we write</h2>
        <p>
          Tools without explanation are a slot machine. The{" "}
          <Link href="/learning">learning path</Link>,{" "}
          <Link href="/color-meaning">color meaning</Link> notes, and{" "}
          <Link href="/blog">blog</Link> are original studio writing: how to budget chroma, how to
          pass WCAG without killing a brand, how to export tokens instead of screenshots. We do not
          publish auto-generated “practical guide 1” pages.
        </p>
        <h2>How we work</h2>
        <ul>
          <li>Core color tools stay free and usable without an account.</li>
          <li>Browser tools keep work on your device unless you choose to persist it.</li>
          <li>Brand palettes in the library are for reference; trademarks belong to their owners.</li>
          <li>We answer support at {ORGANIZATION.email}.</li>
        </ul>
        <h2>Who it is for</h2>
        <p>
          If you are shipping a landing page from a laptop in Ranchi, a design system in Europe, or
          a student project that needs one accessible primary — you are the audience. If you only
          need a random pretty gradient, other sites exist; we would rather you leave with a token
          and a contrast ratio.
        </p>
        <p>
          Legal: <Link href="/privacy">Privacy</Link>, <Link href="/terms">Terms</Link>,{" "}
          <Link href="/cookies">Cookies</Link>, <Link href="/disclaimer">Disclaimer</Link>. Press or
          corrections: <Link href="/contact">Contact</Link>.
        </p>
      </div>
      <ContactDetails className="mt-8 rounded-2xl border border-border/60 bg-background/80 p-4" />
    </div>
  );
}
