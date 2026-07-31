"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutGrid, Menu, Palette, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { LibrariesNav } from "@/components/layout/libraries-nav";
import { LIBRARY_LINKS } from "@/lib/nav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/site-config";

const ToolsPanel = dynamic(
  () => import("@/components/layout/tools-panel").then((m) => m.ToolsPanel),
  { ssr: false }
);

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsMounted, setToolsMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const openTools = () => {
    setToolsMounted(true);
    setToolsOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-1.5 px-3 sm:h-16 sm:gap-2 sm:px-4 lg:px-6">
          <Link
            href="/"
            className="group flex min-w-0 shrink-0 items-center gap-2"
            aria-label={`${SITE_NAME} home`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-md shadow-rose-500/25 transition-transform duration-300 group-hover:scale-105 sm:h-9 sm:w-9">
              <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate font-display text-sm font-semibold leading-none tracking-tight">
                {SITE_NAME}
              </p>
              <p className="mt-0.5 hidden text-[10px] text-muted-foreground lg:block">
                Color tools & libraries
              </p>
            </div>
          </Link>

          <div className="mx-0.5 hidden h-6 w-px bg-border/70 lg:block" />

          <LibrariesNav />

          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "hidden rounded-full font-semibold md:inline-flex",
              pathname === "/tools" || pathname.startsWith("/tools")
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link href="/tools">Our Tools</Link>
          </Button>

          {/* Mobile: single nav drawer */}
          {mounted ? (
            <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="fixed inset-y-0 left-0 top-0 h-dvh max-h-none w-[min(100vw,20rem)] max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-r border-border/60 p-0 pt-[env(safe-area-inset-top)] sm:rounded-none">
                <DialogHeader className="border-b border-border/50 px-4 py-4 text-left">
                  <DialogTitle className="font-display text-lg">Menu</DialogTitle>
                </DialogHeader>
                <div className="space-y-5 p-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  <nav aria-label="Primary" className="space-y-1">
                    <Link
                      href="/tools"
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors",
                        pathname.startsWith("/tools")
                          ? "bg-primary/12 font-medium text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
                        <LayoutGrid className="h-4 w-4" />
                      </span>
                      Our Tools
                    </Link>
                  </nav>
                  <div>
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Libraries
                    </p>
                    <nav aria-label="Libraries" className="space-y-1">
                      {LIBRARY_LINKS.map((item) => {
                        const Icon = item.icon;
                        const active =
                          pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileNavOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-colors",
                              active
                                ? "bg-primary/12 font-medium text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
                              <Icon className="h-4 w-4" />
                            </span>
                            {item.fullTitle}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                  <Button
                    type="button"
                    className="w-full rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white"
                    onClick={() => {
                      setMobileNavOpen(false);
                      openTools();
                    }}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Open quick tools menu
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full md:hidden"
              disabled
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          <form
            className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/search?q=${encodeURIComponent(query)}`);
            }}
            role="search"
          >
            <div className="relative hidden w-full max-w-[14rem] md:max-w-xs lg:max-w-md sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-9 rounded-full border-border/60 bg-background/70 pl-9 sm:h-10"
                aria-label="Search tools"
              />
            </div>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full sm:hidden"
              aria-label="Search"
            >
              <Link href="/search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>
          </form>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <ThemeSwitcher />
            <Button
              type="button"
              size="icon"
              onClick={openTools}
              className="h-9 w-9 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-md shadow-rose-500/25 hover:opacity-90 sm:h-10 sm:w-auto sm:px-4"
              aria-expanded={toolsOpen}
              aria-controls="tools-panel"
              aria-label="Open quick tools menu"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">Quick menu</span>
            </Button>
          </div>
        </div>
      </header>

      {toolsMounted && <ToolsPanel open={toolsOpen} onOpenChange={setToolsOpen} />}
    </>
  );
}
