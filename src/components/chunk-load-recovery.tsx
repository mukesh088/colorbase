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

function isNextStaticAsset(url: string) {
  return /\/_next\/static\/(?:chunks|css)\//.test(url);
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
  // Bust bfcache / intermediary caches when recovering from a bad deploy pair
  const url = new URL(window.location.href);
  url.searchParams.set("_cb", String(Date.now()));
  window.location.replace(url.toString());
}

/** Recover from stale HTML/CDN pointing at deleted Next.js chunks after a deploy. */
export function ChunkLoadRecovery() {
  useEffect(() => {
    const clearGuard = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* ignore */
      }
      // Drop one-time bust param after a healthy load
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has("_cb") || url.searchParams.has("cb_reload")) {
          url.searchParams.delete("_cb");
          url.searchParams.delete("cb_reload");
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        }
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

    // Resource errors (script/link 404) do not bubble — must use capture
    const onResourceError = (event: Event) => {
      const el = event.target;
      if (!(el instanceof HTMLElement)) return;
      if (el instanceof HTMLScriptElement && el.src && isNextStaticAsset(el.src)) {
        reloadOnce();
        return;
      }
      if (el instanceof HTMLLinkElement && el.href && isNextStaticAsset(el.href)) {
        reloadOnce();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("error", onResourceError, true);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.clearTimeout(clearGuard);
      window.removeEventListener("error", onError);
      window.removeEventListener("error", onResourceError, true);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
