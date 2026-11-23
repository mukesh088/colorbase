import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPageMetadata, breadcrumbJsonLd, faqJsonLd, fitDescription } from "@/lib/seo";
import { ToolFaqs } from "@/components/layout/tool-faqs";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getGradient, getGradientsByCategory } from "@/lib/data/gradient-library";
import Link from "next/link";
import { describeHex } from "@/lib/colors/describe";
import { getContrastRatio } from "@/lib/colors/convert";
import { CopyButton } from "@/components/color/copy-button";
import { ShareButtons } from "@/components/library/share-buttons";
import { GradientJpgButton } from "@/components/library/gradient-jpg-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGradient(slug);
  if (!g) notFound();
  return createPageMetadata({
    title: `${g.name} Gradient`,
    description: fitDescription(
      `${g.name} is ${/^[aeiou]/.test(g.category) ? "an" : "a"} ${g.category} CSS gradient at ${g.angle}°, from ${g.colors[0].toUpperCase()} to ${g.colors[g.colors.length - 1].toUpperCase()}.`,
      "Copy the CSS, Tailwind or SCSS code, download it as a JPG or share the link.",
      "Copy the CSS, Tailwind or SCSS code in one click.",
      "Preview it full size."
    ),
    path: `/gradient-library/${g.slug}`,
    noIndex: Boolean(g.generated),
    ogImage: `/gradient-library/${g.slug}/opengraph-image`,
    keywords: [g.name, `${g.category} gradient`, "css linear-gradient"],
  });
}

export default async function GradientDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = getGradient(slug);
  if (!g) notFound();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Gradient Library", href: "/gradient-library" },
    { name: g.name, href: `/gradient-library/${g.slug}` },
  ];
  const cssBlock = `background: ${g.css};`;
  const kind = g.css.startsWith("radial")
    ? "radial"
    : g.css.startsWith("conic")
      ? "conic"
      : "linear";
  const stops = g.colors.map((hex) => ({
    hex: hex.toUpperCase(),
    phrase: describeHex(hex).phrase,
  }));
  const minContrast = (text: string) =>
    Math.round(Math.min(...g.colors.map((c) => getContrastRatio(text, c))) * 100) / 100;
  const white = minContrast("#ffffff");
  const black = minContrast("#000000");
  const bestText =
    white >= black ? { name: "White", ratio: white } : { name: "Black", ratio: black };
  const faqs = [
    {
      question: `What is the CSS code for the ${g.name} gradient?`,
      answer: `Use background: ${g.css}; on any element. The same gradient is available as a Tailwind class string (${g.tailwind}) and as an SCSS variable in the export panel.`,
    },
    {
      question: `What colors are in the ${g.name} gradient?`,
      answer: `${g.name} uses ${stops.length} color stops: ${stops.map((s) => `${s.hex} (${s.phrase})`).join(", ")}.`,
    },
    {
      question: `Can I put text on the ${g.name} gradient?`,
      answer:
        bestText.ratio >= 4.5
          ? `Yes. ${bestText.name} text keeps at least ${bestText.ratio}:1 contrast against every stop, which passes WCAG AA for body text.`
          : bestText.ratio >= 3
            ? `For large headings, yes: ${bestText.name.toLowerCase()} text keeps at least ${bestText.ratio}:1, which meets AA for large text. For body text, add a dark or light overlay first.`
            : `Not without help. The best text color, ${bestText.name.toLowerCase()}, drops to ${bestText.ratio}:1 on part of the gradient. Add an overlay or place text on a solid panel.`,
    },
  ];
  const related = getGradientsByCategory(g.category)
    .filter((x) => x.slug !== g.slug)
    .slice(0, 8);
  const file = `/* ${g.name} */\n.gradient {\n  ${cssBlock}\n}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-rose-600 uppercase">
            {g.category}
          </p>
          <h1 className="font-display text-4xl font-semibold">{g.name}</h1>
        </div>
        <ShareButtons title={g.name} path={`/gradient-library/${g.slug}`} />
      </div>
      <div
        className="border-border/50 h-40 w-full rounded-none border sm:h-48 sm:rounded-3xl"
        style={{ background: g.css }}
        role="img"
        aria-label={`${g.name} preview`}
      />
      <div className="mt-6 flex flex-wrap gap-2">
        <GradientJpgButton gradient={g} />
        <a
          className="border-input hover:bg-accent inline-flex h-10 items-center rounded-lg border px-4 text-sm"
          href={`data:text/css;charset=utf-8,${encodeURIComponent(file)}`}
          download={`${g.slug}.css`}
        >
          Download CSS
        </a>
      </div>
      <section className="mt-8" aria-labelledby="about-gradient">
        <h2 id="about-gradient" className="font-display text-xl font-semibold tracking-tight">
          About the {g.name} gradient
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          {g.name} is {/^[aeiou]/.test(g.category) ? "an" : "a"} {g.category} {kind} CSS gradient
          {kind === "linear" ? ` at ${g.angle}°` : ""} that blends {stops.length} colors, from{" "}
          {stops[0].hex} ({stops[0].phrase}) to {stops[stops.length - 1].hex} (
          {stops[stops.length - 1].phrase}).
        </p>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
          {bestText.name} text is the safer choice on it: its lowest contrast against any stop is{" "}
          {bestText.ratio}:1, which{" "}
          {bestText.ratio >= 4.5
            ? "passes WCAG AA for body text everywhere on the gradient"
            : bestText.ratio >= 3
              ? "passes AA for large headings but not for body text"
              : "is below AA, so add an overlay before placing text on it"}
          .
        </p>
        <h3 className="font-display mt-5 text-base font-semibold">Color stops</h3>
        <ul className="mt-2 flex flex-wrap gap-3 text-sm">
          {stops.map((stop, i) => (
            <li key={`${stop.hex}-${i}`} className="flex items-center gap-2">
              <span
                aria-hidden
                className="border-border h-6 w-6 rounded-md border"
                style={{ background: stop.hex }}
              />
              <Link
                href={`/color/${stop.hex.slice(1).toLowerCase()}`}
                className="text-primary font-mono underline-offset-4 hover:underline"
              >
                {stop.hex}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <h2 className="font-display mt-8 text-xl font-semibold tracking-tight">Export code</h2>
      <div className="mt-4 grid gap-4">
        {[
          ["CSS", cssBlock],
          ["Tailwind", g.tailwind],
          ["SCSS", g.scss],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold">{label}</CardTitle>
              <CopyButton value={value} label={label} />
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/50 overflow-x-auto rounded-xl p-3 text-xs">{value}</pre>
            </CardContent>
          </Card>
        ))}
      </div>
      <ToolFaqs faqs={faqs} className="mt-10" />
      {related.length > 0 && (
        <section className="mt-10" aria-labelledby="related-gradients">
          <h2 id="related-gradients" className="font-display text-xl font-semibold tracking-tight">
            More {g.category} gradients
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/gradient-library/${r.slug}`} className="group block">
                  <span
                    aria-hidden
                    className="border-border/50 block h-16 rounded-xl border"
                    style={{ background: r.css }}
                  />
                  <span className="mt-1.5 block text-sm font-medium group-hover:underline">
                    {r.name} gradient
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link
              href={`/gradient-library/category/${g.category}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              Browse all {g.category} gradients
            </Link>{" "}
            or build your own in the{" "}
            <Link
              href="/gradient-generator"
              className="text-primary underline-offset-4 hover:underline"
            >
              CSS gradient generator
            </Link>
            .
          </p>
        </section>
      )}
    </div>
  );
}
