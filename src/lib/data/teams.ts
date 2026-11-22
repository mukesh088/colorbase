import TEAMS_JSON from "@/lib/data/teams.json";
import { nameSwatches } from "@/lib/colors/describe";

export type TeamColor = { hex: string; pantone?: string; cmyk?: string };
export type TeamEntry = {
  slug: string;
  name: string;
  league: string;
  colors: TeamColor[];
  source: string;
  sourceNote: string;
  /** Set to true only after the owner has checked the values against the source. */
  verified: boolean;
};
export type League = { id: string; name: string; sport: string };

const DATA = TEAMS_JSON as { leagues: Record<string, { name: string; sport: string }>; teams: TeamEntry[] };

/** Display order: IPL first for the Indian audience, then the US leagues and the Premier League. */
const LEAGUE_ORDER = ["ipl", "nba", "nfl", "mlb", "nhl", "epl", "mls"];

export const LEAGUES: League[] = LEAGUE_ORDER.filter((id) => DATA.leagues[id]).map((id) => ({ id, ...DATA.leagues[id] }));

const TEAMS = DATA.teams.slice().sort((a, b) => a.name.localeCompare(b.name));

export function getLeague(id: string) {
  return LEAGUES.find((l) => l.id === id);
}

export function getAllTeams() {
  return TEAMS;
}

export function getTeamsByLeague(league: string) {
  return TEAMS.filter((t) => t.league === league);
}

export function getTeam(league: string, slug: string) {
  return TEAMS.find((t) => t.league === league && t.slug === slug);
}

export function getIndexableTeams() {
  return TEAMS.filter((t) => t.verified);
}

/** Team colors with generated swatch names ("Purple", "Gold", …). */
export function namedTeamColors(team: TeamEntry) {
  const names = nameSwatches(team.colors.map((c) => c.hex));
  return team.colors.map((c, i) => ({ ...c, name: names[i] }));
}

export function teamPath(team: Pick<TeamEntry, "league" | "slug">) {
  return `/teams/${team.league}/${team.slug}`;
}
