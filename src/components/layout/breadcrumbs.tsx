import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/types/tools";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto">
      <ol className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground sm:text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.href}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {last ? (
                <span
                  aria-current="page"
                  className="truncate font-medium text-foreground"
                  title={item.name}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="shrink-0 hover:text-foreground hover:underline"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
