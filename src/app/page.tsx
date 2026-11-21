import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { HomeHero } from "@/components/home/home-hero";
import { HomeBelowFold } from "@/components/home/home-below-fold";
import { createPageMetadata, faqJsonLd, pageSeo } from "@/lib/seo";
import { COLOR_CODE_FAQS } from "@/lib/data/color-code-guide";

const homeSeo = pageSeo("/")!;

export const metadata = createPageMetadata({
  title: homeSeo.title,
  description: homeSeo.description,
  path: "/",
});

const faqs = COLOR_CODE_FAQS.slice(0, 4);

export default function HomePage() {
  return (
    <div>
      <JsonLd data={faqJsonLd(faqs)} />
      <HomeHero />
      <HomeBelowFold />
      <section className="mx-auto max-w-7xl px-3 py-10 sm:px-4 lg:px-6">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-rose-50/80 via-background to-violet-50/70 p-6 sm:p-8 dark:from-rose-950/30 dark:via-background dark:to-violet-950/20">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
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
            before adding it to your design. For WCAG and CSS specs, see{" "}
            <Link href="/resources" className="text-primary underline underline-offset-4">
              color resources
            </Link>
            .
          </p>
        </div>
        <h2 className="font-display mt-10 text-2xl font-semibold tracking-[-0.03em]">
          Color code questions
        </h2>
        <dl className="mt-5 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-[var(--shadow-sm)]"
            >
              <dt className="font-semibold tracking-[-0.02em]">{faq.question}</dt>
              <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
