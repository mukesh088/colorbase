# Hostinger diagnosis pack (fill-in for null deploy analysis)

Hostinger’s auto-diagnosis returns null when the app never clones/builds.
Use this file with Hostinger support, or when recreating the Node.js app.

## 1) Project structure (GitHub repo root)

Repo: https://github.com/mukesh088/colorbase  
Branch: `main`  
`package.json` URL: https://github.com/mukesh088/colorbase/blob/main/package.json

```text
colorbase/
├── .env.example
├── .gitignore
├── .nvmrc                 # Node 20
├── HOSTINGER.md
├── README.md
├── components.json
├── eslint.config.mjs
├── next-sitemap.config.js
├── next.config.js         ← Next config (NOT .mjs)
├── package-lock.json
├── package.json           ← MUST be at this root
├── postcss.config.mjs
├── prettier.config.js
├── public/                # favicon, icons, og images
├── scripts/
│   └── hostinger-postbuild.js
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── middleware.ts
│   ├── store/
│   ├── types/
│   └── utils/
├── styles/
├── tsconfig.json
└── vercel.json
```

## 2) package.json (scripts Hostinger needs)

```json
{
  "name": "colorbase",
  "private": true,
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start"
  }
}
```

Full file: https://raw.githubusercontent.com/mukesh088/colorbase/main/package.json

## 3) Build logs

If hPanel shows build logs as **null**, the deploy never started a real build.
There is no Next.js compile error to read yet.

Common causes:
1. Root directory is not blank (e.g. `/`, `src`, `colorbase`)
2. Application type is not `next`
3. GitHub App cannot read `mukesh088/colorbase`
4. ZIP upload of the Desktop folder instead of Git import

## Fix in hPanel (do this exactly)

1. Websites → Add Website → **Node.js web app** → **Import Git repository**
2. Connect GitHub → select **mukesh088/colorbase** → branch **main**
3. Set:

| Field | Value |
| --- | --- |
| Application type | `next` |
| Root directory | *(empty)* |
| Node.js | `20` |
| Build script | `build` |
| Output directory | `.next` |
| Entry file | *(empty)* |

4. Env:

```
NEXT_PUBLIC_SITE_URL=https://colorbase.in
NODE_ENV=production
```

Do **not** set `PREBUILD_LIBRARY_PAGES=1` on Hostinger (inode saver).

5. Deploy

Do **not** upload a ZIP from `Desktop/colorbase` (that folder can contain a nested clone and confuses detection).

## After a green build

Restart the Node process, purge CDN / cache, hard-refresh the site.

## Inodes (files & directories limit)

This app previously prebuilt ~7,500 static pages (~50k files under `.next`). That exhausts Hostinger inode quotas.

Current defaults:
- No `output: "standalone"` (avoids duplicating the build tree)
- Large library routes use on-demand generation (sitemap still lists all URLs)

In hPanel: delete unused Node app folders / old `node_modules` / failed deploy dirs, then redeploy once.
