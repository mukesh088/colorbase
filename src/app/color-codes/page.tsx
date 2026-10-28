import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  ColorCodePageShell,
  RelatedCodeLinks,
  AdReserve,
} from "@/components/color-codes/page-shell";
import { ColorReferenceTable } from "@/components/color-codes/reference-table";
import { COLOR_CODE_CATEGORIES } from "@/lib/data/color-codes";
import { getCommonColorRows } from "@/lib/data/color-codes/common";
import { COLOR_CODE_FAQS } from "@/lib/data/color-code-guide";

export const metadata: Metadata = createPageMetadata({
  title: "Color Codes: HEX, RGB & HTML Color Chart",
  description:
    "Find HEX color codes, RGB values and CSS color names in a searchable chart. Copy common colors, look up a HEX code, and learn how to use it in CSS.",
  path: "/color-codes",
  keywords: [
    "color codes",
    "hex color code",
    "hex color codes",
    "html color codes",
    "rgb color codes",
    "color code chart",
  ],
});

const linkClass = "text-primary underline underline-offset-4";

export default function ColorCodesHubPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Codes", href: "/color-codes" },
  ];
  const rows = getCommonColorRows().map((row) => ({ ...row, id: row.name }));

  return (
    <>
      <JsonLd data={faqJsonLd(COLOR_CODE_FAQS)} />
      <ColorCodePageShell
        crumbs={crumbs}
        eyebrow="Web color reference"
        title="Color Codes: HEX, RGB & HTML Colors"
        description="Look up a HEX color code, copy RGB values, or browse CSS color names. Start with the common color chart, then open a swatch for shades, palettes, conversions, and text contrast."
        aside={
          <RelatedCodeLinks
            items={[
              { href: "/color-picker", label: "HEX color picker" },
              { href: "/image-color-picker", label: "Find a color from an image" },
              { href: "/colors/css", label: "All CSS named colors" },
              { href: "/hex-to-rgb", label: "Convert HEX to RGB" },
              { href: "/learn/color-codes", label: "Read the color code guide" },
            ]}
          />
        }
      >
        <section
          aria-labelledby="hex-lookup"
          className="border-border bg-card rounded-2xl border p-5"
        >
          <h2 id="hex-lookup" className="font-display text-xl font-semibold">
            Look up a HEX color code
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter a three- or six-digit HEX value to find its RGB, HSL, shades, and matching colors.
          </p>
          <form action="/api/color-lookup" method="get" className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="hex-code-query" className="sr-only">
              HEX color code
            </label>
            <input
              id="hex-code-query"
              name="q"
              type="text"
              required
              pattern="#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?"
              title="Enter three or six hexadecimal digits, with an optional #."
              placeholder="#3B82F6"
              autoCapitalize="off"
              autoComplete="off"
              spellCheck={false}
              className="border-border bg-background min-w-0 flex-1 rounded-xl border px-4 py-3 font-mono text-sm"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground rounded-xl px-5 py-3 text-sm font-semibold"
            >
              Look up HEX
            </button>
          </form>
          <p className="text-muted-foreground mt-3 text-sm">
            Need to choose a shade? Open the{" "}
            <Link href="/color-picker" className={linkClass}>
              color picker
            </Link>{" "}
            or{" "}
            <Link href="/image-color-picker" className={linkClass}>
              pick a color from an image
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="color-chart" className="mt-10">
          <h2 id="color-chart" className="font-display text-2xl font-semibold">
            Common HEX and RGB color code chart
          </h2>
          <p className="text-muted-foreground mt-2 mb-5 text-sm leading-relaxed">
            Search these 20 CSS named colors by name, HEX, RGB, or HSL. Copy a value or open its
            swatch for more detail. CSS names are exact: <code>green</code> is #008000, while{" "}
            <code>lime</code> is #00FF00.
          </p>
          <ColorReferenceTable
            rows={rows}
            columns={[
              { id: "name", header: "Color name" },
              { id: "hex", header: "HEX code", copy: true, mono: true },
              { id: "rgb", header: "RGB", copy: true, mono: true },
              { id: "hsl", header: "HSL", copy: true, mono: true },
            ]}
          />
          <p className="text-muted-foreground mt-4 text-sm">
            Browse the{" "}
            <Link href="/colors/css" className={linkClass}>
              full CSS named color chart
            </Link>{" "}
            for more colors, or explore{" "}
            <Link href="/colors/family/blue" className={linkClass}>
              blue
            </Link>
            ,{" "}
            <Link href="/colors/family/green" className={linkClass}>
              green
            </Link>
            , and{" "}
            <Link href="/colors/family/red" className={linkClass}>
              red color families
            </Link>
            .
          </p>
        </section>

        <section
          aria-labelledby="hex-explained"
          className="text-muted-foreground mt-10 max-w-3xl space-y-4 text-sm leading-relaxed"
        >
          <h2 id="hex-explained" className="font-display text-foreground text-2xl font-semibold">
            How to read a HEX color code
          </h2>
          <p>
            A six-digit code uses the pattern <code>#RRGGBB</code>. Split #3B82F6 into 3B, 82, and
            F6: those pairs describe red, green, and blue. Hexadecimal uses the digits 0 to 9 and
            letters A to F; each pair represents a number from 0 to 255. This example converts to{" "}
            <code>rgb(59, 130, 246)</code>.
          </p>
          <p>
            <code>#000000</code> has no red, green, or blue light, so it is black.{" "}
            <code>#FFFFFF</code> has all three channels at their maximum, so it is white. Letter
            case does not change the color: #ff0000 and #FF0000 are both red.
          </p>
          <p>
            Three-digit shorthand doubles each digit: #F80 becomes #FF8800. Shorthand works only
            when each channel has matching digits. CSS also accepts #RGBA and #RRGGBBAA, with alpha
            at the end for transparency; our color detail URLs use the opaque six-digit RGB value.
            Read the{" "}
            <Link href="/learn/color-codes" className={linkClass}>
              guide to HEX, RGB, HSL, and alpha
            </Link>{" "}
            for the full notation reference.
          </p>
          <h2 className="font-display text-foreground pt-2 text-2xl font-semibold">
            Use color codes in HTML and CSS
          </h2>
          <p>
            Apply colors through CSS properties such as <code>color</code> for text,{" "}
            <code>background-color</code> for a surface, and <code>border-color</code> for an
            outline. For example:
          </p>
          <pre className="border-border bg-muted text-foreground overflow-x-auto rounded-xl border p-4 font-mono text-sm">
            <code>
              {
                ".notice {\n  color: #FFFFFF;\n  background-color: #1E40AF;\n  border: 1px solid #1E3A8A;\n}"
              }
            </code>
          </pre>
          <p>
            HEX and RGB represent the same channels in different ways; HSL is useful when adjusting
            hue, saturation, and lightness. Use{" "}
            <Link href="/hex-to-rgb" className={linkClass}>
              HEX to RGB
            </Link>
            ,{" "}
            <Link href="/rgb-to-hex" className={linkClass}>
              RGB to HEX
            </Link>
            , or{" "}
            <Link href="/hex-to-hsl" className={linkClass}>
              HEX to HSL
            </Link>{" "}
            to convert a value without guessing.
          </p>
          <p>
            A code identifies a color, but a readable interface also depends on its background.
            Check the actual foreground and background pair in the{" "}
            <Link href="/contrast-checker" className={linkClass}>
              contrast checker
            </Link>{" "}
            before using a swatch as text. Use labels or icons along with color to explain status.
          </p>
        </section>

        <section aria-labelledby="color-collections" className="mt-10">
          <h2 id="color-collections" className="font-display mb-4 text-2xl font-semibold">
            More color code references
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {COLOR_CODE_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={category.href}
                className="border-border/70 bg-card hover:border-primary/40 rounded-2xl border p-5 transition-colors"
              >
                <h3 className="font-display text-lg font-semibold">{category.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <AdReserve />
        <section aria-labelledby="color-code-faqs" className="max-w-3xl">
          <h2 id="color-code-faqs" className="font-display text-2xl font-semibold">
            Color code questions
          </h2>
          <dl className="mt-5 space-y-5">
            {COLOR_CODE_FAQS.map((faq) => (
              <div key={faq.question}>
                <dt className="font-semibold">{faq.question}</dt>
                <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">{faq.answer}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground mt-6 text-xs leading-relaxed">
            Reference sources:{" "}
            <a href="https://www.w3.org/TR/css-color-4/#hex-notation" className={linkClass}>
              W3C CSS hexadecimal notation
            </a>{" "}
            and{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/hex-color"
              className={linkClass}
            >
              MDN HEX color syntax
            </a>
            . Chart values use CSS named colors; RGB and HSL are calculated from the same sRGB
            value.
          </p>
        </section>
      </ColorCodePageShell>
    </>
  );
}
