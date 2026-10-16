"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { ChunkLoadRecovery } from "@/components/chunk-load-recovery";
import { SearchCommandProvider } from "@/components/search/search-command";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme={false}
    >
      <ChunkLoadRecovery />
      <NextTopLoader
        color="var(--primary)"
        height={3}
        showSpinner={false}
        crawlSpeed={200}
        speed={200}
        zIndex={9999}
      />
      <SearchCommandProvider>
        {children}
        <Toaster richColors position="bottom-right" closeButton />
      </SearchCommandProvider>
    </NextThemesProvider>
  );
}
