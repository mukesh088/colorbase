import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { BreadcrumbItem } from "@/types/tools";
import type { ReactNode } from "react";

export function AdReserve() {
  return <div className="my-10 min-h-4" data-ad-region="content-break" aria-hidden />;
}

export function ColorCodePageShell({
  crumbs,
  eyebrow,
  title,
  description,
  children,
  aside,
}: {
  crumbs: BreadcrumbItem[];
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-8">
        <div>
          <header className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
          </header>
          <div className="mt-8">{children}</div>
        </div>
        {aside ? <aside className="mt-10 hidden lg:block">{aside}</aside> : null}
      </div>
    </div>
  );
}

export function RelatedCodeLinks({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="rounded-2xl border border-border/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Related</p>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
