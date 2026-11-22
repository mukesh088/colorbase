# CLAUDE.md — colorbase.in

## Project
ColorBase (https://colorbase.in) is a free color toolkit for designers and developers: color picker, image/website/video/PDF color extractors, palette generator & library, contrast checker, UI theme builder, gradient generators & library, color code libraries (Tailwind, Material, Bootstrap, Radix, CSS named, web-safe, Flat UI, Minecraft, Roblox), brand colors, HEX/RGB/HSL/HSV/CMYK converters, interior & house color tools, AI Color Copilot, blog and guides.

Canonical URL: `https://colorbase.in` (https, no www). Keep it in one constant (`SITE_URL`).

## Current mission
Make the site rank on Google (SEO), get quoted in answer boxes (AEO), and get cited by AI search (GEO: ChatGPT, Perplexity, Gemini, Google AI Overviews, Claude).
The full plan is in `docs/SEO_GEO_PLAN.md`. Progress is tracked in `docs/SEO_PROGRESS.md`.

## How to work (autonomous mode)
1. At the start of every session, read `docs/SEO_GEO_PLAN.md` and `docs/SEO_PROGRESS.md`, then continue from the first unchecked task.
2. Work through phases in order. Inside a phase, keep going without asking me unless one of the "Ask first" cases below applies.
3. After each phase:
   - run lint, type-check and the production build; fix every error you caused
   - commit on branch `seo/phase-N-<short-name>` with a clear message (`seo(phase-N): ...`)
   - update `docs/SEO_PROGRESS.md`: tick the tasks, list the files changed, and note anything I must do by hand
   - then move straight to the next phase
4. If the context gets long, write a short handoff note in `docs/SEO_PROGRESS.md` so the next session can resume.

## Ask first (stop and ask me) when:
- you'd add a new framework, change the rendering approach (e.g. SPA → SSR/SSG), or change hosting config
- you'd delete a page, tool or route, or change an existing URL (redirects are fine, removals are not)
- you'd add a paid service or a new third-party script
- data you need (paint shade codes, team/flag colors, brand colors) isn't in the repo and has no verifiable source

## Hard rules
- **Never invent color data.** Paint shade codes, brand colors, team colors, flag colors and similar must come from a source. Store each data file with a `source` field (URL or "measured from official asset") and `verified: true/false`. Unverified entries stay `noindex` and are listed in `docs/SEO_PROGRESS.md` for me to check.
- Don't publish Pantone libraries (licensed). RAL Classic approximations are fine with a "screen approximation" note.
- Don't break existing tools or change the visual design beyond headings, added content sections and new pages that reuse existing components.
- Every indexable page needs: a unique `<title>` (≤60 chars), a meta description (140–155 chars), a canonical, exactly one descriptive H1, and its main text in the server-rendered HTML (not JS-only).
- Content must be accurate, original and useful. No keyword stuffing, no filler, no near-duplicate pages. Programmatic pages must have computed or unique content, or they get `noindex`.
- All internal links are real `<a href>` elements with descriptive anchor text.
- No `meta keywords` tag.
- Reuse existing components, styles and patterns; keep new code typed and consistent with the codebase.

## Commands
Stack: Next.js 15 App Router (React 19, TypeScript, Tailwind 4), server components + SSG/ISR, `output: "standalone"` on Hostinger Node.js.
- dev: `npm run dev` (Turbopack; each page compiles on first visit, 10–50 s, so it feels slow). Fast local check: `npm run preview` (production build + `next start` on :3000; pages answer in < 0.3 s).
- build: `npm run build` (`next build` + Hostinger postbuild). Local prod server: `npx next start -p 3123`
- lint: `npm run lint` (`eslint .`) · type-check: `npx tsc --noEmit`
- tests: `npm test` (vitest). On Windows run from an upper-case drive path (`D:\projects\colorbase`); from `d:\…` every suite fails with "failed to find the current suite".
- SEO audit: `node scripts/seo-audit.mjs --base-url http://localhost:3123 --sitemap-sample 200 --out docs/seo-audit.md`
