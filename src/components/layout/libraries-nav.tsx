"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { LIBRARY_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LibrariesNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: horizontal library links */}
      <nav aria-label="Libraries" className="hidden items-center gap-0.5 xl:flex">
        {LIBRARY_LINKS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-300",
                active
                  ? "bg-primary/12 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Tablet: dropdown */}
      <div className="hidden md:block xl:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5">
              Libraries
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 rounded-2xl p-2">
            {LIBRARY_LINKS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl",
                      active && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.fullTitle}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
