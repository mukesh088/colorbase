"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [timeout]
  );

  return { copied, copy };
}

export function useHistoryState<T>(initial: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState(initial);
  const [future, setFuture] = useState<T[]>([]);

  const set = useCallback(
    (value: T | ((prev: T) => T)) => {
      setPresent((prev) => {
        const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        setPast((p) => [...p, prev]);
        setFuture([]);
        return next;
      });
    },
    []
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      setFuture((f) => [present, ...f]);
      setPresent(previous);
      return p.slice(0, -1);
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setPast((p) => [...p, present]);
      setPresent(next);
      return f.slice(1);
    });
  }, [present]);

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: { ctrl?: boolean; meta?: boolean; shift?: boolean }
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = options?.ctrl ?? false;
      const meta = options?.meta ?? false;
      const shift = options?.shift ?? false;
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        e.ctrlKey === ctrl &&
        e.metaKey === meta &&
        e.shiftKey === shift
      ) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options?.ctrl, options?.meta, options?.shift]);
}

export function useRecentColors(limit = 24) {
  const [colors, setColors, hydrated] = useLocalStorage<string[]>("recent-colors", []);

  const add = useCallback(
    (hex: string) => {
      setColors((prev) => {
        const next = [hex, ...prev.filter((c) => c.toLowerCase() !== hex.toLowerCase())];
        return next.slice(0, limit);
      });
    },
    [limit, setColors]
  );

  return { colors, add, hydrated };
}

export function useFavoriteColors() {
  const [colors, setColors, hydrated] = useLocalStorage<string[]>("favorite-colors", []);

  const toggle = useCallback(
    (hex: string) => {
      setColors((prev) => {
        const exists = prev.some((c) => c.toLowerCase() === hex.toLowerCase());
        if (exists) return prev.filter((c) => c.toLowerCase() !== hex.toLowerCase());
        return [hex, ...prev];
      });
    },
    [setColors]
  );

  const has = useCallback(
    (hex: string) => colors.some((c) => c.toLowerCase() === hex.toLowerCase()),
    [colors]
  );

  return { colors, toggle, has, hydrated };
}

export function useRecentlyViewed(limit = 8) {
  const [items, setItems] = useLocalStorage<string[]>("recently-viewed-tools", []);

  const add = useCallback(
    (slug: string) => {
      setItems((prev) => {
        const next = [slug, ...prev.filter((s) => s !== slug)];
        return next.slice(0, limit);
      });
    },
    [limit, setItems]
  );

  return { items, add };
}
