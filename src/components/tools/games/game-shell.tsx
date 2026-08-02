"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GameShell({
  title,
  subtitle,
  badge = "Games",
  accent = "from-orange-500/20 via-amber-500/10 to-rose-500/15",
  stats,
  onNewGame,
  newGameLabel = "New game",
  children,
  footer,
  className,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  accent?: string;
  stats?: ReactNode;
  onNewGame?: () => void;
  newGameLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5", className)}>
      <section
        className={cn(
          "overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br shadow-sm",
          accent
        )}
      >
        <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-300">{badge}</Badge>
              <span className="text-xs text-muted-foreground">Play in your browser</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {stats}
            {onNewGame && (
              <Button type="button" variant="outline" className="rounded-full" onClick={onNewGame}>
                <RotateCcw className="h-3.5 w-3.5" />
                {newGameLabel}
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-3xl border border-border/50 bg-background/70 p-4 shadow-sm sm:p-6">
        {children}
      </div>

      {footer ? (
        <div className="rounded-2xl border border-border/40 bg-muted/15 px-4 py-3 text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function GameStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/80 px-3 py-2 text-center min-w-[4.5rem]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function WinBanner({ title, detail, onAgain }: { title: string; detail?: string; onAgain?: () => void }) {
  return (
    <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center">
      <p className="font-display text-lg font-semibold text-emerald-700 dark:text-emerald-300">{title}</p>
      {detail && <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>}
      {onAgain && (
        <Button type="button" size="sm" className="mt-2 rounded-full" onClick={onAgain}>
          Play again
        </Button>
      )}
    </div>
  );
}

export function LoseBanner({ title, detail, onAgain }: { title: string; detail?: string; onAgain?: () => void }) {
  return (
    <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center">
      <p className="font-display text-lg font-semibold text-rose-700 dark:text-rose-300">{title}</p>
      {detail && <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>}
      {onAgain && (
        <Button type="button" size="sm" className="mt-2 rounded-full" onClick={onAgain}>
          Try again
        </Button>
      )}
    </div>
  );
}
