import type { Metadata } from "next";
import Link from "next/link";
import {
  Braces,
  Code2,
  FileCode2,
  FileJson,
  FileType,
  LayoutTemplate,
  Smartphone,
  Sparkles,
  TabletSmartphone,
  Wind,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { createPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { CODE_FORMATS, type CodeFormat } from "@/lib/codegen";
import { DeveloperPlayground } from "@/components/library/developer-playground";

export const metadata: Metadata = createPageMetadata({
  title: "Developer Resources",
  description:
    "Generate color tokens for CSS, SCSS, LESS, Stylus, Tailwind, Bootstrap, MUI, Chakra, React, React Native, Flutter, SwiftUI, Android, JSON, and YAML.",
  path: "/developers",
  keywords: ["design tokens", "css variables", "tailwind colors export"],
});

const FORMAT_META: Record<
  CodeFormat,
  { icon: LucideIcon; strip: string; glow: string }
> = {
  css: { icon: FileCode2, strip: "from-rose-500 via-pink-400 to-fuchsia-300", glow: "bg-rose-500/35" },
  scss: { icon: FileCode2, strip: "from-pink-600 via-rose-400 to-orange-300", glow: "bg-pink-500/35" },
  less: { icon: FileCode2, strip: "from-indigo-500 via-blue-400 to-sky-300", glow: "bg-indigo-500/35" },
  stylus: { icon: FileType, strip: "from-emerald-600 via-teal-400 to-cyan-300", glow: "bg-teal-500/35" },
  tailwind: { icon: Wind, strip: "from-cyan-500 via-sky-400 to-blue-400", glow: "bg-sky-500/35" },
  bootstrap: { icon: LayoutTemplate, strip: "from-violet-600 via-purple-400 to-fuchsia-300", glow: "bg-violet-500/35" },
  mui: { icon: Sparkles, strip: "from-blue-600 via-indigo-400 to-blue-200", glow: "bg-blue-500/35" },
  chakra: { icon: Sparkles, strip: "from-teal-600 via-emerald-400 to-lime-300", glow: "bg-emerald-500/35" },
  react: { icon: Code2, strip: "from-sky-500 via-cyan-400 to-teal-300", glow: "bg-cyan-500/35" },
  "react-native": {
    icon: TabletSmartphone,
    strip: "from-fuchsia-600 via-pink-400 to-rose-300",
    glow: "bg-fuchsia-500/35",
  },
  flutter: { icon: Smartphone, strip: "from-blue-500 via-cyan-400 to-sky-200", glow: "bg-blue-400/35" },
  swiftui: { icon: Smartphone, strip: "from-orange-500 via-rose-400 to-pink-300", glow: "bg-orange-500/35" },
  android: { icon: Smartphone, strip: "from-green-600 via-lime-400 to-emerald-200", glow: "bg-green-500/35" },
  json: { icon: FileJson, strip: "from-amber-500 via-yellow-400 to-orange-200", glow: "bg-amber-500/35" },
  yaml: { icon: Braces, strip: "from-rose-700 via-rose-400 to-pink-200", glow: "bg-rose-600/35" },
};

export default function DevelopersPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Developers", href: "/developers" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
          Code & tokens
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Developer Resources
        </h1>
        <p className="mt-3 text-muted-foreground">
          Export any palette into production-ready code for web, mobile, and design systems. Pick
          colors by hand or generate a random harmony, then copy tokens instantly.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="formats-heading">
        <h2 id="formats-heading" className="font-display text-2xl font-semibold">
          Export formats
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a target and open a dedicated generator with the palette builder.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CODE_FORMATS.map((f) => {
            const meta = FORMAT_META[f.slug];
            const Icon = meta.icon;
            return (
              <Link
                key={f.slug}
                href={`/developers/${f.slug}`}
                className="card-lift group relative block overflow-hidden rounded-3xl border border-border/50 bg-background/70 shadow-sm backdrop-blur-sm"
              >
                <div
                  className={`h-14 bg-gradient-to-r ${meta.strip} transition-transform duration-500 group-hover:scale-105`}
                  aria-hidden
                />
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-24 opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70 ${meta.glow}`}
                  aria-hidden
                />
                <div className="relative p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white shadow-lg shadow-rose-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-700 dark:text-rose-300">
                      {f.slug}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-rose-700 dark:group-hover:text-rose-300">
                    {f.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 transition-all duration-300 group-hover:gap-2.5 dark:text-rose-300">
                    Open generator
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="playground-heading">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-rose-400">
            Live playground
          </p>
          <h2 id="playground-heading" className="mt-1 font-display text-2xl font-semibold">
            Build a palette, export everywhere
          </h2>
        </div>
        <DeveloperPlayground />
      </section>
    </div>
  );
}
