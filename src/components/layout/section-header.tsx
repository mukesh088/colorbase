import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  kicker,
  title,
  description,
  href,
  actionLabel = "View all",
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        {kicker ? <p className="kicker mb-1.5">{kicker}</p> : null}
        <h2 className="font-display text-xl font-semibold tracking-[-0.035em] sm:text-2xl">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link href={href} className="text-sm font-medium text-primary hover:underline">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-border/50", className)}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">{children}</div>
    </section>
  );
}
