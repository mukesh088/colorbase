import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/types/tools";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";

/** Visible breadcrumb trail. Pass `withJsonLd` when the page does not emit BreadcrumbList itself. */
export function Breadcrumbs({
  items,
  withJsonLd = false,
}: {
  items: BreadcrumbItem[];
  withJsonLd?: boolean;
}) {
  return (
    <>
      {withJsonLd && <JsonLd data={breadcrumbJsonLd(items)} />}
      <nav
        aria-label="Breadcrumb"
        className="-mx-1 mb-4 [scrollbar-width:none] overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden"
      >
        <ol className="text-muted-foreground flex min-w-0 items-center gap-1 text-xs sm:text-sm">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={`${item.href}-${i}`} className="flex min-w-0 items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                {last ? (
                  <span
                    aria-current="page"
                    className="text-foreground truncate font-medium"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-foreground shrink-0 hover:underline">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
