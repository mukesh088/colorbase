"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/lib/nav";
import { SITE_NAME_DISPLAY } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function MobileNavigation({
  open,
  onOpenChange,
  isActive,
  restoreFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isActive: (href: string) => boolean;
  restoreFocus: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="mobile-navigation"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          restoreFocus();
        }}
        className="border-border/60 fixed inset-y-0 top-0 left-0 h-dvh max-h-none w-[min(100vw,22rem)] max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-r p-0 pt-[env(safe-area-inset-top)] sm:rounded-none"
      >
        <DialogHeader className="border-border/50 border-b px-4 py-4 text-left">
          <DialogTitle className="font-display text-lg tracking-[-0.03em]">
            {SITE_NAME_DISPLAY}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 p-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <nav aria-label="Primary" className="space-y-1">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(item.href);
              const children = "children" in item ? item.children : undefined;
              return (
                <div key={item.href}>
                  <Link
                    prefetch={false}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
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
                            prefetch={false}
                            href={child.href}
                            onClick={() => onOpenChange(false)}
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
                  prefetch={false}
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
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
  );
}
