"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
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
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster richColors position="bottom-right" closeButton />
      </TooltipProvider>
    </NextThemesProvider>
  );
}
