# colorBase

Modern color tools website for [colorbase.in](https://colorbase.in) — built with Next.js 15, TypeScript, Tailwind CSS v4, and ShadCN UI.

## Features

- 100+ tools (color, CSS, text, developer, image, web, social, utilities)
- Dark / Light / System theme
- SEO: dynamic metadata, Open Graph, Twitter cards, sitemap, robots, JSON-LD
- Accessibility: WCAG contrast tools, keyboard navigation, ARIA labels
- Export palettes to CSS, SCSS, Tailwind, Flutter, Swift, Android, SVG, and more
- Vercel Analytics + Speed Insights

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build + sitemap |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Environment

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://colorbase.in
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

`OPENAI_API_KEY` is server-only (never `NEXT_PUBLIC_`). The AI Color Copilot uses it at `/api/ai/color-copilot`. Without a key, a local intent parser still builds palettes.

## Deploy on Hostinger

See [HOSTINGER.md](./HOSTINGER.md) and [DEPLOY-INFO.md](./DEPLOY-INFO.md).

**Critical:** In hPanel, set Application type to `next`, leave **Root directory empty**, Output directory `.next`, Entry file empty.  
If diagnosis says `package.json` is null, Root directory is wrong — the file is at the GitHub repo root:  
https://github.com/mukesh088/colorbase/blob/main/package.json


## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide Icons
- React Hook Form + Zod
- next-seo / next-sitemap
- Vercel Analytics & Speed Insights
