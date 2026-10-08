import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createPageMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ColorCodePageShell, RelatedCodeLinks, AdReserve } from "@/components/color-codes/page-shell";
import { ColorDetailView } from "@/components/library/color-detail-view";
import { CopyButton } from "@/components/color/copy-button";
import { getRobloxById, robloxAnalysis, uniqueRobloxColors } from "@/lib/data/color-codes/roblox";
import { maybeStaticParams } from "@/lib/static-params";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return maybeStaticParams(uniqueRobloxColors().map((c) => ({ id: String(c.id) })));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const color = getRobloxById(Number(id));
  if (!color) return {};
  return createPageMetadata({
    title: `${color.name} — BrickColor ${color.id}`,
    description: `Roblox BrickColor ${color.id} (${color.name}) with official RGB (${color.r}, ${color.g}, ${color.b}) and calculated HEX, HSL, and OKLCH.`,
    path: `/color-codes/roblox/${color.id}`,
    keywords: [color.name, `brickcolor ${color.id}`, "roblox color"],
  });
}

export default async function RobloxBrickColorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const color = getRobloxById(Number(id));
  if (!color) notFound();
  const a = robloxAnalysis(color);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Color Codes", href: "/color-codes" },
    { name: "Roblox", href: "/color-codes/roblox" },
    { name: `${color.name} (${color.id})`, href: `/color-codes/roblox/${color.id}` },
  ];
  const faqs = [
    {
      question: `Is ${color.name} an official BrickColor?`,
      answer: `BrickColor ID ${color.id} uses RGB ${color.r}, ${color.g}, ${color.b} from the public BrickColor table. HEX ${a.hex.toUpperCase()} is a calculated sRGB encoding of that RGB.`,
    },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <ColorCodePageShell
        crumbs={crumbs}
        eyebrow={`BrickColor ${color.id}`}
        title={color.name}
        description={`Official RGB ${color.r}, ${color.g}, ${color.b}. HEX, HSL, and OKLCH below are calculated conversions.`}
        aside={
          <RelatedCodeLinks
            items={[
              { href: `/color/${a.hex.slice(1)}`, label: "Open HEX page" },
              { href: "/color-codes/roblox", label: "All BrickColors" },
              { href: `/tools/shades-tints-tones?hex=${a.hex.slice(1)}`, label: "Shades & tints" },
            ]}
          />
        }
      >
        <div className="mb-6 flex flex-wrap gap-2">
          <CopyButton value={String(color.id)} label="Copy ID" />
          <CopyButton value={`rgb(${color.r}, ${color.g}, ${color.b})`} label="Copy RGB" />
          <CopyButton value={a.hex.toUpperCase()} label="Copy HEX" />
          <Link
            href={`/color/${a.hex.slice(1)}`}
            className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
          >
            Open color page
          </Link>
        </div>
        <ColorDetailView name={`${color.name} (BrickColor ${color.id})`} hex={a.hex} sharePath={`/color-codes/roblox/${color.id}`} />
        <AdReserve />
      </ColorCodePageShell>
    </>
  );
}
