"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Palette, Pipette, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/lib/nav";
import { useSearchCommand } from "@/components/search/search-command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SITE_NAME, SITE_NAME_DISPLAY } from "@/lib/site-config";

function navActive(pathname: string, href: string) {
  if (href === "/colors") {
    return (
      pathname === "/colors" || pathname.startsWith("/colors/") || pathname.startsWith("/color/")
    );
  }
  if (href === "/colors/tailwind") {
    return (
      pathname.startsWith("/colors/tailwind") ||
      pathname.startsWith("/colors/material") ||
      pathname.startsWith("/colors/bootstrap") ||
      pathname.startsWith("/colors/css") ||
      pathname.startsWith("/colors/radix") ||
      pathname.startsWith("/colors/web-safe") ||
      pathname.startsWith("/colors/flat-ui") ||
      pathname.startsWith("/colors/kits/")
    );
  }
  if (href === "/color-codes") {
    return (
      pathname.startsWith("/color-codes") ||
      pathname === "/color-atlas" ||
      pathname.startsWith("/explore-colors")
    );
  }
  if (href === "/tools") return pathname === "/tools" || pathname.startsWith("/tools/");
  if (href === "/learning")
    return pathname.startsWith("/learning") || pathname.startsWith("/learn/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const search = useSearchCommand();

  useEffect(() => setMounted(true), []);

  return (
    <header className="border-border/70 bg-background/88 supports-[backdrop-filter]:bg-background/78 sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-1.5 px-3 sm:h-16 sm:gap-3 sm:px-5 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-2"
          aria-label={`${SITE_NAME} home`}
        >
          <span className="bg-gradient-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-white shadow-[var(--shadow-primary)] sm:h-9 sm:w-9">
            <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[15px] leading-none font-semibold tracking-[-0.04em] sm:text-base">
              {SITE_NAME_DISPLAY}
            </p>
            <p className="text-muted-foreground mt-0.5 hidden text-[10px] font-medium tracking-[0.04em] lg:block">
              Color intelligence
            </p>
          </div>
        </Link>

        <nav aria-label="Primary" className="ml-2 hidden items-center gap-0.5 xl:flex">
          {PRIMARY_NAV.map((item) => {
            const active = navActive(pathname, item.href);
            const children = "children" in item ? item.children : undefined;
            if (children) {
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-200 ease-out",
                      active
                        ? "text-foreground bg-[var(--primary-soft)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-[var(--primary-soft)]"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.title}
                    <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
                  </Link>
                  <ul className="border-border/70 bg-popover invisible absolute top-[calc(100%-2px)] left-0 z-50 min-w-[12rem] rounded-xl border p-1.5 opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-lg px-3 py-1.5 text-[13px]"
                        >
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-200 ease-out",
                  active
                    ? "text-foreground bg-[var(--primary-soft)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-[var(--primary-soft)]"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        {mounted ? (
          <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-lg sm:h-10 sm:w-10 xl:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border/60 fixed inset-y-0 top-0 left-0 h-dvh max-h-none w-[min(100vw,22rem)] max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-r p-0 pt-[env(safe-area-inset-top)] sm:rounded-none">
              <DialogHeader className="border-border/50 border-b px-4 py-4 text-left">
                <DialogTitle className="font-display text-lg tracking-[-0.03em]">
                  {SITE_NAME_DISPLAY}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 p-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <nav aria-label="Primary" className="space-y-1">
                  {PRIMARY_NAV.map((item) => {
                    const active = navActive(pathname, item.href);
                    const children = "children" in item ? item.children : undefined;
                    return (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={cn(
                            "flex items-center rounded-lg px-3 py-3 text-sm transition-colors",
                            active
                              ? "text-foreground bg-[var(--primary-soft)] font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-[var(--primary-soft)]"
                          )}
                        >
                          {item.title}
                        </Link>
                        {children ? (
                          <ul className="border-border/60 mb-2 ml-3 border-l pl-2">
                            {children.slice(1).map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={() => setMobileNavOpen(false)}
                                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center rounded-lg px-3 py-2 text-[13px]"
                                >
                                  {child.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })}
                </nav>
                <div>
                  <p className="text-muted-foreground mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] uppercase">
                    More
                  </p>
                  <nav aria-label="Secondary" className="space-y-1">
                    {SECONDARY_NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center rounded-lg px-3 py-3 text-sm"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-lg sm:h-10 sm:w-10 xl:hidden"
            disabled
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => search?.open()}
            className="border-border/70 bg-muted/40 text-muted-foreground hidden h-10 w-full max-w-[18rem] justify-between rounded-[var(--radius-md)] px-3 xl:inline-flex xl:max-w-[12rem] 2xl:max-w-xs"
            aria-label="Open search"
          >
            <span className="inline-flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="text-sm">Search colors</span>
            </span>
            <kbd className="border-border/70 bg-background text-muted-foreground hidden rounded border px-1.5 py-0.5 font-mono text-[10px] 2xl:inline">
              ⌘K
            </kbd>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-lg xl:hidden"
            aria-label="Search"
            onClick={() => search?.open()}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            asChild
            size="sm"
            className={cn(
              "hidden h-8 rounded-[var(--radius-md)] px-3 text-[13px] font-medium 2xl:inline-flex",
              pathname === "/color-picker" && "opacity-90"
            )}
          >
            <Link href="/color-picker">
              <Pipette className="h-3.5 w-3.5" />
              Color Picker
            </Link>
          </Button>
          <Button
            asChild
            size="icon"
            className="h-11 w-11 rounded-[var(--radius-md)] sm:h-10 sm:w-10 xl:hidden"
          >
            <Link href="/color-picker" aria-label="Color Picker">
              <Pipette className="h-4 w-4" />
            </Link>
          </Button>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
