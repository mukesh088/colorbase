"use client";

import { useEffect, useState, type ComponentType } from "react";
import { ChevronRight, Facebook, Github, Instagram, Share2 } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "colorbase-social-dock-open";

/** Accept Lucide icons and custom SVG components without LucideIcon ref constraints. */
type SocialIcon = ComponentType<{ className?: string }>;

/** X (Twitter) mark — kept as a local SVG for consistent branding. */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.849L1.25 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.017 1.5c-5.79 0-10.5 4.49-10.5 10.03 0 4.25 2.63 7.9 6.38 9.27-.09-.79-.17-2 .04-2.86.18-.78 1.18-5.01 1.18-5.01s-.3-.6-.3-1.49c0-1.4.81-2.44 1.82-2.44.86 0 1.27.64 1.27 1.42 0 .86-.55 2.15-.83 3.35-.24 1 .49 1.82 1.47 1.82 1.76 0 3.12-1.86 3.12-4.54 0-2.38-1.71-4.04-4.15-4.04-2.83 0-4.49 2.12-4.49 4.31 0 .85.33 1.77.74 2.27a.3.3 0 0 1 .07.29c-.08.31-.24.99-.28 1.13-.04.18-.15.22-.34.13-1.27-.59-2.07-2.45-2.07-3.94 0-3.21 2.33-6.16 6.73-6.16 3.53 0 6.28 2.52 6.28 5.88 0 3.51-2.21 6.33-5.28 6.33-1.03 0-2-.54-2.33-1.17l-.63 2.42c-.23.88-.85 1.98-1.27 2.65A10.5 10.5 0 0 0 12.017 22c5.79 0 10.5-4.71 10.5-10.5S17.807 1.5 12.017 1.5z" />
    </svg>
  );
}

function MediumIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M4.07 6.51c.05-.48-.14-.95-.5-1.24L2.05 3.54v-.35h5.99l4.63 10.15L16.74 3.19h5.71v.35l-1.76 1.69c-.15.12-.23.31-.19.5v12.64c-.04.19.04.38.19.5l1.72 1.69v.35h-8.64v-.35l1.78-1.73c.18-.18.18-.23.18-.5V8.35l-4.95 12.56h-.67L4.73 8.35v8.42c-.05.36.07.73.32 1l2.32 2.82v.35H1.55v-.35l2.32-2.82c.25-.27.36-.64.3-1V6.51z" />
    </svg>
  );
}

const ICONS: Record<(typeof SOCIAL_LINKS)[number]["id"], SocialIcon> = {
  x: XIcon,
  facebook: Facebook,
  instagram: Instagram,
  pinterest: PinterestIcon,
  medium: MediumIcon,
  github: Github,
};

export function FloatingSocialDock() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setOpen(saved === "1");
    } catch {
      setOpen(false);
    }
    setReady(true);
  }, []);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (!ready) return null;

  return (
    <div
      className="pointer-events-none fixed right-5 bottom-8 z-40 hidden flex-col items-end gap-2 sm:flex"
      aria-label="Social media"
    >
      {open && (
        <ul
          className="animate-rise pointer-events-auto flex flex-col items-center gap-2"
          id="floating-social-links"
        >
          {SOCIAL_LINKS.map((item) => {
            const Icon = ICONS[item.id];
            return (
              <li key={item.id}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener me"
                  aria-label={item.label}
                  title={item.label}
                  className={cn(
                    "group focus-visible:ring-ring flex h-11 w-11 items-center justify-center rounded-full shadow-lg shadow-black/15 transition hover:scale-110 focus-visible:ring-2 focus-visible:outline-none",
                    item.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="floating-social-links"
        aria-label={open ? "Hide social links" : "Show social links"}
        className={cn(
          "focus-visible:ring-ring pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white shadow-lg shadow-rose-500/30 transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
        )}
      >
        {open ? <ChevronRight className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
        {!open && (
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-200" />
          </span>
        )}
      </button>
    </div>
  );
}
