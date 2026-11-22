import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolFaqs } from "@/components/layout/tool-faqs";
import { JsonLd } from "@/components/seo/json-ld";
import { hexToRgb, rgbToCmyk } from "@/lib/colors/convert";
import { getAllFlags, getFlag } from "@/lib/data/flags";
import { breadcrumbJsonLd, createPageMetadata, faqJsonLd, fitDescription, fitTitle } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllFlags().map((f) => ({ country: f.slug }));
}

type Ctx = { params: Promise<{ country: string }> };

function list(items: string[]) {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : items[0];
}

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { country } = await params;
  const flag = getFlag(country);
  if (!flag) notFound();
  return createPageMetadata({
    title: fitTitle(`${flag.country} Flag Colors – HEX, RGB & CMYK Codes`, `${flag.country} Flag Colors – HEX Codes`, `${flag.country} Flag Colors`),
    description: fitDescription(
      `${flag.country} flag colors: ${flag.colors.map((c) => `${c.name} ${c.hex}`).join(", ")}.`,
      "Copy HEX, RGB and CMYK values, a CSS snippet and a matching palette, with the source of each value.",
      "Copy HEX, RGB and CMYK values with their source."
    ),
    path: `/flags/${flag.slug}`,
    noIndex: !flag.verified,
  });
}

export default async function FlagPage({ params }: Ctx) {
  const { country } = await params;
  const flag = getFlag(country);
  if (!flag) notFound();
  const path = `/flags/${flag.slug}`;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Flag Colors", href: "/flags" },
    { name: flag.country, href: path },
  ];
  const rows = flag.colors.map((c) => {
    const rgb = hexToRgb(c.hex);
    const cmyk = rgbToCmyk(rgb);
    return { ...c, rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`, cmyk: `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}` };
  });
  const token = flag.slug.replace(/-/g, "");
  const css = [
    ":root {",
    ...flag.colors.map((c) => `  --${token}-${c.name.toLowerCase().replace(/\(.*\)/, "").trim().replace(/[^a-z0-9]+/g, "-")}: ${c.hex.toLowerCase()};`),
    "}",
  ].join("\n");
  const faqs = [
    {
      question: `What are the colors of the ${flag.country} flag?`,
      answer: `The ${flag.country} flag uses ${list(flag.colors.map((c) => `${c.name.toLowerCase()} (${c.hex})`))}.`,
    },
    {
      question: `Are these the official ${flag.country} flag HEX codes?`,
      answer: `${flag.sourceNote} Screen colors are approximations of the printed or dyed flag.`,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{flag.country} Flag Colors</h1>
      <p className="mt-4 max-w-3xl text-base leading-relaxed">
        The {flag.country} flag uses {flag.colors.length} colors:{" "}
        {list(flag.colors.map((c) => `${c.name.toLowerCase()} ${c.hex}`))}.
      </p>
      {!flag.verified && (
        <p className="mt-3 max-w-3xl rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          These values are taken from the cited source and have not yet been checked by ColorBase.
        </p>
      )}
      <div className="mt-6 flex h-20 max-w-xl overflow-hidden rounded-xl border border-border" aria-hidden>
        {flag.colors.map((c) => (
          <span key={c.hex + c.name} className="flex-1" style={{ background: c.hex }} />
        ))}
      </div>

      <section className="mt-8" aria-labelledby="flag-codes">
        <h2 id="flag-codes" className="font-display text-xl font-semibold tracking-tight">
          {flag.country} flag color codes
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4">Color</th>
                <th scope="col" className="py-2 pr-4">HEX</th>
                <th scope="col" className="py-2 pr-4">RGB</th>
                <th scope="col" className="py-2 pr-4">CMYK (approx.)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.hex + r.name} className="border-b border-border/50">
                  <td className="py-2 pr-4">
                    {r.name}
                    {r.note && <span className="text-muted-foreground block text-xs">{r.note}</span>}
                  </td>
                  <td className="py-2 pr-4 font-mono">
                    <Link href={`/color/${r.hex.slice(1).toLowerCase()}`} className="text-primary underline-offset-4 hover:underline">
                      {r.hex}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 font-mono">{r.rgb}</td>
                  <td className="py-2 pr-4 font-mono">{r.cmyk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {flag.alternatives && flag.alternatives.length > 0 && (
          <>
            <h3 className="font-display mt-6 text-base font-semibold">Other published values</h3>
            <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
              {flag.alternatives.map((a) => (
                <li key={a.label}>
                  {a.label}: <span className="font-mono">{a.colors.join(", ")}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="mt-8" aria-labelledby="flag-css">
        <h2 id="flag-css" className="font-display text-xl font-semibold tracking-tight">
          CSS variables
        </h2>
        <pre className="bg-muted/50 mt-3 overflow-x-auto rounded-lg p-3 text-xs">
          <code>{css}</code>
        </pre>
        <p className="text-muted-foreground mt-2 text-sm">
          Build a matching palette from these colors in the{" "}
          <Link href="/palette-generator" className="text-primary underline-offset-4 hover:underline">
            palette generator
          </Link>{" "}
          or check text contrast in the{" "}
          <Link href="/contrast-checker" className="text-primary underline-offset-4 hover:underline">
            contrast checker
          </Link>
          .
        </p>
      </section>

      <ToolFaqs faqs={faqs} className="mt-8" />
      <p className="text-muted-foreground mt-8 text-xs">
        Source:{" "}
        <a href={flag.source} className="underline underline-offset-4" rel="noreferrer">
          {flag.source}
        </a>
        . {flag.sourceNote} See all{" "}
        <Link href="/flags" className="underline underline-offset-4">
          flag colors
        </Link>
        .
      </p>
    </div>
  );
}
