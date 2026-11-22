import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CollectionHero } from "@/components/library/collection-hero";
import { SwatchCardBrowser } from "@/components/library/swatch-card-browser";
import { LEAGUES, getLeague, getTeamsByLeague, teamPath } from "@/lib/data/teams";
import { createPageMetadata, fitDescription } from "@/lib/seo";
import { letterOf } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return LEAGUES.map((l) => ({ league: l.id }));
}

type Ctx = { params: Promise<{ league: string }> };

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { league } = await params;
  const l = getLeague(league);
  if (!l) notFound();
  const teams = getTeamsByLeague(l.id);
  return createPageMetadata({
    title: `${l.name} Team Colors – HEX, RGB & CMYK Codes`,
    description: fitDescription(
      `Team colors for all ${teams.length} ${l.name} teams, from ${teams[0].name} to ${teams[teams.length - 1].name}.`,
      "Copy HEX, RGB, CMYK and Pantone codes, palettes and CSS variables for each team.",
      "Copy HEX and RGB codes for each team."
    ),
    path: `/teams/${l.id}`,
    noIndex: !teams.some((t) => t.verified),
  });
}

export default async function LeaguePage({ params }: Ctx) {
  const { league } = await params;
  const l = getLeague(league);
  if (!l) notFound();
  const teams = getTeamsByLeague(l.id);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Team Colors", href: "/teams" },
    { name: l.name, href: `/teams/${l.id}` },
  ];
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Breadcrumbs items={crumbs} withJsonLd />
      <CollectionHero eyebrow={`${l.sport} · ${l.name}`} title={`${l.name} Team Colors`} stripe={teams.slice(0, 8).map((t) => t.colors[0].hex)}>
        Official colors for {teams.length} {l.name} teams with HEX, RGB and CMYK codes
        {teams.some((t) => t.colors.some((c) => c.pantone)) ? ", Pantone references" : ""} and ready palettes.
      </CollectionHero>
      <div className="mt-8">
        <SwatchCardBrowser
          placeholder={`Search ${l.name} teams or a HEX code`}
          items={teams.map((t) => ({ href: teamPath(t), title: t.name, colors: t.colors.map((c) => c.hex), letter: letterOf(t.name) }))}
        />
      </div>
      <p className="text-muted-foreground mt-10 text-sm">
        Other leagues:{" "}
        {LEAGUES.filter((x) => x.id !== l.id).map((x, i) => (
          <span key={x.id}>
            {i > 0 ? " · " : ""}
            <Link href={`/teams/${x.id}`} className="text-primary underline-offset-4 hover:underline">
              {x.name} team colors
            </Link>
          </span>
        ))}
      </p>
    </div>
  );
}
