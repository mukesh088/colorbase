#!/usr/bin/env node
/**
 * Converts team logo SVGs (from github.com/jimniels/teamcolors/public/img)
 * into 256px WebP files under public/team-logos/<league>/<slug>.webp and
 * removes the source SVGs. Logos are trademarks of their teams, shown for
 * identification only.
 *
 * Usage: node scripts/build-team-logos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public/team-logos");
const { teams } = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/lib/data/teams.json"), "utf8"));
const wanted = new Set(teams.map((t) => `${t.league}/${t.slug}`));
let written = 0;
for (const league of fs.readdirSync(root)) {
  for (const file of fs.readdirSync(path.join(root, league))) {
    if (!file.endsWith(".svg")) continue;
    const slug = file.replace(/\.svg$/, "");
    const src = path.join(root, league, file);
    if (wanted.has(`${league}/${slug}`)) {
      await sharp(fs.readFileSync(src), { density: 300 })
        .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 88 })
        .toFile(path.join(root, league, `${slug}.webp`));
      written++;
    }
    fs.unlinkSync(src);
  }
}
console.log(`${written} logos written`);
