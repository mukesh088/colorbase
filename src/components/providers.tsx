"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme={false}
    >
      <NextTopLoader
        color="var(--primary)"
        height={3}
        showSpinner={false}
        crawlSpeed={200}
        speed={200}
        zIndex={9999}
      />
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster richColors position="bottom-right" closeButton />
      </TooltipProvider>
    </NextThemesProvider>
  );
}
