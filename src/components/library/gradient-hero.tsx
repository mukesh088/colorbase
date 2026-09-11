"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Download, Info, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { downloadGradientJpg } from "@/lib/gradients/download-jpg";
import type { LibraryGradient } from "@/lib/data/gradient-library";

const HERO_HEIGHT = "h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4.05rem)]";

export function liveGradientCss(
  colors: string[],
  angle: number,
  x = 0.5,
  y = 0.5
) {
  const n = Math.max(colors.length, 1);
  const slide = (x - 0.5) * 70;
  const spread = 1 + (0.5 - y) * 0.85;
  const stops = colors.map((color, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const p = 50 + slide + (t - 0.5) * 100 * spread;
    return `${color} ${Math.max(-25, Math.min(125, p)).toFixed(1)}%`;
  });
  return `linear-gradient(${angle.toFixed(1)}deg, ${stops.join(", ")})`;
}

export function GradientHero({
  gradients,
  index,
  onIndexChange,
  onDetails,
  paused = false,
}: {
  gradients: LibraryGradient[];
  index: number;
  onIndexChange: (index: number) => void;
  onDetails: (gradient: LibraryGradient) => void;
  paused?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const gradient = gradients[index] ?? gradients[0];
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [angle, setAngle] = useState(gradient?.angle ?? 135);

  useEffect(() => {
    setAngle(gradient?.angle ?? 135);
    setPos({ x: 0.5, y: 0.5 });
  }, [gradient?.slug, gradient?.angle]);

  useEffect(() => {
    console.log(`[gradient-library] ${gradients.length} gradients loaded`);
  }, [gradients.length]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!gradients.length) return;
      onIndexChange((index + dir + gradients.length) % gradients.length);
    },
    [gradients.length, index, onIndexChange]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (paused) return;
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, paused]);

  const applyPointer = (clientX: number, clientY: number) => {
    const el = hostRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    setPos({ x, y });
    const base = gradient?.angle ?? 135;
    setAngle((base + (x - 0.5) * 32 + (y - 0.5) * 24 + 360) % 360);
  };

  const shareGradient = async () => {
    if (!gradient) return;
    const url = `${window.location.origin}/gradient-library/${gradient.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${gradient.name} gradient`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  if (!gradient) return null;

  const css = liveGradientCss(gradient.colors, angle, pos.x, pos.y);

  return (
    <section
      ref={hostRef}
      onPointerMove={(e) => {
        if (e.pointerType === "touch" && !swipeRef.current) return;
        applyPointer(e.clientX, e.clientY);
      }}
      onPointerDown={(e) => {
        swipeRef.current = { x: e.clientX, y: e.clientY };
        if (e.pointerType !== "mouse") applyPointer(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        const start = swipeRef.current;
        swipeRef.current = null;
        if (!start || paused) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
        go(dx < 0 ? 1 : -1);
      }}
      onPointerCancel={() => {
        swipeRef.current = null;
      }}
      className={`relative left-1/2 w-screen -translate-x-1/2 touch-manipulation overflow-hidden select-none ${HERO_HEIGHT}`}
      style={{
        backgroundImage: css,
        backgroundSize: "180% 180%",
        backgroundPosition: `${pos.x * 100}% ${pos.y * 100}%`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

      <button
        type="button"
        aria-label="Previous gradient"
        onClick={() => go(-1)}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40 sm:left-6 sm:h-14 sm:w-14"
      >
        <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
      <button
        type="button"
        aria-label="Next gradient"
        onClick={() => go(1)}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40 sm:right-6 sm:h-14 sm:w-14"
      >
        <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>

      <div className={`relative z-[1] flex ${HERO_HEIGHT} flex-col items-center justify-center px-14 pb-24 pt-[max(3.5rem,env(safe-area-inset-top))] text-center text-white sm:px-20`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 sm:text-xs">
          {gradient.category}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)] sm:mt-3 sm:text-6xl">
          {gradient.name}
        </h2>
      </div>

      <div className="pointer-events-auto absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-8 sm:gap-3">
        <IconAction label="Details & code" onClick={() => onDetails(gradient)}>
          <Info className="h-5 w-5" />
        </IconAction>
        <IconAction
          label="Download JPG"
          onClick={() => {
            downloadGradientJpg({
              ...gradient,
              angle: Math.round(angle),
            });
            toast.success("JPG downloaded");
          }}
        >
          <Download className="h-5 w-5" />
        </IconAction>
        <IconAction label="Share" onClick={shareGradient}>
          <Share2 className="h-5 w-5" />
        </IconAction>
      </div>
    </section>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)] transition hover:bg-white/10 sm:h-12 sm:w-12"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
