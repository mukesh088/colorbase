import { SITE_CONTENT_UPDATED } from "@/lib/site-config";
import contentDates from "@/lib/data/content-dates.json";

type ContentDates = { sections: Record<string, string | undefined>; routes: Record<string, string | undefined> };
const DATES = contentDates as ContentDates;

export function isoToDate(iso: string | undefined) {
  return new Date(`${iso ?? SITE_CONTENT_UPDATED}T00:00:00.000Z`);
}

export function latestIso(...isos: (string | undefined)[]) {
  return isos.filter(Boolean).sort().at(-1);
}

/** Last commit touching a section's data files (see scripts/generate-content-dates.mjs). */
export function sectionLastModified(section: string) {
  return isoToDate(DATES.sections[section]);
}

/** Last change to a static route: its own files or the shared section content it renders. */
export function routeLastModified(path: string, section?: string) {
  return isoToDate(latestIso(DATES.routes[path], section ? DATES.sections[section] : undefined));
}
