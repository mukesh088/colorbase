# Hostinger deployment — colorBase (colorbase.in)

GitHub repo root already contains `package.json`, `next.config.ts`, and `src/`.
If hPanel shows **project structure / build logs = null**, the panel root or framework
settings are wrong — not a missing GitHub project.

## Exact hPanel settings (required)

| Field | Value |
| --- | --- |
| Source | GitHub → `mukesh088/colorbase` |
| Branch | `main` |
| Framework / application type | **Next.js** (`next`) |
| Root directory | `/` or **empty** (must be repo root — do **not** use `colorbase/` or any subfolder) |
| Node.js version | **20** (or 22) |
| Package manager | **npm** |
| Install command | `npm ci` (or `npm install`) |
| Build script / command | `build` / `npm run build` |
| Start command | `npm run start` (uses standalone server) |
| Output directory | `.next` |
| Entry file | **leave empty** |

If Root directory, Output directory, or Entry file stay `null`, Hostinger never sees the app.
Set them to the values above, save, then Redeploy.

## Environment variables

```
NEXT_PUBLIC_SITE_URL=https://colorbase.in
NODE_ENV=production
PORT=3000
```

Optional for AI Color Copilot:

```
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

## What the repo does on build

1. `next build` with `output: "standalone"`
2. `postbuild` verifies `.next/standalone/server.js` and copies `public` + `.next/static`
3. `npm start` runs `node .next/standalone/server.js` (respects `PORT`)

## After every deploy

1. Restart the Node app in hPanel
2. Purge CDN / LiteSpeed cache for `colorbase.in` and `www`
3. Hard-refresh once (Ctrl+F5) or use a private window

## Domain & DNS

- Point `colorbase.in` and `www` to Hostinger
- Enable HTTPS / SSL in hPanel

## Favicon & brand assets (`/public`)

| File | Purpose |
|------|---------|
| `favicon.ico` | Browser tab icon |
| `favicon.svg` | Modern SVG favicon |
| `favicon-16x16.png` / `favicon-32x32.png` | Fallback PNGs |
| `apple-touch-icon.png` | iOS home screen |
| `icon-192.png` / `icon-512.png` | PWA / Android |
| `og-image.png` | Default social share image |
| `manifest.webmanifest` | Installable web app metadata |

```bash
node scripts/generate-favicons.js
```

## Go-live checklist

1. https://colorbase.in — site + favicon
2. https://colorbase.in/manifest.webmanifest
3. Submit `https://colorbase.in/sitemap.xml` in Search Console
4. Create mailbox `hello@colorbase.in` if needed
