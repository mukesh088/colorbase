# Hostinger deployment — colorBase (colorbase.in)

## 1. Domain & DNS
- Point `colorbase.in` (and `www`) to your Hostinger hosting.
- Prefer **HTTPS** with Hostinger SSL enabled.

## 2. Environment variables
In Hostinger Node.js / app settings, set:

```
NEXT_PUBLIC_SITE_URL=https://colorbase.in
NODE_ENV=production
```

Optional (if you use analytics elsewhere later):
```
# NEXT_PUBLIC_GA_ID=...
```

## 3. Build & start (Node.js hosting)

This is a **Next.js server app** (SSR + API routes). Do **not** deploy it as a static site and do **not** use `out/` as the output folder.

In hPanel → Node.js / Deploy settings, use:

| Field | Value |
| --- | --- |
| Application type / framework | **Next.js** (`next`) |
| Root directory | `/` (repo root, where `package.json` lives) |
| Node.js version | **20** or **22** |
| Package manager | **npm** |
| Build script | **build** (`npm run build`) |
| Output directory | **`.next`** |
| Entry file | **leave empty** (Hostinger ignores it for Next.js and starts the standalone server) |

`Entry file` and `Output directory` both being `null` is a panel misconfiguration, not a Next.js compile error. If those stay empty, Hostinger cannot find the standalone server after `next build`.

Typical commands Hostinger runs:

```bash
npm install
npm run build
```

- **Application root:** project folder (GitHub repo root)
- **Node version:** 20.x or 22.x LTS recommended

Also set `OPENAI_API_KEY` (and optional `OPENAI_MODEL`) if AI Color Copilot should call OpenAI in production.

### After every deploy (important)
Next.js hashes files under `/_next/static/`. HTML that still points at an old hash will 404 those JS/CSS files (often as `text/plain`), which shows up as `ChunkLoadError` and missing styles — especially after Ctrl+F5 if a CDN kept old HTML.

1. Redeploy / restart the Node app so `npm run build` + `npm start` serve the new `.next` output.
2. In hPanel, **purge CDN / LiteSpeed cache** for `colorbase.in` (and `www`) if enabled.
3. Hard-refresh once (Ctrl+F5) or open a private window.

HTML documents are served with **no-store** caching (`force-dynamic` + middleware) so shared CDNs cannot pin HTML that points at deleted `/_next/static` hashes. Hashed `/_next/static/*` assets stay long-cached and immutable.
## 4. Favicon & brand assets (already in `/public`)
| File | Purpose |
|------|---------|
| `favicon.ico` | Browser tab icon |
| `favicon.svg` | Modern SVG favicon |
| `favicon-16x16.png` / `favicon-32x32.png` | Fallback PNGs |
| `apple-touch-icon.png` | iOS home screen |
| `icon-192.png` / `icon-512.png` | PWA / Android |
| `og-image.png` | Default social share image |
| `manifest.webmanifest` | Installable web app metadata |
| `browserconfig.xml` | Windows tile |

Regenerate icons after logo changes:

```bash
node scripts/generate-favicons.js
```

## 5. After go-live checklist
1. Open https://colorbase.in — confirm favicon in the tab.
2. Test https://colorbase.in/manifest.webmanifest
3. Submit sitemap in Google Search Console: `https://colorbase.in/sitemap.xml`
4. Share a page on WhatsApp/Twitter and confirm OG preview.
5. Update social profile links in `src/lib/site-config.ts` when accounts exist.

## 6. Contact / legal
- Support email configured as `hello@colorbase.in` — create this mailbox in Hostinger Email.
- Privacy / Terms pages are live at `/privacy` and `/terms`.
