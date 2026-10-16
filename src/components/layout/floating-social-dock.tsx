"use client";

import { useEffect, useState, type ComponentType } from "react";
import { ChevronRight, Facebook, Github, Instagram, Linkedin, Share2, Youtube } from "lucide-react";
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

const ICONS: Record<(typeof SOCIAL_LINKS)[number]["id"], SocialIcon> = {
  x: XIcon,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
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
                  rel="noopener noreferrer"
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
