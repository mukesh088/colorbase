import { describe, expect, it } from "vitest";
import { LEAGUES, getAllTeams, getIndexableTeams, namedTeamColors, teamPath } from "@/lib/data/teams";
import { isValidHex } from "@/lib/colors/convert";
import { allSitemapEntries } from "@/lib/sitemaps";
import { catalogRouteDecision } from "@/lib/catalog-routes";

describe("team color data", () => {
  it("cites a source for every team, with valid colors and unique paths", () => {
    const teams = getAllTeams();
    expect(teams.length).toBeGreaterThan(150);
    expect(new Set(teams.map(teamPath)).size).toBe(teams.length);
    for (const t of teams) {
      expect(LEAGUES.some((l) => l.id === t.league), t.slug).toBe(true);
      expect(t.source, t.slug).toMatch(/^https:\/\//);
      expect(t.colors.length, t.slug).toBeGreaterThan(0);
      for (const c of t.colors) expect(isValidHex(c.hex), `${t.slug} ${c.hex}`).toBe(true);
      expect(new Set(namedTeamColors(t).map((c) => c.name)).size, t.slug).toBe(t.colors.length);
    }
  });

  it("uses the official Lakers purple and gold", () => {
    const lakers = getAllTeams().find((t) => t.slug === "los-angeles-lakers");
    expect(lakers?.colors.map((c) => c.hex)).toContain("#FDB927");
  });

  it("keeps unverified teams out of the sitemap and 404s unknown ones", () => {
    const paths = new Set(allSitemapEntries().map((e) => new URL(e.url).pathname));
    for (const t of getAllTeams()) expect(paths.has(teamPath(t)), t.slug).toBe(t.verified);
    expect(paths.has("/teams")).toBe(getIndexableTeams().length > 0);
    expect(catalogRouteDecision("/teams/nba/los-angeles-lakers")).toBeNull();
    expect(catalogRouteDecision("/teams/nba/not-a-team")).toEqual({ status: 404 });
    expect(catalogRouteDecision("/teams/xyz")).toEqual({ status: 404 });
  });
});
