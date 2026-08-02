"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Share2,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "colorbase-social-dock-open";

const ICONS: Record<(typeof SOCIAL_LINKS)[number]["id"], LucideIcon> = {
  x: XIcon,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
};

/** Simple X logo (Lucide no longer ships a dedicated Twitter glyph in all versions). */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.849L1.25 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

export function FloatingSocialDock() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "1") setOpen(true);
      else if (saved === null) setOpen(true); // default expanded on first visit
    } catch {
      setOpen(true);
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
      className="pointer-events-none fixed bottom-[max(5.5rem,env(safe-area-inset-bottom))] right-3 z-40 flex flex-col items-end gap-2 sm:bottom-8 sm:right-5"
      aria-label="Social media"
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            key="social-list"
            initial={{ opacity: 0, x: 24, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="pointer-events-auto flex flex-col items-center gap-2"
            id="floating-social-links"
          >
            {SOCIAL_LINKS.map((item, i) => {
              const Icon = ICONS[item.id];
              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    className={cn(
                      "group flex h-11 w-11 items-center justify-center rounded-full shadow-lg shadow-black/15 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      item.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="floating-social-links"
        aria-label={open ? "Hide social links" : "Show social links"}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white shadow-lg shadow-rose-500/30 transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Share2 className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -left-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-300 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-200" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
