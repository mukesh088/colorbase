"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";

const SearchCommandDialog = dynamic(
  () => import("./search-command-dialog").then((mod) => mod.SearchCommandDialog),
  { ssr: false }
);

type SearchApi = {
  open: () => void;
  setOpen: (open: boolean) => void;
};

const SearchCommandContext = createContext<SearchApi | null>(null);

export function useSearchCommand() {
  return useContext(SearchCommandContext);
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function SearchCommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const api = useMemo<SearchApi>(() => ({ open: () => setOpen(true), setOpen }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SearchCommandContext.Provider value={api}>
      {children}
      {open && <SearchCommandDialog open={open} onOpenChange={setOpen} />}
    </SearchCommandContext.Provider>
  );
}
