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
```

## Deploy on Hostinger

See [HOSTINGER.md](./HOSTINGER.md) for Node.js build/start commands, SSL, DNS, and go-live checklist.

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
