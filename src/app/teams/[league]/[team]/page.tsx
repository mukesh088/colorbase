import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ToolFaqs } from "@/components/layout/tool-faqs";
import { JsonLd } from "@/components/seo/json-ld";
import { CopyButton } from "@/components/color/copy-button";
import { ColorCodeCards, PaletteGuide, PaletteTrio, cssVariables } from "@/components/library/color-code-cards";
import { getAllTeams, getLeague, getTeam, getTeamsByLeague, namedTeamColors, teamLogo, teamPath } from "@/lib/data/teams";
import { breadcrumbJsonLd, createPageMetadata, faqJsonLd, fitDescription, fitTitle } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTeams().map((t) => ({ league: t.league, team: t.slug }));
}

type Ctx = { params: Promise<{ league: string; team: string }> };

function list(items: string[]) {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : items[0];
}

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { league, team } = await params;
  const t = getTeam(league, team);
  const l = getLeague(league);
  if (!t || !l) notFound();
  const colors = namedTeamColors(t);
  return createPageMetadata({
    title: fitTitle(`${t.name} Colors – HEX, RGB & CMYK Codes`, `${t.name} Colors – HEX Codes`, `${t.name} Colors`),
    description: fitDescription(
      `${t.name} team colors: ${colors.map((c) => `${c.name.toLowerCase()} ${c.hex}`).join(", ")}.`,
      `Copy HEX, RGB and CMYK codes${colors.some((c) => c.pantone) ? ", Pantone references" : ""}, palettes and CSS variables for this ${l.name} team.`,
      "Copy HEX, RGB and CMYK codes and palettes."
    ),
    path: teamPath(t),
    noIndex: !t.verified,
  });
}

export default async function TeamPage({ params }: Ctx) {
  const { league, team } = await params;
  const t = getTeam(league, team);
  const l = getLeague(league);
  if (!t || !l) notFound();
  const colors = namedTeamColors(t);
  const hexes = colors.map((c) => c.hex);
  const css = cssVariables(t.slug.replace(/-/g, ""), colors);
  const path = teamPath(t);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Team Colors", href: "/teams" },
    { name: l.name, href: `/teams/${l.id}` },
    { name: t.name, href: path },
  ];
  const faqs = [
    {
      question: `What are the ${t.name} colors?`,
      answer: `The ${t.name} use ${list(colors.map((c) => `${c.name.toLowerCase()} (${c.hex})`))}.`,
    },
    {
      question: `What is the ${t.name} HEX code?`,
      answer: `The primary ${t.name} color is ${hexes[0]}${hexes.length > 1 ? `, with ${list(hexes.slice(1))} as secondary colors` : ""}.`,
    },
    {
      question: `Where do these ${t.name} colors come from?`,
      answer: `${t.sourceNote} Screen colors are approximations of printed and fabric colors.`,
    },
  ];
  const others = getTeamsByLeague(l.id).filter((x) => x.slug !== t.slug);
  const logo = teamLogo(t);

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={[breadcrumbJsonLd(crumbs), faqJsonLd(faqs)]} />
      <Breadcrumbs items={crumbs} />

      <header className="border-border/60 bg-card mt-2 grid gap-6 overflow-hidden rounded-3xl border p-5 sm:p-8 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div className="overflow-hidden rounded-2xl border border-border/60">
          {logo ? (
            <div className="flex aspect-[3/2] items-center justify-center bg-white p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={`${t.name} logo`} width={256} height={256} className="h-full max-h-56 w-auto object-contain" />
            </div>
          ) : (
            <div className="flex aspect-[3/2]" aria-hidden>
              {colors.map((c, i) => (
                <span key={c.hex + i} style={{ background: c.hex, flex: i === 0 ? 2 : 1 }} />
              ))}
            </div>
          )}
          <div className="flex h-4" aria-hidden>
            {colors.map((c, i) => (
              <span key={c.hex + i} className="flex-1" style={{ background: c.hex }} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-rose-600 uppercase dark:text-rose-400">
            {l.sport} · {l.name}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{t.name} Colors</h1>
          <p className="mt-4 text-base leading-relaxed">
            The {t.name} team colors are {list(colors.map((c) => `${c.name.toLowerCase()} ${c.hex}`))}.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <CopyButton value={hexes.join(", ")} label="Copy all HEX" />
            <CopyButton value={css} label="Copy CSS variables" />
          </div>
          {!t.verified && (
            <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
              Taken from the cited source and not yet checked by ColorBase against the team&apos;s current brand guide.
            </p>
          )}
        </div>
      </header>

      <section className="mt-10" aria-labelledby="team-codes">
        <h2 id="team-codes" className="font-display text-2xl font-semibold tracking-tight">
          {t.name} color codes
        </h2>
        <ColorCodeCards colors={colors} />
      </section>

      <section className="mt-12" aria-labelledby="team-palettes">
        <h2 id="team-palettes" className="font-display text-2xl font-semibold tracking-tight">
          {t.name} color palettes
        </h2>
        <PaletteTrio label={t.name} hexes={hexes} />
      </section>

      <section className="mt-12" aria-labelledby="team-palette-guide">
        <h2 id="team-palette-guide" className="font-display text-2xl font-semibold tracking-tight">
          How to use the {t.name} palette
        </h2>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
          Each color&apos;s role, where it works best, and which text color stays readable on it (WCAG AA needs 4.5:1 for
          body text, 3:1 for large text).
        </p>
        <PaletteGuide colors={colors} />
      </section>

      <section className="mt-12" aria-labelledby="team-css">
        <h2 id="team-css" className="font-display text-2xl font-semibold tracking-tight">
          CSS variables
        </h2>
        <pre className="bg-muted/50 mt-3 overflow-x-auto rounded-xl p-4 text-xs">
          <code>{css}</code>
        </pre>
      </section>

      <ToolFaqs faqs={faqs} className="mt-12" />

      <section className="mt-12" aria-labelledby="league-teams">
        <h2 id="league-teams" className="font-display text-2xl font-semibold tracking-tight">
          Other {l.name} team colors
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={teamPath(o)} className="border-border/60 bg-card hover:border-primary/50 flex items-center gap-3 rounded-xl border p-2.5">
                {teamLogo(o) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamLogo(o)} alt="" width={32} height={32} loading="lazy" className="h-8 w-8 shrink-0 object-contain" />
                ) : (
                  <span className="flex h-7 w-10 shrink-0 overflow-hidden rounded" aria-hidden>
                    {o.colors.map((c, i) => (
                      <span key={c.hex + i} className="flex-1" style={{ background: c.hex }} />
                    ))}
                  </span>
                )}
                <span className="truncate text-sm">{o.name} colors</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-muted-foreground mt-10 text-xs">
        Source:{" "}
        <a href={t.source} className="underline underline-offset-4" rel="noreferrer">
          {t.source}
        </a>
        . {t.sourceNote} Team names, logos and colors are trademarks of their owners and are shown for identification only. See all{" "}
        <Link href="/teams" className="underline underline-offset-4">
          team colors
        </Link>
        .
      </p>
    </div>
  );
}
