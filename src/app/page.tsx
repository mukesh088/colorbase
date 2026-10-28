import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { HomeHero } from "@/components/home/home-hero";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";
import { COLOR_CODE_FAQS } from "@/lib/data/color-code-guide";

export const metadata = createPageMetadata({
  title: "Color Picker, HEX Color Codes & Palettes",
  description:
    "Find HEX color codes, pick colors from images, build palettes, and check contrast. Explore CSS color names, RGB values, gradients, and free color tools.",
  path: "/",
});

const faqs = COLOR_CODE_FAQS.slice(0, 4);

export default function HomePage() {
  return (
    <div>
      <JsonLd data={faqJsonLd(faqs)} />
      <HomeHero />
      <section className="mx-auto max-w-7xl px-3 py-10 sm:px-4 lg:px-6">
        <h2 className="font-display text-2xl font-semibold">
          Find the right color code for your project
        </h2>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
          Start with the{" "}
          <Link href="/color-codes" className="text-primary underline underline-offset-4">
            HEX and RGB color code chart
          </Link>
          , browse{" "}
          <Link href="/colors/css" className="text-primary underline underline-offset-4">
            CSS color names
          </Link>
          , or{" "}
          <Link href="/learn/color-codes" className="text-primary underline underline-offset-4">
            learn how color codes work
          </Link>
          . Convert a value with{" "}
          <Link href="/hex-to-rgb" className="text-primary underline underline-offset-4">
            HEX to RGB
          </Link>{" "}
          before adding it to your design.
        </p>
        <h2 className="font-display mt-10 text-2xl font-semibold">Color code questions</h2>
        <dl className="mt-5 grid gap-6 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold">{faq.question}</dt>
              <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
