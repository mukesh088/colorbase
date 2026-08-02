"use client";

import { useEffect } from "react";

const RELOAD_KEY = "cb-chunk-reload";

function shouldReloadForChunkError(message: string) {
  return (
    /ChunkLoadError/i.test(message) ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

function reloadOnce() {
  try {
    if (sessionStorage.getItem(RELOAD_KEY) === "1") return;
    sessionStorage.setItem(RELOAD_KEY, "1");
  } catch {
    if (window.location.search.includes("cb_reload=1")) return;
    const url = new URL(window.location.href);
    url.searchParams.set("cb_reload", "1");
    window.location.replace(url.toString());
    return;
  }
  window.location.reload();
}

/** Recover from stale HTML/CDN pointing at deleted Next.js chunks after a deploy. */
export function ChunkLoadRecovery() {
  useEffect(() => {
    // Clear the guard only after the page has stayed healthy for a bit
    // (avoids an infinite reload loop if assets are still missing).
    const clearGuard = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* ignore */
      }
    }, 12_000);

    const onError = (event: ErrorEvent) => {
      const message = event.message || String(event.error || "");
      if (shouldReloadForChunkError(message)) reloadOnce();
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason instanceof Error
            ? reason.message
            : String(reason ?? "");
      if (shouldReloadForChunkError(message)) reloadOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.clearTimeout(clearGuard);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
