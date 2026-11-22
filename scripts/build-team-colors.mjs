#!/usr/bin/env node
/**
 * Builds src/lib/data/teams.json from cited sources. Every entry is added with
 * `verified: false`; an owner check flips it (pages stay noindex until then).
 *
 * Sources
 *  - NBA, NFL, MLB, NHL, MLS, Premier League: the open teamcolors dataset by
 *    Jim Nielsen (https://github.com/jimniels/teamcolors), compiled from league
 *    and club brand sheets. NBA values are RGB conversions of the official sheet.
 *  - IPL: HEX values from each team's Wikipedia infobox, or measured from the
 *    team's colours SVG on Wikimedia Commons.
 *
 * Usage: node scripts/build-team-colors.mjs path/to/teamcolors/src/teams.json
 *   (https://raw.githubusercontent.com/jimniels/teamcolors/master/src/teams.json)
 */
import fs from "node:fs";
import path from "node:path";

const LEAGUES = {
  nba: { name: "NBA", sport: "Basketball" },
  nfl: { name: "NFL", sport: "American football" },
  mlb: { name: "MLB", sport: "Baseball" },
  nhl: { name: "NHL", sport: "Ice hockey" },
  mls: { name: "MLS", sport: "Soccer" },
  epl: { name: "Premier League", sport: "Football" },
  ipl: { name: "IPL", sport: "Cricket" },
};

const TEAMCOLORS_SOURCE = "https://github.com/jimniels/teamcolors";

/** IPL teams with a citable HEX source today. */
const IPL = [
  { name: "Chennai Super Kings", colors: ["#FFFF00"], source: "https://en.wikipedia.org/wiki/Chennai_Super_Kings", note: "HEX from the team infobox on Wikipedia." },
  { name: "Mumbai Indians", colors: ["#0044AA", "#D1AB3E"], source: "https://en.wikipedia.org/wiki/Mumbai_Indians", note: "HEX from the team infobox on Wikipedia." },
  { name: "Royal Challengers Bengaluru", colors: ["#FF0000", "#0C0C38"], source: "https://en.wikipedia.org/wiki/Royal_Challengers_Bengaluru", note: "HEX from the team infobox on Wikipedia (red and black)." },
  { name: "Kolkata Knight Riders", colors: ["#46155B", "#FFD700"], source: "https://commons.wikimedia.org/wiki/File:Kolkata_Knight_Riders_colours.svg", note: "Measured from the team colours SVG on Wikimedia Commons (purple and gold)." },
];

const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const rgbToHex = (rgb) => "#" + rgb.trim().split(/\s+/).map((n) => Number(n).toString(16).padStart(2, "0")).join("").toUpperCase();
const normHex = (h) => `#${h.replace(/^#/, "").slice(0, 6).toUpperCase()}`;

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/build-team-colors.mjs <teams.json>");
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(input, "utf8"));

const teams = [];
for (const t of raw) {
  const league = LEAGUES[t.league];
  if (!league) continue;
  const hexes = t.colors.hex?.length ? t.colors.hex.map(normHex) : (t.colors.rgb ?? []).map(rgbToHex);
  if (!hexes.length) continue;
  teams.push({
    slug: slugify(t.name),
    name: t.name,
    league: t.league,
    colors: hexes.map((hex, i) => ({
      hex,
      ...(t.colors.pms?.[i] ? { pantone: t.colors.pms[i] } : {}),
      ...(t.colors.cmyk?.[i] ? { cmyk: t.colors.cmyk[i].split(/\s+/).join(", ") } : {}),
    })),
    source: TEAMCOLORS_SOURCE,
    sourceNote:
      t.league === "nba"
        ? "Official NBA RGB/CMYK/Pantone values (2014–15 logo sheet) as compiled by the teamcolors project; HEX converted from RGB."
        : `Club colors from the ${league.name} brand sheets as compiled by the teamcolors project.`,
    verified: false,
  });
}
for (const t of IPL) {
  teams.push({ slug: slugify(t.name), name: t.name, league: "ipl", colors: t.colors.map((hex) => ({ hex })), source: t.source, sourceNote: t.note, verified: false });
}

const seen = new Set();
for (const t of teams) {
  if (seen.has(t.slug)) t.slug = `${t.slug}-${t.league}`;
  seen.add(t.slug);
}
const out = path.join(process.cwd(), "src/lib/data/teams.json");
fs.writeFileSync(out, JSON.stringify({ leagues: LEAGUES, teams }, null, 2) + "\n");
console.log(`${teams.length} teams written`, Object.fromEntries(Object.keys(LEAGUES).map((l) => [l, teams.filter((t) => t.league === l).length])));
