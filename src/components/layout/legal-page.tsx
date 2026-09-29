import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export function LegalPage({
  title,
  path,
  updated,
  children,
}: {
  title: string;
  path: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: title, href: path },
        ]}
      />
      <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary">
        {children}
      </div>
    </div>
  );
}
