# Hostinger resource budget (ColorBase)

PostgreSQL does **not** shrink `.next` inode counts. It keeps **user-generated data off the VPS disk** so Hostinger never accumulates `uploads/`, `generated/`, or per-request temp files.

## Architecture (current + target)

| Layer | What lives there |
| --- | --- |
| Hostinger Node | Next.js process, one `.next` tree, `node_modules` |
| Browser | localStorage cache (favorites, tables under cap) |
| Neon / Supabase Postgres | User cookie identity, favorites, palettes, table JSON, rate-limit counters |
| In-repo TypeScript | Color catalogs (not copied into Postgres) |

## Inode vs Postgres

| Risk | Cause | Mitigation |
| --- | --- | --- |
| Thousands of HTML files | `PREBUILD_LIBRARY_PAGES=1` | Leave **unset** on Hostinger |
| Duplicate trees | `output: "standalone"` | Disabled in `next.config.js` |
| Leftover deploys | Old Node apps / ZIP clones | One Git Node app; delete unused folders |
| User files on disk | Saving tables/images locally | Persist JSON in Postgres; exports stay in-browser Blobs |
| Image optimizer cache | `/_next/image` writes under `.next/cache` | `images.unoptimized: true` (no AVIF, no wildcard remotes) |

## Resource budget

| Limit | Value |
| --- | --- |
| DB pool | max **3** connections |
| Idle timeout | 10s |
| Statement timeout | 15s |
| Save API body | **512 KB** |
| Table document | max **400 rows** or **400 KB** JSON |
| Favorites | **200** per user |
| Saved palettes | **50**, max **32** colors |
| Copilot session | **64 KB** |
| Recent colors | **24** |
| Search history TTL | **30 days** |
| Copilot TTL | **7 days** |
| Table unused TTL | **90 days** |
| API usage rows | **7 days** |
| Copilot rate | **10 / minute** |
| Save APIs rate | **30 / minute** |
| Image/PDF | client-only (not stored) |
| App log files | none (stdout) |

## Environment

```
DATABASE_URL=           # Neon or Supabase pooled URL
USER_COOKIE_SECRET=     # HMAC secret for anonymous user cookie
CRON_SECRET=            # Authorization: Bearer for /api/cron/cleanup
NEXT_PUBLIC_SITE_URL=https://colorbase.in
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Without `DATABASE_URL`, the site still works; persistence APIs return 503 and the client keeps localStorage only.

Do not use `fs.writeFile` under `src/` (ESLint blocks `fs` / `node:fs` except read-only SQL in `src/lib/db/migrate.ts`). User tables, palettes, and Copilot blobs belong in Postgres JSON — never `public/uploads` or leftover `/tmp` files.

## Local

```bash
npm install
# set DATABASE_URL in .env.local
npm run db:migrate
npm run dev
```

## Production (Hostinger)

1. Create Neon or Supabase Postgres. Copy the **pooled** connection string.
2. hPanel env: `DATABASE_URL`, `USER_COOKIE_SECRET`, `CRON_SECRET`.
3. Deploy. Schema is applied on the first persist API request (or run `npm run db:migrate` over SSH).
4. Daily cron: `GET https://colorbase.in/api/cron/cleanup` with `Authorization: Bearer $CRON_SECRET`.
