import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CollectionHero } from "@/components/library/collection-hero";
import { SwatchCardBrowser } from "@/components/library/swatch-card-browser";
import { LEAGUES, getAllTeams, getIndexableTeams, getTeamsByLeague, teamPath } from "@/lib/data/teams";
import { createPageMetadata } from "@/lib/seo";
import { letterOf } from "@/lib/utils";

export const metadata: Metadata = createPageMetadata({
  title: "Team Colors – HEX Codes for IPL, NBA, NFL & More",
  description: "Team color codes.",
  path: "/teams",
  noIndex: getIndexableTeams().length === 0,
});

export default function TeamsHub() {
  const teams = getAllTeams();
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Team Colors", href: "/teams" },
  ];
  const leagueName = Object.fromEntries(LEAGUES.map((l) => [l.id, l.name]));
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <Breadcrumbs items={crumbs} withJsonLd />
      <CollectionHero
        eyebrow="Team colors"
        title="Sports Team Colors"
        stripe={["#0044AA", "#D1AB3E", "#552583", "#FDB927", "#CE1141", "#DA020E", "#000000"]}
      >
        HEX, RGB, CMYK and Pantone codes for {teams.length} teams across {LEAGUES.map((l) => l.name).join(", ")}, each with
        ready palettes and CSS variables. Pick a league or search by team name or HEX code.
      </CollectionHero>
      <ul className="mt-6 flex flex-wrap gap-3">
        {LEAGUES.map((l) => (
          <li key={l.id}>
            <Link href={`/teams/${l.id}`} className="border-border/60 bg-card hover:border-primary/50 block rounded-xl border px-4 py-2.5 text-sm">
              <span className="font-medium">{l.name} team colors</span>
              <span className="text-muted-foreground ml-2 text-xs">{getTeamsByLeague(l.id).length} teams</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <SwatchCardBrowser
          placeholder="Search a team or HEX (e.g. #552583)"
          groups={LEAGUES.map((l) => ({ id: l.id, label: l.name }))}
          items={teams.map((t) => ({
            href: teamPath(t),
            title: t.name,
            meta: leagueName[t.league],
            colors: t.colors.map((c) => c.hex),
            group: t.league,
            letter: letterOf(t.name),
          }))}
        />
      </div>
    </div>
  );
}
