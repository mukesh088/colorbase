# Fix Hostinger “package.json / structure / logs = null”

That diagnosis means Hostinger **never found your app root**. The GitHub repo is fine.

## Confirmed on GitHub (`main`)

- https://github.com/mukesh088/colorbase/blob/main/package.json
- https://github.com/mukesh088/colorbase/blob/main/next.config.js
- `src/app/`, `public/`, `package-lock.json` all present

## Do this in hPanel (required)

### A) Use the Node.js Git flow (not generic Git)

1. **Websites → Add Website → Node.js web app** (not “Git” static deploy)
2. **Import Git repository** → connect GitHub App → allow `mukesh088/colorbase`
3. Select repo **mukesh088/colorbase**, branch **main**

### B) If `colorbase.in` already exists as a normal website

Remove / disconnect that website first. Hostinger’s Node.js flow needs a **fresh** web-app slot for the domain.

### C) Deploy settings (copy exactly)

| Field | Value |
| --- | --- |
| Framework | **Next.js** (`next`) |
| Root directory | **leave empty** |
| Node.js | **20** |
| Build script | `build` |
| Output directory | `.next` |
| Entry file | **leave empty** (use `next start`) |

Env:

```
NEXT_PUBLIC_SITE_URL=https://colorbase.in
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-H9NJB2152F
NEXT_PUBLIC_SUPPORT_PHONE=+91-651-310-2200
NODE_ENV=production
DATABASE_URL=
USER_COOKIE_SECRET=
CRON_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### D) Allow AI / search agents through CDN (required for agent audits)

**What the CDN logs mean (2026-10-31):**

| Signal | Meaning |
| --- | --- |
| `429` + `ClaudeBot` + IP `216.73.217.169` (US) + ~0.4ms + 0 bytes | Hostinger CDN (`hcdn`) rate-limits Anthropic’s crawler **before** Next.js. Not an app bug. |
| Occasional single ClaudeBot/GPTBot request returning `200` | UA may be allowed, but **burst crawl of `/color/*` still trips 429**. |
| `403` from random Chrome UAs (e.g. Cambodia / US VPS) | Separate bot/scraper filter — usually fine to leave. |

There is **no Hostinger API** to allowlist bot UAs or raise ClaudeBot rate limits — use hPanel or support.

#### hPanel checklist

1. Websites → **colorbase.in** → **Performance** → **CDN** → **Manage** → **Security**
2. Security level **Medium** or **Low**; **I’m under attack = Off**
3. **Country blocking:** use **Block specific countries** with an **empty** list (do **not** use “Allow only specific countries” empty — that blocks the world)
4. Do **not** country-block **United States** (ClaudeBot / GPTBot egress there)
5. **IP allowlist** (if available): allow `216.73.217.169` or Anthropic’s published crawler ranges
6. **Bot / crawler allowlist** (if available):  
   `ClaudeBot`, `Claude-User`, `anthropic-ai`, `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `PerplexityBot`, `Googlebot`, `Google-Extended`, `Bingbot`
7. If a “Bot fight / rate limit / challenge” toggle exists for known good bots, set it to **Allow** / **Off** for AI crawlers
8. Save → purge CDN cache

#### Hostinger support ticket (paste if 429 continues in CDN logs)

> Domain: colorbase.in  
> CDN edge (`hcdn`) returns HTTP 429 for ClaudeBot during catalog crawls.  
> Example: 2026-10-31 16:09:04 UTC — GET /color/4d8f84 — UA ClaudeBot/1.0 — IP 216.73.217.169 (US) — response 0 bytes / ~0.4ms.  
> Please allowlist ClaudeBot / Anthropic crawler IPs and disable rate-limit challenges for that UA on colorbase.in.  
> We only need search/AI retrieval; model training is already refused via robots.txt Content-Signal `ai-train=no`.

**Do not turn CDN off** unless testing; turn it back on after the allowlist works.

Agent discovery files after deploy:

- `https://colorbase.in/llms.txt`
- `https://colorbase.in/.well-known/mcp/server-card.json`
- `https://colorbase.in/robots.txt` (includes `Content-Signal`)
- `Accept: text/markdown` on `/` returns Markdown

`DATABASE_URL` is a Neon or Supabase **pooled** connection string. Leave it empty if you have not created a database yet — the site still runs with browser localStorage only.

Do **not** set `PREBUILD_LIBRARY_PAGES=1` on Hostinger (that prebuilds 7k+ pages and burns inodes).

See [docs/HOSTINGER-RESOURCES.md](docs/HOSTINGER-RESOURCES.md) for inode vs Postgres, size caps, and the cleanup cron.

4. Click **Deploy**
5. Open **Deployments** → open the new build → you should now see real build logs (not null)

## Do NOT

- Upload a ZIP of `Desktop/colorbase` (can include a nested clone)
- Set Root directory to `/`, `src`, or `colorbase`
- Use Hostinger Connector against a nested/wrong folder

## Files & directories (inodes) limit

If hPanel warns that **inodes are running out**:

1. **Delete old / unused websites and Node apps** in hPanel (each failed deploy can leave a full `node_modules` + `.next`).
2. **Remove leftover folders** via File Manager / SSH under `domains/` or `nodejs/` that are not the live app (old clones, `node_modules` copies, `.next` from failed builds).
3. **Clear Hostinger caches** for the site, then **Redeploy once** from Git (do not keep stacking deploys without cleanup).
4. Prefer **one** Node.js app for `colorbase.in` — not ZIP + Git + Connector side by side.
5. This repo is tuned for low inodes: `output: "standalone"`, `images.unoptimized`, catalog routes are `force-dynamic` (no per-URL HTML on disk), `isrFlushToDisk: false`, and `postbuild` deletes `.next/cache` plus source maps. Do not upload a nested `colorbase/` copy or Search Console extract folders.

### What happens if inodes run out?

New files cannot be created → builds fail, app may crash, cron/tasks stop, sometimes odd “missing file” errors. Fix by freeing inodes (delete unused trees), then redeploy.

## After a green build

Restart the Node process, purge CDN cache, hard-refresh the site.

## Google Analytics

The site sends GA4 events to `G-H9NJB2152F` by default. In Google Analytics,
check **Admin → Data streams → your web stream** and confirm its measurement ID
matches `NEXT_PUBLIC_GA_MEASUREMENT_ID`. This public environment variable is read
at build time; rebuild and redeploy after changing it.

For a collection check, open the site and look in **Reports → Realtime** after a
few minutes. The Home dashboard's daily active-user total is processed separately;
[standard reports can take 24–48 hours](https://support.google.com/analytics/answer/11198161)
to finish processing. Realtime shows recent activity, not the full day's total.

If Realtime stays empty, check the selected property and active data filters.
In browser developer tools, verify that `googletagmanager.com/gtag/js` loads and
`google-analytics.com/g/collect` receives a successful response. Browser privacy
extensions can block these requests for individual visitors. The app initializes
Analytics once; GA4 enhanced measurement tracks browser-history navigation.

## Postgres + daily cleanup

After the first deploy with `DATABASE_URL` set:

1. Migrations run automatically on the first persist API request (and via `npm run db:migrate` if you have SSH).
2. Add a Hostinger cron (daily) that GETs `https://colorbase.in/api/cron/cleanup` with header `Authorization: Bearer $CRON_SECRET`.
3. Do not store user tables, palettes, or exports as files under `public/` or `/tmp` — they belong in Postgres JSON.
